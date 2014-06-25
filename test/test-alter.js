/*!
**  bauer-sql -- Just another SQL building tool.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-sql>
*/
// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	sql: require("../"),
};

var assert = require("assert");

// - -------------------------------------------------------------------- - //
// - Alter

describe("Alter",function() {

	it("add",function() {
		var alter = new lib.sql.cls.Alter();
		var query = alter.table("tablename").add({ name: "TEXT" }).toQuery();
		assert.deepEqual(query,{
			text: "ALTER TABLE tablename ADD COLUMN name TEXT",
			args: [],
		});
	});

	it("add-multiple",function() {
		var alter = new lib.sql.cls.Alter();
		var query = alter.table("tablename").add({ one: "TEXT" }).add({ two: "INTEGER", three: "REAL" }).add("four INTEGER").toQuery();
		assert.deepEqual(query,{
			text: "ALTER TABLE tablename ADD COLUMN one TEXT, ADD COLUMN two INTEGER, ADD COLUMN three REAL, ADD COLUMN four INTEGER",
			args: [],
		});
	});

	it("drop",function() {
		var alter = new lib.sql.cls.Alter();
		var query = alter.table("tablename").drop("name").toQuery();
		assert.deepEqual(query,{
			text: "ALTER TABLE tablename DROP COLUMN name",
			args: [],
		});
	});

	it("drop-multiple",function() {
		var alter = new lib.sql.cls.Alter();
		var query = alter.table("tablename").drop("one","two","three").drop(["four","five","six"]).toQuery();
		assert.deepEqual(query,{
			text: "ALTER TABLE tablename DROP COLUMN one, DROP COLUMN two, DROP COLUMN three, DROP COLUMN four, DROP COLUMN five, DROP COLUMN six",
			args: [],
		});
	});

	it("rename",function() {
		var alter = new lib.sql.cls.Alter();
		var query = alter.table("tablename").rename("othertable").toQuery();
		assert.deepEqual(query,{
			text: "ALTER TABLE tablename RENAME TO othertable",
			args: [],
		});
	});

});

// - -------------------------------------------------------------------- - //