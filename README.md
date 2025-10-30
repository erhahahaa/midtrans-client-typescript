# Midtrans Client (TypeScript)

[![npm version](https://img.shields.io/npm/v/@erhahahaa/midtrans-client-typescript.svg?style=flat-square)](https://www.npmjs.com/package/@erhahahaa/midtrans-client-typescript)
[![npm downloads](https://img.shields.io/npm/dm/@erhahahaa/midtrans-client-typescript.svg?style=flat-square)](https://www.npmjs.com/package/@erhahahaa/midtrans-client-typescript)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)](https://www.typescriptlang.org/)

**Unofficial** TypeScript rewrite of the Midtrans Node.js client with zero dependencies.

> ⚠️ **Note**: This is an unofficial package. For the official client, use [`midtrans-client`](https://www.npmjs.com/package/midtrans-client).

---

## Features

* Zero runtime dependencies
* Full TypeScript support
* Native `fetch` API (Node.js 18+)
* ESM and CommonJS support

---

## Installation

```bash
npm install @erhahahaa/midtrans-client-typescript
```

**Requirements:** Node.js 18+

---

## Usage

### Snap API

```typescript
import { Snap } from '@erhahahaa/midtrans-client-typescript';

const snap = new Snap({
  isProduction: false,
  serverKey: 'YOUR_SERVER_KEY',
  clientKey: 'YOUR_CLIENT_KEY',
});

const transaction = await snap.createTransaction({
  transaction_details: {
    order_id: 'order-123',
    gross_amount: 100000,
  },
  customer_details: {
    first_name: 'John',
    email: 'john@example.com',
  },
});

console.log(transaction.redirect_url);
```

### Core API

```typescript
import { CoreApi } from '@erhahahaa/midtrans-client-typescript';

const core = new CoreApi({
  isProduction: false,
  serverKey: 'YOUR_SERVER_KEY',
});

const charge = await core.charge({
  payment_type: 'gopay',
  transaction_details: {
    order_id: 'order-123',
    gross_amount: 100000,
  },
});
```

### Transaction Status

```typescript
const status = await snap.transaction.status('order-123');
console.log(status.transaction_status);
```

### Webhook Notification

```typescript
app.post('/webhook', async (req, res) => {
  const notification = await snap.transaction.notification(req.body);
  
  if (notification.transaction_status === 'settlement') {
    console.log('Payment success');
  }
  
  res.status(200).send('OK');
});
```

## API Reference

See [Midtrans Documentation](https://docs.midtrans.com) for complete API details.

## License

This project is licensed under the [MIT License](./LICENSE) © 2025 @erhahahaa.
