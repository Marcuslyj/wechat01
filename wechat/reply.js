exports.reply = async (ctx, next) => {
    const message = ctx.weixin

    if (message.MsgType === 'text') {
        let content = message.Content
        let reply = `Oh，你说的 ${content} 太复杂了，不会解析`

        if (content === '1') {
            reply = '大米'
        } else if (content === '2') {
            reply = '豆腐'
        } else if (content === '3') {
            reply = '咸蛋'
        } else if (content === '4') {
            reply = '没了'
        }

        ctx.body = reply
    }
    await next()
}