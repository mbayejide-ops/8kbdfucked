import React, { useState } from 'react';

// Inline Styles to avoid CSS import issues
const styles = {
  app: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px' },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { color: '#2c3e50', fontSize: '24px', margin: '0 0 5px 0' },
  subtitle: { color: '#7f8c8d', fontSize: '14px', margin: '0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  panel: { backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' },
  panelTitle: { marginTop: '0', fontSize: '18px', color: '#34495e', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', color: '#2c3e50' },
  input: { width: '100%', padding: '10px', border: '1px solid #bdc3c7', borderRadius: '5px', boxSizing: 'border-box' },
  button: { width: '100%', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', color: 'white' },
  btnPrimary: { backgroundColor: '#3498db' },
  btnSuccess: { backgroundColor: '#2ecc71' },
  btnDanger: { backgroundColor: '#e74c3c' },
  credentials: { backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '5px', marginTop: '10px', fontSize: '14px' },
  logContainer: { maxHeight: '300px', overflowY: 'auto', backgroundColor: '#2c3e50', color: '#ecf0f1', padding: '10px', borderRadius: '5px', fontFamily: 'monospace', fontSize: '12px' },
  logEntry: { marginBottom: '5px', borderBottom: '1px solid #34495e', paddingBottom: '5px' },
  logSuccess: { color: '#2ecc71' },
  logError: { color: '#e74c3c' },
  hint: { fontSize: '12px', color: '#7f8c8d', fontStyle: 'italic' }
};

function App() {
  const [session, setSession] = useState(null);
  const [cards, setCards] = useState([]);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
        setSession({ username: data.username, password: data.password, cookie: data.sessionCookie });
        setCards([]);
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
    if (!session) return addLog("Create an account first!", "error");
    if (!phoneNumber || !cardPass) return addLog("Enter phone and pass", "error");
    
    setLoading(true);
    addLog(`Adding ${provider} card...`);
    try {
      const res = await fetch('/api/addCard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie: session.cookie, provider, phoneNumber, cardPass })
      });
      const data = await res.json();
      if (data.success) {
        addLog("Card added. Fetching card list...", "success");
        await handleFetchCards();
      } else {
        addLog(`Error: ${data.error}`, "error");
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, "error");
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
        if (data.cards[0]) setSelectedCardId(data.cards[0].id);
        addLog(`Found ${data.cards.length} card(s).`, "success");
      } else {
        addLog(data.message || "No cards found.", "warning");
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!session) return addLog("Create an account first!", "error");
    if (!selectedCardId || !amount) return addLog("Select a card and enter amount", "error");

    setLoading(true);
    addLog(`Withdrawing ${amount} USDT...`);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionCookie: session.cookie, cardId: selectedCardId, amount })
      });
      const data = await res.json();
      if (data.success) {
        addLog("Withdrawal request submitted!", "success");
      } else {
        addLog(`Error: ${data.error}`, "error");
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    addLog("Copied to clipboard!", "info");
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>8kbd2.com Automation Orchestrator</h1>
        <p style={styles.subtitle}>Register, Add Card, and Withdraw in one click.</p>
      </header>

      <div style={styles.grid}>
        {/* Panel 1: Account */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>1. Account Setup</h2>
          <button 
            style={{...styles.button, ...styles.btnPrimary, opacity: loading ? 0.7 : 1}}
            onClick={handleCreateAccount}
            disabled={loading}
          >
            🚀 Create New Random Account
          </button>
          
          {session && (
            <div style={styles.credentials}>
              <p><strong>Username:</strong> {session.username} <button onClick={() => copyToClipboard(session.username)} style={{fontSize: '10px', padding: '2px 5px'}}>Copy</button></p>
              <p><strong>Password:</strong> {session.password} <button onClick={() => copyToClipboard(session.password)} style={{fontSize: '10px', padding: '2px 5px'}}>Copy</button></p>
            </div>
          )}

          <hr style={{margin: '20px 0', border: '0', borderTop: '1px solid #eee'}} />
          <h3 style={{fontSize: '16px', color: '#34495e'}}>Add Withdrawal Card</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Provider</label>
            <select style={styles.input} value={provider} onChange={(e) => setProvider(e.target.value)}>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
            </select>
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input style={styles.input} type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="01XXXXXXXXX" />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Card Passcode</label>
            <input style={styles.input} type="password" value={cardPass} onChange={(e) => setCardPass(e.target.value)} placeholder="••••••" />
          </div>
          <button 
            style={{...styles.button, ...styles.btnSuccess, opacity: loading || !session ? 0.7 : 1}}
            onClick={handleAddCard}
            disabled={loading || !session}
          >
            ➕ Add Card
          </button>
        </div>

        {/* Panel 2: Withdraw */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>2. Withdraw Funds</h2>
          {cards.length > 0 ? (
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Card</label>
              <select style={styles.input} value={selectedCardId} onChange={(e) => setSelectedCardId(e.target.value)}>
                {cards.map(card => (
                  <option key={card.id} value={card.id}>Card ID: {card.id}</option>
                ))}
              </select>
            </div>
          ) : (
            <p style={styles.hint}>Add a card first to see options.</p>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Amount (USDT)</label>
            <input style={styles.input} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="10.00" step="0.01" />
          </div>

          <button 
            style={{...styles.button, ...styles.btnDanger, opacity: loading || !session || !selectedCardId ? 0.7 : 1}}
            onClick={handleWithdraw}
            disabled={loading || !session || !selectedCardId}
          >
            💸 Process Withdrawal
          </button>
        </div>

        {/* Panel 3: Logs */}
        <div style={styles.panel}>
          <h2 style={styles.panelTitle}>Activity Log</h2>
          <div style={styles.logContainer}>
            {logs.map(log => (
              <div key={log.id} style={{...styles.logEntry, color: log.type === 'success' ? '#2ecc71' : log.type === 'error' ? '#e74c3c' : '#ecf0f1'}}>
                [{log.time}] {log.message}
              </div>
            ))}
            {logs.length === 0 && <p style={{color: '#95a5a6'}}>No activity yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
