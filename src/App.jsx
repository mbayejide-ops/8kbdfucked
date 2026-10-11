import React, { useState } from 'react';
import './App.css';

function App() {
  const [session, setSession] = useState(null); // { username, password, cookie }
  const [cardId, setCardId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [provider, setProvider] = useState('bkash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardPass, setCardPass] = useState('');
  const [amount, setAmount] = useState('');

  const addLog = (message, type = 'info') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, message, type }, ...prev]);
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
        // In a real scenario, we'd parse the card ID from the response or fetch the card list.
        // For this demo, we'll assume we need to fetch the card list to get the ID.
        // Let's create a placeholder logic. If the site returns the ID in JSON, use that.
        // If not, we might need a /api/getCards endpoint.
        // Let's assume for now we can just try to withdraw with a known ID or fetch it.
        // To keep it simple, let's assume the response gives us an ID or we use a dummy ID for testing.
        // Better approach: Add a /api/getCards endpoint.
        
        // Let's assume we need to get the card ID. I'll add a quick fetch logic here 
        // but it's better to have a dedicated API. 
        // For brevity in this code block, let's assume the user knows the card ID 
        // or we'll update the addCard response to include it if possible.
        
        addLog("Card added. Please enter Card ID for withdrawal.", 'success');
        // You might want to prompt for Card ID here or auto-fetch it.
      } else {
        addLog(`Error: ${data.error}`, 'error');
      }
    } catch (err) {
      addLog(`Network Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!session) return addLog("Create an account first!", 'error');
    if (!cardId || !amount) return addLog("Enter Card ID and Amount", 'error');

    setLoading(true);
    addLog(`Withdrawing ${amount} USDT...`);
    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionCookie: session.cookie,
          cardId: cardId,
          amount: amount
        })
      });
      const data
