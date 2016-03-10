//>>built

define("dijit/Declaration", ["dojo/_base/array", "dojo/aspect", "dojo/_base/declare", "dojo/_base/lang", "dojo/parser", "dojo/query", "./_Widget", "./_TemplatedMixin", "./_WidgetsInTemplateMixin", "dojo/NodeList-dom"], function (array, aspect, declare, lang, parser, query, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin) {
    return declare("dijit.Declaration", _Widget, {_noScript:true, stopParser:true, widgetClass:"", defaults:null, mixins:[], buildRendering:function () {
        var src = this.srcNodeRef.parentNode.removeChild(this.srcNodeRef), methods = query("> script[type='dojo/method']", src).orphan(), connects = query("> script[type='dojo/connect']", src).orphan(), aspects = query("> script[type='dojo/aspect']", src).orphan(), srcType = src.nodeName;
        var propList = this.defaults || {};
        array.forEach(methods, function (s) {
            var evt = s.getAttribute("event") || s.getAttribute("data-dojo-event"), func = parser._functionFromScript(s, "data-dojo-");
            if (evt) {
                propList[evt] = func;
            } else {
                aspects.push(s);
            }
        });
        if (this.mixins.length) {
            this.mixins = array.map(this.mixins, function (name) {
                return lang.getObject(name);
            });
        } else {
            this.mixins = [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin];
        }
        propList._skipNodeCache = true;
        propList.templateString = "<" + srcType + " class='" + src.className + "'" + " data-dojo-attach-point='" + (src.getAttribute("data-dojo-attach-point") || src.getAttribute("dojoAttachPoint") || "") + "' data-dojo-attach-event='" + (src.getAttribute("data-dojo-attach-event") || src.getAttribute("dojoAttachEvent") || "") + "' >" + src.innerHTML.replace(/\%7B/g, "{").replace(/\%7D/g, "}") + "</" + srcType + ">";
        var wc = declare(this.widgetClass, this.mixins, propList);
        array.forEach(aspects, function (s) {
            var advice = s.getAttribute("data-dojo-advice") || "after", method = s.getAttribute("data-dojo-method") || "postscript", func = parser._functionFromScript(s);
            aspect.after(wc.prototype, method, func, true);
        });
        array.forEach(connects, function (s) {
            var evt = s.getAttribute("event") || s.getAttribute("data-dojo-event"), func = parser._functionFromScript(s);
            aspect.after(wc.prototype, evt, func, true);
        });
    }});
});

