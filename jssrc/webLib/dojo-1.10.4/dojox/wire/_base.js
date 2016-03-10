//>>built

define("dojox/wire/_base", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire._base");
    dojox.wire._defaultWireClass = "dojox.wire.Wire";
    dojox.wire._wireClasses = {"attribute":"dojox.wire.DataWire", "path":"dojox.wire.XmlWire", "children":"dojox.wire.CompositeWire", "columns":"dojox.wire.TableAdapter", "nodes":"dojox.wire.TreeAdapter", "segments":"dojox.wire.TextAdapter"};
    dojox.wire.register = function (wireClass, key) {
        if (!wireClass || !key) {
            return;
        }
        if (dojox.wire._wireClasses[key]) {
            return;
        }
        dojox.wire._wireClasses[key] = wireClass;
    };
    dojox.wire._getClass = function (name) {
        dojo["require"](name);
        return dojo.getObject(name);
    };
    dojox.wire.create = function (args) {
        if (!args) {
            args = {};
        }
        var wireClass = args.wireClass;
        if (wireClass) {
            if (dojo.isString(wireClass)) {
                wireClass = dojox.wire._getClass(wireClass);
            }
        } else {
            for (var key in args) {
                if (!args[key]) {
                    continue;
                }
                wireClass = dojox.wire._wireClasses[key];
                if (wireClass) {
                    if (dojo.isString(wireClass)) {
                        wireClass = dojox.wire._getClass(wireClass);
                        dojox.wire._wireClasses[key] = wireClass;
                    }
                    break;
                }
            }
        }
        if (!wireClass) {
            if (dojo.isString(dojox.wire._defaultWireClass)) {
                dojox.wire._defaultWireClass = dojox.wire._getClass(dojox.wire._defaultWireClass);
            }
            wireClass = dojox.wire._defaultWireClass;
        }
        return new wireClass(args);
    };
    dojox.wire.isWire = function (wire) {
        return (wire && wire._wireClass);
    };
    dojox.wire.transfer = function (source, target, defaultObject, defaultTargetObject) {
        if (!source || !target) {
            return;
        }
        if (!dojox.wire.isWire(source)) {
            source = dojox.wire.create(source);
        }
        if (!dojox.wire.isWire(target)) {
            target = dojox.wire.create(target);
        }
        var value = source.getValue(defaultObject);
        target.setValue(value, (defaultTargetObject || defaultObject));
    };
    dojox.wire.connect = function (trigger, source, target) {
        if (!trigger || !source || !target) {
            return;
        }
        var connection = {topic:trigger.topic};
        if (trigger.topic) {
            connection.handle = dojo.subscribe(trigger.topic, function () {
                dojox.wire.transfer(source, target, arguments);
            });
        } else {
            if (trigger.event) {
                connection.handle = dojo.connect(trigger.scope, trigger.event, function () {
                    dojox.wire.transfer(source, target, arguments);
                });
            }
        }
        return connection;
    };
    dojox.wire.disconnect = function (connection) {
        if (!connection || !connection.handle) {
            return;
        }
        if (connection.topic) {
            dojo.unsubscribe(connection.handle);
        } else {
            dojo.disconnect(connection.handle);
        }
    };
});

