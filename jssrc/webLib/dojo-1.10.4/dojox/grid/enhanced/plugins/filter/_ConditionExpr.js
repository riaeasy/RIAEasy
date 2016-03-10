//>>built

define("dojox/grid/enhanced/plugins/filter/_ConditionExpr", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array"], function (declare, lang, array) {
    var _ConditionExpr = declare("dojox.grid.enhanced.plugins.filter._ConditionExpr", null, {_name:"expr", applyRow:function (datarow, getter) {
        throw new Error("_ConditionExpr.applyRow: unimplemented interface");
    }, toObject:function () {
        return {};
    }, getName:function () {
        return this._name;
    }});
    var _DataExpr = declare("dojox.grid.enhanced.plugins.filter._DataExpr", _ConditionExpr, {_name:"data", constructor:function (dataValue, isColumn, convertArgs) {
        this._convertArgs = convertArgs || {};
        if (lang.isFunction(this._convertArgs.convert)) {
            this._convertData = lang.hitch(this._convertArgs.scope, this._convertArgs.convert);
        }
        if (isColumn) {
            this._colArg = dataValue;
        } else {
            this._value = this._convertData(dataValue, this._convertArgs);
        }
    }, getValue:function () {
        return this._value;
    }, applyRow:function (datarow, getter) {
        return typeof this._colArg == "undefined" ? this : new (lang.getObject(this.declaredClass))(this._convertData(getter(datarow, this._colArg), this._convertArgs));
    }, _convertData:function (dataValue) {
        return dataValue;
    }, toObject:function () {
        return {op:this.getName(), data:this._colArg === undefined ? this._value : this._colArg, isCol:this._colArg !== undefined};
    }});
    var _OperatorExpr = declare("dojox.grid.enhanced.plugins.filter._OperatorExpr", _ConditionExpr, {_name:"operator", constructor:function () {
        if (lang.isArray(arguments[0])) {
            this._operands = arguments[0];
        } else {
            this._operands = [];
            for (var i = 0; i < arguments.length; ++i) {
                this._operands.push(arguments[i]);
            }
        }
    }, toObject:function () {
        return {op:this.getName(), data:array.map(this._operands, function (operand) {
            return operand.toObject();
        })};
    }});
    var _UniOpExpr = declare("dojox.grid.enhanced.plugins.filter._UniOpExpr", _OperatorExpr, {_name:"uniOperator", applyRow:function (datarow, getter) {
        if (!(this._operands[0] instanceof _ConditionExpr)) {
            throw new Error("_UniOpExpr: operand is not expression.");
        }
        return this._calculate(this._operands[0], datarow, getter);
    }, _calculate:function (operand, datarow, getter) {
        throw new Error("_UniOpExpr._calculate: unimplemented interface");
    }});
    var _BiOpExpr = declare("dojox.grid.enhanced.plugins.filter._BiOpExpr", _OperatorExpr, {_name:"biOperator", applyRow:function (datarow, getter) {
        if (!(this._operands[0] instanceof _ConditionExpr)) {
            throw new Error("_BiOpExpr: left operand is not expression.");
        } else {
            if (!(this._operands[1] instanceof _ConditionExpr)) {
                throw new Error("_BiOpExpr: right operand is not expression.");
            }
        }
        return this._calculate(this._operands[0], this._operands[1], datarow, getter);
    }, _calculate:function (left_operand, right_operand, datarow, getter) {
        throw new Error("_BiOpExpr._calculate: unimplemented interface");
    }});
    return {_ConditionExpr:_ConditionExpr, _DataExpr:_DataExpr, _OperatorExpr:_OperatorExpr, _UniOpExpr:_UniOpExpr, _BiOpExpr:_BiOpExpr};
});

