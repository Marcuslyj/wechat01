const config = require('../config/config.js')
const Wechat = require('../wechat-lib/index.js')

const wechatCfg = {
    wechat: {
        appID: config.wechat.appID,
        appSecret: config.wechat.appSecret,
        token: config.wechat.token
    }
}


    ; (async function () {
        const client = new Wechat(wechatCfg.wechat)

    })()