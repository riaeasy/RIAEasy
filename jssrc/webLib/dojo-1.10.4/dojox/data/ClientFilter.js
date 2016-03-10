//>>built

define("dojox/data/ClientFilter", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/Deferred", "dojo/data/util/filter"], function (declare, lang, array, Deferred, filter) {
    var addUpdate = function (store, create, remove) {
        return function (item) {
            store._updates.push({create:create && item, remove:remove && item});
            ClientFilter.onUpdate();
        };
    };
    var ClientFilter = declare("dojox.data.ClientFilter", null, {cacheByDefault:false, constructor:function () {
        this.onSet = addUpdate(this, true, true);
        this.onNew = addUpdate(this, true, false);
        this.onDelete = addUpdate(this, false, true);
        this._updates = [];
        this._fetchCache = [];
    }, clearCache:function () {
        this._fetchCache = [];
    }, updateResultSet:function (resultSet, request) {
        if (this.isUpdateable(request)) {
            for (var i = request._version || 0; i < this._updates.length; i++) {
                var create = this._updates[i].create;
                var remove = this._updates[i].remove;
                if (remove) {
                    for (var j = 0; j < resultSet.length; j++) {
                        if (this.getIdentity(resultSet[j]) == this.getIdentity(remove)) {
                            resultSet.splice(j--, 1);
                            var updated = true;
                        }
                    }
                }
                if (create && this.matchesQuery(create, request) && array.indexOf(resultSet, create) == -1) {
                    resultSet.push(create);
                    updated = true;
                }
            }
            if (request.sort && updated) {
                resultSet.sort(this.makeComparator(request.sort.concat()));
            }
            resultSet._fullLength = resultSet.length;
            if (request.count && updated && request.count !== Infinity) {
                resultSet.splice(request.count, resultSet.length);
            }
            request._version = this._updates.length;
            return updated ? 2 : 1;
        }
        return 0;
    }, querySuperSet:function (argsSuper, argsSub) {
        if (argsSuper.query == argsSub.query) {
            return {};
        }
        if (!(argsSub.query instanceof Object && (!argsSuper.query || typeof argsSuper.query == "object"))) {
            return false;
        }
        var clientQuery = lang.mixin({}, argsSub.query);
        for (var i in argsSuper.query) {
            if (clientQuery[i] == argsSuper.query[i]) {
                delete clientQuery[i];
            } else {
                if (!(typeof argsSuper.query[i] == "string" && filter.patternToRegExp(argsSuper.query[i]).test(clientQuery[i]))) {
                    return false;
                }
            }
        }
        return clientQuery;
    }, serverVersion:0, cachingFetch:function (args) {
        var self = this;
        for (var i = 0; i < this._fetchCache.length; i++) {
            var cachedArgs = this._fetchCache[i];
            var clientQuery = this.querySuperSet(cachedArgs, args);
            if (clientQuery !== false) {
                var defResult = cachedArgs._loading;
                if (!defResult) {
                    defResult = new Deferred();
                    defResult.callback(cachedArgs.cacheResults);
                }
                defResult.addCallback(function (results) {
                    results = self.clientSideFetch(lang.mixin(lang.mixin({}, args), {query:clientQuery}), results);
                    defResult.fullLength = results._fullLength;
                    return results;
                });
                args._version = cachedArgs._version;
                break;
            }
        }
        if (!defResult) {
            var serverArgs = lang.mixin({}, args);
            var putInCache = (args.queryOptions || 0).cache;
            var fetchCache = this._fetchCache;
            if (putInCache === undefined ? this.cacheByDefault : putInCache) {
                if (args.start || args.count) {
                    delete serverArgs.start;
                    delete serverArgs.count;
                    args.clientQuery = lang.mixin(args.clientQuery || {}, {start:args.start, count:args.count});
                }
                args = serverArgs;
                fetchCache.push(args);
            }
            defResult = args._loading = this._doQuery(args);
            defResult.addErrback(function () {
                fetchCache.splice(array.indexOf(fetchCache, args), 1);
            });
        }
        var version = this.serverVersion;
        defResult.addCallback(function (results) {
            delete args._loading;
            if (results) {
                args._version = typeof args._version == "number" ? args._version : version;
                self.updateResultSet(results, args);
                args.cacheResults = results;
                if (!args.count || results.length < args.count) {
                    defResult.fullLength = ((args.start) ? args.start : 0) + results.length;
                }
            }
            return results;
        });
        return defResult;
    }, isUpdateable:function (request) {
        return !request.query || typeof request.query == "object";
    }, clientSideFetch:function (request, baseResults) {
        if (request.queryOptions && request.queryOptions.results) {
            baseResults = request.queryOptions.results;
        }
        if (request.query) {
            var results = [];
            for (var i = 0; i < baseResults.length; i++) {
                var value = baseResults[i];
                if (value && this.matchesQuery(value, request)) {
                    results.push(baseResults[i]);
                }
            }
        } else {
            results = request.sort ? baseResults.concat() : baseResults;
        }
        if (request.sort) {
            results.sort(this.makeComparator(request.sort.concat()));
        }
        return this.clientSidePaging(request, results);
    }, clientSidePaging:function (request, baseResults) {
        var start = request.start || 0;
        var finalResults = (start || request.count) ? baseResults.slice(start, start + (request.count || baseResults.length)) : baseResults;
        finalResults._fullLength = baseResults.length;
        return finalResults;
    }, matchesQuery:function (item, request) {
        var query = request.query;
        var ignoreCase = request.queryOptions && request.queryOptions.ignoreCase;
        for (var i in query) {
            var match = query[i];
            var value = this.getValue(item, i);
            if ((typeof match == "string" && (match.match(/[\*\.]/) || ignoreCase)) ? !filter.patternToRegExp(match, ignoreCase).test(value) : value != match) {
                return false;
            }
        }
        return true;
    }, makeComparator:function (sort) {
        var current = sort.shift();
        if (!current) {
            return function () {
                return 0;
            };
        }
        var attribute = current.attribute;
        var descending = !!current.descending;
        var next = this.makeComparator(sort);
        var store = this;
        return function (a, b) {
            var av = store.getValue(a, attribute);
            var bv = store.getValue(b, attribute);
            if (av != bv) {
                return av < bv == descending ? 1 : -1;
            }
            return next(a, b);
        };
    }});
    ClientFilter.onUpdate = function () {
    };
    return ClientFilter;
});

