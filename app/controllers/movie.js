const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const util = require('util')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

exports.savePoster = async (ctx, next) => {
    const posterData = ctx.request.body.files.uploadPoster
    const { path: filePath, name: fileName } = posterData

    if (fileName) {
        const data = await readFileAsync(filePath)
        const timestamp = Date.now()
        console.log('====================================');
        console.log(posterData.type);
        console.log('====================================');
        const type = posterData.type.split('/')[1]
        const poster = timestamp + '.' + type
        const newPath = path.resolve(__dirname, '../../', 'public/upload', poster)
        console.log('====================================');
        console.log(newPath);
        console.log('====================================');
        await writeFileAsync(newPath, data)
        ctx.poster = poster
    }
    await next()
}

// 0.电影Model创建
// 1.电影的录入页面
exports.show = async (ctx, next) => {
    const { _id } = ctx.params
    let movie = {};

    if (_id) {
        movie = await Movie.findOne({ _id })
    }

    let categories = await Category.find({})

    await ctx.render('pages/movie/movie_admin', {
        layout: 'layout',
        title: '后台电影页面',
        movie,
        categories
    })
}
// 2.电影的创建持久化
exports.new = async (ctx, next) => {
    let movieData = ctx.request.body.fields || {}
    let movie

    const categoryId = movieData.categoryId
    const categoryName = movieData.categoryName
    let category

    //自己上传的图片路径
    if (ctx.poster) {
        movieData.poster = ctx.poster
    }

    // 查出相应分类
    if (categoryId) {
        category = await Category.findOne({ _id: categoryId })
    } else if (categoryName) {
        // 没有就新增分类
        category = new Category({ name: categoryName })
        await category.save()
    }

    // 电影关联分类
    if (movieData._id) {
        movie = await Movie.findOne({ _id: movieData._id })
    }
    if (movie) {
        movie = _.extend(movie, movieData)
        movie.category = category._id
        // movie = {
        //     ...movie,
        //     ...movieData,
        //     category: category._id
        // }
    } else {
        delete movieData._id
        movieData.category = category._id
        movie = new Movie(movieData)
    }


    // category = Category.findOne({ _id: category._id })
    // 分类关联电影
    if (category) {
        category.movies = category.movies || []
        category.movies.push(movie._id)
        // 去重
        category.movies = Array.from(new Set(category.movies))

        await category.save()
    }

    await movie.save()
    ctx.redirect('/admin/movie/list')
}

// 3.电影的后台列表
exports.list = async (ctx, next) => {
    const movies = await Movie.find({}).populate('category', 'name')

    await ctx.render('/pages/movie/movie_list', {
        layout: 'layout',
        title: '电影的列表页面',
        movies
    })
}
// 4.对应的路由规则
// 5.对应的页面


// 删除电影数据
exports.del = async (ctx, next) => {
    let _id = ctx.query.id;

    try {
        await Movie.deleteOne({ _id });
        ctx.body = {
            success: true,
        };
    } catch (error) {
        console.log(error);
        ctx.body = {
            success: false,
        };
    }
}

// 详情页
exports.detail = async (ctx, next) => {
    let _id = ctx.params._id;
    let movie = await Movie.findOne({ _id });
    // await Movie.update({ _id }, { $inc: { pv: 1 } });
    await ctx.render("pages/movie/movie_detail", {
        title: '电影详情页面',
        movie
    });
}