//>>built

define("dojox/mobile/Heading", ["dojo/_base/array", "dojo/_base/connect", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dojo/dom-class", "dojo/dom-construct", "dojo/dom-style", "dojo/dom-attr", "dijit/registry", "./common", "dijit/_Contained", "dijit/_Container", "dijit/_WidgetBase", "./ProgressIndicator", "./ToolBarButton", "./View", "dojo/has", "require"], function (array, connect, declare, lang, win, domClass, domConstruct, domStyle, domAttr, registry, common, Contained, Container, WidgetBase, ProgressIndicator, ToolBarButton, View, has, BidiHeading) {
    var dm = lang.getObject("dojox.mobile", true);
    var Heading = declare(0 ? "dojox.mobile.NonBidiHeading" : "dojox.mobile.Heading", [WidgetBase, Container, Contained], {back:"", href:"", moveTo:"", transition:"slide", label:"", iconBase:"", tag:"h1", busy:false, progStyle:"mblProgWhite", baseClass:"mblHeading", buildRendering:function () {
        if (!this.templateString) {
            this.domNode = this.containerNode = this.srcNodeRef || win.doc.createElement(this.tag);
        }
        this.inherited(arguments);
        if (!this.templateString) {
            if (!this.label) {
                array.forEach(this.domNode.childNodes, function (n) {
                    if (n.nodeType == 3) {
                        var v = lang.trim(n.nodeValue);
                        if (v) {
                            this.label = v;
                            this.labelNode = domConstruct.create("span", {innerHTML:v}, n, "replace");
                        }
                    }
                }, this);
            }
            if (!this.labelNode) {
                this.labelNode = domConstruct.create("span", null, this.domNode);
            }
            this.labelNode.className = "mblHeadingSpanTitle";
            this.labelDivNode = domConstruct.create("div", {className:"mblHeadingDivTitle", innerHTML:this.labelNode.innerHTML}, this.domNode);
        }
        if (this.labelDivNode) {
            domAttr.set(this.labelDivNode, "role", "heading");
            domAttr.set(this.labelDivNode, "aria-level", "1");
        }
        common.setSelectable(this.domNode, false);
    }, startup:function () {
        if (this._started) {
            return;
        }
        var parent = this.getParent && this.getParent();
        if (!parent || !parent.resize) {
            var _this = this;
            _this.defer(function () {
                _this.resize();
            });
        }
        this.inherited(arguments);
    }, resize:function () {
        if (this.labelNode) {
            var leftBtn, rightBtn;
            var children = this.containerNode.childNodes;
            for (var i = children.length - 1; i >= 0; i--) {
                var c = children[i];
                if (c.nodeType === 1 && domStyle.get(c, "display") !== "none") {
                    if (!rightBtn && domStyle.get(c, "float") === "right") {
                        rightBtn = c;
                    }
                    if (!leftBtn && domStyle.get(c, "float") === "left") {
                        leftBtn = c;
                    }
                }
            }
            if (!this.labelNodeLen && this.label) {
                this.labelNode.style.display = "inline";
                this.labelNodeLen = this.labelNode.offsetWidth;
                this.labelNode.style.display = "";
            }
            var bw = this.domNode.offsetWidth;
            var rw = rightBtn ? bw - rightBtn.offsetLeft + 5 : 0;
            var lw = leftBtn ? leftBtn.offsetLeft + leftBtn.offsetWidth + 5 : 0;
            var tw = this.labelNodeLen || 0;
            domClass[bw - Math.max(rw, lw) * 2 > tw ? "add" : "remove"](this.domNode, "mblHeadingCenterTitle");
        }
        array.forEach(this.getChildren(), function (child) {
            if (child.resize) {
                child.resize();
            }
        });
    }, _setBackAttr:function (back) {
        this._set("back", back);
        if (!this.backButton) {
            this.backButton = new ToolBarButton({arrow:"left", label:back, moveTo:this.moveTo, back:!this.moveTo && !this.href, href:this.href, transition:this.transition, transitionDir:-1, dir:this.isLeftToRight() ? "ltr" : "rtl"});
            this.backButton.placeAt(this.domNode, "first");
        } else {
            this.backButton.set("label", back);
        }
        this.resize();
    }, _setMoveToAttr:function (moveTo) {
        this._set("moveTo", moveTo);
        if (this.backButton) {
            this.backButton.set("moveTo", moveTo);
            this.backButton.set("back", !moveTo && !this.href);
        }
    }, _setHrefAttr:function (href) {
        this._set("href", href);
        if (this.backButton) {
            this.backButton.set("href", href);
            this.backButton.set("back", !this.moveTo && !href);
        }
    }, _setTransitionAttr:function (transition) {
        this._set("transition", transition);
        if (this.backButton) {
            this.backButton.set("transition", transition);
        }
    }, _setLabelAttr:function (label) {
        this._set("label", label);
        this.labelNode.innerHTML = this.labelDivNode.innerHTML = this._cv ? this._cv(label) : label;
        delete this.labelNodeLen;
    }, _setBusyAttr:function (busy) {
        var prog = this._prog;
        if (busy) {
            if (!prog) {
                prog = this._prog = new ProgressIndicator({size:30, center:false});
                domClass.add(prog.domNode, this.progStyle);
            }
            domConstruct.place(prog.domNode, this.domNode, "first");
            prog.start();
        } else {
            if (prog) {
                prog.stop();
            }
        }
        this._set("busy", busy);
    }});
    return 0 ? declare("dojox.mobile.Heading", [Heading, BidiHeading]) : Heading;
});

