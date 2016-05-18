//>>built

define("dojo/hash", ["./_base/kernel", "require", "./_base/config", "./aspect", "./_base/lang", "./topic", "./domReady", "./sniff"], function (dojo, require, config, aspect, lang, topic, domReady, has) {
    dojo.hash = function (hash, replace) {
        if (!arguments.length) {
            return _getHash();
        }
        if (hash.charAt(0) == "#") {
            hash = hash.substring(1);
        }
        if (replace) {
            _replace(hash);
        } else {
            location.href = "#" + hash;
        }
        return hash;
    };
    var _recentHash, _ieUriMonitor, _connect, _pollFrequency = config.hashPollFrequency || 100;
    function _getSegment(str, delimiter) {
        var i = str.indexOf(delimiter);
        return (i >= 0) ? str.substring(i + 1) : "";
    }
    function _getHash() {
        return _getSegment(location.href, "#");
    }
    function _dispatchEvent() {
        topic.publish("/dojo/hashchange", _getHash());
    }
    function _pollLocation() {
        if (_getHash() === _recentHash) {
            return;
        }
        _recentHash = _getHash();
        _dispatchEvent();
    }
    function _replace(hash) {
        if (_ieUriMonitor) {
            if (_ieUriMonitor.isTransitioning()) {
                setTimeout(lang.hitch(null, _replace, hash), _pollFrequency);
                return;
            }
            var href = _ieUriMonitor.iframe.location.href;
            var index = href.indexOf("?");
            _ieUriMonitor.iframe.location.replace(href.substring(0, index) + "?" + hash);
            return;
        }
        location.replace("#" + hash);
        !_connect && _pollLocation();
    }
    function IEUriMonitor() {
        var ifr = document.createElement("iframe"), IFRAME_ID = "dojo-hash-iframe", ifrSrc = config.dojoBlankHtmlUrl || require.toUrl("./resources/blank.html");
        if (config.useXDomain && !config.dojoBlankHtmlUrl) {
            console.warn("dojo/hash: When using cross-domain Dojo builds," + " please save dojo/resources/blank.html to your domain and set djConfig.dojoBlankHtmlUrl" + " to the path on your domain to blank.html");
        }
        ifr.id = IFRAME_ID;
        ifr.src = ifrSrc + "?" + _getHash();
        ifr.style.display = "none";
        document.body.appendChild(ifr);
        this.iframe = dojo.global[IFRAME_ID];
        var recentIframeQuery, transitioning, expectedIFrameQuery, docTitle, ifrOffline, iframeLoc = this.iframe.location;
        function resetState() {
            _recentHash = _getHash();
            recentIframeQuery = ifrOffline ? _recentHash : _getSegment(iframeLoc.href, "?");
            transitioning = false;
            expectedIFrameQuery = null;
        }
        this.isTransitioning = function () {
            return transitioning;
        };
        this.pollLocation = function () {
            if (!ifrOffline) {
                try {
                    var iframeSearch = _getSegment(iframeLoc.href, "?");
                    if (document.title != docTitle) {
                        docTitle = this.iframe.document.title = document.title;
                    }
                }
                catch (e) {
                    ifrOffline = true;
                    console.error("dojo/hash: Error adding history entry. Server unreachable.");
                }
            }
            var hash = _getHash();
            if (transitioning && _recentHash === hash) {
                if (ifrOffline || iframeSearch === expectedIFrameQuery) {
                    resetState();
                    _dispatchEvent();
                } else {
                    setTimeout(lang.hitch(this, this.pollLocation), 0);
                    return;
                }
            } else {
                if (_recentHash === hash && (ifrOffline || recentIframeQuery === iframeSearch)) {
                } else {
                    if (_recentHash !== hash) {
                        _recentHash = hash;
                        transitioning = true;
                        expectedIFrameQuery = hash;
                        ifr.src = ifrSrc + "?" + expectedIFrameQuery;
                        ifrOffline = false;
                        setTimeout(lang.hitch(this, this.pollLocation), 0);
                        return;
                    } else {
                        if (!ifrOffline) {
                            location.href = "#" + iframeLoc.search.substring(1);
                            resetState();
                            _dispatchEvent();
                        }
                    }
                }
            }
            setTimeout(lang.hitch(this, this.pollLocation), _pollFrequency);
        };
        resetState();
        setTimeout(lang.hitch(this, this.pollLocation), _pollFrequency);
    }
    domReady(function () {
        if ("onhashchange" in dojo.global && (!has("ie") || (has("ie") >= 8 && document.compatMode != "BackCompat"))) {
            _connect = aspect.after(dojo.global, "onhashchange", _dispatchEvent, true);
        } else {
            if (document.addEventListener) {
                _recentHash = _getHash();
                setInterval(_pollLocation, _pollFrequency);
            } else {
                if (document.attachEvent) {
                    _ieUriMonitor = new IEUriMonitor();
                }
            }
        }
    });
    return dojo.hash;
});

