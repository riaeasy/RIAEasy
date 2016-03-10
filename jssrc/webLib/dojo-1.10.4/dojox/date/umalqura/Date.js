//>>built

define("dojox/date/umalqura/Date", ["dojo/_base/lang", "dojo/_base/declare", "dojo/date", "../islamic/Date"], function (lang, declare, dd) {
    var IDate = declare("dojox.date.umalqura.Date", null, {_MONTH_LENGTH:["010100101011", "011010010011", "010110110101", "001010110110", "101110110010", "011010110101", "010101010110", "101010010110", "110101001010", "111010100101", "011101010010", "101101101001", "010101110100", "101001101101", "100100110110", "110010010110", "110101001010", "111001101001", "011010110100", "101010111010", "010010111101", "001000111101", "100100011101", "101010010101", "101101001010", "101101011010", "010101101101", "001010110110", "100100111011", "010010011011", "011001010101", "011010101001", "011101010100", "101101101010", "010101101100", "101010101101", "010101010101", "101100101001", "101110010010", "101110101001", "010111010100", "101011011010", "010101011010", "101010101011", "010110010101", "011101001001", "011101100100", "101110101010", "010110110101", "001010110110", "101001010110", "110100101010", "111010010101", "011100101010", "011101010101", "001101011010", "100101011101", "010010011011", "101001001101", "110100100110", "110101010011", "010110101010", "101010101101", "010010110110", "101001010111", "010100100111", "101010010101", "101101001010", "101101010101", "001101101100", "100110101110", "010010110110", "101010010110", "101101001010", "110110100101", "010111010010", "010111011001", "001011011100", "100101101101", "010010101101", "011001010101"], _hijriBegin:1400, _hijriEnd:1480, _date:0, _month:0, _year:0, _hours:0, _minutes:0, _seconds:0, _milliseconds:0, _day:0, constructor:function () {
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
        var d = this.toGregorian();
        var dd = d.getDay();
        return dd;
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
        if (date > 0 && date <= this.getDaysInIslamicMonth(this._month, this._year)) {
            this._date = date;
        } else {
            var mdays;
            if (date > 0) {
                for (mdays = this.getDaysInIslamicMonth(this._month, this._year); date > mdays; date -= mdays, mdays = this.getDaysInIslamicMonth(this._month, this._year)) {
                    this._month++;
                    if (this._month >= 12) {
                        this._year++;
                        this._month -= 12;
                    }
                }
                this._date = date;
            } else {
                for (mdays = this.getDaysInIslamicMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1); date <= 0; mdays = this.getDaysInIslamicMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1)) {
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
            var mdays = this.getDaysInIslamicMonth(this._month, this._year);
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
        while (minutes >= 60) {
            this._hours++;
            if (this._hours >= 24) {
                this._date++;
                this._hours -= 24;
                var mdays = this.getDaysInIslamicMonth(this._month, this._year);
                if (this._date > mdays) {
                    this._month++;
                    if (this._month >= 12) {
                        this._year++;
                        this._month -= 12;
                    }
                    this._date -= mdays;
                }
            }
            minutes -= 60;
        }
        this._minutes = minutes;
    }, setSeconds:function (seconds) {
        while (seconds >= 60) {
            this._minutes++;
            if (this._minutes >= 60) {
                this._hours++;
                this._minutes -= 60;
                if (this._hours >= 24) {
                    this._date++;
                    this._hours -= 24;
                    var mdays = this.getDaysInIslamicMonth(this._month, this._year);
                    if (this._date > mdays) {
                        this._month++;
                        if (this._month >= 12) {
                            this._year++;
                            this._month -= 12;
                        }
                        this._date -= mdays;
                    }
                }
            }
            seconds -= 60;
        }
        this._seconds = seconds;
    }, setMilliseconds:function (milliseconds) {
        while (milliseconds >= 1000) {
            this.setSeconds++;
            if (this.setSeconds >= 60) {
                this._minutes++;
                this.setSeconds -= 60;
                if (this._minutes >= 60) {
                    this._hours++;
                    this._minutes -= 60;
                    if (this._hours >= 24) {
                        this._date++;
                        this._hours -= 24;
                        var mdays = this.getDaysInIslamicMonth(this._month, this._year);
                        if (this._date > mdays) {
                            this._month++;
                            if (this._month >= 12) {
                                this._year++;
                                this._month -= 12;
                            }
                            this._date -= mdays;
                        }
                    }
                }
            }
            milliseconds -= 1000;
        }
        this._milliseconds = milliseconds;
    }, toString:function () {
        var x = new Date();
        x.setHours(this._hours);
        x.setMinutes(this._minutes);
        x.setSeconds(this._seconds);
        x.setMilliseconds(this._milliseconds);
        return this._month + " " + this._date + " " + this._year + " " + x.toTimeString();
    }, toGregorian:function () {
        var hYear = this._year;
        var hMonth = this._month;
        var hDate = this._date;
        var gdate = new Date();
        if (hYear >= this._hijriBegin && hYear <= this._hijriEnd) {
            var gregorianRef = new Array(17);
            gregorianRef[0] = new Date(1979, 10, 20, 0, 0, 0, 0);
            gregorianRef[1] = new Date(1984, 8, 26, 0, 0, 0, 0);
            gregorianRef[2] = new Date(1989, 7, 3, 0, 0, 0, 0);
            gregorianRef[3] = new Date(1994, 5, 10, 0, 0, 0, 0);
            gregorianRef[4] = new Date(1999, 3, 17, 0, 0, 0, 0);
            gregorianRef[5] = new Date(2004, 1, 21, 0, 0, 0, 0);
            gregorianRef[6] = new Date(2008, 11, 29, 0, 0, 0, 0);
            gregorianRef[7] = new Date(2013, 10, 4, 0, 0, 0, 0);
            gregorianRef[8] = new Date(2018, 8, 11, 0, 0, 0, 0);
            gregorianRef[9] = new Date(2023, 6, 19, 0, 0, 0, 0);
            gregorianRef[10] = new Date(2028, 4, 25, 0, 0, 0, 0);
            gregorianRef[11] = new Date(2033, 3, 1, 0, 0, 0, 0);
            gregorianRef[12] = new Date(2038, 1, 5, 0, 0, 0, 0);
            gregorianRef[13] = new Date(2042, 11, 14, 0, 0, 0, 0);
            gregorianRef[14] = new Date(2047, 9, 20, 0, 0, 0, 0);
            gregorianRef[15] = new Date(2052, 7, 26, 0, 0, 0, 0);
            gregorianRef[16] = new Date(2057, 6, 3, 0, 0, 0, 0);
            var i = (hYear - this._hijriBegin);
            var a = Math.floor(i / 5);
            var b = i % 5;
            var days = 0;
            var m = b;
            var temp = a * 5;
            var l = 0;
            var h = 0;
            if (b == 0) {
                for (h = 0; h <= hMonth - 1; h++) {
                    if (this._MONTH_LENGTH[i].charAt(h) == "1") {
                        days = days + 30;
                    } else {
                        if (this._MONTH_LENGTH[i].charAt(h) == "0") {
                            days = days + 29;
                        }
                    }
                }
                days = days + (hDate - 1);
            } else {
                for (k = temp; k <= (temp + b); k++) {
                    for (l = 0; m > 0 && l < 12; l++) {
                        if (this._MONTH_LENGTH[k].charAt(l) == "1") {
                            days = days + 30;
                        } else {
                            if (this._MONTH_LENGTH[k].charAt(l) == "0") {
                                days = days + 29;
                            }
                        }
                    }
                    m--;
                    if (m == 0) {
                        for (h = 0; h <= hMonth - 1; h++) {
                            if (this._MONTH_LENGTH[i].charAt(h) == "1") {
                                days = days + 30;
                            } else {
                                if (this._MONTH_LENGTH[i].charAt(h) == "0") {
                                    days = days + 29;
                                }
                            }
                        }
                    }
                }
                days = days + (hDate - 1);
            }
            var gregRef = new Date(gregorianRef[a]);
            gregRef.setHours(this._hours, this._minutes, this._seconds, this._milliseconds);
            gdate = dd.add(gregRef, "day", days);
        } else {
            var islamicDate = new dojox.date.islamic.Date(this._year, this._month, this._date, this._hours, this._minutes, this._seconds, this._milliseconds);
            gdate = new Date(islamicDate.toGregorian());
        }
        return gdate;
    }, fromGregorian:function (gdate) {
        var date = new Date(gdate);
        date.setHours(0, 0, 0, 0);
        var gYear = date.getFullYear(), gMonth = date.getMonth(), gDay = date.getDate();
        var gregorianRef = new Array(17);
        gregorianRef[0] = new Date(1979, 10, 20, 0, 0, 0, 0);
        gregorianRef[1] = new Date(1984, 8, 26, 0, 0, 0, 0);
        gregorianRef[2] = new Date(1989, 7, 3, 0, 0, 0, 0);
        gregorianRef[3] = new Date(1994, 5, 10, 0, 0, 0, 0);
        gregorianRef[4] = new Date(1999, 3, 17, 0, 0, 0, 0);
        gregorianRef[5] = new Date(2004, 1, 21, 0, 0, 0, 0);
        gregorianRef[6] = new Date(2008, 11, 29, 0, 0, 0, 0);
        gregorianRef[7] = new Date(2013, 10, 4, 0, 0, 0, 0);
        gregorianRef[8] = new Date(2018, 8, 11, 0, 0, 0, 0);
        gregorianRef[9] = new Date(2023, 6, 19, 0, 0, 0, 0);
        gregorianRef[10] = new Date(2028, 4, 25, 0, 0, 0, 0);
        gregorianRef[11] = new Date(2033, 3, 1, 0, 0, 0, 0);
        gregorianRef[12] = new Date(2038, 1, 5, 0, 0, 0, 0);
        gregorianRef[13] = new Date(2042, 11, 14, 0, 0, 0, 0);
        gregorianRef[14] = new Date(2047, 9, 20, 0, 0, 0, 0);
        gregorianRef[15] = new Date(2052, 7, 26, 0, 0, 0, 0);
        gregorianRef[16] = new Date(2057, 6, 3, 0, 0, 0, 0);
        var gregorianLastRef = new Date(2058, 5, 21, 0, 0, 0, 0);
        if (dd.compare(date, gregorianRef[0]) >= 0 && dd.compare(date, gregorianLastRef) <= 0) {
            var diff;
            if (dd.compare(date, gregorianRef[16]) <= 0) {
                var count = 0;
                var pos = 0;
                var isRef = 0;
                for (count = 0; count < gregorianRef.length; count++) {
                    if (dd.compare(date, gregorianRef[count], "date") == 0) {
                        pos = count;
                        isRef = 1;
                        break;
                    } else {
                        if (dd.compare(date, gregorianRef[count], "date") < 0) {
                            pos = count - 1;
                            break;
                        }
                    }
                }
                var j = 0;
                var flag = 0;
                var monthL = 0;
                if (isRef == 1) {
                    this._date = 1;
                    this._month = 0;
                    this._year = this._hijriBegin + pos * 5;
                    this._hours = gdate.getHours();
                    this._minutes = gdate.getMinutes();
                    this._seconds = gdate.getSeconds();
                    this._milliseconds = gdate.getMilliseconds();
                    this._day = gregorianRef[pos].getDay();
                } else {
                    diff = dd.difference(gregorianRef[pos], date, "day");
                    pos = pos * 5;
                    for (i = pos; i < pos + 5; i++) {
                        for (j = 0; j <= 11; j++) {
                            if (this._MONTH_LENGTH[i].charAt(j) == "1") {
                                monthL = 30;
                            } else {
                                if (this._MONTH_LENGTH[i].charAt(j) == "0") {
                                    monthL = 29;
                                }
                            }
                            if (diff > monthL) {
                                diff = diff - monthL;
                            } else {
                                flag = 1;
                                break;
                            }
                        }
                        if (flag == 1) {
                            if (diff == 0) {
                                diff = 1;
                                if (j == 11) {
                                    j = 1;
                                    ++i;
                                } else {
                                    ++j;
                                }
                                break;
                            } else {
                                if (diff == monthL) {
                                    diff = 0;
                                    if (j == 11) {
                                        j = 0;
                                        ++i;
                                    } else {
                                        ++j;
                                    }
                                }
                                diff++;
                                break;
                            }
                        }
                    }
                    this._date = diff;
                    this._month = j;
                    this._year = this._hijriBegin + i;
                    this._hours = gdate.getHours();
                    this._minutes = gdate.getMinutes();
                    this._seconds = gdate.getSeconds();
                    this._milliseconds = gdate.getMilliseconds();
                    this._day = gdate.getDay();
                }
            } else {
                diff = dd.difference(gregorianRef[16], date, "day");
                var x = dd.difference(new Date(2057, 6, 3, 0, 0, 0, 0), new Date(2057, 6, 1, 0, 0, 0, 0), "date");
                for (j = 0; j <= 11; j++) {
                    if (this._MONTH_LENGTH[80].charAt(j) == "1") {
                        monthL = 30;
                    } else {
                        if (this._MONTH_LENGTH[80].charAt(j) == "0") {
                            monthL = 29;
                        }
                    }
                    if (diff > monthL) {
                        diff = diff - monthL;
                    } else {
                        flag = 1;
                        break;
                    }
                }
                if (flag == 1) {
                    if (diff == 0) {
                        diff = 1;
                        if (j == 11) {
                            j = 1;
                            ++i;
                        } else {
                            ++j;
                        }
                    } else {
                        if (diff == monthL) {
                            diff = 0;
                            if (j == 11) {
                                j = 0;
                                ++i;
                            } else {
                                ++j;
                            }
                        }
                        diff++;
                    }
                }
                this._date = diff;
                this._month = j;
                this._year = 1480;
                this._hours = gdate.getHours();
                this._minutes = gdate.getMinutes();
                this._seconds = gdate.getSeconds();
                this._milliseconds = gdate.getMilliseconds();
                this._day = gdate.getDay();
            }
        } else {
            var islamicDate = new dojox.date.islamic.Date(date);
            this._date = islamicDate.getDate();
            this._month = islamicDate.getMonth();
            this._year = islamicDate.getFullYear();
            this._hours = gdate.getHours();
            this._minutes = gdate.getMinutes();
            this._seconds = gdate.getSeconds();
            this._milliseconds = gdate.getMilliseconds();
            this._day = gdate.getDay();
        }
        return this;
    }, valueOf:function () {
        return (this.toGregorian()).valueOf();
    }, _yearStart:function (year) {
        return (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
    }, _monthStart:function (year, month) {
        return Math.ceil(29.5 * month) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30);
    }, _civilLeapYear:function (year) {
        return (14 + 11 * year) % 30 < 11;
    }, getDaysInIslamicMonth:function (month, year) {
        if (year >= this._hijriBegin && year <= this._hijriEnd) {
            var pos = year - this._hijriBegin;
            var length = 0;
            if (this._MONTH_LENGTH[pos].charAt(month) == 1) {
                length = 30;
            } else {
                length = 29;
            }
        } else {
            var islamicDate = new dojox.date.islamic.Date();
            length = islamicDate.getDaysInIslamicMonth(month, year);
        }
        return length;
    }});
    IDate.getDaysInIslamicMonth = function (month) {
        return new IDate().getDaysInIslamicMonth(month.getMonth(), month.getFullYear());
    };
    return IDate;
});

