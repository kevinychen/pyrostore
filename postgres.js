/*
 * Client for postgres.
 *
 * Client setup:
 *   run "npm install pg"
 *
 * Postgres setup:
 *   create table planes (key text unique, value text);
 */

var Client = require('pg').Client;

function Postgres(params) {
    this.table = params.table || 'table';
    this.client = new Client({
        user: params.user || 'postgres',
        password: params.password || '',
        database: params.database || 'pyrostore',
        host: params.host || 'localhost',
        port: params.port || 5432
    });
    this.client.connect();
}

/*
 * query('select name from table where id = $1', [1], callback)
 *   -> callback(err, [{name: 'kyc'}, {name: 'becky'}])
 */
Postgres.prototype.query = function(query, args, callback) {
    this.client.query(query, args, function(err, result) {
        callback(err, result && result.rows);
    });
};

/*
 * addAttr({'a': 1}, ['b', 'c'], 2)
 *   -> {'a': 1, 'b': {'c': 2}}
 */
function addAttr(obj, attrs, value) {
    var sentinel = {obj: obj};
    var exAttrs = ['obj'].concat(attrs);
    var ptr = sentinel;
    for (var i = 0; i < attrs.length; i++) {
        if (!(exAttrs[i] in ptr) || typeof(ptr[exAttrs[i]]) !== 'object') {
            ptr[exAttrs[i]] = {};
        }
        ptr = ptr[exAttrs[i]];
    }
    ptr[exAttrs[attrs.length]] = value;
    return sentinel.obj;
}

/*
 * get('root/child', callback)
 *   -> callback(err, {grandchild: {leaf: 1, another_leaf: 2}})
 */
Postgres.prototype.get = function(path, callback) {
    if (path.slice(-1) !== '/') {
        path += '/';
    }
    this.query("select key, value from " + this.table +
            " where key LIKE '" + path + "%'", [], function(err, results) {
        if (err) {
            callback(err);
        } else {
            var obj = undefined;
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                var relPath = result.key.substr(path.length);
                var attrs = relPath.split('/').filter(function(attr) {
                    return attr;
                });
                obj = addAttr(obj, attrs, result.value);
            }
            callback(false, obj);
        }
    });
};

exports.Client = Postgres;

