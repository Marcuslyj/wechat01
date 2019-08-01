module.exports = {
    port: 3008,
    db: 'mongodb://127.0.0.1:27017/wechat7day',
    wechat: {
        appID: 'wx1074acee288467cb',
        appSecret: '63a70c8bcd027b3d3f05314715b0e228',
        token: 'fsdfdv1f65d1b651gbg651'
    },
    baseUrl: 'http://b2578068a6.wicp.vip',
    // 加密权重
    SALT_WORK_FACTOR: 10,
    // 登录的最大失败尝试次数
    MAX_LOGIN_ATTEMPTS: 5,
    // 登录失败后锁定时间
    LOCK_TIME: 2 * 60 * 60 * 1000
}