//>>built

define("dojox/validate/creditCard", ["dojo/_base/lang", "./_base"], function (lang, validate) {
    validate._cardInfo = {"mc":"5[1-5][0-9]{14}", "ec":"5[1-5][0-9]{14}", "vi":"4(?:[0-9]{12}|[0-9]{15})", "ax":"3[47][0-9]{13}", "dc":"3(?:0[0-5][0-9]{11}|[68][0-9]{12})", "bl":"3(?:0[0-5][0-9]{11}|[68][0-9]{12})", "di":"6011[0-9]{12}", "jcb":"(?:3[0-9]{15}|(2131|1800)[0-9]{11})", "er":"2(?:014|149)[0-9]{11}"};
    validate.isValidCreditCard = function (value, ccType) {
        return ((ccType.toLowerCase() == "er" || validate.isValidLuhn(value)) && validate.isValidCreditCardNumber(value, ccType.toLowerCase()));
    };
    validate.isValidCreditCardNumber = function (value, ccType) {
        value = String(value).replace(/[- ]/g, "");
        var cardinfo = validate._cardInfo, results = [];
        if (ccType) {
            var expr = "^" + cardinfo[ccType.toLowerCase()] + "$";
            return expr ? !!value.match(expr) : false;
        }
        for (var p in cardinfo) {
            if (value.match("^" + cardinfo[p] + "$")) {
                results.push(p);
            }
        }
        return results.length ? results.join("|") : false;
    };
    validate.isValidCvv = function (value, ccType) {
        if (!lang.isString(value)) {
            value = String(value);
        }
        var format;
        switch (ccType.toLowerCase()) {
          case "mc":
          case "ec":
          case "vi":
          case "di":
            format = "###";
            break;
          case "ax":
            format = "####";
            break;
        }
        return !!format && value.length && validate.isNumberFormat(value, {format:format});
    };
    return validate;
});

