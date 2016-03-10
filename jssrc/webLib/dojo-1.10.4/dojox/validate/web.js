//>>built

define("dojox/validate/web", ["./_base", "./regexp"], function (validate, xregexp) {
    validate.isIpAddress = function (value, flags) {
        var re = new RegExp("^" + xregexp.ipAddress(flags) + "$", "i");
        return re.test(value);
    };
    validate.isUrl = function (value, flags) {
        var re = new RegExp("^" + xregexp.url(flags) + "$", "i");
        return re.test(value);
    };
    validate.isEmailAddress = function (value, flags) {
        var re = new RegExp("^" + xregexp.emailAddress(flags) + "$", "i");
        return re.test(value);
    };
    validate.isEmailAddressList = function (value, flags) {
        var re = new RegExp("^" + xregexp.emailAddressList(flags) + "$", "i");
        return re.test(value);
    };
    validate.getEmailAddressList = function (value, flags) {
        if (!flags) {
            flags = {};
        }
        if (!flags.listSeparator) {
            flags.listSeparator = "\\s;,";
        }
        if (validate.isEmailAddressList(value, flags)) {
            return value.split(new RegExp("\\s*[" + flags.listSeparator + "]\\s*"));
        }
        return [];
    };
    return validate;
});

