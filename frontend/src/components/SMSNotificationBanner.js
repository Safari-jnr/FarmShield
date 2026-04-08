import React, { useState, useEffect } from 'react';

const SMSNotificationBanner = ({ alertData }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (alertData && alertData.sms_sent > 0) {
      setMessage(`⚠️ Alert sent to ${alertData.sms_sent} nearby farmers`);
      setVisible(true);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertData]);

  if (!visible) return null;

  return (
    <div style={{
      backgroundColor: '#ef4444',
      color: 'white',
      padding: '12px',
      textAlign: 'center',
      fontWeight: 'bold',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      {message}
    </div>
  );
};

export default SMSNotificationBanner;