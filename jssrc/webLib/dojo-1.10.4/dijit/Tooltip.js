//>>built

require({cache:{"url:dijit/templates/Tooltip.html":"<div class=\"dijitTooltip dijitTooltipLeft\" id=\"dojoTooltip\" data-dojo-attach-event=\"mouseenter:onMouseEnter,mouseleave:onMouseLeave\"\n\t><div class=\"dijitTooltipConnector\" data-dojo-attach-point=\"connectorNode\"></div\n\t><div class=\"dijitTooltipContainer dijitTooltipContents\" data-dojo-attach-point=\"containerNode\" role='alert'></div\n></div>\n"}});
define("dijit/Tooltip", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/fx", "dojo/dom", "dojo/dom-class", "dojo/dom-geometry", "dojo/dom-style", "dojo/_base/lang", "dojo/mouse", "dojo/on", "dojo/sniff", "./_base/manager", "./place", "./_Widget", "./_TemplatedMixin", "./BackgroundIframe", "dojo/text!./templates/Tooltip.html", "./main"], function (array, declare, fx, dom, domClass, domGeometry, domStyle, lang, mouse, on, has, manager, place, _Widget, _TemplatedMixin, BackgroundIframe, template, dijit) {
    var MasterTooltip = declare("dijit._MasterTooltip", [_Widget, _TemplatedMixin], {duration:manager.defaultDuration, templateString:template, postCreate:function () {
        this.ownerDocumentBody.appendChild(this.domNode);
        this.bgIframe = new BackgroundIframe(this.domNode);
        this.fadeIn = fx.fadeIn({node:this.domNode, duration:this.duration, onEnd:lang.hitch(this, "_onShow")});
        this.fadeOut = fx.fadeOut({node:this.domNode, duration:this.duration, onEnd:lang.hitch(this, "_onHide")});
    }, show:function (innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave) {
        if (this.aroundNode && this.aroundNode === aroundNode && this.containerNode.innerHTML == innerHTML) {
            return;
        }
        if (this.fadeOut.status() == "playing") {
            this._onDeck = arguments;
            return;
        }
        this.containerNode.innerHTML = innerHTML;
        if (textDir) {
            this.set("textDir", textDir);
        }
        this.containerNode.align = rtl ? "right" : "left";
        var pos = place.around(this.domNode, aroundNode, position && position.length ? position : Tooltip.defaultPosition, !rtl, lang.hitch(this, "orient"));
        var aroundNodeCoords = pos.aroundNodePos;
        if (pos.corner.charAt(0) == "M" && pos.aroundCorner.charAt(0) == "M") {
            this.connectorNode.style.top = aroundNodeCoords.y + ((aroundNodeCoords.h - this.connectorNode.offsetHeight) >> 1) - pos.y + "px";
            this.connectorNode.style.left = "";
        } else {
            if (pos.corner.charAt(1) == "M" && pos.aroundCorner.charAt(1) == "M") {
                this.connectorNode.style.left = aroundNodeCoords.x + ((aroundNodeCoords.w - this.connectorNode.offsetWidth) >> 1) - pos.x + "px";
            } else {
                this.connectorNode.style.left = "";
                this.connectorNode.style.top = "";
            }
        }
        domStyle.set(this.domNode, "opacity", 0);
        this.fadeIn.play();
        this.isShowingNow = true;
        this.aroundNode = aroundNode;
        this.onMouseEnter = onMouseEnter || noop;
        this.onMouseLeave = onMouseLeave || noop;
    }, orient:function (node, aroundCorner, tooltipCorner, spaceAvailable, aroundNodeCoords) {
        this.connectorNode.style.top = "";
        var heightAvailable = spaceAvailable.h, widthAvailable = spaceAvailable.w;
        node.className = "dijitTooltip " + {"MR-ML":"dijitTooltipRight", "ML-MR":"dijitTooltipLeft", "TM-BM":"dijitTooltipAbove", "BM-TM":"dijitTooltipBelow", "BL-TL":"dijitTooltipBelow dijitTooltipABLeft", "TL-BL":"dijitTooltipAbove dijitTooltipABLeft", "BR-TR":"dijitTooltipBelow dijitTooltipABRight", "TR-BR":"dijitTooltipAbove dijitTooltipABRight", "BR-BL":"dijitTooltipRight", "BL-BR":"dijitTooltipLeft"}[aroundCorner + "-" + tooltipCorner];
        this.domNode.style.width = "auto";
        var size = domGeometry.position(this.domNode);
        if (has("ie") || has("trident")) {
            size.w += 2;
        }
        var width = Math.min((Math.max(widthAvailable, 1)), size.w);
        domGeometry.setMarginBox(this.domNode, {w:width});
        if (tooltipCorner.charAt(0) == "B" && aroundCorner.charAt(0) == "B") {
            var bb = domGeometry.position(node);
            var tooltipConnectorHeight = this.connectorNode.offsetHeight;
            if (bb.h > heightAvailable) {
                var aroundNodePlacement = heightAvailable - ((aroundNodeCoords.h + tooltipConnectorHeight) >> 1);
                this.connectorNode.style.top = aroundNodePlacement + "px";
                this.connectorNode.style.bottom = "";
            } else {
                this.connectorNode.style.bottom = Math.min(Math.max(aroundNodeCoords.h / 2 - tooltipConnectorHeight / 2, 0), bb.h - tooltipConnectorHeight) + "px";
                this.connectorNode.style.top = "";
            }
        } else {
            this.connectorNode.style.top = "";
            this.connectorNode.style.bottom = "";
        }
        return Math.max(0, size.w - widthAvailable);
    }, _onShow:function () {
        if (has("ie")) {
            this.domNode.style.filter = "";
        }
    }, hide:function (aroundNode) {
        if (this._onDeck && this._onDeck[1] == aroundNode) {
            this._onDeck = null;
        } else {
            if (this.aroundNode === aroundNode) {
                this.fadeIn.stop();
                this.isShowingNow = false;
                this.aroundNode = null;
                this.fadeOut.play();
            } else {
            }
        }
        this.onMouseEnter = this.onMouseLeave = noop;
    }, _onHide:function () {
        this.domNode.style.cssText = "";
        this.containerNode.innerHTML = "";
        if (this._onDeck) {
            this.show.apply(this, this._onDeck);
            this._onDeck = null;
        }
    }});
    if (0) {
        MasterTooltip.extend({_setAutoTextDir:function (node) {
            this.applyTextDir(node);
            array.forEach(node.children, function (child) {
                this._setAutoTextDir(child);
            }, this);
        }, _setTextDirAttr:function (textDir) {
            this._set("textDir", textDir);
            if (textDir == "auto") {
                this._setAutoTextDir(this.containerNode);
            } else {
                this.containerNode.dir = this.textDir;
            }
        }});
    }
    dijit.showTooltip = function (innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave) {
        if (position) {
            position = array.map(position, function (val) {
                return {after:"after-centered", before:"before-centered"}[val] || val;
            });
        }
        if (!Tooltip._masterTT) {
            dijit._masterTT = Tooltip._masterTT = new MasterTooltip();
        }
        return Tooltip._masterTT.show(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave);
    };
    dijit.hideTooltip = function (aroundNode) {
        return Tooltip._masterTT && Tooltip._masterTT.hide(aroundNode);
    };
    var DORMANT = "DORMANT", SHOW_TIMER = "SHOW TIMER", SHOWING = "SHOWING", HIDE_TIMER = "HIDE TIMER";
    function noop() {
    }
    var Tooltip = declare("dijit.Tooltip", _Widget, {label:"", showDelay:400, hideDelay:400, connectId:[], position:[], selector:"", _setConnectIdAttr:function (newId) {
        array.forEach(this._connections || [], function (nested) {
            array.forEach(nested, function (handle) {
                handle.remove();
            });
        }, this);
        this._connectIds = array.filter(lang.isArrayLike(newId) ? newId : (newId ? [newId] : []), function (id) {
            return dom.byId(id, this.ownerDocument);
        }, this);
        this._connections = array.map(this._connectIds, function (id) {
            var node = dom.byId(id, this.ownerDocument), selector = this.selector, delegatedEvent = selector ? function (eventType) {
                return on.selector(selector, eventType);
            } : function (eventType) {
                return eventType;
            }, self = this;
            return [on(node, delegatedEvent(mouse.enter), function () {
                self._onHover(this);
            }), on(node, delegatedEvent("focusin"), function () {
                self._onHover(this);
            }), on(node, delegatedEvent(mouse.leave), lang.hitch(self, "_onUnHover")), on(node, delegatedEvent("focusout"), lang.hitch(self, "set", "state", DORMANT))];
        }, this);
        this._set("connectId", newId);
    }, addTarget:function (node) {
        var id = node.id || node;
        if (array.indexOf(this._connectIds, id) == -1) {
            this.set("connectId", this._connectIds.concat(id));
        }
    }, removeTarget:function (node) {
        var id = node.id || node, idx = array.indexOf(this._connectIds, id);
        if (idx >= 0) {
            this._connectIds.splice(idx, 1);
            this.set("connectId", this._connectIds);
        }
    }, buildRendering:function () {
        this.inherited(arguments);
        domClass.add(this.domNode, "dijitTooltipData");
    }, startup:function () {
        this.inherited(arguments);
        var ids = this.connectId;
        array.forEach(lang.isArrayLike(ids) ? ids : [ids], this.addTarget, this);
    }, getContent:function (node) {
        return this.label || this.domNode.innerHTML;
    }, state:DORMANT, _setStateAttr:function (val) {
        if (this.state == val || (val == SHOW_TIMER && this.state == SHOWING) || (val == HIDE_TIMER && this.state == DORMANT)) {
            return;
        }
        if (this._hideTimer) {
            this._hideTimer.remove();
            delete this._hideTimer;
        }
        if (this._showTimer) {
            this._showTimer.remove();
            delete this._showTimer;
        }
        switch (val) {
          case DORMANT:
            if (this._connectNode) {
                Tooltip.hide(this._connectNode);
                delete this._connectNode;
                this.onHide();
            }
            break;
          case SHOW_TIMER:
            if (this.state != SHOWING) {
                this._showTimer = this.defer(function () {
                    this.set("state", SHOWING);
                }, this.showDelay);
            }
            break;
          case SHOWING:
            var content = this.getContent(this._connectNode);
            if (!content) {
                this.set("state", DORMANT);
                return;
            }
            Tooltip.show(content, this._connectNode, this.position, !this.isLeftToRight(), this.textDir, lang.hitch(this, "set", "state", SHOWING), lang.hitch(this, "set", "state", HIDE_TIMER));
            this.onShow(this._connectNode, this.position);
            break;
          case HIDE_TIMER:
            this._hideTimer = this.defer(function () {
                this.set("state", DORMANT);
            }, this.hideDelay);
            break;
        }
        this._set("state", val);
    }, _onHover:function (target) {
        if (this._connectNode && target != this._connectNode) {
            this.set("state", DORMANT);
        }
        this._connectNode = target;
        this.set("state", SHOW_TIMER);
    }, _onUnHover:function (target) {
        this.set("state", HIDE_TIMER);
    }, open:function (target) {
        this.set("state", DORMANT);
        this._connectNode = target;
        this.set("state", SHOWING);
    }, close:function () {
        this.set("state", DORMANT);
    }, onShow:function () {
    }, onHide:function () {
    }, destroy:function () {
        this.set("state", DORMANT);
        array.forEach(this._connections || [], function (nested) {
            array.forEach(nested, function (handle) {
                handle.remove();
            });
        }, this);
        this.inherited(arguments);
    }});
    Tooltip._MasterTooltip = MasterTooltip;
    Tooltip.show = dijit.showTooltip;
    Tooltip.hide = dijit.hideTooltip;
    Tooltip.defaultPosition = ["after-centered", "before-centered"];
    return Tooltip;
});

