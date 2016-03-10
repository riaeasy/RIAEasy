//>>built

define("dojox/widget/PortletSettings", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-style", "dojo/dom-class", "dojo/fx", "dijit/_Container", "dijit/layout/ContentPane"], function (declare, lang, domStyle, domClass, fx, _Container, ContentPane) {
    return declare("dojox.widget.PortletSettings", [_Container, ContentPane], {portletIconClass:"dojoxPortletSettingsIcon", portletIconHoverClass:"dojoxPortletSettingsIconHover", postCreate:function () {
        domStyle.set(this.domNode, "display", "none");
        domClass.add(this.domNode, "dojoxPortletSettingsContainer");
        domClass.remove(this.domNode, "dijitContentPane");
    }, _setPortletAttr:function (portlet) {
        this.portlet = portlet;
    }, toggle:function () {
        var n = this.domNode;
        if (domStyle.get(n, "display") == "none") {
            domStyle.set(n, {"display":"block", "height":"1px", "width":"auto"});
            fx.wipeIn({node:n}).play();
        } else {
            fx.wipeOut({node:n, onEnd:lang.hitch(this, function () {
                domStyle.set(n, {"display":"none", "height":"", "width":""});
            })}).play();
        }
    }});
});

