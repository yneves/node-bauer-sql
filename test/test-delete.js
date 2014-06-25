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
// - Delete

describe("Delete",function() {

	it("from",function() {
		var del = new lib.sql.cls.Delete();
		var query = del.from("tablename").toQuery();
		assert.deepEqual(query,{
			text: "DELETE FROM tablename",
			args: [],
		});
	});

	it("where",function() {
		var del = new lib.sql.cls.Delete();
		var query = del.from("tablename").where({ field: "value", otherfield: { gt: 0 }, list: ["a","b","c"] }).toQuery();
		assert.deepEqual(query,{
			text: "DELETE FROM tablename WHERE (field = ? AND otherfield > ? AND list IN (?, ?, ?))",
			args: ["value",0,"a","b","c"],
		});
	});

	it("join",function() {
		var del = new lib.sql.cls.Delete();
		var query = del.from("tablename").leftJoin({ othertable: "othertable.id = tablename.otherid" }).where({ field: "value" }).toQuery();
		assert.deepEqual(query,{
			text: "DELETE FROM tablename LEFT JOIN othertable ON (othertable.id = tablename.otherid) WHERE (field = ?)",
			args: ["value"],
		});
	});

	it("join-multiple",function() {
		var del = new lib.sql.cls.Delete();
		var query = del.from("t")
			.leftJoin({ o: "o.id = t.oid" })
			.leftJoin({ a: "a.id = t.aid" },{ b: "b.id = t.bid", c: "c.id = t.cid" })
			.toQuery();
		assert.deepEqual(query,{
			text: "DELETE FROM t LEFT JOIN o ON (o.id = t.oid) LEFT JOIN a ON (a.id = t.aid) LEFT JOIN b ON (b.id = t.bid) LEFT JOIN c ON (c.id = t.cid)",
			args: [],
		});
	});

});

// - -------------------------------------------------------------------- - //