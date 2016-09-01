const Route = require('./route');
const tools = require('../help/tools');

module.exports = Router;
module.exports.handle = handleRouter;

let urlMap = [];
let endpoint = {};

function handleRouter(req, res) {
    for (let i = 0, len = urlMap.length - 1; i <= len; i++) {
        if (urlMap[i].match(req.pathname)) {
            let endpointName = urlMap[i].endpoint;
            let result = urlMap[i].match(req.pathname);

            endpoint[endpointName].call(null, req, res, result);
            break;
        }
    }
}

function Router(prefix) {
    this.prefix = prefix || '';
}

Router.prototype.add = function add(path, methods, handle) {
    if (typeof path !== 'string') throw TypeError('param `path` should be `string`, not `' + typeof path + '`');

    if (handle === undefined) {
        handle = methods;
        methods = ['get'];
    }
    let name = handle.name;
    if (!name) throw TypeError('handle function Can\'t be an anonymous function');

    endpoint[name] = handle;
    let route = new Route(path, methods, name);
    urlMap.push(route);
    this.update();
};

Router.prototype.update = function update() {
    function _insertSort(array) {
        let length = array.length,
            j, temp;

        for (let i = 1; i < length; i++) {
            j = i;
            temp = array[i];

            while (j > 0 && array[j - 1] > temp) {
                array[j] = array[j - 1];
                j--;
            }
            array[j] = temp;
        }
    }

    _insertSort(urlMap)
};
