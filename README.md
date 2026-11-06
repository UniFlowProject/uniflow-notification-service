# uniflow-notification-service

**Status: Archived. Superseded by the serverless notifications stack.**

Notifications are now served by API Gateway (HTTP + WebSocket), Lambda, DynamoDB,
SQS/SNS and EventBridge Scheduler. The code lives in the `lambdas/` directory of the
central repository: https://github.com/UniFlowProject/uniflow

## Why it was replaced

- It was backed by MongoDB, an extra stateful dependency to run and pay for.
- Socket.IO (stateful, long-lived connections) does not fit API Gateway WebSocket.
- An always-on container costs more than pay-per-use Lambdas for this traffic.

## What it still offers

A NestJS + MongoDB + Socket.IO implementation of the notifications API, used only as a
local development stand-in by the root `docker-compose.dev.yml`.

## Local run

```bash
npm install
npm run start:dev
```

Requires `MONGODB_URI` pointing to a MongoDB instance.
