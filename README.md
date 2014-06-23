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
var sql = require("bauer-sql");
```

## Query

The `sql.cls.Query` class is inherited by all other classes. Extending its prototype will make it available for all other kinds of statements.

```js
sql.cls.Query.prototype.execute = function() {
	var query = this.toQuery();
	sqlite3.run(query.text,query.args,function() {
	});
}
```

### .toQuery

Builds the query and returns an object with `text` and `args` properties, so you can give it to your favorite executing library.

```js
var query = queryObj.toQuery();
var text = query.text; // String
var args = query.args; // Array
```

### .toText

Builds the query by calling `.toQuery` and then replaces all `?` tokens with corresponding arguments. 

```js
var text = queryObj.toText();
```

It accepts a callback which can be used to quote values. Values aren't quoted by default.

```js
var text = queryObj.toText(function(val,idx) {
	return "'" + val + "'";
});
```

## Select

Builds a `SELECT` statement.

### Constructor

```js
var select = sql.select();
// same as
var select = new sql.cls.Select();
```

### .fields

Set the fields to be selected. Defaults to `*`.

```js
select.fields("table.*, other.fieldname AS name")
// same as
select.fields("table.*","other.fieldname AS name")
// same as
select.fields("table.*").fields({ "other.fieldname": "name" });
// produces SELECT table.*, other.fieldname AS name
```

### .from

Defines the `FROM` clause.

```js
select.from("table, other");
// same as
select.from("table","other");
// same as
select.from("table").from("other");
// produces FROM table, other
```

It accepts a `sql.cls.Select` instance.

```js
var from = sql.select().fields("table.*").from("table").where({ field: "value" });

