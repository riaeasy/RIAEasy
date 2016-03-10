//>>built

define("dojox/date/hebrew/Date", ["dojo/_base/lang", "dojo/_base/declare", "./numerals"], function (lang, declare, numerals) {
    var HDate = declare("dojox.date.hebrew.Date", null, {_MONTH_LENGTH:[[30, 30, 30], [29, 29, 30], [29, 30, 30], [29, 29, 29], [30, 30, 30], [30, 30, 30], [29, 29, 29], [30, 30, 30], [29, 29, 29], [30, 30, 30], [29, 29, 29], [30, 30, 30], [29, 29, 29]], _MONTH_START:[[0, 0, 0], [30, 30, 30], [59, 59, 60], [88, 89, 90], [117, 118, 119], [147, 148, 149], [147, 148, 149], [176, 177, 178], [206, 207, 208], [235, 236, 237], [265, 266, 267], [294, 295, 296], [324, 325, 326], [353, 354, 355]], _LEAP_MONTH_START:[[0, 0, 0], [30, 30, 30], [59, 59, 60], [88, 89, 90], [117, 118, 119], [147, 148, 149], [177, 178, 179], [206, 207, 208], [236, 237, 238], [265, 266, 267], [295, 296, 297], [324, 325, 326], [354, 355, 356], [383, 384, 385]], _GREGORIAN_MONTH_COUNT:[[31, 31, 0, 0], [28, 29, 31, 31], [31, 31, 59, 60], [30, 30, 90, 91], [31, 31, 120, 121], [30, 30, 151, 152], [31, 31, 181, 182], [31, 31, 212, 213], [30, 30, 243, 244], [31, 31, 273, 274], [30, 30, 304, 305], [31, 31, 334, 335]], _date:0, _month:0, _year:0, _hours:0, _minutes:0, _seconds:0, _milliseconds:0, _day:0, constructor:function () {
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
                        this._year = this._month = this._date = this._hours = this._minutes = this._seconds = this._milliseconds = NaN;
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
                    if (this._month > 12) {
                        console.warn("the month is incorrect , set 0  " + this._month + "   " + this._year);
                        this._month = 0;
                    }
                    this._hours += arguments[3] || 0;
                    this._minutes += arguments[4] || 0;
                    this._seconds += arguments[5] || 0;
                    this._milliseconds += arguments[6] || 0;
                }
            }
        }
        this._setDay();
    }, getDate:function () {
        return this._date;
    }, getDateLocalized:function (locale) {
        return (locale || dojo.locale).match(/^he(?:-.+)?$/) ? numerals.getDayHebrewLetters(this._date) : this.getDate();
    }, getMonth:function () {
        return this._month;
    }, getFullYear:function () {
        return this._year;
    }, getHours:function () {
        return this._hours;
    }, getMinutes:function () {
        return this._minutes;
    }, getSeconds:function () {
        return this._seconds;
    }, getMilliseconds:function () {
        return this._milliseconds;
    }, setDate:function (date) {
        date = +date;
        var mdays;
        if (date > 0) {
            while (date > (mdays = this.getDaysInHebrewMonth(this._month, this._year))) {
                date -= mdays;
                this._month++;
                if (this._month >= 13) {
                    this._year++;
                    this._month -= 13;
                }
            }
        } else {
            while (date <= 0) {
                mdays = this.getDaysInHebrewMonth((this._month - 1) >= 0 ? (this._month - 1) : 12, ((this._month - 1) >= 0) ? this._year : this._year - 1);
                this._month--;
                if (this._month < 0) {
                    this._year--;
                    this._month += 13;
                }
                date += mdays;
            }
        }
        this._date = date;
        this._setDay();
        return this;
    }, setFullYear:function (year, month, date) {
        this._year = year = +year;
        if (!this.isLeapYear(year) && this._month == 5) {
            this._month++;
        }
        if (month !== undefined) {
            this.setMonth(month);
        }
        if (date !== undefined) {
            this.setDate(date);
        }
        var dnum = this.getDaysInHebrewMonth(this._month, this._year);
        if (dnum < this._date) {
            this._date = dnum;
        }
        this._setDay();
        return this;
    }, setMonth:function (month) {
        month = +month;
        if (!this.isLeapYear(this._year) && month == 5) {
            month++;
        }
        if (month >= 0) {
            while (month > 12) {
                this._year++;
                month -= 13;
                if (!this.isLeapYear(this._year) && month >= 5) {
                    month++;
                }
            }
        } else {
            while (month < 0) {
                this._year--;
                month += (!this.isLeapYear(this._year) && month < -7) ? 12 : 13;
            }
        }
        this._month = month;
        var dnum = this.getDaysInHebrewMonth(this._month, this._year);
        if (dnum < this._date) {
            this._date = dnum;
        }
        this._setDay();
        return this;
    }, setHours:function () {
        var hours_arg_no = arguments.length;
        var hours = 0;
        if (hours_arg_no >= 1) {
            hours = +arguments[0];
        }
        if (hours_arg_no >= 2) {
            this._minutes = +arguments[1];
        }
        if (hours_arg_no >= 3) {
            this._seconds = +arguments[2];
        }
        if (hours_arg_no == 4) {
            this._milliseconds = +arguments[3];
        }
        while (hours >= 24) {
            this._date++;
            var mdays = this.getDaysInHebrewMonth(this._month, this._year);
            if (this._date > mdays) {
                this._month++;
                if (!this.isLeapYear(this._year) && this._month == 5) {
                    this._month++;
                }
                if (this._month >= 13) {
                    this._year++;
                    this._month -= 13;
                }
                this._date -= mdays;
            }
            hours -= 24;
        }
        this._hours = hours;
        this._setDay();
        return this;
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
    }, _setDay:function () {
        var day = this._startOfYear(this._year);
        if (this._month != 0) {
            day += (this.isLeapYear(this._year) ? this._LEAP_MONTH_START : this._MONTH_START)[this._month || 0][this._yearType(this._year)];
        }
        day += this._date - 1;
        this._day = (day + 1) % 7;
    }, toString:function () {
        return isNaN(this._date) ? "Invalid Date" : this._date + ", " + this._month + ", " + this._year + "  " + this._hours + ":" + this._minutes + ":" + this._seconds;
    }, getDaysInHebrewMonth:function (month, year) {
        var yearType = (month == 1 || month == 2) ? this._yearType(year) : 0;
        return (!this.isLeapYear(this._year) && month == 5) ? 0 : this._MONTH_LENGTH[month][yearType];
    }, _yearType:function (year) {
        var yearLength = this._handleGetYearLength(Number(year));
        if (yearLength > 380) {
            yearLength -= 30;
        }
        var yearType = yearLength - 353;
        if (yearType < 0 || yearType > 2) {
            throw new Error("Illegal year length " + yearLength + " in year " + year);
        }
        return yearType;
    }, _handleGetYearLength:function (eyear) {
        return this._startOfYear(eyear + 1) - this._startOfYear(eyear);
    }, _startOfYear:function (year) {
        var months = Math.floor((235 * year - 234) / 19), frac = months * (12 * 1080 + 793) + 11 * 1080 + 204, day = months * 29 + Math.floor(frac / (24 * 1080));
        frac %= 24 * 1080;
        var wd = day % 7;
        if (wd == 2 || wd == 4 || wd == 6) {
            day += 1;
            wd = day % 7;
        }
        if (wd == 1 && frac > 15 * 1080 + 204 && !this.isLeapYear(year)) {
            day += 2;
        } else {
            if (wd == 0 && frac > 21 * 1080 + 589 && this.isLeapYear(year - 1)) {
                day += 1;
            }
        }
        return day;
    }, isLeapYear:function (year) {
        var x = (year * 12 + 17) % 19;
        return x >= ((x < 0) ? -7 : 12);
    }, fromGregorian:function (gdate) {
        var result = (!isNaN(gdate)) ? this._computeHebrewFields(gdate) : NaN;
        this._year = (!isNaN(gdate)) ? result[0] : NaN;
        this._month = (!isNaN(gdate)) ? result[1] : NaN;
        this._date = (!isNaN(gdate)) ? result[2] : NaN;
        this._hours = gdate.getHours();
        this._milliseconds = gdate.getMilliseconds();
        this._minutes = gdate.getMinutes();
        this._seconds = gdate.getSeconds();
        if (!isNaN(gdate)) {
            this._setDay();
        }
        return this;
    }, _computeHebrewFields:function (gdate) {
        var julianDay = this._getJulianDayFromGregorianDate(gdate), d = julianDay - 347997, m = Math.floor((d * 24 * 1080) / (29 * 24 * 1080 + 12 * 1080 + 793)), year = Math.floor((19 * m + 234) / 235) + 1, ys = this._startOfYear(year), dayOfYear = (d - ys);
        while (dayOfYear < 1) {
            year--;
            ys = this._startOfYear(year);
            dayOfYear = d - ys;
        }
        var typeofYear = this._yearType(year), monthStart = this.isLeapYear(year) ? this._LEAP_MONTH_START : this._MONTH_START, month = 0;
        while (dayOfYear > monthStart[month][typeofYear]) {
            month++;
        }
        month--;
        var dayOfMonth = dayOfYear - monthStart[month][typeofYear];
        return [year, month, dayOfMonth];
    }, toGregorian:function () {
        var hYear = this._year || 0, hMonth = this._month || 0, hDate = this._date || 0, day = this._startOfYear(hYear);
        if (hMonth != 0) {
            day += (this.isLeapYear(hYear) ? this._LEAP_MONTH_START : this._MONTH_START)[hMonth][this._yearType(hYear)];
        }
        var julianDay = (hDate + day + 347997), gregorianEpochDay = julianDay - 1721426;
        var rem = [];
        var n400 = this._floorDivide(gregorianEpochDay, 146097, rem), n100 = this._floorDivide(rem[0], 36524, rem), n4 = this._floorDivide(rem[0], 1461, rem), n1 = this._floorDivide(rem[0], 365, rem), year = 400 * n400 + 100 * n100 + 4 * n4 + n1, dayOfYear = rem[0];
        if (n100 == 4 || n1 == 4) {
            dayOfYear = 365;
        } else {
            ++year;
        }
        var isLeap = !(year % 4) && (year % 100 || !(year % 400)), correction = 0, march1 = isLeap ? 60 : 59;
        if (dayOfYear >= march1) {
            correction = isLeap ? 1 : 2;
        }
        var month = Math.floor((12 * (dayOfYear + correction) + 6) / 367);
        var dayOfMonth = dayOfYear - this._GREGORIAN_MONTH_COUNT[month][isLeap ? 3 : 2] + 1;
        return new Date(year, month, dayOfMonth, this._hours, this._minutes, this._seconds, this._milliseconds);
    }, _floorDivide:function (numerator, denominator, remainder) {
        if (numerator >= 0) {
            remainder[0] = (numerator % denominator);
            return Math.floor(numerator / denominator);
        }
        var quotient = Math.floor(numerator / denominator);
        remainder[0] = numerator - (quotient * denominator);
        return quotient;
    }, getDay:function () {
        var hYear = this._year, hMonth = this._month, hDate = this._date, day = this._startOfYear(hYear);
        if (hMonth != 0) {
            day += (this.isLeapYear(hYear) ? this._LEAP_MONTH_START : this._MONTH_START)[hMonth][this._yearType(hYear)];
        }
        day += hDate - 1;
        return (day + 1) % 7;
    }, _getJulianDayFromGregorianDate:function (gdate) {
        var year = gdate.getFullYear(), month = gdate.getMonth(), d = gdate.getDate(), isLeap = !(year % 4) && (year % 100 || !(year % 400)), y = year - 1;
        var julianDay = 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + 1721426 - 1;
        if (month > 0) {
            julianDay += this._GREGORIAN_MONTH_COUNT[month][isLeap ? 3 : 2];
        }
        julianDay += d;
        return julianDay;
    }});
    HDate.prototype.valueOf = function () {
        return this.toGregorian().valueOf();
    };
    return HDate;
});

