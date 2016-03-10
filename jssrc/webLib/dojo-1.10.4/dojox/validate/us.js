//>>built

define("dojox/validate/us", ["dojo/_base/lang", "./_base", "./regexp"], function (lang, validate, xregexp) {
    var us = lang.getObject("us", true, validate);
    us.isState = function (value, flags) {
        var re = new RegExp("^" + xregexp.us.state(flags) + "$", "i");
        return re.test(value);
    };
    us.isPhoneNumber = function (value) {
        var flags = {format:["###-###-####", "(###) ###-####", "(###) ### ####", "###.###.####", "###/###-####", "### ### ####", "###-###-#### x#???", "(###) ###-#### x#???", "(###) ### #### x#???", "###.###.#### x#???", "###/###-#### x#???", "### ### #### x#???", "##########"]};
        return validate.isNumberFormat(value, flags);
    };
    us.isSocialSecurityNumber = function (value) {
        var flags = {format:["###-##-####", "### ## ####", "#########"]};
        return validate.isNumberFormat(value, flags);
    };
    us.isZipCode = function (value) {
        var flags = {format:["#####-####", "##### ####", "#########", "#####"]};
        return validate.isNumberFormat(value, flags);
    };
    return us;
});

