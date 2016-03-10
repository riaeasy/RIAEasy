//>>built

require({cache:{"url:dijit/templates/ProgressBar.html":"<div class=\"dijitProgressBar dijitProgressBarEmpty\" role=\"progressbar\"\n\t><div  data-dojo-attach-point=\"internalProgress\" class=\"dijitProgressBarFull\"\n\t\t><div class=\"dijitProgressBarTile\" role=\"presentation\"></div\n\t\t><span style=\"visibility:hidden\">&#160;</span\n\t></div\n\t><div data-dojo-attach-point=\"labelNode\" class=\"dijitProgressBarLabel\" id=\"${id}_label\"></div\n\t><span data-dojo-attach-point=\"indeterminateHighContrastImage\"\n\t\t   class=\"dijitInline dijitProgressBarIndeterminateHighContrastImage\"></span\n></div>\n"}});
define("dijit/ProgressBar", ["require", "dojo/_base/declare", "dojo/dom-class", "dojo/_base/lang", "dojo/number", "./_Widget", "./_TemplatedMixin", "dojo/text!./templates/ProgressBar.html"], function (require, declare, domClass, lang, number, _Widget, _TemplatedMixin, template) {
    return declare("dijit.ProgressBar", [_Widget, _TemplatedMixin], {progress:"0", value:"", maximum:100, places:0, indeterminate:false, label:"", name:"", templateString:template, _indeterminateHighContrastImagePath:require.toUrl("./themes/a11y/indeterminate_progress.gif"), postMixInProperties:function () {
        this.inherited(arguments);
        if (!(this.params && "value" in this.params)) {
            this.value = this.indeterminate ? Infinity : this.progress;
        }
    }, buildRendering:function () {
        this.inherited(arguments);
        this.indeterminateHighContrastImage.setAttribute("src", this._indeterminateHighContrastImagePath.toString());
        this.update();
    }, _setDirAttr:function (val) {
        var rtl = val.toLowerCase() == "rtl";
        domClass.toggle(this.domNode, "dijitProgressBarRtl", rtl);
        domClass.toggle(this.domNode, "dijitProgressBarIndeterminateRtl", this.indeterminate && rtl);
        this.inherited(arguments);
    }, update:function (attributes) {
        lang.mixin(this, attributes || {});
        var tip = this.internalProgress, ap = this.domNode;
        var percent = 1;
        if (this.indeterminate) {
            ap.removeAttribute("aria-valuenow");
        } else {
            if (String(this.progress).indexOf("%") != -1) {
                percent = Math.min(parseFloat(this.progress) / 100, 1);
                this.progress = percent * this.maximum;
            } else {
                this.progress = Math.min(this.progress, this.maximum);
                percent = this.maximum ? this.progress / this.maximum : 0;
            }
            ap.setAttribute("aria-valuenow", this.progress);
        }
        ap.setAttribute("aria-labelledby", this.labelNode.id);
        ap.setAttribute("aria-valuemin", 0);
        ap.setAttribute("aria-valuemax", this.maximum);
        this.labelNode.innerHTML = this.report(percent);
        domClass.toggle(this.domNode, "dijitProgressBarIndeterminate", this.indeterminate);
        domClass.toggle(this.domNode, "dijitProgressBarIndeterminateRtl", this.indeterminate && !this.isLeftToRight());
        tip.style.width = (percent * 100) + "%";
        this.onChange();
    }, _setValueAttr:function (v) {
        this._set("value", v);
        if (v == Infinity) {
            this.update({indeterminate:true});
        } else {
            this.update({indeterminate:false, progress:v});
        }
    }, _setLabelAttr:function (label) {
        this._set("label", label);
        this.update();
    }, _setIndeterminateAttr:function (indeterminate) {
        this._set("indeterminate", indeterminate);
        this.update();
    }, report:function (percent) {
        return this.label ? this.label : (this.indeterminate ? "&#160;" : number.format(percent, {type:"percent", places:this.places, locale:this.lang}));
    }, onChange:function () {
    }});
});

