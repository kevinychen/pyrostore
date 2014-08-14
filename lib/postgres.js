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

var Client = require('pg').Client;

/*
 * Postgres('postgres://user:mypassword@localhost:5432/pyrostore')
 */
function Postgres(auth, table) {
    this.table = table || 'store';
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

Postgres.prototype.rollback = function(err, callback) {
    this.client.query('rollback', [], function(majorErr) {
        if (majorErr) {
            throw 'Major error: rollback failure';
        }
        callback(err);
    });
};

Postgres.prototype.end = function() {
    this.client.end();
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
    path = fixPath(path);

    var addAttr = function(obj, attrs, value) {
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
    };

    this.query("select key, value from " + this.table +
            " where key LIKE '" + path + "%'", [], function(err, results) {
        if (err) {
            return callback(err);
        }
        var obj = undefined;
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            var relPath = result.key.substr(path.length);
            var attrs = relPath.split(DELIM).filter(function(attr) {
                return attr;
            });
            obj = addAttr(obj, attrs, JSON.parse(result.value));
        }
        callback(false, obj);
    });
};

/*
 * insert('root/child', 1, false, callback)
 * insert('root/child', {complex: 'object'}, true, callback)
 */
Postgres.prototype.set = function(path, value, callback, isUpdate, withinTransaction) {
    path = fixPath(path);
    var leaves = [];
    // TODO detect circular structures
    var traverse = function(relPath, obj) {
        if (obj === null) {
            return;
        } else if (typeof(obj) === 'object') {
            for (var prop in obj) {
                traverse(relPath + prop + DELIM, obj[prop]);
            }
        } else {
            leaves.push({key: relPath, value: JSON.stringify(obj)});
        }
    };
    traverse(path, value);

    var me = this;
    var begin = function() {
        me.query("begin", [], function(err) {
            if (err) {
                return me.rollback(err, callback);
            }
            purge();
        });
    };
    var purge = function() {
        var counter = isUpdate ? leaves.length + 1 : 2;
        var complete = function(err) {
            if (err) {
                return me.rollback(err, callback);
            }
            if (--counter === 0) {
                bulkInsert();
            }
        };
        if (isUpdate) {
            for (var i = 0; i < leaves.length; i++) {
                me.query("delete from " + me.table + " where key LIKE '" +
                        leaves[i].key + "%'", [], complete);
            }
        } else {
            me.query("delete from " + me.table + " where key LIKE '" +
                    path + "%'", [], complete);
        }
        me.query("delete from " + me.table + " where left('" +
                path + "', char_length(key)) LIKE key", [], complete);
    };
    var bulkInsert = function() {
        var counter = leaves.length;
        var complete = function(err) {
            if (err) {
                return me.rollback(err, callback);
            }
            if (--counter === 0) {
                me.query('commit', [], callback);
            }
        };
        for (var i = 0; i < leaves.length; i++) {
            me.query("insert into " + me.table +
                    " (key, value) values ($1, $2)",
                    [leaves[i].key, leaves[i].value], complete);
        }
        if (leaves.length === 0) {
            me.query('commit', [], callback);
        }
    };
    if (withinTransaction) {
        purge();
    } else {
        begin();
    }
}

/*
 * transaction('root/child', function(data) { return f(data); }, callback)
 *   -> callback(err, committed, oldData)
 */
Postgres.prototype.transaction = function(path, editFunction, callback) {
    path = fixPath(path);
    var me = this;
    var begin = function() {
        me.query("begin", [], function(err) {
            if (err) {
                return me.rollback(err, callback);
            }
            update();
        });
    };
    var update = function() {
        me.get(path, function(err, data) {
            me.set(path, editFunction(data), function(err) {
                // TODO figure out error message for not committed
                callback(err, true, data);
            }, false, true);
        });
    };
    begin();
}

exports.Client = Postgres;

