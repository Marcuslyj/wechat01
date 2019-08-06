const { getWeChat } = require('../../wechat')
const { getOAuth } = require('../../wechat')
const { sign } = require('../../wechat-lib/util')
const mongoose = require('mongoose')
const User = mongoose.model('User')

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

exports.saveWechatUser = async (userData) => {
    let query = {
        openid: userData.openid
    }

    if (userData.unionid) {
        query = {
            unionid: userData.unionid
        }
    }

    let user = await User.findOne(query)

    if (!user) {
        user = new User({
            openid: [userData.openid],
            unionid: userData.unionid,
            nickname: userData.nickname,
            province: userData.province,
            country: userData.country,
            city: userData.city,
            gender: userData.gender || userData.sex,
            // 虚拟邮箱
            email: (userData.unionid || userData.openid) + '@wx.com'
        })
        await user.save()
    }

    return user
}