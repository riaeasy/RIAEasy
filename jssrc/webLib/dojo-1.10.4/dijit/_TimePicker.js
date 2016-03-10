//>>built

define("dijit/_TimePicker", ["dojo/_base/array", "dojo/date", "dojo/date/locale", "dojo/date/stamp", "dojo/_base/declare", "dojo/dom-class", "dojo/dom-construct", "dojo/_base/kernel", "dojo/keys", "dojo/_base/lang", "dojo/sniff", "dojo/query", "dojo/mouse", "dojo/on", "./_WidgetBase", "./form/_ListMouseMixin"], function (array, ddate, locale, stamp, declare, domClass, domConstruct, kernel, keys, lang, has, query, mouse, on, _WidgetBase, _ListMouseMixin) {
    var TimePicker = declare("dijit._TimePicker", [_WidgetBase, _ListMouseMixin], {baseClass:"dijitTimePicker", pickerMin:"T00:00:00", pickerMax:"T23:59:59", clickableIncrement:"T00:15:00", visibleIncrement:"T01:00:00", value:new Date(), _visibleIncrement:2, _clickableIncrement:1, _totalIncrements:10, constraints:{}, serialize:stamp.toISOString, buildRendering:function () {
        this.inherited(arguments);
        this.containerNode = this.domNode;
        this.timeMenu = this.domNode;
    }, setValue:function (value) {
        kernel.deprecated("dijit._TimePicker:setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
        this.set("value", value);
    }, _setValueAttr:function (date) {
        this._set("value", date);
        this._showText();
    }, _setFilterStringAttr:function (val) {
        this._set("filterString", val);
        this._showText();
    }, isDisabledDate:function () {
        return false;
    }, _getFilteredNodes:function (start, maxNum, before, lastNode) {
        var nodes = [];
        for (var i = 0; i < this._maxIncrement; i++) {
            var n = this._createOption(i);
            if (n) {
                nodes.push(n);
            }
        }
        return nodes;
    }, _showText:function () {
        var fromIso = stamp.fromISOString;
        this.domNode.innerHTML = "";
        this._clickableIncrementDate = fromIso(this.clickableIncrement);
        this._visibleIncrementDate = fromIso(this.visibleIncrement);
        var sinceMidnight = function (date) {
            return date.getHours() * 60 * 60 + date.getMinutes() * 60 + date.getSeconds();
        }, clickableIncrementSeconds = sinceMidnight(this._clickableIncrementDate), visibleIncrementSeconds = sinceMidnight(this._visibleIncrementDate), time = (this.value || this.currentFocus).getTime();
        this._refDate = fromIso(this.pickerMin);
        this._refDate.setFullYear(1970, 0, 1);
        this._clickableIncrement = 1;
        this._visibleIncrement = visibleIncrementSeconds / clickableIncrementSeconds;
        var endDate = fromIso(this.pickerMax);
        endDate.setFullYear(1970, 0, 1);
        var visibleRange = (endDate.getTime() - this._refDate.getTime()) * 0.001;
        this._maxIncrement = Math.ceil((visibleRange + 1) / clickableIncrementSeconds);
        var nodes = this._getFilteredNodes();
        array.forEach(nodes, function (n) {
            this.domNode.appendChild(n);
        }, this);
        if (!nodes.length && this.filterString) {
            this.filterString = "";
            this._showText();
        }
    }, constructor:function () {
        this.constraints = {};
    }, postMixInProperties:function () {
        this.inherited(arguments);
        this._setConstraintsAttr(this.constraints);
    }, _setConstraintsAttr:function (constraints) {
        for (var key in {clickableIncrement:1, visibleIncrement:1, pickerMin:1, pickerMax:1}) {
            if (key in constraints) {
                this[key] = constraints[key];
            }
        }
        if (!constraints.locale) {
            constraints.locale = this.lang;
        }
    }, _createOption:function (index) {
        var date = new Date(this._refDate);
        var incrementDate = this._clickableIncrementDate;
        date.setHours(date.getHours() + incrementDate.getHours() * index, date.getMinutes() + incrementDate.getMinutes() * index, date.getSeconds() + incrementDate.getSeconds() * index);
        if (this.constraints.selector == "time") {
            date.setFullYear(1970, 0, 1);
        }
        var dateString = locale.format(date, this.constraints);
        if (this.filterString && dateString.toLowerCase().indexOf(this.filterString) !== 0) {
            return null;
        }
        var div = this.ownerDocument.createElement("div");
        div.className = this.baseClass + "Item";
        div.date = date;
        div.idx = index;
        domConstruct.create("div", {"class":this.baseClass + "ItemInner", innerHTML:dateString}, div);
        if (index % this._visibleIncrement < 1 && index % this._visibleIncrement > -1) {
            domClass.add(div, this.baseClass + "Marker");
        } else {
            if (!(index % this._clickableIncrement)) {
                domClass.add(div, this.baseClass + "Tick");
            }
        }
        if (this.isDisabledDate(date)) {
            domClass.add(div, this.baseClass + "ItemDisabled");
        }
        if (this.value && !ddate.compare(this.value, date, this.constraints.selector)) {
            div.selected = true;
            domClass.add(div, this.baseClass + "ItemSelected");
            this._selectedDiv = div;
            if (domClass.contains(div, this.baseClass + "Marker")) {
                domClass.add(div, this.baseClass + "MarkerSelected");
            } else {
                domClass.add(div, this.baseClass + "TickSelected");
            }
            this._highlightOption(div, true);
        }
        return div;
    }, onOpen:function () {
        this.inherited(arguments);
        this.set("selected", this._selectedDiv);
    }, _onOptionSelected:function (tgt) {
        var tdate = tgt.target.date || tgt.target.parentNode.date;
        if (!tdate || this.isDisabledDate(tdate)) {
            return;
        }
        this._highlighted_option = null;
        this.set("value", tdate);
        this.onChange(tdate);
    }, onChange:function () {
    }, _highlightOption:function (node, highlight) {
        if (!node) {
            return;
        }
        if (highlight) {
            if (this._highlighted_option) {
                this._highlightOption(this._highlighted_option, false);
            }
            this._highlighted_option = node;
        } else {
            if (this._highlighted_option !== node) {
                return;
            } else {
                this._highlighted_option = null;
            }
        }
        domClass.toggle(node, this.baseClass + "ItemHover", highlight);
        if (domClass.contains(node, this.baseClass + "Marker")) {
            domClass.toggle(node, this.baseClass + "MarkerHover", highlight);
        } else {
            domClass.toggle(node, this.baseClass + "TickHover", highlight);
        }
    }, handleKey:function (e) {
        if (e.keyCode == keys.DOWN_ARROW) {
            this.selectNextNode();
            e.stopPropagation();
            e.preventDefault();
            return false;
        } else {
            if (e.keyCode == keys.UP_ARROW) {
                this.selectPreviousNode();
                e.stopPropagation();
                e.preventDefault();
                return false;
            } else {
                if (e.keyCode == keys.ENTER || e.keyCode === keys.TAB) {
                    if (!this._keyboardSelected && e.keyCode === keys.TAB) {
                        return true;
                    }
                    if (this._highlighted_option) {
                        this._onOptionSelected({target:this._highlighted_option});
                    }
                    return e.keyCode === keys.TAB;
                }
            }
        }
        return undefined;
    }, onHover:function (node) {
        this._highlightOption(node, true);
    }, onUnhover:function (node) {
        this._highlightOption(node, false);
    }, onSelect:function (node) {
        this._highlightOption(node, true);
    }, onDeselect:function (node) {
        this._highlightOption(node, false);
    }, onClick:function (node) {
        this._onOptionSelected({target:node});
    }});
    return TimePicker;
});

