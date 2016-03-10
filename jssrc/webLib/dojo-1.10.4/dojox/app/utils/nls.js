//>>built

define("dojox/app/utils/nls", ["require", "dojo/Deferred"], function (require, Deferred) {
    return function (config, parent) {
        var path = config.nls;
        if (path) {
            var nlsDef = new Deferred();
            var requireSignal;
            try {
                var loadFile = path;
                var index = loadFile.indexOf("./");
                if (index >= 0) {
                    loadFile = path.substring(index + 2);
                }
                requireSignal = require.on ? require.on("error", function (error) {
                    if (nlsDef.isResolved() || nlsDef.isRejected()) {
                        return;
                    }
                    if (error.info[0] && (error.info[0].indexOf(loadFile) >= 0)) {
                        nlsDef.resolve(false);
                        if (requireSignal) {
                            requireSignal.remove();
                        }
                    }
                }) : null;
                if (path.indexOf("./") == 0) {
                    path = "app/" + path;
                }
                require(["dojo/i18n!" + path], function (nls) {
                    nlsDef.resolve(nls);
                    requireSignal.remove();
                });
            }
            catch (e) {
                nlsDef.reject(e);
                if (requireSignal) {
                    requireSignal.remove();
                }
            }
            return nlsDef;
        } else {
            return false;
        }
    };
});

