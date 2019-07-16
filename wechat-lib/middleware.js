const sha1 = require('sha1')
const getRawBody = require('raw-body')
const util = require('./util.js')

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

        const data = await getRawBody(ctx.req, {
            length: ctx.length,
            limit: '1mb',
            encoding: ctx.charset
        })

        const content = await util.parseXML(data)
        const message = util.formatMessage(content.xml)

        ctx.status = 200
        ctx.type = 'application/xml'
        let xml =
            `<xml>
                <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                <CreateTime>${parseInt(new Date().getTime() / 1000, 0)}</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[${message.Content}]]></Content>
            </xml>`

        ctx.body = xml
    }
}