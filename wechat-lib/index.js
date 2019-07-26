const fs = require('fs')
const request = require('request-promise')

const base = 'https://api.weixin.qq.com/cgi-bin/'

const api = {
    accessToken: base + 'token?grant_type=client_credential',
    // 临时上传
    temporary: {
        upload: base + 'media/upload?'
    },
    // 永久上传
    permanent: {
        upload: base + 'material/add_material?',
        uploadNews: base + 'material/add_news?',
        uploadNewsPic: base + 'material/upload_img?',
        fetch: base + 'material/get_material?',
        batch: base + 'material/batchget_material?',
        count: base + 'material/get_materialcount?',
        del: base + 'material/del_material?',
        update: base + 'material/update_news?',
    }
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
        }
        // 本地保存token
        await this.saveAccessToken(data)

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
            //??
            form = Object.assign(form, permanent)
        }
        if ('pic' === type) {
            url = api.permanent.uploadNewsPic
        }
        if ('news' === type) {
            url = api.permanent.uploadNews
            form.material
        } else {
            form.media = fs.createReadStream(material)
        }

        let uploadUrl = `${url}access_token=${token}`
        if (!permanent) {
            uploadUrl += `&type=${type}`
        } else {
            if (type !== 'news') {
                form.access_token = token;
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
            options.formData = form
        }

        return options
    }

    deleteMaterial(token, mediaId) {
        const form = {
            media_id = mediaId
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

    async handle(operation, ...args) {
        const token = await this.fetchAccessToken()
        const options = this[operation](token.access_token, ...args)
        const data = await this.request(options)
        return data
    }
}