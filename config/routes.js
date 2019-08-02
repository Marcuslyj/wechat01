const Wechat = require('../app/controllers/wechat')
const User = require('../app/controllers/user.js')
const Index = require('../app/controllers/index.js')
const Category = require('../app/controllers/category.js')

module.exports = router => {
    // 首页
    router.get('/', Index.homePage)

    // 用户注册登录
    router.get('/user/signup', User.showSignup)
    router.get('/user/signin', User.showSignin)
    router.post('/user/signup', User.signup)
    router.post('/user/signin', User.signin)
    router.get('/logout', User.logout)

    // 后台的用户列表页
    // 权限控制
    router.get('/admin/user/list', User.signinRequired, User.adminRequired, User.userlist)
    // 后台分类管理页面
    router.get('/admin/category', User.signinRequired, User.adminRequired, Category.show)
    router.post('/admin/category', User.signinRequired, User.adminRequired, Category.new)
    router.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)
    router.get('/admin/category/update/:_id', User.signinRequired, User.adminRequired, Category.show)
    router.post('/admin/category/update/:_id', User.signinRequired, User.adminRequired, Category.new)


    // 进入消息中间件
    router.get('/wx-hear', Wechat.hear)
    router.post('/wx-hear', Wechat.hear)

    // 跳到授权中间服务页面
    router.get('/wx-oauth', Wechat.oauth)
    // 通过code获取用户信息
    router.get('/userinfo', Wechat.userinfo)

    // 微信sdk调用页
    router.get('/sdk', Wechat.sdk)


}