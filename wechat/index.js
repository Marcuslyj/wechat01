const config = require('../config/config.js')
const Wechat = require('../wechat-lib/index.js')
const mongoose = require('mongoose')

const Token = mongoose.model('Token')

const wechatCfg = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token,
        getAccessToken: async () => {
            const res = await Token.getAccessToken()
            return res
        },
        saveAccessToken: async (data) => {
            const res = await Token.saveAccessToken(data)
            return res
        }
    }
}

exports.getWeChat = () => new Wechat(wechatCfg.wechat)