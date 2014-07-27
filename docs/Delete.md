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

Includes join operations at the `FROM` clause. Currently `JOIN`, `INNER JOIN`, `LEFT JOIN`, `LEFT OUTER JOIN` and `CROSS JOIN` are available as they are the ones supported by `sqlite3`. It's simple to add or remove operators by modifying the `JOINS` array at the beginning of `lib/query.js` file.

```js
delete.join({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
delete.innertJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces INNER JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
delete.leftJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces LEFT JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
delete.leftOuterJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces LEFT OUTER JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
delete.crossJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces CROSS JOIN joinedtable ON (joinedtable.id = fromtable.id)
```
