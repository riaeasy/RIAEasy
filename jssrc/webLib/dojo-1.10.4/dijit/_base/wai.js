//>>built

define("dijit/_base/wai", ["dojo/dom-attr", "dojo/_base/lang", "../main", "../hccss"], function (domAttr, lang, dijit) {
    var exports = {hasWaiRole:function (elem, role) {
        var waiRole = this.getWaiRole(elem);
        return role ? (waiRole.indexOf(role) > -1) : (waiRole.length > 0);
    }, getWaiRole:function (elem) {
        return lang.trim((domAttr.get(elem, "role") || "").replace("wairole:", ""));
    }, setWaiRole:function (elem, role) {
        domAttr.set(elem, "role", role);
    }, removeWaiRole:function (elem, role) {
        var roleValue = domAttr.get(elem, "role");
        if (!roleValue) {
            return;
        }
        if (role) {
            var t = lang.trim((" " + roleValue + " ").replace(" " + role + " ", " "));
            domAttr.set(elem, "role", t);
        } else {
            elem.removeAttribute("role");
        }
    }, hasWaiState:function (elem, state) {
        return elem.hasAttribute ? elem.hasAttribute("aria-" + state) : !!elem.getAttribute("aria-" + state);
    }, getWaiState:function (elem, state) {
        return elem.getAttribute("aria-" + state) || "";
    }, setWaiState:function (elem, state, value) {
        elem.setAttribute("aria-" + state, value);
    }, removeWaiState:function (elem, state) {
        elem.removeAttribute("aria-" + state);
    }};
    lang.mixin(dijit, exports);
    return dijit;
});

