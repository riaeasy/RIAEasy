//>>built

require({cache:{"url:dojox/widget/Dialog/Dialog.html":"<div class=\"dojoxDialog\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"${id}_title\">\n\t<div dojoAttachPoint=\"titleBar\" class=\"dojoxDialogTitleBar\">\n\t\t<span dojoAttachPoint=\"titleNode\" class=\"dojoxDialogTitle\" id=\"${id}_title\">${title}</span>\n\t</div>\n\t<div dojoAttachPoint=\"dojoxDialogWrapper\">\n\t\t<div dojoAttachPoint=\"containerNode\" class=\"dojoxDialogPaneContent\"></div>\n\t</div>\n\t<div dojoAttachPoint=\"closeButtonNode\" class=\"dojoxDialogCloseIcon\" dojoAttachEvent=\"onclick: onCancel\">\n\t\t\t<span dojoAttachPoint=\"closeText\" class=\"closeText\">x</span>\n\t</div>\n</div>\n"}});
define("dojox/widget/Dialog", ["dojo", "dojox", "dojo/text!./Dialog/Dialog.html", "dijit/Dialog", "dojo/window", "dojox/fx", "./DialogSimple"], function (dojo, dojox, template) {
    dojo.getObject("widget", true, dojox);
    return dojo.declare("dojox.widget.Dialog", dojox.widget.DialogSimple, {templateString:template, sizeToViewport:false, viewportPadding:35, dimensions:null, easing:null, sizeDuration:dijit._defaultDuration, sizeMethod:"chain", showTitle:false, draggable:false, modal:false, constructor:function (props, node) {
        this.easing = props.easing || dojo._defaultEasing;
        this.dimensions = props.dimensions || [300, 300];
    }, _setup:function () {
        this.inherited(arguments);
        if (!this._alreadyInitialized) {
            this._navIn = dojo.fadeIn({node:this.closeButtonNode});
            this._navOut = dojo.fadeOut({node:this.closeButtonNode});
            if (!this.showTitle) {
                dojo.addClass(this.domNode, "dojoxDialogNoTitle");
            }
        }
    }, layout:function (e) {
        this._setSize();
        this.inherited(arguments);
    }, _setSize:function () {
        this._vp = dojo.window.getBox();
        var tc = this.containerNode, vpSized = this.sizeToViewport;
        return this._displaysize = {w:vpSized ? tc.scrollWidth : this.dimensions[0], h:vpSized ? tc.scrollHeight : this.dimensions[1]};
    }, show:function () {
        if (this.open) {
            return;
        }
        this._setSize();
        dojo.style(this.closeButtonNode, "opacity", 0);
        dojo.style(this.domNode, {overflow:"hidden", opacity:0, width:"1px", height:"1px"});
        dojo.style(this.containerNode, {opacity:0, overflow:"hidden"});
        this.inherited(arguments);
        if (this.modal) {
            this._modalconnects.push(dojo.connect(dojo.body(), "onkeypress", function (e) {
                if (e.charOrCode == dojo.keys.ESCAPE) {
                    dojo.stopEvent(e);
                }
            }));
        } else {
            this._modalconnects.push(dojo.connect(dijit._underlay.domNode, "onclick", this, "onCancel"));
        }
        this._modalconnects.push(dojo.connect(this.domNode, "onmouseenter", this, "_handleNav"));
        this._modalconnects.push(dojo.connect(this.domNode, "onmouseleave", this, "_handleNav"));
    }, _handleNav:function (e) {
        var navou = "_navOut", navin = "_navIn", animou = (e.type == "mouseout" ? navin : navou), animin = (e.type == "mouseout" ? navou : navin);
        this[animou].stop();
        this[animin].play();
    }, _position:function () {
        if (!this._started) {
            return;
        }
        if (this._sizing) {
            this._sizing.stop();
            this.disconnect(this._sizingConnect);
            delete this._sizing;
        }
        this.inherited(arguments);
        if (!this.open) {
            dojo.style(this.containerNode, "opacity", 0);
        }
        var pad = this.viewportPadding * 2;
        var props = {node:this.domNode, duration:this.sizeDuration || dijit._defaultDuration, easing:this.easing, method:this.sizeMethod};
        var ds = this._displaysize || this._setSize();
        props["width"] = ds.w = (ds.w + pad >= this._vp.w || this.sizeToViewport) ? this._vp.w - pad : ds.w;
        props["height"] = ds.h = (ds.h + pad >= this._vp.h || this.sizeToViewport) ? this._vp.h - pad : ds.h;
        this._sizing = dojox.fx.sizeTo(props);
        this._sizingConnect = this.connect(this._sizing, "onEnd", "_showContent");
        this._sizing.play();
    }, _showContent:function (e) {
        var container = this.containerNode;
        dojo.style(this.domNode, {overflow:"visible", opacity:1});
        dojo.style(this.closeButtonNode, "opacity", 1);
        dojo.style(container, {height:this._displaysize.h - this.titleNode.offsetHeight + "px", width:this._displaysize.w + "px", overflow:"auto"});
        dojo.anim(container, {opacity:1});
    }});
});

