const Koa = require('koa')
const wechat = require('./wechat-lib/middleware.js')
const config = require('./config/config.js')
const { initSchemas, connect } = require('./app/database/init.js')
const Router = require('koa-router')
const moment = require('moment')
const path = require('path')
const ejs = require('koa-ejs');



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
    });



    // 接入微信消息中间件
    require('./config/routes.js')(router)
    app.use(router.routes()).use(router.allowedMethods())

    app.listen(config.port)
    console.log(`listen: ${config.port}`);
})()


