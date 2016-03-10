//>>built

define("dijit/_OnDijitClickMixin", ["dojo/on", "dojo/_base/array", "dojo/keys", "dojo/_base/declare", "dojo/has", "./a11yclick"], function (on, array, keys, declare, has, a11yclick) {
    var ret = declare("dijit._OnDijitClickMixin", null, {connect:function (obj, event, method) {
        return this.inherited(arguments, [obj, event == "ondijitclick" ? a11yclick : event, method]);
    }});
    ret.a11yclick = a11yclick;
    return ret;
});

