// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	sql: require("../"),
};

var assert = require("assert");

// - -------------------------------------------------------------------- - //
// - Update

describe("Update",function() {

	it("set",function() {
		var update = new lib.sql.cls.Update();
		var query = update.table("tablename").set({ name: "myname", email: "myemail" }).toQuery();
		assert.deepEqual(query,{
			text: "UPDATE tablename SET name = ?, email = ?",
			args: ["myname","myemail"],
		});
	});

	it("where",function() {
		var update = new lib.sql.cls.Update();
		var query = update.table("tablename").set({ name: "myname", email: "myemail" }).where({ field: "value", otherfield: { gt: 0 }, list: ["a","b","c"] }).toQuery();
		assert.deepEqual(query,{
			text: "UPDATE tablename SET name = ?, email = ? WHERE (field = ? AND otherfield > ? AND list IN (?, ?, ?))",
			args: ["myname","myemail","value",0,"a","b","c"],
		});
	});

	it("join",function() {
		var update = new lib.sql.cls.Update();
		var query = update.table("tablename").set({ name: "myname", email: "myemail" }).leftJoin({ othertable: "othertable.id = tablename.otherid" }).where({ field: "value" }).toQuery();
		assert.deepEqual(query,{
			text: "UPDATE tablename LEFT JOIN othertable ON (othertable.id = tablename.otherid) SET name = ?, email = ? WHERE (field = ?)",
			args: ["myname","myemail","value"],
		});
	});

	it("join-multiple",function() {
		var update = new lib.sql.cls.Update();
		var query = update.table("t")
			.leftJoin({ o: "o.id = t.oid" })
			.leftJoin({ a: "a.id = t.aid" },{ b: "b.id = t.bid", c: "c.id = t.cid" })
			.set({ name: "myname", email: "myemail" })
			.toQuery();
		assert.deepEqual(query,{
			text: "UPDATE t LEFT JOIN o ON (o.id = t.oid) LEFT JOIN a ON (a.id = t.aid) LEFT JOIN b ON (b.id = t.bid) LEFT JOIN c ON (c.id = t.cid) SET name = ?, email = ?",
			args: ["myname","myemail"],
		});
	});

});

// - -------------------------------------------------------------------- - //