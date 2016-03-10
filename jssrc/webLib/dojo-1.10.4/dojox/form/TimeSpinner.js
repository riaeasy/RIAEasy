//>>built

define("dojox/form/TimeSpinner", ["dojo/_base/lang", "dojo/_base/event", "dijit/form/_Spinner", "dojo/keys", "dojo/date", "dojo/date/locale", "dojo/date/stamp", "dojo/_base/declare"], function (lang, event, Spinner, keys, dateUtil, dateLocale, dateStamp, declare) {
    return declare("dojox.form.TimeSpinner", Spinner, {required:false, adjust:function (val, delta) {
        return dateUtil.add(val, "minute", delta);
    }, isValid:function () {
        return true;
    }, smallDelta:5, largeDelta:30, timeoutChangeRate:0.5, parse:function (time, locale) {
        return dateLocale.parse(time, {selector:"time", formatLength:"short"});
    }, format:function (time, locale) {
        if (lang.isString(time)) {
            return time;
        }
        return dateLocale.format(time, {selector:"time", formatLength:"short"});
    }, serialize:dateStamp.toISOString, value:"12:00 AM", _onKeyDown:function (e) {
        if ((e.keyCode == keys.HOME || e.keyCode == keys.END) && !(e.ctrlKey || e.altKey || e.metaKey) && typeof this.get("value") != "undefined") {
            var value = this.constraints[(e.keyCode == keys.HOME ? "min" : "max")];
            if (value) {
                this._setValueAttr(value, true);
            }
            event.stop(e);
        }
    }});
});

