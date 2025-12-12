# WhatsApp Session Scheduler

A production-ready Node.js chatbot that allows users to book sessions via WhatsApp using the WhatsApp Cloud API and MongoDB.

## Features

- 📱 WhatsApp Cloud API integration
- 💬 State-based conversation flow
- 🗄️ MongoDB for session storage
- ✅ Duplicate session detection
- 🔄 Clean, modular architecture
- 🚀 Production-ready code

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **API**: WhatsApp Cloud API (Meta)
- **HTTP Client**: Axios
- **Environment**: dotenv

## Project Structure

```
/project-root
  /src
    /config
      db.js                    # MongoDB connection
    /controllers
      whatsappController.js    # Webhook handlers
    /routes
      whatsappRoutes.js        # Route definitions
    /services
      whatsappService.js       # WhatsApp API helper
    /models
      Session.js               # Session schema
      ConversationState.js     # Conversation state schema
  app.js                       # Application entry point
  package.json
  .env.example
  README.md
```

## Installation

### 1. Clone or Download Project

```bash
cd whatsapp-session-scheduler
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas:

**Local MongoDB:**
```bash
# Install MongoDB (if not installed)
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb

# Start MongoDB
# macOS: brew services start mongodb-community
# Ubuntu: sudo systemctl start mongodb
```

**Or use MongoDB Atlas:**
- Go to https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string

### 4. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
WHATSAPP_TOKEN=your_whatsapp_access_token
VERIFY_TOKEN=your_custom_verify_token_123
PHONE_NUMBER_ID=your_phone_number_id
MONGO_URI=mongodb://localhost:27017/whatsapp-scheduler
PORT=3000
```

### 5. Run the Application

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## WhatsApp Cloud API Setup

### Step 1: Create Meta Developer App

1. Go to https://developers.facebook.com/
2. Click **My Apps** → **Create App**
3. Select **Business** as app type
4. Fill in app details and create

### Step 2: Add WhatsApp Product

1. In your app dashboard, click **Add Product**
2. Find **WhatsApp** and click **Set Up**
3. Select or create a **Business Portfolio**

### Step 3: Get Credentials

1. Navigate to **WhatsApp → Getting Started**
2. Copy the following:
   - **Temporary Access Token** → `WHATSAPP_TOKEN`
   - **Phone Number ID** → `PHONE_NUMBER_ID`
3. Create your own **Verify Token** (any random string) → `VERIFY_TOKEN`

### Step 4: Configure Webhook

1. Expose your local server using **ngrok**:
   ```bash
   ngrok http 3000
   ```

2. Copy the `https://` URL from ngrok (e.g., `https://abc123.ngrok.io`)

3. In Meta Developer Dashboard:
   - Go to **WhatsApp → Configuration**
   - Click **Edit** next to Webhook
   - Enter:
     - **Callback URL**: `https://abc123.ngrok.io/webhook`
     - **Verify Token**: Your `VERIFY_TOKEN` from `.env`
   - Click **Verify and Save**

4. Subscribe to webhook fields:
   - Check **messages**
   - Click **Save**

### Step 5: Add Test Phone Numbers

1. In **WhatsApp → API Setup**
2. Find **To** field
3. Click **Manage phone number list**
4. Add your phone number (must have WhatsApp installed)
5. Verify with the code sent to WhatsApp

## How It Works

### Conversation Flow

```
User: Hi
Bot: 👋 Welcome to Session Booking!
     Please provide the date for your session (e.g., 2024-01-15 or Jan 15):

User: 2024-01-20
Bot: ✅ Date saved: 2024-01-20
     Now, please provide the time for your session (e.g., 10:00 AM or 14:30):

User: 10:00 AM
Bot: ✅ Session booked successfully!
     📅 Date: 2024-01-20
     🕒 Time: 10:00 AM
     Thank you for booking with us!
```

### Duplicate Session Handling

```
User: Hi
Bot: 👋 Welcome to Session Booking!
     Please provide the date for your session:

User: 2024-01-20
Bot: ✅ Date saved: 2024-01-20
     Now, please provide the time:

User: 10:00 AM
Bot: ⚠️ You already have a session booked for:
     📅 Date: 2024-01-20
     🕒 Time: 10:00 AM
     Please choose a different date or time.
```

### State Machine

