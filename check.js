const Koa = require('koa')
const sha1 = require('sha1')
const config = {
    wechat: {
        appID: 'wx1074acee288467cb',
        appsecret: '63a70c8bcd027b3d3f05314715b0e228',
        token: 'fsdfdv1f65d1b651gbg651'
    }
}


const app = new Koa()

app.use(async (ctx, next) => {
    const { signature, timestamp, nonce, echostr } = ctx.query

    const token = config.wechat.token
    let str = [token, timestamp, nonce].sort().join('')

    const sha = sha1(str)

    if (sha === signature) {
        ctx.body = echostr
    } else {
        ctx.body = 'wrong'
    }
})

app.listen(3008)
console.log(`listen: ${3008}`);


