/// <reference path="../typings/index.d.ts" />
const tool = require('./help/tools');
const global = require('./global');
const render = require('./render');
const router = require('./router');

const Response = function (res) {
    this.rawResponse = this.$res = res;
};

/**
 * 内部方法：统一 response 配置
 *
 * @param {any} data 需要返回的数据
 */
Response.prototype.__end = function (data) {
    this.rawResponse.end();
};

/**
 * 内部方法：检测传入参数是否有误
 *
 * @param  {string} name
 * @param  {string} type
 * @param  {} value
 */
Response.prototype.__check = function (name, type, value) {
    if (!value) {
        if (type === undefined)
            throw TypeError(name + 'is undefined');
        else
            throw TypeError(name + 'is undefined, it must be a ' + type);
    } else if(typeof value !== type)
        throw TypeError(name + ' must be a ' + type);
};

/**
 * 设置 cookie
 *
 * @param   {object} cookies 需要设置的cookie
 * @param   {?string} value
 */
Response.prototype.set_cookies = function (cookies, value) {
    let _res, _cookie;

    this.__check('cookies', cookies);

    _res = this.rawResponse;
    _cookie = [];

    if (value) {
        _cookie.push(cookies + '=' + value);
    } else {
        Object.keys(cookies).map((key) => {
            _cookie.push(key + '=' + cookies[key]);
        });
    }

    _res.setHeaders('Set-Cookie', _cookie);
};

/**
 * 响应错误
 *
 * @param  {number} httpCode http 状态码
 */
Response.prototype.abort = function (httpCode) {
    let _res;

    this.__check('httpCode', httpCode);

    if (!parseInt(httpCode) || parseInt(httpCode) < 400 || parseInt(httpCode) > 500)
        throw TypeError("httpCode must be an HttpError code");

    // 如果存在错误处理方法，则跳转至对应方法处理
    if (router.ErrorHandle && router.ErrorHandle['_' + httpCode]) {
        router.ErrorHandle(httpCode);
    }

    _res = this.rawResponse;
    _res.writeHead(parseInt(httpCode), {'Content-Type': 'text/html'});
    this.__end(httpCode + " Error");
};

/**
 * 响应网页跳转
 *
 * @param  {string} url 跳转url
 */
Response.prototype.redirect = function (url) {
    let _res;
    this.__check('url', 'string', url);

    _res = this.rawResponse;
    _res.writeHead(302, {'Location': url});
    this.__end();
};

/**
 * 模版渲染
 *
 * @param  {string} templatePath 模版路径
 * @param  {object} data 模版填充内容
 */
Response.prototype.render_template = function (templatePath, data) {
    let _res, _data;

    this.__check('templatePath', 'string', templatePath);

    data = data || {};
    _res = this.rawResponse;
    _data = render(templatePath, data);

    _res.writeHead(200, {'Content-Type': 'text/html'});
    this.__end(_data);
};

/**
 * 返回字符串快速方法
 *
 * @param   {string} str 返回内容
 * @param  {?boolean} isHtml 是否以 html 形式返回
 */
Response.prototype.str = function (str, isHtml) {
    let _res;

    this.__check('str', 'string', str);

    _res = this.rawResponse;
    if(isHtml)
        _res.writeHead(200, {'Content-Type': 'text/html'});
    else
        _res.writeHead(200, {'Content-Type': 'text/palin'});

    this.__end(str);
};

/**
 * 响应 json 数据
 *
 * @param  {json} json json对象
 */
Response.prototype.jsonify = function (json) {
    let _res, _data;

    this.__check('json', json);

    _res = this.rawResponse;
    _data = JSON.stringify(json);
    _res.writeHead(200, {'Content-Type': 'application/json'})

    this.__end(_data);
};

module.exports = Response;