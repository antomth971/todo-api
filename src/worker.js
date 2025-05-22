// src/worker.js
const { Worker } = require('bullmq');
const IORedis = require('ioredis');

// Connect to Redis
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

// Worker on the "todoQueue" queue
const worker = new Worker(
    'todoQueue',
    async (job) => {
        // job.data = { id, title }
        console.log(`Processing job ${job.id} – creating task #${job.data.id}`);
        // Here: send email, logs, notifications, etc.
    },
    { connection }
);

// Completion and error events
worker.on('completed', (job) => console.log(`Job ${job.id} done.`));
worker.on('failed', (job, err) => console.error(`Job ${job.id} failed:`, err));
