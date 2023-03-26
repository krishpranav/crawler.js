const redis = require('redis');
const logger = require('log4js').getLogger('crawler.js');
const tableNamePrefix = 'crawler:';
let clientInst = null;

module.exports.connect = function (option) {
    clientInst = redis.createClient({
        host: option.host,
        port: option.port,
        password: option.password
    });
    process.on('exit', () =>{
        logger.trace('redis connect close');
        clientInst.quit();
    });
};

module.exports.quit = function () {
    logger.trace('redis connect close');
    clientInst.quit();
};

module.exports.lpop = function (option) {
    return new Promise((resolve, reject) => {
        let table = tableNamePrefix + option.tableName;
        clientInst.lpop(table, (err, rel) => {
            if (err === null) {
                logger.trace(`redis lpop: ${rel}`);
                try {
                    let output = JSON.parse(rel);
                    resolve(output);
                }
                catch (err) {
                    logger.error(`redis lpop json parse error: ${err}`);
                }
            }
            else {
                logger.fatal(`redis lpop with option ${option.toString()} error: ${err}`);
            }
        });
    });
};

module.exports.llen = function (option) {
    return new Promise((resolve, reject) => {
        let table = tableNamePrefix + option.tableName;
        clientInst.llen(table, (err, rel) => {
            if (err === null) {
                logger.trace(`redis llen: ${rel}`);
                resolve(rel);
            }
            else {
                logger.fatal(`redis llen with option ${option.toString()} error: ${err}`);
            }
        });
    });
};

module.exports.rpush = function (option) {
    return new Promise((resolve, reject) => {
        let table = tableNamePrefix + option.tableName;
        let input = JSON.stringify(option.value);
        clientInst.rpush(table, input, (err, rel) => {
            if (err === null) {
                logger.trace('redis rpush successed');
                resolve(rel);
            }
            else {
                logger.fatal(`redis rpush with option ${option.toString()} error: ${err}`);
            }
        });
    });
};

module.exports.hget = function (option) {
    return new Promise((resolve, reject) => {
        let table = tableNamePrefix + option.tableName;
        clientInst.hget(table, option.key, (err, rel) => {
            if (err === null) {
                logger.trace(`redis hget: ${rel}`);
                try {
                    let output = JSON.parse(rel);
                    resolve(output);
                }
                catch (err) {
                    logger.error(`redis hget json parse error: ${err}`);
                }
            }
            else {
                logger.fatal(`redis hget with option ${option.toString()} error: ${err}`);
            }
        });
    });
};

module.exports.hgetall = function (option) {
    return new Promise((resolve, reject) => {
        let table = tableNamePrefix + option.tableName;
        clientInst.hgetall(table, (err, rel) => {
            if (err === null) {
                logger.trace(`redis hgetall: ${rel}`);
                try {
                    let output = [];
                    for (let i in rel) {
                        output.push(JSON.parse(rel[i]));
                    }
                    resolve(output);
                }
                catch (err) {
                    logger.error(`redis hgetall json parse error: ${err}`);
                }
            }
            else {
                logger.fatal(`redis hgetall with option ${option.toString()} error: ${err}`);
            }
        });
    });
};

module.exports.hset = function (option) {
    return new Promise((resolve, reject) => {
        let table = tableNamePrefix + option.tableName;
        let input = JSON.stringify(option.value);
        clientInst.hset(table, option.key, input, (err, rel) => {
            if (err === null) {
                logger.trace('redis hset successed');
                resolve(rel);
            }
            else {
                logger.fatal(`redis hset with option ${option.toString()} error: ${err}`);
            }
        });
    });
};

module.exports.hdel = function (option) {
    return new Promise((resolve, reject) => {
        let table = tableNamePrefix + option.tableName;
        clientInst.hdel(table, option.key, (err, rel) => {
            if (err === null) {
                logger.trace('redis hdel successed');
                resolve(rel);
            }
            else {
                logger.fatal(`redis del with option ${option.toString()} error: ${err}`);
            }
        });
    });
};