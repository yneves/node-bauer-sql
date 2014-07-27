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

### .from

Includes a `Select` statement to provide the records to be inserted.

```js
insert.into("mytable").fields("one","two").from("SELECT * FROM sometable");
// produces
INSERTO INTO mytable (one, two) SELECT * FROM sometable
```

It accepts a `sql.cls.Query` instance. In this case the select query is built by `.toText` method so it will need proper quoting.

```js
var select = sql.select().from("mytable");
insert.into("mytable").fields("one","two").from(select);
// produces
INSERTO INTO mytable (one, two) SELECT * FROM sometable
```
