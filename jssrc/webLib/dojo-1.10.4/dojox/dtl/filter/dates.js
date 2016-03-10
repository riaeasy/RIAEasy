//>>built

define("dojox/dtl/filter/dates", ["dojo/_base/lang", "../_base", "../utils/date"], function (lang, dd, ddud) {
    var ddfd = lang.getObject("filter.dates", true, dd);
    lang.mixin(ddfd, {_toDate:function (value) {
        if (value instanceof Date) {
            return value;
        }
        value = new Date(value);
        if (value.getTime() == new Date(0).getTime()) {
            return "";
        }
        return value;
    }, date:function (value, arg) {
        value = ddfd._toDate(value);
        if (!value) {
            return "";
        }
        arg = arg || "N j, Y";
        return ddud.format(value, arg);
    }, time:function (value, arg) {
        value = ddfd._toDate(value);
        if (!value) {
            return "";
        }
        arg = arg || "P";
        return ddud.format(value, arg);
    }, timesince:function (value, arg) {
        value = ddfd._toDate(value);
        if (!value) {
            return "";
        }
        var timesince = ddud.timesince;
        if (arg) {
            return timesince(arg, value);
        }
        return timesince(value);
    }, timeuntil:function (value, arg) {
        value = ddfd._toDate(value);
        if (!value) {
            return "";
        }
        var timesince = ddud.timesince;
        if (arg) {
            return timesince(arg, value);
        }
        return timesince(new Date(), value);
    }});
    return ddfd;
});

