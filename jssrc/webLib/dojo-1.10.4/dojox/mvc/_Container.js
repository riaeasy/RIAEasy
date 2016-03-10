//>>built

define("dojox/mvc/_Container", ["dojo/_base/declare", "dojo/_base/lang", "dojo/when", "dijit/_WidgetBase", "dojo/regexp"], function (declare, lang, when, _WidgetBase, regexp) {
    return declare("dojox.mvc._Container", _WidgetBase, {stopParser:true, exprchar:"$", templateString:"", inlineTemplateString:"", _containedWidgets:[], _parser:null, _createBody:function () {
        if (!this._parser) {
            try {
                this._parser = require("dojo/parser");
            }
            catch (e) {
                try {
                    this._parser = require("dojox/mobile/parser");
                }
                catch (e) {
                    console.error("Add explicit require(['dojo/parser']) or explicit require(['dojox/mobile/parser']), one of the parsers is required!");
                }
            }
        }
        var _self = this;
        if (this._parser) {
            return when(this._parser.parse(this.srcNodeRef, {template:true, inherited:{dir:this.dir, lang:this.lang}, propsThis:this, scope:"dojo"}), function (widgets) {
                _self._containedWidgets = widgets;
            });
        }
    }, _destroyBody:function () {
        if (this._containedWidgets && this._containedWidgets.length > 0) {
            for (var n = this._containedWidgets.length - 1; n > -1; n--) {
                var w = this._containedWidgets[n];
                if (w && !w._destroyed && w.destroy) {
                    w.destroy();
                }
            }
        }
    }, _exprRepl:function (tmpl) {
        var pThis = this, transform = function (value, key) {
            if (!value) {
                return "";
            }
            var exp = value.substr(2);
            exp = exp.substr(0, exp.length - 1);
            with (pThis) {
                return eval(exp);
            }
        };
        transform = lang.hitch(this, transform);
        return tmpl.replace(new RegExp(regexp.escapeString(this.exprchar) + "({.*?})", "g"), function (match, key, format) {
            return transform(match, key).toString();
        });
    }});
});

