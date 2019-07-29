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
        } else if ("10" === content) {
            let newTag = await client.handle("createTag", "测试标签");

            await client.handle("updateTag", newTag.tag ? newTag.tag.id : 1, "还是测试标签");

            let tagsData = await client.handle('fetchTags');

            await client.handle('batchUsersTag', [message.FromUserName], newTag.tag ? newTag.tag.id : 1);

            let tagUsers = await client.handle('fetchTagUsers', newTag.tag ? newTag.tag.id : 1);
            let userTags = await client.handle('getUserTags', message.FromUserName);

            await client.handle('batchUsersTag', [message.FromUserName], newTag.tag ? newTag.tag.id : 1, true);

            await client.handle("delTag", newTag.tag ? newTag.tag.id : 1);

            reply = JSON.stringify(tagsData);
            if (!tagsData.tags) {
                reply = "尚未通过微信认证，无法调用接口～";
            }
        } else if ("11" == content) {
            let users = await client.handle('getUsers');
            if (!users.total) {
                reply = "尚未通过微信认证，无法调用接口～";
            } else {
                reply = `用户${users.total}个`
            }
        } else if ("12" === content) {
            let res = await client.handle('remarkUser', message.FromUserName, 'MENTOR');
            reply = `${!res.errcode ? '您的备注现在是MENTOR' : '12.尚未通过微信认证，无法调用接口～'}`;
        } else if ("13" === content) {
            let data = await client.handle('getUserInfo', message.FromUserName);
            reply = `${data.openid ? JSON.stringify(data) : '13.尚未通过微信认证，无法调用接口～'}`;
        } else if ("14" === content) {
            let data = await client.handle('batchUserInfo', user_list = [
                {
                    openid: message.FromUserName,
                    lang: 'zh_CN',
                },
            ]);
            reply = `${data.user_info_list ? JSON.stringify(data) : '14.公众号尚未通过微信认证，无法调用接口～'}`;
        }

        // 获取地理位置
        if ('event' === message.MsgType) {
            let reply = '';
            if ("LOCATION" === message.Event) {
                reply = `您上报的位置是：${message.Latitude}-${message.Longitude}-${message.Precision}`;
                context.body = reply;
            }
        }

        ctx.body = reply
    }
    await next()
}