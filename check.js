const Koa = require('koa')
const wechat = require('./wechat-lib/middleware.js')
const config = require('./config/config.js')


const app = new Koa()

app.use(wechat(config.wechat))

app.listen(config.port)
console.log(`listen: ${config.port}`);


