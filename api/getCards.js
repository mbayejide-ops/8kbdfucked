// api/getCards.js
import { parseCookies } from './utils.js';

const TARGET_BASE = "https://www.8kbd2.com";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { sessionCookie } = req.body;

  if (!sessionCookie) {
    return res.status(400).json({ error: 'Missing sessionCookie' });
  }

  try {
    // Most crypto sites have a /myWithdrawCards or /cards endpoint that returns JSON
    // or HTML. We'll try to fetch the page and look for JSON or parse the HTML.
    
    const response = await fetch(`${TARGET_BASE}/m/myWithdrawCards`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
      },
      redirect: 'follow'
    });

    const text = await response.text();

    // Strategy 1: Check if it's already JSON
    if (text.startsWith('{') || text.startsWith('[')) {
      const data = JSON.parse(text);
      return res.status(200).json({ success: true, cards: data });
    }

    // Strategy 2: Simple Regex to find Card IDs in HTML
    // This is a heuristic. You might need to adjust the regex based on the actual HTML structure.
    // Looking for data-id="123" or id="card-123"
    const cardIdRegex = /data-card-id=["']?(\d+)["']?|id=["']?card[-_]?(\d+)["']?/gi;
    const matches = [...text.matchAll(cardIdRegex)];
    
    let cards = [];
    matches.forEach(match => {
      // match[1] or match[2] will hold the ID depending on which pattern matched
      const id = match[1] || match[2];
      if (id) {
        cards.push({ id: parseInt(id, 10), raw: match[0] });
      }
    });

    if (cards.length > 0) {
      return res.status(200).json({ success: true, cards });
    } else {
      // If no cards found, return a snippet of the HTML for debugging
      return res.status(200).json({ 
        success: false, 
        message: "No card IDs found via regex. Check HTML structure.",
        htmlSnippet: text.substring(0, 500) 
      });
    }

  } catch (error) {
    console.error("Get Cards Error:", error);
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
