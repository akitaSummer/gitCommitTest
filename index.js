const { execSync } = require('child_process');
const getCommandRetVal = command => {
    return execSync(command).toString('utf8').trim();
};

const commitMsgs = getCommandRetVal('git log').split('commit').map(msg => {
    if (!msg) return
    const msgArr = msg.split('\n')
    const hash = msgArr[0].trim()
    const author = msgArr[1].replace('Author:', '').trim()
    const date = msgArr[2].replace('Date:', '').trim()
    const content = msgArr.splice(4).reduce((prev))
    if (/^(doc:)/.test(msgArr[4].trim())) {}
    console.log(/^(doc)/.test(msgArr[4].trim()))
});

console.log(commitMsgs)