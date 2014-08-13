/*
 * Client for node.
 */

var Path = require('path');

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
Pyrostore.prototype.auth = function(auth) {
    var clientLib = require('./' + auth.substring(0, auth.indexOf(':')));
    this.client = new clientLib.Client(auth);
}

/*
 * child('child')
 *   -> Pyrostore('root/child')
 */
Pyrostore.prototype.child = function(child) {
    return new Pyrostore(Path.join(this.path, child), this.client);
}

/*
 * once('value', callback)
 *   -> callback(data)
 */
Pyrostore.prototype.once = function(attr, callback) {
    if (attr === 'value') {
        this.client.get(this.path, function(err, data) {
            if (err) {
                throw 'System error: ' + err;
            }
            callback({val: data});
        });
    } else {
        throw 'Invalid attribute: ' + attr;
    }
}

/*
 * set('data', callback)
 */
Pyrostore.prototype.set = function(data, callback) {
    this.client.set(this.path, data, callback);
}

exports.Pyrostore = Pyrostore;

