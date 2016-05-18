//>>built

define("dojo/router/RouterBase", ["dojo/_base/declare", "dojo/hash", "dojo/topic"], function (declare, hash, topic) {
    var trim;
    if (String.prototype.trim) {
        trim = function (str) {
            return str.trim();
        };
    } else {
        trim = function (str) {
            return str.replace(/^\s\s*/, "").replace(/\s\s*$/, "");
        };
    }
    function fireRoute(params, currentPath, newPath) {
        var queue, isStopped, isPrevented, eventObj, callbackArgs, i, l;
        queue = this.callbackQueue;
        isStopped = false;
        isPrevented = false;
        eventObj = {stopImmediatePropagation:function () {
            isStopped = true;
        }, preventDefault:function () {
            isPrevented = true;
        }, oldPath:currentPath, newPath:newPath, params:params};
        callbackArgs = [eventObj];
        if (params instanceof Array) {
            callbackArgs = callbackArgs.concat(params);
        } else {
            for (var key in params) {
                callbackArgs.push(params[key]);
            }
        }
        for (i = 0, l = queue.length; i < l; ++i) {
            if (!isStopped) {
                queue[i].apply(null, callbackArgs);
            }
        }
        return !isPrevented;
    }
    var RouterBase = declare(null, {_routes:null, _routeIndex:null, _started:false, _currentPath:"", idMatch:/:(\w[\w\d]*)/g, idReplacement:"([^\\/]+)", globMatch:/\*(\w[\w\d]*)/, globReplacement:"(.+)", constructor:function (kwArgs) {
        this._routes = [];
        this._routeIndex = {};
        for (var i in kwArgs) {
            if (kwArgs.hasOwnProperty(i)) {
                this[i] = kwArgs[i];
            }
        }
    }, register:function (route, callback) {
        return this._registerRoute(route, callback);
    }, registerBefore:function (route, callback) {
        return this._registerRoute(route, callback, true);
    }, go:function (path, replace) {
        var applyChange;
        if (typeof path !== "string") {
            return false;
        }
        path = trim(path);
        applyChange = this._handlePathChange(path);
        if (applyChange) {
            hash(path, replace);
        }
        return applyChange;
    }, startup:function (defaultPath) {
        if (this._started) {
            return;
        }
        var self = this, startingPath = hash();
        this._started = true;
        this._hashchangeHandle = topic.subscribe("/dojo/hashchange", function () {
            self._handlePathChange.apply(self, arguments);
        });
        if (!startingPath) {
            this.go(defaultPath, true);
        } else {
            this._handlePathChange(startingPath);
        }
    }, destroy:function () {
        if (this._hashchangeHandle) {
            this._hashchangeHandle.remove();
        }
        this._routes = null;
        this._routeIndex = null;
    }, _handlePathChange:function (newPath) {
        var i, j, li, lj, routeObj, result, allowChange, parameterNames, params, routes = this._routes, currentPath = this._currentPath;
        if (!this._started || newPath === currentPath) {
            return allowChange;
        }
        allowChange = true;
        for (i = 0, li = routes.length; i < li; ++i) {
            routeObj = routes[i];
            result = routeObj.route.exec(newPath);
            if (result) {
                if (routeObj.parameterNames) {
                    parameterNames = routeObj.parameterNames;
                    params = {};
                    for (j = 0, lj = parameterNames.length; j < lj; ++j) {
                        params[parameterNames[j]] = result[j + 1];
                    }
                } else {
                    params = result.slice(1);
                }
                allowChange = routeObj.fire(params, currentPath, newPath);
            }
        }
        if (allowChange) {
            this._currentPath = newPath;
        }
        return allowChange;
    }, _convertRouteToRegExp:function (route) {
        route = route.replace(this.idMatch, this.idReplacement);
        route = route.replace(this.globMatch, this.globReplacement);
        route = "^" + route + "$";
        return new RegExp(route);
    }, _getParameterNames:function (route) {
        var idMatch = this.idMatch, globMatch = this.globMatch, parameterNames = [], match;
        idMatch.lastIndex = 0;
        while ((match = idMatch.exec(route)) !== null) {
            parameterNames.push(match[1]);
        }
        if ((match = globMatch.exec(route)) !== null) {
            parameterNames.push(match[1]);
        }
        return parameterNames.length > 0 ? parameterNames : null;
    }, _indexRoutes:function () {
        var i, l, route, routeIndex, routes = this._routes;
        routeIndex = this._routeIndex = {};
        for (i = 0, l = routes.length; i < l; ++i) {
            route = routes[i];
            routeIndex[route.route] = i;
        }
    }, _registerRoute:function (route, callback, isBefore) {
        var index, exists, routeObj, callbackQueue, removed, self = this, routes = this._routes, routeIndex = this._routeIndex;
        index = this._routeIndex[route];
        exists = typeof index !== "undefined";
        if (exists) {
            routeObj = routes[index];
        }
        if (!routeObj) {
            routeObj = {route:route, callbackQueue:[], fire:fireRoute};
        }
        callbackQueue = routeObj.callbackQueue;
        if (typeof route == "string") {
            routeObj.parameterNames = this._getParameterNames(route);
            routeObj.route = this._convertRouteToRegExp(route);
        }
        if (isBefore) {
            callbackQueue.unshift(callback);
        } else {
            callbackQueue.push(callback);
        }
        if (!exists) {
            index = routes.length;
            routeIndex[route] = index;
            routes.push(routeObj);
        }
        removed = false;
        return {remove:function () {
            var i, l;
            if (removed) {
                return;
            }
            for (i = 0, l = callbackQueue.length; i < l; ++i) {
                if (callbackQueue[i] === callback) {
                    callbackQueue.splice(i, 1);
                }
            }
            if (callbackQueue.length === 0) {
                routes.splice(index, 1);
                self._indexRoutes();
            }
            removed = true;
        }, register:function (callback, isBefore) {
            return self.register(route, callback, isBefore);
        }};
    }});
    return RouterBase;
});