select.from( from ).where({ other: "value" }); 
// produces SELECT * FROM (SELECT other.* FROM table WHERE field = ?) WHERE other = ?
```

### .where

Defines the `WHERE` clause.  

```js
select.where({ one: 1, two: 2 })
// produces WHERE (one = ? AND two = ?)
```

```js
select.where({ one: 1 }).where({ two: 2 })
// produces WHERE (one = ?) AND (two = ?)
```

A little more complex filtering.

```js
select.where({ one: { gt: 0, elt: 1 }, two: [2,3,4] })
// produces WHERE (one > ? AND one <= ? AND two IN (?, ?, ?))
```

```js
select.where({ one: { gt: 0, elt: 1 } }).where({ two: [2,3,4] })
// produces WHERE (one > ? AND one <= ?) AND (two IN (?, ?, ?))
```

All entries are combined with `AND` operator. To use `OR` call it passing a `String`. In this case the query arguments won't be handled.

```js
select.where("one = 1 OR one = 2","two = 3 OR two = 4");
// same as
select.where("one = 1 OR one = 2").where("two = 3 OR two = 4");
// produces WHERE (one = 1 OR one = 2) AND (two = 3 OR two = 4)
```

### .group

Defines the `GROUP BY` clause.

```js
select.group("one, two")
// same as
select.group("one","two")
// same as
select.group("one").group("two")
// produces GROUP BY one, two
```

### .order

Defines the `ORDER BY` clause.

```js
select.order("one, two DESC")
// same as
select.order("one","two DESC")
// same as
select.group("one").group("two DESC")
// produces ORDER BY one, two DESC
```

### .limit

Defines the `LIMIT` clause.

```js
select.limit("10, 20")
// same as
select.limit(10,20)
// same as
select.limit(10).limit(20)
// produces LIMIT 10, 20
```

### Joins

Includes join operations at the `FROM` clause. Currently `JOIN`, `INNER JOIN`, `LEFT JOIN`, `LEFT OUTER JOIN` and `CROSS JOIN` are available as they are the ones supported by `sqlite3`. It's simple to add or remove operators by modifying the `JOINS` array at the beginning of `sql.js` file.

```js
select.join({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
select.innertJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces INNER JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
select.leftJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces LEFT JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
select.leftOuterJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces LEFT OUTER JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
select.crossJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces CROSS JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

Operations can be combined having each entry representing a join operation.

```js
select
  .fields({ "a.id": "a", "b.id": "b","c.id": "c","d.id": "d","e.id": "e" })
  .from("a")
  .join({ "b": "b.id = a.bid", "c": "c.id = a.cid" })
  .leftJoin({ "d": "d.id = a.did" })
  .leftOuterJoin({ "e": "e.id = a.eid" })
// produces:
// SELECT a.id as a, b.id as b, c.id as c, d.id as d, e.id as e
// FROM a
// JOIN b ON (b.id = a.bid)
// JOIN c ON (c.id = a.cid)
// LEFT JOIN d ON (d.id = a.did)
// LEFT OUTER JOIN e ON (e.id = a.eid)
```

## Insert

Builds an `INSERT` statement.

### Constructor

```js
var insert = sql.insert();
// same as
var insert = new sql.cls.Insert();
```

### .into

Defines the `INTO` clause.

```js
insert.into("table")
// produces INSERT INTO table
```

### .fields

Defines the columns names in the given order.

```js
insert.into("table").fields("one, two, three")
// same as
insert.into("table").fields("one","two","three")
// same as
insert.into("table").fields("one").fields("two").fields("three")
// same as
insert.into("table").fields(["one","two","three"])
// produces INSERT INTO table (one, two, three)
```

### .values

Defines the records values. Unlike other methods, each call of `.values` defines a diferent record.

```js
insert.values(1,2,3)
// same as
insert.values([1,2,3])
//same as
insert.values(1,[2,3])
// produces VALUES (?, ?, ?)
```

To insert multiple records call `.values` as many times as needed.

```js
insert.values(1,2,3).values(1,2,3).values(1,2,3)
// produces VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)
```

## Update

Builds an `UPDATE` statement.

### Constructor

```js
var update = sql.update();
// same as
var update = new sql.cls.Update();
```

### .table

Defines the table to be updated.

```js
update.table("table")
// produces UPDATE table
```

### .set

Defines the `SET` clause.

```js
update.set({ one: 1, two: 2 })
// same as
update.set({ one: 1 },{ two: 2 })
// same as
update.set({ one: 1 }).set({ two: 2 })
// produces SET one = ?, two = ?
```

### .where

Works exactly the same as in Select statement. Please refer to its documentation.

### Joins

Works exactly the same as in Select statement. Please refer to its documentation.


## Delete

Builds a `DELETE` statement.

### Constructor

```js
var delete = sql.delete();
// same as
var delete = new sql.cls.Delete();
```

### .from

Defines the `FROM` clause.

```js
delete.from("table");
// produces DELETE FROM table
```

### .where

Works exactly the same as in Select statement. Please refer to its documentation.

```js
delete.from("table").where({ one: 1 });
// produces DELETE FROM table WHERE one = ?
```

### Joins

Works exactly the same as in Select statement. Please refer to its documentation.

## Create

Builds a `CREATE` statement.

### Constructor

```js
var create = sql.create();
// same as
var create = new sql.cls.Create();
```

### .table

Use the statement to create a table.

```js
create.table("tablename").fields({ id: "INTEGER PRIMARY KEY", one: "TEXT", two: "REAL" });
// same as
create.table("tablename").fields("id INTEGER PRIMARY KEY","one TEXT","two REAL");
// same as
create.table("tablename").fields("id INTEGER PRIMARY KEY").fields("one TEXT","two REAL");
// produces CREATE TABLE tablename (id INTEGER PRIMARY KEY, one TEXT, two REAL)
```

### .index

Use the statement to create an index.

```js
create.index("indexname").on("tablename").fields("one", "two");
// same as
create.index("indexname").on("tablename").fields(["one", "two"]);
// same as
create.index("indexname").on("tablename").fields("one").fields(["two"]);
// produces CREATE INDEX indexname ON tablename (one, two)
```

### .view

Use the statement to create a view.

```js
create.view("viewname").as("SELECT * from table WHERE one = 1")
// produces CREATE VIEW viewname AS SELECT * from table WHERE one = 1
```

It accepts a `sql.cls.Select` instance. In this case the select query is built by `.toText` method so it will need proper quoting.

```js
var select = sql.select().from("table").where({ one: 1, two: "'value'" });

create.view("viewname").as(select);
// produces CREATE VIEW viewname AS SELECT * from table WHERE (one = 1 AND two = 'value')
```

### .trigger

Use the statement to create a trigger.

```js
create.trigger("trgname").delete("tbl").do("INSERT INTO del (id) VALUES (old.id)");
// produces CREATE TRIGGER trgname DELETE ON tbl BEGIN INSERT INTO del (id) VALUES (old.id); END;
```

It covers `UPDATE` and `INSERT` triggers too. 

```js
create.trigger("trgname").update("tbl.field");
// produces CREATE TRIGGER trgname UPDATE OF field ON tbl
```

```js
create.trigger("trgname").update("tbl");
// produces CREATE TRIGGER trgname UPDATE ON tbl
```

```js
create.trigger("trgname").insert("tbl");
// produces CREATE TRIGGER trgname INSERT ON tbl
```

Another way of defining the trigger. Works for all kinds of triggers.

```js
create.trigger("trgname").update().of("field").on("table");
// produces CREATE TRIGGER trgname UPDATE OF field ON tbl
```


It accepts a `sql.cls.Query` instance at `.do` method. In this case the statement is built by `.toText` method so it will need proper quoting.

```js
var insert = sql.insert().into("del").fields("id").values("old.id");

create.trigger("trgname").delete("tbl").do(insert);
// produces CREATE TRIGGER trgname DELETE ON tbl BEGIN INSERT INTO del (id) VALUES (old.id); END;
```

You can call `.do` as many times as needed. Don't mind the `;`, it will be included if it's not already. 

```js
var insert = sql.insert().into("del").fields("id").values("old.id");

create.trigger("trgname").delete("tbl").do(insert).do(insert,insert);
// produces a big query which is covered by unit tests
```


### .exists

Includes the `IF EXISTS` or `IF NOT EXISTS` clause. It applies to all kinds of `CREATE` statements.

```js
create.table("tablename").exists(false);
// produces CREATE TABLE IF NOT EXISTS tablename
```

The following obviously doesn't make sense. It's just to keep consistency with the `DROP` statement.

```js
create.table("tablename").exists(true);
// produces CREATE TABLE IF EXISTS tablename
```

### .temp

Includes the `TEMPORARY` clause. It applies to tables and views. However the clause will be included in any kind of `CREATE` statement, so you should know when to use it.

```js
create.temp().table("temptable").fields("a TEXT");
// produces CREATE TEMPORARY TABLE temptable (a TEXT)
```

```js
create.temp().view("viewname").as("SELECT * FROM table WHERE one = 1");
// produces CREATE TEMPORARY VIEW viewname AS SELECT * from table WHERE (one = 1)
```

### .unique

Includes the `UNIQUE` clause. It applies only to indexes. However the clause will be included in any kind of `CREATE` statement, so you should know when to use it.

```js
create.unique().index("indexname").on("tablename");
// produces CREATE UNIQUE INDEX indexname ON tablename
```


## Alter

Builds an `ALTER` statement.

### Constructor

```js
var alter = sql.alter();
// same as
var alter = new sql.cls.Alter();
```

### .table

Defines the table to be altered.

```js
alter.table("tablename");
// produces ALTER TABLE tablename
```

### .rename

Includes the `RENAME TO` clause.

```js
alter.table("tablename").renamte("newname");
// produces ALTER TABLE tablename RENAME TO newname
```

### .add

Includes the `ADD COLUMN` clause.

```js
alter.table("tablename").add({ newfield: "TEXT" });
// produces ALTER TABLE tablename ADD COLUMN newfield TEXT
```

It can be used to add as many columns as needed. However this is not supported by `sqlite3`.

```js
alter.table("tablename").add({ one: "TEXT", two: "INTEGER" }).add("three REAL");
// produces ALTER TABLE tablename ADD COLUMN one TEXT, ADD COLUMN two INTEGER, ADD COLUMN three REAL
```

### .drop

Includes the `DROP COLUMN` clause. However this is not supported by `sqlite3`.

```js
alter.table("tablename").drop("oldfield");
// produces ALTER TABLE tablename DROP COLUMN oldfield
```

It can be used to add as drop columns as needed.

```js
alter.table("tablename").drop("one","two").drop("three");
// produces ALTER TABLE tablename DROP COLUMN one, DROP COLUMN two, DROP COLUMN three
```

## Drop

Builds a `DROP` statement. 

### Constructor

```js
var drop = sql.drop();
// same as
var drop = new sql.cls.Drop();
```

### .table

Use the statement to drop a table.

```js
drop.table("tablename")
// produces DROP TABLE tablename
```

### .index

Use the statement to drop an index.

```js
drop.index("indexname")
// produces DROP INDEX indexname
```

### .view

Use the statement to drop a view.

```js
drop.view("viewname")
// produces DROP VIEW viewname
```

### .trigger

Use the statement to drop a trigger.

```js
drop.trigger("triggername")
// produces DROP TRIGGER triggername
```

### .exists

Includes the `IF EXISTS` or `IF NOT EXISTS` clause. It applies to all kinds of `DROP` statements.

```js
drop.table("tablename").exists(true);
// produces DROP TABLE IF EXISTS tablename
```

The following obviously doesn't make sense. It's just to keep consistency with the `CREATE` statement.

```js
drop.table("tablename").exists(false);
// produces DROP TABLE IF NOT EXISTS tablename
```

## License

MIT