const fs = require('fs')
const request = require('request-promise')

const base = 'https://api.weixin.qq.com/cgi-bin/'
const mpBase = 'https://mp.weixin.qq.com/cgi-bin/'
const semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?'

const api = {
    accessToken: base + 'token?grant_type=client_credential',
    // 临时上传
    temporary: {
        upload: base + 'media/upload?',
        fetch: base + 'media/get?',
    },
    // 永久上传
    permanent: {
        upload: base + 'material/add_material?',
        uploadNews: base + 'material/add_news?',
        uploadNewsPic: base + 'material/uploadimg?',

        fetch: base + 'material/get_material?',
        batch: base + 'material/batchget_material?',
        count: base + 'material/get_materialcount?',
        del: base + 'material/del_material?',
        update: base + 'material/update_news?',
    },
    tag: {
        create: base + 'tags/create?',
        fetch: base + 'tags/get?',
        update: base + 'tags/update?',
        del: base + 'tags/delete?',
        fetchUsers: base + 'user/tag/get?',
        batchTag: base + 'tags/members/batchtagging?',
        batchUnTag: base + 'tags/members/batchuntagging?',
        getUserTags: base + 'tags/getidlist?',
    },
    user: {
        fetch: base + 'user/get?',
        remark: base + 'user/info/updateremark?',
        info: base + 'user/info?',
        batch: base + 'user/info/batchget?',
    },
    qrcode: {
        create: base + 'qrcode/create?',
        show: mpBase + 'showqrcode?',
    },
    shortUrl: {
        create: base + 'shorturl?',
    },
    semanticUrl,
    ai: {
        translate: base + 'media/voice/translatecontent?',
    },
}

