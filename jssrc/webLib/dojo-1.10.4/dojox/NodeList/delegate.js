//>>built

define("dojox/NodeList/delegate", ["dojo/_base/lang", "dojo/query", "dojo/_base/NodeList", "dojo/NodeList-traverse"], function (lang, query) {
    var NodeList = query.NodeList;
    lang.extend(NodeList, {delegate:function (selector, eventName, fn) {
        return this.connect(eventName, function (evt) {
            var closest = query(evt.target).closest(selector, this);
            if (closest.length) {
                fn.call(closest[0], evt);
            }
        });
    }});
    return NodeList;
});

