const { execSync } = require('child_process');
const getCommandRetVal = command => {
    return execSync(command).toString('utf8').trim();
};

const commitMsgs = getCommandRetVal('git log').split('\n');

console.log(commitMsgs)