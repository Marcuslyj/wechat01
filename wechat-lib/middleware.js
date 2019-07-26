const sha1 = require('sha1')
const getRawBody = require('raw-body')
const util = require('./util.js')
const { reply } = require('../wechat/reply.js')

module.exports = config => async (ctx, next) => {
    const { signature, timestamp, nonce, echostr } = ctx.query

    // 微信认证
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
        // 接受原始数据的库，获取原始数据
        const data = await getRawBody(ctx.req, {
            length: ctx.length,
            // 体积超过会报错
            limit: '1mb',
            encoding: ctx.charset
        })
        // 解析原始数据（xml）成json对象
        const content = await util.parseXML(data)
        // 格式化数据
        const message = util.formatMessage(content.xml)
        // 赋值给ctx
        ctx.weixin = message

        // 自动回复中间件
        await reply.apply(ctx, [ctx, next])

        const replyBody = ctx.body
        const msg = ctx.weixin
        // 格式化成相应xml格式
        const xml = util.tpl(replyBody, msg)

        console.log('====================================');
        console.log(xml);
        console.log('====================================');

        ctx.status = 200
        ctx.type = 'application/xml'
        ctx.body = xml
    }
}