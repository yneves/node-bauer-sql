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

Its possible to define primary and foreign keys also.

```js
create.table("tablename").fields({ a: "INTEGER", b: "INTEGER", c: "TEXT" }).primaryKey("a","b");
// produces CREATE TABLE tablename (a INTEGER, b INTEGER, c TEXT, PRIMARY KEY (a,b))
```

```js
create.table("tablename").fields({ a: "INTEGER", b: "INTEGER" }).foreignKey({ b: "parent.id" });
// produces CREATE TABLE tablename (a INTEGER, b INTEGER, FOREIGN KEY (b) REFERENCES parent (id))
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
