/*
 * Sample usage of Pyrostore
 */

var Pyrostore = require('./pyrostore').Pyrostore;

var path = process.argv[2];
var auth = process.argv[3];

var pyro = new Pyrostore(path);
pyro.auth(auth);

var f1 = function() {
    pyro.child('child').set(1, f2);
}, f2 = function() {
    pyro.child('inlaw').set({x: 'bro', y: 'sis'}, f3);
}, f3 = function() {
    pyro.once('value', function(data) {
        console.log(data.val());
        f4();
    });
}, f4 = function() {
    pyro.child('inlaw/x').transaction(function(data) {
        return data + '!';
    }, function(err, committed, oldData) {
        console.log(oldData.val());
        f5();
    });
}, f5 = function() {
    process.exit();
};
f1();

