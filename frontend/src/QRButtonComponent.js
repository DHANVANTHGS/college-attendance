import React, { useState } from 'react';
import axios from 'axios';

function QRButtonComponent() {
  const [qrImage, setQrImage] = useState(null);
  const [error, setError] = useState('');

  const fetchQrWithLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

       
        try {
          const response = await axios.post(
            'http://localhost:5000/api/generate-qr',
            { latitude, longitude },
            {
              headers: {
                'Content-Type': 'application/json'
              },
              withCredentials: true 
            }
          );

          setQrImage(response.data.qrCode);
          setError('');
        } catch (err) {
          console.error(err);
          setError('Failed to fetch QR code from server');
        }
      },
      () => {
        setError('Unable to retrieve your location');
      }
    );
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <button onClick={fetchQrWithLocation} style={{ padding: '10px 20px', fontSize: '16px' }}>
        QR Code
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {qrImage && (
        <div style={{ marginTop: '20px' }}>
          <img src={qrImage} alt="QR Code" style={{ width: '200px', height: '200px' }} />
        </div>
      )}
    </div>
  );
}

export default QRButtonComponent;

