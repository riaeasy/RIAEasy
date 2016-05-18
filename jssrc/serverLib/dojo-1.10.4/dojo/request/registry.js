//>>built

define("dojo/request/registry", ["require", "../_base/array", "./default!platform", "./util"], function (require, array, fallbackProvider, util) {
    var providers = [];
    function request(url, options) {
        var matchers = providers.slice(0), i = 0, matcher;
        while (matcher = matchers[i++]) {
            if (matcher(url, options)) {
                return matcher.request.call(null, url, options);
            }
        }
        return fallbackProvider.apply(null, arguments);
    }
    function createMatcher(match, provider) {
        var matcher;
        if (provider) {
            if (match.test) {
                matcher = function (url) {
                    return match.test(url);
                };
            } else {
                if (match.apply && match.call) {
                    matcher = function () {
                        return match.apply(null, arguments);
                    };
                } else {
                    matcher = function (url) {
                        return url === match;
                    };
                }
            }
            matcher.request = provider;
        } else {
            matcher = function () {
                return true;
            };
            matcher.request = match;
        }
        return matcher;
    }
    request.register = function (url, provider, first) {
        var matcher = createMatcher(url, provider);
        providers[(first ? "unshift" : "push")](matcher);
        return {remove:function () {
            var idx;
            if (~(idx = array.indexOf(providers, matcher))) {
                providers.splice(idx, 1);
            }
        }};
    };
    request.load = function (id, parentRequire, loaded, config) {
        if (id) {
            require([id], function (fallback) {
                fallbackProvider = fallback;
                loaded(request);
            });
        } else {
            loaded(request);
        }
    };
    util.addCommonMethods(request);
    return request;
});

