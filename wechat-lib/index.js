const fs = require('fs')
const request = require('request-promise')

const base = 'https://api.weixin.qq.com/cgi-bin/'

const api = {
    accessToken: base + 'token?grant_type=client_credential',
    temporary: {
        upload: base + 'media/upload?'
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
        const url = `${api.accessToken}&appid=${this.appID}&secret=${this.appSecret}`

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

        }
        form.media = fs.createReadStream(material)
        let uploadUrl = `${url}access_token=${token}&type=${type}`
        const options = {
            method: 'POST',
            url: uploadUrl,
            json: true,
            formData: form
        }
        return options
    }
    async handle(operation, ...args) {
        const token = await this.fetchAccessToken()
        console.log('====================================');
        console.log(token);
        console.log('====================================');
        const options = this[operation](token.access_token, ...args)
        const data = await this.request(options)
        console.log(data);
        return data
    }
}