//>>built

define("dojox/data/AndOrReadStore", ["dojo/_base/declare", "dojo/_base/lang", "dojo/data/ItemFileReadStore", "dojo/data/util/filter", "dojo/_base/array", "dojo/_base/json"], function (declare, lang, ItemFileReadStore, filterUtil, array, json) {
    return declare("dojox.data.AndOrReadStore", [ItemFileReadStore], {_containsValue:function (item, attribute, value, regexp) {
        return array.some(this.getValues(item, attribute), function (possibleValue) {
            if (lang.isString(regexp)) {
                return eval(regexp);
            } else {
                if (possibleValue !== null && !lang.isObject(possibleValue) && regexp) {
                    if (possibleValue.toString().match(regexp)) {
                        return true;
                    }
                } else {
                    if (value === possibleValue) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        });
    }, filter:function (requestArgs, arrayOfItems, findCallback) {
        var items = [];
        if (requestArgs.query) {
            var query = json.fromJson(json.toJson(requestArgs.query));
            if (typeof query == "object") {
                var count = 0;
                var p;
                for (p in query) {
                    count++;
                }
                if (count > 1 && query.complexQuery) {
                    var cq = query.complexQuery;
                    var wrapped = false;
                    for (p in query) {
                        if (p !== "complexQuery") {
                            if (!wrapped) {
                                cq = "( " + cq + " )";
                                wrapped = true;
                            }
                            var v = requestArgs.query[p];
                            if (lang.isString(v)) {
                                v = "'" + v + "'";
                            }
                            cq += " AND " + p + ":" + v;
                            delete query[p];
                        }
                    }
                    query.complexQuery = cq;
                }
            }
            var ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false;
            if (typeof query != "string") {
                query = json.toJson(query);
                query = query.replace(/\\\\/g, "\\");
            }
            query = query.replace(/\\"/g, "\"");
            var complexQuery = lang.trim(query.replace(/{|}/g, ""));
            var pos2, i;
            if (complexQuery.match(/"? *complexQuery *"?:/)) {
                complexQuery = lang.trim(complexQuery.replace(/"?\s*complexQuery\s*"?:/, ""));
                var quotes = ["'", "\""];
                var pos1, colon;
                var flag = false;
                for (i = 0; i < quotes.length; i++) {
                    pos1 = complexQuery.indexOf(quotes[i]);
                    pos2 = complexQuery.indexOf(quotes[i], 1);
                    colon = complexQuery.indexOf(":", 1);
                    if (pos1 === 0 && pos2 != -1 && colon < pos2) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    complexQuery = complexQuery.replace(/^\"|^\'|\"$|\'$/g, "");
                }
            }
            var complexQuerySave = complexQuery;
            var begRegExp = /^>=|^<=|^<|^>|^,|^NOT |^AND |^OR |^\(|^\)|^!|^&&|^\|\|/i;
            var sQuery = "";
            var op = "";
            var val = "";
            var pos = -1;
            var err = false;
            var key = "";
            var value = "";
            var tok = "";
            pos2 = -1;
            for (i = 0; i < arrayOfItems.length; ++i) {
                var match = true;
                var candidateItem = arrayOfItems[i];
                if (candidateItem === null) {
                    match = false;
                } else {
                    complexQuery = complexQuerySave;
                    sQuery = "";
                    while (complexQuery.length > 0 && !err) {
                        op = complexQuery.match(begRegExp);
                        while (op && !err) {
                            complexQuery = lang.trim(complexQuery.replace(op[0], ""));
                            op = lang.trim(op[0]).toUpperCase();
                            op = op == "NOT" ? "!" : op == "AND" || op == "," ? "&&" : op == "OR" ? "||" : op;
                            op = " " + op + " ";
                            sQuery += op;
                            op = complexQuery.match(begRegExp);
                        }
                        if (complexQuery.length > 0) {
                            var opsRegex = /:|>=|<=|>|</g, matches = complexQuery.match(opsRegex), match = matches && matches.shift(), regex;
                            pos = complexQuery.indexOf(match);
                            if (pos == -1) {
                                err = true;
                                break;
                            } else {
                                key = lang.trim(complexQuery.substring(0, pos).replace(/\"|\'/g, ""));
                                complexQuery = lang.trim(complexQuery.substring(pos + match.length));
                                tok = complexQuery.match(/^\'|^\"/);
                                if (tok) {
                                    tok = tok[0];
                                    pos = complexQuery.indexOf(tok);
                                    pos2 = complexQuery.indexOf(tok, pos + 1);
                                    if (pos2 == -1) {
                                        err = true;
                                        break;
                                    }
                                    value = complexQuery.substring(pos + match.length, pos2);
                                    if (pos2 == complexQuery.length - 1) {
                                        complexQuery = "";
                                    } else {
                                        complexQuery = lang.trim(complexQuery.substring(pos2 + 1));
                                    }
                                    if (match != ":") {
                                        regex = this.getValue(candidateItem, key) + match + value;
                                    } else {
                                        regex = filterUtil.patternToRegExp(value, ignoreCase);
                                    }
                                    sQuery += this._containsValue(candidateItem, key, value, regex);
                                } else {
                                    tok = complexQuery.match(/\s|\)|,/);
                                    if (tok) {
                                        var pos3 = new Array(tok.length);
                                        for (var j = 0; j < tok.length; j++) {
                                            pos3[j] = complexQuery.indexOf(tok[j]);
                                        }
                                        pos = pos3[0];
                                        if (pos3.length > 1) {
                                            for (var j = 1; j < pos3.length; j++) {
                                                pos = Math.min(pos, pos3[j]);
                                            }
                                        }
                                        value = lang.trim(complexQuery.substring(0, pos));
                                        complexQuery = lang.trim(complexQuery.substring(pos));
                                    } else {
                                        value = lang.trim(complexQuery);
                                        complexQuery = "";
                                    }
                                    if (match != ":") {
                                        regex = this.getValue(candidateItem, key) + match + value;
                                    } else {
                                        regex = filterUtil.patternToRegExp(value, ignoreCase);
                                        console.log("regex value: ", value, " regex pattern: ", regex);
                                    }
                                    sQuery += this._containsValue(candidateItem, key, value, regex);
                                }
                            }
                        }
                    }
                    match = eval(sQuery);
                }
                if (match) {
                    items.push(candidateItem);
                }
            }
            if (err) {
                items = [];
                console.log("The store's _fetchItems failed, probably due to a syntax error in query.");
            }
        } else {
            for (var i = 0; i < arrayOfItems.length; ++i) {
                var item = arrayOfItems[i];
                if (item !== null) {
                    items.push(item);
                }
            }
        }
        findCallback(items, requestArgs);
    }});
});

