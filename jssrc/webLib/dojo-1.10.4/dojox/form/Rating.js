//>>built

define("dojox/form/Rating", ["dojo/_base/declare", "dojo/_base/lang", "dojo/dom-attr", "dojo/dom-class", "dojo/mouse", "dojo/on", "dojo/string", "dojo/query", "dijit/form/_FormWidget"], function (declare, lang, domAttr, domClass, mouse, on, string, query, FormWidget) {
    return declare("dojox.form.Rating", FormWidget, {templateString:null, numStars:3, value:0, buildRendering:function (params) {
        var tpl = "<div dojoAttachPoint=\"domNode\" class=\"dojoxRating dijitInline\">" + "<input type=\"hidden\" value=\"0\" dojoAttachPoint=\"focusNode\" /><ul data-dojo-attach-point=\"list\">${stars}</ul>" + "</div>";
        var starTpl = "<li class=\"dojoxRatingStar dijitInline\" value=\"${value}\"></li>";
        var rendered = "";
        for (var i = 0; i < this.numStars; i++) {
            rendered += string.substitute(starTpl, {value:i + 1});
        }
        this.templateString = string.substitute(tpl, {stars:rendered});
        this.inherited(arguments);
    }, postCreate:function () {
        this.inherited(arguments);
        this._renderStars(this.value);
        this.own(on(this.list, on.selector(".dojoxRatingStar", "mouseover"), lang.hitch(this, "_onMouse")), on(this.list, on.selector(".dojoxRatingStar", "click"), lang.hitch(this, "onStarClick")), on(this.list, mouse.leave, lang.hitch(this, function () {
            this._renderStars(this.value);
        })));
    }, _onMouse:function (evt) {
        var hoverValue = +domAttr.get(evt.target, "value");
        this._renderStars(hoverValue, true);
        this.onMouseOver(evt, hoverValue);
    }, _renderStars:function (value, hover) {
        query(".dojoxRatingStar", this.domNode).forEach(function (star, i) {
            if (i + 1 > value) {
                domClass.remove(star, "dojoxRatingStarHover");
                domClass.remove(star, "dojoxRatingStarChecked");
            } else {
                domClass.remove(star, "dojoxRatingStar" + (hover ? "Checked" : "Hover"));
                domClass.add(star, "dojoxRatingStar" + (hover ? "Hover" : "Checked"));
            }
        });
    }, onStarClick:function (evt) {
        var newVal = +domAttr.get(evt.target, "value");
        this.setAttribute("value", newVal == this.value ? 0 : newVal);
        this._renderStars(this.value);
        this.onChange(this.value);
    }, onMouseOver:function () {
    }, setAttribute:function (key, value) {
        this.set(key, value);
    }, _setValueAttr:function (val) {
        this.focusNode.value = val;
        this._set("value", val);
        this._renderStars(val);
        this.onChange(val);
    }});
});

