function waitFor(ms) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
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
        for (let idx = 0; idx < doms.length; idx++) {
            if (target.type === 'text') {
                targetResult.push({
                    selector: target.selector,
                    text: doms[idx].textContent,
                    index: idx
                });
            }
            else if (target.type === 'attr') {
                targetResult.push({
                    selector: target.selector,
                    attrName: target.attrName,
                    attrValue: doms[idx].getAttribute(target.attrName),
                    index: idx
                });
            }
            else if (target.type === 'html') {
                targetResult.push({
                    selector: target.selector,
                    text: doms[idx].innerHTML,
                    index: idx
                });
            }
        }
        output[target.field] = targetResult;
    }
    return output;
}

module.exports.extractFromHtml = extractFromHtml;