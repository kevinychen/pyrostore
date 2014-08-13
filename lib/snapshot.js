/*
 * API for data snapshots.
 */

function Snapshot(data) {
    this.data = data;
}

Snapshot.prototype.val = function() {
    return this.data;
}

module.exports = Snapshot;

