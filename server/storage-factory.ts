import { IStorage, MemStorage } from './storage';
import { FirebaseStorage } from './firebase-storage';

export function createStorage(): IStorage {
  // Use Firebase if Google API key is available, otherwise use memory storage
  if (process.env.GOOGLE_API_KEY) {
    console.log('[Storage] Using Firebase storage');
    return new FirebaseStorage();
  } else {
    console.log('[Storage] Using memory storage (Firebase key not found)');
    return new MemStorage();
  }
}

export const storage = createStorage();