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
