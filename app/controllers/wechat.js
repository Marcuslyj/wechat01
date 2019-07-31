const reply = require('../../wechat/reply');
const config = require('../../config/config.js');
const wechatMiddle = require('../../wechat-lib/middleware');
const api = require('../api')

exports.sdk = async (ctx, next) => {
    const url = ctx.href
    const params = await api.wechat.getSignature(url)
    await ctx.render('wechat/sdk', {
        ...params,
        layout: 'layout',
        title: 'sdk'
    })
}


// 接入微信消息中间件
exports.hear = async (ctx, next) => {
    const middle = wechatMiddle(config.wechat, reply);
    await middle(ctx, next);
}

exports.oauth = async (ctx, next) => {
    let target = config.baseUrl + '/userinfo'
    let scope = 'snsapi_userinfo'
    let state = ctx.query.id

    let url = api.wechat.getAuthorizeUrl(scope, target, state);

    ctx.redirect(url);
}

exports.userinfo = async (ctx, next) => {
    const code = ctx.query.code;
    const userData = await api.wechat.getUserInfo(code)

    ctx.body = userData;
}

