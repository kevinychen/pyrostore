/*
 * Client for postgres.
 *
 * run "npm install pg"
 */

var pg = require('pg');

function Postgres(user, pw, url, db) {
    this.user = user || 'postgres';
    this.pw = pw || '';
    this.url = url || 'localhost';
    this.db = db || 'pyrostore';
    this.connection = 'postgres://' + this.user + ':' + this.pw + '@' + this.url + '/' + this.db;
}

Postgres.prototype.sampleQuery = function(callback) {
    pg.connect(this.connection, function(err, client, done) {
        if (err) {
            callback(err);
        } else {
            client.query('select $1::int as number', ['1'], function(err, result) {
                done();
                callback(err, result);
            });
        }
    });
};

exports.Client = Postgres;

