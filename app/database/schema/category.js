const mongoose = require('mongoose')

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

// 创建Schema
const CategorySchema = new Schema({
    // 分类名称
    name: {
        unique: true,
        type: String
    },
    movies: [{
        type: ObjectId,
        ref: 'Movie'
    }],
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
CategorySchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now()
    } else {
        this.meta.updateAt = Date.now()
    }
    next()
})


// 创建Model
mongoose.model('Category', CategorySchema)