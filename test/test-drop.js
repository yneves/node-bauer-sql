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
// - Drop

describe("Drop",function() {

	it("table",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.table("tablename").toQuery();
		assert.deepEqual(query,{
			text: "DROP TABLE tablename",
			args: [],
		});
	});

	it("exists",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.table("tablename").exists(true).toQuery();
		assert.deepEqual(query,{
			text: "DROP TABLE IF EXISTS tablename",
			args: [],
		});
	});

	it("index",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.index("indexname").toQuery();
		assert.deepEqual(query,{
			text: "DROP INDEX indexname",
			args: [],
		});
	});

	it("trigger",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.trigger("triggername").toQuery();
		assert.deepEqual(query,{
			text: "DROP TRIGGER triggername",
			args: [],
		});
	});

	it("view",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.view("viewname").toQuery();
		assert.deepEqual(query,{
			text: "DROP VIEW viewname",
			args: [],
		});
	});

});

// - -------------------------------------------------------------------- - //