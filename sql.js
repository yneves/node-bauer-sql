// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	factory: require("bauer-factory"),
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

	toText: {

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

	// .fromText(text)
	fromText: function(text) {

		var query = {};

		text = text.replace(/^CREATE +/i,function() {
			query.create = true;
			return "";
		});

		text = text.replace(/^TEMP +|^TEMPORARY +/i,function() {
			query.temp = true;
			return "";
		});

		text = text.replace(/^TABLE +|^TRIGGER +|^INDEX +|^VIEW /i,function(str) {
			var type = str.trim().toLowerCase();
			query[type] = true;
			return "";
		});

		text = text.replace(/^IF NOT EXISTS +|^IF EXISTS/i,function(str) {
			query.exists = / NOT /i.test(str);
			return "";
		});

		if (query.table) {

			text = text.replace(/^[\w\.]+ +/i,function(str) {
				query.table = str.trim();
				return "";
			});

			text = text.replace(/^\(([\s\w\,]+)\);?$/i,function(str,fields) {
				query.fields = {};
				fields.split(",").forEach(function(field) {
					var parts = field.trim().split(" ");
					var name = parts.shift();
					var type = parts.join(" ");
					query.fields[name] = type;
				});
				return "";
			});

		}

		if (query.index) {

			text = text.replace(/^[\w\.]+ +/i,function(str) {
				query.index = str.trim();
				return "";
			});

			text = text.replace(/^ON +([\w\.]+) +/i,function(str,on) {
				query.on = on;
				return "";
			});

			text = text.replace(/^\(([\s\w\,]+)\);?$/i,function(str,fields) {
				query.fields = [];
				fields.split(",").forEach(function(field) {
					query.fields.push(field.trim());
				});
				return "";
			});

		}

		if (query.trigger) {

			text = text.replace(/^[\w\.]+ +/i,function(str) {
				query.trigger = str.trim();
				return "";
			});

			text = text.replace(/^UPDATE +|^INSERT +|^DELETE +/i,function(str) {
				query[str.trim().toLowerCase()] = true;
				return "";
			});

			text = text.replace(/^OF +([\w\.]+) +/i,function(str,of) {
				query.of = of;
				return "";
			});

			text = text.replace(/^ON +([\w\.]+) +/i,function(str,on) {
				query.on = on;
				return "";
			});

			text = text.replace(/^ *BEGIN/i,"");
			text = text.replace(/END *$/i,"");
			
			query.do = [];
			text.split(";").forEach(function(stm) {
				if (/\w/.test(stm)) {
					query.do.push(stm.trim());
				}
			});

		}

		if (query.view) {

			text = text.replace(/^[\w\.]+ +/i,function(str) {
				query.view = str.trim();
				return "";
			});

			text = text.replace(/^AS +/i,"");
			query.as = text.trim();

		}

		this.query = query;
		return this;
	},

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
		
		if (query.exists) text += makeExists(query);
		
		if (query.table) text += makeStr(query,"table"," ");
		if (query.index) text += makeStr(query,"index"," ");
		if (query.trigger) text += makeStr(query,"trigger"," ");
		if (query.view) text += makeStr(query,"view"," ");

		if (query.trigger) text += makeTriggerOn(query);
		
		if (query.of) text += makeStr(query,"of"," OF ");
		if (query.on) text += makeStr(query,"on"," ON ");

		if (query.fields) text += makeFields(query,args);

		if (query.do) text += makeTriggerDo(query);
		if (query.as) text += makeView(query);

		
		return { text: text, args: args };
	},

});

["unique","temp","exists","table","index","trigger","view","delete","insert","update","of","on","do","as","fields"].forEach(function(name) {
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
		if (query.exists) text += makeExists(query);
		if (query.table) text += makeStr(query,"table"," ");
		if (query.index) text += makeStr(query,"index"," ");
		if (query.trigger) text += makeStr(query,"trigger"," ");
		if (query.view) text += makeStr(query,"view"," ");
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
		if (query.table) text += makeStr(query,"table","");
		if (query.rename) text += makeStr(query,"rename"," RENAME TO ");
		if (query.add) text += makeAdd(query);
		if (query.drop) text += makeDrop(query);
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
		if (query.into) text += makeStr(query,"into","INTO ");
		if (query.fields) text += makeFields(query,args);
		if (query.values) text += makeValues(query,args);
		return { text: text, args: args };
	},

});

