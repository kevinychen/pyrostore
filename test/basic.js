var testSettings;
var clc = require('cli-color');
var Pyrostore = require('../lib/index');

try {
    testSettings = require('./settings');
} catch (e) {
    console.log(clc.red('FAILURE:') + ' Cannot find test settings file. ' +
        'Create a file test/settings.js with the following lines:\n' +
        'exports.table = "testTableName";\n' +
        'exports.auth = "postgres://username:password@host:port/db_name";\n');
    process.exit();
}

exports.setUp = function(done) {
    this.pyro = new Pyrostore('test');
    this.pyro.auth(testSettings.auth);
    this.pyro.client.table = testSettings.table;
    done();
};

exports.loadDB = function(test) {
    test.expect(2);
    this.pyro.client.query('select 1 as number', [], function(err, rows) {
        test.equals(1, rows.length);
        test.equals(1, rows[0].number);
        test.done();
    });
};

exports.tearDown = function(done) {
    this.pyro.client.end();
    done();
}

