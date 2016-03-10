//>>built

define("dojox/date/php", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/date", "dojox/string/tokenize"], function (dojo, dlang, ddate, dxst) {
    var php = dojo.getObject("date.php", true, dojox);
    php.format = function (date, format) {
        var df = new php.DateFormat(format);
        return df.format(date);
    };
    php.DateFormat = function (format) {
        if (!this.regex) {
            var keys = [];
            for (var key in this.constructor.prototype) {
                if (dojo.isString(key) && key.length == 1 && dojo.isFunction(this[key])) {
                    keys.push(key);
                }
            }
            this.constructor.prototype.regex = new RegExp("(?:(\\\\.)|([" + keys.join("") + "]))", "g");
        }
        var replacements = [];
        this.tokens = dxst(format, this.regex, function (escape, token, i) {
            if (token) {
                replacements.push([i, token]);
                return token;
            }
            if (escape) {
                return escape.charAt(1);
            }
        });
        this.replacements = replacements;
    };
    dojo.extend(php.DateFormat, {weekdays:["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], weekdays_3:["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], months:["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], months_3:["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], monthdays:[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], format:function (date) {
        this.date = date;
        for (var i = 0, replacement; replacement = this.replacements[i]; i++) {
            this.tokens[replacement[0]] = this[replacement[1]]();
        }
        return this.tokens.join("");
    }, d:function () {
        var j = this.j();
        return (j.length == 1) ? "0" + j : j;
    }, D:function () {
        return this.weekdays_3[this.date.getDay()];
    }, j:function () {
        return this.date.getDate() + "";
    }, l:function () {
        return this.weekdays[this.date.getDay()];
    }, N:function () {
        var w = this.w();
        return (!w) ? 7 : w;
    }, S:function () {
        switch (this.date.getDate()) {
          case 11:
          case 12:
          case 13:
            return "th";
          case 1:
          case 21:
          case 31:
            return "st";
          case 2:
          case 22:
            return "nd";
          case 3:
          case 23:
            return "rd";
          default:
            return "th";
        }
    }, w:function () {
        return this.date.getDay() + "";
    }, z:function () {
        var millis = this.date.getTime() - new Date(this.date.getFullYear(), 0, 1).getTime();
        return Math.floor(millis / 86400000) + "";
    }, W:function () {
        var week;
        var jan1_w = new Date(this.date.getFullYear(), 0, 1).getDay() + 1;
        var w = this.date.getDay() + 1;
        var z = parseInt(this.z());
        if (z <= (8 - jan1_w) && jan1_w > 4) {
            var last_year = new Date(this.date.getFullYear() - 1, this.date.getMonth(), this.date.getDate());
            if (jan1_w == 5 || (jan1_w == 6 && ddate.isLeapYear(last_year))) {
                week = 53;
            } else {
                week = 52;
            }
        } else {
            var i;
            if (Boolean(this.L())) {
                i = 366;
            } else {
                i = 365;
            }
            if ((i - z) < (4 - w)) {
                week = 1;
            } else {
                var j = z + (7 - w) + (jan1_w - 1);
                week = Math.ceil(j / 7);
                if (jan1_w > 4) {
                    --week;
                }
            }
        }
        return week;
    }, F:function () {
        return this.months[this.date.getMonth()];
    }, m:function () {
        var n = this.n();
        return (n.length == 1) ? "0" + n : n;
    }, M:function () {
        return this.months_3[this.date.getMonth()];
    }, n:function () {
        return this.date.getMonth() + 1 + "";
    }, t:function () {
        return (Boolean(this.L()) && this.date.getMonth() == 1) ? 29 : this.monthdays[this.getMonth()];
    }, L:function () {
        return (ddate.isLeapYear(this.date)) ? "1" : "0";
    }, o:function () {
    }, Y:function () {
        return this.date.getFullYear() + "";
    }, y:function () {
        return this.Y().slice(-2);
    }, a:function () {
        return this.date.getHours() >= 12 ? "pm" : "am";
    }, b:function () {
        return this.a().toUpperCase();
    }, B:function () {
        var off = this.date.getTimezoneOffset() + 60;
        var secs = (this.date.getHours() * 3600) + (this.date.getMinutes() * 60) + this.getSeconds() + (off * 60);
        var beat = Math.abs(Math.floor(secs / 86.4) % 1000) + "";
        while (beat.length < 2) {
            beat = "0" + beat;
        }
        return beat;
    }, g:function () {
        return (this.date.getHours() % 12 || 12) + "";
    }, G:function () {
        return this.date.getHours() + "";
    }, h:function () {
        var g = this.g();
        return (g.length == 1) ? "0" + g : g;
    }, H:function () {
        var G = this.G();
        return (G.length == 1) ? "0" + G : G;
    }, i:function () {
        var mins = this.date.getMinutes() + "";
        return (mins.length == 1) ? "0" + mins : mins;
    }, s:function () {
        var secs = this.date.getSeconds() + "";
        return (secs.length == 1) ? "0" + secs : secs;
    }, e:function () {
        return ddate.getTimezoneName(this.date);
    }, I:function () {
    }, O:function () {
        var off = Math.abs(this.date.getTimezoneOffset());
        var hours = Math.floor(off / 60) + "";
        var mins = (off % 60) + "";
        if (hours.length == 1) {
            hours = "0" + hours;
        }
        if (mins.length == 1) {
            hours = "0" + mins;
        }
        return ((this.date.getTimezoneOffset() < 0) ? "+" : "-") + hours + mins;
    }, P:function () {
        var O = this.O();
        return O.substring(0, 2) + ":" + O.substring(2, 4);
    }, T:function () {
        return this.e().substring(0, 3);
    }, Z:function () {
        return this.date.getTimezoneOffset() * -60;
    }, c:function () {
        return this.Y() + "-" + this.m() + "-" + this.d() + "T" + this.h() + ":" + this.i() + ":" + this.s() + this.P();
    }, r:function () {
        return this.D() + ", " + this.d() + " " + this.M() + " " + this.Y() + " " + this.H() + ":" + this.i() + ":" + this.s() + " " + this.O();
    }, U:function () {
        return Math.floor(this.date.getTime() / 1000);
    }});
    return php;
});

