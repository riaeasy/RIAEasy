//>>built

define("dojox/validate/ca", ["dojo/_base/lang", "./_base", "./regexp", "./us"], function (lang, validate, xregexp, us) {
    var ca = lang.getObject("ca", true, validate);
    lang.mixin(ca, {isPhoneNumber:function (value) {
        return us.isPhoneNumber(value);
    }, isProvince:function (value) {
        var re = new RegExp("^" + xregexp.ca.province() + "$", "i");
        return re.test(value);
    }, isSocialInsuranceNumber:function (value) {
        var flags = {format:["###-###-###", "### ### ###", "#########"]};
        return validate.isNumberFormat(value, flags);
    }, isPostalCode:function (value) {
        var re = new RegExp("^" + xregexp.ca.postalCode() + "$", "i");
        return re.test(value);
    }});
    return ca;
});

