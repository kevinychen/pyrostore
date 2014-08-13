/*
 * Client for postgres.
 *
 * Client setup:
 *   run "npm install pg"
 *
 * Postgres setup:
 *   create table planes (key text unique, value text);
 */

var pg = require('pg');

function Postgres(params) {
    this.user = params.user || 'postgres';
    this.pw = params.pw || '';
    this.url = params.url || 'localhost';
    this.db = params.db || 'pyrostore';
    this.table = params.table || 'table';
    this.connection = 'postgres://' + this.user + ':' + this.pw + '@' + this.url + '/' + this.db;
}

Postgres.prototype.query = function(query, args, callback) {
    pg.connect(this.connection, function(err, client, done) {
        if (err) {
            callback(err);
        } else {
            console.log(query);
            console.log(args);
            client.query(query, args, function(err, result) {
                done();
                callback(err, result && result.rows);
            });
        }
    });
};

/*
 * retrieve('/root/child', callback)
 *   -> callback(err, {grandchild: {leaf: 1, another_leaf: 2}}, '/root/child')
 */
Postgres.prototype.retrieve = function(path, callback) {
    this.query('select value from ' + this.table + ' where key = $1', [path], function(err, rows) {
        if (err) {
            callback(err);
        } else if (rows.length === 0) {
            callback(false, {}, path);
        } else {
            callback(err, JSON.parse(rows[0].value), path);
        }
    });
}

/*
 * get(['root', 'child'], callback)
 *   -> callback(err, {grandchild: {leaf: 1, another_leaf: 2}})
 */
Postgres.prototype.get = function(key, callback) {
    var path = '/' + key.join('/');
    this.retrieve(path, callback);
}

/*
 * load(['/root/child/grandchild/leaf', 'value', callback)
 *   -> callback(err)
 */
Postgres.prototype.load = function(path, obj, callback) {
    var value = JSON.stringify(obj);
    var me = this;
    // Upsert
    this.query('insert into ' + this.table + ' (key, value) values ($1, $2)',
            [path, value], function(err) {
         if (err) {
             me.query('update ' + me.table + ' set value = $2 where key = $1',
                     [path, value], callback);
         } else {
             callback();
         }
    });
}

/*
 * insert(['root', 'child', 'grandchild', 'leaf'], 'value', callback)
 */
Postgres.prototype.insert = function(key, value, callback) {
    var path = '';
    var counter = key.length;
    var me = this;
    var end = function(err) {
        if (err || --counter === 0) {
            callback(err);
        }
    };
    for (var i = 0; i + 1 < key.length; i++) {
        path += '/' + key[i];
        this.retrieve(path, function(err, baseObj, path) {
            if (err) {
                callback(err);
            } else {
                var obj = baseObj;
                for (var j = i; j + 1 < key.length; j++) {
                    var k = key[i];
                    if (!(k in obj)) {
                        obj[k] = {};
                    }
                    obj = obj[k];
                }
                obj[key[key.length - 1]] = value;
                me.load(path, baseObj, end);
            }
        });
    }
    path += '/' + key[key.length - 1];
    this.load(path, value, end);
};

exports.Client = Postgres;

