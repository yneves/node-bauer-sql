// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	fs: require("fs"),
	sql: require("../"),
};

var assert = require("assert");

// - -------------------------------------------------------------------- - //
// - Parser

describe("Parser",function() {

	it("parse-create-table",function() {
		var parser = new lib.sql.cls.Parser();
		var text = "CREATE TABLE IF NOT EXISTS tbl (a INTEGER PRIMARY KEY, b TEXT, c REAL);";
		var query = parser.parseCreate(text);
		assert.deepEqual(query,{
			create: true,
			exists: true,
			table: "tbl",
			fields: { a: "INTEGER PRIMARY KEY", b: "TEXT", c: "REAL" },
		});
	});

	it("parse-create-table-keys",function() {
		var parser = new lib.sql.cls.Parser();
		var text = "CREATE TABLE IF NOT EXISTS tbl (a,b,c,d,e, PRIMARY KEY(a,b), FOREIGN KEY(c,d) REFERENCES parent(x,y));";
		var query = parser.parseCreate(text);
		assert.deepEqual(query,{
			create: true,
			exists: true,
			table: "tbl",
			fields: { a: "", b: "", c: "", d: "", e: "" },
			primaryKey: ["a,b"],
			foreignKey: { "c,d": "parent.x.y" },
		});
	});

	it("parse-create-index",function() {
		var parser = new lib.sql.cls.Parser();
	});

	it("parse-create-view",function() {
		var parser = new lib.sql.cls.Parser();
	});

	it("parse-create-trigger",function() {
		var parser = new lib.sql.cls.Parser();
	});


});

// - -------------------------------------------------------------------- - //
