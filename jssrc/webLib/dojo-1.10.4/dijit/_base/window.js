//>>built

define("dijit/_base/window", ["dojo/window", "../main"], function (windowUtils, dijit) {
    dijit.getDocumentWindow = function (doc) {
        return windowUtils.get(doc);
    };
});

