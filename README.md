# queuectl (Node.js + MongoDB)

A CLI-based background job queue system built with Node.js and MongoDB.

## Features
- Enqueue jobs with arbitrary shell commands
- Multiple worker processes
- Retry failed jobs with exponential backoff (delay = base^attempts)
- Dead Letter Queue (DLQ) after exhausting retries
- Persistent storage using MongoDB
- CLI with commands: enqueue, worker start/stop, status, list, dlq, config

## Quick Setup (Windows / Linux / macOS)
1. Install Node.js (v16+).
2. Install MongoDB locally and make sure it's running.
3. Clone or unzip this project into a folder.
4. Copy `.env.example` to `.env` and edit if needed.
5. Install dependencies:
   ```
   npm install
   ```
6. Make CLI executable (Linux/macOS):
   ```
   chmod +x bin/queuectl
   npm link
   ```
   On Windows you can use `node bin/queuectl` instead of `queuectl`.

## Usage Examples
- Enqueue a job:
  ```
  queuectl enqueue '{"command":"echo Hello && sleep 1","max_retries":3}'
  ```
- Start 3 workers:
  ```
  queuectl worker start --count 3
  ```
- Stop workers gracefully:
  ```
  queuectl worker stop
  ```
- Show status:
  ```
  queuectl status
  ```
- List pending jobs:
  ```
  queuectl list --state pending
  ```
- View DLQ:
  ```
  queuectl dlq list
  ```
- Retry a DLQ job:
  ```
  queuectl dlq retry <jobId>
  ```
- Set config:
  ```
  queuectl config set backoff_base 3
  ```

## Architecture Overview
- Jobs stored in MongoDB `jobs` collection.
- Workers atomically claim a pending job via `findOneAndUpdate` (state pending -> processing).
- Exponential backoff uses `next_run_at` = now + base^attempts seconds.
- When attempts > max_retries -> job state set to `dead` (DLQ).
- Workers are Node.js processes that execute commands with `child_process.exec`.
- Locking is achieved using atomic MongoDB update and `processing_by` + `locked_at`.

## Assumptions & Trade-offs
- Commands are executed on the host shell (security: do not enqueue untrusted commands).
- MongoDB is used for persistence; no Docker as requested.
- Worker registry is ephemeral (in-memory) per process; you may use system services for long-running workers.
- Basic graceful shutdown implemented.

## Testing
A simple test script `scripts/run_tests.js` simulates enqueueing jobs and starting a worker.
Run:
```
node scripts/run_tests.js
```

## Files of Interest
- `src/cli.js` - command-line interface (yargs)
- `src/queue.js` - core queue operations (enqueue, list, dlq)
- `src/worker_manager.js` - start/stop worker processes
- `src/worker.js` - actual worker loop
- `src/db.js` - mongoose connection and models

## How to run on your PC
1. Ensure MongoDB is running.
2. `npm install`
3. In one terminal start workers: `queuectl worker start --count 2`
4. In another terminal enqueue jobs: `queuectl enqueue '{"command":"echo hi && sleep 2","max_retries":2}'`
5. Use `queuectl status` / `queuectl list --state completed` to observe.

