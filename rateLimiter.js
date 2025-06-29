const express = require('express');
const app = express();
const port = 3000;

// In-memory store for request timestamps
const requestStore = new Map();

// Rate limiter configuration
const WINDOW_SIZE = 60 * 1000; // 1 minute in milliseconds
const MAX_REQUESTS = 10; // Max requests allowed in the window

// Rate limiter middleware
const rateLimiter = (req, res, next) => {
  const clientIp = req.ip; // Identify client by IP
  const currentTime = Date.now();

  // Initialize or retrieve client's request timestamps
  if (!requestStore.has(clientIp)) {
    requestStore.set(clientIp, []);
  }

  const timestamps = requestStore.get(clientIp);

  // Filter timestamps within the current window
  const validTimestamps = timestamps.filter(
    (timestamp) => currentTime - timestamp <= WINDOW_SIZE
  );

  // Update the store with valid timestamps
  requestStore.set(clientIp, validTimestamps);

  // Check if request limit is exceeded
  if (validTimestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again after ${Math.ceil(
        (WINDOW_SIZE - (currentTime - validTimestamps[0])) / 1000
      )} seconds.`,
    });
  }

  // Add current request timestamp
  validTimestamps.push(currentTime);
  requestStore.set(clientIp, validTimestamps);

  // Proceed to the next middleware
  next();
};

// Apply rate limiter to all routes
app.use(rateLimiter);

// Sample endpoint to test the rate limiter
app.get('/', (req, res) => {
  res.json({ message: 'Request successful', timestamp: new Date().toISOString() });
});

// Periodic cleanup of old entries (every 5 minutes)
setInterval(() => {
  const currentTime = Date.now();
  for (const [clientIp, timestamps] of requestStore.entries()) {
    const validTimestamps = timestamps.filter(
      (timestamp) => currentTime - timestamp <= WINDOW_SIZE
    );
    if (validTimestamps.length === 0) {
      requestStore.delete(clientIp);
    } else {
      requestStore.set(clientIp, validTimestamps);
    }
  }
}, 5 * 60 * 1000);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});