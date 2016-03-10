//>>built

define("dojox/grid/enhanced/plugins/filter/_FilterExpr", ["dojo/_base/declare", "dojo/_base/lang", "dojo/date", "./_DataExprs"], function (declare, lang, date, exprs) {
    var LogicAND = declare("dojox.grid.enhanced.plugins.filter.LogicAND", exprs._BiOpExpr, {_name:"and", _calculate:function (left_operand, right_operand, datarow, getter) {
        var res = left_operand.applyRow(datarow, getter).getValue() && right_operand.applyRow(datarow, getter).getValue();
        return new exprs.BooleanExpr(res);
    }});
    var LogicOR = declare("dojox.grid.enhanced.plugins.filter.LogicOR", exprs._BiOpExpr, {_name:"or", _calculate:function (left_operand, right_operand, datarow, getter) {
        var res = left_operand.applyRow(datarow, getter).getValue() || right_operand.applyRow(datarow, getter).getValue();
        return new exprs.BooleanExpr(res);
    }});
    var LogicXOR = declare("dojox.grid.enhanced.plugins.filter.LogicXOR", exprs._BiOpExpr, {_name:"xor", _calculate:function (left_operand, right_operand, datarow, getter) {
        var left_res = left_operand.applyRow(datarow, getter).getValue();
        var right_res = right_operand.applyRow(datarow, getter).getValue();
        return new exprs.BooleanExpr((!!left_res) != (!!right_res));
    }});
    var LogicNOT = declare("dojox.grid.enhanced.plugins.filter.LogicNOT", exprs._UniOpExpr, {_name:"not", _calculate:function (operand, datarow, getter) {
        return new exprs.BooleanExpr(!operand.applyRow(datarow, getter).getValue());
    }});
    var LogicALL = declare("dojox.grid.enhanced.plugins.filter.LogicALL", exprs._OperatorExpr, {_name:"all", applyRow:function (datarow, getter) {
        for (var i = 0, res = true; res && (this._operands[i] instanceof exprs._ConditionExpr); ++i) {
            res = this._operands[i].applyRow(datarow, getter).getValue();
        }
        return new exprs.BooleanExpr(res);
    }});
    var LogicANY = declare("dojox.grid.enhanced.plugins.filter.LogicANY", exprs._OperatorExpr, {_name:"any", applyRow:function (datarow, getter) {
        for (var i = 0, res = false; !res && (this._operands[i] instanceof exprs._ConditionExpr); ++i) {
            res = this._operands[i].applyRow(datarow, getter).getValue();
        }
        return new exprs.BooleanExpr(res);
    }});
    function compareFunc(left, right, row, getter) {
        left = left.applyRow(row, getter);
        right = right.applyRow(row, getter);
        var left_res = left.getValue();
        var right_res = right.getValue();
        if (left instanceof exprs.TimeExpr) {
            return date.compare(left_res, right_res, "time");
        } else {
            if (left instanceof exprs.DateExpr) {
                return date.compare(left_res, right_res, "date");
            } else {
                if (left instanceof exprs.StringExpr) {
                    left_res = left_res.toLowerCase();
                    right_res = String(right_res).toLowerCase();
                }
                return left_res == right_res ? 0 : (left_res < right_res ? -1 : 1);
            }
        }
    }
    var EqualTo = declare("dojox.grid.enhanced.plugins.filter.EqualTo", exprs._BiOpExpr, {_name:"equal", _calculate:function (left_operand, right_operand, datarow, getter) {
        var res = compareFunc(left_operand, right_operand, datarow, getter);
        return new exprs.BooleanExpr(res === 0);
    }});
    var LessThan = declare("dojox.grid.enhanced.plugins.filter.LessThan", exprs._BiOpExpr, {_name:"less", _calculate:function (left_operand, right_operand, datarow, getter) {
        var res = compareFunc(left_operand, right_operand, datarow, getter);
        return new exprs.BooleanExpr(res < 0);
    }});
    var LessThanOrEqualTo = declare("dojox.grid.enhanced.plugins.filter.LessThanOrEqualTo", exprs._BiOpExpr, {_name:"lessEqual", _calculate:function (left_operand, right_operand, datarow, getter) {
        var res = compareFunc(left_operand, right_operand, datarow, getter);
        return new exprs.BooleanExpr(res <= 0);
    }});
    var LargerThan = declare("dojox.grid.enhanced.plugins.filter.LargerThan", exprs._BiOpExpr, {_name:"larger", _calculate:function (left_operand, right_operand, datarow, getter) {
        var res = compareFunc(left_operand, right_operand, datarow, getter);
        return new exprs.BooleanExpr(res > 0);
    }});
    var LargerThanOrEqualTo = declare("dojox.grid.enhanced.plugins.filter.LargerThanOrEqualTo", exprs._BiOpExpr, {_name:"largerEqual", _calculate:function (left_operand, right_operand, datarow, getter) {
        var res = compareFunc(left_operand, right_operand, datarow, getter);
        return new exprs.BooleanExpr(res >= 0);
    }});
    var Contains = declare("dojox.grid.enhanced.plugins.filter.Contains", exprs._BiOpExpr, {_name:"contains", _calculate:function (left_operand, right_operand, datarow, getter) {
        var left_res = String(left_operand.applyRow(datarow, getter).getValue()).toLowerCase();
        var right_res = String(right_operand.applyRow(datarow, getter).getValue()).toLowerCase();
        return new exprs.BooleanExpr(left_res.indexOf(right_res) >= 0);
    }});
    var StartsWith = declare("dojox.grid.enhanced.plugins.filter.StartsWith", exprs._BiOpExpr, {_name:"startsWith", _calculate:function (left_operand, right_operand, datarow, getter) {
        var left_res = String(left_operand.applyRow(datarow, getter).getValue()).toLowerCase();
        var right_res = String(right_operand.applyRow(datarow, getter).getValue()).toLowerCase();
        return new exprs.BooleanExpr(left_res.substring(0, right_res.length) == right_res);
    }});
    var EndsWith = declare("dojox.grid.enhanced.plugins.filter.EndsWith", exprs._BiOpExpr, {_name:"endsWith", _calculate:function (left_operand, right_operand, datarow, getter) {
        var left_res = String(left_operand.applyRow(datarow, getter).getValue()).toLowerCase();
        var right_res = String(right_operand.applyRow(datarow, getter).getValue()).toLowerCase();
        return new exprs.BooleanExpr(left_res.substring(left_res.length - right_res.length) == right_res);
    }});
    var Matches = declare("dojox.grid.enhanced.plugins.filter.Matches", exprs._BiOpExpr, {_name:"matches", _calculate:function (left_operand, right_operand, datarow, getter) {
        var left_res = String(left_operand.applyRow(datarow, getter).getValue());
        var right_res = new RegExp(right_operand.applyRow(datarow, getter).getValue());
        return new exprs.BooleanExpr(left_res.search(right_res) >= 0);
    }});
    var IsEmpty = declare("dojox.grid.enhanced.plugins.filter.IsEmpty", exprs._UniOpExpr, {_name:"isEmpty", _calculate:function (operand, datarow, getter) {
        var res = operand.applyRow(datarow, getter).getValue();
        return new exprs.BooleanExpr(res === "" || res == null);
    }});
    return lang.mixin({LogicAND:LogicAND, LogicOR:LogicOR, LogicXOR:LogicXOR, LogicNOT:LogicNOT, LogicALL:LogicALL, LogicANY:LogicANY, EqualTo:EqualTo, LessThan:LessThan, LessThanOrEqualTo:LessThanOrEqualTo, LargerThan:LargerThan, LargerThanOrEqualTo:LargerThanOrEqualTo, Contains:Contains, StartsWith:StartsWith, EndsWith:EndsWith, Matches:Matches, IsEmpty:IsEmpty}, exprs);
});

