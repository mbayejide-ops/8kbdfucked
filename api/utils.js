// api/utils.js

// Generate a random alphanumeric string
export function randomString(length, chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate a random "word" for the 6-word password requirement
// The prompt said "6 word er", but usually this means 6 characters or a specific format.
// Let's assume it means a 6-character alphanumeric string, or a password composed of 6 random words.
// Given "special character allow nah", I will stick to alphanumeric.
// If "6 word" literally means 6 words (e.g. "apple banana cherry..."), I can adjust.
// Let's assume 6 alphanumeric characters for the pass, as that's common for simple sites.
// Wait, the prompt says "username minimum 6 word er dite hoy". This is ambiguous.
// "6 word er" usually implies length in Bengali context (6 akshor/character).
// But "word" can mean space-separated.
// Let's assume: Username = 6+ alphanumeric chars. Password = 6+ alphanumeric chars.

export function generateCredentials() {
  const username = randomString(8); // 8 chars to be safe
  const password = randomString(8); // 8 chars to be safe
  return { username, password };
}

// Helper to parse Set-Cookie headers into a Cookie string
export function parseCookies(setCookieHeaders) {
  if (!setCookieHeaders) return "";
  const cookies = [];
  const headers = Array.isArray(setCookieHeaders) ? setCookieHeaders : [setCookieHeaders];
  
  headers.forEach(header => {
    const parts = header.split(';');
    const cookiePart = parts[0];
    if (cookiePart.includes('=')) {
      cookies.push(cookiePart);
    }
  });
  return cookies.join('; ');
}
