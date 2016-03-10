//>>built

define("dijit/DialogUnderlay", ["dojo/_base/declare", "dojo/_base/lang", "dojo/aspect", "dojo/dom-attr", "dojo/dom-style", "dojo/on", "dojo/window", "./_Widget", "./_TemplatedMixin", "./BackgroundIframe", "./Viewport", "./main"], function (declare, lang, aspect, domAttr, domStyle, on, winUtils, _Widget, _TemplatedMixin, BackgroundIframe, Viewport, dijit) {
    var DialogUnderlay = declare("dijit.DialogUnderlay", [_Widget, _TemplatedMixin], {templateString:"<div class='dijitDialogUnderlayWrapper'><div class='dijitDialogUnderlay' tabIndex='-1' data-dojo-attach-point='node'></div></div>", dialogId:"", "class":"", _modalConnects:[], _setDialogIdAttr:function (id) {
        domAttr.set(this.node, "id", id + "_underlay");
        this._set("dialogId", id);
    }, _setClassAttr:function (clazz) {
        this.node.className = "dijitDialogUnderlay " + clazz;
        this._set("class", clazz);
    }, postCreate:function () {
        this.ownerDocumentBody.appendChild(this.domNode);
        this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKeyDown")));
        this.inherited(arguments);
    }, layout:function () {
        var is = this.node.style, os = this.domNode.style;
        os.display = "none";
        var viewport = winUtils.getBox(this.ownerDocument);
        os.top = viewport.t + "px";
        os.left = viewport.l + "px";
        is.width = viewport.w + "px";
        is.height = viewport.h + "px";
        os.display = "block";
    }, show:function () {
        this.domNode.style.display = "block";
        this.open = true;
        this.layout();
        this.bgIframe = new BackgroundIframe(this.domNode);
        var win = winUtils.get(this.ownerDocument);
        this._modalConnects = [Viewport.on("resize", lang.hitch(this, "layout")), on(win, "scroll", lang.hitch(this, "layout"))];
    }, hide:function () {
        this.bgIframe.destroy();
        delete this.bgIframe;
        this.domNode.style.display = "none";
        while (this._modalConnects.length) {
            (this._modalConnects.pop()).remove();
        }
        this.open = false;
    }, destroy:function () {
        while (this._modalConnects.length) {
            (this._modalConnects.pop()).remove();
        }
        this.inherited(arguments);
    }, _onKeyDown:function () {
    }});
    DialogUnderlay.show = function (attrs, zIndex) {
        var underlay = DialogUnderlay._singleton;
        if (!underlay || underlay._destroyed) {
            underlay = dijit._underlay = DialogUnderlay._singleton = new DialogUnderlay(attrs);
        } else {
            if (attrs) {
                underlay.set(attrs);
            }
        }
        domStyle.set(underlay.domNode, "zIndex", zIndex);
        if (!underlay.open) {
            underlay.show();
        }
    };
    DialogUnderlay.hide = function () {
        var underlay = DialogUnderlay._singleton;
        if (underlay && !underlay._destroyed) {
            underlay.hide();
        }
    };
    return DialogUnderlay;
});

