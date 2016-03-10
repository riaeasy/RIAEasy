//>>built

define("dojo/node", ["./_base/kernel", "./has", "require"], function (kernel, has, require) {
    var nodeRequire = kernel.global.require && kernel.global.require.nodeRequire;
    if (!nodeRequire) {
        throw new Error("Cannot find the Node.js require");
    }
    var module = nodeRequire("module");
    return {load:function (id, contextRequire, load) {
        if (module._findPath && module._nodeModulePaths) {
            var localModulePath = module._findPath(id, module._nodeModulePaths(contextRequire.toUrl(".")));
            if (localModulePath !== false) {
                id = localModulePath;
            }
        }
        var oldDefine = define, result;
        define = undefined;
        try {
            result = nodeRequire(id);
        }
        finally {
            define = oldDefine;
        }
        load(result);
    }, normalize:function (id, normalize) {
        if (id.charAt(0) === ".") {
            id = require.toUrl(normalize("./" + id));
        }
        return id;
    }};
});

