//>>built

define("dojo/NodeList-html", ["./query", "./_base/lang", "./html"], function (query, lang, html) {
    var NodeList = query.NodeList;
    lang.extend(NodeList, {html:function (content, params) {
        var dhs = new html._ContentSetter(params || {});
        this.forEach(function (elm) {
            dhs.node = elm;
            dhs.set(content);
            dhs.tearDown();
        });
        return this;
    }});
    return NodeList;
});

