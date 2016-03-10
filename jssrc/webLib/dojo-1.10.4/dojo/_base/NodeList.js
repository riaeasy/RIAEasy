//>>built

define("dojo/_base/NodeList", ["./kernel", "../query", "./array", "./html", "../NodeList-dom"], function (dojo, query, array) {
    var NodeList = query.NodeList, nlp = NodeList.prototype;
    nlp.connect = NodeList._adaptAsForEach(function () {
        return dojo.connect.apply(this, arguments);
    });
    nlp.coords = NodeList._adaptAsMap(dojo.coords);
    NodeList.events = ["blur", "focus", "change", "click", "error", "keydown", "keypress", "keyup", "load", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "submit"];
    array.forEach(NodeList.events, function (evt) {
        var _oe = "on" + evt;
        nlp[_oe] = function (a, b) {
            return this.connect(_oe, a, b);
        };
    });
    dojo.NodeList = NodeList;
    return NodeList;
});

