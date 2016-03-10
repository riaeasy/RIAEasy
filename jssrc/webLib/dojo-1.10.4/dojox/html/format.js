//>>built

define("dojox/html/format", ["dojo/_base/kernel", "./entities", "dojo/_base/array", "dojo/_base/window", "dojo/_base/sniff"], function (lang, Entities, ArrayUtil, Window, has) {
    var dhf = lang.getObject("dojox.html.format", true);
    dhf.prettyPrint = function (html, indentBy, maxLineLength, map, xhtml) {
        var content = [];
        var indentDepth = 0;
        var closeTags = [];
        var iTxt = "\t";
        var textContent = "";
        var inlineStyle = [];
        var i;
        var rgxp_fixIEAttrs = /[=]([^"']+?)(\s|>)/g;
        var rgxp_styleMatch = /style=("[^"]*"|'[^']*'|\S*)/gi;
        var rgxp_attrsMatch = /[\w-]+=("[^"]*"|'[^']*'|\S*)/gi;
        if (indentBy && indentBy > 0 && indentBy < 10) {
            iTxt = "";
            for (i = 0; i < indentBy; i++) {
                iTxt += " ";
            }
        }
        var contentDiv = Window.doc.createElement("div");
        contentDiv.innerHTML = html;
        var encode = Entities.encode;
        var decode = Entities.decode;
        var isInlineFormat = function (tag) {
            switch (tag) {
              case "a":
              case "b":
              case "strong":
              case "s":
              case "strike":
              case "i":
              case "u":
              case "em":
              case "sup":
              case "sub":
              case "span":
              case "font":
              case "big":
              case "cite":
              case "q":
              case "small":
                return true;
              default:
                return false;
            }
        };
        var div = contentDiv.ownerDocument.createElement("div");
        var outerHTML = function (node) {
            var clone = node.cloneNode(false);
            div.appendChild(clone);
            var html = div.innerHTML;
            div.innerHTML = "";
            return html;
        };
        var sizeIndent = function () {
            var i, txt = "";
            for (i = 0; i < indentDepth; i++) {
                txt += iTxt;
            }
            return txt.length;
        };
        var indent = function () {
            var i;
            for (i = 0; i < indentDepth; i++) {
                content.push(iTxt);
            }
        };
        var newline = function () {
            content.push("\n");
        };
        var processTextNode = function (n) {
            textContent += encode(n.nodeValue, map);
        };
        var formatText = function (txt) {
            var i;
            var _iTxt;
            var _lines = txt.split("\n");
            for (i = 0; i < _lines.length; i++) {
                _lines[i] = lang.trim(_lines[i]);
            }
            txt = _lines.join(" ");
            txt = lang.trim(txt);
            if (txt !== "") {
                var lines = [];
                if (maxLineLength && maxLineLength > 0) {
                    var indentSize = sizeIndent();
                    var maxLine = maxLineLength;
                    if (maxLineLength > indentSize) {
                        maxLine -= indentSize;
                    }
                    while (txt) {
                        if (txt.length > maxLineLength) {
                            for (i = maxLine; (i > 0 && txt.charAt(i) !== " "); i--) {
                            }
                            if (!i) {
                                for (i = maxLine; (i < txt.length && txt.charAt(i) !== " "); i++) {
                                }
                            }
                            var line = txt.substring(0, i);
                            line = lang.trim(line);
                            txt = lang.trim(txt.substring((i == txt.length) ? txt.length : i + 1, txt.length));
                            if (line) {
                                _iTxt = "";
                                for (i = 0; i < indentDepth; i++) {
                                    _iTxt += iTxt;
                                }
                                line = _iTxt + line + "\n";
                            }
                            lines.push(line);
                        } else {
                            _iTxt = "";
                            for (i = 0; i < indentDepth; i++) {
                                _iTxt += iTxt;
                            }
                            txt = _iTxt + txt + "\n";
                            lines.push(txt);
                            txt = null;
                        }
                    }
                    return lines.join("");
                } else {
                    _iTxt = "";
                    for (i = 0; i < indentDepth; i++) {
                        _iTxt += iTxt;
                    }
                    txt = _iTxt + txt + "\n";
                    return txt;
                }
            } else {
                return "";
            }
        };
        var processScriptText = function (txt) {
            if (txt) {
                txt = txt.replace(/&quot;/gi, "\"");
                txt = txt.replace(/&gt;/gi, ">");
                txt = txt.replace(/&lt;/gi, "<");
                txt = txt.replace(/&amp;/gi, "&");
            }
            return txt;
        };
        var formatScript = function (txt) {
            if (txt) {
                txt = processScriptText(txt);
                var i, t, c, _iTxt;
                var indent = 0;
                var scriptLines = txt.split("\n");
                var newLines = [];
                for (i = 0; i < scriptLines.length; i++) {
                    var line = scriptLines[i];
                    var hasNewlines = (line.indexOf("\n") > -1);
                    line = lang.trim(line);
                    if (line) {
                        var iLevel = indent;
                        for (c = 0; c < line.length; c++) {
                            var ch = line.charAt(c);
                            if (ch === "{") {
                                indent++;
                            } else {
                                if (ch === "}") {
                                    indent--;
                                    iLevel = indent;
                                }
                            }
                        }
                        _iTxt = "";
                        for (t = 0; t < indentDepth + iLevel; t++) {
                            _iTxt += iTxt;
                        }
                        newLines.push(_iTxt + line + "\n");
                    } else {
                        if (hasNewlines && i === 0) {
                            newLines.push("\n");
                        }
                    }
                }
                txt = newLines.join("");
            }
            return txt;
        };
        var openTag = function (node) {
            var name = node.nodeName.toLowerCase();
            var nText = lang.trim(outerHTML(node));
            var tag = nText.substring(0, nText.indexOf(">") + 1);
            tag = tag.replace(rgxp_fixIEAttrs, "=\"$1\"$2");
            tag = tag.replace(rgxp_styleMatch, function (match) {
                var sL = match.substring(0, 6);
                var style = match.substring(6, match.length);
                var closure = style.charAt(0);
                style = lang.trim(style.substring(1, style.length - 1));
                style = style.split(";");
                var trimmedStyles = [];
                ArrayUtil.forEach(style, function (s) {
                    s = lang.trim(s);
                    if (s) {
                        s = s.substring(0, s.indexOf(":")).toLowerCase() + s.substring(s.indexOf(":"), s.length);
                        trimmedStyles.push(s);
                    }
                });
                trimmedStyles = trimmedStyles.sort();
                style = trimmedStyles.join("; ");
                var ts = lang.trim(style);
                if (!ts || ts === ";") {
                    return "";
                } else {
                    style += ";";
                    return sL + closure + style + closure;
                }
            });
            var attrs = [];
            tag = tag.replace(rgxp_attrsMatch, function (attr) {
                attrs.push(lang.trim(attr));
                return "";
            });
            attrs = attrs.sort();
            tag = "<" + name;
            if (attrs.length) {
                tag += " " + attrs.join(" ");
            }
            if (nText.indexOf("</") != -1) {
                closeTags.push(name);
                tag += ">";
            } else {
                if (xhtml) {
                    tag += " />";
                } else {
                    tag += ">";
                }
                closeTags.push(false);
            }
            var inline = isInlineFormat(name);
            inlineStyle.push(inline);
            if (textContent && !inline) {
                content.push(formatText(textContent));
                textContent = "";
            }
            if (!inline) {
                indent();
                content.push(tag);
                newline();
                indentDepth++;
            } else {
                textContent += tag;
            }
        };
        var closeTag = function () {
            var inline = inlineStyle.pop();
            if (textContent && !inline) {
                content.push(formatText(textContent));
                textContent = "";
            }
            var ct = closeTags.pop();
            if (ct) {
                ct = "</" + ct + ">";
                if (!inline) {
                    indentDepth--;
                    indent();
                    content.push(ct);
                    newline();
                } else {
                    textContent += ct;
                }
            } else {
                indentDepth--;
            }
        };
        var processCommentNode = function (n) {
            var commentText = decode(n.nodeValue, map);
            indent();
            content.push("<!--");
            newline();
            indentDepth++;
            content.push(formatText(commentText));
            indentDepth--;
            indent();
            content.push("-->");
            newline();
        };
        var processNode = function (node) {
            var children = node.childNodes;
            if (children) {
                var i;
                for (i = 0; i < children.length; i++) {
                    var n = children[i];
                    if (n.nodeType === 1) {
                        var tg = lang.trim(n.tagName.toLowerCase());
                        if (has("ie") && n.parentNode != node) {
                            continue;
                        }
                        if (tg && tg.charAt(0) === "/") {
                            continue;
                        } else {
                            openTag(n);
                            if (tg === "script") {
                                content.push(formatScript(n.innerHTML));
                            } else {
                                if (tg === "pre") {
                                    var preTxt = n.innerHTML;
                                    if (has("mozilla")) {
                                        preTxt = preTxt.replace("<br>", "\n");
                                        preTxt = preTxt.replace("<pre>", "");
                                        preTxt = preTxt.replace("</pre>", "");
                                    }
                                    if (preTxt.charAt(preTxt.length - 1) !== "\n") {
                                        preTxt += "\n";
                                    }
                                    content.push(preTxt);
                                } else {
                                    processNode(n);
                                }
                            }
                            closeTag();
                        }
                    } else {
                        if (n.nodeType === 3 || n.nodeType === 4) {
                            processTextNode(n);
                        } else {
                            if (n.nodeType === 8) {
                                processCommentNode(n);
                            }
                        }
                    }
                }
            }
        };
        processNode(contentDiv);
        if (textContent) {
            content.push(formatText(textContent));
            textContent = "";
        }
        return content.join("");
    };
    return dhf;
});

