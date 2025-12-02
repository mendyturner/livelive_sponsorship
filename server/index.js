/**
 * liveLIVE Foundation - Sponsorship Form Relay Server
 * 
 * This Express server provides a relay endpoint POST /api/submit that:
 * - Accepts form data (JSON or form-urlencoded) from the sponsorship form
 * - Validates required fields (company, contact, email, tier)
 * - Forwards the data to the Make.com webhook configured via MAKE_WEBHOOK_URL
 * - Returns appropriate success/error responses
 */

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const path = require('path');

const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Validate required environment variables
if (!MAKE_WEBHOOK_URL) {
  console.error('ERROR: MAKE_WEBHOOK_URL environment variable is required');
  console.error('Please set it in your .env file or environment variables');
  process.exit(1);
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

// Rate limiting - basic brute-force prevention
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for form submissions
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 submissions per minute
  message: { error: 'Too many form submissions, please try again in a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Serve static files from parent directory (index.html, logo.png, etc.)
app.use(express.static(path.join(__dirname, '..')));

// Required fields for form validation
const REQUIRED_FIELDS = ['company', 'contact', 'email', 'tier'];

/**
 * Validate form data
 * @param {Object} data - Form data to validate
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
function validateFormData(data) {
  const errors = [];
  
  for (const field of REQUIRED_FIELDS) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }
  
  // Basic email validation
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * POST /api/submit - Form submission relay endpoint
 * 
 * Accepts form data and forwards it to the Make.com webhook.
 * Returns JSON responses with appropriate status codes.
 */
app.post('/api/submit', submitLimiter, async (req, res) => {
  try {
    const formData = req.body;
    
    // Validate required fields
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors
      });
    }
    
    // Forward to Make.com webhook
    const response = await axios.post(MAKE_WEBHOOK_URL, formData, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'liveLIVE-Sponsorship-Relay/1.0'
      }
    });
    
    // Check if Make.com responded with success
    if (response.status >= 200 && response.status < 300) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Make.com returned non-2xx status:', response.status);
      return res.status(502).json({
        success: false,
        error: 'Failed to process submission'
      });
    }
    
  } catch (error) {
    // Log error details for debugging (but don't expose in production)
    if (error.response) {
      console.error('Make.com error response:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No response from Make.com:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }
    
    // Return appropriate error response
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'Request timeout - please try again'
      });
    }
    
    // Don't expose internal errors in production
    const errorMessage = IS_PRODUCTION 
      ? 'An error occurred processing your submission'
      : error.message;
      
    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Handle 404 for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`liveLIVE Sponsorship Relay Server running on port ${PORT}`);
  console.log(`Form available at: http://localhost:${PORT}/`);
  console.log(`API endpoint: http://localhost:${PORT}/api/submit`);
  if (!IS_PRODUCTION) {
    console.log('Running in development mode');
  }
});

module.exports = app;
