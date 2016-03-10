//>>built

define("dojox/mobile/compat", ["dojo/_base/lang", "dojo/sniff"], function (lang, has) {
    var dm = lang.getObject("dojox.mobile", true);
    if (!(has("webkit") || has("ie") === 10) || (!has("ie") && has("trident") > 6)) {
        var s = "dojox/mobile/_compat";
        require([s]);
    }
    return dm;
});