The bot tracks conversation state in MongoDB:

| State | Description |
|-------|-------------|
| `NONE` | No active conversation |
| `ASK_DATE` | Waiting for user to provide date |
| `ASK_TIME` | Waiting for user to provide time |

After successful booking or duplicate detection, the state is cleared.

## API Endpoints

### GET /webhook
Webhook verification endpoint for WhatsApp Cloud API.

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.verify_token`: Your verify token
- `hub.challenge`: Challenge string to return

### POST /webhook
Receives incoming WhatsApp messages.

**Body:** WhatsApp webhook payload

### GET /
Health check endpoint.

**Response:**
```json
{
  "status": "success",
  "message": "WhatsApp Session Scheduler API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Database Schema

### Session Collection

```javascript
{
  phone: String,      // User's phone number
  date: String,       // Session date
  time: String,       // Session time
  createdAt: Date     // Creation timestamp
}
```

### ConversationState Collection

```javascript
{
  phone: String,      // User's phone number (unique)
  step: String,       // Current step: NONE | ASK_DATE | ASK_TIME
  tempDate: String,   // Temporarily stored date
  updatedAt: Date     // Last update timestamp
}
```

## Testing

### Test Locally

1. Start the server
2. Use ngrok to expose your local server
3. Configure webhook in Meta Dashboard
4. Send a message from your WhatsApp to the test number

### Test Flow

```bash
# 1. Check if server is running
curl http://localhost:3000/

# 2. Test webhook verification (after configuring Meta Dashboard)
# This will be done automatically by Meta
```

### Example Test Conversation

1. Open WhatsApp on your phone
2. Send any message to your WhatsApp Business number
3. Follow the bot's prompts
4. Check MongoDB to verify session was created

## Troubleshooting

### Issue: Webhook verification fails

**Solution:**
- Ensure `VERIFY_TOKEN` in `.env` matches the one in Meta Dashboard
- Check that your server is running
- Verify ngrok URL is correct and accessible

### Issue: Messages not received

**Solution:**
- Check webhook subscription includes "messages"
- Verify `WHATSAPP_TOKEN` and `PHONE_NUMBER_ID` are correct
- Check server logs for errors
- Ensure your phone number is added as a tester

### Issue: MongoDB connection error

**Solution:**
- Verify MongoDB is running
- Check `MONGO_URI` is correct
- For Atlas, ensure IP whitelist includes your IP

### Issue: Bot not responding

**Solution:**
- Check server logs for errors
- Verify WhatsApp token is valid (temporary tokens expire)
- Test API endpoint manually with curl
- Ensure ConversationState is being created in DB

## Production Deployment

### Environment Setup

1. Use a production MongoDB instance (MongoDB Atlas recommended)
2. Get a permanent access token from Meta (temporary tokens expire in 24 hours)
3. Use a proper domain instead of ngrok
4. Set up SSL/TLS certificate
5. Use environment variables for all secrets

### Deployment Platforms

- **Heroku**: Add `Procfile` with `web: node app.js`
- **AWS EC2**: Use PM2 for process management
- **DigitalOcean**: Deploy via App Platform
- **Vercel/Netlify**: May require serverless adaptations

### Permanent Access Token

1. Go to **Meta Business Settings** → **System Users**
2. Create a system user
3. Add app permissions
4. Generate a permanent token

## Security Best Practices

- ✅ Never commit `.env` file
- ✅ Use strong, random verify tokens
- ✅ Validate all incoming webhook payloads
- ✅ Rate limit API endpoints in production
- ✅ Use HTTPS in production
- ✅ Implement proper error handling
- ✅ Log sensitive operations
- ✅ Rotate access tokens periodically

## Future Enhancements

- [ ] Add session cancellation feature
- [ ] Implement session reminders
- [ ] Add admin dashboard
- [ ] Support multiple languages
- [ ] Add user authentication
- [ ] Implement calendar view
- [ ] Add payment integration
- [ ] Session confirmation via email/SMS

## License

MIT

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Meta's WhatsApp Cloud API documentation
3. Check MongoDB connection and logs

## Resources

- [WhatsApp Cloud API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [Ngrok Documentation](https://ngrok.com/docs)

---

Built with ❤️ using Node.js, Express, MongoDB, and WhatsApp Cloud API
