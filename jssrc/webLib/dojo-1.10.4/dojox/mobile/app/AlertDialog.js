//>>built

define("dojox/mobile/app/AlertDialog", ["dijit", "dojo", "dojox", "dojo/require!dijit/_WidgetBase"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.mobile.app.AlertDialog");
    dojo.experimental("dojox.mobile.app.AlertDialog");
    dojo.require("dijit._WidgetBase");
    dojo.declare("dojox.mobile.app.AlertDialog", dijit._WidgetBase, {title:"", text:"", controller:null, buttons:null, defaultButtonLabel:"OK", onChoose:null, constructor:function () {
        this.onClick = dojo.hitch(this, this.onClick);
        this._handleSelect = dojo.hitch(this, this._handleSelect);
    }, buildRendering:function () {
        this.domNode = dojo.create("div", {"class":"alertDialog"});
        var dlgBody = dojo.create("div", {"class":"alertDialogBody"}, this.domNode);
        dojo.create("div", {"class":"alertTitle", innerHTML:this.title || ""}, dlgBody);
        dojo.create("div", {"class":"alertText", innerHTML:this.text || ""}, dlgBody);
        var btnContainer = dojo.create("div", {"class":"alertBtns"}, dlgBody);
        if (!this.buttons || this.buttons.length == 0) {
            this.buttons = [{label:this.defaultButtonLabel, value:"ok", "class":"affirmative"}];
        }
        var _this = this;
        dojo.forEach(this.buttons, function (btnInfo) {
            var btn = new dojox.mobile.Button({btnClass:btnInfo["class"] || "", label:btnInfo.label});
            btn._dialogValue = btnInfo.value;
            dojo.place(btn.domNode, btnContainer);
            _this.connect(btn, "onClick", _this._handleSelect);
        });
        var viewportSize = this.controller.getWindowSize();
        this.mask = dojo.create("div", {"class":"dialogUnderlayWrapper", innerHTML:"<div class=\"dialogUnderlay\"></div>", style:{width:viewportSize.w + "px", height:viewportSize.h + "px"}}, this.controller.assistant.domNode);
        this.connect(this.mask, "onclick", function () {
            _this.onChoose && _this.onChoose();
            _this.hide();
        });
    }, postCreate:function () {
        this.subscribe("/dojox/mobile/app/goback", this._handleSelect);
    }, _handleSelect:function (event) {
        var node;
        console.log("handleSelect");
        if (event && event.target) {
            node = event.target;
            while (!dijit.byNode(node)) {
                node = node.parentNode;
            }
        }
        if (this.onChoose) {
            this.onChoose(node ? dijit.byNode(node)._dialogValue : undefined);
        }
        this.hide();
    }, show:function () {
        this._doTransition(1);
    }, hide:function () {
        this._doTransition(-1);
    }, _doTransition:function (dir) {
        var anim;
        var h = dojo.marginBox(this.domNode.firstChild).h;
        var bodyHeight = this.controller.getWindowSize().h;
        console.log("dialog height = " + h, " body height = " + bodyHeight);
        var high = bodyHeight - h;
        var low = bodyHeight;
        var anim1 = dojo.fx.slideTo({node:this.domNode, duration:400, top:{start:dir < 0 ? high : low, end:dir < 0 ? low : high}});
        var anim2 = dojo[dir < 0 ? "fadeOut" : "fadeIn"]({node:this.mask, duration:400});
        var anim = dojo.fx.combine([anim1, anim2]);
        var _this = this;
        dojo.connect(anim, "onEnd", this, function () {
            if (dir < 0) {
                _this.domNode.style.display = "none";
                dojo.destroy(_this.domNode);
                dojo.destroy(_this.mask);
            }
        });
        anim.play();
    }, destroy:function () {
        this.inherited(arguments);
        dojo.destroy(this.mask);
    }, onClick:function () {
    }});
});

