//>>built

require({cache:{"url:dojox/widget/ColorPicker/ColorPicker.html":"<table class=\"dojoxColorPicker\" dojoAttachEvent=\"onkeypress: _handleKey\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n\t<tr>\n\t\t<td valign=\"top\" class=\"dojoxColorPickerRightPad\">\n\t\t\t<div class=\"dojoxColorPickerBox\">\n\t\t\t\t<!-- Forcing ABS in style attr due to dojo DND issue with not picking it up form the class. -->\n\t\t\t\t<img title=\"${saturationPickerTitle}\" alt=\"${saturationPickerTitle}\" class=\"dojoxColorPickerPoint\" src=\"${_pickerPointer}\" tabIndex=\"0\" dojoAttachPoint=\"cursorNode\" style=\"position: absolute; top: 0px; left: 0px;\">\n\t\t\t\t<img role=\"presentation\" alt=\"\" dojoAttachPoint=\"colorUnderlay\" dojoAttachEvent=\"onclick: _setPoint, onmousedown: _stopDrag\" class=\"dojoxColorPickerUnderlay\" src=\"${_underlay}\" ondragstart=\"return false\">\n\t\t\t</div>\n\t\t</td>\n\t\t<td valign=\"top\" class=\"dojoxColorPickerRightPad\">\n\t\t\t<div class=\"dojoxHuePicker\">\n\t\t\t\t<!-- Forcing ABS in style attr due to dojo DND issue with not picking it up form the class. -->\n\t\t\t\t<img dojoAttachPoint=\"hueCursorNode\" tabIndex=\"0\" class=\"dojoxHuePickerPoint\" title=\"${huePickerTitle}\" alt=\"${huePickerTitle}\" src=\"${_huePickerPointer}\" style=\"position: absolute; top: 0px; left: 0px;\">\n\t\t\t\t<div class=\"dojoxHuePickerUnderlay\" dojoAttachPoint=\"hueNode\">\n\t\t\t\t    <img role=\"presentation\" alt=\"\" dojoAttachEvent=\"onclick: _setHuePoint, onmousedown: _stopDrag\" src=\"${_hueUnderlay}\">\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</td>\n\t\t<td valign=\"top\">\n\t\t\t<table cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n\t\t\t\t<tr>\n\t\t\t\t\t<td valign=\"top\" class=\"dojoxColorPickerPreviewContainer\">\n\t\t\t\t\t\t<table cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td valign=\"top\" class=\"dojoxColorPickerRightPad\">\n\t\t\t\t\t\t\t\t\t<div dojoAttachPoint=\"previewNode\" class=\"dojoxColorPickerPreview\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td valign=\"top\">\n\t\t\t\t\t\t\t\t\t<div dojoAttachPoint=\"safePreviewNode\" class=\"dojoxColorPickerWebSafePreview\"></div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n\t\t\t\t<tr>\n\t\t\t\t\t<td valign=\"bottom\">\n\t\t\t\t\t\t<table class=\"dojoxColorPickerOptional\" cellpadding=\"0\" cellspacing=\"0\" role=\"presentation\">\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t<div class=\"dijitInline dojoxColorPickerRgb\" dojoAttachPoint=\"rgbNode\">\n\t\t\t\t\t\t\t\t\t\t<table cellpadding=\"1\" cellspacing=\"1\" role=\"presentation\">\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_r\">${redLabel}</label></td><td><input id=\"${_uId}_r\" dojoAttachPoint=\"Rval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"></td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_g\">${greenLabel}</label></td><td><input id=\"${_uId}_g\" dojoAttachPoint=\"Gval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"></td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_b\">${blueLabel}</label></td><td><input id=\"${_uId}_b\" dojoAttachPoint=\"Bval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"></td></tr>\n\t\t\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t\t<td>\n\t\t\t\t\t\t\t\t\t<div class=\"dijitInline dojoxColorPickerHsv\" dojoAttachPoint=\"hsvNode\">\n\t\t\t\t\t\t\t\t\t\t<table cellpadding=\"1\" cellspacing=\"1\" role=\"presentation\">\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_h\">${hueLabel}</label></td><td><input id=\"${_uId}_h\" dojoAttachPoint=\"Hval\"size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"> ${degLabel}</td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_s\">${saturationLabel}</label></td><td><input id=\"${_uId}_s\" dojoAttachPoint=\"Sval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"> ${percentSign}</td></tr>\n\t\t\t\t\t\t\t\t\t\t<tr><td><label for=\"${_uId}_v\">${valueLabel}</label></td><td><input id=\"${_uId}_v\" dojoAttachPoint=\"Vval\" size=\"1\" dojoAttachEvent=\"onchange: _colorInputChange\"> ${percentSign}</td></tr>\n\t\t\t\t\t\t\t\t\t\t</table>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t\t<tr>\n\t\t\t\t\t\t\t\t<td colspan=\"2\">\n\t\t\t\t\t\t\t\t\t<div class=\"dojoxColorPickerHex\" dojoAttachPoint=\"hexNode\" aria-live=\"polite\">\t\n\t\t\t\t\t\t\t\t\t\t<label for=\"${_uId}_hex\">&nbsp;${hexLabel}&nbsp;</label><input id=\"${_uId}_hex\" dojoAttachPoint=\"hexCode, focusNode, valueNode\" size=\"6\" class=\"dojoxColorPickerHexCode\" dojoAttachEvent=\"onchange: _colorInputChange\">\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</td>\n\t\t\t\t\t\t\t</tr>\n\t\t\t\t\t\t</table>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n\t\t\t</table>\n\t\t</td>\n\t</tr>\n</table>\n\n"}});
define("dojox/widget/ColorPicker", ["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/html", "dojo/_base/connect", "dojo/_base/sniff", "dojo/_base/window", "dojo/_base/event", "dojo/dom", "dojo/dom-class", "dojo/keys", "dojo/fx", "dojo/dnd/move", "dijit/registry", "dijit/_base/focus", "dijit/form/_FormWidget", "dijit/typematic", "dojox/color", "dojo/i18n", "dojo/i18n!./nls/ColorPicker", "dojo/i18n!dojo/cldr/nls/number", "dojo/text!./ColorPicker/ColorPicker.html"], function (kernel, declare, lang, ArrayUtil, html, Hub, has, win, Event, DOM, DOMClass, Keys, fx, move, registry, FocusManager, FormWidget, Typematic, color, i18n, bundle1, bundle2, template) {
    kernel.experimental("dojox.widget.ColorPicker");
    var webSafeFromHex = function (hex) {
        return hex;
    };
    return declare("dojox.widget.ColorPicker", FormWidget, {showRgb:true, showHsv:true, showHex:true, webSafe:true, animatePoint:true, slideDuration:250, liveUpdate:false, PICKER_HUE_H:150, PICKER_SAT_VAL_H:150, PICKER_SAT_VAL_W:150, PICKER_HUE_SELECTOR_H:8, PICKER_SAT_SELECTOR_H:10, PICKER_SAT_SELECTOR_W:10, value:"#ffffff", _underlay:require.toUrl("dojox/widget/ColorPicker/images/underlay.png"), _hueUnderlay:require.toUrl("dojox/widget/ColorPicker/images/hue.png"), _pickerPointer:require.toUrl("dojox/widget/ColorPicker/images/pickerPointer.png"), _huePickerPointer:require.toUrl("dojox/widget/ColorPicker/images/hueHandle.png"), _huePickerPointerAlly:require.toUrl("dojox/widget/ColorPicker/images/hueHandleA11y.png"), templateString:template, postMixInProperties:function () {
        if (DOMClass.contains(win.body(), "dijit_a11y")) {
            this._huePickerPointer = this._huePickerPointerAlly;
        }
        this._uId = registry.getUniqueId(this.id);
        lang.mixin(this, i18n.getLocalization("dojox.widget", "ColorPicker"));
        lang.mixin(this, i18n.getLocalization("dojo.cldr", "number"));
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        if (has("ie") < 7) {
            this.colorUnderlay.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + this._underlay + "', sizingMethod='scale')";
            this.colorUnderlay.src = this._blankGif.toString();
        }
        if (!this.showRgb) {
            this.rgbNode.style.visibility = "hidden";
        }
        if (!this.showHsv) {
            this.hsvNode.style.visibility = "hidden";
        }
        if (!this.showHex) {
            this.hexNode.style.visibility = "hidden";
        }
        if (!this.webSafe) {
            this.safePreviewNode.style.visibility = "hidden";
        }
    }, startup:function () {
        if (this._started) {
            return;
        }
        this._started = true;
        this.set("value", this.value);
        this._mover = new move.boxConstrainedMoveable(this.cursorNode, {box:{t:-(this.PICKER_SAT_SELECTOR_H / 2), l:-(this.PICKER_SAT_SELECTOR_W / 2), w:this.PICKER_SAT_VAL_W, h:this.PICKER_SAT_VAL_H}});
        this._hueMover = new move.boxConstrainedMoveable(this.hueCursorNode, {box:{t:-(this.PICKER_HUE_SELECTOR_H / 2), l:0, w:0, h:this.PICKER_HUE_H}});
        this._subs = [];
        this._subs.push(Hub.subscribe("/dnd/move/stop", lang.hitch(this, "_clearTimer")));
        this._subs.push(Hub.subscribe("/dnd/move/start", lang.hitch(this, "_setTimer")));
        this._keyListeners = [];
        this._connects.push(Typematic.addKeyListener(this.hueCursorNode, {charOrCode:Keys.UP_ARROW, shiftKey:false, metaKey:false, ctrlKey:false, altKey:false}, this, lang.hitch(this, this._updateHueCursorNode), 25, 25));
        this._connects.push(Typematic.addKeyListener(this.hueCursorNode, {charOrCode:Keys.DOWN_ARROW, shiftKey:false, metaKey:false, ctrlKey:false, altKey:false}, this, lang.hitch(this, this._updateHueCursorNode), 25, 25));
        this._connects.push(Typematic.addKeyListener(this.cursorNode, {charOrCode:Keys.UP_ARROW, shiftKey:false, metaKey:false, ctrlKey:false, altKey:false}, this, lang.hitch(this, this._updateCursorNode), 25, 25));
        this._connects.push(Typematic.addKeyListener(this.cursorNode, {charOrCode:Keys.DOWN_ARROW, shiftKey:false, metaKey:false, ctrlKey:false, altKey:false}, this, lang.hitch(this, this._updateCursorNode), 25, 25));
        this._connects.push(Typematic.addKeyListener(this.cursorNode, {charOrCode:Keys.LEFT_ARROW, shiftKey:false, metaKey:false, ctrlKey:false, altKey:false}, this, lang.hitch(this, this._updateCursorNode), 25, 25));
        this._connects.push(Typematic.addKeyListener(this.cursorNode, {charOrCode:Keys.RIGHT_ARROW, shiftKey:false, metaKey:false, ctrlKey:false, altKey:false}, this, lang.hitch(this, this._updateCursorNode), 25, 25));
    }, _setValueAttr:function (value, fireOnChange) {
        if (!this._started) {
            return;
        }
        this.setColor(value, fireOnChange);
    }, setColor:function (col, force) {
        col = color.fromString(col);
        this._updatePickerLocations(col);
        this._updateColorInputs(col);
        this._updateValue(col, force);
    }, _setTimer:function (mover) {
        if (mover.node != this.cursorNode && mover.node != this.hueCursorNode) {
            return;
        }
        FocusManager.focus(mover.node);
        DOM.setSelectable(this.domNode, false);
        this._timer = setInterval(lang.hitch(this, "_updateColor"), 45);
    }, _clearTimer:function (mover) {
        if (!this._timer) {
            return;
        }
        clearInterval(this._timer);
        this._timer = null;
        this.onChange(this.value);
        DOM.setSelectable(this.domNode, true);
    }, _setHue:function (h) {
        html.style(this.colorUnderlay, "backgroundColor", color.fromHsv(h, 100, 100).toHex());
    }, _updateHueCursorNode:function (count, node, e) {
        if (count !== -1) {
            var y = html.style(this.hueCursorNode, "top");
            var selCenter = this.PICKER_HUE_SELECTOR_H / 2;
            y += selCenter;
            var update = false;
            if (e.charOrCode == Keys.UP_ARROW) {
                if (y > 0) {
                    y -= 1;
                    update = true;
                }
            } else {
                if (e.charOrCode == Keys.DOWN_ARROW) {
                    if (y < this.PICKER_HUE_H) {
                        y += 1;
                        update = true;
                    }
                }
            }
            y -= selCenter;
            if (update) {
                html.style(this.hueCursorNode, "top", y + "px");
            }
        } else {
            this._updateColor(true);
        }
    }, _updateCursorNode:function (count, node, e) {
        var selCenterH = this.PICKER_SAT_SELECTOR_H / 2;
        var selCenterW = this.PICKER_SAT_SELECTOR_W / 2;
        if (count !== -1) {
            var y = html.style(this.cursorNode, "top");
            var x = html.style(this.cursorNode, "left");
            y += selCenterH;
            x += selCenterW;
            var update = false;
            if (e.charOrCode == Keys.UP_ARROW) {
                if (y > 0) {
                    y -= 1;
                    update = true;
                }
            } else {
                if (e.charOrCode == Keys.DOWN_ARROW) {
                    if (y < this.PICKER_SAT_VAL_H) {
                        y += 1;
                        update = true;
                    }
                } else {
                    if (e.charOrCode == Keys.LEFT_ARROW) {
                        if (x > 0) {
                            x -= 1;
                            update = true;
                        }
                    } else {
                        if (e.charOrCode == Keys.RIGHT_ARROW) {
                            if (x < this.PICKER_SAT_VAL_W) {
                                x += 1;
                                update = true;
                            }
                        }
                    }
                }
            }
            if (update) {
                y -= selCenterH;
                x -= selCenterW;
                html.style(this.cursorNode, "top", y + "px");
                html.style(this.cursorNode, "left", x + "px");
            }
        } else {
            this._updateColor(true);
        }
    }, _updateColor:function (fireChange) {
        var hueSelCenter = this.PICKER_HUE_SELECTOR_H / 2, satSelCenterH = this.PICKER_SAT_SELECTOR_H / 2, satSelCenterW = this.PICKER_SAT_SELECTOR_W / 2;
        var _huetop = html.style(this.hueCursorNode, "top") + hueSelCenter, _pickertop = html.style(this.cursorNode, "top") + satSelCenterH, _pickerleft = html.style(this.cursorNode, "left") + satSelCenterW, h = Math.round(360 - (_huetop / this.PICKER_HUE_H * 360)), col = color.fromHsv(h, _pickerleft / this.PICKER_SAT_VAL_W * 100, 100 - (_pickertop / this.PICKER_SAT_VAL_H * 100));
        this._updateColorInputs(col);
        this._updateValue(col, fireChange);
        if (h != this._hue) {
            this._setHue(h);
        }
    }, _colorInputChange:function (e) {
        var col, hasit = false;
        switch (e.target) {
          case this.hexCode:
            col = color.fromString(e.target.value);
            hasit = true;
            break;
          case this.Rval:
          case this.Gval:
          case this.Bval:
            col = color.fromArray([this.Rval.value, this.Gval.value, this.Bval.value]);
            hasit = true;
            break;
          case this.Hval:
          case this.Sval:
          case this.Vval:
            col = color.fromHsv(this.Hval.value, this.Sval.value, this.Vval.value);
            hasit = true;
            break;
        }
        if (hasit) {
            this._updatePickerLocations(col);
            this._updateColorInputs(col);
            this._updateValue(col, true);
        }
    }, _updateValue:function (col, fireChange) {
        var hex = col.toHex();
        this.value = this.valueNode.value = hex;
        if (fireChange && (!this._timer || this.liveUpdate)) {
            this.onChange(hex);
        }
    }, _updatePickerLocations:function (col) {
        var hueSelCenter = this.PICKER_HUE_SELECTOR_H / 2, satSelCenterH = this.PICKER_SAT_SELECTOR_H / 2, satSelCenterW = this.PICKER_SAT_SELECTOR_W / 2;
        var hsv = col.toHsv(), ypos = Math.round(this.PICKER_HUE_H - hsv.h / 360 * this.PICKER_HUE_H) - hueSelCenter, newLeft = Math.round(hsv.s / 100 * this.PICKER_SAT_VAL_W) - satSelCenterW, newTop = Math.round(this.PICKER_SAT_VAL_H - hsv.v / 100 * this.PICKER_SAT_VAL_H) - satSelCenterH;
        if (this.animatePoint) {
            fx.slideTo({node:this.hueCursorNode, duration:this.slideDuration, top:ypos, left:0}).play();
            fx.slideTo({node:this.cursorNode, duration:this.slideDuration, top:newTop, left:newLeft}).play();
        } else {
            html.style(this.hueCursorNode, "top", ypos + "px");
            html.style(this.cursorNode, {left:newLeft + "px", top:newTop + "px"});
        }
        if (hsv.h != this._hue) {
            this._setHue(hsv.h);
        }
    }, _updateColorInputs:function (col) {
        var hex = col.toHex();
        if (this.showRgb) {
            this.Rval.value = col.r;
            this.Gval.value = col.g;
            this.Bval.value = col.b;
        }
        if (this.showHsv) {
            var hsv = col.toHsv();
            this.Hval.value = Math.round((hsv.h));
            this.Sval.value = Math.round(hsv.s);
            this.Vval.value = Math.round(hsv.v);
        }
        if (this.showHex) {
            this.hexCode.value = hex;
        }
        this.previewNode.style.backgroundColor = hex;
        if (this.webSafe) {
            this.safePreviewNode.style.backgroundColor = webSafeFromHex(hex);
        }
    }, _setHuePoint:function (evt) {
        var selCenter = this.PICKER_HUE_SELECTOR_H / 2;
        var ypos = evt.layerY - selCenter;
        if (this.animatePoint) {
            fx.slideTo({node:this.hueCursorNode, duration:this.slideDuration, top:ypos, left:0, onEnd:lang.hitch(this, function () {
                this._updateColor(false);
                FocusManager.focus(this.hueCursorNode);
            })}).play();
        } else {
            html.style(this.hueCursorNode, "top", ypos + "px");
            this._updateColor(false);
        }
    }, _setPoint:function (evt) {
        var satSelCenterH = this.PICKER_SAT_SELECTOR_H / 2;
        var satSelCenterW = this.PICKER_SAT_SELECTOR_W / 2;
        var newTop = evt.layerY - satSelCenterH;
        var newLeft = evt.layerX - satSelCenterW;
        if (evt) {
            FocusManager.focus(evt.target);
        }
        if (this.animatePoint) {
            fx.slideTo({node:this.cursorNode, duration:this.slideDuration, top:newTop, left:newLeft, onEnd:lang.hitch(this, function () {
                this._updateColor(true);
                FocusManager.focus(this.cursorNode);
            })}).play();
        } else {
            html.style(this.cursorNode, {left:newLeft + "px", top:newTop + "px"});
            this._updateColor(false);
        }
    }, _handleKey:function (e) {
    }, focus:function () {
        if (!this.focused) {
            FocusManager.focus(this.focusNode);
        }
    }, _stopDrag:function (e) {
        Event.stop(e);
    }, destroy:function () {
        this.inherited(arguments);
        ArrayUtil.forEach(this._subs, function (sub) {
            Hub.unsubscribe(sub);
        });
        delete this._subs;
    }});
});

