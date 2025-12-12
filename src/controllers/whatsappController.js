const ConversationState = require('../models/ConversationState');
const Session = require('../models/Session');
const { sendMessage } = require('../services/whatsappService');

/**
 * Handles webhook verification for WhatsApp Cloud API
 * GET /webhook
 */
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log('VERIFY_TOKEN:', process.env.VERIFY_TOKEN);
console.log('INCOMING TOKEN:', req.query['hub.verify_token']);


  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully');
    return res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed');
    return res.status(403).send('Forbidden');
  }
};

/**
 * Handles incoming WhatsApp messages
 * POST /webhook
 */
// const handleIncomingMessage = async (req, res) => {
//   try {
//     const body = req.body;

//     // Validate webhook structure
//     if (!body.entry || !body.entry[0]?.changes || !body.entry[0].changes[0]?.value?.messages) {
//       return res.sendStatus(200); // Acknowledge receipt even if no message
//     }

//     const message = body.entry[0].changes[0].value.messages[0];
//     const phone = message.from;
//     const userMessage = message.text?.body?.trim();

//     // Ignore messages without text
//     if (!userMessage) {
//       return res.sendStatus(200);
//     }

//     console.log(`📩 Message from ${phone}: ${userMessage}`);

//     // Process the message based on conversation state
//     await processMessage(phone, userMessage);

//     return res.sendStatus(200);
//   } catch (error) {
//     console.error('❌ Error handling message:', error);
//     return res.sendStatus(500);
//   }
// };


const handleIncomingMessage = async (req, res) => {
  try {
    const body = req.body;

    // Safely drill into WhatsApp payload
    const message =
      body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    // If no message (e.g., status updates, delivery receipts), just ACK
    if (!message) {
      return res.sendStatus(200);
    }

    const phone = message.from;
    const userMessage = message.text?.body?.trim();

    // Ignore non-text messages (images, buttons, etc.)
    if (!userMessage) {
      return res.sendStatus(200);
    }

    console.log(`📩 Message from ${phone}: ${userMessage}`);

    // Your custom logic
    await processMessage(phone, userMessage);

    return res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error handling message:', error);
    // In production you might still return 200 to avoid retries:
    // return res.sendStatus(200);
    return res.sendStatus(500);
  }
};

/**
 * Core message processing logic with state machine
 */
// const processMessage = async (phone, message) => {
//   try {
//     // Get or create conversation state
//     let state = await ConversationState.findOne({ phone });

//     if (!state) {
//       // First time user - create state and ask for date
//       state = new ConversationState({
//         phone,
//         step: 'ASK_DATE',
//       });
//       await state.save();
//       await sendMessage(phone, '👋 Welcome to Session Booking!\n\nPlease provide the date for your session (e.g., 2024-01-15 or Jan 15):');
//       return;
//     }

//     // Handle conversation based on current step
//     switch (state.step) {
//       case 'ASK_DATE':
//         await handleDateInput(phone, message, state);
//         break;

//       case 'ASK_TIME':
//         await handleTimeInput(phone, message, state);
//         break;

//       default:
//         // Reset conversation if in unknown state
//         state.step = 'ASK_DATE';
//         await state.save();
//         await sendMessage(phone, 'Let\'s start over. Please provide the date for your session:');
//         break;
//     }
//   } catch (error) {
//     console.error('❌ Error processing message:', error);
//     await sendMessage(phone, '⚠️ An error occurred. Please try again later.');
//   }
// };


const processMessage = async (phone, message) => {
  try {
    const userMessage = message?.trim();
    if (!userMessage) {
      await sendMessage(phone, 'Please send a valid message 😊');
      return;
    }

    let state = await ConversationState.findOne({ phone });

    if (!state) {
      state = new ConversationState({
        phone,
        step: 'ASK_DATE',
      });
      await state.save();
      await sendMessage(
        phone,
        '👋 Welcome to Session Booking!\n\nPlease provide the date for your session (e.g., 2024-01-15 or Jan 15):'
      );
      return;
    }

    switch (state.step) {
      case 'ASK_DATE':
        await handleDateInput(phone, userMessage, state);
        break;

      case 'ASK_TIME':
        await handleTimeInput(phone, userMessage, state);
        break;

      default:
        state.step = 'ASK_DATE';
        await state.save();
        await sendMessage(
          phone,
          "Let's start over. Please provide the date for your session:"
        );
        break;
    }
  } catch (error) {
    console.error('❌ Error processing message:', error);
    await sendMessage(phone, '⚠️ An error occurred. Please try again later.');
  }
};


/**
 * Handles date input from user
 */
const handleDateInput = async (phone, message, state) => {
  // Save the date and move to next step
  state.tempDate = message;
  state.step = 'ASK_TIME';
  await state.save();

  await sendMessage(
    phone,
    `✅ Date saved: ${message}\n\nNow, please provide the time for your session (e.g., 10:00 AM or 14:30):`
  );
};

/**
 * Handles time input and checks for duplicate sessions
 */
const handleTimeInput = async (phone, message, state) => {
  const date = state.tempDate;
  const time = message;

  // Check if session already exists for this date and time
  const existingSession = await Session.findOne({
    phone,
    date,
    time,
  });

  if (existingSession) {
    // Duplicate session found - warn user
    await sendMessage(
      phone,
      `⚠️ You already have a session booked for:\n📅 Date: ${date}\n🕒 Time: ${time}\n\nPlease choose a different date or time.`
    );

    // Delete conversation state to start over
    await ConversationState.deleteOne({ phone });
    return;
  }

  // Create new session
  const newSession = new Session({
    phone,
    date,
    time,
  });

  await newSession.save();

  // Send confirmation
  await sendMessage(
    phone,
    `✅ Session booked successfully!\n\n📅 Date: ${date}\n🕒 Time: ${time}\n\nThank you for booking with us!`
  );

  // Delete conversation state (conversation complete)
  await ConversationState.deleteOne({ phone });
};

module.exports = {
  verifyWebhook,
  handleIncomingMessage,
};
