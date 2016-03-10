//>>built

define("dojox/dtl/filter/logic", ["dojo/_base/lang", "../_base"], function (lang, dd) {
    var logic = lang.getObject("filter.logic", true, dd);
    lang.mixin(logic, {default_:function (value, arg) {
        return value || arg || "";
    }, default_if_none:function (value, arg) {
        return (value === null) ? arg || "" : value || "";
    }, divisibleby:function (value, arg) {
        return (parseInt(value, 10) % parseInt(arg, 10)) === 0;
    }, _yesno:/\s*,\s*/g, yesno:function (value, arg) {
        if (!arg) {
            arg = "yes,no,maybe";
        }
        var parts = arg.split(dojox.dtl.filter.logic._yesno);
        if (parts.length < 2) {
            return value;
        }
        if (value) {
            return parts[0];
        }
        if ((!value && value !== null) || parts.length < 3) {
            return parts[1];
        }
        return parts[2];
    }});
    return logic;
});

