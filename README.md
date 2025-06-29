# Rate Limiter Project

## Overview
A Node.js-based rate limiter that restricts API requests to 10 per minute per IP address using a sliding window algorithm.

## Features
- Tracks requests by IP address.
- Returns 429 error when limit is exceeded.
- Built with Node.js and Express.

## Setup
1. Clone the repository: `git clone https://github.com/<your-username>/rate-limiter.git`
2. Install dependencies: `npm install`
3. Run the server: `node rateLimiter.js`
4. Test: Open `http://localhost:3000` in a browser and refresh 10 times to see rate limiting.

## Technologies
- Node.js
- Express
