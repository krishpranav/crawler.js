function waitFor(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolver(true);
        }, ms);
    });
}

module.exports.waitFor = waitFor;

function extractFromHtml(targets) {
    let output = {};
    let documentInst = this.document;
    for (let target of targets) {
        let doms = documentInst.querySelectorAll(target.selector);
        let targetResult = [];
    }

    return output;
}

module.exports.extractFromHtml = extractFromHtml;