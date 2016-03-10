//>>built

define("dojox/layout/RadioGroup", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/html", "dojo/_base/lang", "dojo/_base/query", "dijit/_Widget", "dijit/_Templated", "dijit/_Contained", "dijit/layout/StackContainer", "dojo/fx/easing", "dojo/_base/fx", "dojo/dom-construct", "dojo/dom-class"], function (kernel, declare, html, lang, query, Widget, Templated, Contained, StackContainer, easing, baseFx, domConstruct, domClass) {
    kernel.experimental("dojox.layout.RadioGroup");
    var RadioGroup = declare("dojox.layout.RadioGroup", [StackContainer, Templated], {duration:750, hasButtons:false, buttonClass:"dojox.layout._RadioButton", templateString:"<div class=\"dojoxRadioGroup\">" + " \t<div dojoAttachPoint=\"buttonHolder\" style=\"display:none;\">" + "\t\t<table class=\"dojoxRadioButtons\"><tbody><tr class=\"dojoxRadioButtonRow\" dojoAttachPoint=\"buttonNode\"></tr></tbody></table>" + "\t</div>" + "\t<div class=\"dojoxRadioView\" dojoAttachPoint=\"containerNode\"></div>" + "</div>", startup:function () {
        this.inherited(arguments);
        this._children = this.getChildren();
        this._buttons = this._children.length;
        this._size = html.coords(this.containerNode);
        if (this.hasButtons) {
            html.style(this.buttonHolder, "display", "block");
        }
    }, _setupChild:function (child) {
        html.style(child.domNode, "position", "absolute");
        if (this.hasButtons) {
            var tmp = this.buttonNode.appendChild(domConstruct.create("td"));
            var n = domConstruct.create("div", null, tmp), _Button = lang.getObject(this.buttonClass), tmpw = new _Button({label:child.title, page:child}, n);
            lang.mixin(child, {_radioButton:tmpw});
            tmpw.startup();
        }
        child.domNode.style.display = "none";
    }, removeChild:function (child) {
        if (this.hasButtons && child._radioButton) {
            child._radioButton.destroy();
            delete child._radioButton;
        }
        this.inherited(arguments);
    }, _transition:function (newWidget, oldWidget) {
        this._showChild(newWidget);
        if (oldWidget) {
            this._hideChild(oldWidget);
        }
        if (this.doLayout && newWidget.resize) {
            newWidget.resize(this._containerContentBox || this._contentBox);
        }
    }, _showChild:function (page) {
        var children = this.getChildren();
        page.isFirstChild = (page == children[0]);
        page.isLastChild = (page == children[children.length - 1]);
        page.selected = true;
        page.domNode.style.display = "";
        if (page._onShow) {
            page._onShow();
        } else {
            if (page.onShow) {
                page.onShow();
            }
        }
    }, _hideChild:function (page) {
        page.selected = false;
        page.domNode.style.display = "none";
        if (page.onHide) {
            page.onHide();
        }
    }});
    declare("dojox.layout.RadioGroupFade", RadioGroup, {_hideChild:function (page) {
        baseFx.fadeOut({node:page.domNode, duration:this.duration, onEnd:lang.hitch(this, "inherited", arguments, arguments)}).play();
    }, _showChild:function (page) {
        this.inherited(arguments);
        html.style(page.domNode, "opacity", 0);
        baseFx.fadeIn({node:page.domNode, duration:this.duration}).play();
    }});
    declare("dojox.layout.RadioGroupSlide", RadioGroup, {easing:"dojo.fx.easing.backOut", zTop:99, constructor:function () {
        if (lang.isString(this.easing)) {
            this.easing = lang.getObject(this.easing);
        }
    }, _positionChild:function (page) {
        if (!this._size) {
            return;
        }
        var rA = true, rB = true;
        switch (page.slideFrom) {
          case "bottom":
            rB = !rB;
            break;
          case "right":
            rA = !rA;
            rB = !rB;
            break;
          case "top":
            break;
          case "left":
            rA = !rA;
            break;
          default:
            rA = Math.round(Math.random());
            rB = Math.round(Math.random());
            break;
        }
        var prop = rA ? "top" : "left", val = (rB ? "-" : "") + (this._size[rA ? "h" : "w"] + 20) + "px";
        html.style(page.domNode, prop, val);
    }, _showChild:function (page) {
        var children = this.getChildren();
        page.isFirstChild = (page == children[0]);
        page.isLastChild = (page == children[children.length - 1]);
        page.selected = true;
        html.style(page.domNode, {zIndex:this.zTop, display:""});
        if (this._anim && this._anim.status() == "playing") {
            this._anim.gotoPercent(100, true);
        }
        this._anim = baseFx.animateProperty({node:page.domNode, properties:{left:0, top:0}, duration:this.duration, easing:this.easing, onEnd:lang.hitch(page, function () {
            if (this.onShow) {
                this.onShow();
            }
            if (this._onShow) {
                this._onShow();
            }
        }), beforeBegin:lang.hitch(this, "_positionChild", page)});
        this._anim.play();
    }, _hideChild:function (page) {
        page.selected = false;
        page.domNode.style.zIndex = this.zTop - 1;
        if (page.onHide) {
            page.onHide();
        }
    }});
    declare("dojox.layout._RadioButton", [Widget, Templated, Contained], {label:"", page:null, templateString:"<div dojoAttachPoint=\"focusNode\" class=\"dojoxRadioButton\"><span dojoAttachPoint=\"titleNode\" class=\"dojoxRadioButtonLabel\">${label}</span></div>", startup:function () {
        this.connect(this.domNode, "onmouseenter", "_onMouse");
    }, _onMouse:function (e) {
        this.getParent().selectChild(this.page);
        this._clearSelected();
        domClass.add(this.domNode, "dojoxRadioButtonSelected");
    }, _clearSelected:function () {
        query(".dojoxRadioButtonSelected", this.domNode.parentNode.parentNode).removeClass("dojoxRadioButtonSelected");
    }});
    lang.extend(Widget, {slideFrom:"random"});
});

