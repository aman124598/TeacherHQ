import { NextResponse } from 'next/server';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase/config';

// Product IDs mapped to plans
const PLAN_MAP: Record<string, string> = {
  'pdt_0Nbssx6RBsjWdjN6pCt20': 'starter',
  'pdt_0Nbst8gsTLhHEJS9Q4LiT': 'growth',
  // You can add enterprise or custom product IDs here
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    console.log('Received DodoPayments webhook:', payload.type);

    // DodoPayments uses event 'payment.succeeded' or 'subscription.active'
    const type = payload.type || '';
    if (!type.includes('payment') && !type.includes('subscription')) {
      return NextResponse.json({ received: true });
    }

    // Extract email and product ID from DodoPayments webhook payload
    const data = payload.data || {};
    
    // DodoPayments typically stores email in customer object or directly on the payload
    const email = data.customer?.email || data.customer_email || data.email;
    
    // Attempt to extract the Product ID
    const productId = data.product_id || (data.line_items && data.line_items[0]?.product_id);

    if (!email) {
      console.warn('Webhook received but no customer email found in payload.');
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 });
    }

    // Map Product ID to Plan Tier (Fallback to starter if it's an unrecognized product)
    const plan = productId ? (PLAN_MAP[productId] || 'starter') : 'starter';

    const db = getFirestore(getFirebaseApp());

    // 1. Try to find an Organization where adminEmail is the buyer
    const orgQuery = query(collection(db, 'organizations'), where('adminEmail', '==', email));
    const orgSnapshot = await getDocs(orgQuery);

    if (!orgSnapshot.empty) {
      // Org found, update the plan
      const orgDoc = orgSnapshot.docs[0];
      await updateDoc(doc(db, 'organizations', orgDoc.id), {
        plan: plan,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Updated organization ${orgDoc.id} to plan: ${plan}`);
    }

    // 2. Also try to find the User and update them
    // This is useful if they haven't created an organization yet (pre-purchase)
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);

    if (!userSnapshot.empty) {
      for (const userDoc of userSnapshot.docs) {
        await updateDoc(doc(db, 'users', userDoc.id), {
          plan: plan,
          updatedAt: serverTimestamp()
        });
      }
      console.log(`✅ Updated user(s) with email ${email} to plan: ${plan}`);
    }

    if (orgSnapshot.empty && userSnapshot.empty) {
      console.log(`⚠️ Webhook received for ${email}, but no account or organization found yet. (They may need to sign up first)`);
      // You can implement logic to store "pending" upgrades here if needed.
    }

    return NextResponse.json({ success: true, message: `Upgraded ${email} to ${plan}` });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
