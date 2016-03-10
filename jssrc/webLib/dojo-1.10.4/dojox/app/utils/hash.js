//>>built

define("dojox/app/utils/hash", ["dojo/_base/lang"], function (lang) {
    var hashUtil = {getParams:function (hash) {
        var params;
        if (hash && hash.length) {
            while (hash.indexOf("(") > 0) {
                var index = hash.indexOf("(");
                var endindex = hash.indexOf(")");
                var viewPart = hash.substring(index, endindex + 1);
                if (!params) {
                    params = {};
                }
                params = hashUtil.getParamObj(params, viewPart);
                var viewName = viewPart.substring(1, viewPart.indexOf("&"));
                hash = hash.replace(viewPart, viewName);
            }
            for (var parts = hash.split("&"), x = 0; x < parts.length; x++) {
                var tp = parts[x].split("="), name = tp[0], value = encodeURIComponent(tp[1] || "");
                if (name && value) {
                    if (!params) {
                        params = {};
                    }
                    params[name] = value;
                }
            }
        }
        return params;
    }, getParamObj:function (params, viewPart) {
        var viewparams;
        var viewName = viewPart.substring(1, viewPart.indexOf("&"));
        var hash = viewPart.substring(viewPart.indexOf("&"), viewPart.length - 1);
        for (var parts = hash.split("&"), x = 0; x < parts.length; x++) {
            var tp = parts[x].split("="), name = tp[0], value = encodeURIComponent(tp[1] || "");
            if (name && value) {
                if (!viewparams) {
                    viewparams = {};
                }
                viewparams[name] = value;
            }
        }
        params[viewName] = viewparams;
        return params;
    }, buildWithParams:function (hash, params) {
        if (hash.charAt(0) !== "#") {
            hash = "#" + hash;
        }
        for (var item in params) {
            var value = params[item];
            if (lang.isObject(value)) {
                hash = hashUtil.addViewParams(hash, item, value);
            } else {
                if (item && value != null) {
                    hash = hash + "&" + item + "=" + params[item];
                }
            }
        }
        return hash;
    }, addViewParams:function (hash, view, params) {
        if (hash.charAt(0) !== "#") {
            hash = "#" + hash;
        }
        var index = hash.indexOf(view);
        if (index > 0) {
            if ((hash.charAt(index - 1) == "#" || hash.charAt(index - 1) == "+") && (hash.charAt(index + view.length) == "&" || hash.charAt(index + view.length) == "+" || hash.charAt(index + view.length) == "-")) {
                var oldView = hash.substring(index - 1, index + view.length + 1);
                var paramString = hashUtil.getParamString(params);
                var newView = hash.charAt(index - 1) + "(" + view + paramString + ")" + hash.charAt(index + view.length);
                hash = hash.replace(oldView, newView);
            }
        }
        return hash;
    }, getParamString:function (params) {
        var paramStr = "";
        for (var item in params) {
            var value = params[item];
            if (item && value != null) {
                paramStr = paramStr + "&" + item + "=" + params[item];
            }
        }
        return paramStr;
    }, getTarget:function (hash, defaultView) {
        if (!defaultView) {
            defaultView = "";
        }
        while (hash.indexOf("(") > 0) {
            var index = hash.indexOf("(");
            var endindex = hash.indexOf(")");
            var viewPart = hash.substring(index, endindex + 1);
            var viewName = viewPart.substring(1, viewPart.indexOf("&"));
            hash = hash.replace(viewPart, viewName);
        }
        return (((hash && hash.charAt(0) == "#") ? hash.substr(1) : hash) || defaultView).split("&")[0];
    }};
    return hashUtil;
});

