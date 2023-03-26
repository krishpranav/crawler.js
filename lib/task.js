const uuidv4 = require('uuid/v4');

class Task {
    constructor(option) {
        this.id = uuidv4();
        this.spiderType = option.spiderType || 'plain'; 
        this.engineType = option.engineType || 'puppeteer';
        if (this.engineType === 'playwright') {
            this.browserType = option.browserType || 'chromium';
        }
        this.createTime = new Date().getTime();
        this.url = option.url;
        this.targets = option.targets;
        if (option.referInfo) {
            this.referInfo = option.referInfo;
        }
        if (this.spiderType === 'browser') {
            if (!!option.actions && Array.isArray(option.actions)) {
                this.actions = option.actions;
            }
            else {
                this.actions = [];
            }
        }
    }

    dump() {
        let ret = {
            id: this.id,
            spiderType: this.spiderType,
            createTime: this.createTime,
            url: this.url,
            targets: this.targets,
            actions: this.actions
        };
        if (this.referInfo) {
            ret.referInfo = this.referInfo;
        }
        return ret;
    }
}

module.exports = Task;