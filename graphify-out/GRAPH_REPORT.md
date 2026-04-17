# Graph Report - app  (2026-04-18)

## Corpus Check
- Corpus is ~29,026 words - fits in a single context window. You may not need a graph.

## Summary
- 134 nodes · 125 edges · 32 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 13 edges
2. `handleSubmit()` - 7 edges
3. `connectToDatabase()` - 7 edges
4. `loadData()` - 6 edges
5. `GET()` - 5 edges
6. `getFirebaseApp()` - 3 edges
7. `getDb()` - 3 edges
8. `extractTextFromPDF()` - 3 edges
9. `loadMembers()` - 3 edges
10. `getTypeColor()` - 2 edges

## Surprising Connections (you probably didn't know these)
- `POST()` --calls--> `extractTextFromPDF()`  [INFERRED]
  app\api\webhooks\dodopayments\route.ts → app\notes\page.tsx
- `handleRefresh()` --calls--> `loadData()`  [EXTRACTED]
  app\admin\attendance\page.tsx → app\profile\page.tsx
- `handleSubmit()` --calls--> `loadData()`  [EXTRACTED]
  app\notes\page.tsx → app\profile\page.tsx
- `POST()` --calls--> `getFirebaseApp()`  [INFERRED]
  app\api\webhooks\dodopayments\route.ts → app\api\attendance\mark\route.ts
- `POST()` --calls--> `logActivity()`  [EXTRACTED]
  app\api\webhooks\dodopayments\route.ts → app\api\attendance\mark\route.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (8): connectToDatabase(), DELETE(), GET(), getDb(), getFirebaseApp(), localSummarize(), logActivity(), POST()

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (4): extractTextFromPDF(), generateWithGemini(), handleSubmit(), parseGeminiResponse()

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (2): handleRefresh(), loadData()

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (1): getBadgeColor()

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (1): getTypeColor()

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (4): handleCopyInviteCode(), handleDemoteMember(), handleRemoveMember(), loadMembers()

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (0): 

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.0
Nodes (2): getStatusBadge(), loadLeaves()

### Community 9 - "Community 9"
Cohesion: 0.0
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 0.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 0.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 0.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 0.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 0.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 0.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 0.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 0.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 0.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 0.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 0.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 0.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 0.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 0.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 0.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 14`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `loading.tsx`, `Loading()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `not-found.tsx`, `NotFound()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `layout.tsx`, `AdminLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `page.tsx`, `BillingPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `page.tsx`, `loadUsers()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `page.tsx`, `ScheduleEditor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `page.tsx`, `ManageUsersPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `layout.tsx`, `DashboardLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `layout.tsx`, `ImportantDatesLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `layout.tsx`, `NotesLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `layout.tsx`, `ScheduleLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `page.tsx`, `fetchSchedule()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `layout.tsx`, `StatisticsLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `dialog.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `label.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `tabs.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `textarea.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.