var testSettings;
var clc = require('cli-color');
var Pyrostore = require('../lib/index');
var pyro;

try {
    testSettings = require('./settings');
} catch (e) {
    console.log(clc.red('FAILURE:') + ' Cannot find test settings file. ' +
        'Create a file test/settings.js with the following lines:\n' +
        'exports.table = "testTableName";\n' +
        'exports.auth = "postgres://username:password@host:port/db_name";\n');
    process.exit();
}

exports.testCreatePyrostore = function(test) {
    pyro = new Pyrostore('test');
    test.expect(2);
    test.equals('test', pyro.path);
    test.equals(undefined, pyro.client);
    test.done();
};

exports.testAuth = function(test) {
    pyro.auth(testSettings.auth);
    test.ok(pyro.client, 'Client not set');
    pyro.client.table = testSettings.table;
    test.done();
}

exports.testDatabaseConnection = function(test) {
    test.expect(2);
    pyro.client.query('select 1 as number', [], function(err, rows) {
        test.equals(1, rows.length);
        test.equals(1, rows[0].number);
        test.done();
    });
};

exports.testUnauth = function(test) {
    test.expect(1);
    pyro.unauth();
    test.equals(undefined, pyro.client);
    test.done();
};

