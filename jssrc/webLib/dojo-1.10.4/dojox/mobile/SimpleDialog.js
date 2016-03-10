//>>built

define("dojox/mobile/SimpleDialog", ["dojo/_base/declare", "dojo/_base/window", "dojo/dom-class", "dojo/dom-attr", "dojo/dom-construct", "dojo/on", "dojo/touch", "dijit/registry", "./Pane", "./iconUtils", "dojo/has", "require"], function (declare, win, domClass, domAttr, domConstruct, on, touch, registry, Pane, iconUtils, has, BidiSimpleDialog) {
    var SimpleDialog = declare(0 ? "dojox.mobile.NonBidiSimpleDialog" : "dojox.mobile.SimpleDialog", Pane, {top:"auto", left:"auto", modal:true, closeButton:false, closeButtonClass:"mblDomButtonSilverCircleRedCross", tabIndex:"0", _setTabIndexAttr:"", baseClass:"mblSimpleDialog", _cover:[], buildRendering:function () {
        this.containerNode = domConstruct.create("div", {className:"mblSimpleDialogContainer"});
        if (this.srcNodeRef) {
            for (var i = 0, len = this.srcNodeRef.childNodes.length; i < len; i++) {
                this.containerNode.appendChild(this.srcNodeRef.removeChild(this.srcNodeRef.firstChild));
            }
        }
        this.inherited(arguments);
        domAttr.set(this.domNode, "role", "dialog");
        if (this.containerNode.getElementsByClassName) {
            var titleNode = this.containerNode.getElementsByClassName("mblSimpleDialogTitle")[0];
            if (titleNode) {
                titleNode.id = titleNode.id || registry.getUniqueId("dojo_mobile_mblSimpleDialogTitle");
                domAttr.set(this.domNode, "aria-labelledby", titleNode.id);
            }
            var textNode = this.containerNode.getElementsByClassName("mblSimpleDialogText")[0];
            if (textNode) {
                textNode.id = textNode.id || registry.getUniqueId("dojo_mobile_mblSimpleDialogText");
                domAttr.set(this.domNode, "aria-describedby", textNode.id);
            }
        }
        domClass.add(this.domNode, "mblSimpleDialogDecoration");
        this.domNode.style.display = "none";
        this.domNode.appendChild(this.containerNode);
        if (this.closeButton) {
            this.closeButtonNode = domConstruct.create("div", {className:"mblSimpleDialogCloseBtn " + this.closeButtonClass}, this.domNode);
            iconUtils.createDomButton(this.closeButtonNode);
            this.connect(this.closeButtonNode, "onclick", "_onCloseButtonClick");
        }
        this.connect(this.domNode, "onkeydown", "_onKeyDown");
    }, startup:function () {
        if (this._started) {
            return;
        }
        this.inherited(arguments);
        win.body().appendChild(this.domNode);
    }, addCover:function () {
        if (!this._cover[0]) {
            this._cover[0] = domConstruct.create("div", {className:"mblSimpleDialogCover"}, win.body());
        } else {
            this._cover[0].style.display = "";
        }
        if (has("windows-theme")) {
            this.own(on(this._cover[0], touch.press, function () {
            }));
        }
    }, removeCover:function () {
        this._cover[0].style.display = "none";
    }, _onCloseButtonClick:function (e) {
        if (this.onCloseButtonClick(e) === false) {
            return;
        }
        this.hide();
    }, onCloseButtonClick:function () {
    }, _onKeyDown:function (e) {
        if (e.keyCode == 27) {
            this.hide();
        }
    }, refresh:function () {
        var n = this.domNode;
        var h;
        if (this.closeButton) {
            var b = this.closeButtonNode;
            var s = Math.round(b.offsetHeight / 2);
            b.style.top = -s + "px";
            b.style.left = n.offsetWidth - s + "px";
        }
        if (this.top === "auto") {
            h = win.global.innerHeight || win.doc.documentElement.clientHeight;
            n.style.top = Math.round((h - n.offsetHeight) / 2) + "px";
        } else {
            n.style.top = this.top;
        }
        if (this.left === "auto") {
            h = win.global.innerWidth || win.doc.documentElement.clientWidth;
            n.style.left = Math.round((h - n.offsetWidth) / 2) + "px";
        } else {
            n.style.left = this.left;
        }
    }, show:function () {
        if (this.domNode.style.display === "") {
            return;
        }
        if (this.modal) {
            this.addCover();
        }
        this.domNode.style.display = "";
        this.resize();
        this.refresh();
        var diaglogButton;
        if (this.domNode.getElementsByClassName) {
            diaglogButton = this.domNode.getElementsByClassName("mblSimpleDialogButton")[0];
        }
        var focusNode = diaglogButton || this.closeButtonNode || this.domNode;
        this.defer(function () {
            focusNode.focus();
        }, 1000);
    }, hide:function () {
        if (this.domNode.style.display === "none") {
            return;
        }
        this.domNode.style.display = "none";
        if (this.modal) {
            this.removeCover();
        }
    }});
    return 0 ? declare("dojox.mobile.SimpleDialog", [SimpleDialog, BidiSimpleDialog]) : SimpleDialog;
});

