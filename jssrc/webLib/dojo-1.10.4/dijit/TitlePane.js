//>>built

require({cache:{"url:dijit/templates/TitlePane.html":"<div>\n\t<div data-dojo-attach-event=\"ondijitclick:_onTitleClick, onkeydown:_onTitleKey\"\n\t\t\tclass=\"dijitTitlePaneTitle\" data-dojo-attach-point=\"titleBarNode\" id=\"${id}_titleBarNode\">\n\t\t<div class=\"dijitTitlePaneTitleFocus\" data-dojo-attach-point=\"focusNode\">\n\t\t\t<span data-dojo-attach-point=\"arrowNode\" class=\"dijitInline dijitArrowNode\" role=\"presentation\"></span\n\t\t\t><span data-dojo-attach-point=\"arrowNodeInner\" class=\"dijitArrowNodeInner\"></span\n\t\t\t><span data-dojo-attach-point=\"titleNode\" class=\"dijitTitlePaneTextNode\"></span>\n\t\t</div>\n\t</div>\n\t<div class=\"dijitTitlePaneContentOuter\" data-dojo-attach-point=\"hideNode\" role=\"presentation\">\n\t\t<div class=\"dijitReset\" data-dojo-attach-point=\"wipeNode\" role=\"presentation\">\n\t\t\t<div class=\"dijitTitlePaneContentInner\" data-dojo-attach-point=\"containerNode\" role=\"region\" id=\"${id}_pane\" aria-labelledby=\"${id}_titleBarNode\">\n\t\t\t\t<!-- nested divs because wipeIn()/wipeOut() doesn't work right on node w/padding etc.  Put padding on inner div. -->\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n"}});
define("dijit/TitlePane", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-geometry", "dojo/fx", "dojo/has", "dojo/_base/kernel", "dojo/keys", "./_CssStateMixin", "./_TemplatedMixin", "./layout/ContentPane", "dojo/text!./templates/TitlePane.html", "./_base/manager", "./a11yclick"], function (array, declare, dom, domAttr, domClass, domGeometry, fxUtils, has, kernel, keys, _CssStateMixin, _TemplatedMixin, ContentPane, template, manager) {
    var TitlePane = declare("dijit.TitlePane", [ContentPane, _TemplatedMixin, _CssStateMixin], {title:"", _setTitleAttr:{node:"titleNode", type:"innerHTML"}, open:true, toggleable:true, tabIndex:"0", duration:manager.defaultDuration, baseClass:"dijitTitlePane", templateString:template, doLayout:false, _setTooltipAttr:{node:"focusNode", type:"attribute", attribute:"title"}, buildRendering:function () {
        this.inherited(arguments);
        dom.setSelectable(this.titleNode, false);
    }, postCreate:function () {
        this.inherited(arguments);
        if (this.toggleable) {
            this._trackMouseState(this.titleBarNode, this.baseClass + "Title");
        }
        var hideNode = this.hideNode, wipeNode = this.wipeNode;
        this._wipeIn = fxUtils.wipeIn({node:wipeNode, duration:this.duration, beforeBegin:function () {
            hideNode.style.display = "";
        }});
        this._wipeOut = fxUtils.wipeOut({node:wipeNode, duration:this.duration, onEnd:function () {
            hideNode.style.display = "none";
        }});
    }, _setOpenAttr:function (open, animate) {
        array.forEach([this._wipeIn, this._wipeOut], function (animation) {
            if (animation && animation.status() == "playing") {
                animation.stop();
            }
        });
        if (animate) {
            var anim = this[open ? "_wipeIn" : "_wipeOut"];
            anim.play();
        } else {
            this.hideNode.style.display = this.wipeNode.style.display = open ? "" : "none";
        }
        if (this._started) {
            if (open) {
                this._onShow();
            } else {
                this.onHide();
            }
        }
        this.containerNode.setAttribute("aria-hidden", open ? "false" : "true");
        this.focusNode.setAttribute("aria-pressed", open ? "true" : "false");
        this._set("open", open);
        this._setCss();
    }, _setToggleableAttr:function (canToggle) {
        this.focusNode.setAttribute("role", canToggle ? "button" : "heading");
        if (canToggle) {
            this.focusNode.setAttribute("aria-controls", this.id + "_pane");
            this.focusNode.setAttribute("tabIndex", this.tabIndex);
            this.focusNode.setAttribute("aria-pressed", this.open);
        } else {
            domAttr.remove(this.focusNode, "aria-controls");
            domAttr.remove(this.focusNode, "tabIndex");
            domAttr.remove(this.focusNode, "aria-pressed");
        }
        this._set("toggleable", canToggle);
        this._setCss();
    }, _setContentAttr:function (content) {
        if (!this.open || !this._wipeOut || this._wipeOut.status() == "playing") {
            this.inherited(arguments);
        } else {
            if (this._wipeIn && this._wipeIn.status() == "playing") {
                this._wipeIn.stop();
            }
            domGeometry.setMarginBox(this.wipeNode, {h:domGeometry.getMarginBox(this.wipeNode).h});
            this.inherited(arguments);
            if (this._wipeIn) {
                this._wipeIn.play();
            } else {
                this.hideNode.style.display = "";
            }
        }
    }, toggle:function () {
        this._setOpenAttr(!this.open, true);
    }, _setCss:function () {
        var node = this.titleBarNode || this.focusNode;
        var oldCls = this._titleBarClass;
        this._titleBarClass = this.baseClass + "Title" + (this.toggleable ? "" : "Fixed") + (this.open ? "Open" : "Closed");
        domClass.replace(node, this._titleBarClass, oldCls || "");
        domClass.replace(node, this._titleBarClass.replace("TitlePaneTitle", ""), (oldCls || "").replace("TitlePaneTitle", ""));
        this.arrowNodeInner.innerHTML = this.open ? "-" : "+";
    }, _onTitleKey:function (e) {
        if (e.keyCode == keys.DOWN_ARROW && this.open) {
            this.containerNode.focus();
            e.preventDefault();
        }
    }, _onTitleClick:function () {
        if (this.toggleable) {
            this.toggle();
        }
    }, setTitle:function (title) {
        kernel.deprecated("dijit.TitlePane.setTitle() is deprecated.  Use set('title', ...) instead.", "", "2.0");
        this.set("title", title);
    }});
    if (0) {
        TitlePane.extend({_setTitleAttr:function (title) {
            this._set("title", title);
            this.titleNode.innerHTML = title;
            this.applyTextDir(this.titleNode);
        }, _setTooltipAttr:function (tooltip) {
            this._set("tooltip", tooltip);
            if (this.textDir) {
                tooltip = this.enforceTextDirWithUcc(null, tooltip);
            }
            domAttr.set(this.focusNode, "title", tooltip);
        }, _setTextDirAttr:function (textDir) {
            if (this._created && this.textDir != textDir) {
                this._set("textDir", textDir);
                this.set("title", this.title);
                this.set("tooltip", this.tooltip);
            }
        }});
    }
    return TitlePane;
});

