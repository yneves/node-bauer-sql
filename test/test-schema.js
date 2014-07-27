// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	fs: require("fs"),
	sql: require("../"),
};

// function diff(a,b) {
// 	lib.fs.writeFileSync( __dirname + "/a.json", JSON.stringify(a,null,2), "utf8");
// 	lib.fs.writeFileSync( __dirname + "/b.json", JSON.stringify(b,null,2), "utf8");
// }

var assert = require("assert");

var sample = require("./sample-schema.js");

// - -------------------------------------------------------------------- - //
// - Schema

describe("Schema",function() {

	it("schema-json-data",function() {
		var schema = new lib.sql.cls.Schema();
		schema.fromJSON(sample);
		assert.deepEqual(sample,schema.toJSON());
	});

	it("schema-json-file-sync",function() {
		var schema = new lib.sql.cls.Schema();
		schema.fromJSON(__dirname + "/sample-schema.json");
		assert.deepEqual(sample,schema.toJSON());
	});

	it("schema-json-file-async",function(done) {
		var schema = new lib.sql.cls.Schema();
		schema.fromJSON(__dirname + "/sample-schema.json",function(error) {
			assert.deepEqual(sample,schema.toJSON());
			done(error);
		});
	});

	it("schema-sql",function(done) {
		var schema = new lib.sql.cls.Schema();
		lib.fs.readFile(__dirname + "/sample-schema.sql","utf8",function(error,content) {
			if (error) {
				done(error);
			} else {
				content.split("\n").forEach(function(line) {
					schema.fromSQL(line);
				});
				assert.deepEqual(sample,schema.toJSON());
				done();
			}
		});
	});

	it("schema-sql-2",function(done) {
		var schema = new lib.sql.cls.Schema();
		schema.fromJSON(sample);
		var sql = schema.toSQL();
		lib.fs.readFile(__dirname + "/sample-schema.sql","utf8",function(error,content) {
			if (error) {
				done(error);
			} else {
				assert.deepEqual(sql.trim(),content.trim());
				done();
			}
		});
	});

	it("schema-randomize",function() {
		for (var length = 2; length < 50; length += 2) {
			var schema = new lib.sql.cls.Schema();
			schema.randomize({
				tables: length,
				indexes: length,
				fields: length,
			});
			var json = schema.toJSON();
			assert.ok(typeof json == "object");
			assert.ok(typeof json.tables == "object");
			assert.ok(typeof json.indexes == "object");
			assert.ok(typeof json.views == "object");
			assert.ok(typeof json.triggers == "object");
			assert.ok(Object.keys(json.tables).length == length);
			for (var table in json.tables) {
				assert.ok(Object.keys(json.tables[table].fields).length == length);
			}
			var indexes = 0;
			for (var index in json.indexes) {
				assert.ok(typeof json.indexes[index] == "object");
				indexes++;
			}
			assert.ok(indexes == length);
		}
	});

});

// - -------------------------------------------------------------------- - //
