//>>built

define("dojox/mobile/_css3", ["dojo/_base/window", "dojo/_base/array", "dojo/has"], function (win, arr, has) {
    var cnames = [], hnames = [];
    var style = win.doc.createElement("div").style;
    var prefixes = ["webkit"];
    has.add("css3-animations", function (global, document, element) {
        var style = element.style;
        return (style["animation"] !== undefined && style["transition"] !== undefined) || arr.some(prefixes, function (p) {
            return style[p + "Animation"] !== undefined && style[p + "Transition"] !== undefined;
        });
    });
    has.add("t17164", function (global, document, element) {
        return (element.style["transition"] !== undefined) && !("TransitionEvent" in window);
    });
    var css3 = {name:function (p, hyphen) {
        var n = (hyphen ? hnames : cnames)[p];
        if (!n) {
            if (/End|Start/.test(p)) {
                var idx = p.length - (p.match(/End/) ? 3 : 5);
                var s = p.substr(0, idx);
                var pp = this.name(s);
                if (pp == s) {
                    n = p.toLowerCase();
                } else {
                    n = pp + p.substr(idx);
                }
            } else {
                if (p == "keyframes") {
                    var pk = this.name("animation", hyphen);
                    if (pk == "animation") {
                        n = p;
                    } else {
                        if (hyphen) {
                            n = pk.replace(/animation/, "keyframes");
                        } else {
                            n = pk.replace(/Animation/, "Keyframes");
                        }
                    }
                } else {
                    var cn = hyphen ? p.replace(/-(.)/g, function (match, p1) {
                        return p1.toUpperCase();
                    }) : p;
                    if (style[cn] !== undefined && !has("t17164")) {
                        n = p;
                    } else {
                        cn = cn.charAt(0).toUpperCase() + cn.slice(1);
                        arr.some(prefixes, function (prefix) {
                            if (style[prefix + cn] !== undefined) {
                                if (hyphen) {
                                    n = "-" + prefix + "-" + p;
                                } else {
                                    n = prefix + cn;
                                }
                            }
                        });
                    }
                }
            }
            if (!n) {
                n = p;
            }
            (hyphen ? hnames : cnames)[p] = n;
        }
        return n;
    }, add:function (styles, css3Styles) {
        for (var p in css3Styles) {
            if (css3Styles.hasOwnProperty(p)) {
                styles[css3.name(p)] = css3Styles[p];
            }
        }
        return styles;
    }};
    return css3;
});

