//>>built

define("dojox/date/persian/Date", ["dojo/_base/lang", "dojo/_base/declare", "dojo/date"], function (lang, declare, dd) {
    var IDate = declare("dojox.date.persian.Date", null, {_date:0, _month:0, _year:0, _hours:0, _minutes:0, _seconds:0, _milliseconds:0, _day:0, _GREGORIAN_EPOCH:1721425.5, _PERSIAN_EPOCH:1948320.5, daysInMonth:[31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29], constructor:function () {
        var len = arguments.length;
        if (!len) {
            this.fromGregorian(new Date());
        } else {
            if (len == 1) {
                var arg0 = arguments[0];
                if (typeof arg0 == "number") {
                    arg0 = new Date(arg0);
                }
                if (arg0 instanceof Date) {
                    this.fromGregorian(arg0);
                } else {
                    if (arg0 == "") {
                        this._date = new Date("");
                    } else {
                        this._year = arg0._year;
                        this._month = arg0._month;
                        this._date = arg0._date;
                        this._hours = arg0._hours;
                        this._minutes = arg0._minutes;
                        this._seconds = arg0._seconds;
                        this._milliseconds = arg0._milliseconds;
                    }
                }
            } else {
                if (len >= 3) {
                    this._year += arguments[0];
                    this._month += arguments[1];
                    this._date += arguments[2];
                    this._hours += arguments[3] || 0;
                    this._minutes += arguments[4] || 0;
                    this._seconds += arguments[5] || 0;
                    this._milliseconds += arguments[6] || 0;
                }
            }
        }
    }, getDate:function () {
        return this._date;
    }, getMonth:function () {
        return this._month;
    }, getFullYear:function () {
        return this._year;
    }, getDay:function () {
        return this.toGregorian().getDay();
    }, getHours:function () {
        return this._hours;
    }, getMinutes:function () {
        return this._minutes;
    }, getSeconds:function () {
        return this._seconds;
    }, getMilliseconds:function () {
        return this._milliseconds;
    }, setDate:function (date) {
        date = parseInt(date);
        if (date > 0 && date <= this.getDaysInPersianMonth(this._month, this._year)) {
            this._date = date;
        } else {
            var mdays;
            if (date > 0) {
                for (mdays = this.getDaysInPersianMonth(this._month, this._year); date > mdays; date -= mdays, mdays = this.getDaysInPersianMonth(this._month, this._year)) {
                    this._month++;
                    if (this._month >= 12) {
                        this._year++;
                        this._month -= 12;
                    }
                }
                this._date = date;
            } else {
                for (mdays = this.getDaysInPersianMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1); date <= 0; mdays = this.getDaysInPersianMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1)) {
                    this._month--;
                    if (this._month < 0) {
                        this._year--;
                        this._month += 12;
                    }
                    date += mdays;
                }
                this._date = date;
            }
        }
        return this;
    }, setFullYear:function (year) {
        this._year = +year;
    }, setMonth:function (month) {
        this._year += Math.floor(month / 12);
        if (month > 0) {
            this._month = Math.floor(month % 12);
        } else {
            this._month = Math.floor(((month % 12) + 12) % 12);
        }
    }, setHours:function () {
        var hours_arg_no = arguments.length;
        var hours = 0;
        if (hours_arg_no >= 1) {
            hours = parseInt(arguments[0]);
        }
        if (hours_arg_no >= 2) {
            this._minutes = parseInt(arguments[1]);
        }
        if (hours_arg_no >= 3) {
            this._seconds = parseInt(arguments[2]);
        }
        if (hours_arg_no == 4) {
            this._milliseconds = parseInt(arguments[3]);
        }
        while (hours >= 24) {
            this._date++;
            var mdays = this.getDaysInPersianMonth(this._month, this._year);
            if (this._date > mdays) {
                this._month++;
                if (this._month >= 12) {
                    this._year++;
                    this._month -= 12;
                }
                this._date -= mdays;
            }
            hours -= 24;
        }
        this._hours = hours;
    }, _addMinutes:function (minutes) {
        minutes += this._minutes;
        this.setMinutes(minutes);
        this.setHours(this._hours + parseInt(minutes / 60));
        return this;
    }, _addSeconds:function (seconds) {
        seconds += this._seconds;
        this.setSeconds(seconds);
        this._addMinutes(parseInt(seconds / 60));
        return this;
    }, _addMilliseconds:function (milliseconds) {
        milliseconds += this._milliseconds;
        this.setMilliseconds(milliseconds);
        this._addSeconds(parseInt(milliseconds / 1000));
        return this;
    }, setMinutes:function (minutes) {
        this._minutes = minutes % 60;
        return this;
    }, setSeconds:function (seconds) {
        this._seconds = seconds % 60;
        return this;
    }, setMilliseconds:function (milliseconds) {
        this._milliseconds = milliseconds % 1000;
        return this;
    }, toString:function () {
        if (isNaN(this._date)) {
            return "Invalidate Date";
        } else {
            var x = new Date();
            x.setHours(this._hours);
            x.setMinutes(this._minutes);
            x.setSeconds(this._seconds);
            x.setMilliseconds(this._milliseconds);
            return this._month + " " + this._date + " " + this._year + " " + x.toTimeString();
        }
    }, toGregorian:function () {
        var hYear = this._year;
        var date, j;
        j = this.persian_to_jd(this._year, this._month + 1, this._date);
        date = this.jd_to_gregorian(j, this._month + 1);
        weekday = this.jwday(j);
        var _21 = new Date(date[0], date[1] - 1, date[2], this._hours, this._minutes, this._seconds, this._milliseconds);
        return _21;
    }, fromGregorian:function (gdate) {
        var _23 = new Date(gdate);
        var _24 = _23.getFullYear(), _25 = _23.getMonth(), _26 = _23.getDate();
        var persian = this.calcGregorian(_24, _25, _26);
        this._date = persian[2];
        this._month = persian[1];
        this._year = persian[0];
        this._hours = _23.getHours();
        this._minutes = _23.getMinutes();
        this._seconds = _23.getSeconds();
        this._milliseconds = _23.getMilliseconds();
        this._day = _23.getDay();
        return this;
    }, calcGregorian:function (year, month, day) {
        var j, weekday;
        j = this.gregorian_to_jd(year, month + 1, day) + (Math.floor(0 + 60 * (0 + 60 * 0) + 0.5) / 86400);
        perscal = this.jd_to_persian(j);
        weekday = this.jwday(j);
        return new Array(perscal[0], perscal[1], perscal[2], weekday);
    }, jd_to_persian:function (jd) {
        var year, month, day, depoch, cycle, cyear, ycycle, aux1, aux2, yday;
        jd = Math.floor(jd) + 0.5;
        depoch = jd - this.persian_to_jd(475, 1, 1);
        cycle = Math.floor(depoch / 1029983);
        cyear = this._mod(depoch, 1029983);
        if (cyear == 1029982) {
            ycycle = 2820;
        } else {
            aux1 = Math.floor(cyear / 366);
            aux2 = this._mod(cyear, 366);
            ycycle = Math.floor(((2134 * aux1) + (2816 * aux2) + 2815) / 1028522) + aux1 + 1;
        }
        year = ycycle + (2820 * cycle) + 474;
        if (year <= 0) {
            year--;
        }
        yday = (jd - this.persian_to_jd(year, 1, 1)) + 1;
        month = (yday <= 186) ? Math.ceil(yday / 31) : Math.ceil((yday - 6) / 30);
        day = (jd - this.persian_to_jd(year, month, 1)) + 1;
        return new Array(year, month - 1, day);
    }, persian_to_jd:function (year, month, day) {
        var epbase, epyear;
        epbase = year - ((year >= 0) ? 474 : 473);
        epyear = 474 + this._mod(epbase, 2820);
        return day + ((month <= 7) ? ((month - 1) * 31) : (((month - 1) * 30) + 6)) + Math.floor(((epyear * 682) - 110) / 2816) + (epyear - 1) * 365 + Math.floor(epbase / 2820) * 1029983 + (this._PERSIAN_EPOCH - 1);
    }, gregorian_to_jd:function (year, month, day) {
        return (this._GREGORIAN_EPOCH - 1) + (365 * (year - 1)) + Math.floor((year - 1) / 4) + (-Math.floor((year - 1) / 100)) + Math.floor((year - 1) / 400) + Math.floor((((367 * month) - 362) / 12) + ((month <= 2) ? 0 : (this.leap_gregorian(year) ? -1 : -2)) + day);
    }, jd_to_gregorian:function (jd, jmonth) {
        var wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad, yindex, dyindex, year, yearday, leapadj;
        wjd = Math.floor(jd - 0.5) + 0.5;
        depoch = wjd - this._GREGORIAN_EPOCH;
        quadricent = Math.floor(depoch / 146097);
        dqc = this._mod(depoch, 146097);
        cent = Math.floor(dqc / 36524);
        dcent = this._mod(dqc, 36524);
        quad = Math.floor(dcent / 1461);
        dquad = this._mod(dcent, 1461);
        yindex = Math.floor(dquad / 365);
        year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
        if (!((cent == 4) || (yindex == 4))) {
            year++;
        }
        yearday = wjd - this.gregorian_to_jd(year, 1, 1);
        leapadj = ((wjd < this.gregorian_to_jd(year, 3, 1)) ? 0 : (this.leap_gregorian(year) ? 1 : 2));
        month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
        day = (wjd - this.gregorian_to_jd(year, month, 1)) + 1;
        return new Array(year, month, day);
    }, valueOf:function () {
        return this.toGregorian().valueOf();
    }, jwday:function (j) {
        return this._mod(Math.floor((j + 1.5)), 7);
    }, _yearStart:function (year) {
        return (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
    }, _monthStart:function (year, month) {
        return Math.ceil(29.5 * month) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
    }, leap_gregorian:function (year) {
        return ((year % 4) == 0) && (!(((year % 100) == 0) && ((year % 400) != 0)));
    }, isLeapYear:function (j_y, j_m, j_d) {
        return !(j_y < 0 || j_y > 32767 || j_m < 1 || j_m > 12 || j_d < 1 || j_d > (this.daysInMonth[j_m - 1] + (j_m == 12 && !((j_y - 979) % 33 % 4))));
    }, getDaysInPersianMonth:function (month, year) {
        var days = this.daysInMonth[month];
        if (month == 11 && this.isLeapYear(year, month + 1, 30)) {
            days++;
        }
        return days;
    }, _mod:function (a, b) {
        return a - (b * Math.floor(a / b));
    }});
    IDate.getDaysInPersianMonth = function (month) {
        return new IDate().getDaysInPersianMonth(month.getMonth(), month.getFullYear());
    };
    return IDate;
});

