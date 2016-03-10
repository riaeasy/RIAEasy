//>>built

define("dojox/lang/oo/rearrange", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.oo.rearrange");
    (function () {
        var extraNames = dojo._extraNames, extraLen = extraNames.length, opts = Object.prototype.toString, empty = {};
        dojox.lang.oo.rearrange = function (bag, map) {
            var name, newName, prop, i, t;
            for (name in map) {
                newName = map[name];
                if (!newName || opts.call(newName) == "[object String]") {
                    prop = bag[name];
                    if (!(name in empty) || empty[name] !== prop) {
                        if (!(delete bag[name])) {
                            bag[name] = undefined;
                        }
                        if (newName) {
                            bag[newName] = prop;
                        }
                    }
                }
            }
            if (extraLen) {
                for (i = 0; i < extraLen; ++i) {
                    name = extraNames[i];
                    newName = map[name];
                    if (!newName || opts.call(newName) == "[object String]") {
                        prop = bag[name];
                        if (!(name in empty) || empty[name] !== prop) {
                            if (!(delete bag[name])) {
                                bag[name] = undefined;
                            }
                            if (newName) {
                                bag[newName] = prop;
                            }
                        }
                    }
                }
            }
            return bag;
        };
    })();
});

