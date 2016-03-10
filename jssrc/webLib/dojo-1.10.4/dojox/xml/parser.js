//>>built

define("dojox/xml/parser", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/window", "dojo/_base/sniff"], function (dojo) {
    dojo.getObject("xml.parser", true, dojox);
    dojox.xml.parser.parse = function (str, mimetype) {
        var _document = dojo.doc;
        var doc;
        mimetype = mimetype || "text/xml";
        if (str && dojo.trim(str) && "DOMParser" in dojo.global) {
            var parser = new DOMParser();
            doc = parser.parseFromString(str, mimetype);
            var de = doc.documentElement;
            var errorNS = "http://www.mozilla.org/newlayout/xml/parsererror.xml";
            if (de.nodeName == "parsererror" && de.namespaceURI == errorNS) {
                var sourceText = de.getElementsByTagNameNS(errorNS, "sourcetext")[0];
                if (sourceText) {
                    sourceText = sourceText.firstChild.data;
                }
                throw new Error("Error parsing text " + de.firstChild.data + " \n" + sourceText);
            }
            return doc;
        } else {
            if ("ActiveXObject" in dojo.global) {
                var ms = function (n) {
                    return "MSXML" + n + ".DOMDocument";
                };
                var dp = ["Microsoft.XMLDOM", ms(6), ms(4), ms(3), ms(2)];
                dojo.some(dp, function (p) {
                    try {
                        doc = new ActiveXObject(p);
                    }
                    catch (e) {
                        return false;
                    }
                    return true;
                });
                if (str && doc) {
                    doc.async = false;
                    doc.loadXML(str);
                    var pe = doc.parseError;
                    if (pe.errorCode !== 0) {
                        throw new Error("Line: " + pe.line + "\n" + "Col: " + pe.linepos + "\n" + "Reason: " + pe.reason + "\n" + "Error Code: " + pe.errorCode + "\n" + "Source: " + pe.srcText);
                    }
                }
                if (doc) {
                    return doc;
                }
            } else {
                if (_document.implementation && _document.implementation.createDocument) {
                    if (str && dojo.trim(str) && _document.createElement) {
                        var tmp = _document.createElement("xml");
                        tmp.innerHTML = str;
                        var xmlDoc = _document.implementation.createDocument("foo", "", null);
                        dojo.forEach(tmp.childNodes, function (child) {
                            xmlDoc.importNode(child, true);
                        });
                        return xmlDoc;
                    } else {
                        return _document.implementation.createDocument("", "", null);
                    }
                }
            }
        }
        return null;
    };
    dojox.xml.parser.textContent = function (node, text) {
        if (arguments.length > 1) {
            var _document = node.ownerDocument || dojo.doc;
            dojox.xml.parser.replaceChildren(node, _document.createTextNode(text));
            return text;
        } else {
            if (node.textContent !== undefined) {
                return node.textContent;
            }
            var _result = "";
            if (node) {
                dojo.forEach(node.childNodes, function (child) {
                    switch (child.nodeType) {
                      case 1:
                      case 5:
                        _result += dojox.xml.parser.textContent(child);
                        break;
                      case 3:
                      case 2:
                      case 4:
                        _result += child.nodeValue;
                    }
                });
            }
            return _result;
        }
    };
    dojox.xml.parser.replaceChildren = function (node, newChildren) {
        var nodes = [];
        if (dojo.isIE) {
            dojo.forEach(node.childNodes, function (child) {
                nodes.push(child);
            });
        }
        dojox.xml.parser.removeChildren(node);
        dojo.forEach(nodes, dojo.destroy);
        if (!dojo.isArray(newChildren)) {
            node.appendChild(newChildren);
        } else {
            dojo.forEach(newChildren, function (child) {
                node.appendChild(child);
            });
        }
    };
    dojox.xml.parser.removeChildren = function (node) {
        var count = node.childNodes.length;
        while (node.hasChildNodes()) {
            node.removeChild(node.firstChild);
        }
        return count;
    };
    dojox.xml.parser.innerXML = function (node) {
        if (node.innerXML) {
            return node.innerXML;
        } else {
            if (node.xml) {
                return node.xml;
            } else {
                if (typeof XMLSerializer != "undefined") {
                    return (new XMLSerializer()).serializeToString(node);
                }
            }
        }
        return null;
    };
    return dojox.xml.parser;
});

