//>>built

define("dijit/form/CurrencyTextBox", ["dojo/currency", "dojo/_base/declare", "dojo/_base/lang", "./NumberTextBox"], function (currency, declare, lang, NumberTextBox) {
    return declare("dijit.form.CurrencyTextBox", NumberTextBox, {currency:"", baseClass:"dijitTextBox dijitCurrencyTextBox", _formatter:currency.format, _parser:currency.parse, _regExpGenerator:currency.regexp, parse:function (value, constraints) {
        var v = this.inherited(arguments);
        if (isNaN(v) && /\d+/.test(value)) {
            v = lang.hitch(lang.delegate(this, {_parser:NumberTextBox.prototype._parser}), "inherited")(arguments);
        }
        return v;
    }, _setConstraintsAttr:function (constraints) {
        if (!constraints.currency && this.currency) {
            constraints.currency = this.currency;
        }
        this.inherited(arguments, [currency._mixInDefaults(lang.mixin(constraints, {exponent:false}))]);
    }});
});

