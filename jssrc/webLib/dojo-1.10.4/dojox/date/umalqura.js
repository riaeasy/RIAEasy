//>>built

define("dojox/date/umalqura", ["..", "dojo/_base/lang", "dojo/date", "./umalqura/Date"], function (dojox, lang, dd, IDate) {
    var dumalqura = lang.getObject("date.umalqura", true, dojox);
    dumalqura.getDaysInMonth = function (month) {
        return month.getDaysInIslamicMonth(month.getMonth(), month.getFullYear());
    };
    dumalqura.compare = function (date1, date2, portion) {
        if (date1 instanceof IDate) {
            date1 = date1.toGregorian();
        }
        if (date2 instanceof IDate) {
            date2 = date2.toGregorian();
        }
        return dd.compare.apply(null, arguments);
    };
    dumalqura.add = function (date, interval, amount) {
        var newIslamDate = new IDate(date);
        switch (interval) {
          case "day":
            newIslamDate.setDate(date.getDate() + amount);
            break;
          case "weekday":
            var day = date.getDay();
            if (((day + amount) < 5) && ((day + amount) > 0)) {
                newIslamDate.setDate(date.getDate() + amount);
            } else {
                var adddays = 0, remdays = 0;
                if (day == 5) {
                    day = 4;
                    remdays = (amount > 0) ? -1 : 1;
                } else {
                    if (day == 6) {
                        day = 4;
                        remdays = (amount > 0) ? -2 : 2;
                    }
                }
                var add = (amount > 0) ? (5 - day - 1) : -day;
                var amountdif = amount - add;
                var div = parseInt(amountdif / 5);
                if (amountdif % 5 != 0) {
                    adddays = (amount > 0) ? 2 : -2;
                }
                adddays = adddays + div * 7 + amountdif % 5 + add;
                newIslamDate.setDate(date.getDate() + adddays + remdays);
            }
            break;
          case "year":
            newIslamDate.setFullYear(date.getFullYear() + amount);
            break;
          case "week":
            amount *= 7;
            newIslamDate.setDate(date.getDate() + amount);
            break;
          case "month":
            var month = date.getMonth();
            newIslamDate.setMonth(month + amount);
            break;
          case "hour":
            newIslamDate.setHours(date.getHours() + amount);
            break;
          case "minute":
            newIslamDate._addMinutes(amount);
            break;
          case "second":
            newIslamDate._addSeconds(amount);
            break;
          case "millisecond":
            newIslamDate._addMilliseconds(amount);
            break;
        }
        return newIslamDate;
    };
    dumalqura.difference = function (date1, date2, interval) {
        date2 = date2 || new IDate();
        interval = interval || "day";
        var yearDiff = date2.getFullYear() - date1.getFullYear();
        var delta = 1;
        switch (interval) {
          case "weekday":
            var days = Math.round(dumalqura.difference(date1, date2, "day"));
            var weeks = parseInt(dumalqura.difference(date1, date2, "week"));
            var mod = days % 7;
            if (mod == 0) {
                days = weeks * 5;
            } else {
                var adj = 0;
                var aDay = date1.getDay();
                var bDay = date2.getDay();
                weeks = parseInt(days / 7);
                mod = days % 7;
                var dtMark = new IDate(date1);
                dtMark.setDate(dtMark.getDate() + (weeks * 7));
                var dayMark = dtMark.getDay();
                if (days > 0) {
                    switch (true) {
                      case aDay == 5:
                        adj = -1;
                        break;
                      case aDay == 6:
                        adj = 0;
                        break;
                      case bDay == 5:
                        adj = -1;
                        break;
                      case bDay == 6:
                        adj = -2;
                        break;
                      case (dayMark + mod) > 5:
                        adj = -2;
                    }
                } else {
                    if (days < 0) {
                        switch (true) {
                          case aDay == 5:
                            adj = 0;
                            break;
                          case aDay == 6:
                            adj = 1;
                            break;
                          case bDay == 5:
                            adj = 2;
                            break;
                          case bDay == 6:
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
            var startdate = (date2.toGregorian() > date1.toGregorian()) ? date2 : date1;
            var enddate = (date2.toGregorian() > date1.toGregorian()) ? date1 : date2;
            var month1 = startdate.getMonth();
            var month2 = enddate.getMonth();
            if (yearDiff == 0) {
                delta = startdate.getMonth() - enddate.getMonth();
            } else {
                delta = 12 - month2;
                delta += month1;
                var i = enddate.getFullYear() + 1;
                var e = startdate.getFullYear();
                for (i; i < e; i++) {
                    delta += 12;
                }
            }
            if (date2.toGregorian() < date1.toGregorian()) {
                delta = -delta;
            }
            break;
          case "week":
            delta = parseInt(dumalqura.difference(date1, date2, "day") / 7);
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
            delta *= date2.toGregorian().getTime() - date1.toGregorian().getTime();
        }
        return Math.round(delta);
    };
    return dumalqura;
});

