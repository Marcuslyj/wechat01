const config = require('../config/config.js')
const Wechat = require('../wechat-lib/index.js')
const mongoose = require('mongoose')
const WechatOAuth = require('../wechat-lib/oauth.js')

const Token = mongoose.model('Token')
const Ticket = mongoose.model('Ticket')

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
        },
        async getTicket() {
            return await Ticket.getTicket()
        },
        async saveTicket(data) {
            return await Ticket.saveTicket(data)
        },
    }
}

exports.getWeChat = () => new Wechat(wechatCfg.wechat)

exports.getOAuth = () => new WechatOAuth(wechatCfg.wechat)