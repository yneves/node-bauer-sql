// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	factory: require("yns-factory"),
};

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

function makeView(query,cls) {
	var text = " AS ";
	for (var i = 0; i < query.as.length; i++) {
		var value = query.as[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			text += value;
		} else if (type == "object") {
			if (value instanceof cls) {
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

function makeFrom(query,args,cls) {
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
			if (value instanceof cls) {
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

function makeWhere(query,args,text,prop) {
	if (!prop) prop = "where";
	if (!text) text = " WHERE ";
	var and = false;
	for (var i = 0; i < query[prop].length; i++) {
		var value = query[prop][i];
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
		} else if (type == "array" || type == "arguments") {
			for (var f = 0; f < value.length; f++) {
				var val = value[f];
				var valtype = lib.factory.type(val);
				if (valtype == "string") {
					if (comma) { text += ", "; }
					else { comma = true; }
					text += val;
				} else if (valtype == "array" || valtype == "arguments") {
					for (var g = 0; g < val.length; g++) {
						if (comma) { text += ", "; }
						else { comma = true; }
						text += val[g];
					}
				}
			}
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

function makeFields(query,args,keys) {
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
				var val = value[f];
				var valtype = lib.factory.type(val);
				if (valtype == "string" || valtype == "number") {
					if (comma) { text += ", "; }
					else { comma = true; }
					text += val;
				} else if (valtype == "array" || valtype == "arguments") {
					for (var g = 0; g < val.length; g++) {
						if (comma) { text += ", "; }
						else { comma = true; }
						text += val[g];
					}
				}
			}
		} else if (type == "object") {
			for (var key in value) {
				if (comma) { text += ", "; }
				else { comma = true; }
				text += key + " " + value[key];
			}
		}
	}
	if (keys) {
		if (query.primaryKey) text += makePrimaryKey(query,comma);
		if (query.foreignKey) text += makeForeignKey(query,comma);
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
		if (type == "string" || type == "number") {
			text += value;
		} else if (type == "array" || type == "arguments") {
			var comma = false;
			for (var f = 0; f < value.length; f++) {
				var val = value[f];
				var valtype = lib.factory.type(val);
				if (valtype == "string" || valtype == "number") {
					if (comma) { text += ", "; }
					else { comma = true; }
					text += "?";
					args.push(val);
				} else if (valtype == "array" || valtype == "arguments") {
					for (var g = 0; g < val.length; g++) {
						if (comma) { text += ", "; }
						else { comma = true; }
						text += "?";
						args.push(val[g]);
					}
				}
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

function makeTriggerDo(query,cls) {
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
		} else if (type == "array") {
			for (var f = 0; f < value.length; f++) {
				if (f > 0) text += " ";
				var val = value[f];
				var vtype = lib.factory.type(val);
				if (vtype == "string") {
					if (/\; *$/.test(val)) {
						text += val;
					} else {
						text += val + ";";
					}
				} else if (vtype == "object") {
					if (val instanceof cls) {
						text += val.toText() + ";";
					}
				}
			}
		} else if (type == "object") {
			if (value instanceof cls) {
				text += value.toText() + ";";
			}
		}
	}
	text += " END";
	return text;
}

function makeInsertFrom(query,args,cls) {
	var text = " ";
	for (var i = 0; i < query.from.length; i++) {
		if (i > 0) text += ", ";
		var value = query.from[i];
		var type = lib.factory.type(value);
		if (type == "string" || type == "number") {
			text += value;
		} else if (type == "array" || type == "arguments") {
			for (var f = 0; f < value.length; f++) {
				var val = value[f];
				var valtype = lib.factory.type(val);
				if (valtype == "object" && val instanceof cls ) {
					text += val.toText();
				} else if (valtype == "string" || valtype == "number") {
					text += value;
				} else if (valtype == "array" || valtype == "arguments") {
					for (var g = 0; g < val.length; g++) {
						text += value;
					}
				}
			}
		}
	}
	return text;
}

function makePrimaryKey(query,comma) {
	var text = "";
	for (var i = 0; i < query.primaryKey.length; i++) {
		if (i > 0) text += ", ";
		var value = query.primaryKey[i];
		var type = lib.factory.type(value);
		if (type == "string") {
			if (comma) { text += ", "; }
			else { comma = true; }
			text += "PRIMARY KEY (" + value + ")";
		} else if (type == "array" || type == "arguments") {
			for (var f = 0; f < value.length; f++) {
				var val = value[f];
				var valtype = lib.factory.type(val);
				if (valtype == "string") {
					if (comma) { text += ", "; }
					else { comma = true; }
					text += "PRIMARY KEY (" + value + ")";
				} else if (valtype == "array" || valtype == "arguments") {
					if (comma) { text += ", "; }
					else { comma = true; }
					text += "PRIMARY KEY (";
					for (var g = 0; g < val.length; g++) {
						if (g > 0) text += ", ";
						text += value;
					}
					text += ")";
				}
			}
		}
	}
	return text;
}

function makeForeignKey(query,comma) {
	var text = "";
	for (var i = 0; i < query.foreignKey.length; i++) {
		if (i > 0) text += ", ";
		var value = query.foreignKey[i];
		var type = lib.factory.type(value);
		if (type == "object") {
			for (var name in value) {
				if (comma) { text += ", "; }
				else { comma = true; }
				var parts = value[name].split(".");
				var table = parts[0];
				var fields = parts.slice(1).join(", ");
				text += "FOREIGN KEY (" + name + ") REFERENCES " + table + " (" + fields + ")";
			}
		} else if (type == "array" || type == "arguments") {
			for (var f = 0; f < value.length; f++) {
				var val = value[f];
				var valtype = lib.factory.type(val);
				if (valtype == "object") {
					for (var name in val) {
						if (comma) { text += ", "; }
						else { comma = true; }
						var parts = val[name].split(".");
						var table = parts[0];
						var fields = parts.slice(1).join(", ");
						text += "FOREIGN KEY (" + name + ") REFERENCES " + table + " (" + fields + ")";
					}
				}
			}
		}
	}
	return text;
}

// - -------------------------------------------------------------------- - //

exports = {};

exports.makeStr = makeStr;
exports.makeAdd = makeAdd;
exports.makeDrop = makeDrop;
exports.makeSet = makeSet;
exports.makeView = makeView;
exports.makeJoin = makeJoin;
exports.makeFrom = makeFrom;
exports.makeWhere = makeWhere;
exports.makeOrder = makeOrder;
exports.makeGroup = makeGroup;
exports.makeLimit = makeLimit;
exports.makeSelect = makeSelect;
exports.makeFields = makeFields;
exports.makeValues = makeValues;
exports.makeExists = makeExists;
exports.makeTriggerOn = makeTriggerOn;
exports.makeTriggerDo = makeTriggerDo;
exports.makeInsertFrom = makeInsertFrom;
exports.makePrimaryKey = makePrimaryKey;
exports.makeForeignKey = makeForeignKey;

module.exports = exports;

// - -------------------------------------------------------------------- - //
