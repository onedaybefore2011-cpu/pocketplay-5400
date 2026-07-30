import React, { useState } from 'react';
import { supabase } from './supabaseClient'; // Path check kar lein

export function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    
    // Supabase table me insert
    const { error } = await supabase
      .from('feedback')
      .insert([{ message }]);

    setLoading(false);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      alert('Feedback successfully sent!');
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
      <h3>Send Feedback</h3>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your feedback..."
        rows={4}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
