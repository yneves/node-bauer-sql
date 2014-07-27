/*!
**  bauer-sql -- Just another SQL building tool.
**  Copyright (c) 2014 Yuri Neves Silveira <http://yneves.com>
**  Licensed under The MIT License <http://opensource.org/licenses/MIT>
**  Distributed on <http://github.com/yneves/node-bauer-sql>
*/
// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	fs: require("fs"),
	query: require("./query.js"),
	parser: require("./parser.js"),
	randomizer: require("./randomizer.js"),
	factory: require("bauer-factory"),
};

// - -------------------------------------------------------------------- - //

// @Schema
var Schema = lib.factory.class({

	// @constructor
	constructor: function() {
		this.queries = [];
	},

// - -------------------------------------------------------------------- - //

	// .randomize(config)
	randomize: function(arg) {
		var schema = this;
		var config = {
			records: 0,
		};
		if (lib.factory.isObject(arg)) {
			config.tables = arg.tables;
			config.fields = arg.fields;
			config.indexes = arg.indexes;
		}
		var rand = new lib.randomizer({
			config: config,
			table: function(count,table,fields) {
				var query = new lib.query.Create();
				query.table(table).fields(fields);
				schema.fromSQL(query);
			},
			index: function(count,index,table,fields) {
				var query = new lib.query.Create();
				query.index(index).on(table).fields(fields);
				schema.fromSQL(query);
			},
		});
		rand.start();
		return this;
	},

// - -------------------------------------------------------------------- - //

	// .fromSQL(query)
	fromSQL: function(query) {
		if (query instanceof lib.query.Query) {
			this.queries.push(query.toText());
		} else {
			this.queries.push(query);
		}
		return this;
	},

// - -------------------------------------------------------------------- - //

	fromJSON: {

		// .fromJSON(file)
		s: function(file) {
			var exists = lib.fs.existsSync(file);
			if (exists) {
				var content = lib.fs.readFileSync(file,"utf8");
				var data = JSON.parse(content);
				this.fromJSON(data);
			}
			return this;
		},

		// .fromJSON(file,callback)
		sf: function(file,callback) {
			var schema = this;
			lib.fs.exists(file,function(exists) {
				if (exists) {
					lib.fs.readFile(file,"utf8",function(error,content) {
						if (error) {
							callback(error);
						} else {
							var data;
							try { schema.fromJSON(JSON.parse(content)) }
							catch(e) { error = e }
							if (data) {
								callback(null);
							} else {
								callback(error);
							}
						}
					});
				} else {
					callback(new Error("file not found"));
				}
			});
			return this;
		},

		// .fromJSON(schema)
		o: function(schema) {
			var queries = this.queries;

			// create tables
			if (lib.factory.isObject(schema.tables)) {
				for (var table in schema.tables) {
					var tableDef = schema.tables[table];
					var query = new lib.query.Create();
					query.table(table).exists(false);
					if (tableDef.temp) query.temp();
					if (tableDef.fields) query.fields(tableDef.fields);
					if (tableDef.primaryKey) query.primaryKey(tableDef.primaryKey);
					if (tableDef.foreignKey) query.foreignKey(tableDef.foreignKey);
					queries.push(query.toText());
				}
			}

			// create indexes
			if (lib.factory.isObject(schema.indexes)) {
				for (var index in schema.indexes) {
					var value = schema.indexes[index];
					var type = lib.factory.type(value);
					if (type == "string") {
						var fields = value.split(".");
						var table = fields.shift();
						var query = new lib.query.Create();
						query.index(index).on(table).exists(false).fields(fields);
						queries.push(query.toText());
					} else if (type == "object") {
							var table = value.table;
							var fields = value.fields;
							var query = new lib.query.Create();
							query.index(index).on(table).exists(false).fields(fields);
							if (value.unique) query.unique();
							queries.push(query.toText());

					}
				}
			}

			// create views
			if (lib.factory.isObject(schema.views)) {
				for (var view in schema.views) {
					var query = new lib.query.Create();
					query.view(view).as(schema.views[view]).exists(false);
					queries.push(query.toText());
				}
			}

			// create triggers
			if (lib.factory.isObject(schema.triggers)) {
				for (var trigger in schema.triggers) {
					var def = schema.triggers[trigger];
					var type = lib.factory.type(def);
					if (type == "object") {
						var query = new lib.query.Create();
						query.trigger(trigger).exists(false);
						if (def.after) query.after();
						if (def.before) query.before();
						if (def.update) query.update(def.update);
						if (def.delete) query.delete(def.delete);
						if (def.insert) query.insert(def.insert);
						if (def.when) query.when(def.when);
						if (def.do) query.do(def.do);
						queries.push(query.toText());
					}
				}
			}

			return this;
		},

	},

// - -------------------------------------------------------------------- - //

	// .toSQL()
	toSQL: function() {
		var text = "";
		var last = this.queries.length - 1;
		this.queries.forEach(function(query,idx) {
			if (/; *$/.test(query)) {
				text += query.trim();
			} else {
				text += query.trim() + ";";
			}
			if (idx < last) {
				text += "\n";
			}
		});
		return text;
	},

// - -------------------------------------------------------------------- - //

	// .toJSON()
	toJSON: function() {
		var schema = {
			tables: {},
			indexes: {},
			triggers: {},
			views: {},
		};
		var parser = new lib.parser();
		this.queries.forEach(function(text) {
			var query = parser.parseCreate(text);
			if (query.table) {
				schema.tables[query.table] = {};
				if (query.temp) schema.tables[query.table].temp = query.temp;
				if (query.fields) schema.tables[query.table].fields = query.fields;
				if (query.primaryKey) schema.tables[query.table].primaryKey = query.primaryKey;
				if (query.foreignKey) schema.tables[query.table].foreignKey = query.foreignKey;
			} else if (query.index) {
				schema.indexes[query.index] = {};
				if (query.on) schema.indexes[query.index].table = query.on;
				if (query.fields) schema.indexes[query.index].fields = query.fields;
				if (query.unique) schema.indexes[query.index].unique = query.unique;
			} else if (query.view) {
				schema.views[query.view] = query.as;
			} else if (query.trigger) {
				schema.triggers[query.trigger] = {};
				var on = query.of ? query.on + "." + query.of : query.on;
				if (query.after) schema.triggers[query.trigger].after = true;
				if (query.before) schema.triggers[query.trigger].before = true;
				if (query.update) schema.triggers[query.trigger].update = on;
				if (query.delete) schema.triggers[query.trigger].delete = on;
				if (query.insert) schema.triggers[query.trigger].insert = on;
				if (query.when) schema.triggers[query.trigger].when = query.when;
				if (query.do) schema.triggers[query.trigger].do = query.do;
			}
		});
		return schema;
	},

});

// - -------------------------------------------------------------------- - //
// - exports

exports = Schema;
module.exports = exports;

// - -------------------------------------------------------------------- - //
