/**
 * Firebase configuration for file uploads
 * Note: Firebase packages are optional - only needed when VITE_USE_FIREBASE=true
 * Install when needed: npm install firebase
 */

// Check if Firebase should be used
export const useFirebase = import.meta.env.VITE_USE_FIREBASE === 'true';

export async function uploadFileToFirebase(
  file: File,
  path: string
): Promise<string> {
  if (!useFirebase) {
    throw new Error('Firebase is not enabled. Set VITE_USE_FIREBASE=true in .env');
  }

  try {
    // Dynamic imports - only loads when actually used
    const { initializeApp } = await import('firebase/app');
    const { getStorage, ref, uploadBytes, getDownloadURL } = await import('firebase/storage');

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const storageRef = ref(storage, path);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Firebase upload failed:', error);
    throw new Error('Failed to upload file to Firebase. Make sure firebase is installed: npm install firebase');
  }
}

export function isFirebaseUrl(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}
