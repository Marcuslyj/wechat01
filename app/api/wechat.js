const { getWeChat } = require('../../wechat')
const { getOAuth } = require('../../wechat')
const { sign } = require('../../wechat-lib/util')

const wechat = getWeChat()

exports.getSignature = async (url) => {
    // 获取token
    const { access_token: token } = await wechat.fetchAccessToken()
    // 获取ticket
    const { ticket } = await wechat.fetchTicket(token);
    let params = sign(ticket, url);
    params.appId = wechat.appID;

    return params;
};

exports.getAuthorizeUrl = (scope, target, state) => {
    let oauth = getOAuth()
    let url = oauth.getAuthorizeUrl(scope, target, state)
    return url
};

exports.getUserInfo = async (code, lang = "zh_CN") => {
    let oauth = getOAuth()
    const tokenData = await oauth.fetchAccessToken(code)
    const userData = await oauth.getUserInfo(tokenData.access_token, tokenData.openid, lang)
    return userData
}