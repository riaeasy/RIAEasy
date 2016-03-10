//>>built

require({cache:{"url:dojox/widget/MultiSelectCalendar/MultiSelectCalendar.html":"<table cellspacing=\"0\" cellpadding=\"0\" class=\"dijitCalendarContainer\" role=\"grid\" dojoAttachEvent=\"onkeydown: _onKeyDown\" aria-labelledby=\"${id}_year\">\n\t<thead>\n\t\t<tr class=\"dijitReset dijitCalendarMonthContainer\" valign=\"top\">\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"decrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarDecrease\" role=\"presentation\"/>\n\t\t\t\t<span dojoAttachPoint=\"decreaseArrowNode\" class=\"dijitA11ySideArrow\">-</span>\n\t\t\t</th>\n\t\t\t<th class='dijitReset' colspan=\"5\">\n\t\t\t\t<div dojoType=\"dijit.form.DropDownButton\" dojoAttachPoint=\"monthDropDownButton\"\n\t\t\t\t\tid=\"${id}_mddb\" tabIndex=\"-1\">\n\t\t\t\t</div>\n\t\t\t</th>\n\t\t\t<th class='dijitReset dijitCalendarArrow' dojoAttachPoint=\"incrementMonth\">\n\t\t\t\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitCalendarIncrementControl dijitCalendarIncrease\" role=\"presentation\"/>\n\t\t\t\t<span dojoAttachPoint=\"increaseArrowNode\" class=\"dijitA11ySideArrow\">+</span>\n\t\t\t</th>\n\t\t</tr>\n\t\t<tr>\n\t\t\t<th class=\"dijitReset dijitCalendarDayLabelTemplate\" role=\"columnheader\"><span class=\"dijitCalendarDayLabel\"></span></th>\n\t\t</tr>\n\t</thead>\n\t<tbody dojoAttachEvent=\"onclick: _onDayClick, onmouseover: _onDayMouseOver, onmouseout: _onDayMouseOut, onmousedown: _onDayMouseDown, onmouseup: _onDayMouseUp\" class=\"dijitReset dijitCalendarBodyContainer\">\n\t\t<tr class=\"dijitReset dijitCalendarWeekTemplate\" role=\"row\">\n\t\t\t<td class=\"dijitReset dijitCalendarDateTemplate\" role=\"gridcell\"><span class=\"dijitCalendarDateLabel\"></span></td>\n\t\t</tr>\n\t</tbody>\n\t<tfoot class=\"dijitReset dijitCalendarYearContainer\">\n\t\t<tr>\n\t\t\t<td class='dijitReset' valign=\"top\" colspan=\"7\">\n\t\t\t\t<h3 class=\"dijitCalendarYearLabel\">\n\t\t\t\t\t<span dojoAttachPoint=\"previousYearLabelNode\" class=\"dijitInline dijitCalendarPreviousYear\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"currentYearLabelNode\" class=\"dijitInline dijitCalendarSelectedYear\" id=\"${id}_year\"></span>\n\t\t\t\t\t<span dojoAttachPoint=\"nextYearLabelNode\" class=\"dijitInline dijitCalendarNextYear\"></span>\n\t\t\t\t</h3>\n\t\t\t</td>\n\t\t</tr>\n\t</tfoot>\n</table>"}});
define("dojox/widget/MultiSelectCalendar", ["dojo/main", "dijit", "dojo/text!./MultiSelectCalendar/MultiSelectCalendar.html", "dojo/cldr/supplemental", "dojo/date", "dojo/date/locale", "dijit/_Widget", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin", "dijit/_CssStateMixin", "dijit/form/DropDownButton", "dijit/typematic"], function (dojo, dijit, template, supplemental, date, locale, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, DropDownButton, typematic) {
    dojo.experimental("dojox.widget.MultiSelectCalendar");
    var MultiSelectCalendar = dojo.declare("dojox.widget.MultiSelectCalendar", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin], {templateString:template, widgetsInTemplate:true, value:{}, datePackage:"dojo.date", dayWidth:"narrow", tabIndex:"0", returnIsoRanges:false, currentFocus:new Date(), baseClass:"dijitCalendar", cssStateNodes:{"decrementMonth":"dijitCalendarArrow", "incrementMonth":"dijitCalendarArrow", "previousYearLabelNode":"dijitCalendarPreviousYear", "nextYearLabelNode":"dijitCalendarNextYear"}, _areValidDates:function (value) {
        for (var selDate in this.value) {
            valid = (selDate && !isNaN(selDate) && typeof value == "object" && selDate.toString() != this.constructor.prototype.value.toString());
            if (!valid) {
                return false;
            }
        }
        return true;
    }, _getValueAttr:function () {
        if (this.returnIsoRanges) {
            datesWithRanges = this._returnDatesWithIsoRanges(this._sort());
            return datesWithRanges;
        } else {
            return this._sort();
        }
    }, _setValueAttr:function (value, priorityChange) {
        this.value = {};
        if (dojo.isArray(value)) {
            dojo.forEach(value, function (element, i) {
                var slashPosition = element.indexOf("/");
                if (slashPosition == -1) {
                    this.value[element] = 1;
                } else {
                    var dateA = dojo.date.stamp.fromISOString(element.substr(0, 10));
                    var dateB = dojo.date.stamp.fromISOString(element.substr(11, 10));
                    this.toggleDate(dateA, [], []);
                    if ((dateA - dateB) > 0) {
                        this._addToRangeRTL(dateA, dateB, [], []);
                    } else {
                        this._addToRangeLTR(dateA, dateB, [], []);
                    }
                }
            }, this);
            if (value.length > 0) {
                this.focusOnLastDate(value[value.length - 1]);
            }
        } else {
            if (value) {
                value = new this.dateClassObj(value);
            }
            if (this._isValidDate(value)) {
                value.setHours(1, 0, 0, 0);
                if (!this.isDisabledDate(value, this.lang)) {
                    dateIndex = dojo.date.stamp.toISOString(value).substring(0, 10);
                    this.value[dateIndex] = 1;
                    this.set("currentFocus", value);
                    if (priorityChange || typeof priorityChange == "undefined") {
                        this.onChange(this.get("value"));
                        this.onValueSelected(this.get("value"));
                    }
                }
            }
        }
        this._populateGrid();
    }, focusOnLastDate:function (lastElement) {
        var slashPositionLastDate = lastElement.indexOf("/");
        var dateA, dateB;
        if (slashPositionLastDate == -1) {
            lastDate = lastElement;
        } else {
            dateA = new dojo.date.stamp.fromISOString(lastElement.substr(0, 10));
            dateB = new dojo.date.stamp.fromISOString(lastElement.substr(11, 10));
            if ((dateA - dateB) > 0) {
                lastDate = dateA;
            } else {
                lastDate = dateB;
            }
        }
        this.set("currentFocus", lastDate);
    }, _isValidDate:function (value) {
        return value && !isNaN(value) && typeof value == "object" && value.toString() != this.constructor.prototype.value.toString();
    }, _setText:function (node, text) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
        node.appendChild(dojo.doc.createTextNode(text));
    }, _populateGrid:function () {
        var month = new this.dateClassObj(this.currentFocus);
        month.setDate(1);
        var firstDay = month.getDay(), daysInMonth = this.dateFuncObj.getDaysInMonth(month), daysInPreviousMonth = this.dateFuncObj.getDaysInMonth(this.dateFuncObj.add(month, "month", -1)), today = new this.dateClassObj(), dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
        if (dayOffset > firstDay) {
            dayOffset -= 7;
        }
        this.listOfNodes = dojo.query(".dijitCalendarDateTemplate", this.domNode);
        this.listOfNodes.forEach(function (template, i) {
            i += dayOffset;
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
                date = this.dateFuncObj.add(date, "month", adj);
            }
            date.setDate(number);
            if (!this.dateFuncObj.compare(date, today, "date")) {
                clazz = "dijitCalendarCurrentDate " + clazz;
            }
            dateIndex = dojo.date.stamp.toISOString(date).substring(0, 10);
            if (!this.isDisabledDate(date, this.lang)) {
                if (this._isSelectedDate(date, this.lang)) {
                    if (this.value[dateIndex]) {
                        clazz = "dijitCalendarSelectedDate " + clazz;
                    } else {
                        clazz = clazz.replace("dijitCalendarSelectedDate ", "");
                    }
                }
            }
            if (this._isSelectedDate(date, this.lang)) {
                clazz = "dijitCalendarBrowsingDate " + clazz;
            }
            if (this.isDisabledDate(date, this.lang)) {
                clazz = "dijitCalendarDisabledDate " + clazz;
            }
            var clazz2 = this.getClassForDate(date, this.lang);
            if (clazz2) {
                clazz = clazz2 + " " + clazz;
            }
            template.className = clazz + "Month dijitCalendarDateTemplate";
            template.dijitDateValue = date.valueOf();
            dojo.attr(template, "dijitDateValue", date.valueOf());
            var label = dojo.query(".dijitCalendarDateLabel", template)[0], text = date.getDateLocalized ? date.getDateLocalized(this.lang) : date.getDate();
            this._setText(label, text);
        }, this);
        var monthNames = this.dateLocaleModule.getNames("months", "wide", "standAlone", this.lang, month);
        this.monthDropDownButton.dropDown.set("months", monthNames);
        this.monthDropDownButton.containerNode.innerHTML = (dojo.isIE == 6 ? "" : "<div class='dijitSpacer'>" + this.monthDropDownButton.dropDown.domNode.innerHTML + "</div>") + "<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" + monthNames[month.getMonth()] + "</div>";
        var y = month.getFullYear() - 1;
        var d = new this.dateClassObj();
        dojo.forEach(["previous", "current", "next"], function (name) {
            d.setFullYear(y++);
            this._setText(this[name + "YearLabelNode"], this.dateLocaleModule.format(d, {selector:"year", locale:this.lang}));
        }, this);
    }, goToToday:function () {
        this.set("currentFocus", new this.dateClassObj(), false);
    }, constructor:function (args) {
        var dateClass = (args.datePackage && (args.datePackage != "dojo.date")) ? args.datePackage + ".Date" : "Date";
        this.dateClassObj = dojo.getObject(dateClass, false);
        this.datePackage = args.datePackage || this.datePackage;
        this.dateFuncObj = dojo.getObject(this.datePackage, false);
        this.dateLocaleModule = dojo.getObject(this.datePackage + ".locale", false);
    }, buildRendering:function () {
        this.inherited(arguments);
        dojo.setSelectable(this.domNode, false);
        var cloneClass = dojo.hitch(this, function (clazz, n) {
            var template = dojo.query(clazz, this.domNode)[0];
            for (var i = 0; i < n; i++) {
                template.parentNode.appendChild(template.cloneNode(true));
            }
        });
        cloneClass(".dijitCalendarDayLabelTemplate", 6);
        cloneClass(".dijitCalendarDateTemplate", 6);
        cloneClass(".dijitCalendarWeekTemplate", 5);
        var dayNames = this.dateLocaleModule.getNames("days", this.dayWidth, "standAlone", this.lang);
        var dayOffset = dojo.cldr.supplemental.getFirstDayOfWeek(this.lang);
        dojo.query(".dijitCalendarDayLabel", this.domNode).forEach(function (label, i) {
            this._setText(label, dayNames[(i + dayOffset) % 7]);
        }, this);
        var dateObj = new this.dateClassObj(this.currentFocus);
        this.monthDropDownButton.dropDown = new MonthDropDown({id:this.id + "_mdd", onChange:dojo.hitch(this, "_onMonthSelect")});
        this.set("currentFocus", dateObj, false);
        var _this = this;
        var typematic = function (nodeProp, dateProp, adj) {
            _this._connects.push(dijit.typematic.addMouseListener(_this[nodeProp], _this, function (count) {
                if (count >= 0) {
                    _this._adjustDisplay(dateProp, adj);
                }
            }, 0.8, 500));
        };
        typematic("incrementMonth", "month", 1);
        typematic("decrementMonth", "month", -1);
        typematic("nextYearLabelNode", "year", 1);
        typematic("previousYearLabelNode", "year", -1);
    }, _adjustDisplay:function (part, amount) {
        this._setCurrentFocusAttr(this.dateFuncObj.add(this.currentFocus, part, amount));
    }, _setCurrentFocusAttr:function (date, forceFocus) {
        var oldFocus = this.currentFocus, oldCell = oldFocus ? dojo.query("[dijitDateValue=" + oldFocus.valueOf() + "]", this.domNode)[0] : null;
        date = new this.dateClassObj(date);
        date.setHours(1, 0, 0, 0);
        this._set("currentFocus", date);
        var currentMonth = dojo.date.stamp.toISOString(date).substring(0, 7);
        if (currentMonth != this.previousMonth) {
            this._populateGrid();
            this.previousMonth = currentMonth;
        }
        var newCell = dojo.query("[dijitDateValue='" + date.valueOf() + "']", this.domNode)[0];
        newCell.setAttribute("tabIndex", this.tabIndex);
        if (this._focused || forceFocus) {
            newCell.focus();
        }
        if (oldCell && oldCell != newCell) {
            if (dojo.isWebKit) {
                oldCell.setAttribute("tabIndex", "-1");
            } else {
                oldCell.removeAttribute("tabIndex");
            }
        }
    }, focus:function () {
        this._setCurrentFocusAttr(this.currentFocus, true);
    }, _onMonthSelect:function (newMonth) {
        this.currentFocus = this.dateFuncObj.add(this.currentFocus, "month", newMonth - this.currentFocus.getMonth());
        this._populateGrid();
    }, toggleDate:function (dateToToggle, selectedDates, unselectedDates) {
        var dateIndex = dojo.date.stamp.toISOString(dateToToggle).substring(0, 10);
        if (this.value[dateIndex]) {
            this.unselectDate(dateToToggle, unselectedDates);
        } else {
            this.selectDate(dateToToggle, selectedDates);
        }
    }, selectDate:function (dateToSelect, selectedDates) {
        var node = this._getNodeByDate(dateToSelect);
        var clazz = node.className;
        var dateIndex = dojo.date.stamp.toISOString(dateToSelect).substring(0, 10);
        this.value[dateIndex] = 1;
        selectedDates.push(dateIndex);
        clazz = "dijitCalendarSelectedDate " + clazz;
        node.className = clazz;
    }, unselectDate:function (dateToUnselect, unselectedDates) {
        var node = this._getNodeByDate(dateToUnselect);
        var clazz = node.className;
        var dateIndex = dojo.date.stamp.toISOString(dateToUnselect).substring(0, 10);
        delete (this.value[dateIndex]);
        unselectedDates.push(dateIndex);
        clazz = clazz.replace("dijitCalendarSelectedDate ", "");
        node.className = clazz;
    }, _getNodeByDate:function (dateNode) {
        var firstDate = new this.dateClassObj(this.listOfNodes[0].dijitDateValue);
        var difference = Math.abs(dojo.date.difference(firstDate, dateNode, "day"));
        return this.listOfNodes[difference];
    }, _onDayClick:function (evt) {
        dojo.stopEvent(evt);
        for (var node = evt.target; node && !node.dijitDateValue; node = node.parentNode) {
        }
        if (node && !dojo.hasClass(node, "dijitCalendarDisabledDate")) {
            value = new this.dateClassObj(node.dijitDateValue);
            if (!this.rangeJustSelected) {
                this.toggleDate(value, [], []);
                this.previouslySelectedDay = value;
                this.set("currentFocus", value);
                this.onValueSelected([dojo.date.stamp.toISOString(value).substring(0, 10)]);
            } else {
                this.rangeJustSelected = false;
                this.set("currentFocus", value);
            }
        }
    }, _onDayMouseOver:function (evt) {
        var node = dojo.hasClass(evt.target, "dijitCalendarDateLabel") ? evt.target.parentNode : evt.target;
        if (node && (node.dijitDateValue || node == this.previousYearLabelNode || node == this.nextYearLabelNode)) {
            dojo.addClass(node, "dijitCalendarHoveredDate");
            this._currentNode = node;
        }
    }, _setEndRangeAttr:function (value) {
        value = new this.dateClassObj(value);
        value.setHours(1);
        this.endRange = value;
    }, _getEndRangeAttr:function () {
        var value = new this.dateClassObj(this.endRange);
        value.setHours(0, 0, 0, 0);
        if (value.getDate() < this.endRange.getDate()) {
            value = this.dateFuncObj.add(value, "hour", 1);
        }
        return value;
    }, _onDayMouseOut:function (evt) {
        if (!this._currentNode) {
            return;
        }
        if (evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode) {
            return;
        }
        var cls = "dijitCalendarHoveredDate";
        if (dojo.hasClass(this._currentNode, "dijitCalendarActiveDate")) {
            cls += " dijitCalendarActiveDate";
        }
        dojo.removeClass(this._currentNode, cls);
        this._currentNode = null;
    }, _onDayMouseDown:function (evt) {
        var node = evt.target.parentNode;
        if (node && node.dijitDateValue) {
            dojo.addClass(node, "dijitCalendarActiveDate");
            this._currentNode = node;
        }
        if (evt.shiftKey && this.previouslySelectedDay) {
            this.selectingRange = true;
            this.set("endRange", node.dijitDateValue);
            this._selectRange();
        } else {
            this.selectingRange = false;
            this.previousRangeStart = null;
            this.previousRangeEnd = null;
        }
    }, _onDayMouseUp:function (evt) {
        var node = evt.target.parentNode;
        if (node && node.dijitDateValue) {
            dojo.removeClass(node, "dijitCalendarActiveDate");
        }
    }, handleKey:function (evt) {
        var dk = dojo.keys, increment = -1, interval, newValue = this.currentFocus;
        switch (evt.keyCode) {
          case dk.RIGHT_ARROW:
            increment = 1;
          case dk.LEFT_ARROW:
            interval = "day";
            if (!this.isLeftToRight()) {
                increment *= -1;
            }
            break;
          case dk.DOWN_ARROW:
            increment = 1;
          case dk.UP_ARROW:
            interval = "week";
            break;
          case dk.PAGE_DOWN:
            increment = 1;
          case dk.PAGE_UP:
            interval = evt.ctrlKey || evt.altKey ? "year" : "month";
            break;
          case dk.END:
            newValue = this.dateFuncObj.add(newValue, "month", 1);
            interval = "day";
          case dk.HOME:
            newValue = new this.dateClassObj(newValue);
            newValue.setDate(1);
            break;
          case dk.ENTER:
          case dk.SPACE:
            if (evt.shiftKey && this.previouslySelectedDay) {
                this.selectingRange = true;
                this.set("endRange", newValue);
                this._selectRange();
            } else {
                this.selectingRange = false;
                this.toggleDate(newValue, [], []);
                this.previouslySelectedDay = newValue;
                this.previousRangeStart = null;
                this.previousRangeEnd = null;
                this.onValueSelected([dojo.date.stamp.toISOString(newValue).substring(0, 10)]);
            }
            break;
          default:
            return true;
        }
        if (interval) {
            newValue = this.dateFuncObj.add(newValue, interval, increment);
        }
        this.set("currentFocus", newValue);
        return false;
    }, _onKeyDown:function (evt) {
        if (!this.handleKey(evt)) {
            dojo.stopEvent(evt);
        }
    }, _removeFromRangeLTR:function (beginning, end, selectedDates, unselectedDates) {
        difference = Math.abs(dojo.date.difference(beginning, end, "day"));
        for (var i = 0; i <= difference; i++) {
            var nextDay = dojo.date.add(beginning, "day", i);
            this.toggleDate(nextDay, selectedDates, unselectedDates);
        }
        if (this.previousRangeEnd == null) {
            this.previousRangeEnd = end;
        } else {
            if (dojo.date.compare(end, this.previousRangeEnd, "date") > 0) {
                this.previousRangeEnd = end;
            }
        }
        if (this.previousRangeStart == null) {
            this.previousRangeStart = end;
        } else {
            if (dojo.date.compare(end, this.previousRangeStart, "date") > 0) {
                this.previousRangeStart = end;
            }
        }
        this.previouslySelectedDay = dojo.date.add(nextDay, "day", 1);
    }, _removeFromRangeRTL:function (beginning, end, selectedDates, unselectedDates) {
        difference = Math.abs(dojo.date.difference(beginning, end, "day"));
        for (var i = 0; i <= difference; i++) {
            var nextDay = dojo.date.add(beginning, "day", -i);
            this.toggleDate(nextDay, selectedDates, unselectedDates);
        }
        if (this.previousRangeEnd == null) {
            this.previousRangeEnd = end;
        } else {
            if (dojo.date.compare(end, this.previousRangeEnd, "date") < 0) {
                this.previousRangeEnd = end;
            }
        }
        if (this.previousRangeStart == null) {
            this.previousRangeStart = end;
        } else {
            if (dojo.date.compare(end, this.previousRangeStart, "date") < 0) {
                this.previousRangeStart = end;
            }
        }
        this.previouslySelectedDay = dojo.date.add(nextDay, "day", -1);
    }, _addToRangeRTL:function (beginning, end, selectedDates, unselectedDates) {
        difference = Math.abs(dojo.date.difference(beginning, end, "day"));
        for (var i = 1; i <= difference; i++) {
            var nextDay = dojo.date.add(beginning, "day", -i);
            this.toggleDate(nextDay, selectedDates, unselectedDates);
        }
        if (this.previousRangeStart == null) {
            this.previousRangeStart = end;
        } else {
            if (dojo.date.compare(end, this.previousRangeStart, "date") < 0) {
                this.previousRangeStart = end;
            }
        }
        if (this.previousRangeEnd == null) {
            this.previousRangeEnd = beginning;
        } else {
            if (dojo.date.compare(beginning, this.previousRangeEnd, "date") > 0) {
                this.previousRangeEnd = beginning;
            }
        }
        this.previouslySelectedDay = nextDay;
    }, _addToRangeLTR:function (beginning, end, selectedDates, unselectedDates) {
        difference = Math.abs(dojo.date.difference(beginning, end, "day"));
        for (var i = 1; i <= difference; i++) {
            var nextDay = dojo.date.add(beginning, "day", i);
            this.toggleDate(nextDay, selectedDates, unselectedDates);
        }
        if (this.previousRangeStart == null) {
            this.previousRangeStart = beginning;
        } else {
            if (dojo.date.compare(beginning, this.previousRangeStart, "date") < 0) {
                this.previousRangeStart = beginning;
            }
        }
        if (this.previousRangeEnd == null) {
            this.previousRangeEnd = end;
        } else {
            if (dojo.date.compare(end, this.previousRangeEnd, "date") > 0) {
                this.previousRangeEnd = end;
            }
        }
        this.previouslySelectedDay = nextDay;
    }, _selectRange:function () {
        var selectedDates = [];
        var unselectedDates = [];
        var beginning = this.previouslySelectedDay;
        var end = this.get("endRange");
        if (!this.previousRangeStart && !this.previousRangeEnd) {
            removingFromRange = false;
        } else {
            if ((dojo.date.compare(end, this.previousRangeStart, "date") < 0) || (dojo.date.compare(end, this.previousRangeEnd, "date") > 0)) {
                removingFromRange = false;
            } else {
                removingFromRange = true;
            }
        }
        if (removingFromRange == true) {
            if (dojo.date.compare(end, beginning, "date") < 0) {
                this._removeFromRangeRTL(beginning, end, selectedDates, unselectedDates);
            } else {
                this._removeFromRangeLTR(beginning, end, selectedDates, unselectedDates);
            }
        } else {
            if (dojo.date.compare(end, beginning, "date") < 0) {
                this._addToRangeRTL(beginning, end, selectedDates, unselectedDates);
            } else {
                this._addToRangeLTR(beginning, end, selectedDates, unselectedDates);
            }
        }
        if (selectedDates.length > 0) {
            this.onValueSelected(selectedDates);
        }
        if (unselectedDates.length > 0) {
            this.onValueUnselected(unselectedDates);
        }
        this.rangeJustSelected = true;
    }, onValueSelected:function (dates) {
    }, onValueUnselected:function (dates) {
    }, onChange:function (date) {
    }, _isSelectedDate:function (dateObject, locale) {
        dateIndex = dojo.date.stamp.toISOString(dateObject).substring(0, 10);
        return this.value[dateIndex];
    }, isDisabledDate:function (dateObject, locale) {
    }, getClassForDate:function (dateObject, locale) {
    }, _sort:function () {
        if (this.value == {}) {
            return [];
        }
        var selectedDates = [];
        for (var selDate in this.value) {
            selectedDates.push(selDate);
        }
        selectedDates.sort(function (a, b) {
            var dateA = new Date(a), dateB = new Date(b);
            return dateA - dateB;
        });
        return selectedDates;
    }, _returnDatesWithIsoRanges:function (selectedDates) {
        var returnDates = [];
        if (selectedDates.length > 1) {
            var weHaveRange = false, rangeCount = 0, startRange = null, lastDayRange = null, previousDate = dojo.date.stamp.fromISOString(selectedDates[0]);
            for (var i = 1; i < selectedDates.length + 1; i++) {
                currentDate = dojo.date.stamp.fromISOString(selectedDates[i]);
                if (weHaveRange) {
                    difference = Math.abs(dojo.date.difference(previousDate, currentDate, "day"));
                    if (difference == 1) {
                        lastDayRange = currentDate;
                    } else {
                        range = dojo.date.stamp.toISOString(startRange).substring(0, 10) + "/" + dojo.date.stamp.toISOString(lastDayRange).substring(0, 10);
                        returnDates.push(range);
                        weHaveRange = false;
                    }
                } else {
                    difference = Math.abs(dojo.date.difference(previousDate, currentDate, "day"));
                    if (difference == 1) {
                        weHaveRange = true;
                        startRange = previousDate;
                        lastDayRange = currentDate;
                    } else {
                        returnDates.push(dojo.date.stamp.toISOString(previousDate).substring(0, 10));
                    }
                }
                previousDate = currentDate;
            }
            return returnDates;
        } else {
            return selectedDates;
        }
    }});
    var MonthDropDown = MultiSelectCalendar._MonthDropDown = dojo.declare("dojox.widget._MonthDropDown", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {months:[], templateString:"<div class='dijitCalendarMonthMenu dijitMenu' " + "dojoAttachEvent='onclick:_onClick,onmouseover:_onMenuHover,onmouseout:_onMenuHover'></div>", _setMonthsAttr:function (months) {
        this.domNode.innerHTML = dojo.map(months, function (month, idx) {
            return month ? "<div class='dijitCalendarMonthLabel' month='" + idx + "'>" + month + "</div>" : "";
        }).join("");
    }, _onClick:function (evt) {
        this.onChange(dojo.attr(evt.target, "month"));
    }, onChange:function (month) {
    }, _onMenuHover:function (evt) {
        dojo.toggleClass(evt.target, "dijitCalendarMonthLabelHover", evt.type == "mouseover");
    }});
    return MultiSelectCalendar;
});

