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

Builds the query and returns an object with `text` and `args` properties, so you can pass to your favorite executing library.

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

It accepts a string or a callback which can be used to quote values. Values aren't quoted by default.

```js
var text = queryObj.toText("'");
// same as
var text = queryObj.toText(function(val,idx) {
  return "'" + val + "'";
});
```
