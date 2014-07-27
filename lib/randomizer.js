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
};

// - -------------------------------------------------------------------- - //

// @Randomizer
var Randomizer = lib.factory.class({

	// @inherits
	inherits: "events.EventEmitter",

	// @constructor
	constructor: function(arg) {

		var config = {};

		if (lib.factory.isObject(arg)) {

			if (lib.factory.isObject(arg.config)) config = arg.config;

			if (lib.factory.isFunction(arg.table)) this.on("table",arg.table);
			if (lib.factory.isFunction(arg.index)) this.on("index",arg.index);
			if (lib.factory.isFunction(arg.view)) this.on("view",arg.view);
			if (lib.factory.isFunction(arg.trigger)) this.on("trigger",arg.trigger);
			if (lib.factory.isFunction(arg.record)) this.on("record",arg.record);
			if (lib.factory.isFunction(arg.begin)) this.on("begin",arg.begin);
			if (lib.factory.isFunction(arg.end)) this.on("end",arg.end);
		}
		
		if (!lib.factory.isArray(config.types)) {
			config.types = [
				"INTEGER",
				"TEXT",
				"REAL",
				"BLOB",
			];
		}

		if (!lib.factory.isArray(config.letters)) {
			config.letters = [
				"a","b","c","d","e","f","g","h","i",
				"j","k","l","m","n","o","p","q","r",
				"s","t","u","v","x","y","w","z",
			].sort();
			var length = config.letters.length;
			for (var i = 0; i < length; i++) {
				config.letters.push(config.letters[i].toUpperCase());
			}
		}
		
		if (lib.factory.isNull(config.tables)) {
			config.tables = Math.max(Math.floor(Math.random() * config.types.length * config.types.length),1);
		}

		if (lib.factory.isNull(config.fields)) {
			config.fields = Math.max(Math.floor(Math.random() * config.types.length * config.types.length),1);
		}

		if (lib.factory.isNull(config.indexes)) {
			config.indexes = Math.max(Math.floor(Math.random() * config.types.length * config.types.length),1);
		}

		if (lib.factory.isNull(config.records)) {
			config.records = Math.max(Math.floor(Math.random() * config.letters.length * config.letters.length),1);
		}

		this.config = config;
	},

// - -------------------------------------------------------------------- - //

	// .randomType()
	randomType: function() {
		return this.config.types[Math.floor(Math.random() * this.config.types.length)];
	},

	// .randomName()
	randomName: function() {
		var length = Math.floor(Math.random() * this.config.letters.length) + 3;
		var name = "";
		for (var i = 0; i < length; i++) {
			name += this.config.letters[Math.floor(Math.random() * this.config.letters.length)];
		}
		return name;
	},

	// .randomData(type)
	randomData: function(type) {
		if (type == "TEXT") {
			return this.randomName();
		} else if (type == "REAL") {
			return Math.random();
		} else if (type == "BLOB") {
			return this.randomName();
		} else if (type == "INTEGER") {
			return Math.floor(Math.random() * this.config.letters.length);
		}
	},

	// .randomFields()
	randomFields: function() {
		var fields = {};
		for (var i = 0; i < this.config.fields; i++) {
			fields[this.randomName()] = this.randomType();
		}
		return fields;
	},

	// .randomTables()
	randomTables: function() {
		var type = lib.factory.type(this.config.tables);
		if (type == "number") {
			var tables = {};
			var length = this.config.tables;
			for (var i = 0; i < length; i++) {
				var table = this.randomName();
				var fields = this.randomFields();
				tables[table] = fields;
				this.emit("table",i + 1,table,fields);
			}
			this.tables = tables;
		} else if (type == "object") {
			this.tables = this.config.tables;
			var count = 0;
			for (var table in this.tables) {
				var fields = this.tables[fields];
				this.emit("table",++count,table,fields);
			}
		}
	},

	// .randomIndexes
	randomIndexes: function() {
		var type = lib.factory.type(this.config.indexes);
		if (type == "number") {
			var tables = Object.keys(this.tables);
			var length = this.config.indexes;
			var indexes = {};
			for (var i = 0; i < length; i++) {
				var index = this.randomName();
				var table = tables[Math.floor(Math.random() * tables.length)];
				var fields = Object.keys(this.tables[table]);
				var indexLength = Math.max(Math.floor(Math.random() * fields.length),1);
				var indexFields = fields.slice(0,indexLength);
				this.emit("index",i + 1,index,table,indexFields);
				indexes[index] = table + "." + indexFields.join(".");
			}
			this.indexes = indexes;
		} else if (type == "object") {
			this.indexes = this.config.indexes;
			var count = 0;
			for (var index in this.indexes) {
				var fields = this.indexes[index].split(".");
				var table = fields.shift();
				this.emit("index",++count,table,fields);
			}
		}
	},

	// .randomRecords()
	randomRecords: function() {
		var tables = Object.keys(this.tables);
		for (var i = 0; i < this.config.records; i++) {
			var table = tables[Math.floor(Math.random() * tables.length)];
			var fields = Object.keys(this.tables[table]);
			var recordLength = Math.max(Math.floor(Math.random() * fields.length),1);
			var recordFields = fields.slice(0,recordLength);
			var recordValues = [];
			for (var f = 0; f < recordFields.length; f++) {
				var type = this.tables[table][recordFields[f]];
				recordValues[f] = this.randomData(type);
			}
			this.emit("record",i+1,table,recordFields,recordValues);
		}
	},

// - -------------------------------------------------------------------- - //

	// .start()
	start: function() {
		this.randomTables();
		this.randomIndexes();
		this.randomRecords();
	},

});

// - -------------------------------------------------------------------- - //
// - exports

exports = Randomizer;
module.exports = exports;

// - -------------------------------------------------------------------- - //