["into","fields","values"].forEach(function(name) {
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
		if (query.table) text += makeStr(query,"table"," ");
		if (query.join) text += makeJoin(query);
		if (query.set) text += makeSet(query,args);
		if (query.where) text += makeWhere(query,args);
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
		if (query.from) text += makeFrom(query,args);
		if (query.join) text += makeJoin(query);
		if (query.where) text += makeWhere(query,args);
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
			text += makeSelect(query);
		} else {
			text += "*";
		}

		if (query.from) text += makeFrom(query,args);
		if (query.join) text += makeJoin(query);
		if (query.where) text += makeWhere(query,args);
		if (query.group) text += makeGroup(query);
		if (query.order) text += makeOrder(query);
		if (query.limit) text += makeLimit(query);

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

function makeStr(query,prop,text) {
	var value = query[prop][0];
	var type = lib.factory.type(value);
	if (type == "string") {
		text += value;
	} else if (type == "arguments") {
		text += value[0];
	}
	return text;
}

function makeAdd(query) {
	var text = " ";
	var comma = false;
	for (var i = 0; i < query.add.length; i++) {
		var value = query.add[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += "ADD COLUMN " + value;
		} else if (type == "object") {
			for (var key in value) {
				if (comma) { text += ", "; }
				else { comma = true; }
				text += "ADD COLUMN " + key + " " + value[key];
			}
		}
	}
	return text;
}

function makeDrop(query) {
	var text = " ";
	var comma = false;
	for (var i = 0; i < query.drop.length; i++) {
		var value = query.drop[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += "DROP COLUMN " + value;
		} else if (type == "array") {
			for (var f = 0; f < value.length; f++) {
				if (comma) { text += ", "; }
				else { comma = true; }
				text += "DROP COLUMN " + value[f];
			}
		}
	}
	return text;
}

function makeSet(query,args) {
	var text = " SET ";
	var comma = false;
	for (var i = 0; i < query.set.length; i++) {
		var value = query.set[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += value;
		} else if (type == "object") {
			for (var key in value) {
				if (comma) { text += ", "; }
				else { comma = true; }
				text += key + " = ?";
				args.push(value[key]);
			}
		}
	}
	return text;
}

function makeView(query) {
	var text = " AS ";
	for (var i = 0; i < query.as.length; i++) {
		var value = query.as[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			text += value;
		} else if (type == "object") {
			if (value instanceof Query) {
				text += value.toText();
			}
		}
	}	
	return text;
}

function makeJoin(query) {
	var text = "";
	for (var i = 0; i < query.join.length; i++) {
		var mode = query.join[i][0];
		var value = query.join[i][1];
		for (var f = 0; f < value.length; f++) {
			var item = value[f];
			var type = lib.factory.type(item);
			if (type == "string") {
				if (mode.length > 0) {
					text += " " + mode;
				}
				text += " JOIN " + item;
			} else if (type == "object") {
				for (var key in item) {
					if (mode.length > 0) {
						text += " " + mode;
					}
					text += " JOIN " + key + " ON (" + item[key] + ")";
				}
			}
		}
	}
	return text;
}

function makeFrom(query,args) {
	var text = " FROM ";
	var comma = false;
	for (var i = 0; i < query.from.length; i++) {
		var value = query.from[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += value;
		} else if (type == "object") {
			if (value instanceof Query) {
				if (comma) { text += ", "; }
				else { comma = true; }
				var valquery = value.toQuery();
				text += "(" + valquery.text + ")";
				args.push.apply(args,valquery.args);
			}
		}
	}
	return text;
}

function makeWhere(query,args) {
	var text = " WHERE ";
	var and = false;
	for (var i = 0; i < query.where.length; i++) {
		var value = query.where[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (and) { text += " AND "; }
			else { and = true; }
			text += "(" + value + ")";
		} else if (type == "object") {
			if (and) { text += " AND "; }
			else { and = true; }
			text += "(";
			and = false;
			for (var key in value) {
				var vtype = lib.factory.type(value[key]);
				if (vtype == "object") {
					for (var operation in value[key]) {
						if (and) { text += " AND "; }
						else { and = true; }
						if (operation == "elt") {
							 text += key + " <= ?";
						} else if (operation == "egt") {
							 text += key + " >= ?";
						} else if (operation == "gt") {
							 text += key + " > ?";
						} else if (operation == "lt") {
							 text += key + " < ?";
						}
						args.push(value[key][operation]);
					}
				} else if (vtype == "array") {
					if (and) { text += " AND "; }
					else { and = true; }
					text += key + " IN (";
					for (var f = 0; f < value[key].length; f++){
						if (f > 0) text += ", ";
						text += "?";
						args.push(value[key][f]);
					}
					text += ")";
				} else {
					if (and) { text += " AND "; }
					else { and = true; }
					text += key + " = ?";
					args.push(value[key]);
				}
			}
			text += ")";
		}
	}
	return text;
}

function makeOrder(query) {
	var text = " ORDER BY ";
	var comma = false;
	for (var i = 0; i < query.order.length; i++) {
		var value = query.order[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += value;
		}
	}
	return text;
}

function makeGroup(query) {
	var text = " GROUP BY ";
	var comma = false;
	for (var i = 0; i < query.group.length; i++) {
		var value = query.group[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += value;
		}
	}
	return text;
}

function makeLimit(query) {
	var text = " LIMIT ";
	var comma = false;
	for (var i = 0; i < query.limit.length; i++) {
		var value = query.limit[i];
		var type = lib.factory.type(value);
		if (type == "string" || type == "number") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += value;
		}
	}
	return text;
}

