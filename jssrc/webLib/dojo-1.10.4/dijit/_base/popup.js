//>>built

define("dijit/_base/popup", ["dojo/dom-class", "dojo/_base/window", "../popup", "../BackgroundIframe"], function (domClass, win, popup) {
    var origCreateWrapper = popup._createWrapper;
    popup._createWrapper = function (widget) {
        if (!widget.declaredClass) {
            widget = {_popupWrapper:(widget.parentNode && domClass.contains(widget.parentNode, "dijitPopup")) ? widget.parentNode : null, domNode:widget, destroy:function () {
            }, ownerDocument:widget.ownerDocument, ownerDocumentBody:win.body(widget.ownerDocument)};
        }
        return origCreateWrapper.call(this, widget);
    };
    var origOpen = popup.open;
    popup.open = function (args) {
        if (args.orient && typeof args.orient != "string" && !("length" in args.orient)) {
            var ary = [];
            for (var key in args.orient) {
                ary.push({aroundCorner:key, corner:args.orient[key]});
            }
            args.orient = ary;
        }
        return origOpen.call(this, args);
    };
    return popup;
});

