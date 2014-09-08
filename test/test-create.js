// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	sql: require("../"),
};

var assert = require("assert");

// - -------------------------------------------------------------------- - //
// - Create

describe("Create",function() {

	it("table",function() {
		var create = new lib.sql.cls.Create();
		var query = create.table("tablename").fields({ id: "INTEGER PRIMARY KEY", name: "TEXT", email: "TEXT" }).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TABLE tablename (id INTEGER PRIMARY KEY, name TEXT, email TEXT)",
			args: [],
		});
	});

	it("table-pk",function() {
		var create = new lib.sql.cls.Create();
		var query = create.table("tablename").fields({ one: "INTEGER", two: "INTEGER", three: "TEXT" }).primaryKey("one, two").toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TABLE tablename (one INTEGER, two INTEGER, three TEXT, PRIMARY KEY (one, two))",
			args: [],
		});
	});

	it("table-fk",function() {
		var create = new lib.sql.cls.Create();
		var query = create.table("tablename").fields({ id: "INTEGER PRIMARY KEY", name: "TEXT", email: "TEXT" }).foreignKey({ "name": "othertable.name" }).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TABLE tablename (id INTEGER PRIMARY KEY, name TEXT, email TEXT, FOREIGN KEY (name) REFERENCES othertable (name))",
			args: [],
		});
	});

	it("table-keys",function() {
		var create = new lib.sql.cls.Create();
		var query = create.table("tablename").fields({ id: "INTEGER", name: "TEXT", email: "TEXT" }).primaryKey("id").foreignKey({ "name": "othertable.name" }).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TABLE tablename (id INTEGER, name TEXT, email TEXT, PRIMARY KEY (id), FOREIGN KEY (name) REFERENCES othertable (name))",
			args: [],
		});
	});

	it("exists",function() {
		var create = new lib.sql.cls.Create();
		var query = create.table("tablename").exists(false).fields({ id: "INTEGER PRIMARY KEY", name: "TEXT", email: "TEXT" }).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TABLE IF NOT EXISTS tablename (id INTEGER PRIMARY KEY, name TEXT, email TEXT)",
			args: [],
		});
	});

	it("index",function() {
		var create = new lib.sql.cls.Create();
		var query = create.index("indexname").on("tablename").fields("name", "email").toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE INDEX indexname ON tablename (name, email)",
			args: [],
		});
	});

	it("index-unique",function() {
		var create = new lib.sql.cls.Create();
		var query = create.unique().index("indexname").on("tablename").fields("name", "email").toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE UNIQUE INDEX indexname ON tablename (name, email)",
			args: [],
		});
	});

	it("trigger",function() {
		var insert = new lib.sql.cls.Insert();
		insert.into("tablename").fields("name, email").values("old.name","new.email");
		var create = new lib.sql.cls.Create();
		var query = create.trigger("triggername").delete().on("tablename").do(insert).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TRIGGER triggername DELETE ON tablename BEGIN INSERT INTO tablename (name, email) VALUES (old.name, new.email); END",
			args: [],
		});
	});

	it("trigger-of",function() {
		var insert = new lib.sql.cls.Insert();
		insert.into("tablename").fields("name, email").values("old.name","new.email");
		var create = new lib.sql.cls.Create();
		var query = create.trigger("triggername").update().of("name").on("tablename").do(insert).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TRIGGER triggername UPDATE OF name ON tablename BEGIN INSERT INTO tablename (name, email) VALUES (old.name, new.email); END",
			args: [],
		});
	});

	it("trigger-short",function() {
		var insert = new lib.sql.cls.Insert();
		insert.into("tablename").fields("name, email").values("old.name","new.email");
		var create = new lib.sql.cls.Create();
		var query = create.trigger("triggername").update("tablename").do(insert).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TRIGGER triggername UPDATE ON tablename BEGIN INSERT INTO tablename (name, email) VALUES (old.name, new.email); END",
			args: [],
		});
	});

	it("trigger-of-short",function() {
		var insert = new lib.sql.cls.Insert();
		insert.into("tablename").fields("name, email").values("old.name","new.email");
		var create = new lib.sql.cls.Create();
		var query = create.trigger("triggername").update("tablename.name").do(insert).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TRIGGER triggername UPDATE OF name ON tablename BEGIN INSERT INTO tablename (name, email) VALUES (old.name, new.email); END",
			args: [],
		});
	});

	it("trigger-do-multiple",function() {
		var insert = new lib.sql.cls.Insert();
		insert.into("tablename").fields("name, email").values("old.name","new.email");
		var create = new lib.sql.cls.Create();
		var query = create.trigger("triggername").update("tablename.name").do(insert).do(insert).do(insert).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TRIGGER triggername UPDATE OF name ON tablename BEGIN INSERT INTO tablename (name, email) VALUES (old.name, new.email); INSERT INTO tablename (name, email) VALUES (old.name, new.email); INSERT INTO tablename (name, email) VALUES (old.name, new.email); END",
			args: [],
		});
	});

	it("view",function() {
		var create = new lib.sql.cls.Create();
		var query = create.view("viewname").as("SELECT one, two FROM tablename WHERE one = ?").toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE VIEW viewname AS SELECT one, two FROM tablename WHERE one = ?",
			args: [],
		});
	});

	it("view-temp",function() {
		var create = new lib.sql.cls.Create();
		var query = create.temp().view("viewname").as("SELECT one, two FROM tablename WHERE one = 1").toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE TEMPORARY VIEW viewname AS SELECT one, two FROM tablename WHERE one = 1",
			args: [],
		});
	});

	it("view-object",function() {
		var select = new lib.sql.cls.Select();
		select.fields("one, two").from("tablename").where({ one: 1 });
		var create = new lib.sql.cls.Create();
		var query = create.view("viewname").exists(false).as(select).toQuery();
		assert.deepEqual(query,{
			type: "create",
			text: "CREATE VIEW IF NOT EXISTS viewname AS SELECT one, two FROM tablename WHERE (one = 1)",
			args: [],
		});
	});

});

// - -------------------------------------------------------------------- - //
