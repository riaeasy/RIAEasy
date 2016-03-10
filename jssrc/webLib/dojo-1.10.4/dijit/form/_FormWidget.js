//>>built

define("dijit/form/_FormWidget", ["dojo/_base/declare", "dojo/sniff", "dojo/_base/kernel", "dojo/ready", "../_Widget", "../_CssStateMixin", "../_TemplatedMixin", "./_FormWidgetMixin"], function (declare, has, kernel, ready, _Widget, _CssStateMixin, _TemplatedMixin, _FormWidgetMixin) {
    if (has("dijit-legacy-requires")) {
        ready(0, function () {
            var requires = ["dijit/form/_FormValueWidget"];
            require(requires);
        });
    }
    return declare("dijit.form._FormWidget", [_Widget, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin], {setDisabled:function (disabled) {
        kernel.deprecated("setDisabled(" + disabled + ") is deprecated. Use set('disabled'," + disabled + ") instead.", "", "2.0");
        this.set("disabled", disabled);
    }, setValue:function (value) {
        kernel.deprecated("dijit.form._FormWidget:setValue(" + value + ") is deprecated.  Use set('value'," + value + ") instead.", "", "2.0");
        this.set("value", value);
    }, getValue:function () {
        kernel.deprecated(this.declaredClass + "::getValue() is deprecated. Use get('value') instead.", "", "2.0");
        return this.get("value");
    }, postMixInProperties:function () {
        this.nameAttrSetting = (this.name && !has("msapp")) ? ("name=\"" + this.name.replace(/"/g, "&quot;") + "\"") : "";
        this.inherited(arguments);
    }});
});

