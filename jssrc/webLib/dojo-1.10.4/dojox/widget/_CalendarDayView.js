//>>built

require({cache:{"url:dojox/widget/Calendar/CalendarDay.html":"<div class=\"dijitCalendarDayLabels\" style=\"left: 0px;\" dojoAttachPoint=\"dayContainer\">\n\t<div dojoAttachPoint=\"header\">\n\t\t<div dojoAttachPoint=\"monthAndYearHeader\">\n\t\t\t<span dojoAttachPoint=\"monthLabelNode\" class=\"dojoxCalendarMonthLabelNode\"></span>\n\t\t\t<span dojoAttachPoint=\"headerComma\" class=\"dojoxCalendarComma\">,</span>\n\t\t\t<span dojoAttachPoint=\"yearLabelNode\" class=\"dojoxCalendarDayYearLabel\"></span>\n\t\t</div>\n\t</div>\n\t<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: auto;\">\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<td class=\"dijitCalendarDayLabelTemplate\"><div class=\"dijitCalendarDayLabel\"></div></td>\n\t\t\t</tr>\n\t\t</thead>\n\t\t<tbody dojoAttachEvent=\"onclick: _onDayClick\">\n\t\t\t<tr class=\"dijitCalendarWeekTemplate\">\n\t\t\t\t<td class=\"dojoxCalendarNextMonth dijitCalendarDateTemplate\">\n\t\t\t\t\t<div class=\"dijitCalendarDateLabel\"></div>\n\t\t\t\t</td>\n\t\t\t</tr>\n\t\t</tbody>\n\t</table>\n</div>\n"}});
define("dojox/widget/_CalendarDayView", ["dojo/_base/declare", "./_CalendarView", "dijit/_TemplatedMixin", "dojo/query", "dojo/dom-class", "dojo/_base/event", "dojo/date", "dojo/date/locale", "dojo/text!./Calendar/CalendarDay.html", "dojo/cldr/supplemental", "dojo/NodeList-dom"], function (declare, _CalendarView, _TemplatedMixin, query, domClass, event, date, locale, template, supplemental) {
    return declare("dojox.widget._CalendarDayView", [_CalendarView, _TemplatedMixin], {templateString:template, datePart:"month", dayWidth:"narrow", postCreate:function () {
        this.cloneClass(".dijitCalendarDayLabelTemplate", 6);
        this.cloneClass(".dijitCalendarDateTemplate", 6);
        this.cloneClass(".dijitCalendarWeekTemplate", 5);
        var dayNames = locale.getNames("days", this.dayWidth, "standAlone", this.getLang());
        var dayOffset = supplemental.getFirstDayOfWeek(this.getLang());
        query(".dijitCalendarDayLabel", this.domNode).forEach(function (label, i) {
            this._setText(label, dayNames[(i + dayOffset) % 7]);
        }, this);
    }, onDisplay:function () {
        if (!this._addedFx) {
            this._addedFx = true;
            this.addFx(".dijitCalendarDateTemplate div", this.domNode);
        }
    }, _onDayClick:function (e) {
        if (typeof (e.target._date) == "undefined") {
            return;
        }
        var displayMonth = new Date(this.get("displayMonth"));
        var p = e.target.parentNode;
        var c = "dijitCalendar";
        var d = domClass.contains(p, c + "PreviousMonth") ? -1 : (domClass.contains(p, c + "NextMonth") ? 1 : 0);
        if (d) {
            displayMonth = date.add(displayMonth, "month", d);
        }
        displayMonth.setDate(e.target._date);
        if (this.isDisabledDate(displayMonth)) {
            event.stop(e);
            return;
        }
        this.parent._onDateSelected(displayMonth);
    }, _setValueAttr:function (value) {
        this._populateDays();
    }, _populateDays:function () {
        var currentDate = new Date(this.get("displayMonth"));
        currentDate.setDate(1);
        var firstDay = currentDate.getDay();
        var daysInMonth = date.getDaysInMonth(currentDate);
        var daysInPreviousMonth = date.getDaysInMonth(date.add(currentDate, "month", -1));
        var today = new Date();
        var selected = this.get("value");
        var dayOffset = supplemental.getFirstDayOfWeek(this.getLang());
        if (dayOffset > firstDay) {
            dayOffset -= 7;
        }
        var compareDate = date.compare;
        var templateCls = ".dijitCalendarDateTemplate";
        var selectedCls = "dijitCalendarSelectedDate";
        var oldDate = this._lastDate;
        var redrawRequired = oldDate == null || oldDate.getMonth() != currentDate.getMonth() || oldDate.getFullYear() != currentDate.getFullYear();
        this._lastDate = currentDate;
        if (!redrawRequired) {
            query(templateCls, this.domNode).removeClass(selectedCls).filter(function (node) {
                return node.className.indexOf("dijitCalendarCurrent") > -1 && node._date == selected.getDate();
            }).addClass(selectedCls);
            return;
        }
        query(templateCls, this.domNode).forEach(function (template, i) {
            i += dayOffset;
            var eachDate = new Date(currentDate);
            var number, clazz = "dijitCalendar", adj = 0;
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
                eachDate = date.add(eachDate, "month", adj);
            }
            eachDate.setDate(number);
            if (!compareDate(eachDate, today, "date")) {
                clazz = "dijitCalendarCurrentDate " + clazz;
            }
            if (!compareDate(eachDate, selected, "date") && !compareDate(eachDate, selected, "month") && !compareDate(eachDate, selected, "year")) {
                clazz = selectedCls + " " + clazz;
            }
            if (this.isDisabledDate(eachDate, this.getLang())) {
                clazz = " dijitCalendarDisabledDate " + clazz;
            }
            var clazz2 = this.getClassForDate(eachDate, this.getLang());
            if (clazz2) {
                clazz = clazz2 + " " + clazz;
            }
            template.className = clazz + "Month dijitCalendarDateTemplate";
            template.dijitDateValue = eachDate.valueOf();
            var label = query(".dijitCalendarDateLabel", template)[0];
            this._setText(label, eachDate.getDate());
            label._date = label.parentNode._date = eachDate.getDate();
        }, this);
        var monthNames = locale.getNames("months", "wide", "standAlone", this.getLang());
        this._setText(this.monthLabelNode, monthNames[currentDate.getMonth()]);
        this._setText(this.yearLabelNode, currentDate.getFullYear());
    }});
});

