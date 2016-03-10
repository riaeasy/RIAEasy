//>>built

define("dojox/mobile/_DatePickerMixin", ["dojo/_base/array", "dojo/_base/declare", "dojo/_base/lang", "dojo/date", "dojo/date/locale", "dojo/date/stamp"], function (array, declare, lang, ddate, datelocale, datestamp) {
    var slotMixin = {format:function (d) {
        return datelocale.format(d, {datePattern:this.pattern, selector:"date"});
    }};
    var yearSlotMixin = lang.mixin({initLabels:function () {
        this.labels = [];
        if (this.labelFrom !== this.labelTo) {
            var d = new Date(this.labelFrom, 0, 1);
            var i, idx;
            for (i = this.labelFrom, idx = 0; i <= this.labelTo; i++, idx++) {
                d.setFullYear(i);
                this.labels.push(this.format(d));
            }
        }
    }}, slotMixin);
    var monthSlotMixin = lang.mixin({initLabels:function () {
        this.labels = [];
        var d = new Date(2000, 0, 16);
        for (var i = 0; i < 12; i++) {
            d.setMonth(i);
            this.labels.push(this.format(d));
        }
    }}, slotMixin);
    var daySlotMixin = lang.mixin({initLabels:function () {
        this.labels = [];
        var d = new Date(2000, 0, 1);
        for (var i = 1; i <= 31; i++) {
            d.setDate(i);
            this.labels.push(this.format(d));
        }
    }}, slotMixin);
    return declare("dojox.mobile._DatePickerMixin", null, {yearPattern:"yyyy", monthPattern:"MMM", dayPattern:"d", initSlots:function () {
        var c = this.slotClasses, p = this.slotProps;
        c[0] = declare(c[0], yearSlotMixin);
        c[1] = declare(c[1], monthSlotMixin);
        c[2] = declare(c[2], daySlotMixin);
        p[0].pattern = this.yearPattern;
        p[1].pattern = this.monthPattern;
        p[2].pattern = this.dayPattern;
        this.reorderSlots();
    }, reorderSlots:function () {
        if (this.slotOrder.length) {
            return;
        }
        var a = datelocale._parseInfo().bundle["dateFormat-short"].toLowerCase().split(/[^ymd]+/, 3);
        this.slotOrder = array.map(a, function (pat) {
            return {y:0, m:1, d:2}[pat.charAt(0)];
        });
    }, reset:function () {
        var now = new Date();
        var v = array.map(this.slots, function (w) {
            return w.format(now);
        });
        this.set("colors", v);
        this._disableEndDaysOfMonth();
        if (this.value) {
            this.set("value", this.value);
            this.value = null;
        } else {
            if (this.values) {
                this.set("values", this.values);
                this.values = null;
            } else {
                this.set("values", v);
            }
        }
    }, _onYearSet:function () {
        var slot = this.slots[0];
        var newValue = slot.get("value");
        if (!(slot._previousValue && newValue == slot._previousValue)) {
            this._disableEndDaysOfMonth();
            slot._previousValue = newValue;
            slot._set("value", newValue);
            this.onYearSet();
        }
    }, onYearSet:function () {
    }, _onMonthSet:function () {
        var slot = this.slots[1];
        var newValue = slot.get("value");
        if (!(slot._previousValue && newValue == slot._previousValue)) {
            this._disableEndDaysOfMonth();
            slot._previousValue = newValue;
            slot._set("value", newValue);
            this.onMonthSet();
        }
    }, onMonthSet:function () {
    }, _onDaySet:function () {
        var slot = this.slots[2];
        var newValue = slot.get("value");
        if (!(slot._previousValue && newValue == slot._previousValue)) {
            if (!this._disableEndDaysOfMonth()) {
                slot._previousValue = newValue;
                slot._set("value", newValue);
                this.onDaySet();
            }
        }
    }, onDaySet:function () {
    }, _disableEndDaysOfMonth:function () {
        var pat = this.slots[0].pattern + "/" + this.slots[1].pattern, v = this.get("values"), date = datelocale.parse(v[0] + "/" + v[1], {datePattern:pat, selector:"date"}), daysInMonth = ddate.getDaysInMonth(date);
        var changedDay = false;
        if (daysInMonth < v[2]) {
            changedDay = true;
            this.slots[2]._spinToValue(daysInMonth, false);
        }
        this.disableValues(daysInMonth);
        return changedDay;
    }, _getDateAttr:function () {
        var v = this.get("values"), s = this.slots, pat = s[0].pattern + "/" + s[1].pattern + "/" + s[2].pattern;
        return datelocale.parse(v[0] + "/" + v[1] + "/" + v[2], {datePattern:pat, selector:"date"});
    }, _setValuesAttr:function (values) {
        array.forEach(this.getSlots(), function (w, i) {
            var v = values[i];
            if (typeof v == "number") {
                var arr = [1970, 1, 1];
                arr.splice(i, 1, v - 0);
                v = w.format(new Date(arr[0], arr[1] - 1, arr[2]));
            }
            w.set("value", v);
        });
    }, _setValueAttr:function (value) {
        var date = datestamp.fromISOString(value);
        this.set("values", array.map(this.slots, function (w) {
            return w.format(date);
        }));
    }, _getValueAttr:function () {
        return datestamp.toISOString(this.get("date"), {selector:"date"});
    }});
});

