//>>built

define("dijit/form/HorizontalRule", ["dojo/_base/declare", "../_Widget", "../_TemplatedMixin"], function (declare, _Widget, _TemplatedMixin) {
    return declare("dijit.form.HorizontalRule", [_Widget, _TemplatedMixin], {templateString:"<div class=\"dijitRuleContainer dijitRuleContainerH\"></div>", count:3, container:"containerNode", ruleStyle:"", _positionPrefix:"<div class=\"dijitRuleMark dijitRuleMarkH\" style=\"left:", _positionSuffix:"%;", _suffix:"\"></div>", _genHTML:function (pos) {
        return this._positionPrefix + pos + this._positionSuffix + this.ruleStyle + this._suffix;
    }, _isHorizontal:true, buildRendering:function () {
        this.inherited(arguments);
        var innerHTML;
        if (this.count == 1) {
            innerHTML = this._genHTML(50, 0);
        } else {
            var i;
            var interval = 100 / (this.count - 1);
            if (!this._isHorizontal || this.isLeftToRight()) {
                innerHTML = this._genHTML(0, 0);
                for (i = 1; i < this.count - 1; i++) {
                    innerHTML += this._genHTML(interval * i, i);
                }
                innerHTML += this._genHTML(100, this.count - 1);
            } else {
                innerHTML = this._genHTML(100, 0);
                for (i = 1; i < this.count - 1; i++) {
                    innerHTML += this._genHTML(100 - interval * i, i);
                }
                innerHTML += this._genHTML(0, this.count - 1);
            }
        }
        this.domNode.innerHTML = innerHTML;
    }});
});

