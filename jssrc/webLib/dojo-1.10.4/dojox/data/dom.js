//>>built

define("dojox/data/dom", ["dojo/_base/kernel", "dojo/_base/lang", "dojox/xml/parser"], function (kernel, lang, xmlParser) {
    dojo.deprecated("dojox.data.dom", "Use dojox.xml.parser instead.", "2.0");
    var dataDom = lang.getObject("dojox.data.dom", true);
    dataDom.createDocument = function (str, mimetype) {
        dojo.deprecated("dojox.data.dom.createDocument()", "Use dojox.xml.parser.parse() instead.", "2.0");
        try {
            return xmlParser.parse(str, mimetype);
        }
        catch (e) {
            return null;
        }
    };
    dataDom.textContent = function (node, text) {
        dojo.deprecated("dojox.data.dom.textContent()", "Use dojox.xml.parser.textContent() instead.", "2.0");
        if (arguments.length > 1) {
            return xmlParser.textContent(node, text);
        } else {
            return xmlParser.textContent(node);
        }
    };
    dataDom.replaceChildren = function (node, newChildren) {
        dojo.deprecated("dojox.data.dom.replaceChildren()", "Use dojox.xml.parser.replaceChildren() instead.", "2.0");
        xmlParser.replaceChildren(node, newChildren);
    };
    dataDom.removeChildren = function (node) {
        dojo.deprecated("dojox.data.dom.removeChildren()", "Use dojox.xml.parser.removeChildren() instead.", "2.0");
        return dojox.xml.parser.removeChildren(node);
    };
    dataDom.innerXML = function (node) {
        dojo.deprecated("dojox.data.dom.innerXML()", "Use dojox.xml.parser.innerXML() instead.", "2.0");
        return xmlParser.innerXML(node);
    };
    return dataDom;
});

