//>>built

define("dojo/data/util/filter", ["../../_base/lang"], function (lang) {
    var filter = {};
    lang.setObject("dojo.data.util.filter", filter);
    filter.patternToRegExp = function (pattern, ignoreCase) {
        var rxp = "^";
        var c = null;
        for (var i = 0; i < pattern.length; i++) {
            c = pattern.charAt(i);
            switch (c) {
              case "\\":
                rxp += c;
                i++;
                rxp += pattern.charAt(i);
                break;
              case "*":
                rxp += ".*";
                break;
              case "?":
                rxp += ".";
                break;
              case "$":
              case "^":
              case "/":
              case "+":
              case ".":
              case "|":
              case "(":
              case ")":
              case "{":
              case "}":
              case "[":
              case "]":
                rxp += "\\";
              default:
                rxp += c;
            }
        }
        rxp += "$";
        if (ignoreCase) {
            return new RegExp(rxp, "mi");
        } else {
            return new RegExp(rxp, "m");
        }
    };
    return filter;
});

