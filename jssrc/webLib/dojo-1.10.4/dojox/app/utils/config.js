//>>built

define("dojox/app/utils/config", ["dojo/sniff"], function (has) {
    return {configProcessHas:function (source) {
        for (var name in source) {
            var sval = source[name];
            if (name == "has") {
                for (var hasname in sval) {
                    if (!(hasname.charAt(0) == "_" && hasname.charAt(1) == "_") && sval && typeof sval === "object") {
                        var parts = hasname.split(",");
                        if (parts.length > 0) {
                            while (parts.length > 0) {
                                var haspart = parts.shift();
                                if ((has(haspart)) || (haspart.charAt(0) == "!" && !(has(haspart.substring(1))))) {
                                    var hasval = sval[hasname];
                                    this.configMerge(source, hasval);
                                    break;
                                }
                            }
                        }
                    }
                }
                delete source["has"];
            } else {
                if (!(name.charAt(0) == "_" && name.charAt(1) == "_") && sval && typeof sval === "object") {
                    this.configProcessHas(sval);
                }
            }
        }
        return source;
    }, configMerge:function (target, source) {
        for (var name in source) {
            var tval = target[name];
            var sval = source[name];
            if (tval !== sval && !(name.charAt(0) == "_" && name.charAt(1) == "_")) {
                if (tval && typeof tval === "object" && sval && typeof sval === "object") {
                    this.configMerge(tval, sval);
                } else {
                    if (target instanceof Array) {
                        target.push(sval);
                    } else {
                        target[name] = sval;
                    }
                }
            }
        }
        return target;
    }};
});

