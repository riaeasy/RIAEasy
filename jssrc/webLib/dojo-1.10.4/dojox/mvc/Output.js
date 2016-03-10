//>>built

define("dojox/mvc/Output", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom", "dijit/_WidgetBase", "dojo/regexp"], function (declare, lang, dom, _WidgetBase, regexp) {
    return declare("dojox.mvc.Output", _WidgetBase, {exprchar:"$", templateString:"", postscript:function (params, srcNodeRef) {
        this.srcNodeRef = dom.byId(srcNodeRef);
        if (this.srcNodeRef) {
            this.templateString = this.srcNodeRef.innerHTML;
            this.srcNodeRef.innerHTML = "";
        }
        this.inherited(arguments);
    }, set:function (name, value) {
        this.inherited(arguments);
        if (name === "value") {
            this._output();
        }
    }, _updateBinding:function (name, old, current) {
        this.inherited(arguments);
        this._output();
    }, _output:function () {
        var outputNode = this.srcNodeRef || this.domNode;
        outputNode.innerHTML = this.templateString ? this._exprRepl(this.templateString) : this.value;
    }, _exprRepl:function (tmpl) {
        var pThis = this, transform = function (value, key) {
            if (!value) {
                return "";
            }
            var exp = value.substr(2);
            exp = exp.substr(0, exp.length - 1);
            with (pThis) {
                var val = eval(exp);
                return (val || val == 0 ? val : "");
            }
        };
        transform = lang.hitch(this, transform);
        return tmpl.replace(new RegExp(regexp.escapeString(this.exprchar) + "({.*?})", "g"), function (match, key, format) {
            return transform(match, key).toString();
        });
    }});
});

