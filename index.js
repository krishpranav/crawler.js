const log4js = require('log4js');
const path = require('path');

let configOption = {
    appenders: {
        crawler: {}
    },
    categories: {
        default: {
            appenders: ['crawler.js']
        }
    }
};
if (!!process.env.MOD) {
    configOption.appenders.crawler = {
        type: 'stdout'
    };
    if (process.env.MOD === 'browser') {
        configOption.categories.default.level = 'trace';
    }
    else {
        configOption.categories.default.level = process.env.MOD;
    }
}
else {
    let curFile = require.main.filename.split('/');
    curFile = curFile[curFile.length - 1];
    if (/\.js$/.test(curFile)) {
        curFile = curFile.replace(/\.js$/, '')
    }
    configOption.appenders.crawler = {
        type: 'file',
        filename: path.resolve(process.env.HOME, `.crawler/${curFile}.log`)
    };
    configOption.categories.default.level = 'info';
}

log4js.configure(configOption);

module.exports = require('./lib/crawler');