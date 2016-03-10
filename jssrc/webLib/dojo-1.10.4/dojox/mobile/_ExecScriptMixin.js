//>>built

define("dojox/mobile/_ExecScriptMixin", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/window", "dojo/dom-construct"], function (kernel, declare, win, domConstruct) {
    return declare("dojox.mobile._ExecScriptMixin", null, {execScript:function (html) {
        var s = html.replace(/\f/g, " ").replace(/<\/script>/g, "\f");
        s = s.replace(/<script [^>]*src=['"]([^'"]+)['"][^>]*>([^\f]*)\f/ig, function (ignore, path) {
            domConstruct.create("script", {type:"text/javascript", src:path}, win.doc.getElementsByTagName("head")[0]);
            return "";
        });
        s = s.replace(/<script>([^\f]*)\f/ig, function (ignore, code) {
            kernel.eval(code);
            return "";
        });
        return s;
    }});
});

