import { base64url } from "./base64url";

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PasskeyStorage', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('passkeys')) {
        db.createObjectStore('passkeys', { keyPath: 'email' });
      }
    };
  });
};

// Store passkey data

export const storePasskey = async (email, credential) => {
  // Convert the credential to a storable format
  const storableCredential = {
    id: credential.id,
    rawId: base64url.encode(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: base64url.encode(credential.response.attestationObject),
      clientDataJSON: base64url.encode(credential.response.clientDataJSON),
    },
    // Include any other properties you need
  };

  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['passkeys'], 'readwrite');
    const store = transaction.objectStore('passkeys');
    
    const request = store.put({
      email,
      credentialData: storableCredential,  // Use the converted data
      timestamp: new Date().toISOString()
    });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Retrieve passkey data
export const getPasskey = async (email) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['passkeys'], 'readonly');
    const store = transaction.objectStore('passkeys');
    
    const request = store.get(email);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Check if passkey exists for email
export const hasPasskey = async (email) => {
  const passkey = await getPasskey(email);
  return !!passkey;
}; 