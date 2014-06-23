// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	sql: require("../"),
};

var assert = require("assert");

// - -------------------------------------------------------------------- - //
// - Select

describe("Select",function() {

	it("from",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename",
			args: [],
		});
	});

	it("from-select",function() {
		var select = new lib.sql.cls.Select();
		var fromSelect = new lib.sql.cls.Select().fields("one, two").from("tablename").where({ one: 1 });
		var query = select.from(fromSelect).where({ two: 2 }).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM (SELECT one, two FROM tablename WHERE (one = ?)) WHERE (two = ?)",
			args: [1,2],
		});
	});

	it("fields",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").fields("id","name","email").toQuery();
		assert.deepEqual(query,{
			text: "SELECT id, name, email FROM tablename",
			args: [],
		});
	});

	it("where",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where({ field: "value", otherfield: { gt: 0 }, list: ["a","b","c"] }).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field = ? AND otherfield > ? AND list IN (?, ?, ?))",
			args: ["value",0,"a","b","c"],
		});
	});

	it("where-multiple",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where({ field: "value" },{ otherfield: { gt: 0 } },{ list: ["a","b","c"] }).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field = ?) AND (otherfield > ?) AND (list IN (?, ?, ?))",
			args: ["value",0,"a","b","c"],
		});
	});

	it("where-or",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where("field = 1 OR field = 2").where({ one: 2 }).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field = 1 OR field = 2) AND (one = ?)",
			args: [2],
		});
	});

	it("where-equal-greater-lesser",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where({ field: { gt: 0, lt: 1 }, other: { egt: 0, elt: 1 } }).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field > ? AND field < ? AND other >= ? AND other <= ?)",
			args: [0,1,0,1],
		});
	});

	it("join",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").leftJoin({ othertable: "othertable.id = tablename.otherid" }).where({ field: "value" }).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename LEFT JOIN othertable ON (othertable.id = tablename.otherid) WHERE (field = ?)",
			args: ["value"],
		});
	});

	it("join-multiple",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("t")
			.leftJoin({ o: "o.id = t.oid" })
			.leftJoin({ a: "a.id = t.aid" },{ b: "b.id = t.bid", c: "c.id = t.cid" })
			.toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM t LEFT JOIN o ON (o.id = t.oid) LEFT JOIN a ON (a.id = t.aid) LEFT JOIN b ON (b.id = t.bid) LEFT JOIN c ON (c.id = t.cid)",
			args: [],
		});
	});

	it("join-all",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("t")
			.join({ o: "o.id = t.oid" })
			.leftJoin({ a: "a.id = t.aid" })
			.leftOuterJoin({ b: "b.id = t.bid" })
			.innerJoin({ c: "c.id = t.cid" })
			.toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM t JOIN o ON (o.id = t.oid) LEFT JOIN a ON (a.id = t.aid) LEFT OUTER JOIN b ON (b.id = t.bid) INNER JOIN c ON (c.id = t.cid)",
			args: [],
		});
	});

	it("order",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where({ field: "value" }).order("field").toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field = ?) ORDER BY field",
			args: ["value"],
		});
	});

	it("order-multiple",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").order("one","two").order("three DESC").toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename ORDER BY one, two, three DESC",
			args: [],
		});
	});

	it("group",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where({ field: "value" }).order("field").group("otherfield").toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field = ?) GROUP BY otherfield ORDER BY field",
			args: ["value"],
		});
	});

	it("group-multiple",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").group("one","two").group("three").toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename GROUP BY one, two, three",
			args: [],
		});
	});

	it("limit",function() {
		var select = new lib.sql.cls.Select();
		var query = select.from("tablename").where({ field: "value" }).order("field").group("otherfield").limit(10,10).toQuery();
		assert.deepEqual(query,{
			text: "SELECT * FROM tablename WHERE (field = ?) GROUP BY otherfield ORDER BY field LIMIT 10, 10",
			args: ["value"],
		});
	});

});

// - -------------------------------------------------------------------- - //