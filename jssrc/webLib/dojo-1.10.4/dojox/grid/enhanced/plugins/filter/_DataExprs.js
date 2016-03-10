//>>built

define("dojox/grid/enhanced/plugins/filter/_DataExprs", ["dojo/_base/declare", "dojo/_base/lang", "dojo/date/locale", "./_ConditionExpr"], function (declare, lang, dateLocale, exprs) {
    var BooleanExpr = declare("dojox.grid.enhanced.plugins.filter.BooleanExpr", exprs._DataExpr, {_name:"bool", _convertData:function (dataValue) {
        return !!dataValue;
    }});
    var StringExpr = declare("dojox.grid.enhanced.plugins.filter.StringExpr", exprs._DataExpr, {_name:"string", _convertData:function (dataValue) {
        return String(dataValue);
    }});
    var NumberExpr = declare("dojox.grid.enhanced.plugins.filter.NumberExpr", exprs._DataExpr, {_name:"number", _convertDataToExpr:function (dataValue) {
        return parseFloat(dataValue);
    }});
    var DateExpr = declare("dojox.grid.enhanced.plugins.filter.DateExpr", exprs._DataExpr, {_name:"date", _convertData:function (dataValue) {
        if (dataValue instanceof Date) {
            return dataValue;
        } else {
            if (typeof dataValue == "number") {
                return new Date(dataValue);
            } else {
                var res = dateLocale.parse(String(dataValue), lang.mixin({selector:this._name}, this._convertArgs));
                if (!res) {
                    throw new Error("Datetime parse failed: " + dataValue);
                }
                return res;
            }
        }
    }, toObject:function () {
        if (this._value instanceof Date) {
            var tmp = this._value;
            this._value = this._value.valueOf();
            var res = this.inherited(arguments);
            this._value = tmp;
            return res;
        } else {
            return this.inherited(arguments);
        }
    }});
    var TimeExpr = declare("dojox.grid.enhanced.plugins.filter.TimeExpr", DateExpr, {_name:"time"});
    return lang.mixin({BooleanExpr:BooleanExpr, StringExpr:StringExpr, NumberExpr:NumberExpr, DateExpr:DateExpr, TimeExpr:TimeExpr}, exprs);
});

