//>>built

define("dojo/date", ["./has", "./_base/lang"], function (has, lang) {
    var date = {};
    date.getDaysInMonth = function (dateObject) {
        var month = dateObject.getMonth();
        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (month == 1 && date.isLeapYear(dateObject)) {
            return 29;
        }
        return days[month];
    };
    date.isLeapYear = function (dateObject) {
        var year = dateObject.getFullYear();
        return !(year % 400) || (!(year % 4) && !!(year % 100));
    };
    date.getTimezoneName = function (dateObject) {
        var str = dateObject.toString();
        var tz = "";
        var match;
        var pos = str.indexOf("(");
        if (pos > -1) {
            tz = str.substring(++pos, str.indexOf(")"));
        } else {
            var pat = /([A-Z\/]+) \d{4}$/;
            if ((match = str.match(pat))) {
                tz = match[1];
            } else {
                str = dateObject.toLocaleString();
                pat = / ([A-Z\/]+)$/;
                if ((match = str.match(pat))) {
                    tz = match[1];
                }
            }
        }
        return (tz == "AM" || tz == "PM") ? "" : tz;
    };
    date.compare = function (date1, date2, portion) {
        date1 = new Date(+date1);
        date2 = new Date(+(date2 || new Date()));
        if (portion == "date") {
            date1.setHours(0, 0, 0, 0);
            date2.setHours(0, 0, 0, 0);
        } else {
            if (portion == "time") {
                date1.setFullYear(0, 0, 0);
                date2.setFullYear(0, 0, 0);
            }
        }
        if (date1 > date2) {
            return 1;
        }
        if (date1 < date2) {
            return -1;
        }
        return 0;
    };
    date.add = function (date, interval, amount) {
        var sum = new Date(+date);
        var fixOvershoot = false;
        var property = "Date";
        switch (interval) {
          case "day":
            break;
          case "weekday":
            var days, weeks;
            var mod = amount % 5;
            if (!mod) {
                days = (amount > 0) ? 5 : -5;
                weeks = (amount > 0) ? ((amount - 5) / 5) : ((amount + 5) / 5);
            } else {
                days = mod;
                weeks = parseInt(amount / 5);
            }
            var strt = date.getDay();
            var adj = 0;
            if (strt == 6 && amount > 0) {
                adj = 1;
            } else {
                if (strt == 0 && amount < 0) {
                    adj = -1;
                }
            }
            var trgt = strt + days;
            if (trgt == 0 || trgt == 6) {
                adj = (amount > 0) ? 2 : -2;
            }
            amount = (7 * weeks) + days + adj;
            break;
          case "year":
            property = "FullYear";
            fixOvershoot = true;
            break;
          case "week":
            amount *= 7;
            break;
          case "quarter":
            amount *= 3;
          case "month":
            fixOvershoot = true;
            property = "Month";
            break;
          default:
            property = "UTC" + interval.charAt(0).toUpperCase() + interval.substring(1) + "s";
        }
        if (property) {
            sum["set" + property](sum["get" + property]() + amount);
        }
        if (fixOvershoot && (sum.getDate() < date.getDate())) {
            sum.setDate(0);
        }
        return sum;
    };
    date.difference = function (date1, date2, interval) {
        date2 = date2 || new Date();
        interval = interval || "day";
        var yearDiff = date2.getFullYear() - date1.getFullYear();
        var delta = 1;
        switch (interval) {
          case "quarter":
            var m1 = date1.getMonth();
            var m2 = date2.getMonth();
            var q1 = Math.floor(m1 / 3) + 1;
            var q2 = Math.floor(m2 / 3) + 1;
            q2 += (yearDiff * 4);
            delta = q2 - q1;
            break;
          case "weekday":
            var days = Math.round(date.difference(date1, date2, "day"));
            var weeks = parseInt(date.difference(date1, date2, "week"));
            var mod = days % 7;
            if (mod == 0) {
                days = weeks * 5;
            } else {
                var adj = 0;
                var aDay = date1.getDay();
                var bDay = date2.getDay();
                weeks = parseInt(days / 7);
                mod = days % 7;
                var dtMark = new Date(date1);
                dtMark.setDate(dtMark.getDate() + (weeks * 7));
                var dayMark = dtMark.getDay();
                if (days > 0) {
                    switch (true) {
                      case aDay == 6:
                        adj = -1;
                        break;
                      case aDay == 0:
                        adj = 0;
                        break;
                      case bDay == 6:
                        adj = -1;
                        break;
                      case bDay == 0:
                        adj = -2;
                        break;
                      case (dayMark + mod) > 5:
                        adj = -2;
                    }
                } else {
                    if (days < 0) {
                        switch (true) {
                          case aDay == 6:
                            adj = 0;
                            break;
                          case aDay == 0:
                            adj = 1;
                            break;
                          case bDay == 6:
                            adj = 2;
                            break;
                          case bDay == 0:
                            adj = 1;
                            break;
                          case (dayMark + mod) < 0:
                            adj = 2;
                        }
                    }
                }
                days += adj;
                days -= (weeks * 2);
            }
            delta = days;
            break;
          case "year":
            delta = yearDiff;
            break;
          case "month":
            delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
            break;
          case "week":
            delta = parseInt(date.difference(date1, date2, "day") / 7);
            break;
          case "day":
            delta /= 24;
          case "hour":
            delta /= 60;
          case "minute":
            delta /= 60;
          case "second":
            delta /= 1000;
          case "millisecond":
            delta *= date2.getTime() - date1.getTime();
        }
        return Math.round(delta);
    };
    1 && lang.mixin(lang.getObject("dojo.date", true), date);
    return date;
});

