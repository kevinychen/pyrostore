/*
 * Client for node.
 */

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
    this.client = new clientLib.Client(this.path, auth);
}

Pyrostore.prototype.doSomething = function(child) {
    var client = this.client;
    client.insert('/child', {complex: 'type'}, function() {
        client.get('/', console.log);
    });
}

exports.Pyrostore = Pyrostore;

