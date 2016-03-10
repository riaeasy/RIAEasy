//>>built

define("dojox/io/xhrMultiPart", ["dojo/_base/kernel", "dojo/_base/array", "dojo/_base/xhr", "dojo/query", "dojox/uuid/generateRandomUuid"], function (dojo, array, xhr, query, generateRandomUuid) {
    dojo.getObject("io.xhrMultiPart", true, dojox);
    function _createPart(args, boundary) {
        if (!args["name"] && !args["content"]) {
            throw new Error("Each part of a multi-part request requires 'name' and 'content'.");
        }
        var tmp = [];
        tmp.push("--" + boundary, "Content-Disposition: form-data; name=\"" + args.name + "\"" + (args["filename"] ? "; filename=\"" + args.filename + "\"" : ""));
        if (args["contentType"]) {
            var ct = "Content-Type: " + args.contentType;
            if (args["charset"]) {
                ct += "; Charset=" + args.charset;
            }
            tmp.push(ct);
        }
        if (args["contentTransferEncoding"]) {
            tmp.push("Content-Transfer-Encoding: " + args.contentTransferEncoding);
        }
        tmp.push("", args.content);
        return tmp;
    }
    function _partsFromNode(node, boundary) {
        var o = dojo.formToObject(node), parts = [];
        for (var p in o) {
            if (dojo.isArray(o[p])) {
                dojo.forEach(o[p], function (item) {
                    parts = parts.concat(_createPart({name:p, content:item}, boundary));
                });
            } else {
                parts = parts.concat(_createPart({name:p, content:o[p]}, boundary));
            }
        }
        return parts;
    }
    dojox.io.xhrMultiPart = function (args) {
        if (!args["file"] && !args["content"] && !args["form"]) {
            throw new Error("content, file or form must be provided to dojox.io.xhrMultiPart's arguments");
        }
        var boundary = generateRandomUuid(), tmp = [], out = "";
        if (args["file"] || args["content"]) {
            var v = args["file"] || args["content"];
            dojo.forEach((dojo.isArray(v) ? v : [v]), function (item) {
                tmp = tmp.concat(_createPart(item, boundary));
            });
        } else {
            if (args["form"]) {
                if (query("input[type=file]", args["form"]).length) {
                    throw new Error("dojox.io.xhrMultiPart cannot post files that are values of an INPUT TYPE=FILE.  Use dojo.io.iframe.send() instead.");
                }
                tmp = _partsFromNode(args["form"], boundary);
            }
        }
        if (tmp.length) {
            tmp.push("--" + boundary + "--", "");
            out = tmp.join("\r\n");
        }
        console.log(out);
        return dojo.rawXhrPost(dojo.mixin(args, {contentType:"multipart/form-data; boundary=" + boundary, postData:out}));
    };
    return dojox.io.xhrMultiPart;
});

