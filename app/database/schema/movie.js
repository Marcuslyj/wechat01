const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

// 创建Schema
const MovieSchema = new Schema({
    doubanId: String,
    title: String,
    director: String,
    language: String,
    country: String,
    summary: String,
    poster: String,
    year: Number,
    category: {
        type: ObjectId,
        ref: 'Category'
    },

    meta: {
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            default: Date.now(),
        },
    },
})

// 数据保存前执行代码
MovieSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    } else {
        this.meta.updateAt = Date.now()
    }
    next()
})


// 创建Model
mongoose.model('Movie', MovieSchema)