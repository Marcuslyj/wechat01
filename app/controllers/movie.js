const mongoose = require('mongoose')
const Movie = mongoose.model('Movie')
const Category = mongoose.model('Category')
const Comment = mongoose.model('Comment')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const util = require('util')
const api = require('../api')

const readFileAsync = util.promisify(fs.readFile)
const writeFileAsync = util.promisify(fs.writeFile)

exports.savePoster = async (ctx, next) => {
    const posterData = ctx.request.body.files.uploadPoster
    const { path: filePath, name: fileName } = posterData

    if (fileName) {
        const data = await readFileAsync(filePath)
        const timestamp = Date.now()
        const type = posterData.type.split('/')[1]
        const poster = timestamp + '.' + type
        const newPath = path.resolve(__dirname, '../../', 'public/upload', poster)
        await writeFileAsync(newPath, data)
        ctx.poster = poster
    }
    await next()
}

// 0.电影Model创建
// 1.电影的录入页面
exports.show = async (ctx, next) => {
    let title = '电影录入'
    const { _id } = ctx.params
    let movie = {};

    if (_id) {
        movie = await api.movie.findMovieById(_id)
        title = '电影修改'
    }

    let categories = await api.movie.findCategories()

    await ctx.render('pages/movie/movie_admin', {
        layout: 'layout',
        title,
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
        category = await api.movie.findCategoryById(categoryId)
    } else if (categoryName) {
        category = await api.movie.findCategory({ name: categoryName })
        if (!category) {
            // 没有就新增分类
            category = new Category({ name: categoryName })
            await category.save()
        }
    }

    // 电影关联分类
    if (movieData._id) {
        movie = await api.movie.findMovieById(movieData._id)
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
    const movies = await api.movie.findMoviesWidthPopulate('category', 'name')

    await ctx.render('/pages/movie/movie_list', {
        layout: 'layout',
        title: '电影列表',
        movies
    })
}
// 4.对应的路由规则
// 5.对应的页面


// 删除电影数据
exports.del = async (ctx, next) => {
    let _id = ctx.query.id

    // 同步删除分类下的该电影
    const cat = await api.movie.findCategory({
        movies: {
            $in: [_id]
        }
    })

    if (cat && cat.movies && cat.movies.length) {
        const index = cat.movies.indexOf(_id)
        cat.movies.splice(index, 1)
        await cat.save()
    }

    // 删除电影
    try {
        await Movie.deleteOne({ _id })
        ctx.body = {
            success: true,
        }
    } catch (error) {
        console.log(error)
        ctx.body = {
            success: false,
        }
    }
}

// 详情页
exports.detail = async (ctx, next) => {
    let _id = ctx.params.id
    let movie = await api.movie.findMovieById(_id)
    // 查评论
    let comments = await Comment.find({
        movie: _id,
    })
        .populate('from', '_id nickname')
        .populate('replies.from replies.to', '_id nickname');
    // pv加一操作
    await Movie.update({ _id }, { $inc: { pv: 1 } })
    await ctx.render("pages/movie/movie_detail", {
        layout: 'layout',
        title: '电影详情',
        movie,
        comments
    });
}

// 电影搜索功能
exports.search = async (ctx, next) => {
    const { cat: catId, q, p } = ctx.query
    const page = parseInt(p, 10) || 0
    const count = 2
    const index = page * count

    if (catId) {
        const categories = await api.movie.searchByCategory(catId)
        const category = categories[0]
        let movies = category.movies || []
        let results = movies.slice(index, index + count)

        await ctx.render('pages/search/result', {
            layout: 'layout',
            title: '分类搜索结果',
            keyword: category.name,
            currentPage: page + 1,
            query: 'cat=' + catId,
            totalPage: Math.ceil(movies.length / count),
            movies: results
        })
    } else {
        let movies = await api.movie.searchMoviesByKeyword(q)
        let results = movies.slice(index, index + count)

        await ctx.render('pages/search/result', {
            layout: 'layout',
            title: '关键词搜索结果',
            keyword: q,
            currentPage: page + 1,
            query: 'cat=' + catId,
            totalPage: Math.ceil(movies.length / count),
            movies: results,
        })
    }

}