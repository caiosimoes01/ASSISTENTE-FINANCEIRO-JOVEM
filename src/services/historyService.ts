import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Save a simulation payload for a given user.
 * All numeric values are converted to integer cents to preserve precision.
 */
export async function saveSimulation(userId: string, data: Record<string, any>): Promise<void> {
  if (!db) {
    throw new Error("Firestore database is not initialized");
  }
  // Deep copy to avoid mutating the original object
  const payload: Record<string, any> = { ...data, userId, createdAt: serverTimestamp() };
  // Convert numeric fields to integer cents
  for (const key of Object.keys(payload)) {
    const value = payload[key];
    if (typeof value === 'number') {
      // Preserve two decimal places as cents
      payload[key] = Math.round(value * 100);
    }
  }
  await addDoc(collection(db, 'Historico_Projecao'), payload);
}

/**
 * Retrieve the simulation history for a user ordered by newest first.
 */
export async function getUserSimulations(userId: string): Promise<any[]> {
  if (!db) {
    throw new Error("Firestore database is not initialized");
  }
  const q = query(
    collection(db, 'Historico_Projecao'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
