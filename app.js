const Koa = require('koa')
const wechat = require('./wechat-lib/middleware.js')
const config = require('./config/config.js')
const { initSchemas, connect } = require('./app/database/init.js')


    ; (async () => {
        // 连接数据库
        await connect(config.db)
        // 初始化MongooseSchema
        initSchemas()


        // 测试token的数据库存储
        const { test } = require('./wechat/index.js')
        await test()

        const app = new Koa()
        // 你问我答中间件
        app.use(wechat(config.wechat))

        app.listen(config.port)
        console.log(`listen: ${config.port}`);
    })()


