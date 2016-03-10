//>>built

require({cache:{"url:dijit/templates/MenuItem.html":"<tr class=\"dijitReset\" data-dojo-attach-point=\"focusNode\" role=\"menuitem\" tabIndex=\"-1\">\n\t<td class=\"dijitReset dijitMenuItemIconCell\" role=\"presentation\">\n\t\t<span role=\"presentation\" class=\"dijitInline dijitIcon dijitMenuItemIcon\" data-dojo-attach-point=\"iconNode\"></span>\n\t</td>\n\t<td class=\"dijitReset dijitMenuItemLabel\" colspan=\"2\" data-dojo-attach-point=\"containerNode,textDirNode\"\n\t\trole=\"presentation\"></td>\n\t<td class=\"dijitReset dijitMenuItemAccelKey\" style=\"display: none\" data-dojo-attach-point=\"accelKeyNode\"></td>\n\t<td class=\"dijitReset dijitMenuArrowCell\" role=\"presentation\">\n\t\t<span data-dojo-attach-point=\"arrowWrapper\" style=\"visibility: hidden\">\n\t\t\t<span class=\"dijitInline dijitIcon dijitMenuExpand\"></span>\n\t\t\t<span class=\"dijitMenuExpandA11y\">+</span>\n\t\t</span>\n\t</td>\n</tr>\n"}});
define("dijit/MenuItem", ["dojo/_base/declare", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "dojo/_base/kernel", "dojo/sniff", "dojo/_base/lang", "./_Widget", "./_TemplatedMixin", "./_Contained", "./_CssStateMixin", "dojo/text!./templates/MenuItem.html"], function (declare, dom, domAttr, domClass, kernel, has, lang, _Widget, _TemplatedMixin, _Contained, _CssStateMixin, template) {
    var MenuItem = declare("dijit.MenuItem" + (0 ? "_NoBidi" : ""), [_Widget, _TemplatedMixin, _Contained, _CssStateMixin], {templateString:template, baseClass:"dijitMenuItem", label:"", _setLabelAttr:function (val) {
        this._set("label", val);
        var shortcutKey = "";
        var text;
        var ndx = val.search(/{\S}/);
        if (ndx >= 0) {
            shortcutKey = val.charAt(ndx + 1);
            var prefix = val.substr(0, ndx);
            var suffix = val.substr(ndx + 3);
            text = prefix + shortcutKey + suffix;
            val = prefix + "<span class=\"dijitMenuItemShortcutKey\">" + shortcutKey + "</span>" + suffix;
        } else {
            text = val;
        }
        this.domNode.setAttribute("aria-label", text + " " + this.accelKey);
        this.containerNode.innerHTML = val;
        this._set("shortcutKey", shortcutKey);
    }, iconClass:"dijitNoIcon", _setIconClassAttr:{node:"iconNode", type:"class"}, accelKey:"", disabled:false, _fillContent:function (source) {
        if (source && !("label" in this.params)) {
            this._set("label", source.innerHTML);
        }
    }, buildRendering:function () {
        this.inherited(arguments);
        var label = this.id + "_text";
        domAttr.set(this.containerNode, "id", label);
        if (this.accelKeyNode) {
            domAttr.set(this.accelKeyNode, "id", this.id + "_accel");
        }
        dom.setSelectable(this.domNode, false);
    }, onClick:function () {
    }, focus:function () {
        try {
            if (has("ie") == 8) {
                this.containerNode.focus();
            }
            this.focusNode.focus();
        }
        catch (e) {
        }
    }, _setSelected:function (selected) {
        domClass.toggle(this.domNode, "dijitMenuItemSelected", selected);
    }, setLabel:function (content) {
        kernel.deprecated("dijit.MenuItem.setLabel() is deprecated.  Use set('label', ...) instead.", "", "2.0");
        this.set("label", content);
    }, setDisabled:function (disabled) {
        kernel.deprecated("dijit.Menu.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
        this.set("disabled", disabled);
    }, _setDisabledAttr:function (value) {
        this.focusNode.setAttribute("aria-disabled", value ? "true" : "false");
        this._set("disabled", value);
    }, _setAccelKeyAttr:function (value) {
        if (this.accelKeyNode) {
            this.accelKeyNode.style.display = value ? "" : "none";
            this.accelKeyNode.innerHTML = value;
            domAttr.set(this.containerNode, "colSpan", value ? "1" : "2");
        }
        this._set("accelKey", value);
    }});
    if (0) {
        MenuItem = declare("dijit.MenuItem", MenuItem, {_setLabelAttr:function (val) {
            this.inherited(arguments);
            if (this.textDir === "auto") {
                this.applyTextDir(this.textDirNode);
            }
        }});
    }
    return MenuItem;
});

