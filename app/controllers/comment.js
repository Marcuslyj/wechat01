const mongoose = require('mongoose');

const Comment = mongoose.model('Comment');

exports.save = async (ctx, next) => {
    const commentData = ctx.request.body.comment;
    // 对人
    if (commentData.cid) {
        let comment = await Comment.findOne({
            _id: commentData.cid,
        });
        const Reply = {
            from: commentData.from,
            to: commentData.tid,
            content: commentData.content,
        };
        comment.replies.push(Reply);
        await comment.save();
        ctx.body = {
            success: true,
        };
    } else {
        // 对电影
        let comment = new Comment({
            movie: commentData.movie,
            from: commentData.from,
            content: commentData.content,
        });
        await comment.save();
        ctx.body = {
            success: true,
        };
    }
}