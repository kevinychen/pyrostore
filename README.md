Pyrostore
=========

Mirror for firebase API with a custom database.

## Installation

    npm install pyrostore

## Setup

Currently Pyrostore links only to Postgres. Create a Postgres database with a table called `store`.

```sql
CREATE TABLE store (key TEXT UNIQUE, value TEXT);

```

## Usage

Create a new pyrostore object with some unique identifier and a URL to your postgres database.

```javascript
var Pyrostore = require('pyrostore');

var pyro = new Pyrostore('identifier');
pyro.auth('postgres://username:password@host:port/db_name');

```

Firebase API methods can then be called on the pyrostore object.

```javascript
pyro.child('child').set(1);
pyro.child('inlaw').set({x: 'bro', y: 'sis'});
pyro.once('value', function(data) { console.log(data.val()); }
pyro.child('inlaw/x').transaction(function(data) { return data + '!' });

```

## License

The MIT License (MIT)

Copyright (c) 2014 kyc

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

