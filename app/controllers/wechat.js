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


exports.checkWechat = async (ctx, next) => {
    const code = ctx.query.code
    const ua = ctx.headers['user-agent']
    // 所有的网页请求都会流经这个中间件，包括微信的网页访问
    // 针对非get请求，不走用户授权流程
    if ("GET" === ctx.method) {
        // 有code就是已授权
        if (code) {
            await next()
        } else if (isWechat(ua)) {
            let target = ctx.href
            let scope = 'snsapi_userinfo'
            let url = api.wechat.getAuthorizeUrl(scope, target, 'fromWechat')
            ctx.redirect(url)
        } else {
            await next()
        }
    } else {
        await next()
    }
}

exports.wechatRedirect = async (ctx, next) => {
    let { code, state } = ctx.query
    if (code && "fromWechat" === state) {
        const userData = await api.wechat.getUserInfo(code)
        let user = await api.wechat.saveWechatUser(userData)
        ctx.session.user = {
            _id: user._id,
            nickname: user.nickname,
            role: user.role,
        }
        ctx.state = Object.assign(ctx.state, {
            user: {
                _id: user._id,
                role: user.role,
                nickname: user.nickname,
            },
        })
    }
    await next()
}

function isWechat(ua) {
    return ua.indexOf('MicroMessenger') !== -1
}