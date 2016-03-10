//>>built

define("dijit/Toolbar", ["require", "dojo/_base/declare", "dojo/has", "dojo/keys", "dojo/ready", "./_Widget", "./_KeyNavContainer", "./_TemplatedMixin"], function (require, declare, has, keys, ready, _Widget, _KeyNavContainer, _TemplatedMixin) {
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/ToolbarSeparator"];
            require(requires);
        });
    }
    return declare("dijit.Toolbar", [_Widget, _TemplatedMixin, _KeyNavContainer], {templateString:"<div class=\"dijit\" role=\"toolbar\" tabIndex=\"${tabIndex}\" data-dojo-attach-point=\"containerNode\">" + "</div>", baseClass:"dijitToolbar", _onLeftArrow:function () {
        this.focusPrev();
    }, _onRightArrow:function () {
        this.focusNext();
    }});
});

