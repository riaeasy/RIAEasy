//>>built

define("dojox/html/entities", ["dojo/_base/lang"], function (lang) {
    var dhe = lang.getObject("dojox.html.entities", true);
    var _applyEncodingMap = function (str, map) {
        var mapper, regexp;
        if (map._encCache && map._encCache.regexp && map._encCache.mapper && map.length == map._encCache.length) {
            mapper = map._encCache.mapper;
            regexp = map._encCache.regexp;
        } else {
            mapper = {};
            regexp = ["["];
            var i;
            for (i = 0; i < map.length; i++) {
                mapper[map[i][0]] = "&" + map[i][1] + ";";
                regexp.push(map[i][0]);
            }
            regexp.push("]");
            regexp = new RegExp(regexp.join(""), "g");
            map._encCache = {mapper:mapper, regexp:regexp, length:map.length};
        }
        str = str.replace(regexp, function (c) {
            return mapper[c];
        });
        return str;
    };
    var _applyDecodingMap = function (str, map) {
        var mapper, regexp;
        if (map._decCache && map._decCache.regexp && map._decCache.mapper && map.length == map._decCache.length) {
            mapper = map._decCache.mapper;
            regexp = map._decCache.regexp;
        } else {
            mapper = {};
            regexp = ["("];
            var i;
            for (i = 0; i < map.length; i++) {
                var e = "&" + map[i][1] + ";";
                if (i) {
                    regexp.push("|");
                }
                mapper[e] = map[i][0];
                regexp.push(e);
            }
            regexp.push(")");
            regexp = new RegExp(regexp.join(""), "g");
            map._decCache = {mapper:mapper, regexp:regexp, length:map.length};
        }
        str = str.replace(regexp, function (c) {
            return mapper[c];
        });
        return str;
    };
    dhe.html = [["&", "amp"], ["\"", "quot"], ["<", "lt"], [">", "gt"], ["\xa0", "nbsp"]];
    dhe.latin = [["\xa1", "iexcl"], ["\xa2", "cent"], ["\xa3", "pound"], ["\u20ac", "euro"], ["\xa4", "curren"], ["\xa5", "yen"], ["\xa6", "brvbar"], ["\xa7", "sect"], ["\xa8", "uml"], ["\xa9", "copy"], ["\xaa", "ordf"], ["\xab", "laquo"], ["\xac", "not"], ["\xad", "shy"], ["\xae", "reg"], ["\xaf", "macr"], ["\xb0", "deg"], ["\xb1", "plusmn"], ["\xb2", "sup2"], ["\xb3", "sup3"], ["\xb4", "acute"], ["\xb5", "micro"], ["\xb6", "para"], ["\xb7", "middot"], ["\xb8", "cedil"], ["\xb9", "sup1"], ["\xba", "ordm"], ["\xbb", "raquo"], ["\xbc", "frac14"], ["\xbd", "frac12"], ["\xbe", "frac34"], ["\xbf", "iquest"], ["\xc0", "Agrave"], ["\xc1", "Aacute"], ["\xc2", "Acirc"], ["\xc3", "Atilde"], ["\xc4", "Auml"], ["\xc5", "Aring"], ["\xc6", "AElig"], ["\xc7", "Ccedil"], ["\xc8", "Egrave"], ["\xc9", "Eacute"], ["\xca", "Ecirc"], ["\xcb", "Euml"], ["\xcc", "Igrave"], ["\xcd", "Iacute"], ["\xce", "Icirc"], ["\xcf", "Iuml"], ["\xd0", "ETH"], ["\xd1", "Ntilde"], ["\xd2", "Ograve"], ["\xd3", "Oacute"], ["\xd4", "Ocirc"], ["\xd5", "Otilde"], ["\xd6", "Ouml"], ["\xd7", "times"], ["\xd8", "Oslash"], ["\xd9", "Ugrave"], ["\xda", "Uacute"], ["\xdb", "Ucirc"], ["\xdc", "Uuml"], ["\xdd", "Yacute"], ["\xde", "THORN"], ["\xdf", "szlig"], ["\xe0", "agrave"], ["\xe1", "aacute"], ["\xe2", "acirc"], ["\xe3", "atilde"], ["\xe4", "auml"], ["\xe5", "aring"], ["\xe6", "aelig"], ["\xe7", "ccedil"], ["\xe8", "egrave"], ["\xe9", "eacute"], ["\xea", "ecirc"], ["\xeb", "euml"], ["\xec", "igrave"], ["\xed", "iacute"], ["\xee", "icirc"], ["\xef", "iuml"], ["\xf0", "eth"], ["\xf1", "ntilde"], ["\xf2", "ograve"], ["\xf3", "oacute"], ["\xf4", "ocirc"], ["\xf5", "otilde"], ["\xf6", "ouml"], ["\xf7", "divide"], ["\xf8", "oslash"], ["\xf9", "ugrave"], ["\xfa", "uacute"], ["\xfb", "ucirc"], ["\xfc", "uuml"], ["\xfd", "yacute"], ["\xfe", "thorn"], ["\xff", "yuml"], ["\u0192", "fnof"], ["\u0391", "Alpha"], ["\u0392", "Beta"], ["\u0393", "Gamma"], ["\u0394", "Delta"], ["\u0395", "Epsilon"], ["\u0396", "Zeta"], ["\u0397", "Eta"], ["\u0398", "Theta"], ["\u0399", "Iota"], ["\u039a", "Kappa"], ["\u039b", "Lambda"], ["\u039c", "Mu"], ["\u039d", "Nu"], ["\u039e", "Xi"], ["\u039f", "Omicron"], ["\u03a0", "Pi"], ["\u03a1", "Rho"], ["\u03a3", "Sigma"], ["\u03a4", "Tau"], ["\u03a5", "Upsilon"], ["\u03a6", "Phi"], ["\u03a7", "Chi"], ["\u03a8", "Psi"], ["\u03a9", "Omega"], ["\u03b1", "alpha"], ["\u03b2", "beta"], ["\u03b3", "gamma"], ["\u03b4", "delta"], ["\u03b5", "epsilon"], ["\u03b6", "zeta"], ["\u03b7", "eta"], ["\u03b8", "theta"], ["\u03b9", "iota"], ["\u03ba", "kappa"], ["\u03bb", "lambda"], ["\u03bc", "mu"], ["\u03bd", "nu"], ["\u03be", "xi"], ["\u03bf", "omicron"], ["\u03c0", "pi"], ["\u03c1", "rho"], ["\u03c2", "sigmaf"], ["\u03c3", "sigma"], ["\u03c4", "tau"], ["\u03c5", "upsilon"], ["\u03c6", "phi"], ["\u03c7", "chi"], ["\u03c8", "psi"], ["\u03c9", "omega"], ["\u03d1", "thetasym"], ["\u03d2", "upsih"], ["\u03d6", "piv"], ["\u2022", "bull"], ["\u2026", "hellip"], ["\u2032", "prime"], ["\u2033", "Prime"], ["\u203e", "oline"], ["\u2044", "frasl"], ["\u2118", "weierp"], ["\u2111", "image"], ["\u211c", "real"], ["\u2122", "trade"], ["\u2135", "alefsym"], ["\u2190", "larr"], ["\u2191", "uarr"], ["\u2192", "rarr"], ["\u2193", "darr"], ["\u2194", "harr"], ["\u21b5", "crarr"], ["\u21d0", "lArr"], ["\u21d1", "uArr"], ["\u21d2", "rArr"], ["\u21d3", "dArr"], ["\u21d4", "hArr"], ["\u2200", "forall"], ["\u2202", "part"], ["\u2203", "exist"], ["\u2205", "empty"], ["\u2207", "nabla"], ["\u2208", "isin"], ["\u2209", "notin"], ["\u220b", "ni"], ["\u220f", "prod"], ["\u2211", "sum"], ["\u2212", "minus"], ["\u2217", "lowast"], ["\u221a", "radic"], ["\u221d", "prop"], ["\u221e", "infin"], ["\u2220", "ang"], ["\u2227", "and"], ["\u2228", "or"], ["\u2229", "cap"], ["\u222a", "cup"], ["\u222b", "int"], ["\u2234", "there4"], ["\u223c", "sim"], ["\u2245", "cong"], ["\u2248", "asymp"], ["\u2260", "ne"], ["\u2261", "equiv"], ["\u2264", "le"], ["\u2265", "ge"], ["\u2282", "sub"], ["\u2283", "sup"], ["\u2284", "nsub"], ["\u2286", "sube"], ["\u2287", "supe"], ["\u2295", "oplus"], ["\u2297", "otimes"], ["\u22a5", "perp"], ["\u22c5", "sdot"], ["\u2308", "lceil"], ["\u2309", "rceil"], ["\u230a", "lfloor"], ["\u230b", "rfloor"], ["\u2329", "lang"], ["\u232a", "rang"], ["\u25ca", "loz"], ["\u2660", "spades"], ["\u2663", "clubs"], ["\u2665", "hearts"], ["\u2666", "diams"], ["\u0152", "OElig"], ["\u0153", "oelig"], ["\u0160", "Scaron"], ["\u0161", "scaron"], ["\u0178", "Yuml"], ["\u02c6", "circ"], ["\u02dc", "tilde"], ["\u2002", "ensp"], ["\u2003", "emsp"], ["\u2009", "thinsp"], ["\u200c", "zwnj"], ["\u200d", "zwj"], ["\u200e", "lrm"], ["\u200f", "rlm"], ["\u2013", "ndash"], ["\u2014", "mdash"], ["\u2018", "lsquo"], ["\u2019", "rsquo"], ["\u201a", "sbquo"], ["\u201c", "ldquo"], ["\u201d", "rdquo"], ["\u201e", "bdquo"], ["\u2020", "dagger"], ["\u2021", "Dagger"], ["\u2030", "permil"], ["\u2039", "lsaquo"], ["\u203a", "rsaquo"]];
    dhe.encode = function (str, m) {
        if (str) {
            if (!m) {
                str = _applyEncodingMap(str, dhe.html);
                str = _applyEncodingMap(str, dhe.latin);
            } else {
                str = _applyEncodingMap(str, m);
            }
        }
        return str;
    };
    dhe.decode = function (str, m) {
        if (str) {
            if (!m) {
                str = _applyDecodingMap(str, dhe.html);
                str = _applyDecodingMap(str, dhe.latin);
            } else {
                str = _applyDecodingMap(str, m);
            }
        }
        return str;
    };
    return dhe;
});

