//>>built

define("dijit/hccss", ["dojo/dom-class", "dojo/hccss", "dojo/domReady", "dojo/_base/window"], function (domClass, has, domReady, win) {
    domReady(function () {
        if (has("highcontrast")) {
            domClass.add(win.body(), "dijit_a11y");
        }
    });
    return has;
});

