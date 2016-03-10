//>>built

define("dojox/widget/MonthlyCalendar", ["dojo/_base/declare", "./_CalendarBase", "./_CalendarMonth"], function (declare, _CalendarBase, _CalendarMonth) {
    return declare("dojox.widget.MonthlyCalendar", [_CalendarBase, _CalendarMonth], {_makeDate:function (value) {
        var now = new Date();
        now.setMonth(value);
        return now;
    }});
});

