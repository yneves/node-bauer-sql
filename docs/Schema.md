## Schema

Works with database schemas in JSON and SQL formats.

### Constructor

```js
var schema = sql.schema();
// same as
var schema = new sql.cls.Schema();
```

### .toJSON

Returns the database definition in JSON format. Its possible to read previously generated SQL statements and export as JSON.

```js
var definition = schema.toJSON(); // Object
```

### .fromJSON

Accepts a database definition in JSON format. The definition can be read from a file or passed directly.

```js
schema.fromJSON("path-to-json-file.json"); // sync
schema.fromJSON("path-to-json-file.json",callback); // async
```

```js
schema.fromJSON({
	"tables": {
		"projects": {
			"fields": {
				"id": "INTEGER",
				"name": "TEXT",
				"checked": "INTEGER"
			},
			"primaryKey": [
				"id",
			],
		},
		"versions": {
			"fields": {
				"id": "INTEGER PRIMARY KEY",
				"pid": "INTEGER",
				"name": "TEXT",
				"checked": "INTEGER",
			},
			"foreignKey": {
				"pid": "projects.id",
			},
		},
		"labels": {
			"fields": {
				"id": "INTEGER PRIMARY KEY",
				"pid": "INTEGER REFERENCES projects(id)",
				"name": "TEXT",
				"checked": "INTEGER",
			},
		},
		"tasks": {
			"fields": {
				"id": "INTEGER PRIMARY KEY",
				"pid": "INTEGER REFERENCES projects(id)",
				"vid": "INTEGER REFERENCES versions(id)",
				"text": "TEXT",
				"checked": "INTEGER",
			},
		},
		"tasklabels": {
			"fields": {
				"id": "INTEGER PRIMARY KEY",
				"pid": "INTEGER REFERENCES projects(id)",
				"vid": "INTEGER REFERENCES versions(id)",
				"tid": "INTEGER REFERENCES tasks(id)",
				"lid": "INTEGER REFERENCES labels(id)",
			},
		},
	},
	"indexes": {
		"pchecked": {
			"table": "projects",
			"fields": ["checked"],
		},
		"vproject": {
			"table": "versions",
			"fields": ["pid"],
		},
		"vchecked": {
			"table": "versions",
			"fields": ["pid","checked"],
		},
		"lname": {
			"table"	: "labels",
			"fields": ["name"],
			"unique": true,
		},
		"lproject": {
			"table"	: "labels",
			"fields": ["pid"],
		},
		"lchecked": {
			"table"	: "labels",
			"fields": ["pid","checked"],
		},
		"tproject": {
			"table": "tasks",
			"fields": ["pid"],
		},
		"tversion": {
			"table": "tasks",
			"fields": ["vid"],
		},
		"tchecked": {
			"table": "tasks",
			"fields": ["pid","checked"],
		},
	},
	"triggers": {
		"update_task": {
			"update": "tasks",
			"do": [
				"UPDATE tasklabels SET vid = new.vid WHERE tasklabels.tid = new.id",
				"UPDATE tasklabels SET pid = new.pid WHERE tasklabels.tid = new.id",
			],
		},
		"update_task_version": {
			"update": "tasks.vid",
			"do": [
				"UPDATE tasklabels SET vid = new.vid WHERE tasklabels.tid = new.id",
			],
		},
		"update_task_project": {
			"after": true,
			"update": "tasks.pid",
			"when": "new.pid > 0",
			"do": [
				"UPDATE tasklabels SET pid = new.pid WHERE tasklabels.tid = new.id",
			],
		},
	},
	"views": {
		"tasklist": "SELECT tasks.*, versions.name as version, projects.name as project, count(tasklabels.id) as labels FROM tasks LEFT JOIN tasklabels ON tasklabels.tid = tasks.id LEFT JOIN versions ON versions.id = tasks.vid LEFT JOIN projects ON projects.id = tasks.pid GROUP BY tasks.id"
	},
});
```

### .toSQL

Returns all `CREATE` statements necessary to create the database structure.

```js
var queries = schema.toSQL(); // String
```

For the above JSON definition, produces the following.

```sql
CREATE TABLE IF NOT EXISTS projects (id INTEGER, name TEXT, checked INTEGER, PRIMARY KEY (id));
CREATE TABLE IF NOT EXISTS versions (id INTEGER PRIMARY KEY, pid INTEGER, name TEXT, checked INTEGER, FOREIGN KEY (pid) REFERENCES projects (id));
CREATE TABLE IF NOT EXISTS labels (id INTEGER PRIMARY KEY, pid INTEGER REFERENCES projects(id), name TEXT, checked INTEGER);
CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, pid INTEGER REFERENCES projects(id), vid INTEGER REFERENCES versions(id), text TEXT, checked INTEGER);
CREATE TABLE IF NOT EXISTS tasklabels (id INTEGER PRIMARY KEY, pid INTEGER REFERENCES projects(id), vid INTEGER REFERENCES versions(id), tid INTEGER REFERENCES tasks(id), lid INTEGER REFERENCES labels(id));
CREATE INDEX IF NOT EXISTS pchecked ON projects (checked);
CREATE INDEX IF NOT EXISTS vproject ON versions (pid);
CREATE INDEX IF NOT EXISTS vchecked ON versions (pid, checked);
CREATE UNIQUE INDEX IF NOT EXISTS lname ON labels (name);
CREATE INDEX IF NOT EXISTS lproject ON labels (pid);
CREATE INDEX IF NOT EXISTS lchecked ON labels (pid, checked);
CREATE INDEX IF NOT EXISTS tproject ON tasks (pid);
CREATE INDEX IF NOT EXISTS tversion ON tasks (vid);
CREATE INDEX IF NOT EXISTS tchecked ON tasks (pid, checked);
CREATE VIEW IF NOT EXISTS tasklist AS SELECT tasks.*, versions.name as version, projects.name as project, count(tasklabels.id) as labels FROM tasks LEFT JOIN tasklabels ON tasklabels.tid = tasks.id LEFT JOIN versions ON versions.id = tasks.vid LEFT JOIN projects ON projects.id = tasks.pid GROUP BY tasks.id;
CREATE TRIGGER IF NOT EXISTS update_task UPDATE ON tasks BEGIN UPDATE tasklabels SET vid = new.vid WHERE tasklabels.tid = new.id; UPDATE tasklabels SET pid = new.pid WHERE tasklabels.tid = new.id; END;
CREATE TRIGGER IF NOT EXISTS update_task_version UPDATE OF vid ON tasks BEGIN UPDATE tasklabels SET vid = new.vid WHERE tasklabels.tid = new.id; END;
CREATE TRIGGER IF NOT EXISTS update_task_project AFTER UPDATE OF pid ON tasks WHEN (new.pid > 0) BEGIN UPDATE tasklabels SET pid = new.pid WHERE tasklabels.tid = new.id; END;
```

### .fromSQL

Accepts one `CREATE` statement to be included in the schema. The statement is parsed by the `Parser.parseCreate` method.

```js
schema.fromSQL("CREATE ...")
```
