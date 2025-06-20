# @netko/logger 🚀

A sassy, Node.js-only logger for Netko, powered by pino and chalk. 

## Features

- 🌈 Colorful pretty logs in development (chalk-powered)
- 🪵 JSON logs in production (for the serious folks)
- 🔥 Log levels: info, warn, error, debug, and more
- 🏷️ Custom log fields (add your own spice: requestId, userId, etc.)
- 🧑‍💻 Node.js only (sorry, browsers!)

## Usage

```ts
import { logger } from '@netko/logger'

logger.info('Hello, world!', { requestId: 'abc123' })
logger.error('Oops!', { userId: 42 })
```

## Pro Tips
- Set `NODE_ENV=production` for JSON logs.
- Add as many custom fields as your heart desires.

---

Because your logs deserve personality. 💅 