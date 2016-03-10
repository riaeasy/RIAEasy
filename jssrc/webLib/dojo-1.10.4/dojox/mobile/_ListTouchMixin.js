//>>built

define("dojox/mobile/_ListTouchMixin", ["dojo/_base/declare", "dojo/touch", "./sniff", "dijit/form/_ListBase"], function (declare, touch, has, ListBase) {
    return declare("dojox.mobile._ListTouchMixin", ListBase, {postCreate:function () {
        this.inherited(arguments);
        if (!((has("ie") === 10 || (!has("ie") && has("trident") > 6)) && typeof (MSGesture) !== "undefined")) {
            this._listConnect("click", "_onClick");
        } else {
            this._listConnect(touch.press, "_onPress");
            var self = this, tapGesture = new MSGesture(), target;
            this._onPress = function (e) {
                tapGesture.target = self.domNode;
                tapGesture.addPointer(e.pointerId);
                target = e.target;
            };
            this.on("MSGestureTap", function (e) {
                self._onClick(e, target);
            });
        }
    }, _onClick:function (evt, target) {
        this._setSelectedAttr(target);
        this.onClick(target);
    }});
});

