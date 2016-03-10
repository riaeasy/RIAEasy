//>>built

define("dijit/form/HorizontalRuleLabels", ["dojo/_base/declare", "dojo/has", "dojo/number", "dojo/query", "dojo/_base/lang", "./HorizontalRule"], function (declare, has, number, query, lang, HorizontalRule) {
    var HorizontalRuleLabels = declare("dijit.form.HorizontalRuleLabels", HorizontalRule, {templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH dijitRuleLabelsContainer dijitRuleLabelsContainerH\"></div>", labelStyle:"", labels:[], numericMargin:0, minimum:0, maximum:1, constraints:{pattern:"#%"}, _positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerH\" style=\"left:", _labelPrefix:"\"><div class=\"dijitRuleLabel dijitRuleLabelH\">", _suffix:"</div></div>", _calcPosition:function (pos) {
        return pos;
    }, _genHTML:function (pos, ndx) {
        var label = this.labels[ndx];
        return this._positionPrefix + this._calcPosition(pos) + this._positionSuffix + this.labelStyle + this._genDirectionHTML(label) + this._labelPrefix + label + this._suffix;
    }, _genDirectionHTML:function (label) {
        return "";
    }, getLabels:function () {
        var labels = this.labels;
        if (!labels.length && this.srcNodeRef) {
            labels = query("> li", this.srcNodeRef).map(function (node) {
                return String(node.innerHTML);
            });
        }
        if (!labels.length && this.count > 1) {
            var start = this.minimum;
            var inc = (this.maximum - start) / (this.count - 1);
            for (var i = 0; i < this.count; i++) {
                labels.push((i < this.numericMargin || i >= (this.count - this.numericMargin)) ? "" : number.format(start, this.constraints));
                start += inc;
            }
        }
        return labels;
    }, postMixInProperties:function () {
        this.inherited(arguments);
        this.labels = this.getLabels();
        this.count = this.labels.length;
    }});
    if (0) {
        HorizontalRuleLabels.extend({_setTextDirAttr:function (textDir) {
            if (this.textDir != textDir) {
                this._set("textDir", textDir);
                query(".dijitRuleLabelContainer", this.domNode).forEach(lang.hitch(this, function (labelNode) {
                    labelNode.style.direction = this.getTextDir(labelNode.innerText || labelNode.textContent || "");
                }));
            }
        }, _genDirectionHTML:function (label) {
            return (this.textDir ? ("direction:" + this.getTextDir(label) + ";") : "");
        }});
    }
    return HorizontalRuleLabels;
});

