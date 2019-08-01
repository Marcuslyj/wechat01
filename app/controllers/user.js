const mongoose = require('mongoose')
const User = mongoose.model('User')

// 1.实现一个注册页面的控制器 showSignup
exports.showSignup = async (ctx, next) => {
    await ctx.render('pages/user/signup', {
        layout: 'layout',
        title: '注册页面',
    })
}
// 2.增加一个登录页面的控制器 showSignin
exports.showSignin = async (ctx, next) => {
    await ctx.render('pages/user/signin', {
        layout: 'layout',
        title: '登录页面',
    })
}
// 3.用户数据持久化 signup
exports.signup = async (ctx, next) => {
    let {
        email,
        password,
        nickname,
    } = ctx.request.body.user

    let user = await User.findOne({ email })

    if (user) {        
        return ctx.redirect('/user/signin');
    }

    user = new User({
        email,
        nickname,
        password,
    })

    // 1.有什么用? 2.注册需要存吗?不是登录?
    ctx.session.user = {
        _id: user._id,
        nickname: user.nickname,
    }

    await user.save()
    // 首页
    ctx.redirect('/')
};
// 4.增加一个登录的校验 signin
exports.signin = async (ctx, next) => {
    let {
        email,
        password,
    } = ctx.request.body.user

    let user = await User.findOne({ email })

    if (!user) {
        return ctx.redirect('/user/signup')
    }

    let isMatch = await user.comparePassword(password, user.password)

    if (isMatch) {
        ctx.session.user = {
            _id: user._id,
            nickname: user.nickname,
        }

        return ctx.redirect('/')
    }

    return ctx.redirect('/user/signin')
}
// 登出
exports.logout = async (ctx, next) => {
    ctx.session.user = null
    return ctx.redirect('/')
}

// 5.增加路由规则
// 6.增加两个ejs页面，注册、登录
// 7.koa-bodyparser