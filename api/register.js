// api/register.js
import { generateCredentials, parseCookies } from './utils.js';

const TARGET_BASE = "https://www.8kbd2.com";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Generate Credentials
    const { username, password } = generateCredentials();
    
    // 2. Construct Registration Payload
    // Note: You might need to inspect the actual HTML form to get exact field names.
    // Common names: username, password, email, etc.
    // Based on prompt: "register a gele ... username minimum 6 ... special char allow nah"
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    // Add other required fields if any (e.g., email, confirm_password)
    // formData.append('email', `${username}@tempmail.com`); 
    // formData.append('confirm_password', password);

    // 3. Send Request to Register
    const response = await fetch(`${TARGET_BASE}/m/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Origin': TARGET_BASE,
        'Referer': `${TARGET_BASE}/m/register`
      },
      body: formData.toString(),
      redirect: 'follow'
    });

    // 4. Handle Response
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ 
        error: `Registration failed: ${response.status}`, 
        details: text 
      });
    }

    // 5. Extract Cookies
    // fetch() in Node 18+ exposes headers.getSetCookie() or headers.get('set-cookie')
    // Depending on the Node version Vercel uses, this might vary.
    // Let's assume standard headers object.
    const setCookieHeader = response.headers.get('set-cookie');
    const sessionCookie = parseCookies(setCookieHeader);

    // 6. Verify Login (Optional but recommended)
    // Sometimes registration auto-logs in. Sometimes it redirects to login.
    // Let's assume it auto-logs in or returns a session.
    // If it doesn't, we might need a second step to login.
    // For now, we return the cookie we have.

    return res.status(200).json({
      success: true,
      username,
      password,
      sessionCookie, // The client needs to send this back for future requests
      message: `Account created: ${username} / ${password}`
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ error: 'Server error during registration', details: error.message });
  }
}
