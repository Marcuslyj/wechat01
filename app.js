const Koa = require('koa')
const config = require('./config/config.js')
const { initSchemas, connect } = require('./app/database/init.js')
const Router = require('koa-router')
const moment = require('moment')
const path = require('path')
const ejs = require('koa-ejs')
const bodyparser = require('koa-bodyparser')
const session = require('koa-session')
const mongoose = require('mongoose')
const static = require('koa-static')


    ; (async () => {
        // 连接数据库
        await connect(config.db)
        // 初始化MongooseSchema
        initSchemas()

        const app = new Koa()
        const router = new Router()

        // ejs模板引擎
        ejs(app, {
            root: path.resolve(__dirname, './app/views'),
            layout: false,
            viewExt: 'html',
            cache: false,
            debug: true
        })

        // ejs公共数据
        app.use(async (ctx, next) => {
            ctx.state = {
                ...ctx.state,
                moment
            }
            await next()
        })

        app.keys = ['wechat']
        app.use(session(app))
        app.use(bodyparser())
        //静态资源
        app.use(static(path.resolve(__dirname, './static')))

        // 植入两个中间件，做前置的微信环境检查、跳转、回调的用户数据存储和状态同步
        const wechatController = require('./app/controllers/wechat')
        app.use(wechatController.checkWechat)
        app.use(wechatController.wechatRedirect)


        // 登录信息中间件，   怎么运行的？？？？
        app.use(async (ctx, next) => {
            const User = mongoose.model('User')
            let user = ctx.session.user

            if (user && user._id) {
                user = await User.findOne({ _id: user._id })

                ctx.session.user = {
                    _id: user._id,
                    role: user.role,
                    nickname: user.nickname
                }
                ctx.state = {
                    ...ctx.state,
                    user: {
                        _id: user._id,
                        role: user.role,
                        nickname: user.nickname
                    }
                }
            } else {
                ctx.session.user = null
                // 不用清state？
            }
            await next()
        })

        // 接入微信消息中间件
        require('./config/routes.js')(router)
        app.use(router.routes()).use(router.allowedMethods())

        app.listen(config.port)
        console.log(`listen: ${config.port}`);
    })()


