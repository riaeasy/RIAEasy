//>>built

require({cache:{"url:dojox/widget/Calendar/CalendarYear.html":"<div class=\"dojoxCalendarYearLabels\" style=\"left: 0px;\" dojoAttachPoint=\"yearContainer\">\n    <table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"margin: auto;\" dojoAttachEvent=\"onclick: onClick\">\n        <tbody>\n            <tr class=\"dojoxCalendarYearGroupTemplate\">\n                <td class=\"dojoxCalendarNextMonth dojoxCalendarYearTemplate\">\n                    <div class=\"dojoxCalendarYearLabel\">\n                    </div>\n                </td>\n            </tr>\n        </tbody>\n    </table>\n</div>\n"}});
define("dojox/widget/_CalendarYearView", ["dojo/_base/declare", "./_CalendarView", "dijit/_TemplatedMixin", "dojo/date", "dojo/dom-class", "dojo/_base/event", "dojo/text!./Calendar/CalendarYear.html", "./_CalendarMonthYearView"], function (declare, _CalendarView, _TemplatedMixin, dojoDate, domClass, event, template, _CalendarMonthYearView) {
    return declare("dojox.widget._CalendarYearView", [_CalendarView, _TemplatedMixin], {templateString:template, displayedYears:6, postCreate:function () {
        this.cloneClass(".dojoxCalendarYearTemplate", 3);
        this.cloneClass(".dojoxCalendarYearGroupTemplate", 2);
        this._populateYears();
        this.addFx(".dojoxCalendarYearLabel", this.domNode);
    }, _setValueAttr:function (value) {
        this._populateYears(value.getFullYear());
    }, _populateYears:_CalendarMonthYearView.prototype._populateYears, adjustDate:function (date, amount) {
        return dojoDate.add(date, "year", amount * 12);
    }, onClick:function (evt) {
        if (!domClass.contains(evt.target, "dojoxCalendarYearLabel")) {
            event.stop(evt);
            return;
        }
        var year = Number(evt.target.innerHTML);
        var date = this.get("value");
        date.setYear(year);
        this.onValueSelected(date, year);
    }});
});