module.exports = class Wechat {
    constructor(opts) {
        this.opts = { ...opts }
        this.appID = opts.appID
        this.appSecret = opts.appSecret
        this.getAccessToken = opts.getAccessToken
        this.saveAccessToken = opts.saveAccessToken

        this.fetchAccessToken()
    }
    // 请求方法
    async request(options) {
        options = {
            ...options,
            json: true
        }

        try {
            const res = await request(options)

            return res
        } catch (error) {
            console.log(error)
        }
    }
    // 获取token
    async fetchAccessToken() {
        // 获取数据库token,
        let data = await this.getAccessToken()
        // 检查数据库token是否过期
        if (!this.isValidToken(data)) {
            // 过期重新获取
            data = await this.updateAccessToken()
            // 本地保存token
            await this.saveAccessToken(data)
        }


        return data
    }
    // 向微信端请求token
    async updateAccessToken() {
        let url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

        const data = await this.request({ url })
        const now = new Date().getTime()
        const expiresIn = now + (data.expires_in - 20) * 1000

        data.expires_in = expiresIn

        return data
    }
    // 检查token是否过期
    isValidToken(data) {
        if (!data || !data.expires_in) {
            return false
        }

        const expiresIn = data.expires_in
        const now = new Date().getTime()

        if (now < expiresIn) {
            return true
        } else {
            return false
        }
    }
    // 上传材料
    uploadMaterial(token, type, material, permanent = false) {
        let form = {}
        let url = api.temporary.upload

        if (permanent) {
            url = api.permanent.upload
            form = Object.assign(form, permanent)
        }
        if ('pic' === type) {
            url = api.permanent.uploadNewsPic
        }
        if ('news' === type) {
            url = api.permanent.uploadNews
            form = material
        } else {
            form.media = fs.createReadStream(material)
        }

        let uploadUrl = `${url}access_token=${token}`
        if (!permanent) {
            uploadUrl += `&type=${type}`
        } else {
            if (type !== 'news') {
                form.access_token = token;
                // 其他永久素材（第三个接口）
                if (type !== 'pic') {
                    uploadUrl += `&type=${type}`
                }
            }
        }

        const options = {
            method: 'POST',
            url: uploadUrl,
            json: true,
        }

        if ('news' === type) {
            options.body = form
        } else {
            //  要求formdata
            options.formData = form
        }

        return options
    }

    deleteMaterial(token, mediaId) {
        const form = {
            media_id: mediaId
        }
        let url = `${api.permanent.del}access_token=${token}&media_id=${mediaId}`

        return {
            method: 'POST',
            url,
            body: form
        }
    }

    updateMaterial(token, mediaId, news) {
        let form = {
            media_id: mediaId
        }
        form = Object.assign(form, news)
        let url = `${api.permanent.update}access_token=${token}&media_id=${mediaId}`
        return {
            method: 'POST',
            url,
            body: form
        }
    }

    countMaterial(token) {
        let url = `${api.permanent.count}access_token=${token}`;
        return {
            url
        };
    }

    batchMaterial(token, options) {
        options.type = options.type || 'image';
        options.offset = options.offset || 0;
        options.count = options.count || 10;

        let url = `${api.permanent.batch}access_token=${token}`;

        return {
            method: 'POST',
            url,
            body: options,
        };
    }
    // 获取素材
    fetchMaterial(token, mediaId, type, permanent) {
        let form = {}
        let fetchUrl = api.temporary.fetch
        if (permanent) {
            fetchUrl = api.permanent.fetch
        }

        let url = `${fetchUrl}access_token=${token}`
        const options = {
            method: 'POST',
            url,
        }

        if (permanent) {
            form.media_id = mediaId
            form.access_token = token
            options.body = form
        } else {
            if ('video' === type) {
                url = url.replace("https", "http")
                url += "&media_id=" + mediaId
            }
        }
        return options
    }

    createTag(token, name) {
        let body = {
            tag: {
                name,
            },
        };
        let url = `${api.tag.create}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    fetchTags(token) {
        let url = `${api.tag.fetch}access_token=${token}`;
        return {
            url,
        };
    }
    updateTag(token, id, name) {
        let body = {
            tag: {
                id,
                name,
            },
        };
        let url = `${api.tag.update}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    delTag(token, id) {
        let body = {
            tag: {
                id,
            },
        };
        let url = `${api.tag.del}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    fetchTagUsers(token, tagId, openId) {
        let body = {
            tagid: tagId,
            next_openid: openId || '',
        };
        let url = `${api.tag.fetchUsers}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    batchUsersTag(token, openIdList, tagId, unTag) {
        let body = {
            openid_list: openIdList,
            tagid: tagId,
        };
        let url = `${!unTag ? api.tag.batchTag : api.tag.batchUnTag}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    getUserTags(token, openId) {
        let body = {
            openid: openId
        };
        let url = `${api.tag.getUserTags}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    getUsers(token, openId) {
        let url = `${api.user.fetch}access_token=${token}&next_openid=${openId || ''}`;
        return {
            url,
        };
    }
    // 备注用户名
    remarkUser(token, openId, remark) {
        let body = {
            openid: openId,
            remark: remark,
        };
        let url = `${api.user.remark}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    // 获取用户基本信息
    getUserInfo(token, openId, lang = "zh_CN") {
        let url = `${api.user.info}access_token=${token}&openid=${openId}&lang=${lang}`;
        return {
            url,
        };
    }
    // 批量获取用户基本信息
    batchUserInfo(token, user_list) {
        let body = {
            user_list,
        };
        let url = `${api.user.batch}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    //创建临时二维码
    createQrcode(token, qr) {
        let url = `${api.qrcode.create}access_token=${token}`;
        let body = qr;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    showQrcode(ticket) {
        let url = `${api.qrcode.show}ticket=${encodeURI(ticket)}`;
        return url;
    }

    createShortUrl(token, longUrl, action = "long2short") {
        let body = {
            action,
            long_url: longUrl,
        };
        let url = `${api.shortUrl.create}access_token=${token}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }
    // 语义
    semantic(token, semanticData) {
        let url = `${api.semanticUrl}access_token=${token}`;
        semanticData.appid = this.appID;
        return {
            method: 'POST',
            url,
            body: semanticData,
        };
    }
    // 翻译
    aiTranslate(token, body, lfrom, lto) {
        let url = `${api.ai.translate}access_token=${token}&lfrom=${lfrom}&lto=${lto}`;
        return {
            method: 'POST',
            url,
            body,
        };
    }

    // 操作处理函数
    async handle(operation, ...args) {
        const token = await this.fetchAccessToken()
        const options = this[operation](token.access_token, ...args)

        const data = await this.request(options)
        return data
    }
}