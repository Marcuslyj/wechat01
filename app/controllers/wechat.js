const reply = require('../../wechat/reply');
const config = require('../../config/config.js');
const wechatMiddle = require('../../wechat-lib/middleware');
const { getOAuth } = require('../../wechat/index.js')




// 接入微信消息中间件
exports.hear = async (ctx, next) => {
    const middle = wechatMiddle(config.wechat, reply);
    await middle(ctx, next);
}

exports.oauth = async (ctx, next) => {
    let target = config.baseUrl + '/userinfo'
    let scope = 'snsapi_userinfo'
    let state = ctx.query.id

    let oauth = getOAuth()
    let url = oauth.getAuthorizeUrl(scope, target, state);

    console.log('====================================');
    console.log(url);
    console.log('====================================');

    ctx.redirect(url);
}

exports.userinfo = async (ctx, next) => {
    let oauth = getOAuth()

    const code = ctx.query.code;
    const tokenData = await oauth.fetchAccessToken(code);
    const userData = await oauth.getUserInfo(tokenData.access_token, tokenData.openid);

    ctx.body = userData;
}
