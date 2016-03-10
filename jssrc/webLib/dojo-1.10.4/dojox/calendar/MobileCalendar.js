//>>built

require({cache:{"url:dojox/calendar/templates/MobileCalendar.html":"<div>\n\t<div data-dojo-attach-point=\"viewContainer\" class=\"viewContainer\"></div>\n\t<div data-dojo-attach-point=\"buttonContainer\" class=\"buttonContainer\">\n\t\t\t<button data-dojo-attach-point=\"previousButton\" data-dojo-type=\"dojox.mobile.Button\" >\u25c4</button>\n\t\t\t<button data-dojo-attach-point=\"todayButton\" data-dojo-type=\"dojox.mobile.Button\" >Today</button>\n\t\t\t<button data-dojo-attach-point=\"dayButton\" data-dojo-type=\"dojox.mobile.Button\" >Day</button>\n\t\t\t<button data-dojo-attach-point=\"weekButton\" data-dojo-type=\"dojox.mobile.Button\" >Week</button>\t\t\t\n\t\t\t<button data-dojo-attach-point=\"monthButton\" data-dojo-type=\"dojox.mobile.Button\" >Month</button>\n\t\t<button data-dojo-attach-point=\"nextButton\" data-dojo-type=\"dojox.mobile.Button\" >\u25ba</button>\n\t</div>\n</div>\n"}});
define("dojox/calendar/MobileCalendar", ["dojo/_base/declare", "dojo/_base/lang", "./CalendarBase", "./ColumnView", "./ColumnViewSecondarySheet", "./MobileVerticalRenderer", "./MatrixView", "./MobileHorizontalRenderer", "./LabelRenderer", "./ExpandRenderer", "./Touch", "dojo/text!./templates/MobileCalendar.html", "dojox/mobile/Button"], function (declare, lang, CalendarBase, ColumnView, ColumnViewSecondarySheet, VerticalRenderer, MatrixView, HorizontalRenderer, LabelRenderer, ExpandRenderer, Touch, template) {
    return declare("dojox.calendar.MobileCalendar", CalendarBase, {templateString:template, _createDefaultViews:function () {
        var secondarySheetClass = declare([ColumnViewSecondarySheet, Touch]);
        var colView = declare([ColumnView, Touch])(lang.mixin({secondarySheetClass:secondarySheetClass, verticalRenderer:VerticalRenderer, horizontalRenderer:HorizontalRenderer, expandRenderer:ExpandRenderer}, this.columnViewProps));
        var matrixView = declare([MatrixView, Touch])(lang.mixin({horizontalRenderer:HorizontalRenderer, labelRenderer:LabelRenderer, expandRenderer:ExpandRenderer}, this.matrixViewProps));
        this.columnView = colView;
        this.matrixView = matrixView;
        var views = [colView, matrixView];
        this.installDefaultViewsActions(views);
        return views;
    }, installDefaultViewsActions:function (views) {
        this.matrixView.on("rowHeaderClick", lang.hitch(this, this.matrixViewRowHeaderClick));
        this.columnView.on("columnHeaderClick", lang.hitch(this, this.columnViewColumnHeaderClick));
    }});
});

