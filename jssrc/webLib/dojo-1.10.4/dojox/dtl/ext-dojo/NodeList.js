//>>built

define("dojox/dtl/ext-dojo/NodeList", ["dojo/_base/lang", "dojo/query", "../_base"], function (lang, query, dd) {
    var nl = lang.getObject("dojox.dtl.ext-dojo.NodeList", true);
    var NodeList = query.NodeList;
    lang.extend(NodeList, {dtl:function (template, context) {
        var d = dd, self = this;
        var render = function (template, context) {
            var content = template.render(new d._Context(context));
            self.forEach(function (node) {
                node.innerHTML = content;
            });
        };
        d.text._resolveTemplateArg(template).addCallback(function (templateString) {
            template = new d.Template(templateString);
            d.text._resolveContextArg(context).addCallback(function (context) {
                render(template, context);
            });
        });
        return this;
    }});
    return NodeList;
});

