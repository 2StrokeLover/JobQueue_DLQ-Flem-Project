queuectl — Background Job Queue (Node.js + MongoDB)

queuectl is a command-line utility that manages background jobs using Node.js workers and MongoDB as storage.
You can submit tasks, run multiple workers, retry failures with exponential backoff, and inspect dead jobs via a built-in DLQ system.

⸻

⭐ Main Features
	•	Add jobs that run any shell/Node command
	•	Support for multiple parallel workers
	•	Automatic retries using exponential backoff (delay = base^attempts)
	•	Built-in Dead Letter Queue for tasks that exceed retry limits
	•	MongoDB-backed persistence so jobs survive restarts
	•	A simple CLI offering commands like: enqueue, worker start/stop, status, list, dlq, and config

⸻

⚙️ Quick Setup (Windows / macOS / Linux)
	1.	Install Node.js (v16 or newer)
	2.	Make sure MongoDB is installed and running
	3.	Clone or extract this project into a directory
	4.	Duplicate the sample environment file:

cp .env.example .env


	5.	Install project dependencies:

npm install


	6.	On macOS/Linux, make the CLI executable:

chmod +x bin/queuectl
npm link

On Windows, simply run the tool using:

node bin/queuectl



⸻

🧪 Examples

Add a new job

queuectl enqueue '{"command":"echo Hello && sleep 1","max_retries":3}'

Launch three workers

queuectl worker start --count 3

Gracefully stop all running workers

queuectl worker stop

Check overall system stats

queuectl status

Display only pending jobs

queuectl list --state pending

Dead Letter Queue operations

Show DLQ:

queuectl dlq list

Retry a specific DLQ job:

queuectl dlq retry <jobId>

Update configuration values

queuectl config set backoff_base 3


⸻

🏗 System Architecture
	•	All job documents are stored inside a MongoDB collection named jobs.
	•	Workers grab pending jobs using a single atomic MongoDB update (findOneAndUpdate) to avoid processing the same task twice.
	•	Exponential backoff is implemented by computing a future next_run_at = now + base^attempts.
	•	If a job exceeds its retry threshold, it is marked as dead and placed in the DLQ.
	•	Workers are separate Node.js processes that execute commands with child_process.exec.
	•	Simple locking is achieved through atomic updates and fields such as processing_by and locked_at.

⸻

📌 Design Choices & Limitations
	•	Each job runs arbitrary shell commands, so avoid submitting untrusted input.
	•	MongoDB is used directly for durability; no external queue system is required.
	•	Worker registration is kept in memory—long-running deployments should use system-level process managers.
	•	Basic graceful shutdown is supported but intentionally minimal.

⸻

🧭 Testing the Workflow

A test script is available at:

scripts/run_tests.js

Run it to simulate a few jobs and start a worker automatically:

node scripts/run_tests.js


⸻

📂 Important Source Files
	•	src/cli.js — defines the command-line interface
	•	src/queue.js — job management, listing, DLQ actions
	•	src/worker_manager.js — worker supervision logic
	•	src/worker.js — continuous worker loop that runs commands
	•	src/db.js — database schemas and MongoDB connection setup

⸻

🏃 Running a Simple Example
	1.	Start MongoDB
	2.	Install dependencies:

npm install


	3.	Start two workers in one terminal:

queuectl worker start --count 2


	4.	In another terminal, add a job:

queuectl enqueue '{"command":"echo hi && sleep 2","max_retries":2}'


	5.	Inspect results using:

queuectl status
queuectl list --state completed



⸻



