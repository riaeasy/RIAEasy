//>>built

define("dojox/date/relative", ["..", "dojo/_base/lang", "dojo/date/locale", "dojo/i18n"], function (dojox, lang, ddl, i18n) {
    var drelative = lang.getObject("date.relative", true, dojox);
    var DAY = 1000 * 60 * 60 * 24, SIX_DAYS = 6 * DAY, del = dojo.delegate, ggb = ddl._getGregorianBundle, fmt = ddl.format;
    function _clearTime(date) {
        date = new Date(date);
        date.setHours(0, 0, 0, 0);
        return date;
    }
    drelative.format = function (dateObject, options) {
        options = options || {};
        var today = _clearTime(options.relativeDate || new Date()), diff = today.getTime() - _clearTime(dateObject).getTime(), fmtOpts = {locale:options.locale};
        if (diff === 0) {
            return fmt(dateObject, del(fmtOpts, {selector:"time"}));
        } else {
            if (diff <= SIX_DAYS && diff > 0 && options.weekCheck !== false) {
                return fmt(dateObject, del(fmtOpts, {selector:"date", datePattern:"EEE"})) + " " + fmt(dateObject, del(fmtOpts, {selector:"time", formatLength:"short"}));
            } else {
                if (dateObject.getFullYear() == today.getFullYear()) {
                    var bundle = ggb(i18n.normalizeLocale(options.locale));
                    return fmt(dateObject, del(fmtOpts, {selector:"date", datePattern:bundle["dateFormatItem-MMMd"]}));
                } else {
                    return fmt(dateObject, del(fmtOpts, {selector:"date", formatLength:"medium", locale:options.locale}));
                }
            }
        }
    };
    return drelative;
});

