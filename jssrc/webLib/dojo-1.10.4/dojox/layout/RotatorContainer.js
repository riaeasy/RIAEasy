//>>built

define("dojox/layout/RotatorContainer", ["dojo/_base/declare", "dojo/_base/html", "dojo/_base/connect", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/fx", "dojo/fx", "dijit/_base/manager", "dijit/layout/StackContainer", "dijit/layout/StackController", "dijit/_Widget", "dijit/_Templated", "dijit/_Contained"], function (declare, html, connect, lang, array, baseFx, coreFx, manager, StackContainer, StackController, Widget, Templated, Contained) {
    var RotatorContainer = declare("dojox.layout.RotatorContainer", [StackContainer, Templated], {templateString:"<div class=\"dojoxRotatorContainer\"><div dojoAttachPoint=\"tabNode\"></div><div class=\"dojoxRotatorPager\" dojoAttachPoint=\"pagerNode\"></div><div class=\"dojoxRotatorContent\" dojoAttachPoint=\"containerNode\"></div></div>", showTabs:true, transitionDelay:5000, transition:"fade", transitionDuration:1000, autoStart:true, suspendOnHover:false, pauseOnManualChange:null, reverse:false, pagerId:"", cycles:-1, pagerClass:"dojox.layout.RotatorPager", postCreate:function () {
        this.inherited(arguments);
        html.style(this.domNode, "position", "relative");
        if (this.cycles - 0 == this.cycles && this.cycles != -1) {
            this.cycles++;
        } else {
            this.cycles = -1;
        }
        if (this.pauseOnManualChange === null) {
            this.pauseOnManualChange = !this.suspendOnHover;
        }
        var id = this.id || "rotator" + (new Date()).getTime(), sc = new StackController({containerId:id}, this.tabNode);
        this.tabNode = sc.domNode;
        this._stackController = sc;
        html.style(this.tabNode, "display", this.showTabs ? "" : "none");
        this.connect(sc, "onButtonClick", "_manualChange");
        this._subscriptions = [connect.subscribe(this.id + "-cycle", this, "_cycle"), connect.subscribe(this.id + "-state", this, "_state")];
        var d = Math.round(this.transitionDelay * 0.75);
        if (d < this.transitionDuration) {
            this.transitionDuration = d;
        }
        if (this.suspendOnHover) {
            this.connect(this.domNode, "onmouseover", "_onMouseOver");
            this.connect(this.domNode, "onmouseout", "_onMouseOut");
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        var c = this.getChildren();
        for (var i = 0, len = c.length; i < len; i++) {
            if (c[i].declaredClass == this.pagerClass) {
                this.pagerNode.appendChild(c[i].domNode);
                break;
            }
        }
        this.inherited(arguments);
        if (this.autoStart) {
            setTimeout(lang.hitch(this, "_play"), 10);
        } else {
            this._updatePager();
        }
    }, destroy:function () {
        array.forEach(this._subscriptions, connect.unsubscribe);
        this.inherited(arguments);
    }, _setShowTabsAttr:function (value) {
        this.showTabs = value;
        html.style(this.tabNode, "display", value ? "" : "none");
    }, _updatePager:function () {
        var c = this.getChildren();
        connect.publish(this.id + "-update", [this._playing, array.indexOf(c, this.selectedChildWidget) + 1, c.length]);
    }, _onMouseOver:function () {
        this._resetTimer();
        this._over = true;
    }, _onMouseOut:function () {
        this._over = false;
        if (this._playing) {
            clearTimeout(this._timer);
            this._timer = setTimeout(lang.hitch(this, "_play", true), 200);
        }
    }, _resetTimer:function () {
        clearTimeout(this._timer);
        this._timer = null;
    }, _cycle:function (next) {
        if (next instanceof Boolean || typeof next == "boolean") {
            this._manualChange();
        }
        var c = this.getChildren(), len = c.length, i = array.indexOf(c, this.selectedChildWidget) + (next === false || (next !== true && this.reverse) ? -1 : 1);
        this.selectChild(c[(i < len ? (i < 0 ? len - 1 : i) : 0)]);
        this._updatePager();
    }, _manualChange:function () {
        if (this.pauseOnManualChange) {
            this._playing = false;
        }
        this.cycles = -1;
    }, _play:function (skip) {
        this._playing = true;
        this._resetTimer();
        if (skip !== true && this.cycles > 0) {
            this.cycles--;
        }
        if (this.cycles == 0) {
            this._pause();
        } else {
            if ((!this.suspendOnHover || !this._over) && this.transitionDelay) {
                this._timer = setTimeout(lang.hitch(this, "_cycle"), this.selectedChildWidget.domNode.getAttribute("transitionDelay") || this.transitionDelay);
            }
        }
        this._updatePager();
    }, _pause:function () {
        this._playing = false;
        this._resetTimer();
    }, _state:function (playing) {
        if (playing) {
            this.cycles = -1;
            this._play();
        } else {
            this._pause();
        }
    }, _transition:function (next, prev) {
        this._resetTimer();
        if (prev && this.transitionDuration) {
            switch (this.transition) {
              case "fade":
                this._fade(next, prev);
                return;
            }
        }
        this._transitionEnd();
        this.inherited(arguments);
    }, _transitionEnd:function () {
        if (this._playing) {
            this._play();
        } else {
            this._updatePager();
        }
    }, _fade:function (next, prev) {
        this._styleNode(prev.domNode, 1, 1);
        this._styleNode(next.domNode, 0, 2);
        this._showChild(next);
        if (this.doLayout && next.resize) {
            next.resize(this._containerContentBox || this._contentBox);
        }
        var args = {duration:this.transitionDuration}, anim = coreFx.combine([baseFx["fadeOut"](lang.mixin({node:prev.domNode}, args)), baseFx["fadeIn"](lang.mixin({node:next.domNode}, args))]);
        this.connect(anim, "onEnd", lang.hitch(this, function () {
            this._hideChild(prev);
            this._transitionEnd();
        }));
        anim.play();
    }, _styleNode:function (node, opacity, zIndex) {
        html.style(node, "opacity", opacity);
        html.style(node, "zIndex", zIndex);
        html.style(node, "position", "absolute");
    }});
    declare("dojox.layout.RotatorPager", [Widget, Templated, Contained], {widgetsInTemplate:true, rotatorId:"", postMixInProperties:function () {
        this.templateString = "<div>" + this.srcNodeRef.innerHTML + "</div>";
    }, postCreate:function () {
        var p = manager.byId(this.rotatorId) || this.getParent();
        if (p && p.declaredClass == "dojox.layout.RotatorContainer") {
            if (this.previous) {
                connect.connect(this.previous, "onClick", function () {
                    connect.publish(p.id + "-cycle", [false]);
                });
            }
            if (this.next) {
                connect.connect(this.next, "onClick", function () {
                    connect.publish(p.id + "-cycle", [true]);
                });
            }
            if (this.playPause) {
                connect.connect(this.playPause, "onClick", function () {
                    this.set("label", this.checked ? "Pause" : "Play");
                    connect.publish(p.id + "-state", [this.checked]);
                });
            }
            this._subscriptions = [connect.subscribe(p.id + "-state", this, "_state"), connect.subscribe(p.id + "-update", this, "_update")];
        }
    }, destroy:function () {
        array.forEach(this._subscriptions, connect.unsubscribe);
        this.inherited(arguments);
    }, _state:function (playing) {
        if (this.playPause && this.playPause.checked != playing) {
            this.playPause.set("label", playing ? "Pause" : "Play");
            this.playPause.set("checked", playing);
        }
    }, _update:function (playing, current, total) {
        this._state(playing);
        if (this.current && current) {
            this.current.innerHTML = current;
        }
        if (this.total && total) {
            this.total.innerHTML = total;
        }
    }});
    return RotatorContainer;
});

