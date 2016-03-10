//>>built

define("dojox/mobile/i18n", ["dojo/_base/lang", "dojo/i18n", "dijit/_WidgetBase"], function (lang, di18n, WidgetBase) {
    var i18n = {};
    lang.setObject("dojox.mobile.i18n", i18n);
    i18n.load = function (packageName, bundleName, locale) {
        return i18n.registerBundle(di18n.getLocalization(packageName, bundleName, locale));
    };
    i18n.registerBundle = function (bundle) {
        if (!i18n.bundle) {
            i18n.bundle = [];
        }
        return lang.mixin(i18n.bundle, bundle);
    };
    i18n.I18NProperties = {mblNoConv:false};
    lang.extend(WidgetBase, i18n.I18NProperties);
    lang.extend(WidgetBase, {_cv:function (s) {
        if (this.mblNoConv || !i18n.bundle) {
            return s;
        }
        return i18n.bundle[lang.trim(s)] || s;
    }});
    return i18n;
});

