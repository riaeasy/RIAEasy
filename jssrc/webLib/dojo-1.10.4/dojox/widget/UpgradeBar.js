//>>built

require({cache:{"url:dojox/widget/UpgradeBar/UpgradeBar.html":"<div class=\"dojoxUpgradeBar\">\n\t<div class=\"dojoxUpgradeBarMessage\" dojoAttachPoint=\"messageNode\">message</div>\n\t<div class=\"dojoxUpgradeBarReminderButton\" dojoAttachPoint=\"dontRemindButtonNode\" dojoAttachEvent=\"onclick:_onDontRemindClick\">${noRemindButton}</div>\n\t<span dojoAttachPoint=\"closeButtonNode\" class=\"dojoxUpgradeBarCloseIcon\" dojoAttachEvent=\"onclick: hide, onmouseenter: _onCloseEnter, onmouseleave: _onCloseLeave\" title=\"${buttonCancel}\"></span>\n</div>"}});
define("dojox/widget/UpgradeBar", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/fx", "dojo/_base/lang", "dojo/_base/sniff", "dojo/_base/window", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/cookie", "dojo/domReady", "dojo/fx", "dojo/window", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!./UpgradeBar/UpgradeBar.html"], function (dojo, array, connect, declare, baseFx, lang, has, baseWin, domAttr, domClass, domConstruct, domGeo, style, cookie, domReady, fx, win, _WidgetBase, _TemplatedMixin, template) {
    dojo.experimental("dojox.widget.UpgradeBar");
    var UpgradeBar = declare("dojox.widget.UpgradeBar", [_WidgetBase, _TemplatedMixin], {notifications:[], buttonCancel:"Close for now", noRemindButton:"Don't Remind Me Again", templateString:template, constructor:function (props, node) {
        if (!props.notifications && node) {
            array.forEach(node.childNodes, function (n) {
                if (n.nodeType == 1) {
                    var val = domAttr.get(n, "validate");
                    this.notifications.push({message:n.innerHTML, validate:function () {
                        var evals = true;
                        try {
                            evals = dojo.eval(val);
                        }
                        catch (e) {
                        }
                        return evals;
                    }});
                }
            }, this);
        }
    }, checkNotifications:function () {
        if (!this.notifications.length) {
            return;
        }
        for (var i = 0; i < this.notifications.length; i++) {
            var evals = this.notifications[i].validate();
            if (evals) {
                this.notify(this.notifications[i].message);
                break;
            }
        }
    }, postCreate:function () {
        this.inherited(arguments);
        if (this.domNode.parentNode) {
            style.set(this.domNode, "display", "none");
        }
        lang.mixin(this.attributeMap, {message:{node:"messageNode", type:"innerHTML"}});
        if (!this.noRemindButton) {
            domConstruct.destroy(this.dontRemindButtonNode);
        }
        if (has("ie") == 6) {
            var self = this;
            var setWidth = function () {
                var v = win.getBox();
                style.set(self.domNode, "width", v.w + "px");
            };
            this.connect(window, "resize", function () {
                setWidth();
            });
            setWidth();
        }
        domReady(lang.hitch(this, "checkNotifications"));
    }, notify:function (msg) {
        if (cookie("disableUpgradeReminders")) {
            return;
        }
        if (!this.domNode.parentNode || !this.domNode.parentNode.innerHTML) {
            document.body.appendChild(this.domNode);
        }
        style.set(this.domNode, "display", "");
        if (msg) {
            this.set("message", msg);
        }
    }, show:function () {
        this._bodyMarginTop = style.get(baseWin.body(), "marginTop");
        this._size = domGeo.getContentBox(this.domNode).h;
        style.set(this.domNode, {display:"block", height:0, opacity:0});
        if (!this._showAnim) {
            this._showAnim = fx.combine([baseFx.animateProperty({node:baseWin.body(), duration:500, properties:{marginTop:this._bodyMarginTop + this._size}}), baseFx.animateProperty({node:this.domNode, duration:500, properties:{height:this._size, opacity:1}})]);
        }
        this._showAnim.play();
    }, hide:function () {
        if (!this._hideAnim) {
            this._hideAnim = fx.combine([baseFx.animateProperty({node:baseWin.body(), duration:500, properties:{marginTop:this._bodyMarginTop}}), baseFx.animateProperty({node:this.domNode, duration:500, properties:{height:0, opacity:0}})]);
            connect.connect(this._hideAnim, "onEnd", this, function () {
                style.set(this.domNode, {display:"none", opacity:1});
            });
        }
        this._hideAnim.play();
    }, _onDontRemindClick:function () {
        cookie("disableUpgradeReminders", true, {expires:3650});
        this.hide();
    }, _onCloseEnter:function () {
        domClass.add(this.closeButtonNode, "dojoxUpgradeBarCloseIcon-hover");
    }, _onCloseLeave:function () {
        domClass.remove(this.closeButtonNode, "dojoxUpgradeBarCloseIcon-hover");
    }});
    return UpgradeBar;
});

