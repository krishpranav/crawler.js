const redis = require('./redis');
const logger = require('log4js').getLogger('crawler.js');

class Producer {
    constructor(option) {
        this.channel = option.channel;
        this.sendCounter = 0;
        this.redisConf = option.dbConf.redis;
        redis.connect({
            host: this.redisConf.host,
            port: this.redisConf.port,
            password: this.redisConf.password
        });
    }

    async sendTasksToQueue(tasks) {
        for (let task of tasks) {
            generateTask(task);
        }
        return true;
    }

    async generateTask(task) {
        await redis.rpush({
            tableName: 'queue:' + this.channel,
            value: task
        });
        logger.info(`task send to queue: ${task.url}`);
        return true;
    }
}

module.exports = Producer;