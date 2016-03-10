//>>built

define("dijit/_CssStateMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/dom", "dojo/dom-class", "dojo/has", "dojo/_base/lang", "dojo/on", "dojo/domReady", "dojo/touch", "dojo/_base/window", "./a11yclick", "./registry"], function (array, declare, dom, domClass, has, lang, on, domReady, touch, win, a11yclick, registry) {
    var CssStateMixin = declare("dijit._CssStateMixin", [], {hovering:false, active:false, _applyAttributes:function () {
        this.inherited(arguments);
        array.forEach(["disabled", "readOnly", "checked", "selected", "focused", "state", "hovering", "active", "_opened"], function (attr) {
            this.watch(attr, lang.hitch(this, "_setStateClass"));
        }, this);
        for (var ap in this.cssStateNodes || {}) {
            this._trackMouseState(this[ap], this.cssStateNodes[ap]);
        }
        this._trackMouseState(this.domNode, this.baseClass);
        this._setStateClass();
    }, _cssMouseEvent:function (event) {
        if (!this.disabled) {
            switch (event.type) {
              case "mouseover":
              case "MSPointerOver":
              case "pointerover":
                this._set("hovering", true);
                this._set("active", this._mouseDown);
                break;
              case "mouseout":
              case "MSPointerOut":
              case "pointerout":
                this._set("hovering", false);
                this._set("active", false);
                break;
              case "mousedown":
              case "touchstart":
              case "MSPointerDown":
              case "pointerdown":
              case "keydown":
                this._set("active", true);
                break;
              case "mouseup":
              case "dojotouchend":
              case "MSPointerUp":
              case "pointerup":
              case "keyup":
                this._set("active", false);
                break;
            }
        }
    }, _setStateClass:function () {
        var newStateClasses = this.baseClass.split(" ");
        function multiply(modifier) {
            newStateClasses = newStateClasses.concat(array.map(newStateClasses, function (c) {
                return c + modifier;
            }), "dijit" + modifier);
        }
        if (!this.isLeftToRight()) {
            multiply("Rtl");
        }
        var checkedState = this.checked == "mixed" ? "Mixed" : (this.checked ? "Checked" : "");
        if (this.checked) {
            multiply(checkedState);
        }
        if (this.state) {
            multiply(this.state);
        }
        if (this.selected) {
            multiply("Selected");
        }
        if (this._opened) {
            multiply("Opened");
        }
        if (this.disabled) {
            multiply("Disabled");
        } else {
            if (this.readOnly) {
                multiply("ReadOnly");
            } else {
                if (this.active) {
                    multiply("Active");
                } else {
                    if (this.hovering) {
                        multiply("Hover");
                    }
                }
            }
        }
        if (this.focused) {
            multiply("Focused");
        }
        var tn = this.stateNode || this.domNode, classHash = {};
        array.forEach(tn.className.split(" "), function (c) {
            classHash[c] = true;
        });
        if ("_stateClasses" in this) {
            array.forEach(this._stateClasses, function (c) {
                delete classHash[c];
            });
        }
        array.forEach(newStateClasses, function (c) {
            classHash[c] = true;
        });
        var newClasses = [];
        for (var c in classHash) {
            newClasses.push(c);
        }
        tn.className = newClasses.join(" ");
        this._stateClasses = newStateClasses;
    }, _subnodeCssMouseEvent:function (node, clazz, evt) {
        if (this.disabled || this.readOnly) {
            return;
        }
        function hover(isHovering) {
            domClass.toggle(node, clazz + "Hover", isHovering);
        }
        function active(isActive) {
            domClass.toggle(node, clazz + "Active", isActive);
        }
        function focused(isFocused) {
            domClass.toggle(node, clazz + "Focused", isFocused);
        }
        switch (evt.type) {
          case "mouseover":
          case "MSPointerOver":
          case "pointerover":
            hover(true);
            break;
          case "mouseout":
          case "MSPointerOut":
          case "pointerout":
            hover(false);
            active(false);
            break;
          case "mousedown":
          case "touchstart":
          case "MSPointerDown":
          case "pointerdown":
          case "keydown":
            active(true);
            break;
          case "mouseup":
          case "MSPointerUp":
          case "pointerup":
          case "dojotouchend":
          case "keyup":
            active(false);
            break;
          case "focus":
          case "focusin":
            focused(true);
            break;
          case "blur":
          case "focusout":
            focused(false);
            break;
        }
    }, _trackMouseState:function (node, clazz) {
        node._cssState = clazz;
    }});
    domReady(function () {
        function pointerHandler(evt, target, relatedTarget) {
            if (relatedTarget && dom.isDescendant(relatedTarget, target)) {
                return;
            }
            for (var node = target; node && node != relatedTarget; node = node.parentNode) {
                if (node._cssState) {
                    var widget = registry.getEnclosingWidget(node);
                    if (widget) {
                        if (node == widget.domNode) {
                            widget._cssMouseEvent(evt);
                        } else {
                            widget._subnodeCssMouseEvent(node, node._cssState, evt);
                        }
                    }
                }
            }
        }
        var body = win.body(), activeNode;
        on(body, touch.over, function (evt) {
            pointerHandler(evt, evt.target, evt.relatedTarget);
        });
        on(body, touch.out, function (evt) {
            pointerHandler(evt, evt.target, evt.relatedTarget);
        });
        on(body, a11yclick.press, function (evt) {
            activeNode = evt.target;
            pointerHandler(evt, activeNode);
        });
        on(body, a11yclick.release, function (evt) {
            pointerHandler(evt, activeNode);
            activeNode = null;
        });
        on(body, "focusin, focusout", function (evt) {
            var node = evt.target;
            if (node._cssState && !node.getAttribute("widgetId")) {
                var widget = registry.getEnclosingWidget(node);
                if (widget) {
                    widget._subnodeCssMouseEvent(node, node._cssState, evt);
                }
            }
        });
    });
    return CssStateMixin;
});

