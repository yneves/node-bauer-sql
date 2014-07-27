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

Includes join operations at the `FROM` clause. Currently `JOIN`, `INNER JOIN`, `LEFT JOIN`, `LEFT OUTER JOIN` and `CROSS JOIN` are available as they are the ones supported by `sqlite3`. It's simple to add or remove operators by modifying the `JOINS` array at the beginning of `lib/query.js` file.

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
