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
			type: "drop",
			text: "DROP TABLE tablename",
			args: [],
		});
	});

	it("exists",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.table("tablename").exists(true).toQuery();
		assert.deepEqual(query,{
			type: "drop",
			text: "DROP TABLE IF EXISTS tablename",
			args: [],
		});
	});

	it("index",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.index("indexname").toQuery();
		assert.deepEqual(query,{
			type: "drop",
			text: "DROP INDEX indexname",
			args: [],
		});
	});

	it("trigger",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.trigger("triggername").toQuery();
		assert.deepEqual(query,{
			type: "drop",
			text: "DROP TRIGGER triggername",
			args: [],
		});
	});

	it("view",function() {
		var drop = new lib.sql.cls.Drop();
		var query = drop.view("viewname").toQuery();
		assert.deepEqual(query,{
			type: "drop",
			text: "DROP VIEW viewname",
			args: [],
		});
	});

});

// - -------------------------------------------------------------------- - //
