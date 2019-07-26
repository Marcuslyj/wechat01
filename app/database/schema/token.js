// schema
// model
// entity

const mongoose = require('mongoose')
const Schema = mongoose.Schema
// 创建Schema
const TokenSchema = new Schema({
    name: String, // accessToken
    token: String,
    expires_in: Number,
    meta: {
        createdAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            default: Date.now()
        },
    }
})

// 数据保存前执行代码
TokenSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    } else {
        this.meta.updatedAt = Date.now()
    }
    next()
})
// 定义静态方法
TokenSchema.statics = {
    // 查取本地数据库token
    async getAccessToken() {
        const token = await this.findOne({
            name: 'access_token',
        })

        if (token && token.token) {
            token.access_token = token.token
        }

        return token
    },
    // 保存token到本地数据库
    async saveAccessToken(data) {
        let token = await this.findOne({
            name: 'access_token',
        })

        if (token) {
            token.token = data.access_token
            token.expires_in = data.expires_in
        } else {
            token = new Token({
                name: 'access_token',
                token: data.access_token,
                expires_in: data.expires_in
            })
        }

        await token.save()

        return token
    }
}

// 创建Model
const Token = mongoose.model('Token', TokenSchema)