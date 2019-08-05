const Wechat = require('../app/controllers/wechat')
const User = require('../app/controllers/user.js')
const Index = require('../app/controllers/index.js')
const Category = require('../app/controllers/category.js')
const Movie = require('../app/controllers/movie.js')
const koaBody = require('koa-body')

module.exports = router => {
    // 首页
    router.get('/', Index.homePage)

    // 用户注册登录
    router.get('/user/signup', User.showSignup)
    router.get('/user/signin', User.showSignin)
    router.post('/user/signup', User.signup)
    router.post('/user/signin', User.signin)
    router.get('/logout', User.logout)

    // 搜索
    router.get('/results', Movie.search)

    // 后台的用户列表页
    // 权限控制
    router.get('/admin/user/list', User.signinRequired, User.adminRequired, User.userlist)
    router.delete('/admin/user/update', User.signinRequired, User.adminRequired, User.del)

    // 后台分类管理页面
    router.get('/admin/category', User.signinRequired, User.adminRequired, Category.show)
    router.post('/admin/category', User.signinRequired, User.adminRequired, Category.new)
    router.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list)
    router.get('/admin/category/update/:_id', User.signinRequired, User.adminRequired, Category.show)
    router.post('/admin/category/update/:_id', User.signinRequired, User.adminRequired, Category.new)
    router.delete('/admin/category/update', User.signinRequired, User.adminRequired, Category.del)

    // 后台电影管理页面
    router.get('/admin/movie', User.signinRequired, User.adminRequired, Movie.show)
    router.post('/admin/movie', User.signinRequired, User.adminRequired, koaBody({ multipart: true }), Movie.savePoster, Movie.new)
    router.get('/admin/movie/list', User.signinRequired, User.adminRequired, Movie.list)
    router.get('/admin/movie/update/:_id', User.signinRequired, User.adminRequired, Movie.show)
    router.post('/admin/movie/update/:_id', User.signinRequired, User.adminRequired, Movie.new)
    router.delete('/admin/movie/update', User.signinRequired, User.adminRequired, Movie.del)
    router.get('/admin/movie/detail/:id', User.signinRequired, User.adminRequired, Movie.detail)


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