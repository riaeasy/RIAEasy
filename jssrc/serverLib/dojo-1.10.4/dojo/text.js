//>>built

define("dojo/text", ["./_base/kernel", "require", "./has", "require"], function (dojo, require, has, request) {
    var getText;
    if (0) {
        getText = function (url, sync, load) {
            request(url, {sync:!!sync, headers:{"X-Requested-With":null}}).then(load);
        };
    } else {
        if (require.getText) {
            getText = require.getText;
        } else {
            console.error("dojo/text plugin failed to load because loader does not support getText");
        }
    }
    var theCache = {}, strip = function (text) {
        if (text) {
            text = text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
            var matches = text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
            if (matches) {
                text = matches[1];
            }
        } else {
            text = "";
        }
        return text;
    }, notFound = {}, pending = {};
    dojo.cache = function (module, url, value) {
        var key;
        if (typeof module == "string") {
            if (/\//.test(module)) {
                key = module;
                value = url;
            } else {
                key = require.toUrl(module.replace(/\./g, "/") + (url ? ("/" + url) : ""));
            }
        } else {
            key = module + "";
            value = url;
        }
        var val = (value != undefined && typeof value != "string") ? value.value : value, sanitize = value && value.sanitize;
        if (typeof val == "string") {
            theCache[key] = val;
            return sanitize ? strip(val) : val;
        } else {
            if (val === null) {
                delete theCache[key];
                return null;
            } else {
                if (!(key in theCache)) {
                    getText(key, true, function (text) {
                        theCache[key] = text;
                    });
                }
                return sanitize ? strip(theCache[key]) : theCache[key];
            }
        }
    };
    return {dynamic:true, normalize:function (id, toAbsMid) {
        var parts = id.split("!"), url = parts[0];
        return (/^\./.test(url) ? toAbsMid(url) : url) + (parts[1] ? "!" + parts[1] : "");
    }, load:function (id, require, load) {
        var parts = id.split("!"), stripFlag = parts.length > 1, absMid = parts[0], url = require.toUrl(parts[0]), requireCacheUrl = "url:" + url, text = notFound, finish = function (text) {
            load(stripFlag ? strip(text) : text);
        };
        if (absMid in theCache) {
            text = theCache[absMid];
        } else {
            if (require.cache && requireCacheUrl in require.cache) {
                text = require.cache[requireCacheUrl];
            } else {
                if (url in theCache) {
                    text = theCache[url];
                }
            }
        }
        if (text === notFound) {
            if (pending[url]) {
                pending[url].push(finish);
            } else {
                var pendingList = pending[url] = [finish];
                getText(url, !require.async, function (text) {
                    theCache[absMid] = theCache[url] = text;
                    for (var i = 0; i < pendingList.length; ) {
                        pendingList[i++](text);
                    }
                    delete pending[url];
                });
            }
        } else {
            finish(text);
        }
    }};
});

