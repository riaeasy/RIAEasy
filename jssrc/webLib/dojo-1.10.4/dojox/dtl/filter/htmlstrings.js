//>>built

define("dojox/dtl/filter/htmlstrings", ["dojo/_base/lang", "../_base"], function (lang, dd) {
    var htmlstrings = lang.getObject("filter.htmlstrings", true, dd);
    lang.mixin(htmlstrings, {_linebreaksrn:/(\r\n|\n\r)/g, _linebreaksn:/\n{2,}/g, _linebreakss:/(^\s+|\s+$)/g, _linebreaksbr:/\n/g, _removetagsfind:/[a-z0-9]+/g, _striptags:/<[^>]*?>/g, linebreaks:function (value) {
        var output = [];
        var dh = htmlstrings;
        value = value.replace(dh._linebreaksrn, "\n");
        var parts = value.split(dh._linebreaksn);
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i].replace(dh._linebreakss, "").replace(dh._linebreaksbr, "<br />");
            output.push("<p>" + part + "</p>");
        }
        return output.join("\n\n");
    }, linebreaksbr:function (value) {
        var dh = htmlstrings;
        return value.replace(dh._linebreaksrn, "\n").replace(dh._linebreaksbr, "<br />");
    }, removetags:function (value, arg) {
        var dh = htmlstrings;
        var tags = [];
        var group;
        while (group = dh._removetagsfind.exec(arg)) {
            tags.push(group[0]);
        }
        tags = "(" + tags.join("|") + ")";
        return value.replace(new RegExp("</?s*" + tags + "s*[^>]*>", "gi"), "");
    }, striptags:function (value) {
        return value.replace(dojox.dtl.filter.htmlstrings._striptags, "");
    }});
    return htmlstrings;
});

