//>>built

define("dojo/_base/json", ["./kernel", "../json"], function (dojo, json) {
    dojo.fromJson = function (js) {
        return eval("(" + js + ")");
    };
    dojo._escapeString = json.stringify;
    dojo.toJsonIndentStr = "\t";
    dojo.toJson = function (it, prettyPrint) {
        return json.stringify(it, function (key, value) {
            if (value) {
                var tf = value.__json__ || value.json;
                if (typeof tf == "function") {
                    return tf.call(value);
                }
            }
            return value;
        }, prettyPrint && dojo.toJsonIndentStr);
    };
    return dojo;
});

