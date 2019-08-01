const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { SALT_WORK_FACTOR, MAX_LOGIN_ATTEMPTS, LOCK_TIME } = require('../../../config/config.js');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    // user admin superAdmin
    role: {
        type: String,
        default: 'user',
    },
    // 兼容各个微信应用的微信应用id
    openid: [String],
    // 绑定开放平台
    unionid: String,
    nickname: String,
    address: String,
    country: String,
    province: String,
    city: String,
    gender: String,
    // 邮箱唯一
    email: {
        unique: true,
        type: String
    },
    password: String,
    loginAttempts: {
        type: Number,
        required: true,
        default: 0,
    },
    lockUntil: Number,
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
});

// 虚拟字段
UserSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.pre('save', function (next) {
    if (this.isNew) {
        this.meta.createdAt = this.meta.updatedAt = Date.now();
    } else {
        this.meta.updateAt = Date.now();
    }
    next();
});

UserSchema.pre('save', function (next) {
    // 密码没有更改
    if (!this.isModified('password')) {
        return next();
    }
    // 加盐
    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err) {
            return next(err);
        }
        bcrypt.hash(this.password, salt, (err, hash) => {
            if (err) {
                return next(err);
            }
            this.password = hash;
            next();
        });
    });
});

UserSchema.methods = {
    // 比对密码（用户传来的，加盐的）
    comparePassword(_password, password) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(_password, password, (err, isMatch) => {
                if (!err) {
                    return resolve(isMatch);
                } else {
                    return reject(err);
                }
            });
        });
    },
    incLoginAttempts(user) {
        console.log('====================================');
        console.log(this);
        console.log(user);
        console.log('====================================');
        return new Promise((resolve, reject) => {
            if (user.lockUntil && user.lockUntil < Date.now()) {
                user.update({
                    $set: {
                        loginAttempts: 1,
                    },
                    $unset: {
                        lockUntil: 1,
                    },
                }, (err) => {
                    if (!err) {
                        resolve(true);
                    } else {
                        reject(err);
                    }
                });
            } else {
                let updates = {
                    $inc: {
                        loginAttempts: 1,
                    },
                };
                if (user.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS || !user.isLocked) {
                    updates.$set = {
                        lockUntil: Date.now() + LOCK_TIME,
                    };
                }
                user.update(updates, err => {
                    if (!err) {
                        resolve(true);
                    } else {
                        reject(err);
                    }
                });
            }
        });
    }
};

// 创建Model
const User = mongoose.model('User', UserSchema)