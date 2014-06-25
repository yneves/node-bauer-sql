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
// - Insert

describe("Insert",function() {

	it("single",function() {
		var insert = new lib.sql.cls.Insert();
		var query = insert.into("tablename").fields("name","email").values("name","email").toQuery();
		assert.deepEqual(query,{
			text: "INSERT INTO tablename (name, email) VALUES (?, ?)",
			args: ["name","email"],
		});
	});

	it("multiple",function() {
		var insert = new lib.sql.cls.Insert();
		var query = insert.into("tablename").fields("name","email").values("name1","email1").values("name2","email2").toQuery();
		assert.deepEqual(query,{
			text: "INSERT INTO tablename (name, email) VALUES (?, ?), (?, ?)",
			args: ["name1","email1","name2","email2"],
		});
	});

});

// - -------------------------------------------------------------------- - //