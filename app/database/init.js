const mongoose = require('mongoose')
const glob = require('glob')
const path = require('path')

mongoose.Promise = global.Promise

exports.initSchemas = () => {
    glob
        .sync(path.resolve(__dirname, './schema', '**.*js'))
        .forEach(require)
}
// 链接数据库
exports.connect = db => {
    let maxConnectTimes = 0

    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV !== 'production') {
            mongoose.set('debug', true)
        }

        mongoose.connect(db)
        mongoose.connection.on('disconnect', () => {
            maxConnectTimes++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)

            } else {
                throw new Error('数据库挂了吧')
            }
        })
        mongoose.connection.on('error', err => {
            maxConnectTimes++
            if (maxConnectTimes < 5) {
                mongoose.connect(db)

            } else {
                throw new Error('数据库挂了吧')
            }
        })
        mongoose.connection.on('open', () => {
            resolve()
            console.log('MongoDB connected');
        })
    })
}