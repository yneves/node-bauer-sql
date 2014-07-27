node-bauer-sql
==============

Just another SQL building tool.

It was inspired by [Squel.js](http://hiddentao.github.io/squel/index.html), which i used for some time and is a great library.

## Installation

```
npm install bauer-sql
```

## Usage

The module provides the most common statements (SELECT, INSERT, DELETE, UPDATE, CREATE, ALTER, DROP). It was built to be used with `sqlite3` and works perfectly on it. Although it should work with other SQL dialects, since it covers common syntax. Unit tests covers only query building, not it's execution.

```js
// loads bauer-sql module
var sql = require("bauer-sql");

// builds data statements
var select = sql.select();
var insert = sql.insert();
var update = sql.update();
var delete = sql.delete();

// builds structure statements
var create = sql.create();
var drop = sql.drop();
var alter = sql.alter();

// other utilities
var parser = sql.parser();
var schema = sql.schema();
```

## API Reference

 * [Query](./docs/Query.md)
 * [Select](./docs/Select.md)
 * [Insert](./docs/Insert.md)
 * [Update](./docs/Update.md)
 * [Delete](./docs/Delete.md)
 * [Create](./docs/Create.md)
 * [Drop](./docs/Drop.md)
 * [Alter](./docs/Alter.md)
 * [Parser](./docs/Parser.md)
 * [Schema](./docs/Schema.md)

## License

MIT
