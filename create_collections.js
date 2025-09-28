// ESM-compatible version for Node.js with 'type': 'module'
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

// Load service account key from JSON file
const serviceAccount = JSON.parse(
  await readFile('./serviceAccountKey.json', 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});


const collections = [
  'users',
  'wallets',
  'games',
  'gameRooms',
  'transactions'
];

(async () => {
  const db = admin.firestore();
  const batch = db.batch();

  for (const col of collections) {
    const docRef = db.collection(col).doc('_dummy');
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      batch.set(docRef, { _dummy: true });
      console.log(`Prepared creation for ${col}`);
    } else {
      console.log(`Collection ${col} already exists`);
    }
  }

  if (batch._ops.length > 0) {
    await batch.commit();
    console.log('Batch creation complete.');
  } else {
    console.log('No new collections needed.');
  }

  // Do NOT clean up dummy docs, so collections remain visible in Firestore console
  // Verification: List all collections and their documents
  console.log('\n--- Firestore Collections and Documents ---');
  for (const col of collections) {
    const snapshot = await db.collection(col).get();
    console.log(`Collection: ${col}`);
    snapshot.docs.forEach(doc => {
      console.log(`  Doc: ${doc.id} =>`, doc.data());
    });
    if (snapshot.empty) {
      console.log('  (No documents found)');
    }
  }
  process.exit();
})();