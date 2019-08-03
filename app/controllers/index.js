const mongoose = require('mongoose')
const Category = mongoose.model('Category')

exports.homePage = async (ctx, next) => {
    // 查出电影数据
    const categories = await Category.find({}).populate({
        path: 'movies',
        select: '_id title poster',
        options: { limit: 8 }
    })

    await ctx.render('pages/index', {
        layout: 'layout',
        title: '首页',
        categories
    })
}