//>>built

define("dojo/dom-class", ["./_base/lang", "./_base/array", "./dom"], function (lang, array, dom) {
    var className = "className";
    var cls, spaces = /\s+/, a1 = [""];
    function str2array(s) {
        if (typeof s == "string" || s instanceof String) {
            if (s && !spaces.test(s)) {
                a1[0] = s;
                return a1;
            }
            var a = s.split(spaces);
            if (a.length && !a[0]) {
                a.shift();
            }
            if (a.length && !a[a.length - 1]) {
                a.pop();
            }
            return a;
        }
        if (!s) {
            return [];
        }
        return array.filter(s, function (x) {
            return x;
        });
    }
    var fakeNode = {};
    cls = {contains:function containsClass(node, classStr) {
        return ((" " + dom.byId(node)[className] + " ").indexOf(" " + classStr + " ") >= 0);
    }, add:function addClass(node, classStr) {
        node = dom.byId(node);
        classStr = str2array(classStr);
        var cls = node[className], oldLen;
        cls = cls ? " " + cls + " " : " ";
        oldLen = cls.length;
        for (var i = 0, len = classStr.length, c; i < len; ++i) {
            c = classStr[i];
            if (c && cls.indexOf(" " + c + " ") < 0) {
                cls += c + " ";
            }
        }
        if (oldLen < cls.length) {
            node[className] = cls.substr(1, cls.length - 2);
        }
    }, remove:function removeClass(node, classStr) {
        node = dom.byId(node);
        var cls;
        if (classStr !== undefined) {
            classStr = str2array(classStr);
            cls = " " + node[className] + " ";
            for (var i = 0, len = classStr.length; i < len; ++i) {
                cls = cls.replace(" " + classStr[i] + " ", " ");
            }
            cls = lang.trim(cls);
        } else {
            cls = "";
        }
        if (node[className] != cls) {
            node[className] = cls;
        }
    }, replace:function replaceClass(node, addClassStr, removeClassStr) {
        node = dom.byId(node);
        fakeNode[className] = node[className];
        cls.remove(fakeNode, removeClassStr);
        cls.add(fakeNode, addClassStr);
        if (node[className] !== fakeNode[className]) {
            node[className] = fakeNode[className];
        }
    }, toggle:function toggleClass(node, classStr, condition) {
        node = dom.byId(node);
        if (condition === undefined) {
            classStr = str2array(classStr);
            for (var i = 0, len = classStr.length, c; i < len; ++i) {
                c = classStr[i];
                cls[cls.contains(node, c) ? "remove" : "add"](node, c);
            }
        } else {
            cls[condition ? "add" : "remove"](node, classStr);
        }
        return condition;
    }};
    return cls;
});

