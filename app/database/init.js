const mongoose = require('mongoose')
const glob = require('glob')
const path = require('path')

mongoose.Promise = global.Promise

exports.initSchemas = () => {
    glob
        .sync(path.resolve(__dirname, './schema', '**.*js'))
        .forEach(require)
}

exports.connect = db => new Promise((resolve, reject) => {
    mongoose.connect(db)
    mongoose.connection.on('disconnect', () => {
        console.log('数据库挂了吧');
    })
    mongoose.connection.on('error', err => {
        console.log(err);
    })
    mongoose.connection.on('open', () => {
        resolve()
        console.log('MongoDB connected');
    })
})