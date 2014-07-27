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
