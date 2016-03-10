//>>built

define("dojox/mobile/SearchBox", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/window", "dijit/form/_SearchMixin", "dojox/mobile/TextBox", "dojo/dom-class", "dojo/keys", "dojo/touch", "dojo/on", "./sniff"], function (declare, lang, win, SearchMixin, TextBox, domClass, keys, touch, on, has) {
    return declare("dojox.mobile.SearchBox", [TextBox, SearchMixin], {baseClass:"mblTextBox mblSearchBox", type:"search", placeHolder:"", incremental:true, _setIncrementalAttr:function (val) {
        this.incremental = val;
    }, _onInput:function (e) {
        if (e.charOrCode == keys.ENTER) {
            e.charOrCode = 229;
        } else {
            if (!this.incremental) {
                e.charOrCode = 0;
            }
        }
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this.textbox.removeAttribute("incremental");
        if (!this.textbox.hasAttribute("results")) {
            this.textbox.setAttribute("results", "0");
        }
        if (has("ios") < 5) {
            domClass.add(this.domNode, "iphone4");
            this.connect(this.textbox, "onfocus", function () {
                if (this.textbox.value !== "") {
                    this.defer(function () {
                        if (this.textbox.value === "") {
                            this._onInput({charOrCode:keys.ENTER});
                        }
                    });
                }
            });
        }
        this.connect(this.textbox, "onsearch", function () {
            this._onInput({charOrCode:keys.ENTER});
        });
        var _this = this;
        var touchStartX, touchStartY;
        var handleRelease;
        if (has("ios")) {
            this.on(touch.press, function (evt) {
                var rect;
                touchStartX = evt.touches ? evt.touches[0].pageX : evt.pageX;
                touchStartY = evt.touches ? evt.touches[0].pageY : evt.pageY;
                handleRelease = on(win.doc, touch.release, function (evt) {
                    var rect, dx, dy;
                    if (_this.get("value") != "") {
                        dx = evt.pageX - touchStartX;
                        dy = evt.pageY - touchStartY;
                        if (Math.abs(dx) <= 4 && Math.abs(dy) <= 4) {
                            evt.preventDefault();
                            _this.set("value", "");
                            _this._onInput({charOrCode:keys.ENTER});
                        }
                    }
                    if (handleRelease) {
                        handleRelease.remove();
                        handleRelease = null;
                    }
                });
                rect = _this.domNode.getBoundingClientRect();
                if (rect.right - (evt.touches ? evt.touches[0].pageX : evt.pageX) >= 20) {
                    if (handleRelease) {
                        handleRelease.remove();
                        handleRelease = null;
                    }
                }
            });
        }
    }});
});