function makeSelect(query) {
	var text = "";
	var comma = false;
	for (var i = 0; i < query.fields.length; i++) {
		var value = query.fields[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += value;
		} else if (type == "object") {
			for (var key in value) {
				if (comma) { text += ", "; }
				else { comma = true; }
				text += key + " AS " +value[key];
			}
		}
	}
	return text;
}

function makeFields(query,args) {
	var text = " (";
	var comma = false;
	for (var i = 0; i < query.fields.length; i++) {
		var value = query.fields[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += value;
		} else if (type == "array" || type == "arguments") {
			for (var f = 0; f < value.length; f++) {
				if (comma) { text += ", "; }
				else { comma = true; }
				text += value[f];
			}
		} else if (type == "object") {
			for (var key in value) {
				if (comma) { text += ", "; }
				else { comma = true; }
				text += key + " " + value[key];
			}
		}
	}
	text += ")";
	return text;
}

function makeValues(query,args) {
	var text = " VALUES ";
	for (var i = 0; i < query.values.length; i++) {
		if (i > 0) text += ", ";
		text += "(";
		var value = query.values[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			text += value;
		} else if (type == "array" || type == "arguments") {
			for (var f = 0; f < value.length; f++) {
				if (f > 0) text += ", ";
				text += "?";
				args.push(value[f]);
			}
		}
		text += ")";
	}
	return text;
}

function makeExists(query) {
	var text = " IF ";
	for (var i = 0; i < query.exists.length; i++) {
		var value = query.exists[i];
		var type = lib.factory.type(value);
		if (type == "boolean") {
			if (value) {
				text += "EXISTS";
			} else {
				text += "NOT EXISTS";
			}
		}
	}	
	return text;
}

function makeTriggerOn(query) {
	var text = "";

	if (query.delete) {
		text += " DELETE";
		if (lib.factory.isString(query.delete[0])) {
			var parts = query.delete[0].split(".");
			if (parts.length > 1) {
				text += " OF " + parts[1] + " ON " + parts[0];
			} else if (parts.length > 0) {
				text += " ON " + parts[0];
			}
		}
	}

	if (query.insert) {
		text += " INSERT";
		if (lib.factory.isString(query.insert[0])) {
			var parts = query.insert[0].split(".");
			if (parts.length > 1) {
				text += " OF " + parts[1] + " ON " + parts[0];
			} else if (parts.length > 0) {
				text += " ON " + parts[0];
			}
		}
	}

	if (query.update) {
		text += " UPDATE";
		if (lib.factory.isString(query.update[0])) {
			var parts = query.update[0].split(".");
			if (parts.length > 1) {
				text += " OF " + parts[1] + " ON " + parts[0];
			} else if (parts.length > 0) {
				text += " ON " + parts[0];
			}
		}
	}

	return text;
}

function makeTriggerDo(query) {
	var text = " BEGIN ";
	for (var i = 0; i < query.do.length; i++) {
		if (i > 0) text += " ";
		var value = query.do[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (/\; *$/.test(value)) {
				text += value;
			} else {
				text += value + ";";
			}
		} else if (type == "object") {
			if (value instanceof Query) {
				text += value.toText() + ";";
			}
		}
	}	
	text += " END";
	return text;
}

// - -------------------------------------------------------------------- - //
// - exports

exports = {};
exports.drop = function() { return new Drop() };
exports.alter = function() { return new Alter() };
exports.select = function() { return new Select() };
exports.insert = function() { return new Insert() };
exports.update = function() { return new Update() };
exports.delete = function() { return new Delete() };
exports.create = function() { return new Create() };

exports.cls = {};
exports.cls.Query = Query;
exports.cls.Drop = Drop;
exports.cls.Alter = Alter;
exports.cls.Select = Select;
exports.cls.Insert = Insert;
exports.cls.Update = Update;
exports.cls.Delete = Delete;
exports.cls.Create = Create;

module.exports = exports;

// - -------------------------------------------------------------------- - //