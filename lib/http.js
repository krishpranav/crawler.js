const request = require('request');
const logger = require('log4js').getLogger('crawler.js');
let retryLimit = 10;

function http(option) {
    let interval = null;
    let retry = 0;
    let reqFinish = false;
    let inst = null;
    let timeout = 3000;
    if (option.retryLimit) {
        retryLimit = option.retryLimit;
    }

    logger.info(`plain http request invoke with url: ${option.url}`);
    return new Promise((resolve, reject) => {
        let cb = function _(err, resp, httpBody) {
            if (!reqFinish) {
                if (err) {
                    logger.warn(`base http method error and retry, error message: ${err.toString()}`);
                    inst = request.get(option, cb);
                }
                else {
                    reqFinish = true;
                    logger.debug(`plain http request finish: ${option.url}`);
                    resolve(httpBody);
                    clearInterval(interval);
                }
            }
        };
        inst = request.get(option, cb);
        interval = setInterval(() => {
            inst.abort();

            if (retry > retryLimit) {
                logger.error(`plain http request failed, url: ${option.url}`);
                return;
            }

            retry++;
            logger.debug(`plain http retry: ${retry}`);
            inst = request.get(option, cb);
        }, timeout);
    });
}

module.exports = http;