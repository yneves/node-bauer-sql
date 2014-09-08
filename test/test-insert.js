// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	sql: require("../"),
};

var assert = require("assert");

// - -------------------------------------------------------------------- - //
// - Insert

describe("Insert",function() {

	it("single",function() {
		var insert = new lib.sql.cls.Insert();
		var query = insert.into("tablename").fields("name","email").values("name","email").toQuery();
		assert.deepEqual(query,{
			type: "insert",
			text: "INSERT INTO tablename (name, email) VALUES (?, ?)",
			args: ["name","email"],
		});
	});

	it("multiple",function() {
		var insert = new lib.sql.cls.Insert();
		var query = insert.into("tablename").fields("name","email").values("name1","email1").values("name2","email2").toQuery();
		assert.deepEqual(query,{
			type: "insert",
			text: "INSERT INTO tablename (name, email) VALUES (?, ?), (?, ?)",
			args: ["name1","email1","name2","email2"],
		});
	});

});

// - -------------------------------------------------------------------- - //
