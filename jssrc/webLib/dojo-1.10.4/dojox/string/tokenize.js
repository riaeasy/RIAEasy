//>>built

define("dojox/string/tokenize", ["dojo/_base/lang", "dojo/_base/sniff"], function (lang, has) {
    var tokenize = lang.getObject("dojox.string", true).tokenize;
    tokenize = function (str, re, parseDelim, instance) {
        var tokens = [];
        var match, content, lastIndex = 0;
        while (match = re.exec(str)) {
            content = str.slice(lastIndex, re.lastIndex - match[0].length);
            if (content.length) {
                tokens.push(content);
            }
            if (parseDelim) {
                if (has("opera")) {
                    var copy = match.slice(0);
                    while (copy.length < match.length) {
                        copy.push(null);
                    }
                    match = copy;
                }
                var parsed = parseDelim.apply(instance, match.slice(1).concat(tokens.length));
                if (typeof parsed != "undefined") {
                    tokens.push(parsed);
                }
            }
            lastIndex = re.lastIndex;
        }
        content = str.slice(lastIndex);
        if (content.length) {
            tokens.push(content);
        }
        return tokens;
    };
    return tokenize;
});

