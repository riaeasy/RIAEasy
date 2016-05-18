//>>built

define("dojo/uacss", ["./dom-geometry", "./_base/lang", "./domReady", "./sniff", "./_base/window"], function (geometry, lang, domReady, has, baseWindow) {
    var html = baseWindow.doc.documentElement, ie = has("ie"), opera = has("opera"), maj = Math.floor, ff = has("ff"), boxModel = geometry.boxModel.replace(/-/, ""), classes = {"dj_quirks":has("quirks"), "dj_opera":opera, "dj_khtml":has("khtml"), "dj_webkit":has("webkit"), "dj_safari":has("safari"), "dj_chrome":has("chrome"), "dj_gecko":has("mozilla"), "dj_ios":has("ios"), "dj_android":has("android")};
    if (ie) {
        classes["dj_ie"] = true;
        classes["dj_ie" + maj(ie)] = true;
        classes["dj_iequirks"] = has("quirks");
    }
    if (ff) {
        classes["dj_ff" + maj(ff)] = true;
    }
    classes["dj_" + boxModel] = true;
    var classStr = "";
    for (var clz in classes) {
        if (classes[clz]) {
            classStr += clz + " ";
        }
    }
    html.className = lang.trim(html.className + " " + classStr);
    domReady(function () {
        if (!geometry.isBodyLtr()) {
            var rtlClassStr = "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl ");
            html.className = lang.trim(html.className + " " + rtlClassStr + "dj_rtl dijitRtl " + classStr.replace(/ /g, "-rtl "));
        }
    });
    return has;
});

