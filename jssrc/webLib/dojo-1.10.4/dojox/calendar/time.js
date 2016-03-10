//>>built

define("dojox/calendar/time", ["dojo/_base/lang", "dojo/date", "dojo/cldr/supplemental", "dojo/date/stamp"], function (lang, date, cldr, stamp) {
    var time = {};
    time.newDate = function (obj, dateClassObj) {
        dateClassObj = dateClassObj || Date;
        var d;
        if (typeof (obj) == "number") {
            return new dateClassObj(obj);
        } else {
            if (obj.getTime) {
                return new dateClassObj(obj.getTime());
            } else {
                if (obj.toGregorian) {
                    d = obj.toGregorian();
                    if (dateClassObj !== Date) {
                        d = new dateClassObj(d.getTime());
                    }
                    return d;
                } else {
                    if (typeof obj == "string") {
                        d = stamp.fromISOString(obj);
                        if (d === null) {
                            throw new Error("Cannot parse date string (" + obj + "), specify a \"decodeDate\" function that translates this string into a Date object");
                        } else {
                            if (dateClassObj !== Date) {
                                d = new dateClassObj(d.getTime());
                            }
                        }
                        return d;
                    }
                }
            }
        }
    };
    time.floorToDay = function (d, reuse, dateClassObj) {
        dateClassObj = dateClassObj || Date;
        if (!reuse) {
            d = time.newDate(d, dateClassObj);
        }
        d.setHours(0, 0, 0, 0);
        return d;
    };
    time.floorToMonth = function (d, reuse, dateClassObj) {
        dateClassObj = dateClassObj || Date;
        if (!reuse) {
            d = time.newDate(d, dateClassObj);
        }
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    };
    time.floorToWeek = function (d, dateClassObj, dateModule, firstDayOfWeek, locale) {
        dateClassObj = dateClassObj || Date;
        dateModule = dateModule || date;
        var fd = firstDayOfWeek == undefined || firstDayOfWeek < 0 ? cldr.getFirstDayOfWeek(locale) : firstDayOfWeek;
        var day = d.getDay();
        if (day == fd) {
            return d;
        }
        return time.floorToDay(dateModule.add(d, "day", day > fd ? -day + fd : -day + fd - 7), true, dateClassObj);
    };
    time.floor = function (date, unit, steps, reuse, dateClassObj) {
        var d = time.floorToDay(date, reuse, dateClassObj);
        switch (unit) {
          case "week":
            return time.floorToWeek(d, firstDayOfWeek, dateModule, locale);
          case "minute":
            d.setHours(date.getHours());
            d.setMinutes(Math.floor(date.getMinutes() / steps) * steps);
            break;
          case "hour":
            d.setHours(Math.floor(date.getHours() / steps) * steps);
            break;
        }
        return d;
    };
    time.isStartOfDay = function (d, dateClassObj, dateModule) {
        dateModule = dateModule || date;
        return dateModule.compare(this.floorToDay(d, false, dateClassObj), d) == 0;
    };
    time.isToday = function (d, dateClassObj) {
        dateClassObj = dateClassObj || Date;
        var today = new dateClassObj();
        return d.getFullYear() == today.getFullYear() && d.getMonth() == today.getMonth() && d.getDate() == today.getDate();
    };
    time.isOverlapping = function (renderData, start1, end1, start2, end2, includeLimits) {
        if (start1 == null || start2 == null || end1 == null || end2 == null) {
            return false;
        }
        var cal = renderData.dateModule;
        if (includeLimits) {
            if (cal.compare(start1, end2) == 1 || cal.compare(start2, end1) == 1) {
                return false;
            }
        } else {
            if (cal.compare(start1, end2) != -1 || cal.compare(start2, end1) != -1) {
                return false;
            }
        }
        return true;
    };
    return time;
});

