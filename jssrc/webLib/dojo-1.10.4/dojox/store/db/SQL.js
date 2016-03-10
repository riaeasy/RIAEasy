//>>built

define("dojox/store/db/SQL", ["dojo/_base/declare", "dojo/Deferred", "dojo/when", "dojo/store/util/QueryResults", "dojo/_base/lang", "dojo/promise/all"], function (declare, Deferred, when, QueryResults, lang, all) {
    var wildcardRe = /(.*)\*$/;
    function convertExtra(object) {
        return object && lang.mixin(object, JSON.parse(object.__extra));
    }
    return declare([], {constructor:function (config) {
        var dbConfig = config.dbConfig;
        this.database = openDatabase(config.dbName || "dojo-db", "1.0", "dojo-db", 4 * 1024 * 1024);
        var indexPrefix = this.indexPrefix = config.indexPrefix || "idx_";
        var storeName = config.table || config.storeName;
        this.table = (config.table || config.storeName).replace(/[^\w]/g, "_");
        var promises = [];
        this.indices = dbConfig.stores[storeName];
        this.repeatingIndices = {};
        for (var index in this.indices) {
            if (this.indices[index].multiEntry) {
                this.repeatingIndices[index] = true;
            }
        }
        if (!dbConfig.available) {
            for (var storeName in dbConfig.stores) {
                var storeConfig = dbConfig.stores[storeName];
                var table = storeName.replace(/[^\w]/g, "_");
                var idConfig = storeConfig[this.idProperty];
                var indices = ["__extra", this.idProperty + " " + ((idConfig && idConfig.autoIncrement) ? "INTEGER PRIMARY KEY AUTOINCREMENT" : "PRIMARY KEY")];
                var repeatingIndices = [this.idProperty];
                for (var index in storeConfig) {
                    if (index != this.idProperty) {
                        indices.push(index);
                    }
                }
                promises.push(this.executeSql("CREATE TABLE IF NOT EXISTS " + table + " (" + indices.join(",") + ")"));
                for (var index in storeConfig) {
                    if (index != this.idProperty) {
                        if (storeConfig[index].multiEntry) {
                            repeatingIndices.push(index);
                            var repeatingTable = table + "_repeating_" + index;
                            promises.push(this.executeSql("CREATE TABLE IF NOT EXISTS " + repeatingTable + " (id,value)"));
                            promises.push(this.executeSql("CREATE INDEX IF NOT EXISTS idx_" + repeatingTable + "_id ON " + repeatingTable + "(id)"));
                            promises.push(this.executeSql("CREATE INDEX IF NOT EXISTS idx_" + repeatingTable + "_value ON " + repeatingTable + "(value)"));
                        } else {
                            promises.push(this.executeSql("ALTER TABLE " + table + " ADD " + index).then(null, function () {
                            }));
                            if (storeConfig[index].indexed !== false) {
                                promises.push(this.executeSql("CREATE INDEX IF NOT EXISTS " + indexPrefix + table + "_" + index + " ON " + table + "(" + index + ")"));
                            }
                        }
                    }
                }
            }
            dbConfig.available = all(promises);
        }
        this.available = dbConfig.available;
    }, idProperty:"id", selectColumns:["*"], get:function (id) {
        return when(this.executeSql("SELECT " + this.selectColumns.join(",") + " FROM " + this.table + " WHERE " + this.idProperty + "=?", [id]), function (result) {
            return result.rows.length > 0 ? convertExtra(result.rows.item(0)) : undefined;
        });
    }, getIdentity:function (object) {
        return object[this.idProperty];
    }, remove:function (id) {
        return this.executeSql("DELETE FROM " + this.table + " WHERE " + this.idProperty + "=?", [id]);
    }, identifyGeneratedKey:true, add:function (object, directives) {
        var params = [], vals = [], cols = [];
        var extra = {};
        var actionsWithId = [];
        var store = this;
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                if (i in this.indices || i == this.idProperty) {
                    if (this.repeatingIndices[i]) {
                        actionsWithId.push(function (id) {
                            var array = object[i];
                            return all(array.map(function (value) {
                                return store.executeSql("INSERT INTO " + store.table + "_repeating_" + i + " (value, id) VALUES (?, ?)", [value, id]);
                            }));
                        });
                    } else {
                        cols.push(i);
                        vals.push("?");
                        params.push(object[i]);
                    }
                } else {
                    extra[i] = object[i];
                }
            }
        }
        cols.push("__extra");
        vals.push("?");
        params.push(JSON.stringify(extra));
        var idColumn = this.idProperty;
        if (this.identifyGeneratedKey) {
            params.idColumn = idColumn;
        }
        var sql = "INSERT INTO " + this.table + " (" + cols.join(",") + ") VALUES (" + vals.join(",") + ")";
        return when(this.executeSql(sql, params), function (results) {
            var id = results.insertId;
            object[idColumn] = id;
            return all(actionsWithId.map(function (func) {
                return func(id);
            })).then(function () {
                return id;
            });
        });
    }, put:function (object, directives) {
        directives = directives || {};
        var id = directives.id || object[this.idProperty];
        var overwrite = directives.overwrite;
        if (overwrite === undefined) {
            var store = this;
            return this.get(id).then(function (previous) {
                if ((directives.overwrite = !!previous)) {
                    directives.overwrite = true;
                    return store.put(object, directives);
                } else {
                    return store.add(object, directives);
                }
            });
        }
        if (!overwrite) {
            return store.add(object, directives);
        }
        var sql = "UPDATE " + this.table + " SET ";
        var params = [];
        var cols = [];
        var extra = {};
        var promises = [];
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                if (i in this.indices || i == this.idProperty) {
                    if (this.repeatingIndices[i]) {
                        this.executeSql("DELETE FROM " + this.table + "_repeating_" + i + " WHERE id=?", [id]);
                        var array = object[i];
                        for (var j = 0; j < array.length; j++) {
                            this.executeSql("INSERT INTO " + this.table + "_repeating_" + i + " (value, id) VALUES (?, ?)", [array[j], id]);
                        }
                    } else {
                        cols.push(i + "=?");
                        params.push(object[i]);
                    }
                } else {
                    extra[i] = object[i];
                }
            }
        }
        cols.push("__extra=?");
        params.push(JSON.stringify(extra));
        sql += cols.join(",") + " WHERE " + this.idProperty + "=?";
        params.push(object[this.idProperty]);
        return when(this.executeSql(sql, params), function (result) {
            return id;
        });
    }, query:function (query, options) {
        options = options || {};
        var from = "FROM " + this.table;
        var condition;
        var addedWhere;
        var store = this;
        var table = this.table;
        var params = [];
        if (query.forEach) {
            condition = query.map(processObjectQuery).join(") OR (");
            if (condition) {
                condition = "(" + condition + ")";
            }
        } else {
            condition = processObjectQuery(query);
        }
        if (condition) {
            condition = " WHERE " + condition;
        }
        function processObjectQuery(query) {
            var conditions = [];
            for (var i in query) {
                var filterValue = query[i];
                function convertWildcard(value) {
                    var wildcard = value && value.match && value.match(wildcardRe);
                    if (wildcard) {
                        params.push(wildcard[1] + "%");
                        return " LIKE ?";
                    }
                    params.push(value);
                    return "=?";
                }
                if (filterValue) {
                    if (filterValue.contains) {
                        var repeatingTable = store.table + "_repeating_" + i;
                        conditions.push(filterValue.contains.map(function (value) {
                            return store.idProperty + " IN (SELECT id FROM " + repeatingTable + " WHERE " + "value" + convertWildcard(value) + ")";
                        }).join(" AND "));
                        continue;
                    } else {
                        if (typeof filterValue == "object" && ("from" in filterValue || "to" in filterValue)) {
                            var fromComparator = filterValue.excludeFrom ? ">" : ">=";
                            var toComparator = filterValue.excludeTo ? "<" : "<=";
                            if ("from" in filterValue) {
                                params.push(filterValue.from);
                                if ("to" in filterValue) {
                                    params.push(filterValue.to);
                                    conditions.push("(" + table + "." + i + fromComparator + "? AND " + table + "." + i + toComparator + "?)");
                                } else {
                                    conditions.push(table + "." + i + fromComparator + "?");
                                }
                            } else {
                                params.push(filterValue.to);
                                conditions.push(table + "." + i + toComparator + "?");
                            }
                            continue;
                        }
                    }
                }
                conditions.push(table + "." + i + convertWildcard(filterValue));
            }
            return conditions.join(" AND ");
        }
        if (options.sort) {
            condition += " ORDER BY " + options.sort.map(function (sort) {
                return table + "." + sort.attribute + " " + (sort.descending ? "desc" : "asc");
            });
        }
        var limitedCondition = condition;
        if (options.count) {
            limitedCondition += " LIMIT " + options.count;
        }
        if (options.start) {
            limitedCondition += " OFFSET " + options.start;
        }
        var results = lang.delegate(this.executeSql("SELECT * " + from + limitedCondition, params).then(function (sqlResults) {
            var results = [];
            for (var i = 0; i < sqlResults.rows.length; i++) {
                results.push(convertExtra(sqlResults.rows.item(i)));
            }
            return results;
        }));
        var store = this;
        results.total = {then:function (callback, errback) {
            return store.executeSql("SELECT COUNT(*) " + from + condition, params).then(function (sqlResults) {
                return sqlResults.rows.item(0)["COUNT(*)"];
            }).then(callback, errback);
        }};
        return new QueryResults(results);
    }, executeSql:function (sql, parameters) {
        var deferred = new Deferred();
        var result, error;
        this.database.transaction(function (transaction) {
            transaction.executeSql(sql, parameters, function (transaction, value) {
                deferred.resolve(result = value);
            }, function (transaction, e) {
                deferred.reject(error = e);
            });
        });
        if (result) {
            return result;
        }
        if (error) {
            throw error;
        }
        return deferred.promise;
    }});
});

