const mongoose = require('mongoose')

const Category = mongoose.model('Category')
const Movie = mongoose.model('Movie')

exports.searchByCategory = async (catId) => {
    const data = await Category.find({ _id: catId }).populate({
        path: 'movies',
        select: '_id title poster',
        options: { limit: 8 }
    })
    return data
}

exports.searchMoviesByKeyword = async (keyword) => {
    const data = await Movie.find({
        title: new RegExp(keyword + '.*', 'i'),
    })
    return data
}

exports.findMovieById = async (_id) => {
    const data = await Movie.findOne({
        _id
    });
    return data
}

exports.findCategoryById = async (_id) => {
    const data = await Category.findOne({
        _id,
    });
    return data
}

exports.findCategory = async (conditions = {}) => {
    const data = await Category.find(conditions)
    return data
}

exports.findCategories = async (conditions = {}) => {
    const data = await Category.find(conditions)
    return data
}

exports.findMoviesWidthPopulate = async (path, field) => {
    const data = await Movie.find({}).populate(path, field)
    return data
}