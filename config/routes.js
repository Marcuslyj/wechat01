// const config = require('../config');
const Wechat = require('../app/controllers/wechat')

module.exports = router => {
    router.get(
        // config.URL_PREFIX + 
        '/wx-hear', Wechat.hear);
    router.post(
        // config.URL_PREFIX + 
        '/wx-hear', Wechat.hear);

    // 跳到授权中间服务页面
    router.get(
        // config.URL_PREFIX + 
        '/wx-oauth', Wechat.oauth);
    // 通过code获取用户信息
    router.get(
        // config.URL_PREFIX + 
        '/userInfo', Wechat.userinfo);
}