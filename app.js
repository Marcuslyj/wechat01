const Koa = require('koa')
const wechat = require('./wechat-lib/middleware.js')
const config = require('./config/config.js')
const { reply } = require('./wechat/reply.js')
const { initSchemas, connect } = require('./app/database/init.js')


    ; (async () => {
        await connect(config.db)

        initSchemas()


        // 测试token的数据库存储
        const { test } = require('./wechat/index.js')
        await test()

        const app = new Koa()

        app.use(wechat(config.wechat, reply))

        app.listen(config.port)
        console.log(`listen: ${config.port}`);
    })()


