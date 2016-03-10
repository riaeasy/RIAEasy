//>>built

define("dijit/form/Form", ["dojo/_base/declare", "dojo/dom-attr", "dojo/_base/kernel", "dojo/sniff", "../_Widget", "../_TemplatedMixin", "./_FormMixin", "../layout/_ContentPaneResizeMixin"], function (declare, domAttr, kernel, has, _Widget, _TemplatedMixin, _FormMixin, _ContentPaneResizeMixin) {
    return declare("dijit.form.Form", [_Widget, _TemplatedMixin, _FormMixin, _ContentPaneResizeMixin], {name:"", action:"", method:"", encType:"", "accept-charset":"", accept:"", target:"", templateString:"<form data-dojo-attach-point='containerNode' data-dojo-attach-event='onreset:_onReset,onsubmit:_onSubmit' ${!nameAttrSetting}></form>", postMixInProperties:function () {
        this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
        this.inherited(arguments);
    }, execute:function () {
    }, onExecute:function () {
    }, _setEncTypeAttr:function (value) {
        domAttr.set(this.domNode, "encType", value);
        if (has("ie")) {
            this.domNode.encoding = value;
        }
        this._set("encType", value);
    }, reset:function (e) {
        var faux = {returnValue:true, preventDefault:function () {
            this.returnValue = false;
        }, stopPropagation:function () {
        }, currentTarget:e ? e.target : this.domNode, target:e ? e.target : this.domNode};
        if (!(this.onReset(faux) === false) && faux.returnValue) {
            this.inherited(arguments, []);
        }
    }, onReset:function () {
        return true;
    }, _onReset:function (e) {
        this.reset(e);
        e.stopPropagation();
        e.preventDefault();
        return false;
    }, _onSubmit:function (e) {
        var fp = this.constructor.prototype;
        if (this.execute != fp.execute || this.onExecute != fp.onExecute) {
            kernel.deprecated("dijit.form.Form:execute()/onExecute() are deprecated. Use onSubmit() instead.", "", "2.0");
            this.onExecute();
            this.execute(this.getValues());
        }
        if (this.onSubmit(e) === false) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, onSubmit:function () {
        return this.isValid();
    }, submit:function () {
        if (!(this.onSubmit() === false)) {
            this.containerNode.submit();
        }
    }});
});

