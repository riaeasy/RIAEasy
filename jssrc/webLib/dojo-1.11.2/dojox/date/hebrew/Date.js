//>>built
define("dojox/date/hebrew/Date",["dojo/_base/lang","dojo/_base/declare","./numerals"],function(f,g,h){f=g("dojox.date.hebrew.Date",null,{_MONTH_LENGTH:[[30,30,30],[29,29,30],[29,30,30],[29,29,29],[30,30,30],[30,30,30],[29,29,29],[30,30,30],[29,29,29],[30,30,30],[29,29,29],[30,30,30],[29,29,29]],_MONTH_START:[[0,0,0],[30,30,30],[59,59,60],[88,89,90],[117,118,119],[147,148,149],[147,148,149],[176,177,178],[206,207,208],[235,236,237],[265,266,267],[294,295,296],[324,325,326],[353,354,355]],_LEAP_MONTH_START:[[0,
0,0],[30,30,30],[59,59,60],[88,89,90],[117,118,119],[147,148,149],[177,178,179],[206,207,208],[236,237,238],[265,266,267],[295,296,297],[324,325,326],[354,355,356],[383,384,385]],_GREGORIAN_MONTH_COUNT:[[31,31,0,0],[28,29,31,31],[31,31,59,60],[30,30,90,91],[31,31,120,121],[30,30,151,152],[31,31,181,182],[31,31,212,213],[30,30,243,244],[31,31,273,274],[30,30,304,305],[31,31,334,335]],_date:0,_month:0,_year:0,_hours:0,_minutes:0,_seconds:0,_milliseconds:0,_day:0,constructor:function(){var a=arguments.length;
a?1==a?(a=arguments[0],"number"==typeof a&&(a=new Date(a)),a instanceof Date?this.fromGregorian(a):""==a?this._year=this._month=this._date=this._hours=this._minutes=this._seconds=this._milliseconds=NaN:(this._year=a._year,this._month=a._month,this._date=a._date,this._hours=a._hours,this._minutes=a._minutes,this._seconds=a._seconds,this._milliseconds=a._milliseconds)):3<=a&&(this._year+=arguments[0],this._month+=arguments[1],this._date+=arguments[2],12<this._month&&(console.warn("the month is incorrect , set 0  "+
this._month+"   "+this._year),this._month=0),this._hours+=arguments[3]||0,this._minutes+=arguments[4]||0,this._seconds+=arguments[5]||0,this._milliseconds+=arguments[6]||0):this.fromGregorian(new Date);this._setDay()},getDate:function(){return this._date},getDateLocalized:function(a){return(a||dojo.locale).match(/^he(?:-.+)?$/)?h.getDayHebrewLetters(this._date):this.getDate()},getMonth:function(){return this._month},getFullYear:function(){return this._year},getHours:function(){return this._hours},
getMinutes:function(){return this._minutes},getSeconds:function(){return this._seconds},getMilliseconds:function(){return this._milliseconds},setDate:function(a){a=+a;var b;if(0<a)for(;a>(b=this.getDaysInHebrewMonth(this._month,this._year));)a-=b,this._month++,13<=this._month&&(this._year++,this._month-=13);else for(;0>=a;)b=this.getDaysInHebrewMonth(0<=this._month-1?this._month-1:12,0<=this._month-1?this._year:this._year-1),this._month--,0>this._month&&(this._year--,this._month+=13),a+=b;this._date=
a;this._setDay();return this},setFullYear:function(a,b,c){this._year=a=+a;!this.isLeapYear(a)&&5==this._month&&this._month++;void 0!==b&&this.setMonth(b);void 0!==c&&this.setDate(c);a=this.getDaysInHebrewMonth(this._month,this._year);a<this._date&&(this._date=a);this._setDay();return this},setMonth:function(a){a=+a;!this.isLeapYear(this._year)&&5==a&&a++;if(0<=a)for(;12<a;)this._year++,a-=13,!this.isLeapYear(this._year)&&5<=a&&a++;else for(;0>a;)this._year--,a+=!this.isLeapYear(this._year)&&-7>a?
12:13;this._month=a;a=this.getDaysInHebrewMonth(this._month,this._year);a<this._date&&(this._date=a);this._setDay();return this},setHours:function(){var a=arguments.length,b=0;1<=a&&(b=+arguments[0]);2<=a&&(this._minutes=+arguments[1]);3<=a&&(this._seconds=+arguments[2]);4==a&&(this._milliseconds=+arguments[3]);for(;24<=b;)this._date++,a=this.getDaysInHebrewMonth(this._month,this._year),this._date>a&&(this._month++,!this.isLeapYear(this._year)&&5==this._month&&this._month++,13<=this._month&&(this._year++,
this._month-=13),this._date-=a),b-=24;this._hours=b;this._setDay();return this},_addMinutes:function(a){a+=this._minutes;this.setMinutes(a);this.setHours(this._hours+parseInt(a/60));return this},_addSeconds:function(a){a+=this._seconds;this.setSeconds(a);this._addMinutes(parseInt(a/60));return this},_addMilliseconds:function(a){a+=this._milliseconds;this.setMilliseconds(a);this._addSeconds(parseInt(a/1E3));return this},setMinutes:function(a){this._minutes=a%60;return this},setSeconds:function(a){this._seconds=
a%60;return this},setMilliseconds:function(a){this._milliseconds=a%1E3;return this},_setDay:function(){var a=this._startOfYear(this._year);0!=this._month&&(a+=(this.isLeapYear(this._year)?this._LEAP_MONTH_START:this._MONTH_START)[this._month||0][this._yearType(this._year)]);a+=this._date-1;this._day=(a+1)%7},toString:function(){return isNaN(this._date)?"Invalid Date":this._date+", "+this._month+", "+this._year+"  "+this._hours+":"+this._minutes+":"+this._seconds},getDaysInHebrewMonth:function(a,b){var c=
1==a||2==a?this._yearType(b):0;return!this.isLeapYear(this._year)&&5==a?0:this._MONTH_LENGTH[a][c]},_yearType:function(a){var b=this._handleGetYearLength(Number(a));380<b&&(b-=30);var c=b-353;if(0>c||2<c)throw Error("Illegal year length "+b+" in year "+a);return c},_handleGetYearLength:function(a){return this._startOfYear(a+1)-this._startOfYear(a)},_startOfYear:function(a){var b=Math.floor((235*a-234)/19),c=13753*b+12084,b=29*b+Math.floor(c/25920),c=c%25920,d=b%7;if(2==d||4==d||6==d)b+=1,d=b%7;1==
d&&16404<c&&!this.isLeapYear(a)?b+=2:0==d&&(23269<c&&this.isLeapYear(a-1))&&(b+=1);return b},isLeapYear:function(a){a=(12*a+17)%19;return a>=(0>a?-7:12)},fromGregorian:function(a){var b=!isNaN(a)?this._computeHebrewFields(a):NaN;this._year=!isNaN(a)?b[0]:NaN;this._month=!isNaN(a)?b[1]:NaN;this._date=!isNaN(a)?b[2]:NaN;this._hours=a.getHours();this._milliseconds=a.getMilliseconds();this._minutes=a.getMinutes();this._seconds=a.getSeconds();isNaN(a)||this._setDay();return this},_computeHebrewFields:function(a){var b=
this._getJulianDayFromGregorianDate(a)-347997;a=Math.floor((19*Math.floor(25920*b/765433)+234)/235)+1;for(var c=this._startOfYear(a),c=b-c;1>c;)a--,c=this._startOfYear(a),c=b-c;for(var b=this._yearType(a),d=this.isLeapYear(a)?this._LEAP_MONTH_START:this._MONTH_START,e=0;c>d[e][b];)e++;e--;return[a,e,c-d[e][b]]},toGregorian:function(){var a=this._year||0,b=this._month||0,c=this._date||0,d=this._startOfYear(a);0!=b&&(d+=(this.isLeapYear(a)?this._LEAP_MONTH_START:this._MONTH_START)[b][this._yearType(a)]);
var a=[],c=this._floorDivide(c+d+347997-1721426,146097,a),d=this._floorDivide(a[0],36524,a),e=this._floorDivide(a[0],1461,a),b=this._floorDivide(a[0],365,a),c=400*c+100*d+4*e+b,a=a[0];4==d||4==b?a=365:++c;d=!(c%4)&&(c%100||!(c%400));b=0;if(a>=(d?60:59))b=d?1:2;b=Math.floor((12*(a+b)+6)/367);return new Date(c,b,a-this._GREGORIAN_MONTH_COUNT[b][d?3:2]+1,this._hours,this._minutes,this._seconds,this._milliseconds)},_floorDivide:function(a,b,c){if(0<=a)return c[0]=a%b,Math.floor(a/b);var d=Math.floor(a/
b);c[0]=a-d*b;return d},getDay:function(){var a=this._year,b=this._month,c=this._date,d=this._startOfYear(a);0!=b&&(d+=(this.isLeapYear(a)?this._LEAP_MONTH_START:this._MONTH_START)[b][this._yearType(a)]);return(d+(c-1)+1)%7},_getJulianDayFromGregorianDate:function(a){var b=a.getFullYear(),c=a.getMonth();a=a.getDate();var d=b-1,d=365*d+Math.floor(d/4)-Math.floor(d/100)+Math.floor(d/400)+1721426-1;0<c&&(d+=this._GREGORIAN_MONTH_COUNT[c][!(b%4)&&(b%100||!(b%400))?3:2]);return d+a}});f.prototype.valueOf=
function(){return this.toGregorian().valueOf()};return f});
/// Date.js.map