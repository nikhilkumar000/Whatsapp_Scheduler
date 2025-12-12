const express = require('express');
const { verifyWebhook, handleIncomingMessage } = require('../controllers/whatsappController');

const router = express.Router();

// Webhook verification endpoint (GET)
router.get('/webhook', verifyWebhook);

// Webhook message handler (POST)
router.post('/webhook', handleIncomingMessage);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const { verifyWebhook } = require('../controllers/webhookController');

// // MUST be GET
// router.get('/webhook', verifyWebhook);

// // Incoming messages
// router.post('/webhook', (req, res) => {
//   console.log(req.body);
//   res.sendStatus(200);
// });

// module.exports = router;
