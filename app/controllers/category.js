const mongoose = require('mongoose')
const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')
const api = require('../api')

// 0.电影分类Model创建
// 1.电影分类的录入页面
exports.show = async (ctx, next) => {
    let title = "分类录入"
    const { _id } = ctx.params
    let category = {};

    if (_id) {
        category = await api.movie.findCategoryById(_id)
        title = "分类修改"
    }

    await ctx.render('pages/category/category_admin', {
        layout: 'layout',
        title,
        category
    })
}
// 2.电影分类的创建持久化
exports.new = async (ctx, next) => {
    const { name, _id } = ctx.request.body.category
    let category

    if (_id) {
        category = await api.movie.findCategoryById(_id)
    }

    if (category) {
        category.name = name
    } else {
        category = new Category({ name })
    }

    await category.save()
    ctx.redirect('/admin/category/list')
}

// 3.电影分类的后台列表
exports.list = async (ctx, next) => {
    const categories = await api.movie.findCategories()

    await ctx.render('/pages/category/category_list', {
        layout: 'layout',
        title: '分类列表',
        categories
    })
}
// 4.对应的分类路由规则
// 5.对应的分类页面

// 删除分类数据
exports.del = async (ctx, next) => {
    let _id = ctx.query.id

    try {
        await Category.deleteOne({ _id })
        // 同步删除目录下的电影
        await Movie.remove({
            category: _id
        })


        ctx.body = {
            success: true,
        };
    } catch (error) {
        console.log(error)
        ctx.body = {
            success: false,
        }
    }
}