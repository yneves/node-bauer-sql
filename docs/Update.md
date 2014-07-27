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

Includes join operations. Currently `JOIN`, `INNER JOIN`, `LEFT JOIN`, `LEFT OUTER JOIN` and `CROSS JOIN` are available as they are the ones supported by `sqlite3`. It's simple to add or remove operators by modifying the `JOINS` array at the beginning of `lib/query.js` file.

```js
update.join({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
update.innertJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces INNER JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
update.leftJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces LEFT JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
update.leftOuterJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces LEFT OUTER JOIN joinedtable ON (joinedtable.id = fromtable.id)
```

```js
update.crossJoin({ "joinedtable": "joinedtable.id = fromtable.id" })
// produces CROSS JOIN joinedtable ON (joinedtable.id = fromtable.id)
```
