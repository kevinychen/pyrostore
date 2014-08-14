var testSettings = require('./settings');
var Pyrostore = require('../lib/index');
var pyro;
var snapshot;

exports.init = function(test) {
    pyro = new Pyrostore('root/test');
    pyro.auth(testSettings.auth);
    pyro.client.table = testSettings.table;
    test.done();
}

exports.testVal = function(test) {
    var obj = {
        child: 'data1',
        child2: {
            grand1: 'data21',
            grand2: 'data22'
        }
    };
    test.expect(2);
    pyro.parent().set(undefined, function() {
        pyro.set(obj, function() {
            pyro.once('value', function(data) {
                test.ifError(data.error);
                test.deepEqual(obj, data.val());
                snapshot = data;
                test.done();
            });
        });
    });
};

exports.finalize = function(test) {
    pyro.unauth();
    test.done();
};

