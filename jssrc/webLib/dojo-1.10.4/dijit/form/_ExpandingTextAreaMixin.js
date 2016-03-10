//>>built

define("dijit/form/_ExpandingTextAreaMixin", ["dojo/_base/declare", "dojo/dom-construct", "dojo/has", "dojo/_base/lang", "dojo/on", "dojo/_base/window", "../Viewport"], function (declare, domConstruct, has, lang, on, win, Viewport) {
    has.add("textarea-needs-help-shrinking", function () {
        var body = win.body(), te = domConstruct.create("textarea", {rows:"5", cols:"20", value:" ", style:{zoom:1, fontSize:"12px", height:"96px", overflow:"hidden", visibility:"hidden", position:"absolute", border:"5px solid white", margin:"0", padding:"0", boxSizing:"border-box", MsBoxSizing:"border-box", WebkitBoxSizing:"border-box", MozBoxSizing:"border-box"}}, body, "last");
        var needsHelpShrinking = te.scrollHeight >= te.clientHeight;
        body.removeChild(te);
        return needsHelpShrinking;
    });
    return declare("dijit.form._ExpandingTextAreaMixin", null, {_setValueAttr:function () {
        this.inherited(arguments);
        this.resize();
    }, postCreate:function () {
        this.inherited(arguments);
        var textarea = this.textbox;
        textarea.style.overflowY = "hidden";
        this.own(on(textarea, "focus, resize", lang.hitch(this, "_resizeLater")));
    }, startup:function () {
        this.inherited(arguments);
        this.own(Viewport.on("resize", lang.hitch(this, "_resizeLater")));
        this._resizeLater();
    }, _onInput:function (e) {
        this.inherited(arguments);
        this.resize();
    }, _estimateHeight:function () {
        var textarea = this.textbox;
        textarea.rows = (textarea.value.match(/\n/g) || []).length + 1;
    }, _resizeLater:function () {
        this.defer("resize");
    }, resize:function () {
        var textarea = this.textbox;
        function textareaScrollHeight() {
            var empty = false;
            if (textarea.value === "") {
                textarea.value = " ";
                empty = true;
            }
            var sh = textarea.scrollHeight;
            if (empty) {
                textarea.value = "";
            }
            return sh;
        }
        if (textarea.style.overflowY == "hidden") {
            textarea.scrollTop = 0;
        }
        if (this.busyResizing) {
            return;
        }
        this.busyResizing = true;
        if (textareaScrollHeight() || textarea.offsetHeight) {
            var newH = textareaScrollHeight() + Math.max(textarea.offsetHeight - textarea.clientHeight, 0);
            var newHpx = newH + "px";
            if (newHpx != textarea.style.height) {
                textarea.style.height = newHpx;
                textarea.rows = 1;
            }
            if (has("textarea-needs-help-shrinking")) {
                var origScrollHeight = textareaScrollHeight(), newScrollHeight = origScrollHeight, origMinHeight = textarea.style.minHeight, decrement = 4, thisScrollHeight, origScrollTop = textarea.scrollTop;
                textarea.style.minHeight = newHpx;
                textarea.style.height = "auto";
                while (newH > 0) {
                    textarea.style.minHeight = Math.max(newH - decrement, 4) + "px";
                    thisScrollHeight = textareaScrollHeight();
                    var change = newScrollHeight - thisScrollHeight;
                    newH -= change;
                    if (change < decrement) {
                        break;
                    }
                    newScrollHeight = thisScrollHeight;
                    decrement <<= 1;
                }
                textarea.style.height = newH + "px";
                textarea.style.minHeight = origMinHeight;
                textarea.scrollTop = origScrollTop;
            }
            textarea.style.overflowY = textareaScrollHeight() > textarea.clientHeight ? "auto" : "hidden";
            if (textarea.style.overflowY == "hidden") {
                textarea.scrollTop = 0;
            }
        } else {
            this._estimateHeight();
        }
        this.busyResizing = false;
    }});
});

