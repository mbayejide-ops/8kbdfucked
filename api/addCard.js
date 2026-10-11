// api/addCard.js
import { parseCookies } from './utils.js';

const TARGET_BASE = "https://www.8kbd2.com";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { sessionCookie, provider, phoneNumber, cardPass } = req.body;

  if (!sessionCookie || !provider || !phoneNumber || !cardPass) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 1. Construct Payload
    // Field names are guesses based on typical crypto site structures.
    // You may need to inspect the "Add Card" form HTML to confirm field names.
    const formData = new URLSearchParams();
    formData.append('provider', provider); // 'bkash' or 'nagad'
    formData.append('phone', phoneNumber);
    formData.append('pass', cardPass); // The 6-digit passcode
    formData.append('confirm_pass', cardPass);
    // Might need a hidden CSRF token here. If it fails, you'll need to scrape it.
    
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': sessionCookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Origin': TARGET_BASE,
      'Referer': `${TARGET_BASE}/m/myWithdrawCards`
    };

    // 2. Send Request
    const response = await fetch(`${TARGET_BASE}/m/myWithdrawCards`, {
      method: 'POST',
      headers: headers,
      body: formData.toString(),
      redirect: 'follow'
    });

    const text = await response.text();
    
    // Check if the response indicates success
    // Often these sites return a JSON or a redirect with a message.
    if (response.ok) {
       return res.status(200).json({
         success: true,
         message: "Card added successfully",
         rawResponse: text.substring(0, 200) // Log first 200 chars for debugging
       });
    } else {
       return res.status(response.status).json({
         success: false,
         error: `Card addition failed: ${response.status}`,
         rawResponse: text
       });
    }

  } catch (error) {
    console.error("Add Card Error:", error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
