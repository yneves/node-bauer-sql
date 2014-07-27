/*!
**  bauer-sql -- Just another SQL building tool.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-sql>
*/
// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	factory: require("bauer-factory"),
	query: require("./lib/query.js"),
	schema: require("./lib/schema.js"),
	parser: require("./lib/parser.js"),
	randomizer: require("./lib/randomizer.js"),
};

// - -------------------------------------------------------------------- - //
// - exports

exports = {};
exports.drop = function() { return new lib.query.Drop() };
exports.alter = function() { return new lib.query.Alter() };
exports.select = function() { return new lib.query.Select() };
exports.insert = function() { return new lib.query.Insert() };
exports.update = function() { return new lib.query.Update() };
exports.delete = function() { return new lib.query.Delete() };
exports.create = function() { return new lib.query.Create() };

exports.schema = function(arg) { return new lib.schema(arg) };
exports.parser = function(arg) { return new lib.parser(arg) };
exports.randomizer = function(arg) { return new lib.randomizer(arg) };

exports.cls = {};
exports.cls.Query = lib.query.Query;
exports.cls.Drop = lib.query.Drop;
exports.cls.Alter = lib.query.Alter;
exports.cls.Select = lib.query.Select;
exports.cls.Insert = lib.query.Insert;
exports.cls.Update = lib.query.Update;
exports.cls.Delete = lib.query.Delete;
exports.cls.Create = lib.query.Create;

exports.cls.Parser = lib.parser;
exports.cls.Schema = lib.schema;
exports.cls.Randomizer = lib.randomizer;

module.exports = exports;

// - -------------------------------------------------------------------- - //