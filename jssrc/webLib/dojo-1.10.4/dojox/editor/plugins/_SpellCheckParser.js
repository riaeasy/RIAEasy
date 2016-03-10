//>>built

define("dojox/editor/plugins/_SpellCheckParser", ["dojo", "dojox", "dojo/_base/connect", "dojo/_base/declare"], function (dojo, dojox) {
    var SpellCheckParser = dojo.declare("dojox.editor.plugins._SpellCheckParser", null, {lang:"english", parseIntoWords:function (text) {
        function isCharExt(c) {
            var ch = c.charCodeAt(0);
            return 48 <= ch && ch <= 57 || 65 <= ch && ch <= 90 || 97 <= ch && ch <= 122;
        }
        var words = this.words = [], indices = this.indices = [], index = 0, length = text && text.length, start = 0;
        while (index < length) {
            var ch;
            while (index < length && !isCharExt(ch = text.charAt(index)) && ch != "&") {
                index++;
            }
            if (ch == "&") {
                while (++index < length && (ch = text.charAt(index)) != ";" && isCharExt(ch)) {
                }
            } else {
                start = index;
                while (++index < length && isCharExt(text.charAt(index))) {
                }
                if (start < length) {
                    words.push(text.substring(start, index));
                    indices.push(start);
                }
            }
        }
        return words;
    }, getIndices:function () {
        return this.indices;
    }});
    dojo.subscribe(dijit._scopeName + ".Editor.plugin.SpellCheck.getParser", null, function (sp) {
        if (sp.parser) {
            return;
        }
        sp.parser = new SpellCheckParser();
    });
    return SpellCheckParser;
});

