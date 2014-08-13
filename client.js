var postgres = require('./postgres');

var user = process.argv[2];
var password = process.argv[3];
var host = process.argv[4];
var table = process.argv[5];
var db = new postgres.Client({
    user: user,
    password: password,
    host: host,
    table: table
});
db.get('root', console.log);

