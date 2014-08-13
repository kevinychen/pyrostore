/*
 * Client for postgres.
 *
 * Client setup:
 *   run "npm install pg"
 *
 * Postgres setup:
 *   create table store (key text unique, value text);
 */

const DELIM = '/';
const TABLE = 'store';

var Client = require('pg').Client;

/*
 * Postgres('postgres://kyc:mypassword@localhost:5432/pyrostore')
 */
function Postgres(auth) {
    this.client = new Client(auth);
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

Postgres.prototype.rollback = function() {
    this.client.query('rollback', function() {});
};

/*
 * fixPath('root/child')
 *   -> 'root/child/'
 */
function fixPath(path) {
    if (path.slice(-1) !== DELIM) {
        return path + DELIM;
    }
    return path;
}

/*
 * get('root/child', callback)
 *   -> callback(err, {grandchild: {leaf: 1, another_leaf: 2}})
 */
Postgres.prototype.get = function(path, callback) {
    var absPath = fixPath(path);

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

    this.query("select key, value from " + TABLE +
            " where key LIKE '" + absPath + "%'", [], function(err, results) {
        if (err) {
            return callback(err);
        }
        var obj = undefined;
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var relPath = result.key.substr(absPath.length);
            var attrs = relPath.split(DELIM).filter(function(attr) {
                return attr;
            });
            obj = addAttr(obj, attrs, result.value);
        }
        callback(false, obj);
    });
};

/*
 * insert('root/child', 1, callback)
 * insert('root/child', {complex: 'object'}, callback)
 */
Postgres.prototype.set = function(path, value, callback) {
    var absPath = fixPath(path);
    var leaves = [];
    // TODO detect circular structures
    function traverse(relPath, obj) {
        if (typeof(obj) === 'object') {
            for (var prop in obj) {
                traverse(relPath + prop + DELIM, obj[prop]);
            }
        } else {
            leaves.push({key: relPath, value: obj});
        }
    }
    traverse(absPath, value);

    var me = this;
    function begin() {
        me.query("begin", [], function(err) {
            if (err) {
                return me.rollback();
            }
            purge();
        });
    }
    function purge() {
        var counter = 2;
        function complete(err) {
            if (err) {
                return me.rollback();
            }
            if (--counter === 0) {
                bulkInsert();
            }
        }
        me.query("delete from " + TABLE + " where key LIKE '" +
                absPath + "%'", [], complete);
        me.query("delete from " + TABLE + " where left('" +
                absPath + "', char_length(key)) LIKE key", [], complete);
    }
    function bulkInsert() {
        var counter = leaves.length;
        function complete(err) {
            if (err) {
                return me.rollback();
            }
            if (--counter === 0) {
                me.query('commit', [], callback);
            }
        }
        for (var i = 0; i < leaves.length; i++) {
            me.query("insert into " + TABLE + " (key, value) values ($1, $2)",
                    [leaves[i].key, leaves[i].value], complete);
        }
    }
    begin();
}

exports.Client = Postgres;

