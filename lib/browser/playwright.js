const playwright = require('playwright');
const logger = require('log4js').getLogger('crawler.js');
const util = require('../util');
let browserInst = null;
let retryLimit = 10;

const launchConfig = {
    'chromium': {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: process.env.MOD !== 'browser',
        ignoreHTTPSErrors: true
    },
    'firefox': {
        headless: process.env.MOD !== 'browser',
        ignoreHTTPSErrors: true
    },
    'webkit': {
        headless: process.env.MOD !== 'browser',
        ignoreHTTPSErrors: true
    }
};

module.exports.request = async function (option) {
    if (!browserInst) {
        logger.debug(`[playwright] headless ${option.type} will launch`);
        if (process.env.EXE_PATH) {
            launchConfig[option.type].executablePath = process.env.EXE_PATH;
        }
        browserInst = await playwright[option.type].launch(launchConfig[option.type]);
        logger.info(`[playwright] headless ${option.type} launch`);
        process.on('exit', () =>{
            if (browserInst) {
                browserInst.close();
            }
        });
    }

    let page = await browserInst.newPage();
    logger.info(`[playwright] browser create new page for url: ${option.url}`);
    await page.setViewportSize(option.viewPort);
    await page.setExtraHTTPHeaders(option.headers);

    if (option.retryLimit) {
        retryLimit = option.retryLimit;
    }
    let requestSuccess = false;
    let retry = 0;
    const result = {};

    do {
        if (retry > retryLimit) {
            logger.error(`[playwright] browser retry out of limit, url: ${option.url}`);
            page.close();
            return 'crawl failed';
        }

        if (retry !== 0 && retry <= retryLimit) {
            logger.debug(`[playwright] browser request retry: ${retry}`);
        }

        try {
            logger.debug(`[playwright] browser will request for url: ${option.url}`);
            await page['goto'](option.url, {waitUntil: 'networkidle'});
            logger.debug('[playwright] page loaded');
            if (!!option.actions && Array.isArray(option.actions)) {
                for (let action of option.actions) {
                    switch (action.type) {
                        case 'waitAfterPageLoading':
                            if (Number.isInteger(action.value)) {
                                logger.info(`[playwright] browser action [waitAfterPageLoading]: time: ${action.value}`);
                                await util.waitFor(action.value);
                            }
                            else {
                                logger.fatal(`[playwright] browser request to url ${option.url} has invalid waitAfterPageLoading value ${action.targets}`);
                            }
                            break;
                        case 'clickSelectorElement':
                            if (typeof action.selector === 'string') {
                                logger.info(`[playwright] browser action [clickSelectorElement], dom: ${action.selector}`);
                                await page.evaluate((selectorStr) => {
                                    let elements = document.querySelectorAll(selectorStr);
                                    for (let element of elements) {
                                        element.click();
                                    }
                                }, action.selector);
                            }
                            else {
                                logger.fatal(`[playwright] browser request to url ${option.url} has invalid clickSelectorElement selector ${action.targets}`);
                            }
                            break;
                        case 'crawlTarget':
                            if (typeof action.targets === 'object' && action.targets instanceof Array) {
                                logger.info('[playwright] browser action [crawlTarget]');
                                let targetResult = await page.evaluate(util.extractFromHtml, action.targets);
                                Object.assign(result, targetResult);
                            }
                            else {
                                logger.fatal(`[playwright] browser request to url ${option.url} has invalid crawlingTarget targets ${action.targets}`);
                            }
                            break;
                        case 'waitForSelector':
                            if (typeof action.selector === 'string') {
                                logger.info(`[puppeteer] browser action [waitForSelector] finish, dom: ${action.selector}`);
                                await page.waitForSelector(action.selector);
                            }
                            else {
                                logger.fatal(`[puppeteer] browser action [waitForSelector] failed, dom: ${action.selector}`);
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
            logger.debug(`[playwright] browser request finish for url: ${option.url}`);
            requestSuccess = true;
        }
        catch (err) {
            requestSuccess = false;
            retry++;
            logger.fatal(`[playwright] browser request to url ${option.url} has error: ${err.toString()}`);
        }
    }
    while (!requestSuccess);

    logger.debug(`[playwright] browser extract targets: ${option.targets}`);
    let targetResult = await page.evaluate(util.extractFromHtml, option.targets);
    Object.assign(result, targetResult);
    let html = await page.content();
    logger.trace(`[playwright] browser get page content: ${option.url}, html: ${html}`);
    page.close();
    logger.debug('[playwright] browser page close');
    return {
        result,
        html
    };
};