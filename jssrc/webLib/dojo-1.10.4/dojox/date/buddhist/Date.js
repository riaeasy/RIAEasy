//>>built

define("dojox/date/buddhist/Date", ["dojo/_base/lang", "dojo/_base/declare", "dojo/date"], function (lang, declare, dd) {
    var BDate = declare("dojox.date.buddhist.Date", null, {_date:0, _month:0, _year:0, _hours:0, _minutes:0, _seconds:0, _milliseconds:0, _day:0, constructor:function () {
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
                    if (this._month > 11) {
                        console.warn("the month is incorrect , set 0");
                        this._month = 0;
                    }
                    this._hours += arguments[3] || 0;
                    this._minutes += arguments[4] || 0;
                    this._seconds += arguments[5] || 0;
                    this._milliseconds += arguments[6] || 0;
                }
            }
        }
    }, getDate:function (isNumber) {
        return parseInt(this._date);
    }, getMonth:function () {
        return parseInt(this._month);
    }, getFullYear:function () {
        return parseInt(this._year);
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
        if (date > 0 && date <= this._getDaysInMonth(this._month, this._year)) {
            this._date = date;
        } else {
            var mdays;
            if (date > 0) {
                for (mdays = this._getDaysInMonth(this._month, this._year); date > mdays; date -= mdays, mdays = this._getDaysInMonth(this._month, this._year)) {
                    this._month++;
                    if (this._month >= 12) {
                        this._year++;
                        this._month -= 12;
                    }
                }
                this._date = date;
            } else {
                for (mdays = this._getDaysInMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1); date <= 0; mdays = this._getDaysInMonth((this._month - 1) >= 0 ? (this._month - 1) : 11, ((this._month - 1) >= 0) ? this._year : this._year - 1)) {
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
    }, setFullYear:function (year, month, date) {
        this._year = parseInt(year);
    }, setMonth:function (month) {
        this._year += Math.floor(month / 12);
        this._month = Math.floor(month % 12);
        for (; this._month < 0; this._month = this._month + 12) {
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
            var mdays = this._getDaysInMonth(this._month, this._year);
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
        return isNaN(this._date) ? "Invalid Date" : this._date + ", " + this._month + ", " + this._year + "  " + this._hours + ":" + this._minutes + ":" + this._seconds;
    }, _getDaysInMonth:function (month, year) {
        return dd.getDaysInMonth(new Date(year - 543, month));
    }, fromGregorian:function (gdate) {
        var date = new Date(gdate);
        this._date = date.getDate();
        this._month = date.getMonth();
        this._year = date.getFullYear() + 543;
        this._hours = date.getHours();
        this._minutes = date.getMinutes();
        this._seconds = date.getSeconds();
        this._milliseconds = date.getMilliseconds();
        this._day = date.getDay();
        return this;
    }, toGregorian:function () {
        return new Date(this._year - 543, this._month, this._date, this._hours, this._minutes, this._seconds, this._milliseconds);
    }, getDay:function () {
        return this.toGregorian().getDay();
    }});
    BDate.prototype.valueOf = function () {
        return this.toGregorian().valueOf();
    };
    return BDate;
});

