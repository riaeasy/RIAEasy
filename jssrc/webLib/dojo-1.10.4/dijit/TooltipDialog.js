//>>built

require({cache:{"url:dijit/templates/TooltipDialog.html":"<div role=\"alertdialog\" tabIndex=\"-1\">\n\t<div class=\"dijitTooltipContainer\" role=\"presentation\">\n\t\t<div data-dojo-attach-point=\"contentsNode\" class=\"dijitTooltipContents dijitTooltipFocusNode\">\n\t\t\t<div data-dojo-attach-point=\"containerNode\"></div>\n\t\t\t${!actionBarTemplate}\n\t\t</div>\n\t</div>\n\t<div class=\"dijitTooltipConnector\" role=\"presentation\" data-dojo-attach-point=\"connectorNode\"></div>\n</div>\n"}});
define("dijit/TooltipDialog", ["dojo/_base/declare", "dojo/dom-class", "dojo/has", "dojo/keys", "dojo/_base/lang", "dojo/on", "./focus", "./layout/ContentPane", "./_DialogMixin", "./form/_FormMixin", "./_TemplatedMixin", "dojo/text!./templates/TooltipDialog.html", "./main"], function (declare, domClass, has, keys, lang, on, focus, ContentPane, _DialogMixin, _FormMixin, _TemplatedMixin, template, dijit) {
    var TooltipDialog = declare("dijit.TooltipDialog", [ContentPane, _TemplatedMixin, _FormMixin, _DialogMixin], {title:"", doLayout:false, autofocus:true, baseClass:"dijitTooltipDialog", _firstFocusItem:null, _lastFocusItem:null, templateString:template, _setTitleAttr:"containerNode", postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKey")));
    }, orient:function (node, aroundCorner, tooltipCorner) {
        var newC = {"MR-ML":"dijitTooltipRight", "ML-MR":"dijitTooltipLeft", "TM-BM":"dijitTooltipAbove", "BM-TM":"dijitTooltipBelow", "BL-TL":"dijitTooltipBelow dijitTooltipABLeft", "TL-BL":"dijitTooltipAbove dijitTooltipABLeft", "BR-TR":"dijitTooltipBelow dijitTooltipABRight", "TR-BR":"dijitTooltipAbove dijitTooltipABRight", "BR-BL":"dijitTooltipRight", "BL-BR":"dijitTooltipLeft", "BR-TL":"dijitTooltipBelow dijitTooltipABLeft", "BL-TR":"dijitTooltipBelow dijitTooltipABRight", "TL-BR":"dijitTooltipAbove dijitTooltipABRight", "TR-BL":"dijitTooltipAbove dijitTooltipABLeft"}[aroundCorner + "-" + tooltipCorner];
        domClass.replace(this.domNode, newC, this._currentOrientClass || "");
        this._currentOrientClass = newC;
    }, focus:function () {
        this._getFocusItems();
        focus.focus(this._firstFocusItem);
    }, onOpen:function (pos) {
        this.orient(this.domNode, pos.aroundCorner, pos.corner);
        var aroundNodeCoords = pos.aroundNodePos;
        if (pos.corner.charAt(0) == "M" && pos.aroundCorner.charAt(0) == "M") {
            this.connectorNode.style.top = aroundNodeCoords.y + ((aroundNodeCoords.h - this.connectorNode.offsetHeight) >> 1) - pos.y + "px";
            this.connectorNode.style.left = "";
        } else {
            if (pos.corner.charAt(1) == "M" && pos.aroundCorner.charAt(1) == "M") {
                this.connectorNode.style.left = aroundNodeCoords.x + ((aroundNodeCoords.w - this.connectorNode.offsetWidth) >> 1) - pos.x + "px";
            }
        }
        this._onShow();
    }, onClose:function () {
        this.onHide();
    }, _onKey:function (evt) {
        if (evt.keyCode == keys.ESCAPE) {
            this.defer("onCancel");
            evt.stopPropagation();
            evt.preventDefault();
        } else {
            if (evt.keyCode == keys.TAB) {
                var node = evt.target;
                this._getFocusItems();
                if (this._firstFocusItem == this._lastFocusItem) {
                    evt.stopPropagation();
                    evt.preventDefault();
                } else {
                    if (node == this._firstFocusItem && evt.shiftKey) {
                        focus.focus(this._lastFocusItem);
                        evt.stopPropagation();
                        evt.preventDefault();
                    } else {
                        if (node == this._lastFocusItem && !evt.shiftKey) {
                            focus.focus(this._firstFocusItem);
                            evt.stopPropagation();
                            evt.preventDefault();
                        } else {
                            evt.stopPropagation();
                        }
                    }
                }
            }
        }
    }});
    if (0) {
        TooltipDialog.extend({_setTitleAttr:function (title) {
            this.containerNode.title = (this.textDir && this.enforceTextDirWithUcc) ? this.enforceTextDirWithUcc(null, title) : title;
            this._set("title", title);
        }, _setTextDirAttr:function (textDir) {
            if (!this._created || this.textDir != textDir) {
                this._set("textDir", textDir);
                if (this.textDir && this.title) {
                    this.containerNode.title = this.enforceTextDirWithUcc(null, this.title);
                }
            }
        }});
    }
    return TooltipDialog;
});

