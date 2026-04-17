/*
  Backfill missing organizationId on legacy tasks using Firebase Admin SDK.

  Required auth (one of):
  - GOOGLE_APPLICATION_CREDENTIALS=/abs/path/to/service-account.json
  - FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'

  Usage:
    node scripts/backfill-task-organization.js --dry-run
    node scripts/backfill-task-organization.js --apply
    node scripts/backfill-task-organization.js --apply --fallback-org=<ORG_ID>

  Notes:
  - By default it runs as dry-run.
  - For tasks assigned to a specific user, org is inferred from that user.organizationId.
  - For tasks assigned to "all", pass --fallback-org to backfill safely.
*/

const fs = require("fs")
const path = require("path")
const admin = require("firebase-admin")

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName)
  if (!fs.existsSync(filePath)) return

  const content = fs.readFileSync(filePath, "utf8")
  const lines = content.split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue

    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2)
  const hasApply = args.includes("--apply")
  const hasDryRun = args.includes("--dry-run")

  const fallbackArg = args.find((a) => a.startsWith("--fallback-org="))
  const fallbackOrgId = fallbackArg ? fallbackArg.split("=")[1] : undefined

  return {
    dryRun: hasDryRun || !hasApply,
    fallbackOrgId,
  }
}

function initAdmin() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

  if (admin.apps.length > 0) {
    return admin.app()
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || projectId,
    })
  }

  return admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  })
}

async function main() {
  loadEnvFile(".env.local")
  loadEnvFile(".env")

  const { dryRun, fallbackOrgId } = parseArgs()

  initAdmin()
  const db = admin.firestore()

  console.log(`Mode: ${dryRun ? "DRY RUN" : "APPLY"}`)
  if (fallbackOrgId) {
    console.log(`Fallback org for unassigned tasks: ${fallbackOrgId}`)
  }

  const tasksSnap = await db.collection("tasks").get()
  const tasks = tasksSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
  const candidates = tasks.filter((t) => !t.organizationId)

  console.log(`Total tasks: ${tasks.length}`)
  console.log(`Tasks missing organizationId: ${candidates.length}`)

  const userOrgCache = new Map()
  let inferredCount = 0
  let fallbackCount = 0
  let skippedCount = 0
  const updates = []

  for (const task of candidates) {
    let orgId = null

    if (task.assignedTo && task.assignedTo !== "all") {
      if (!userOrgCache.has(task.assignedTo)) {
        const userSnap = await db.collection("users").doc(task.assignedTo).get()
        const userOrgId = userSnap.exists ? userSnap.data().organizationId || null : null
        userOrgCache.set(task.assignedTo, userOrgId)
      }

      orgId = userOrgCache.get(task.assignedTo)
      if (orgId) inferredCount += 1
    }

    if (!orgId && task.assignedTo === "all" && fallbackOrgId) {
      orgId = fallbackOrgId
      fallbackCount += 1
    }

    if (!orgId) {
      skippedCount += 1
      console.log(
        `[SKIP] task=${task.id} title=${task.title || "(untitled)"} assignedTo=${task.assignedTo || "(none)"}`
      )
      continue
    }

    updates.push({ taskId: task.id, orgId, title: task.title || "(untitled)" })
  }

  console.log(`Planned updates: ${updates.length}`)
  console.log(`- inferred from assigned user: ${inferredCount}`)
  console.log(`- fallback org assignments: ${fallbackCount}`)
  console.log(`Skipped (unresolved): ${skippedCount}`)

  if (dryRun) {
    console.log("Dry-run complete. No writes performed.")
    return
  }

  for (const update of updates) {
    await db.collection("tasks").doc(update.taskId).update({
      organizationId: update.orgId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })

    console.log(`[UPDATED] task=${update.taskId} org=${update.orgId} title=${update.title}`)
  }

  console.log("Backfill complete.")
}

main().catch((err) => {
  console.error("Backfill failed:", err)
  process.exit(1)
})
