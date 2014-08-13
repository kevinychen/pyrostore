var Pyrostore = require('./pyrostore').Pyrostore;

var path = process.argv[2];
var auth = process.argv[3];

var pyro = new Pyrostore(path);
pyro.auth(auth);
pyro.child('child').set({hello: 'world'}, function() {
    pyro.once('value', console.log);
});

