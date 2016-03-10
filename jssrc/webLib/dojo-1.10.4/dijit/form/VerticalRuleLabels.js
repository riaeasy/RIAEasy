//>>built

define("dijit/form/VerticalRuleLabels", ["dojo/_base/declare", "./HorizontalRuleLabels"], function (declare, HorizontalRuleLabels) {
    return declare("dijit.form.VerticalRuleLabels", HorizontalRuleLabels, {templateString:"<div class=\"dijitRuleContainer dijitRuleContainerV dijitRuleLabelsContainer dijitRuleLabelsContainerV\"></div>", _positionPrefix:"<div class=\"dijitRuleLabelContainer dijitRuleLabelContainerV\" style=\"top:", _labelPrefix:"\"><span class=\"dijitRuleLabel dijitRuleLabelV\">", _calcPosition:function (pos) {
        return 100 - pos;
    }, _isHorizontal:false});
});

