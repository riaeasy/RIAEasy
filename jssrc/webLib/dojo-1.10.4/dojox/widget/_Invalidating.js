//>>built

define("dojox/widget/_Invalidating", ["dojo/_base/declare", "dojo/_base/lang", "dojo/Stateful"], function (declare, lang, Stateful) {
    return declare("dojox.widget._Invalidating", Stateful, {invalidatingProperties:null, invalidRendering:false, postscript:function (mixin) {
        this.inherited(arguments);
        if (this.invalidatingProperties) {
            var props = this.invalidatingProperties;
            for (var i = 0; i < props.length; i++) {
                this.watch(props[i], lang.hitch(this, this.invalidateRendering));
                if (mixin && props[i] in mixin) {
                    this.invalidateRendering();
                }
            }
        }
    }, addInvalidatingProperties:function (properties) {
        this.invalidatingProperties = this.invalidatingProperties ? this.invalidatingProperties.concat(properties) : properties;
    }, invalidateRendering:function () {
        if (!this.invalidRendering) {
            this.invalidRendering = true;
            setTimeout(lang.hitch(this, this.validateRendering), 0);
        }
    }, validateRendering:function () {
        if (this.invalidRendering) {
            this.refreshRendering();
            this.invalidRendering = false;
        }
    }, refreshRendering:function () {
    }});
});

