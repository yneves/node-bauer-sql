// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	builder: require("./builder.js"),
	factory: require("yns-factory"),
};

// [method-name, join-operator]
var JOINS = [
	["join",""],
	["crossJoin","CROSS"],
	["innerJoin","INNER"],
	["leftJoin","LEFT"],
	["leftOuterJoin","LEFT OUTER"],
];

// - -------------------------------------------------------------------- - //

// @Query
var Query = lib.factory.class({

	// @constructor
	constructor: function() {
		this.query = {};
	},

	// .clone()
	clone: function() {
		var clone = new this.constructor();
		for (var key in this) {
			if (key == "query") {
				clone[key] = lib.factory.clone(this[key]);
			} else {
				clone[key] = this[key];
			}
		}
		return clone;
	},

	toText: {

		// .toText(quote)
		s: function(quote) {
			return this.toText(function(val) {
				return quote + val + quote;
			});
		},

		// .toText(callback)
		f: function(callback) {
			var query = this.toQuery();
			var idx = 0;
			while (query.args.length > 0) {
				var value = query.args.shift();
				query.text = query.text.replace(/\?/,callback(value,idx));
				idx++;
			}
			return query.text;
		},

		// .toText()
		_: function() {
			var query = this.toQuery();
			while (query.args.length > 0) {
				var value = query.args.shift();
				query.text = query.text.replace(/\?/,value);
			}
			return query.text;
		},
	},

	// .toQuery()
	toQuery: new Error('not implemented'),

});

// - -------------------------------------------------------------------- - //

// @Create
var Create = lib.factory.class({

	// @inherits
	inherits: Query,

	// .toQuery()
	toQuery: function() {
		var query = this.query;
		var args = [];
		var text = "CREATE ";

		if (query.unique) text += "UNIQUE ";
		if (query.temp) text += "TEMPORARY ";
		if (query.table) text += "TABLE";
		if (query.index) text += "INDEX";
		if (query.trigger) text += "TRIGGER";
		if (query.view) text += "VIEW";

		if (query.exists) text += lib.builder.makeExists(query);

		if (query.table) text += lib.builder.makeStr(query,"table"," ");
		if (query.index) text += lib.builder.makeStr(query,"index"," ");
		if (query.trigger) text += lib.builder.makeStr(query,"trigger"," ");
		if (query.view) text += lib.builder.makeStr(query,"view"," ");

		if (query.before) text += " BEFORE";
		if (query.after) text += " AFTER";
		if (query.trigger) text += lib.builder.makeTriggerOn(query);

		if (query.of) text += lib.builder.makeStr(query,"of"," OF ");
		if (query.on) text += lib.builder.makeStr(query,"on"," ON ");
		if (query.when) text += lib.builder.makeWhere(query,args," WHEN ","when");

		if (query.fields) text += lib.builder.makeFields(query,args,true);

		if (query.do) text += lib.builder.makeTriggerDo(query,Query);
		if (query.as) text += lib.builder.makeView(query,Query);

		return { text: text, args: args };
	},

});

["primaryKey","foreignKey","unique","temp","before","after","when","exists","table","index","trigger","view","delete","insert","update","of","on","do","as","fields"].forEach(function(name) {
	Create.prototype[name] = lib.factory.method("if(!this.query."+name+")this.query."+name+" = [];Array.prototype.push.apply(this.query."+name+",arguments);return this;");
});

// - -------------------------------------------------------------------- - //

// @Drop
var Drop = lib.factory.class({

	// @inherits
	inherits: Query,

	// .toQuery()
	toQuery: function() {
		var query = this.query;
		var args = [];
		var text = "DROP ";
		if (query.table) text += "TABLE";
		if (query.index) text += "INDEX";
		if (query.trigger) text += "TRIGGER";
		if (query.view) text += "VIEW";
		if (query.exists) text += lib.builder.makeExists(query);
		if (query.table) text += lib.builder.makeStr(query,"table"," ");
		if (query.index) text += lib.builder.makeStr(query,"index"," ");
		if (query.trigger) text += lib.builder.makeStr(query,"trigger"," ");
		if (query.view) text += lib.builder.makeStr(query,"view"," ");
		return { text: text, args: args };
	},

});

["exists","table","index","trigger","view"].forEach(function(name) {
	Drop.prototype[name] = lib.factory.method("if(!this.query."+name+")this.query."+name+" = [];Array.prototype.push.apply(this.query."+name+",arguments);return this;");
});

// - -------------------------------------------------------------------- - //

// @Alter
var Alter = lib.factory.class({

	// @inherits
	inherits: Query,

	// .toQuery()
	toQuery: function() {
		var query = this.query;
		var args = [];
		var text = "ALTER TABLE ";
		if (query.table) text += lib.builder.makeStr(query,"table","");
		if (query.rename) text += lib.builder.makeStr(query,"rename"," RENAME TO ");
		if (query.add) text += lib.builder.makeAdd(query);
		if (query.drop) text += lib.builder.makeDrop(query);
		return { text: text, args: args };
	},

});

