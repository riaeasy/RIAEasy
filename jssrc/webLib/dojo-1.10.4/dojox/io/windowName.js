//>>built

define("dojox/io/windowName", ["dojo/_base/kernel", "dojo/_base/window", "dojo/_base/xhr", "dojo/_base/sniff", "dojo/_base/url", "dojo/domReady!"], function (dojo) {
    dojo.getObject("io.windowName", true, dojox);
    dojox.io.windowName = {send:function (method, args) {
        args.url += (args.url.match(/\?/) ? "&" : "?") + "windowname=" + (args.authElement ? "auth" : true);
        var authElement = args.authElement;
        var cleanup = function (result) {
            try {
                var innerDoc = dfd.ioArgs.frame.contentWindow.document;
                innerDoc.write(" ");
                innerDoc.close();
            }
            catch (e) {
            }
            (authElement || dojo.body()).removeChild(dfd.ioArgs.outerFrame);
            return result;
        };
        var dfd = dojo._ioSetArgs(args, cleanup, cleanup, cleanup);
        if (args.timeout) {
            setTimeout(function () {
                if (dfd.fired == -1) {
                    dfd.callback(new Error("Timeout"));
                }
            }, args.timeout);
        }
        dojox.io.windowName._send(dfd, method, authElement, args.onAuthLoad);
        return dfd;
    }, _send:function (dfd, method, authTarget, onAuthLoad) {
        var ioArgs = dfd.ioArgs;
        var frameNum = dojox.io.windowName._frameNum++;
        var sameDomainUrl = (dojo.config.dojoBlankHtmlUrl || dojo.config.dojoCallbackUrl || dojo.moduleUrl("dojo", "resources/blank.html")) + "#" + frameNum;
        var frameName = new dojo._Url(window.location, sameDomainUrl);
        var doc = dojo.doc;
        var frameContainer = authTarget || dojo.body();
        function styleFrame(frame) {
            frame.style.width = "100%";
            frame.style.height = "100%";
            frame.style.border = "0px";
        }
        if (dojo.isMoz && ![].reduce) {
            var outerFrame = doc.createElement("iframe");
            styleFrame(outerFrame);
            if (!authTarget) {
                outerFrame.style.display = "none";
            }
            frameContainer.appendChild(outerFrame);
            var firstWindow = outerFrame.contentWindow;
            doc = firstWindow.document;
            doc.write("<html><body margin='0px'><iframe style='width:100%;height:100%;border:0px' name='protectedFrame'></iframe></body></html>");
            doc.close();
            var secondWindow = firstWindow[0];
            firstWindow.__defineGetter__(0, function () {
            });
            firstWindow.__defineGetter__("protectedFrame", function () {
            });
            doc = secondWindow.document;
            doc.write("<html><body margin='0px'></body></html>");
            doc.close();
            frameContainer = doc.body;
        }
        var frame;
        if (dojo.isIE) {
            var div = doc.createElement("div");
            div.innerHTML = "<iframe name=\"" + frameName + "\" onload=\"dojox.io.windowName[" + frameNum + "]()\">";
            frame = div.firstChild;
        } else {
            frame = doc.createElement("iframe");
        }
        ioArgs.frame = frame;
        styleFrame(frame);
        ioArgs.outerFrame = outerFrame = outerFrame || frame;
        if (!authTarget) {
            outerFrame.style.display = "none";
        }
        var state = 0;
        function getData() {
            var data = frame.contentWindow.name;
            if (typeof data == "string") {
                if (data != frameName) {
                    state = 2;
                    dfd.ioArgs.hash = frame.contentWindow.location.hash;
                    dfd.callback(data);
                }
            }
        }
        dojox.io.windowName[frameNum] = frame.onload = function () {
            try {
                if (!dojo.isMoz && frame.contentWindow.location == "about:blank") {
                    return;
                }
            }
            catch (e) {
            }
            if (!state) {
                state = 1;
                if (authTarget) {
                    if (onAuthLoad) {
                        onAuthLoad();
                    }
                } else {
                    frame.contentWindow.location = sameDomainUrl;
                }
            }
            try {
                if (state < 2) {
                    getData();
                }
            }
            catch (e) {
            }
        };
        frame.name = frameName;
        if (method.match(/GET/i)) {
            dojo._ioAddQueryToUrl(ioArgs);
            frame.src = ioArgs.url;
            frameContainer.appendChild(frame);
            if (frame.contentWindow) {
                frame.contentWindow.location.replace(ioArgs.url);
            }
        } else {
            if (method.match(/POST/i)) {
                frameContainer.appendChild(frame);
                var form = dojo.doc.createElement("form");
                dojo.body().appendChild(form);
                var query = dojo.queryToObject(ioArgs.query);
                for (var i in query) {
                    var values = query[i];
                    values = values instanceof Array ? values : [values];
                    for (var j = 0; j < values.length; j++) {
                        var input = doc.createElement("input");
                        input.type = "hidden";
                        input.name = i;
                        input.value = values[j];
                        form.appendChild(input);
                    }
                }
                form.method = "POST";
                form.action = ioArgs.url;
                form.target = frameName;
                form.submit();
                form.parentNode.removeChild(form);
            } else {
                throw new Error("Method " + method + " not supported with the windowName transport");
            }
        }
        if (frame.contentWindow) {
            frame.contentWindow.name = frameName;
        }
    }, _frameNum:0};
    return dojox.io.windowName;
});

