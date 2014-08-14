var testSettings = require('./settings');
var Pyrostore = require('../lib/index');

exports.testCreatePyrostore = function(test) {
    test.expect(2);
    var pyro = new Pyrostore('test');
    test.equals('test', pyro.path);
    test.equals(undefined, pyro.client);
    test.done();
};

exports.testUnauth = function(test) {
    test.expect(1);
    this.pyro = new Pyrostore('root/test');
    this.pyro.auth(testSettings.auth);
    this.pyro.unauth();
    test.equals(undefined, this.pyro.client);
    test.done();
};

exports.testMethods = {
    setUp: function(done) {
        this.pyro = new Pyrostore('root/test');
        this.pyro.auth(testSettings.auth);
        this.pyro.client.table = testSettings.table;
        done();
    },
    testChild: function(test) {
        test.expect(4);
        var childPyro = this.pyro.child('child');
        test.equals('root/test/child', childPyro.path);
        test.equals(this.pyro.client, childPyro.client);
        var grandchildPyro = this.pyro.child('child/grand');
        test.equals('root/test/child/grand', grandchildPyro.path);
        test.equals(this.pyro.client, grandchildPyro.client);
        test.done();
    },
    testChildNumber: function(test) {
        test.expect(1);
        var childPyro = this.pyro.child(1);
        test.equals('root/test/1', childPyro.path);
        test.done();
    },
    testParent: function(test) {
        test.expect(3);
        var parentPyro = this.pyro.parent();
        test.equals('root', parentPyro.path);
        test.equals(this.pyro.client, parentPyro.client);
        var grandparentPyro = parentPyro.parent();
        test.equals(null, grandparentPyro);
        test.done();
    },
    testName: function(test) {
        test.expect(2);
        test.equals('test', this.pyro.name());
        test.equals(null, this.pyro.parent().name());
        test.done();
    },
    testToString: function(test) {
        test.expect(1);
        test.equals('root/test', this.pyro.toString());
        test.done();
    },
    tearDown: function(done) {
        this.pyro.unauth();
        done();
    }
};

