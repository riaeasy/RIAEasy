//>>built

define("dojo/back", ["./_base/config", "./_base/lang", "./sniff", "./dom", "./dom-construct", "./_base/window", "require"], function (config, lang, has, dom, domConstruct, baseWindow, require) {
    var back = {};
    1 && lang.setObject("dojo.back", back);
    var getHash = back.getHash = function () {
        var h = window.location.hash;
        if (h.charAt(0) == "#") {
            h = h.substring(1);
        }
        return has("mozilla") ? h : decodeURIComponent(h);
    }, setHash = back.setHash = function (h) {
        if (!h) {
            h = "";
        }
        window.location.hash = encodeURIComponent(h);
        historyCounter = history.length;
    };
    var initialHref = (typeof (window) !== "undefined") ? window.location.href : "";
    var initialHash = (typeof (window) !== "undefined") ? getHash() : "";
    var initialState = null;
    var locationTimer = null;
    var bookmarkAnchor = null;
    var historyIframe = null;
    var forwardStack = [];
    var historyStack = [];
    var moveForward = false;
    var changingUrl = false;
    var historyCounter;
    function handleBackButton() {
        var current = historyStack.pop();
        if (!current) {
            return;
        }
        var last = historyStack[historyStack.length - 1];
        if (!last && historyStack.length == 0) {
            last = initialState;
        }
        if (last) {
            if (last.kwArgs["back"]) {
                last.kwArgs["back"]();
            } else {
                if (last.kwArgs["backButton"]) {
                    last.kwArgs["backButton"]();
                } else {
                    if (last.kwArgs["handle"]) {
                        last.kwArgs.handle("back");
                    }
                }
            }
        }
        forwardStack.push(current);
    }
    back.goBack = handleBackButton;
    function handleForwardButton() {
        var last = forwardStack.pop();
        if (!last) {
            return;
        }
        if (last.kwArgs["forward"]) {
            last.kwArgs.forward();
        } else {
            if (last.kwArgs["forwardButton"]) {
                last.kwArgs.forwardButton();
            } else {
                if (last.kwArgs["handle"]) {
                    last.kwArgs.handle("forward");
                }
            }
        }
        historyStack.push(last);
    }
    back.goForward = handleForwardButton;
    function createState(url, args, hash) {
        return {"url":url, "kwArgs":args, "urlHash":hash};
    }
    function getUrlQuery(url) {
        var segments = url.split("?");
        if (segments.length < 2) {
            return null;
        } else {
            return segments[1];
        }
    }
    function loadIframeHistory() {
        var url = (config["dojoIframeHistoryUrl"] || require.toUrl("./resources/iframe_history.html")) + "?" + (new Date()).getTime();
        moveForward = true;
        if (historyIframe) {
            has("webkit") ? historyIframe.location = url : window.frames[historyIframe.name].location = url;
        } else {
        }
        return url;
    }
    function checkLocation() {
        if (!changingUrl) {
            var hsl = historyStack.length;
            var hash = getHash();
            if ((hash === initialHash || window.location.href == initialHref) && (hsl == 1)) {
                handleBackButton();
                return;
            }
            if (forwardStack.length > 0) {
                if (forwardStack[forwardStack.length - 1].urlHash === hash) {
                    handleForwardButton();
                    return;
                }
            }
            if ((hsl >= 2) && (historyStack[hsl - 2])) {
                if (historyStack[hsl - 2].urlHash === hash) {
                    handleBackButton();
                }
            }
        }
    }
    back.init = function () {
        if (dom.byId("dj_history")) {
            return;
        }
        var src = config["dojoIframeHistoryUrl"] || require.toUrl("./resources/iframe_history.html");
        if (config.afterOnLoad) {
            console.error("dojo/back::init() must be called before the DOM has loaded. " + "Include dojo/back in a build layer.");
        } else {
            document.write("<iframe style=\"border:0;width:1px;height:1px;position:absolute;visibility:hidden;bottom:0;right:0;\" name=\"dj_history\" id=\"dj_history\" src=\"" + src + "\"></iframe>");
        }
    };
    back.setInitialState = function (args) {
        initialState = createState(initialHref, args, initialHash);
    };
    back.addToHistory = function (args) {
        forwardStack = [];
        var hash = null;
        var url = null;
        if (!historyIframe) {
            if (config["useXDomain"] && !config["dojoIframeHistoryUrl"]) {
                console.warn("dojo/back: When using cross-domain Dojo builds," + " please save iframe_history.html to your domain and set djConfig.dojoIframeHistoryUrl" + " to the path on your domain to iframe_history.html");
            }
            historyIframe = window.frames["dj_history"];
        }
        if (!bookmarkAnchor) {
            bookmarkAnchor = domConstruct.create("a", {style:{display:"none"}}, baseWindow.body());
        }
        if (args["changeUrl"]) {
            hash = "" + ((args["changeUrl"] !== true) ? args["changeUrl"] : (new Date()).getTime());
            if (historyStack.length == 0 && initialState.urlHash == hash) {
                initialState = createState(url, args, hash);
                return;
            } else {
                if (historyStack.length > 0 && historyStack[historyStack.length - 1].urlHash == hash) {
                    historyStack[historyStack.length - 1] = createState(url, args, hash);
                    return;
                }
            }
            changingUrl = true;
            setTimeout(function () {
                setHash(hash);
                changingUrl = false;
            }, 1);
            bookmarkAnchor.href = hash;
            if (has("ie")) {
                url = loadIframeHistory();
                var oldCB = args["back"] || args["backButton"] || args["handle"];
                var tcb = function (handleName) {
                    if (getHash() != "") {
                        setTimeout(function () {
                            setHash(hash);
                        }, 1);
                    }
                    oldCB.apply(this, [handleName]);
                };
                if (args["back"]) {
                    args.back = tcb;
                } else {
                    if (args["backButton"]) {
                        args.backButton = tcb;
                    } else {
                        if (args["handle"]) {
                            args.handle = tcb;
                        }
                    }
                }
                var oldFW = args["forward"] || args["forwardButton"] || args["handle"];
                var tfw = function (handleName) {
                    if (getHash() != "") {
                        setHash(hash);
                    }
                    if (oldFW) {
                        oldFW.apply(this, [handleName]);
                    }
                };
                if (args["forward"]) {
                    args.forward = tfw;
                } else {
                    if (args["forwardButton"]) {
                        args.forwardButton = tfw;
                    } else {
                        if (args["handle"]) {
                            args.handle = tfw;
                        }
                    }
                }
            } else {
                if (!has("ie")) {
                    if (!locationTimer) {
                        locationTimer = setInterval(checkLocation, 200);
                    }
                }
            }
        } else {
            url = loadIframeHistory();
        }
        historyStack.push(createState(url, args, hash));
    };
    back._iframeLoaded = function (evt, ifrLoc) {
        var query = getUrlQuery(ifrLoc.href);
        if (query == null) {
            if (historyStack.length == 1) {
                handleBackButton();
            }
            return;
        }
        if (moveForward) {
            moveForward = false;
            return;
        }
        if (historyStack.length >= 2 && query == getUrlQuery(historyStack[historyStack.length - 2].url)) {
            handleBackButton();
        } else {
            if (forwardStack.length > 0 && query == getUrlQuery(forwardStack[forwardStack.length - 1].url)) {
                handleForwardButton();
            }
        }
    };
    return back;
});

