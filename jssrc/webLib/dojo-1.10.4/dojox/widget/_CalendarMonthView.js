//>>built

require({cache:{"url:dojox/widget/Calendar/CalendarMonth.html":"<div class=\"dojoxCalendarMonthLabels\" style=\"left: 0px;\"  \n\tdojoAttachPoint=\"monthContainer\" dojoAttachEvent=\"onclick: onClick\">\n    <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: auto;\">\n        <tbody>\n            <tr class=\"dojoxCalendarMonthGroupTemplate\">\n                <td class=\"dojoxCalendarMonthTemplate\">\n                    <div class=\"dojoxCalendarMonthLabel\"></div>\n                </td>\n             </tr>\n        </tbody>\n    </table>\n</div>\n"}});
define("dojox/widget/_CalendarMonthView", ["dojo/_base/declare", "./_CalendarView", "dijit/_TemplatedMixin", "./_CalendarMonthYearView", "dojo/dom-class", "dojo/_base/event", "dojo/text!./Calendar/CalendarMonth.html"], function (declare, _CalendarView, _TemplatedMixin, _CalendarMonthYearView, domClass, event, template) {
    return declare("dojox.widget._CalendarMonthView", [_CalendarView, _TemplatedMixin], {templateString:template, datePart:"year", headerClass:"dojoxCalendarMonthHeader", displayedYear:"", postCreate:function () {
        this.cloneClass(".dojoxCalendarMonthTemplate", 3);
        this.cloneClass(".dojoxCalendarMonthGroupTemplate", 2);
        this._populateMonths();
        this.addFx(".dojoxCalendarMonthLabel", this.domNode);
    }, _setValueAttr:function (value) {
        var year = this.header.innerHTML = value.getFullYear();
        this.set("displayedYear", year);
        this._populateMonths();
    }, _getMonthNames:_CalendarMonthYearView.prototype._getMonthNames, _populateMonths:_CalendarMonthYearView.prototype._populateMonths, onClick:function (evt) {
        if (!domClass.contains(evt.target, "dojoxCalendarMonthLabel")) {
            event.stop(evt);
            return;
        }
        var parentNode = evt.target.parentNode;
        var month = parentNode.cellIndex + (parentNode.parentNode.rowIndex * 4);
        var date = this.get("value");
        date.setMonth(month);
        date.setMonth(month);
        date.setYear(this.displayedYear);
        this.onValueSelected(date, month);
    }});
});

