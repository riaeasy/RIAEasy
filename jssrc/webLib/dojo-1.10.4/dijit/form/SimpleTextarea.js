//>>built

define("dijit/form/SimpleTextarea", ["dojo/_base/declare", "dojo/dom-class", "dojo/sniff", "./TextBox"], function (declare, domClass, has, TextBox) {
    return declare("dijit.form.SimpleTextarea", TextBox, {baseClass:"dijitTextBox dijitTextArea", rows:"3", cols:"20", templateString:"<textarea ${!nameAttrSetting} data-dojo-attach-point='focusNode,containerNode,textbox' autocomplete='off'></textarea>", postMixInProperties:function () {
        if (!this.value && this.srcNodeRef) {
            this.value = this.srcNodeRef.value;
        }
        this.inherited(arguments);
    }, buildRendering:function () {
        this.inherited(arguments);
        if (has("ie") && this.cols) {
            domClass.add(this.textbox, "dijitTextAreaCols");
        }
    }, filter:function (value) {
        if (value) {
            value = value.replace(/\r/g, "");
        }
        return this.inherited(arguments);
    }, _onInput:function (e) {
        if (this.maxLength) {
            var maxLength = parseInt(this.maxLength);
            var value = this.textbox.value.replace(/\r/g, "");
            var overflow = value.length - maxLength;
            if (overflow > 0) {
                var textarea = this.textbox;
                if (textarea.selectionStart) {
                    var pos = textarea.selectionStart;
                    var cr = 0;
                    if (has("opera")) {
                        cr = (this.textbox.value.substring(0, pos).match(/\r/g) || []).length;
                    }
                    this.textbox.value = value.substring(0, pos - overflow - cr) + value.substring(pos - cr);
                    textarea.setSelectionRange(pos - overflow, pos - overflow);
                } else {
                    if (this.ownerDocument.selection) {
                        textarea.focus();
                        var range = this.ownerDocument.selection.createRange();
                        range.moveStart("character", -overflow);
                        range.text = "";
                        range.select();
                    }
                }
            }
        }
        this.inherited(arguments);
    }});
});

