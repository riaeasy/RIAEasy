//>>built

define("dojox/mobile/bidi/TabBarButton", ["dojo/_base/declare", "./common", "dojo/dom-class"], function (declare, common, domClass) {
    return declare(null, {_setBadgeAttr:function (text) {
        this.inherited(arguments);
        this.badgeObj.setTextDir(this.textDir);
    }, _setIcon:function (icon, n) {
        this.inherited(arguments);
        if (this.iconDivNode && !this.isLeftToRight()) {
            domClass.remove(this.iconDivNode, "mblTabBarButtonIconArea");
            domClass.add(this.iconDivNode, "mblTabBarButtonIconAreaRtl");
        }
    }});
});

