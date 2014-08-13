var postgres = require('./postgres');

var user = process.argv[2];
var pw = process.argv[3];
var url = process.argv[4];
var table = process.argv[5];
var db = new postgres.Client({user: user, pw: pw, url: url, table: table});

db.insert(['root', 'child'], 'ho', console.log);

