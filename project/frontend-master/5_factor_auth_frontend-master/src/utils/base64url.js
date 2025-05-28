// Convert ArrayBuffer to base64url string
const arrayBufferToBase64 = (buffer) => {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  const base64 = btoa(binary);
  return base64;
};

// Convert base64 to base64url
const base64ToBase64url = (base64) => {
  return base64.replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

// Convert base64url to base64
const base64urlToBase64 = (base64url) => {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) {
    if (pad === 1) {
      throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
    }
    base64 += new Array(5 - pad).join('=');
  }
  return base64;
};

export const base64url = {
  encode: (input) => {
    if (input instanceof ArrayBuffer) {
      return base64ToBase64url(arrayBufferToBase64(input));
    }
    
    if (input instanceof Uint8Array) {
      return base64ToBase64url(arrayBufferToBase64(input.buffer));
    }
    
    throw new Error('Input must be ArrayBuffer or Uint8Array');
  },

  decode: (input) => {
    try {
      const base64 = base64urlToBase64(input);
      const binaryStr = atob(base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      return bytes.buffer;
    } catch (error) {
      throw new Error('Invalid base64url string: ' + error.message);
    }
  }
}; 