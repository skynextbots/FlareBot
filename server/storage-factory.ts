import { IStorage, MemStorage } from './storage';
import { FirebaseStorage } from './firebase-storage';

export function createStorage(): IStorage {
  // Temporarily use memory storage to avoid Firebase connection issues
  // Switch back to Firebase once Firestore is enabled in console
  console.log('[Storage] Using memory storage (Firebase temporarily disabled)');
  return new MemStorage();
  
  // When Firebase is ready, uncomment this:
  // if (process.env.GOOGLE_API_KEY) {
  //   console.log('[Storage] Using Firebase storage');
  //   return new FirebaseStorage();
  // } else {
  //   console.log('[Storage] Using memory storage (Firebase key not found)');
  //   return new MemStorage();
  // }
}

export const storage = createStorage();