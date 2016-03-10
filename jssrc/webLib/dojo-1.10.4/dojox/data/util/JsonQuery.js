//>>built

define("dojox/data/util/JsonQuery", ["dojo", "dojox"], function (dojo, dojox) {
    return dojo.declare("dojox.data.util.JsonQuery", null, {useFullIdInQueries:false, _toJsonQuery:function (args, jsonQueryPagination) {
        var first = true;
        var self = this;
        function buildQuery(path, query) {
            var isDataItem = query.__id;
            if (isDataItem) {
                var newQuery = {};
                newQuery[self.idAttribute] = self.useFullIdInQueries ? query.__id : query[self.idAttribute];
                query = newQuery;
            }
            for (var i in query) {
                var value = query[i];
                var newPath = path + (/^[a-zA-Z_][\w_]*$/.test(i) ? "." + i : "[" + dojo._escapeString(i) + "]");
                if (value && typeof value == "object") {
                    buildQuery(newPath, value);
                } else {
                    if (value != "*") {
                        jsonQuery += (first ? "" : "&") + newPath + ((!isDataItem && typeof value == "string" && args.queryOptions && args.queryOptions.ignoreCase) ? "~" : "=") + (self.simplifiedQuery ? encodeURIComponent(value) : dojo.toJson(value));
                        first = false;
                    }
                }
            }
        }
        if (args.query && typeof args.query == "object") {
            var jsonQuery = "[?(";
            buildQuery("@", args.query);
            if (!first) {
                jsonQuery += ")]";
            } else {
                jsonQuery = "";
            }
            args.queryStr = jsonQuery.replace(/\\"|"/g, function (t) {
                return t == "\"" ? "'" : t;
            });
        } else {
            if (!args.query || args.query == "*") {
                args.query = "";
            }
        }
        var sort = args.sort;
        if (sort) {
            args.queryStr = args.queryStr || (typeof args.query == "string" ? args.query : "");
            first = true;
            for (i = 0; i < sort.length; i++) {
                args.queryStr += (first ? "[" : ",") + (sort[i].descending ? "\\" : "/") + "@[" + dojo._escapeString(sort[i].attribute) + "]";
                first = false;
            }
            args.queryStr += "]";
        }
        if (jsonQueryPagination && (args.start || args.count)) {
            args.queryStr = (args.queryStr || (typeof args.query == "string" ? args.query : "")) + "[" + (args.start || "") + ":" + (args.count ? (args.start || 0) + args.count : "") + "]";
        }
        if (typeof args.queryStr == "string") {
            args.queryStr = args.queryStr.replace(/\\"|"/g, function (t) {
                return t == "\"" ? "'" : t;
            });
            return args.queryStr;
        }
        return args.query;
    }, jsonQueryPagination:true, fetch:function (args) {
        this._toJsonQuery(args, this.jsonQueryPagination);
        return this.inherited(arguments);
    }, isUpdateable:function () {
        return true;
    }, matchesQuery:function (item, request) {
        request._jsonQuery = request._jsonQuery || dojox.json.query(this._toJsonQuery(request));
        return request._jsonQuery([item]).length;
    }, clientSideFetch:function (request, baseResults) {
        request._jsonQuery = request._jsonQuery || dojox.json.query(this._toJsonQuery(request));
        return this.clientSidePaging(request, request._jsonQuery(baseResults));
    }, querySuperSet:function (argsSuper, argsSub) {
        if (!argsSuper.query) {
            return argsSub.query;
        }
        return this.inherited(arguments);
    }});
});

