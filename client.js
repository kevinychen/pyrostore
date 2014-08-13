var Pyrostore = require('./pyrostore').Pyrostore;

var table = process.argv[2];
var auth = process.argv[3];

var pyro = new Pyrostore(table);
pyro.auth(auth);
pyro.doSomething();

