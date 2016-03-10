//>>built

define("dojox/drawing/util/typeset", ["../library/greek"], function (greeks) {
    return {convertHTML:function (inText) {
        if (inText) {
            return inText.replace(/&([^;]+);/g, function (match, code) {
                if (code.charAt(0) == "#") {
                    var number = +code.substr(1);
                    if (!isNaN(number)) {
                        return String.fromCharCode(number);
                    }
                } else {
                    if (greeks[code]) {
                        return String.fromCharCode(greeks[code]);
                    }
                }
                console.warn("no HTML conversion for ", match);
                return match;
            });
        }
        return inText;
    }, convertLaTeX:function (inText) {
        if (inText) {
            return inText.replace(/\\([a-zA-Z]+)/g, function (match, word) {
                if (greeks[word]) {
                    return String.fromCharCode(greeks[word]);
                } else {
                    if (word.substr(0, 2) == "mu") {
                        return String.fromCharCode(greeks["mu"]) + word.substr(2);
                    } else {
                        if (word.substr(0, 5) == "theta") {
                            return String.fromCharCode(greeks["theta"]) + word.substr(5);
                        } else {
                            if (word.substr(0, 3) == "phi") {
                                return String.fromCharCode(greeks["phi"]) + word.substr(3);
                            }
                        }
                    }
                }
                console.log("no match for ", match, " in ", inText);
                console.log("Need user-friendly error handling here!");
            }).replace(/\\\\/g, "\\");
        }
        return inText;
    }};
});

