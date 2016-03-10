//>>built

define("dojo/hccss", ["require", "./_base/config", "./dom-class", "./dom-style", "./has", "./domReady", "./_base/window"], function (require, config, domClass, domStyle, has, domReady, win) {
    has.add("highcontrast", function () {
        var div = win.doc.createElement("div");
        div.style.cssText = "border: 1px solid; border-color:red green; position: absolute; height: 5px; top: -999px;" + "background-image: url(\"" + (config.blankGif || require.toUrl("./resources/blank.gif")) + "\");";
        win.body().appendChild(div);
        var cs = domStyle.getComputedStyle(div), bkImg = cs.backgroundImage, hc = (cs.borderTopColor == cs.borderRightColor) || (bkImg && (bkImg == "none" || bkImg == "url(invalid-url:)"));
        if (has("ie") <= 8) {
            div.outerHTML = "";
        } else {
            win.body().removeChild(div);
        }
        return hc;
    });
    domReady(function () {
        if (has("highcontrast")) {
            domClass.add(win.body(), "dj_a11y");
        }
    });
    return has;
});

