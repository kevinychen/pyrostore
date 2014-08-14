var testSettings = require('./settings');
var Pyrostore = require('../lib/index');
var pyro;

exports.testAttrMethods = {
    init: function(test) {
        pyro = new Pyrostore('root/test');
        test.done();
    },
    testChild: function(test) {
        test.expect(4);
        var childPyro = pyro.child('child');
        test.equals('root/test/child', childPyro.path);
        test.equals(pyro.client, childPyro.client);
        var grandchildPyro = pyro.child('child/grand');
        test.equals('root/test/child/grand', grandchildPyro.path);
        test.equals(pyro.client, grandchildPyro.client);
        test.done();
    },
    testChildNumber: function(test) {
        test.expect(1);
        var childPyro = pyro.child(1);
        test.equals('root/test/1', childPyro.path);
        test.done();
    },
    testParent: function(test) {
        test.expect(3);
        var parentPyro = pyro.parent();
        test.equals('root', parentPyro.path);
        test.equals(pyro.client, parentPyro.client);
        var grandparentPyro = parentPyro.parent();
        test.equals(null, grandparentPyro);
        test.done();
    },
    testName: function(test) {
        test.expect(2);
        test.equals('test', pyro.name());
        test.equals(null, pyro.parent().name());
        test.done();
    },
    testToString: function(test) {
        test.expect(1);
        test.equals('root/test', pyro.toString());
        test.done();
    },
    finalize: function(test) {
        test.done();
    }
};

exports.testUpdateMethods = {
    init: function(test) {
        pyro = new Pyrostore('root/test');
        pyro.auth(testSettings.auth);
        pyro.client.table = testSettings.table;
        pyro.parent().set(undefined, test.done);
    },
    testSet: function(test) {
        test.expect(2);
        pyro.set('testSet');
        setTimeout(function() {
            pyro.once('value', function(data) {
                test.ifError(data.error);
                test.equals('testSet', data.val());
                test.done();
            });
        }, 1000);
    },
    testSetCallback: function(test) {
        test.expect(2);
        pyro.set({child: 'data1', child2: 'data2'}, function(err) {
            test.ifError(err);
            pyro.set({child: 'changed', child3: 'added'}, function(err) {
                pyro.once('value', function(data) {
                    test.deepEqual({child: 'changed', child3: 'added'}, data.val());
                    test.done();
                });
            });
        });
    },
    testUpdate: function(test) {
        test.expect(2);
        pyro.set({child: 'data1', child2: 'data2'}, function() {
            pyro.update({child: 'changed', child3: 'added'}, function(err) {
                test.ifError(err);
                pyro.once('value', function(data) {
                    test.deepEqual({child: 'changed', child2: 'data2', child3: 'added'}, data.val());
                    test.done();
                });
            });
        });
    },
    testUpdateNull: function(test) {
        test.expect(2);
        pyro.set('testUpdateNull', function() {
            pyro.update(null, function(err) {
                test.ifError(err);
                pyro.once('value', function(data) {
                    test.equals(undefined, data.val());
                    test.done();
                });
            });
        });
    },
    testRemove: function(test) {
        test.expect(2);
        pyro.set('testRemove', function() {
            pyro.remove(function(err) {
                test.ifError(err);
                pyro.once('value', function(data) {
                    test.equals(undefined, data.val());
                    test.done();
                });
            });
        });
    },
    testTransaction: function(test) {
        test.expect(4);
        pyro.set('testTransaction', function() {
            pyro.transaction(function(data) {
                return data + '!';
            }, function(err, committed, data) {
                test.ifError(err);
                test.ok(committed, 'Not committed');
                test.equals('testTransaction', data.val());
                pyro.once('value', function(data) {
                    test.equals('testTransaction!', data.val());
                    test.done();
                });
            });
        });
    },
    finalize: function(test) {
        pyro.unauth();
        test.done();
    }
};
