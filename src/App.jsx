import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [session, setSession] = useState(null); // { username, password, cookie }
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [provider, setProvider] = useState('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardPass, setCardPass] = useState('');
  const [amount, setAmount] = useState('');

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ id: Date.now(), time, message, type }, ...prev]);
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    addLog("Creating new account...");
    try {
      const res = await fetch('/api/register', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSession({
          username: data.username,
          password: data.password,
          cookie: data.sessionCookie
        });
        setCards([]); // Reset cards for new account
        addLog(`Success: ${data.username} / ${data.password}`, 'success');
      } else {
        addLog(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!session) return addLog("Create an account first!", 'error');
    if (!phoneNumber || !cardPass) return addLog("Enter phone and pass", 'error');
    
    setLoading(true);
    addLog(`Adding ${provider} card...`);
    try {
      const res = await fetch('/api/addCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCookie: session.cookie,
          provider: provider,
          phoneNumber: phoneNumber,
          cardPass: cardPass
        })
      });
      const data = await res.json();
      if (data.success) {
        addLog("Card added. Fetching card list...", 'success');
        // Automatically fetch cards after adding
        await handleFetchCards();
      } else {
        addLog(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCards = async () => {
    if (!session) return;
    setLoading(true);
    addLog("Fetching available cards...");
    try {
      const res = await fetch('/api/getCards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie: session.cookie })
      });
      const data = await res.json();
      if (data.success && data.cards.length > 0) {
        setCards(data.cards);
        // Auto-select the first card (likely the one we just added)
        if (data.cards[0]) {
          setSelectedCardId(data.cards[0].id);
        }
        addLog(`Found ${data.cards.length} card(s).`, 'success');
      } else {
        addLog(data.message || "No cards found.", 'warning');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!session) return addLog("Create an account first!", 'error');
    if (!selectedCardId || !amount) return addLog("Select a card and enter amount", 'error');

    setLoading(true);
    addLog(`Withdrawing ${amount} USDT...`);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCookie: session.cookie,
          cardId: selectedCardId,
          amount: amount
        })
      });
      const data = await res.json();
      if (data.success) {
        addLog("Withdrawal request submitted!", 'success');
      } else {
        addLog(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addLog("Copied to clipboard!", 'info');
  };

  return (
    <div className="app">
      <header>
        <h1>8kbd2.com Automation Orchestrator</h1>
        <p>Register, Add Card, and Withdraw in one click.</p>
      </header>

      <div className="dashboard">
        
        {/* Column 1: Account & Card Setup */}
        <div className="panel">
          <h2>1. Account & Card Setup</h2>
          
          <div className="action-group">
            <button 
              onClick={handleCreateAccount} 
              disabled={loading}
              className="btn-primary"
            >
              🚀 Create New Random Account
            </button>
            {session && (
              <div className="credentials">
                <p><strong>Username:</strong> {session.username} <button onClick={() => copyToClipboard(session.username)}>Copy</button></p>
                <p><strong>Password:</strong> {session.password} <button onClick={() => copyToClipboard(session.password)}>Copy</button></p>
              </div>
            )}
          </div>

          <hr />
          <h3>Add Withdrawal Card</h3>
          <div className="form-group">
            <label>Provider</label>
            <select value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="rocket">Rocket</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div className="form-group">
            <label>Card Passcode (6 digits)</label>
            <input type="password" value={cardPass} onChange={(e) => setCardPass(e.target.value)} placeholder="••••••" />
          </div>
          <button 
            onClick={handleAddCard} 
            disabled={loading || !session}
            className="btn-secondary"
          >
            ➕ Add Card
          </button>
        </div>

        {/* Column 2: Withdrawal */}
        <div className="panel">
          <h2>2. Withdraw Funds</h2>
          
          {cards.length > 0 ? (
            <div className="form-group">
              <label>Select Card</label>
              <select value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)}>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>Card ID: {card.id}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="hint">Add a card first to see options.</p>
          )}

          <div className="form-group">
            <label>Amount (USDT)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10.00" step="0.01" />
          </div>

          <button 
            onClick={handleWithdraw} 
            disabled={loading || !session || !selectedCardId}
            className="btn-withdraw"
          >
            💸 Process Withdrawal
          </button>
        </div>

        {/* Column 3: Logs */}
        <div className="panel log-panel">
          <h2>Activity Log</h2>
          <div className="log-container">
            {logs.map(log => (
              <div key={log.id} className={`log-entry ${log.type}`}>
                <span className="log-time">{log.time}</span>
                <span className="log-msg">{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && <p className="hint">No activity yet.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
