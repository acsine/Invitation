import crypto from 'crypto';
import { verifySasPayWebhookSignature } from '../src/lib/saspay.js';

console.log('Testing SasPay Webhook signature verification...');

process.env.SASPAY_WEBHOOK_SECRET = 'Jesusmonmaitre';

const rawBody = JSON.stringify({
  event: 'transaction.success',
  data: {
    id: 'test-txn-123',
    reference: 'REF-123',
    amount: '10000.00',
    net_amount: '10000.00',
    status: 'SUCCESS',
  },
});

const timestamp = Math.floor(Date.now() / 1000).toString();
const validSig = crypto
  .createHmac('sha256', 'Jesusmonmaitre')
  .update(`${timestamp}.${rawBody}`)
  .digest('hex');

// Test 1: Valid signature and timestamp
const result1 = verifySasPayWebhookSignature(rawBody, validSig, timestamp);
console.log('Test 1 (Valid signature):', result1 ? 'PASS ✅' : 'FAIL ❌');

// Test 2: Invalid signature
const result2 = verifySasPayWebhookSignature(rawBody, 'invalidsignature123', timestamp);
console.log('Test 2 (Invalid signature rejected):', !result2 ? 'PASS ✅' : 'FAIL ❌');

// Test 3: Expired timestamp (> 300s)
const oldTimestamp = (Math.floor(Date.now() / 1000) - 400).toString();
const oldSig = crypto
  .createHmac('sha256', 'Jesusmonmaitre')
  .update(`${oldTimestamp}.${rawBody}`)
  .digest('hex');
const result3 = verifySasPayWebhookSignature(rawBody, oldSig, oldTimestamp);
console.log('Test 3 (Expired timestamp rejected):', !result3 ? 'PASS ✅' : 'FAIL ❌');

if (result1 && !result2 && !result3) {
  console.log('\nAll SasPay HMAC Webhook verification tests PASSED! 🚀');
} else {
  console.error('\nTests failed.');
  process.exit(1);
}
