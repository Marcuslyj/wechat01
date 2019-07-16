const sha1 = require('sha1')

module.exports = config => async (ctx, next) => {
    const { signature, timestamp, nonce, echostr } = ctx.query

    const token = config.token
    let str = [token, timestamp, nonce].sort().join('')

    const sha = sha1(str)

    if (ctx.method === 'GET') {
        if (sha === signature) {
            ctx.body = echostr
        } else {
            ctx.body = 'wrong'
        }
    } else if (ctx.method === 'POST') {
        if (sha !== signature) {
            return (ctx.body = 'Failed')
        }
    }
}