const Koa = require('koa')
const wechat = require('./wechat-lib/middleware.js')
const config = require('./config/config.js')
const { reply } = require('./wechat/reply.js')

const app = new Koa()

app.use(wechat(config.wechat, reply))

app.listen(config.port)
console.log(`listen: ${config.port}`);


