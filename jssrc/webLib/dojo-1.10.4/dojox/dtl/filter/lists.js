//>>built

define("dojox/dtl/filter/lists", ["dojo/_base/lang", "../_base"], function (lang, dd) {
    var lists = lang.getObject("filter.lists", true, dd);
    lang.mixin(lists, {_dictsort:function (a, b) {
        if (a[0] == b[0]) {
            return 0;
        }
        return (a[0] < b[0]) ? -1 : 1;
    }, dictsort:function (value, arg) {
        if (!arg) {
            return value;
        }
        var i, item, items = [];
        if (!lang.isArray(value)) {
            var obj = value, value = [];
            for (var key in obj) {
                value.push(obj[key]);
            }
        }
        for (i = 0; i < value.length; i++) {
            items.push([new dojox.dtl._Filter("var." + arg).resolve(new dojox.dtl._Context({"var":value[i]})), value[i]]);
        }
        items.sort(dojox.dtl.filter.lists._dictsort);
        var output = [];
        for (i = 0; item = items[i]; i++) {
            output.push(item[1]);
        }
        return output;
    }, dictsortreversed:function (value, arg) {
        if (!arg) {
            return value;
        }
        var dictsort = dojox.dtl.filter.lists.dictsort(value, arg);
        return dictsort.reverse();
    }, first:function (value) {
        return (value.length) ? value[0] : "";
    }, join:function (value, arg) {
        return value.join(arg || ",");
    }, length:function (value) {
        return (isNaN(value.length)) ? (value + "").length : value.length;
    }, length_is:function (value, arg) {
        return value.length == parseInt(arg);
    }, random:function (value) {
        return value[Math.floor(Math.random() * value.length)];
    }, slice:function (value, arg) {
        arg = arg || "";
        var parts = arg.split(":");
        var bits = [];
        for (var i = 0; i < parts.length; i++) {
            if (!parts[i].length) {
                bits.push(null);
            } else {
                bits.push(parseInt(parts[i]));
            }
        }
        if (bits[0] === null) {
            bits[0] = 0;
        }
        if (bits[0] < 0) {
            bits[0] = value.length + bits[0];
        }
        if (bits.length < 2 || bits[1] === null) {
            bits[1] = value.length;
        }
        if (bits[1] < 0) {
            bits[1] = value.length + bits[1];
        }
        return value.slice(bits[0], bits[1]);
    }, _unordered_list:function (value, tabs) {
        var ddl = dojox.dtl.filter.lists;
        var i, indent = "";
        for (i = 0; i < tabs; i++) {
            indent += "\t";
        }
        if (value[1] && value[1].length) {
            var recurse = [];
            for (i = 0; i < value[1].length; i++) {
                recurse.push(ddl._unordered_list(value[1][i], tabs + 1));
            }
            return indent + "<li>" + value[0] + "\n" + indent + "<ul>\n" + recurse.join("\n") + "\n" + indent + "</ul>\n" + indent + "</li>";
        } else {
            return indent + "<li>" + value[0] + "</li>";
        }
    }, unordered_list:function (value) {
        return lists._unordered_list(value, 1);
    }});
    return lists;
});

