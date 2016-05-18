//>>built

define("dojo/behavior", ["./_base/kernel", "./_base/lang", "./_base/array", "./_base/connect", "./query", "./domReady"], function (dojo, lang, darray, connect, query, domReady) {
    dojo.deprecated("dojo.behavior", "Use dojo/on with event delegation (on.selector())");
    var Behavior = function () {
        function arrIn(obj, name) {
            if (!obj[name]) {
                obj[name] = [];
            }
            return obj[name];
        }
        var _inc = 0;
        function forIn(obj, scope, func) {
            var tmpObj = {};
            for (var x in obj) {
                if (typeof tmpObj[x] == "undefined") {
                    if (!func) {
                        scope(obj[x], x);
                    } else {
                        func.call(scope, obj[x], x);
                    }
                }
            }
        }
        this._behaviors = {};
        this.add = function (behaviorObj) {
            forIn(behaviorObj, this, function (behavior, name) {
                var tBehavior = arrIn(this._behaviors, name);
                if (typeof tBehavior["id"] != "number") {
                    tBehavior.id = _inc++;
                }
                var cversion = [];
                tBehavior.push(cversion);
                if ((lang.isString(behavior)) || (lang.isFunction(behavior))) {
                    behavior = {found:behavior};
                }
                forIn(behavior, function (rule, ruleName) {
                    arrIn(cversion, ruleName).push(rule);
                });
            });
        };
        var _applyToNode = function (node, action, ruleSetName) {
            if (lang.isString(action)) {
                if (ruleSetName == "found") {
                    connect.publish(action, [node]);
                } else {
                    connect.connect(node, ruleSetName, function () {
                        connect.publish(action, arguments);
                    });
                }
            } else {
                if (lang.isFunction(action)) {
                    if (ruleSetName == "found") {
                        action(node);
                    } else {
                        connect.connect(node, ruleSetName, action);
                    }
                }
            }
        };
        this.apply = function () {
            forIn(this._behaviors, function (tBehavior, id) {
                query(id).forEach(function (elem) {
                    var runFrom = 0;
                    var bid = "_dj_behavior_" + tBehavior.id;
                    if (typeof elem[bid] == "number") {
                        runFrom = elem[bid];
                        if (runFrom == (tBehavior.length)) {
                            return;
                        }
                    }
                    for (var x = runFrom, tver; tver = tBehavior[x]; x++) {
                        forIn(tver, function (ruleSet, ruleSetName) {
                            if (lang.isArray(ruleSet)) {
                                darray.forEach(ruleSet, function (action) {
                                    _applyToNode(elem, action, ruleSetName);
                                });
                            }
                        });
                    }
                    elem[bid] = tBehavior.length;
                });
            });
        };
    };
    dojo.behavior = new Behavior();
    domReady(function () {
        dojo.behavior.apply();
    });
    return dojo.behavior;
});

