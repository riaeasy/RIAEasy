//>>built

define("dijit/_BidiSupport", ["dojo/has", "./_WidgetBase", "./_BidiMixin"], function (has, _WidgetBase, _BidiMixin) {
    _WidgetBase.extend(_BidiMixin);
    0 && has.add("dojo-bidi", true);
    return _WidgetBase;
});

