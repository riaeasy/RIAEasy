//>>built

define("dojox/dtl/filter/integers", ["dojo/_base/lang", "../_base"], function (lang, dd) {
    var integers = lang.getObject("filter.integers", true, dd);
    lang.mixin(integers, {add:function (value, arg) {
        value = parseInt(value, 10);
        arg = parseInt(arg, 10);
        return isNaN(arg) ? value : value + arg;
    }, get_digit:function (value, arg) {
        value = parseInt(value, 10);
        arg = parseInt(arg, 10) - 1;
        if (arg >= 0) {
            value += "";
            if (arg < value.length) {
                value = parseInt(value.charAt(arg), 10);
            } else {
                value = 0;
            }
        }
        return (isNaN(value) ? 0 : value);
    }});
    return integers;
});

