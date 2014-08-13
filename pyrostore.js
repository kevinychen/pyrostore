/*
 * Client for node.
 */

function Pyrostore(table) {
    this.table = table;
    this.client = null;
}

Pyrostore.prototype.auth = function(auth) {
    var clientLib = require('./' + auth.substring(0, auth.indexOf(':')));
    this.client = new clientLib.Client(this.table, auth);
}

Pyrostore.prototype.doSomething = function() {
    this.client.insert('/root/child', {complex: 'type'}, console.log);
}

exports.Pyrostore = Pyrostore;

