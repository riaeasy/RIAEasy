//>>built

define("dijit/form/Textarea", ["dojo/_base/declare", "dojo/dom-style", "./_ExpandingTextAreaMixin", "./SimpleTextarea"], function (declare, domStyle, _ExpandingTextAreaMixin, SimpleTextarea) {
    return declare("dijit.form.Textarea", [SimpleTextarea, _ExpandingTextAreaMixin], {baseClass:"dijitTextBox dijitTextArea dijitExpandingTextArea", cols:"", buildRendering:function () {
        this.inherited(arguments);
        domStyle.set(this.textbox, {overflowY:"hidden", overflowX:"auto", boxSizing:"border-box", MsBoxSizing:"border-box", WebkitBoxSizing:"border-box", MozBoxSizing:"border-box"});
    }});
});

