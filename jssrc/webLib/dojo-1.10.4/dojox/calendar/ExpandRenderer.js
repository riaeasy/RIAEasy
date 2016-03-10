//>>built

require({cache:{"url:dojox/calendar/templates/ExpandRenderer.html":"<div class=\"dojoxCalendarExpand\" onselectstart=\"return false;\" data-dojo-attach-event=\"click:_onClick,touchstart:_onMouseDown,touchend:_onClick,mousedown:_onMouseDown,mouseup:_onMouseUp,mouseover:_onMouseOver,mouseout:_onMouseOut\">\n\t<div class=\"bg\"><span data-dojo-attach-point=\"expand\">\u25bc</span><span style=\"display:none\" data-dojo-attach-point=\"collapse\">\u25b2</span></div>\t\n</div>\n"}});
define("dojox/calendar/ExpandRenderer", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/event", "dojo/_base/window", "dojo/on", "dojo/dom-class", "dojo/dom-style", "dijit/_WidgetBase", "dijit/_TemplatedMixin", "dojo/text!./templates/ExpandRenderer.html"], function (declare, lang, event, win, on, domClass, domStyle, _WidgetBase, _TemplatedMixin, template) {
    return declare("dojox.calendar.ExpandRenderer", [_WidgetBase, _TemplatedMixin], {templateString:template, baseClass:"dojoxCalendarExpand", owner:null, focused:false, up:false, down:false, date:null, items:null, rowIndex:-1, columnIndex:-1, _setExpandedAttr:function (value) {
        domStyle.set(this.expand, "display", value ? "none" : "inline-block");
        domStyle.set(this.collapse, "display", value ? "inline-block" : "none");
        this._set("expanded", value);
    }, _setDownAttr:function (value) {
        this._setState("down", value, "Down");
    }, _setUpAttr:function (value) {
        this._setState("up", value, "Up");
    }, _setFocusedAttr:function (value) {
        this._setState("focused", value, "Focused");
    }, _setState:function (prop, value, cssClass) {
        if (this[prop] != value) {
            var tn = this.stateNode || this.domNode;
            domClass[value ? "add" : "remove"](tn, cssClass);
            this._set(prop, value);
        }
    }, _onClick:function (e) {
        if (this.owner && this.owner.expandRendererClickHandler) {
            this.owner.expandRendererClickHandler(e, this);
        }
    }, _onMouseDown:function (e) {
        event.stop(e);
        this.set("down", true);
    }, _onMouseUp:function (e) {
        this.set("down", false);
    }, _onMouseOver:function (e) {
        if (!this.up) {
            var buttonDown = e.button == 1;
            this.set("up", !buttonDown);
            this.set("down", buttonDown);
        }
    }, _onMouseOut:function (e) {
        var node = e.relatedTarget;
        while (node != e.currentTarget && node != win.doc.body && node != null) {
            node = node.parentNode;
        }
        if (node == e.currentTarget) {
            return;
        }
        this.set("up", false);
        this.set("down", false);
    }});
});

