const { execSync } = require('child_process');
const fs = require('fs')
const getCommandRetVal = command => {
    return execSync(command).toString('utf8').trim();
};

const REPLACEFLAG = 'REPLACEFLAG_424E6E9ACC1DD'

const msgsStr = getCommandRetVal('git log -2').replace(/(commit [a-z0-9]{40})/g, (s, $1) => {
    const [, hash] = $1.split(' ')
    return REPLACEFLAG + ' ' + hash
})

// [{
//         hash: '4bfa7e230aa77a174f41197f07419671951896a1',
//         author: 'akitasummer <644171127@qq.com>',
//         date: 'Wed Nov 25 22:41:58 2020 +0800',
//         content: 'doc:\nversion: 1.0.1,\ndescription: this is a test\n\n'
//     },
//     {
//         hash: '3c457319b6ea35526ccd7d7c761f2fc2066cc0e6',
//         author: 'akitasummer <644171127@qq.com>',
//         date: 'Wed Nov 25 22:03:39 2020 +0800',
//         content: 'test:\ncommit\nurl: https://123.com'
//     }
// ]
const commitMsgs = msgsStr
    .split(REPLACEFLAG)
    .map(msg => {
        if (!msg) return
        const msgArr = msg.split('\n')
        const hash = msgArr[0].trim()
        const author = msgArr[1].replace('Author:', '').trim()
        const date = msgArr[2].replace('Date:', '').trim()
        const content = msgArr.splice(4).map(item => item.trim()).reduce((prev, item) => prev ? prev + '\n' + item : item, '')
        return {
            hash,
            author,
            date,
            content
        }
    }).filter(item => item)

if (/^(doc:)/.test(commitMsgs[0].content)) {
    const content = {}
        // 'doc:\nversion: 1.0.1,\ndescription: this is a test\n\n' -> 'version: 1.0.1,description: this is a test' -> { version: '1.0.1', description: 'this is a test' }
    commitMsgs[0].content.replace(/\n/g, '').replace(/^doc:/, '').split(',').forEach((item) => {
        if (!item) return
        const [key, value] = item.split(':').map(i => i.trim())
        content[key] = value
    })
    console.log(content)
    const path = `./doc/version_${content.version}.json`
    try {
        const newFile = JSON.parse(fs.readFileSync(path, 'utf-8'))
        for (let i in content) {
            newFile[i] = content[i]
        }
        fs.writeFileSync(path, JSON.stringify(newFile), { encoding: 'utf8' })
    } catch (e) {
        fs.writeFileSync(path, JSON.stringify(content), { encoding: 'utf8' })
    }
    if (commitMsgs.length > 1) {
        // git reset --soft
        execSync(`git reset --soft ${commitMsgs[1].hash}`)
    } else {
        execSync(`git update-ref -d HEAD`)
    }
    execSync(`git add .`)
        // git commit -m "doc: version: 1.0.1,description: this is a test"
    execSync(`git commit -m "${commitMsgs[0].content.replace(/^doc:\n/, 'Doc: ').replace(/\n/g, '')}"`)
} else {
    console.log('no doc')
}