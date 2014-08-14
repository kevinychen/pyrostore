/*
 * Client for node.
 */

var Path = require('path');
var Snapshot = require('./snapshot').Snapshot;

/*
 * Pyrostore('table')
 */
function Pyrostore(path, client) {
    this.path = path;
    this.client = client;
}

/*
 * auth('postgres://kyc:mypassword@localhost:5432/pyrostore')
 */
Pyrostore.prototype.auth = function(auth, callback) {
    var clientLib = require('./' + auth.substring(0, auth.indexOf(':')));
    this.client = new clientLib.Client(auth);
    callback && callback();
}

/*
 * unauth()
 */
Pyrostore.prototype.unauth = function() {
    if (this.client) {
        this.client.end();
    }
    this.client = undefined;
}

/*
 * child('child')
 *   -> Pyrostore('root/child')
 */
Pyrostore.prototype.child = function(child) {
    child = child.toString();
    return new Pyrostore(Path.join(this.path, child), this.client);
}

/*
 * parent()
 *   -> Pyrostore('root')
 */
Pyrostore.prototype.parent = function() {
    var parentPath = Path.dirname(this.path);
    return parentPath === '.' ? null : new Pyrostore(parentPath, this.client);
}

/*
 * name()
 *   -> 'child'
 */
Pyrostore.prototype.name = function() {
    var name = Path.basename(this.path);
    return name === this.path ? null : name;
}

/*
 * toString()
 *   -> 'root/child'
 */
Pyrostore.prototype.toString = function() {
    return this.path;
}

/*
 * once('value', callback)
 *   -> callback(data)
 */
Pyrostore.prototype.once = function(attr, callback) {
    callback = callback || function() {}
    if (attr === 'value') {
        this.client.get(this.path, function(err, data) {
            if (err) {
                callback({error: err});
            }
            callback(new Snapshot(data));
        });
    } else {
        callback({error: 'Invalid attribute: ' + attr});
    }
}

/*
 * set('data', callback)
 */
Pyrostore.prototype.set = function(data, callback) {
    this.client.set(this.path, data, callback || function() {});
}

/*
 * update('data', callback)
 */
Pyrostore.prototype.update = function(data, callback) {
    this.client.set(this.path, data, callback || function() {}, data != null);
}

/*
 * remove(callback)
 */
Pyrostore.prototype.remove = function(callback) {
    this.client.set(this.path, undefined, callback || function() {});
}

/*
 * transaction(function(data) { return f(data); }, callback)
 *   -> callback(err, committed, oldData)
 */
Pyrostore.prototype.transaction = function(editFunction, callback) {
    callback = callback || function() {}
    this.client.transaction(this.path, editFunction, function(err, committed, data) {
        callback(err, committed, new Snapshot(data));
    });
}

module.exports = Pyrostore;

