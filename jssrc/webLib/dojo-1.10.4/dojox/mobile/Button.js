//>>built

define("dojox/mobile/Button", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/window", "dojo/dom", "dojo/dom-class", "dojo/dom-construct", "dojo/touch", "dojo/on", "./common", "dijit/_WidgetBase", "dijit/form/_ButtonMixin", "dijit/form/_FormWidgetMixin", "dojo/has", "require"], function (array, declare, win, dom, domClass, domConstruct, touch, on, common, WidgetBase, ButtonMixin, FormWidgetMixin, has, BidiButton) {
    var Button = declare(0 ? "dojox.mobile.NonBidiButton" : "dojox.mobile.Button", [WidgetBase, FormWidgetMixin, ButtonMixin], {baseClass:"mblButton", _setTypeAttr:null, isFocusable:function () {
        return false;
    }, buildRendering:function () {
        if (!this.srcNodeRef) {
            this.srcNodeRef = domConstruct.create("button", {"type":this.type});
        } else {
            if (this._cv) {
                var n = this.srcNodeRef.firstChild;
                if (n && n.nodeType === 3) {
                    n.nodeValue = this._cv(n.nodeValue);
                }
            }
        }
        this.inherited(arguments);
        this.focusNode = this.domNode;
    }, postCreate:function () {
        this.inherited(arguments);
        this.domNode.dojoClick = "useTarget";
        var _this = this;
        this.on(touch.press, function (e) {
            e.preventDefault();
            if (_this.domNode.disabled) {
                return;
            }
            _this._press(true);
            var isFirstMoveDone = false;
            _this._moveh = on(win.doc, touch.move, function (e) {
                if (!isFirstMoveDone) {
                    e.preventDefault();
                    isFirstMoveDone = true;
                }
                _this._press(dom.isDescendant(e.target, _this.domNode));
            });
            _this._endh = on(win.doc, touch.release, function (e) {
                _this._press(false);
                _this._moveh.remove();
                _this._endh.remove();
            });
        });
        common.setSelectable(this.focusNode, false);
        this.connect(this.domNode, "onclick", "_onClick");
    }, _press:function (pressed) {
        if (pressed != this._pressed) {
            this._pressed = pressed;
            var button = this.focusNode || this.domNode;
            var newStateClasses = (this.baseClass + " " + this["class"]).split(" ");
            newStateClasses = array.map(newStateClasses, function (c) {
                return c + "Selected";
            });
            domClass.toggle(button, newStateClasses, pressed);
        }
    }, _setLabelAttr:function (content) {
        this.inherited(arguments, [this._cv ? this._cv(content) : content]);
    }});
    return 0 ? declare("dojox.mobile.Button", [Button, BidiButton]) : Button;
});

