const { Queue } = require('bullmq');

const ragQueue = new Queue('rag-processing', {
	connection: {
		url: process.env.REDIS_URL,
		tls: {
			servername: new URL(process.env.REDIS_URL).hostname
		}
	},
	defaultJobOptions: {
		attempts: 3,
		backoff: {
			type: 'exponential',
			delay: 2000
		},
		removeOnComplete: true,
		removeOnFail: false
	}
});

module.exports = ragQueue;