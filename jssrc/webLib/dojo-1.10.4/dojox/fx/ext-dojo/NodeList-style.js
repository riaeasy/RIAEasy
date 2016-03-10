//>>built

define("dojox/fx/ext-dojo/NodeList-style", ["dojo/_base/lang", "dojo/query", "dojo/NodeList-fx", "dojo/fx", "../style"], function (lang, query, NodeListFx, coreFx, styleX) {
    var NodeList = query.NodeList;
    lang.extend(NodeList, {addClassFx:function (cssClass, args) {
        return coreFx.combine(this.map(function (n) {
            return styleX.addClass(n, cssClass, args);
        }));
    }, removeClassFx:function (cssClass, args) {
        return coreFx.combine(this.map(function (n) {
            return styleX.removeClass(n, cssClass, args);
        }));
    }, toggleClassFx:function (cssClass, force, args) {
        return coreFx.combine(this.map(function (n) {
            return styleX.toggleClass(n, cssClass, force, args);
        }));
    }});
    return NodeList;
});

