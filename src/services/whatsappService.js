const axios = require('axios');

/**
 * Sends a WhatsApp message using the WhatsApp Cloud API
 * @param {string} to - Recipient phone number (with country code, without +)
 * @param {string} message - Message text to send
 * @returns {Promise} - Axios response promise
 */


// ✅ Phone number must:

// Be in international format

// ❌ Without +

// ✅ Example: 919876543210


const sendMessage = async (to, message) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: message,
    },
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
  };

  try {
    const response = await axios.post(url, payload, { headers });
    console.log(`✅ Message sent to ${to}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  sendMessage,
};
