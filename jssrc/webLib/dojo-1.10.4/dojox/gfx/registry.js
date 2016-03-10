//>>built

define("dojox/gfx/registry", ["dojo/has", "./shape"], function (has, shapeLib) {
    has.add("gfxRegistry", 1);
    var registry = {};
    var _ids = {};
    var hash = {};
    registry.register = shapeLib.register = function (s) {
        var t = s.declaredClass.split(".").pop();
        var i = t in _ids ? ++_ids[t] : ((_ids[t] = 0));
        var uid = t + i;
        hash[uid] = s;
        return uid;
    };
    registry.byId = shapeLib.byId = function (id) {
        return hash[id];
    };
    registry.dispose = shapeLib.dispose = function (s, recurse) {
        if (recurse && s.children) {
            for (var i = 0; i < s.children.length; ++i) {
                registry.dispose(s.children[i], true);
            }
        }
        var uid = s.getUID();
        hash[uid] = null;
        delete hash[uid];
    };
    return registry;
});

