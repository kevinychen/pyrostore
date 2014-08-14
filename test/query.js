var testSettings = require('./settings');
var Pyrostore = require('../lib/index');
var pyro;

exports.testStaticMethods = {
    init: function(test) {
        pyro = new Pyrostore('root/test');
        pyro.auth(testSettings.auth);
        pyro.client.table = testSettings.table;
        pyro.parent().set(undefined, test.done);
    },
    testEmpty: function(test) {
        test.expect(2);
        pyro.once('value', function(data) {
            test.ifError(data.error);
            test.equals(undefined, data.val());
            test.done();
        });
    },
    testOnce: function(test) {
        test.expect(2);
        var obj = {
            child: 'data1',
            child2: {
                grand1: 'data21',
                grand2: 'data22'
            }
        };
        pyro.set(obj, function() {
            pyro.once('value', function(data) {
                test.ifError(data.error);
                test.deepEqual(obj, data.val());
                test.done();
            });
        });
    },
    testChildOnce: function(test) {
        test.expect(1);
        pyro.child('child').once('value', function(data) {
            test.equals('data1', data.val());
            test.done();
        });
    },
    testChildOnce2: function(test) {
        test.expect(1);
        pyro.child('child2').once('value', function(data) {
            test.deepEqual({grand1: 'data21', grand2: 'data22'}, data.val());
            test.done();
        });
    },
    testChildOnce3: function(test) {
        test.expect(1);
        pyro.child('child2/grand1').once('value', function(data) {
            test.equals('data21', data.val());
            test.done();
        });
    },
    testChildOnce4: function(test) {
        test.expect(1);
        pyro.child('nonexistent').once('value', function(data) {
            test.equals(undefined, data.val());
            test.done();
        });
    },
    testChildOnce5: function(test) {
        test.expect(1);
        pyro.child('really/nonexistent/child').once('value', function(data) {
            test.equals(undefined, data.val());
            test.done();
        });
    },
    testChildOnce6: function(test) {
        test.expect(1);
        pyro.parent().once('value', function(data) {
            test.deepEqual({
                test: {
                    child: 'data1',
                    child2: {
                        grand1: 'data21',
                        grand2: 'data22',
                    }
                }
            }, data.val());
            test.done();
        });
    },
    testRef: function(test) {
        test.expect(2);
        test.equals(pyro, pyro.ref());
        var childPyro = pyro.child('child');
        test.equals(childPyro, childPyro.ref());
        test.done();
    },
    finalize: function(test) {
        pyro.unauth();
        test.done();
    }
};

