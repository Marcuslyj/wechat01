const path = require('path')

exports.reply = async (ctx, next) => {
    const message = ctx.weixin

    let wechat = require('../wechat')
    let client = wechat.getWeChat()

    let reply = `不会解析`

    if (message.MsgType === 'text') {
        let content = message.Content
        reply = `Oh，你说的 ${content} 太复杂了，不会解析`

        if (content === '1') {
            reply = '大米'
        } else if (content === '2') {
            reply = '豆腐'
        } else if (content === '3') {
            reply = '咸蛋'
        } else if (content === '4') {
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
        } else if ("7" === content) {
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
        } else if ("15" === content) {
            let tempQrData = {
                expire_seconds: 604800,
                action_name: "QR_SCENE",
                action_info: {
                    scene: {
                        scene_id: 123,
                        scene_str: "临时二维码"
                    }
                }
            };
            let tempTicketData = await client.handle('createQrcode', tempQrData);
            let tempQr = client.showQrcode(tempTicketData.ticket);
            reply = tempTicketData.ticket ? tempQr : '15.公众号尚未通过微信认证，无法调用接口～';
        } else if ("16" === content) {
            let qrData = {
                action_name: "QR_LIMIT_SCENE",
                action_info: {
                    scene: {
                        scene_id: 321,
                    }
                }
            };
            let ticketData = await client.handle('createQrcode', qrData);
            let qr = client.showQrcode(ticketData.ticket);
            reply = ticketData.ticket ? qr : '16.公众号尚未通过微信认证，无法调用接口～';
        } else if ("17" === content) {
            let longUrl = "http://shang.qq.com/email/stop/email_stop.html?qq=3027677825&sig=083194b1effe19859c6add1d0e4e72e4b634b33db21a3d2c&tttt=1";
            let shortUrlData = await client.handle('createShortUrl', longUrl);
            reply = shortUrlData.short_url ? shortUrlData.short_url : '17.公众号尚未通过微信认证，无法调用接口～';
        } else if ("18" === content) {
            let semanticData = {
                query: '查一下明天从北京到上海的南航机票',
                city: '北京',
                category: 'flight,hotel',
                uid: message.FromUserName,
            };
            let searchData = await client.handle('semantic', semanticData);
            reply = !searchData.errcode ? JSON.stringify(searchData) : '18.公众号尚未通过微信认证，无法调用接口～';
        } else if ("19" === content) {
            let body = "编程语言难学吗？";
            let data = await client.handle('aiTranslate', body, 'zh_CN', 'en_US');
            reply = data.to_content ? data.to_content : '19.公众号尚未通过微信认证，无法调用接口～';
        } else if ("20" === content) {
            try {
                await client.handle('deleteMenu');
                let menu = {
                    button: [
                        {
                            name: '一级菜单',
                            sub_button: [
                                {
                                    name: '二级菜单_1',
                                    type: 'click',
                                    key: 'no_1',
                                },
                                {
                                    name: '二级菜单_2',
                                    type: 'click',
                                    key: 'no_2',
                                },
                                {
                                    name: '二级菜单_3',
                                    type: 'click',
                                    key: 'no_3',
                                },
                                {
                                    name: '二级菜单_4',
                                    type: 'click',
                                    key: 'no_4',
                                },
                                {
                                    name: '二级菜单_5',
                                    type: 'click',
                                    key: 'no_5',
                                },
                            ],
                        },
                        {
                            name: '分类',
                            type: 'view',
                            url: 'http://www.feihu1996.cn/',
                        },
                        {
                            name: `新菜单_${Math.random()}`,
                            type: 'click',
                            key: 'new_111',
                        },
                    ],
                };
                let data = await client.handle('createMenu', menu);
                reply = !data.errcode ? '自定义菜单创建成功~' : '20.公众号尚未通过微信认证，无法调用接口～';
            } catch (e) {
                console.log(e);
            }
        } else if ("21" === content) {
            try {
                await client.handle('deleteMenu');
                let menu = {
                    button: [
                        {
                            name: '发图扫码',
                            sub_button: [
                                {
                                    name: '系统拍照发图',
                                    type: 'pic_sysphoto',
                                    key: 'rselfmenu_1_0',
                                },
                                {
                                    name: '拍照或者相册发图',
                                    type: 'pic_photo_or_album',
                                    key: 'rselfmenu_1_1',
                                },
                                {
                                    name: '微信相册发图',
                                    type: 'pic_weixin',
                                    key: 'rselfmenu_1_2',
                                },
                                {
                                    name: '扫码推',
                                    type: 'scancode_push',
                                    key: 'rselfmenu_0_1',
                                },
                                {
                                    name: '扫码带提示',
                                    type: 'scancode_waitmsg',
                                    key: 'rselfmenu_0_0',
                                },
                            ],
                        },
                        {
                            name: '分类',
                            type: 'view',
                            url: 'http://www.feihu1996.cn/',
                        },
                        {
                            name: `其他`,
                            sub_button: [
                                {
                                    name: '点击',
                                    type: 'click',
                                    key: "no_110",
                                },
                                {
                                    name: '地理位置',
                                    type: "location_select",
                                    key: 'no_111'
                                },
                            ],
                        },
                    ],
                };
                let data = await client.handle('createMenu', menu);
                reply = !data.errcode ? '自定义菜单创建成功~' : '21.公众号尚未通过微信认证，无法调用接口～';
            } catch (e) {
                console.log(e);
            }
        } else if ("22" === content) {
            try {
                // await client.handle('deleteMenu');

                let menu = {
                    button: [
                        {
                            name: 'Photo&Scan',
                            sub_button: [
                                {
                                    name: '系统拍照发图',
                                    type: 'pic_sysphoto',
                                    key: 'rselfmenu_1_0',
                                },
                                {
                                    name: '拍照或者相册发图',
                                    type: 'pic_photo_or_album',
                                    key: 'rselfmenu_1_1',
                                },
                                {
                                    name: '微信相册发图',
                                    type: 'pic_weixin',
                                    key: 'rselfmenu_1_2',
                                },
                                {
                                    name: '扫码推',
                                    type: 'scancode_push',
                                    key: 'rselfmenu_0_1',
                                },
                                {
                                    name: '扫码带提示',
                                    type: 'scancode_waitmsg',
                                    key: 'rselfmenu_0_0',
                                },
                            ],
                        },
                        {
                            name: 'Category',
                            type: 'view',
                            url: 'http://www.feihu1996.cn/',
                        },
                        {
                            name: `Other`,
                            sub_button: [
                                {
                                    name: '点击',
                                    type: 'click',
                                    key: "no_110",
                                },
                                {
                                    name: '地理位置',
                                    type: "location_select",
                                    key: 'no_111'
                                },
                            ],
                        },
                    ],
                };
                let rules = {
                    // tag_id:"2",
                    sex: "1",
                    // country:"中国",
                    // province:"广东",
                    // city:"广州",
                    // client_platform_type:"2",
                    language: "zh_CN",
                };
                let data = await client.handle('createMenu', menu, rules);
                data = await client.handle('fetchMenu');
                reply = data.conditionalmenu ? '个性化菜单创建成功～' : '22.公众号尚未通过微信认证，无法调用接口～';
            } catch (e) {
                console.log(e);
            }
        }
    }

    if ('event' === message.MsgType) {
        reply = '接收事件推送～';
        if ("subscribe" === message.Event) {
            reply = `欢迎订阅～${message.EventKey ? '扫码关注，扫码参数：' + message.EventKey + '，Ticket：,' + message.Ticket : ''}`;
        }
        if ("SCAN" === message.Event) {
            reply = `扫描带参数二维码，二维码scene_id：${message.EventKey}，二维码的ticket：${message.Ticket}`;
        }
        if ("unsubscribe" === message.Event) {
            reply = `无情取消订阅～`;
        }
        if ("LOCATION" === message.Event) {
            reply = `您上报的位置是：${message.Latitude}-${message.Longitude}-${message.Precision}`;
        }
        if ("CLICK" === message.Event) {
            reply = `你点击了菜单的${message.EventKey}`;
        }
        if ("VIEW" === message.Event) {
            reply = `你点击了菜单链接： ${message.EventKey} ${message.MenuId}`;
        }
        if ("scancode_push" === message.Event || "scancode_waitmsg" === message.Event) {
            reply = `你扫码了：${message.ScanCodeInfo.ScanType} ${message.ScanCodeInfo.ScanResult}`;
        }
        if ("pic_sysphoto" === message.Event) {
            reply = `系统拍照发图：${message.SendPicsInfo.Count} ${JSON.stringify(message.SendPicsInfo.PicList)}`;
        }
        if ("pic_photo_or_album" === message.Event) {
            reply = `拍照或者相册发图：${message.SendPicsInfo.Count} ${JSON.stringify(message.SendPicsInfo.PicList)}`;
        }
        if ("pic_weixin" === message.Event) {
            reply = `微信相册发图：${message.SendPicsInfo.Count} ${JSON.stringify(message.SendPicsInfo.PicList)}`;
        }
        if ("location_select" === message.Event) {
            reply = `地理位置：${JSON.stringify(message.SendLocationInfo)}`;
        }
    }

    if ('image' === message.MsgType) {
        reply = `接收图片消息：${message.PicUrl ? message.PicUrl : ''}`;
    }

    ctx.body = reply

    await next()
}