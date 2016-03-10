//>>built

define("dijit/_editor/html", ["dojo/_base/array", "dojo/_base/lang", "dojo/sniff"], function (array, lang, has) {
    var exports = {};
    lang.setObject("dijit._editor.html", exports);
    var escape = exports.escapeXml = function (str, noSingleQuotes) {
        str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
        if (!noSingleQuotes) {
            str = str.replace(/'/gm, "&#39;");
        }
        return str;
    };
    exports.getNodeHtml = function (node) {
        var output = [];
        exports.getNodeHtmlHelper(node, output);
        return output.join("");
    };
    exports.getNodeHtmlHelper = function (node, output) {
        switch (node.nodeType) {
          case 1:
            var lName = node.nodeName.toLowerCase();
            if (!lName || lName.charAt(0) == "/") {
                return "";
            }
            output.push("<", lName);
            var attrarray = [], attrhash = {};
            var attr;
            if (has("dom-attributes-explicit") || has("dom-attributes-specified-flag")) {
                var i = 0;
                while ((attr = node.attributes[i++])) {
                    var n = attr.name;
                    if (n.substr(0, 3) !== "_dj" && (!has("dom-attributes-specified-flag") || attr.specified) && !(n in attrhash)) {
                        var v = attr.value;
                        if (n == "src" || n == "href") {
                            if (node.getAttribute("_djrealurl")) {
                                v = node.getAttribute("_djrealurl");
                            }
                        }
                        if (has("ie") === 8 && n === "style") {
                            v = v.replace("HEIGHT:", "height:").replace("WIDTH:", "width:");
                        }
                        attrarray.push([n, v]);
                        attrhash[n] = v;
                    }
                }
            } else {
                var clone = /^input$|^img$/i.test(node.nodeName) ? node : node.cloneNode(false);
                var s = clone.outerHTML;
                var rgxp_attrsMatch = /[\w-]+=("[^"]*"|'[^']*'|\S*)/gi;
                var attrSplit = s.match(rgxp_attrsMatch);
                s = s.substr(0, s.indexOf(">"));
                array.forEach(attrSplit, function (attr) {
                    if (attr) {
                        var idx = attr.indexOf("=");
                        if (idx > 0) {
                            var key = attr.substring(0, idx);
                            if (key.substr(0, 3) != "_dj") {
                                if (key == "src" || key == "href") {
                                    if (node.getAttribute("_djrealurl")) {
                                        attrarray.push([key, node.getAttribute("_djrealurl")]);
                                        return;
                                    }
                                }
                                var val, match;
                                switch (key) {
                                  case "style":
                                    val = node.style.cssText.toLowerCase();
                                    break;
                                  case "class":
                                    val = node.className;
                                    break;
                                  case "width":
                                    if (lName === "img") {
                                        match = /width=(\S+)/i.exec(s);
                                        if (match) {
                                            val = match[1];
                                        }
                                        break;
                                    }
                                  case "height":
                                    if (lName === "img") {
                                        match = /height=(\S+)/i.exec(s);
                                        if (match) {
                                            val = match[1];
                                        }
                                        break;
                                    }
                                  default:
                                    val = node.getAttribute(key);
                                }
                                if (val != null) {
                                    attrarray.push([key, val.toString()]);
                                }
                            }
                        }
                    }
                }, this);
            }
            attrarray.sort(function (a, b) {
                return a[0] < b[0] ? -1 : (a[0] == b[0] ? 0 : 1);
            });
            var j = 0;
            while ((attr = attrarray[j++])) {
                output.push(" ", attr[0], "=\"", (typeof attr[1] === "string" ? escape(attr[1], true) : attr[1]), "\"");
            }
            switch (lName) {
              case "br":
              case "hr":
              case "img":
              case "input":
              case "base":
              case "meta":
              case "area":
              case "basefont":
                output.push(" />");
                break;
              case "script":
                output.push(">", node.innerHTML, "</", lName, ">");
                break;
              default:
                output.push(">");
                if (node.hasChildNodes()) {
                    exports.getChildrenHtmlHelper(node, output);
                }
                output.push("</", lName, ">");
            }
            break;
          case 4:
          case 3:
            output.push(escape(node.nodeValue, true));
            break;
          case 8:
            output.push("<!--", escape(node.nodeValue, true), "-->");
            break;
          default:
            output.push("<!-- Element not recognized - Type: ", node.nodeType, " Name: ", node.nodeName, "-->");
        }
    };
    exports.getChildrenHtml = function (node) {
        var output = [];
        exports.getChildrenHtmlHelper(node, output);
        return output.join("");
    };
    exports.getChildrenHtmlHelper = function (dom, output) {
        if (!dom) {
            return;
        }
        var nodes = dom["childNodes"] || dom;
        var checkParent = !has("ie") || nodes !== dom;
        var node, i = 0;
        while ((node = nodes[i++])) {
            if (!checkParent || node.parentNode == dom) {
                exports.getNodeHtmlHelper(node, output);
            }
        }
    };
    return exports;
});

