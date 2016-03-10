//>>built

define("dojox/io/httpParse", ["dojo/_base/kernel"], function (dojo) {
    dojo.getObject("io.httpParse", true, dojox);
    dojox.io.httpParse = function (httpStream, topHeaders, partial) {
        var xhrs = [];
        var streamLength = httpStream.length;
        do {
            var headers = {};
            var httpParts = httpStream.match(/(\n*[^\n]+)/);
            if (!httpParts) {
                return null;
            }
            httpStream = httpStream.substring(httpParts[0].length + 1);
            httpParts = httpParts[1];
            var headerParts = httpStream.match(/([^\n]+\n)*/)[0];
            httpStream = httpStream.substring(headerParts.length);
            var headerFollowingChar = httpStream.substring(0, 1);
            httpStream = httpStream.substring(1);
            headerParts = (topHeaders || "") + headerParts;
            var headerStr = headerParts;
            headerParts = headerParts.match(/[^:\n]+:[^\n]+\n/g);
            for (var j = 0; j < headerParts.length; j++) {
                var colonIndex = headerParts[j].indexOf(":");
                headers[headerParts[j].substring(0, colonIndex)] = headerParts[j].substring(colonIndex + 1).replace(/(^[ \r\n]*)|([ \r\n]*)$/g, "");
            }
            httpParts = httpParts.split(" ");
            var xhr = {status:parseInt(httpParts[1], 10), statusText:httpParts[2], readyState:3, getAllResponseHeaders:function () {
                return headerStr;
            }, getResponseHeader:function (name) {
                return headers[name];
            }};
            var contentLength = headers["Content-Length"];
            var content;
            if (contentLength) {
                if (contentLength <= httpStream.length) {
                    content = httpStream.substring(0, contentLength);
                } else {
                    return xhrs;
                }
            } else {
                if ((content = httpStream.match(/(.*)HTTP\/\d\.\d \d\d\d[\w\s]*\n/))) {
                    content = content[0];
                } else {
                    if (!partial || headerFollowingChar == "\n") {
                        content = httpStream;
                    } else {
                        return xhrs;
                    }
                }
            }
            xhrs.push(xhr);
            httpStream = httpStream.substring(content.length);
            xhr.responseText = content;
            xhr.readyState = 4;
            xhr._lastIndex = streamLength - httpStream.length;
        } while (httpStream);
        return xhrs;
    };
    return dojox.io.httpParse;
});

