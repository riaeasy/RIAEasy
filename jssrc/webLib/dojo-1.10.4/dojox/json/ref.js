//>>built

define("dojox/json/ref", ["dojo/_base/array", "dojo/_base/json", "dojo/_base/kernel", "dojo/_base/lang", "dojo/date/stamp", "dojox"], function (array, djson, dojo, lang, stamp, dojox) {
    lang.getObject("json", true, dojox);
    return dojox.json.ref = {resolveJson:function (root, args) {
        args = args || {};
        var idAttribute = args.idAttribute || "id";
        var refAttribute = this.refAttribute;
        var idAsRef = args.idAsRef;
        var prefix = args.idPrefix || "";
        var assignAbsoluteIds = args.assignAbsoluteIds;
        var index = args.index || {};
        var timeStamps = args.timeStamps;
        var ref, reWalk = [];
        var pathResolveRegex = /^(.*\/)?(\w+:\/\/)|[^\/\.]+\/\.\.\/|^.*\/(\/)/;
        var addProp = this._addProp;
        var F = function () {
        };
        function walk(it, stop, defaultId, needsPrefix, schema, defaultObject) {
            var i, update, val, id = idAttribute in it ? it[idAttribute] : defaultId;
            if (idAttribute in it || ((id !== undefined) && needsPrefix)) {
                id = (prefix + id).replace(pathResolveRegex, "$2$3");
            }
            var target = defaultObject || it;
            if (id !== undefined) {
                if (assignAbsoluteIds) {
                    it.__id = id;
                }
                if (args.schemas && (!(it instanceof Array)) && (val = id.match(/^(.+\/)[^\.\[]*$/))) {
                    schema = args.schemas[val[1]];
                }
                if (index[id] && ((it instanceof Array) == (index[id] instanceof Array))) {
                    target = index[id];
                    delete target.$ref;
                    delete target._loadObject;
                    update = true;
                } else {
                    var proto = schema && schema.prototype;
                    if (proto) {
                        F.prototype = proto;
                        target = new F();
                    }
                }
                index[id] = target;
                if (timeStamps) {
                    timeStamps[id] = args.time;
                }
            }
            while (schema) {
                var properties = schema.properties;
                if (properties) {
                    for (i in it) {
                        var propertyDefinition = properties[i];
                        if (propertyDefinition && propertyDefinition.format == "date-time" && typeof it[i] == "string") {
                            it[i] = stamp.fromISOString(it[i]);
                        }
                    }
                }
                schema = schema["extends"];
            }
            var length = it.length;
            for (i in it) {
                if (i == length) {
                    break;
                }
                if (it.hasOwnProperty(i)) {
                    val = it[i];
                    if ((typeof val == "object") && val && !(val instanceof Date) && i != "__parent") {
                        ref = val[refAttribute] || (idAsRef && val[idAttribute]);
                        if (!ref || !val.__parent) {
                            if (it != reWalk) {
                                val.__parent = target;
                            }
                        }
                        if (ref) {
                            delete it[i];
                            var path = ref.toString().replace(/(#)([^\.\[])/, "$1.$2").match(/(^([^\[]*\/)?[^#\.\[]*)#?([\.\[].*)?/);
                            if (index[(prefix + ref).replace(pathResolveRegex, "$2$3")]) {
                                ref = index[(prefix + ref).replace(pathResolveRegex, "$2$3")];
                            } else {
                                if ((ref = (path[1] == "$" || path[1] == "this" || path[1] == "") ? root : index[(prefix + path[1]).replace(pathResolveRegex, "$2$3")])) {
                                    if (path[3]) {
                                        path[3].replace(/(\[([^\]]+)\])|(\.?([^\.\[]+))/g, function (t, a, b, c, d) {
                                            ref = ref && ref[b ? b.replace(/[\"\'\\]/, "") : d];
                                        });
                                    }
                                }
                            }
                            if (ref) {
                                val = ref;
                            } else {
                                if (!stop) {
                                    var rewalking;
                                    if (!rewalking) {
                                        reWalk.push(target);
                                    }
                                    rewalking = true;
                                    val = walk(val, false, val[refAttribute], true, propertyDefinition);
                                    val._loadObject = args.loader;
                                }
                            }
                        } else {
                            if (!stop) {
                                val = walk(val, reWalk == it, id === undefined ? undefined : addProp(id, i), false, propertyDefinition, target != it && typeof target[i] == "object" && target[i]);
                            }
                        }
                    }
                    it[i] = val;
                    if (target != it && !target.__isDirty) {
                        var old = target[i];
                        target[i] = val;
                        if (update && val !== old && !target._loadObject && !(i.charAt(0) == "_" && i.charAt(1) == "_") && i != "$ref" && !(val instanceof Date && old instanceof Date && val.getTime() == old.getTime()) && !(typeof val == "function" && typeof old == "function" && val.toString() == old.toString()) && index.onUpdate) {
                            index.onUpdate(target, i, old, val);
                        }
                    }
                }
            }
            if (update && (idAttribute in it || target instanceof Array)) {
                for (i in target) {
                    if (!target.__isDirty && target.hasOwnProperty(i) && !it.hasOwnProperty(i) && !(i.charAt(0) == "_" && i.charAt(1) == "_") && !(target instanceof Array && isNaN(i))) {
                        if (index.onUpdate && i != "_loadObject" && i != "_idAttr") {
                            index.onUpdate(target, i, target[i], undefined);
                        }
                        delete target[i];
                        while (target instanceof Array && target.length && target[target.length - 1] === undefined) {
                            target.length--;
                        }
                    }
                }
            } else {
                if (index.onLoad) {
                    index.onLoad(target);
                }
            }
            return target;
        }
        if (root && typeof root == "object") {
            root = walk(root, false, args.defaultId, true);
            walk(reWalk, false);
        }
        return root;
    }, fromJson:function (str, args) {
        function ref(target) {
            var refObject = {};
            refObject[this.refAttribute] = target;
            return refObject;
        }
        try {
            var root = eval("(" + str + ")");
        }
        catch (e) {
            throw new SyntaxError("Invalid JSON string: " + e.message + " parsing: " + str);
        }
        if (root) {
            return this.resolveJson(root, args);
        }
        return root;
    }, toJson:function (it, prettyPrint, idPrefix, indexSubObjects) {
        var useRefs = this._useRefs;
        var addProp = this._addProp;
        var refAttribute = this.refAttribute;
        idPrefix = idPrefix || "";
        var paths = {};
        var generated = {};
        function serialize(it, path, _indentStr) {
            if (typeof it == "object" && it) {
                var value;
                if (it instanceof Date) {
                    return "\"" + stamp.toISOString(it, {zulu:true}) + "\"";
                }
                var id = it.__id;
                if (id) {
                    if (path != "#" && ((useRefs && !id.match(/#/)) || paths[id])) {
                        var ref = id;
                        if (id.charAt(0) != "#") {
                            if (it.__clientId == id) {
                                ref = "cid:" + id;
                            } else {
                                if (id.substring(0, idPrefix.length) == idPrefix) {
                                    ref = id.substring(idPrefix.length);
                                } else {
                                    ref = id;
                                }
                            }
                        }
                        var refObject = {};
                        refObject[refAttribute] = ref;
                        return djson.toJson(refObject, prettyPrint);
                    }
                    path = id;
                } else {
                    it.__id = path;
                    generated[path] = it;
                }
                paths[path] = it;
                _indentStr = _indentStr || "";
                var nextIndent = prettyPrint ? _indentStr + djson.toJsonIndentStr : "";
                var newLine = prettyPrint ? "\n" : "";
                var sep = prettyPrint ? " " : "";
                if (it instanceof Array) {
                    var res = array.map(it, function (obj, i) {
                        var val = serialize(obj, addProp(path, i), nextIndent);
                        if (typeof val != "string") {
                            val = "undefined";
                        }
                        return newLine + nextIndent + val;
                    });
                    return "[" + res.join("," + sep) + newLine + _indentStr + "]";
                }
                var output = [];
                for (var i in it) {
                    if (it.hasOwnProperty(i)) {
                        var keyStr;
                        if (typeof i == "number") {
                            keyStr = "\"" + i + "\"";
                        } else {
                            if (typeof i == "string" && (i.charAt(0) != "_" || i.charAt(1) != "_")) {
                                keyStr = djson._escapeString(i);
                            } else {
                                continue;
                            }
                        }
                        var val = serialize(it[i], addProp(path, i), nextIndent);
                        if (typeof val != "string") {
                            continue;
                        }
                        output.push(newLine + nextIndent + keyStr + ":" + sep + val);
                    }
                }
                return "{" + output.join("," + sep) + newLine + _indentStr + "}";
            } else {
                if (typeof it == "function" && dojox.json.ref.serializeFunctions) {
                    return it.toString();
                }
            }
            return djson.toJson(it);
        }
        var json = serialize(it, "#", "");
        if (!indexSubObjects) {
            for (var i in generated) {
                delete generated[i].__id;
            }
        }
        return json;
    }, _addProp:function (id, prop) {
        return id + (id.match(/#/) ? id.length == 1 ? "" : "." : "#") + prop;
    }, refAttribute:"$ref", _useRefs:false, serializeFunctions:false};
});

