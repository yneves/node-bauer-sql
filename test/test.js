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
// - SQL

describe("SQL",function() {

	it("exports",function() {
		assert.deepEqual(lib.sql.drop(),new lib.sql.cls.Drop());
		assert.deepEqual(lib.sql.alter(),new lib.sql.cls.Alter());
		assert.deepEqual(lib.sql.select(),new lib.sql.cls.Select());
		assert.deepEqual(lib.sql.create(),new lib.sql.cls.Create());
		assert.deepEqual(lib.sql.update(),new lib.sql.cls.Update());
		assert.deepEqual(lib.sql.insert(),new lib.sql.cls.Insert());
		assert.deepEqual(lib.sql.delete(),new lib.sql.cls.Delete());
	});

	it("toText",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where({ field: "value", otherfield: { gt: 0 }, list: ["a","b","c"] }).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field = ? AND otherfield > ? AND list IN (?, ?, ?))",
			args: ["value",0,"a","b","c"],
		});
		var text = select.toText();
		assert.equal(text,"SELECT * FROM tablename WHERE (field = value AND otherfield > 0 AND list IN (a, b, c))");
		var quoted = select.toText(function(val,idx) {
			return "'"+val+"'";
		});
		assert.equal(quoted,"SELECT * FROM tablename WHERE (field = 'value' AND otherfield > '0' AND list IN ('a', 'b', 'c'))");
	});

});

// - -------------------------------------------------------------------- - //