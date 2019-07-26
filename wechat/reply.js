const path = require('path')

exports.reply = async (ctx, next) => {
    const message = ctx.weixin

    let wechat = require('../wechat')
    let client = wechat.getWeChat()

    if (message.MsgType === 'text') {
        let content = message.Content
        let reply = `Oh，你说的 ${content} 太复杂了，不会解析`

        if (content === '1') {
            reply = '大米'
        } else if (content === '2') {
            reply = '豆腐'
        } else if (content === '3') {
            reply = '咸蛋'
        }
        else if (content === '4') {
            let data = await client.handle('uploadMaterial', 'image', path.resolve(__dirname, '../2.jpg'))
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        } else if (content === '5') {
            let data = await client.handle('uploadMaterial', 'video', path.resolve(__dirname, '../6.mp4'))
            reply = {
                type: 'video',
                title: '回复的视频标题',
                description: '吃个鸡？',
                mediaId: data.media_id
            }
        }
        else if (content === '4') {
            reply = '没了'
        }

        ctx.body = reply
    }
    await next()
}