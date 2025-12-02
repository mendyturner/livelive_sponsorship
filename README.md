# liveLIVE Foundation - Corporate Sponsorship Page

A landing page for corporate sponsorship inquiries for the liveLIVE Foundation, a 501(c)(3) nonprofit organization supporting single-parent families and veterans.

## Quick Start for GitHub Pages

If you're hosting on GitHub Pages (like `sponsorship.livelivefoundation.org`), you need to configure the Make.com webhook URL directly in the HTML:

1. **Get your Make.com webhook URL**:
   - Create a scenario in Make.com with a "Custom Webhook" trigger
   - Copy the webhook URL (e.g., `https://hook.us2.make.com/abc123xyz`)

2. **Update index.html**:
   Find this line near line 628:
   ```html
   <form id="sponsorshipForm" method="POST" action="#" data-endpoint="https://hook.us2.make.com/REPLACE_WITH_YOUR_WEBHOOK_ID">
   ```
   Replace `REPLACE_WITH_YOUR_WEBHOOK_ID` with your actual Make.com webhook URL.

3. **Commit and push** the changes to deploy.

**Important**: GitHub Pages is static hosting and cannot run server-side code. The form submits directly to Make.com via JavaScript.

---

## Server-Side Relay (Optional)

If you're hosting on a platform that supports Node.js (Heroku, Render, Vercel, etc.), you can use the included Express server for additional security and validation.

The server:
- Receives form submissions from the sponsorship page
- Validates required fields (company, contact, email, tier)
- Forwards data securely to the Make.com webhook
- Handles errors gracefully and includes rate limiting

### Prerequisites

- Node.js 18.0.0 or higher
- npm (comes with Node.js)

### Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp ../.env.example .env
   ```

4. Edit `.env` and set your Make.com webhook URL:
   ```
   MAKE_WEBHOOK_URL=https://hook.make.com/YOUR_WEBHOOK_ID
   PORT=3000
   ```

5. Update `index.html` to use the relay:
   ```html
   <form id="sponsorshipForm" method="POST" action="#" data-endpoint="/api/submit">
   ```

### Running Locally

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start and serve:
- The sponsorship page at `http://localhost:3000/`
- The form submission API at `http://localhost:3000/api/submit`
- A health check endpoint at `http://localhost:3000/api/health`

### Deployment

When deploying to production:

1. Set the `MAKE_WEBHOOK_URL` environment variable to your Make.com webhook URL
2. Set `NODE_ENV=production` for production-appropriate error handling
3. Set `PORT` if your hosting platform requires a specific port

**Environment Variables:**
| Variable | Required | Description |
|----------|----------|-------------|
| `MAKE_WEBHOOK_URL` | Yes | Your Make.com webhook URL for processing form submissions |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Set to `production` for production deployments |

### Security Features

- **Helmet.js**: Security headers for protection against common vulnerabilities
- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes per IP
  - Form submissions: 5 per minute per IP
- **Body Size Limit**: 10KB maximum payload
- **Input Validation**: Required field validation and email format checking
- **No Exposed Secrets**: Make.com webhook URL is stored in environment variables, not in code

## License

MIT
