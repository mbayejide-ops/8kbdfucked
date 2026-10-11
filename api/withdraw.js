// api/withdraw.js
import { parseCookies } from './utils.js';

const TARGET_BASE = "https://www.8kbd2.com";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { sessionCookie, cardId, amount } = req.body;

  if (!sessionCookie || !cardId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const formData = new URLSearchParams();
    formData.append('card_id', cardId); // ID of the card we just added
    formData.append('amount', amount);
    // Might need a 'type' or 'method' field
    // formData.append('method', 'bkash'); 

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': sessionCookie,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Origin': TARGET_BASE,
      'Referer': `${TARGET_BASE}/m/withdraw`
    };

    const response = await fetch(`${TARGET_BASE}/m/withdraw`, {
      method: 'POST',
      headers: headers,
      body: formData.toString(),
      redirect: 'follow'
    });

    const text = await response.text();

    if (response.ok) {
       return res.status(200).json({
         success: true,
         message: "Withdrawal request submitted",
         rawResponse: text.substring(0, 200)
       });
    } else {
       return res.status(response.status).json({
         success: false,
         error: `Withdrawal failed: ${response.status}`,
         rawResponse: text
       });
    }

  } catch (error) {
    console.error("Withdraw Error:", error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
