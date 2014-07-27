## Parser

Parses SQL statements.

NOTE: this is not the greatest SQL parser since it does not solve the semicolon-inside-quotes problem.

### Constructor

```js
var parser = sql.schema();
// same as
var parser = new sql.cls.Parser();
```

### .parseCreate

Parses a `CREATE` statement.

```js
var create = parser.parseCreate("CREATE TABLE tablename (id INTEGER, pid INTEGER, name TEXT, email TEXT, PRIMARY KEY (id), FOREIGN KEY (pid) REFERENCES parent (id))");
assert.deepEqual(create,{
  table: "tablename",
  fields: {
    id: "INTEGER",
    name: "TEXT",
    email: "TEXT",
  },
  primaryKey: [
    "id"
  ],
  foreignKey: {
    pid: "parent.id",
  }
});
```

```js
var create = parser.parseCreate("CREATE INDEX indexname ON tablename (name)");
assert.deepEqual(create,{
  index: "indexname",
  on: "tablename",
  fields: [
    "name"
  ],
});
```

```js
var create = parser.parseCreate("CREATE VIEW IF NOT EXISTS viewname AS SELECT tasks.*, versions.name as version, projects.name as project, count(tasklabels.id) as labels FROM tasks LEFT JOIN tasklabels ON tasklabels.tid = tasks.id LEFT JOIN versions ON versions.id = tasks.vid LEFT JOIN projects ON projects.id = tasks.pid GROUP BY tasks.id");
assert.deepEqual(create,{
  view: "viewname",
  as: "SELECT ....",
});
```

```js
var create = parser.parseCreate("CREATE TRIGGER IF NOT EXISTS triggername AFTER UPDATE OF pid ON tasks WHEN (new.pid > 0) BEGIN UPDATE tasklabels SET pid = new.pid WHERE tasklabels.tid = new.id; END");
assert.deepEqual(create,{
  trigger: "triggername",
  after: true,
  update: true,
  when: "new.pid > 0",
  on: "tasks",
  of: "pid",
  do: [
    "UPDATE tasklabels SET pid = new.pid WHERE tasklabels.tid = new.id",
  ],
});
```
