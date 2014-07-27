// - -------------------------------------------------------------------- - //
// - libs

var lib = {
	factory: require("yns-factory"),
};

// - -------------------------------------------------------------------- - //

// @Parser
var Parser = lib.factory.class({

	// .parseCreate(text)
	parseCreate: function(text) {

		var query = {};

		text = text.replace(/^CREATE +/i,function() {
			query.create = true;
			return "";
		});

		text = text.replace(/^UNIQUE +/i,function() {
			query.unique = true;
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

			text = text.replace(/^[\`\'\"]?([\w\.]+)[\`\'\"]? +/i,function(str,name) {
				query.table = name.trim();
				return "";
			});

			text = text.replace(/^\(|\);?$/g,"");

			var parsing = true;

			while (parsing) {

				parsing = false;

				text = text.replace(/ *PRIMARY +KEY *\(([^\)]+)\) *\,? */i,function(str,key) {
					if (!query.primaryKey) query.primaryKey = [];
					query.primaryKey.push(key);
					parsing = true;
					return "";
				});

				if (!parsing) {
					text = text.replace(/ *FOREIGN +KEY *\(([^\)]+)\) +REFERENCES +[\`\'\"]?([\w\.]+)[\`\'\"]? *\(([^\)]+)\) *\,? */i,function(str,key,table,fields) {
						if (!query.foreignKey) query.foreignKey = {};
						query.foreignKey[key] = table + "." + fields.split(/ *, */).join(".");
						parsing = true;
						return "";
					});
				}

				if (!parsing) {

					text = text.replace(/ *([^\,]+)\,? */i,function(str,field) {
						if (!query.fields) query.fields = {};
						var parts = field.trim().split(" ");
						var name = parts.shift();
						var type = parts.join(" ");
						query.fields[name] = type;
						parsing = true;
						return "";
					});

				}

			}

		}

		if (query.index) {

			text = text.replace(/^[\`\'\"]?([\w\.]+)[\`\'\"]? +/i,function(str,name) {
				query.index = name.trim();
				return "";
			});

			text = text.replace(/^ON +([\w\.]+) +/i,function(str,on) {
				query.on = on;
				return "";
			});

			text = text.replace(/^\(([\s\w\,]+)\);?$/i,function(str,fields) {
				query.fields = fields.split(",").map(function(field) {
					return field.trim();
				});
				return "";
			});

		}

		if (query.view) {

			text = text.replace(/^[\`\'\"]?([\w\.]+)[\`\'\"]? +/i,function(str,name) {
				query.view = name.trim();
				return "";
			});

			text = text.replace(/^AS +/i,"");
			query.as = text.trim().replace(/; *$/,"");

		}

		if (query.trigger) {

			text = text.replace(/^[\`\'\"]?([\w\.]+)[\`\'\"]? +/i,function(str,name) {
				query.trigger = name.trim();
				return "";
			});

			text = text.replace(/^AFTER +|^BEFORE +/i,function(str) {
				query[str.trim().toLowerCase()] = true;
				return "";
			});

			text = text.replace(/^UPDATE +|^INSERT +|^DELETE +/i,function(str) {
				query[str.trim().toLowerCase()] = true;
				return "";
			});

			text = text.replace(/^OF +[\`\'\"]?([\w\.]+)[\`\'\"]? +/i,function(str,of) {
				query.of = of;
				return "";
			});

			text = text.replace(/^ON +[\`\'\"]?([\w\.]+)[\`\'\"]? +/i,function(str,on) {
				query.on = on;
				return "";
			});

			if (/^WHEN/.test(text)) {
				var parts = text.split(" BEGIN ");
				var when = parts.shift();
				when = when.replace(/^WHEN +/i,"");
				query.when = when.replace(/^\(|\)$/g,"");
				text = parts.join(" BEGIN ");
			}

			text = text.replace(/^ *BEGIN/i,"");
			text = text.replace(/END[;]? *$/i,"");

			query.do = [];
			text.split(";").forEach(function(stm) {
				if (/\w/.test(stm)) {
					query.do.push(stm.trim());
				}
			});

		}

		return query;
	},

});

// - -------------------------------------------------------------------- - //
// - exports

exports = Parser;
module.exports = exports;

// - -------------------------------------------------------------------- - //