["table","rename","add","drop"].forEach(function(name) {
	Alter.prototype[name] = lib.factory.method("if(!this.query."+name+")this.query."+name+" = [];Array.prototype.push.apply(this.query."+name+",arguments);return this;");
});

// - -------------------------------------------------------------------- - //

// @Insert
var Insert = lib.factory.class({

	// @inherits
	inherits: Query,

	// .toQuery()
	toQuery: function() {
		var query = this.query;
		var args = [];
		var text = "INSERT ";
		if (query.into) text += lib.builder.makeStr(query,"into","INTO ");
		if (query.fields) text += lib.builder.makeFields(query,args);
		if (query.from) text += lib.builder.makeInsertFrom(query,args,Query);
		if (query.values) text += lib.builder.makeValues(query,args);
		return { text: text, args: args };
	},

});

["into","fields","from","values"].forEach(function(name) {
	Insert.prototype[name] = lib.factory.method("if(!this.query."+name+")this.query."+name+" = [];this.query."+name+".push(arguments);return this;");
});

// - -------------------------------------------------------------------- - //

// @Update
var Update = lib.factory.class({

	// @inherits
	inherits: Query,

	// .toQuery()
	toQuery: function() {
		var query = this.query;
		var args = [];
		var text = "UPDATE";
		if (query.table) text += lib.builder.makeStr(query,"table"," ");
		if (query.join) text += lib.builder.makeJoin(query);
		if (query.set) text += lib.builder.makeSet(query,args);
		if (query.where) text += lib.builder.makeWhere(query,args);
		return { text: text, args: args };
	},

});

JOINS.forEach(function(join) {
	Update.prototype[join[0]] = lib.factory.method("if(!this.query.join)this.query.join = [];this.query.join.push(['"+join[1]+"',arguments]);return this;");
});

["table","set","where"].forEach(function(name) {
	Update.prototype[name] = lib.factory.method("if(!this.query."+name+")this.query."+name+" = [];Array.prototype.push.apply(this.query."+name+",arguments);return this;");
});

// - -------------------------------------------------------------------- - //

// @Delete
var Delete = lib.factory.class({

	// @inherits
	inherits: Query,

	// .toQuery()
	toQuery: function() {
		var query = this.query;
		var args = [];
		var text = "DELETE";
		if (query.from) text += lib.builder.makeFrom(query,args,Query);
		if (query.join) text += lib.builder.makeJoin(query);
		if (query.where) text += lib.builder.makeWhere(query,args);
		return { text: text, args: args };
	},

});

JOINS.forEach(function(join) {
	Delete.prototype[join[0]] = lib.factory.method("if(!this.query.join)this.query.join = [];this.query.join.push(['"+join[1]+"',arguments]);return this;");
});

["from","where"].forEach(function(name) {
	Delete.prototype[name] = lib.factory.method("if(!this.query."+name+")this.query."+name+" = [];Array.prototype.push.apply(this.query."+name+",arguments);return this;");
});

// - -------------------------------------------------------------------- - //

// @Select
var Select = lib.factory.class({

	// @inherits
	inherits: Query,

	// .toQuery()
	toQuery: function() {

		var query = this.query;

		var args = [];
		var text = "SELECT ";

		if (query.fields) {
			text += lib.builder.makeSelect(query);
		} else {
			text += "*";
		}

		if (query.from) text += lib.builder.makeFrom(query,args,Query);
		if (query.join) text += lib.builder.makeJoin(query);
		if (query.where) text += lib.builder.makeWhere(query,args);
		if (query.group) text += lib.builder.makeGroup(query);
		if (query.order) text += lib.builder.makeOrder(query);
		if (query.limit) text += lib.builder.makeLimit(query);

		return {
			text: text,
			args: args
		};
	},

});

JOINS.forEach(function(join) {
	Select.prototype[join[0]] = lib.factory.method("if(!this.query.join)this.query.join = [];this.query.join.push(['"+join[1]+"',arguments]);return this;");
});

["fields","from","where","order","group","limit"].forEach(function(name) {
	Select.prototype[name] = lib.factory.method("if(!this.query."+name+")this.query."+name+" = [];Array.prototype.push.apply(this.query."+name+",arguments);return this;");
});

// - -------------------------------------------------------------------- - //
// - exports

exports = {};

exports.Query = Query;
exports.Drop = Drop;
exports.Alter = Alter;
exports.Create = Create;
exports.Insert = Insert;
exports.Update = Update;
exports.Delete = Delete;
exports.Select = Select;

module.exports = exports;

// - -------------------------------------------------------------------- - //
