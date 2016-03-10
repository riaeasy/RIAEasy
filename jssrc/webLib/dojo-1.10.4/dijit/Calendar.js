//>>built

define("dijit/Calendar", ["dojo/_base/array", "dojo/date", "dojo/date/locale", "dojo/_base/declare", "dojo/dom-attr", "dojo/dom-class", "dojo/dom-construct", "dojo/_base/kernel", "dojo/keys", "dojo/_base/lang", "dojo/on", "dojo/sniff", "./CalendarLite", "./_Widget", "./_CssStateMixin", "./_TemplatedMixin", "./form/DropDownButton"], function (array, date, local, declare, domAttr, domClass, domConstruct, kernel, keys, lang, on, has, CalendarLite, _Widget, _CssStateMixin, _TemplatedMixin, DropDownButton) {
    var Calendar = declare("dijit.Calendar", [CalendarLite, _Widget, _CssStateMixin], {baseClass:"dijitCalendar", cssStateNodes:{"decrementMonth":"dijitCalendarArrow", "incrementMonth":"dijitCalendarArrow", "previousYearLabelNode":"dijitCalendarPreviousYear", "nextYearLabelNode":"dijitCalendarNextYear"}, setValue:function (value) {
        kernel.deprecated("dijit.Calendar:setValue() is deprecated.  Use set('value', ...) instead.", "", "2.0");
        this.set("value", value);
    }, _createMonthWidget:function () {
        return new Calendar._MonthDropDownButton({id:this.id + "_mddb", tabIndex:-1, onMonthSelect:lang.hitch(this, "_onMonthSelect"), lang:this.lang, dateLocaleModule:this.dateLocaleModule}, this.monthNode);
    }, postCreate:function () {
        this.inherited(arguments);
        this.own(on(this.domNode, "keydown", lang.hitch(this, "_onKeyDown")), on(this.dateRowsNode, "mouseover", lang.hitch(this, "_onDayMouseOver")), on(this.dateRowsNode, "mouseout", lang.hitch(this, "_onDayMouseOut")), on(this.dateRowsNode, "mousedown", lang.hitch(this, "_onDayMouseDown")), on(this.dateRowsNode, "mouseup", lang.hitch(this, "_onDayMouseUp")));
    }, _onMonthSelect:function (newMonth) {
        var date = new this.dateClassObj(this.currentFocus);
        date.setDate(1);
        date.setMonth(newMonth);
        var daysInMonth = this.dateModule.getDaysInMonth(date);
        var currentDate = this.currentFocus.getDate();
        date.setDate(Math.min(currentDate, daysInMonth));
        this._setCurrentFocusAttr(date);
    }, _onDayMouseOver:function (evt) {
        var node = domClass.contains(evt.target, "dijitCalendarDateLabel") ? evt.target.parentNode : evt.target;
        if (node && ((node.dijitDateValue && !domClass.contains(node, "dijitCalendarDisabledDate")) || node == this.previousYearLabelNode || node == this.nextYearLabelNode)) {
            domClass.add(node, "dijitCalendarHoveredDate");
            this._currentNode = node;
        }
    }, _onDayMouseOut:function (evt) {
        if (!this._currentNode) {
            return;
        }
        if (evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode) {
            return;
        }
        var cls = "dijitCalendarHoveredDate";
        if (domClass.contains(this._currentNode, "dijitCalendarActiveDate")) {
            cls += " dijitCalendarActiveDate";
        }
        domClass.remove(this._currentNode, cls);
        this._currentNode = null;
    }, _onDayMouseDown:function (evt) {
        var node = evt.target.parentNode;
        if (node && node.dijitDateValue && !domClass.contains(node, "dijitCalendarDisabledDate")) {
            domClass.add(node, "dijitCalendarActiveDate");
            this._currentNode = node;
        }
    }, _onDayMouseUp:function (evt) {
        var node = evt.target.parentNode;
        if (node && node.dijitDateValue) {
            domClass.remove(node, "dijitCalendarActiveDate");
        }
    }, handleKey:function (evt) {
        var increment = -1, interval, newValue = this.currentFocus;
        switch (evt.keyCode) {
          case keys.RIGHT_ARROW:
            increment = 1;
          case keys.LEFT_ARROW:
            interval = "day";
            if (!this.isLeftToRight()) {
                increment *= -1;
            }
            break;
          case keys.DOWN_ARROW:
            increment = 1;
          case keys.UP_ARROW:
            interval = "week";
            break;
          case keys.PAGE_DOWN:
            increment = 1;
          case keys.PAGE_UP:
            interval = evt.ctrlKey || evt.altKey ? "year" : "month";
            break;
          case keys.END:
            newValue = this.dateModule.add(newValue, "month", 1);
            interval = "day";
          case keys.HOME:
            newValue = new this.dateClassObj(newValue);
            newValue.setDate(1);
            break;
          default:
            return true;
        }
        if (interval) {
            newValue = this.dateModule.add(newValue, interval, increment);
        }
        this._setCurrentFocusAttr(newValue);
        return false;
    }, _onKeyDown:function (evt) {
        if (!this.handleKey(evt)) {
            evt.stopPropagation();
            evt.preventDefault();
        }
    }, onValueSelected:function () {
    }, onChange:function (value) {
        this.onValueSelected(value);
    }, getClassForDate:function () {
    }});
    Calendar._MonthDropDownButton = declare("dijit.Calendar._MonthDropDownButton", DropDownButton, {onMonthSelect:function () {
    }, postCreate:function () {
        this.inherited(arguments);
        this.dropDown = new Calendar._MonthDropDown({id:this.id + "_mdd", onChange:this.onMonthSelect});
    }, _setMonthAttr:function (month) {
        var monthNames = this.dateLocaleModule.getNames("months", "wide", "standAlone", this.lang, month);
        this.dropDown.set("months", monthNames);
        this.containerNode.innerHTML = (has("ie") == 6 ? "" : "<div class='dijitSpacer'>" + this.dropDown.domNode.innerHTML + "</div>") + "<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" + monthNames[month.getMonth()] + "</div>";
    }});
    Calendar._MonthDropDown = declare("dijit.Calendar._MonthDropDown", [_Widget, _TemplatedMixin, _CssStateMixin], {months:[], baseClass:"dijitCalendarMonthMenu dijitMenu", templateString:"<div data-dojo-attach-event='ondijitclick:_onClick'></div>", _setMonthsAttr:function (months) {
        this.domNode.innerHTML = "";
        array.forEach(months, function (month, idx) {
            var div = domConstruct.create("div", {className:"dijitCalendarMonthLabel", month:idx, innerHTML:month}, this.domNode);
            div._cssState = "dijitCalendarMonthLabel";
        }, this);
    }, _onClick:function (evt) {
        this.onChange(domAttr.get(evt.target, "month"));
    }, onChange:function () {
    }});
    return Calendar;
});

