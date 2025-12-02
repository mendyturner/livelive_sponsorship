# liveLIVE Foundation - Corporate Sponsorship Page

A landing page for corporate sponsorship inquiries for the liveLIVE Foundation, a 501(c)(3) nonprofit organization supporting single-parent families and veterans.

## Server-Side Relay

This repository includes a Node.js Express server that acts as a relay for form submissions. The server:

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

### Using Without the Relay Server

If you prefer to submit directly to Make.com without the relay server:

1. Update the form action in `index.html` to your Make.com webhook URL:
   ```html
   <form id="sponsorshipForm" method="POST" action="https://hook.make.com/YOUR_WEBHOOK_ID">
   ```

2. Remove or update the client-side fetch handler in the `<script>` section

**Note:** Direct submission may encounter CORS issues depending on your Make.com configuration.

## License

MIT
