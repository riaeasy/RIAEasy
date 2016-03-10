//>>built

define("dijit/_base/scroll", ["dojo/window", "../main"], function (windowUtils, dijit) {
    dijit.scrollIntoView = function (node, pos) {
        windowUtils.scrollIntoView(node, pos);
    };
});

