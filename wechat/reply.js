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
        } else if (content === '6') {
            let data = await client.handle('uploadMaterial', 'video', path.resolve(__dirname, '../6.mp4'), {
                type: 'video',
                description: '{"title": "吃个鸡？", "introduction": "吃个鸡？"}'
            })
            reply = {
                type: 'video',
                title: '回复的视频标题',
                description: '吃个鸡？',
                mediaId: data.media_id
            }
            if (!data.media_id) {
                reply = "尚未通过微信认证，无法调用接口～";
            }
        }
        else if ("7" === content) {
            let data = await client.handle('uploadMaterial', 'image', path.resolve(__dirname, '../2.jpg'), {
                type: 'image',
            });
            reply = {
                type: 'image',
                mediaId: data.media_id,
            };
            if (!data.media_id) {
                reply = "尚未通过微信认证，无法调用接口～";
            }
        } else if ("8" === content) {
            let data = await client.handle('uploadMaterial', 'image', path.resolve(__dirname, '../2.jpg'), {
                type: 'image',
            });
            let data2 = await client.handle('uploadMaterial', 'pic', path.resolve(__dirname, '../2.jpg'), {
                type: 'image',
            });
            let media = {
                articles: [
                    {
                        "title": "这是服务端上传的图文 1",
                        "thumb_media_id": data.media_id,
                        "author": "Angus",
                        "digest": "没有摘要",
                        "show_cover_pic": 1,
                        "content": "点击去往我的博客",
                        "content_source_url": "http://www.feihu1996.cn",
                    },
                    {
                        "title": "这是服务端上传的图文 2",
                        "thumb_media_id": data.media_id,
                        "author": "Angus",
                        "digest": "没有摘要",
                        "show_cover_pic": 1,
                        "content": "点击去往GitHub",
                        "content_source_url": "https://github.com/",
                    },
                ],
            };
            let uploadData = await client.handle('uploadMaterial', "news", media, {})

            let newMedia = {
                media_id: uploadData.media_id,
                index: 0,
                articles: {
                    "title": "这是服务端上传的图文 1",
                    "thumb_media_id": data.media_id,
                    "author": "Angus",
                    "digest": "没有摘要",
                    "show_cover_pic": 1,
                    "content": "点击去往我的博客",
                    "content_source_url": "http://www.feihu1996.cn",                    
                },
            }

            await client.handle('updateMaterial', uploadData.media_id, newMedia);
            
            let newsData = await client.handle('fetchMaterial', uploadData.media_id, 'news', {})

            let items = newsData.news_item
            let news = []

            if (items) {
                items.forEach(item => {
                    news.push({
                        title: item.title,
                        description: item.description,
                        picUrl: data2.url,
                        url: item.url,
                    })
                })
            }

            reply = news;

            if (!data.media_id) {
                reply = "尚未通过微信认证，无法调用接口～";
            }
        } else if ("9" === content) {
            let counts = await client.handle('countMaterial');
            let res = await Promise.all([
                client.handle('batchMaterial', {
                    type: 'image',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'video',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'voice',
                    offset: 0,
                    count: 10
                }),
                client.handle('batchMaterial', {
                    type: 'news',
                    offset: 0,
                    count: 10
                }),
            ]);

            reply = `
            image: ${res[0].total_count}
            video: ${res[1].total_count}
            voice: ${res[2].total_count}
            news: ${res[3].total_count}
            `
            if (!res[0].total_count) {
                reply = "尚未通过微信认证，无法调用接口～";
            }
        }

        ctx.body = reply
    }
    await next()
}