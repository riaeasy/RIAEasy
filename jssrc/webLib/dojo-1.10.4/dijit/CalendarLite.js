//>>built

require({cache:{"url:dijit/templates/Calendar.html":"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\" role=\"grid\" aria-labelledby=\"${id}_mddb ${id}_year\" data-dojo-attach-point=\"gridNode\">\n\t<thead>\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset dijitCalendarArrow' data-dojo-attach-point=\"decrementMonth\" scope=\"col\">\n\t\t\t\t<span class=\"dijitInline dijitCalendarIncrementControl dijitCalendarDecrease\" role=\"presentation\"></span>\n\t\t\t\t<span data-dojo-attach-point=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\" scope=\"col\">\n\t\t\t\t<div data-dojo-attach-point=\"monthNode\">\n\t\t\t\t</div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset dijitCalendarArrow' scope=\"col\" data-dojo-attach-point=\"incrementMonth\">\n\t\t\t\t<span class=\"dijitInline dijitCalendarIncrementControl dijitCalendarIncrease\" role=\"presentation\"></span>\n\t\t\t\t<span data-dojo-attach-point=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr role=\"row\">\n\t\t\t${!dayCellsHtml}\n\t\t</tr>\n\t</thead>\n\t<tbody data-dojo-attach-point=\"dateRowsNode\" data-dojo-attach-event=\"ondijitclick: _onDayClick\" class=\"dijitReset dijitCalendarBodyContainer\">\n\t\t\t${!dateRowsHtml}\n\t</tbody>\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\" role=\"presentation\">\n\t\t\t\t<div class=\"dijitCalendarYearLabel\">\n\t\t\t\t\t<span data-dojo-attach-point=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\" role=\"button\"></span>\n\t\t\t\t\t<span data-dojo-attach-point=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\" role=\"button\" id=\"${id}_year\"></span>\n\t\t\t\t\t<span data-dojo-attach-point=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\" role=\"button\"></span>\n\t\t\t\t</div>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>\n"}});
define("dijit/CalendarLite", ["dojo/_base/array", "dojo/_base/declare", "dojo/cldr/supplemental", "dojo/date", "dojo/date/locale", "dojo/date/stamp", "dojo/dom", "dojo/dom-class", "dojo/_base/lang", "dojo/on", "dojo/sniff", "dojo/string", "./_WidgetBase", "./_TemplatedMixin", "dojo/text!./templates/Calendar.html", "./a11yclick", "./hccss"], function (array, declare, cldrSupplemental, date, locale, stamp, dom, domClass, lang, on, has, string, _WidgetBase, _TemplatedMixin, template) {
    var CalendarLite = declare("dijit.CalendarLite", [_WidgetBase, _TemplatedMixin], {templateString:template, dowTemplateString:"<th class=\"dijitReset dijitCalendarDayLabelTemplate\" role=\"columnheader\" scope=\"col\"><span class=\"dijitCalendarDayLabel\">${d}</span></th>", dateTemplateString:"<td class=\"dijitReset\" role=\"gridcell\" data-dojo-attach-point=\"dateCells\"><span class=\"dijitCalendarDateLabel\" data-dojo-attach-point=\"dateLabels\"></span></td>", weekTemplateString:"<tr class=\"dijitReset dijitCalendarWeekTemplate\" role=\"row\">${d}${d}${d}${d}${d}${d}${d}</tr>", value:new Date(""), datePackage:"", dayWidth:"narrow", tabIndex:"0", currentFocus:new Date(), _setSummaryAttr:"gridNode", baseClass:"dijitCalendar dijitCalendarLite", _isValidDate:function (value) {
        return value && !isNaN(value) && typeof value == "object" && value.toString() != this.constructor.prototype.value.toString();
    }, _getValueAttr:function () {
        var storedVal = this._get("value");
        if (storedVal && !isNaN(storedVal)) {
            var value = new this.dateClassObj(storedVal);
            value.setHours(0, 0, 0, 0);
            if (value.getDate() < storedVal.getDate()) {
                value = this.dateModule.add(value, "hour", 1);
            }
            return value;
        } else {
            return null;
        }
    }, _setValueAttr:function (value, priorityChange) {
        if (typeof value == "string") {
            value = stamp.fromISOString(value);
        }
        value = this._patchDate(value);
        if (this._isValidDate(value) && !this.isDisabledDate(value, this.lang)) {
            this._set("value", value);
            this.set("currentFocus", value);
            this._markSelectedDates([value]);
            if (this._created && (priorityChange || typeof priorityChange == "undefined")) {
                this.onChange(this.get("value"));
            }
        } else {
            this._set("value", null);
            this._markSelectedDates([]);
        }
    }, _patchDate:function (value) {
        if (value) {
            value = new this.dateClassObj(value);
            value.setHours(1, 0, 0, 0);
        }
        return value;
    }, _setText:function (node, text) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        node.appendChild(node.ownerDocument.createTextNode(text));
    }, _populateGrid:function () {
        var month = new this.dateClassObj(this.currentFocus);
        month.setDate(1);
        month = this._patchDate(month);
        var firstDay = month.getDay(), daysInMonth = this.dateModule.getDaysInMonth(month), daysInPreviousMonth = this.dateModule.getDaysInMonth(this.dateModule.add(month, "month", -1)), today = new this.dateClassObj(), dayOffset = cldrSupplemental.getFirstDayOfWeek(this.lang);
        if (dayOffset > firstDay) {
            dayOffset -= 7;
        }
        if (!this.summary) {
            var monthNames = this.dateLocaleModule.getNames("months", "wide", "standAlone", this.lang, month);
            this.gridNode.setAttribute("summary", monthNames[month.getMonth()]);
        }
        this._date2cell = {};
        array.forEach(this.dateCells, function (template, idx) {
            var i = idx + dayOffset;
            var date = new this.dateClassObj(month), number, clazz = "dijitCalendar", adj = 0;
            if (i < firstDay) {
                number = daysInPreviousMonth - firstDay + i + 1;
                adj = -1;
                clazz += "Previous";
            } else {
                if (i >= (firstDay + daysInMonth)) {
                    number = i - firstDay - daysInMonth + 1;
                    adj = 1;
                    clazz += "Next";
                } else {
                    number = i - firstDay + 1;
                    clazz += "Current";
                }
            }
            if (adj) {
                date = this.dateModule.add(date, "month", adj);
            }
            date.setDate(number);
            if (!this.dateModule.compare(date, today, "date")) {
                clazz = "dijitCalendarCurrentDate " + clazz;
            }
            if (this.isDisabledDate(date, this.lang)) {
                clazz = "dijitCalendarDisabledDate " + clazz;
                template.setAttribute("aria-disabled", "true");
            } else {
                clazz = "dijitCalendarEnabledDate " + clazz;
                template.removeAttribute("aria-disabled");
                template.setAttribute("aria-selected", "false");
            }
            var clazz2 = this.getClassForDate(date, this.lang);
            if (clazz2) {
                clazz = clazz2 + " " + clazz;
            }
            template.className = clazz + "Month dijitCalendarDateTemplate";
            var dateVal = date.valueOf();
            this._date2cell[dateVal] = template;
            template.dijitDateValue = dateVal;
            this._setText(this.dateLabels[idx], date.getDateLocalized ? date.getDateLocalized(this.lang) : date.getDate());
        }, this);
    }, _populateControls:function () {
        var month = new this.dateClassObj(this.currentFocus);
        month.setDate(1);
        this.monthWidget.set("month", month);
        var y = month.getFullYear() - 1;
        var d = new this.dateClassObj();
        array.forEach(["previous", "current", "next"], function (name) {
            d.setFullYear(y++);
            this._setText(this[name + "YearLabelNode"], this.dateLocaleModule.format(d, {selector:"year", locale:this.lang}));
        }, this);
    }, goToToday:function () {
        this.set("value", new this.dateClassObj());
    }, constructor:function (params) {
        this.dateModule = params.datePackage ? lang.getObject(params.datePackage, false) : date;
        this.dateClassObj = this.dateModule.Date || Date;
        this.dateLocaleModule = params.datePackage ? lang.getObject(params.datePackage + ".locale", false) : locale;
    }, _createMonthWidget:function () {
        return CalendarLite._MonthWidget({id:this.id + "_mddb", lang:this.lang, dateLocaleModule:this.dateLocaleModule}, this.monthNode);
    }, buildRendering:function () {
        var d = this.dowTemplateString, dayNames = this.dateLocaleModule.getNames("days", this.dayWidth, "standAlone", this.lang), dayOffset = cldrSupplemental.getFirstDayOfWeek(this.lang);
        this.dayCellsHtml = string.substitute([d, d, d, d, d, d, d].join(""), {d:""}, function () {
            return dayNames[dayOffset++ % 7];
        });
        var r = string.substitute(this.weekTemplateString, {d:this.dateTemplateString});
        this.dateRowsHtml = [r, r, r, r, r, r].join("");
        this.dateCells = [];
        this.dateLabels = [];
        this.inherited(arguments);
        dom.setSelectable(this.domNode, false);
        var dateObj = new this.dateClassObj(this.currentFocus);
        this.monthWidget = this._createMonthWidget();
        this.set("currentFocus", dateObj, false);
    }, postCreate:function () {
        this.inherited(arguments);
        this._connectControls();
    }, _connectControls:function () {
        var connect = lang.hitch(this, function (nodeProp, part, amount) {
            this[nodeProp].dojoClick = true;
            return on(this[nodeProp], "click", lang.hitch(this, function () {
                this._setCurrentFocusAttr(this.dateModule.add(this.currentFocus, part, amount));
            }));
        });
        this.own(connect("incrementMonth", "month", 1), connect("decrementMonth", "month", -1), connect("nextYearLabelNode", "year", 1), connect("previousYearLabelNode", "year", -1));
    }, _setCurrentFocusAttr:function (date, forceFocus) {
        var oldFocus = this.currentFocus, oldCell = this._getNodeByDate(oldFocus);
        date = this._patchDate(date);
        this._set("currentFocus", date);
        if (!this._date2cell || this.dateModule.difference(oldFocus, date, "month") != 0) {
            this._populateGrid();
            this._populateControls();
            this._markSelectedDates([this.value]);
        }
        var newCell = this._getNodeByDate(date);
        newCell.setAttribute("tabIndex", this.tabIndex);
        if (this.focused || forceFocus) {
            newCell.focus();
        }
        if (oldCell && oldCell != newCell) {
            if (has("webkit")) {
                oldCell.setAttribute("tabIndex", "-1");
            } else {
                oldCell.removeAttribute("tabIndex");
            }
        }
    }, focus:function () {
        this._setCurrentFocusAttr(this.currentFocus, true);
    }, _onDayClick:function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        for (var node = evt.target; node && !node.dijitDateValue; node = node.parentNode) {
        }
        if (node && !domClass.contains(node, "dijitCalendarDisabledDate")) {
            this.set("value", node.dijitDateValue);
        }
    }, _getNodeByDate:function (value) {
        value = this._patchDate(value);
        return value && this._date2cell ? this._date2cell[value.valueOf()] : null;
    }, _markSelectedDates:function (dates) {
        function mark(selected, cell) {
            domClass.toggle(cell, "dijitCalendarSelectedDate", selected);
            cell.setAttribute("aria-selected", selected ? "true" : "false");
        }
        array.forEach(this._selectedCells || [], lang.partial(mark, false));
        this._selectedCells = array.filter(array.map(dates, this._getNodeByDate, this), function (n) {
            return n;
        });
        array.forEach(this._selectedCells, lang.partial(mark, true));
    }, onChange:function () {
    }, isDisabledDate:function () {
    }, getClassForDate:function () {
    }});
    CalendarLite._MonthWidget = declare("dijit.CalendarLite._MonthWidget", _WidgetBase, {_setMonthAttr:function (month) {
        var monthNames = this.dateLocaleModule.getNames("months", "wide", "standAlone", this.lang, month), spacer = (has("ie") == 6 ? "" : "<div class='dijitSpacer'>" + array.map(monthNames, function (s) {
            return "<div>" + s + "</div>";
        }).join("") + "</div>");
        this.domNode.innerHTML = spacer + "<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" + monthNames[month.getMonth()] + "</div>";
    }});
    return CalendarLite;
});

