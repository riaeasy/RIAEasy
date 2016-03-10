//>>built

define("dojox/mobile/uacss", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/window", "./sniff"], function (dojo, lang, win, has) {
    var html = win.doc.documentElement;
    html.className = lang.trim(html.className + " " + [has("bb") ? "dj_bb" : "", has("android") ? "dj_android" : "", has("ios") ? "dj_ios" : "", has("ios") >= 6 ? "dj_ios6" : "", has("ios") ? "dj_iphone" : "", has("ipod") ? "dj_ipod" : "", has("ipad") ? "dj_ipad" : "", has("ie") ? "dj_ie" : ""].join(" ").replace(/ +/g, " "));
    return dojo;
});

