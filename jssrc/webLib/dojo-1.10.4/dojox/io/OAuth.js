//>>built

define("dojox/io/OAuth", ["dojo/_base/kernel", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/xhr", "dojo/dom", "dojox/encoding/digests/SHA1"], function (dojo, lang, array, xhr, dom, SHA1) {
    dojo.getObject("io.OAuth", true, dojox);
    dojox.io.OAuth = new (function () {
        var encode = this.encode = function (s) {
            if (!("" + s).length) {
                return "";
            }
            return encodeURIComponent(s).replace(/\!/g, "%21").replace(/\*/g, "%2A").replace(/\'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29");
        };
        var decode = this.decode = function (str) {
            var a = [], list = str.split("&");
            for (var i = 0, l = list.length; i < l; i++) {
                var item = list[i];
                if (list[i] == "") {
                    continue;
                }
                if (list[i].indexOf("=") > -1) {
                    var tmp = list[i].split("=");
                    a.push([decodeURIComponent(tmp[0]), decodeURIComponent(tmp[1])]);
                } else {
                    a.push([decodeURIComponent(list[i]), null]);
                }
            }
            return a;
        };
        function parseUrl(url) {
            var keys = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"], parser = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/, match = parser.exec(url), map = {}, i = keys.length;
            while (i--) {
                map[keys[i]] = match[i] || "";
            }
            var p = map.protocol.toLowerCase(), a = map.authority.toLowerCase(), b = (p == "http" && map.port == 80) || (p == "https" && map.port == 443);
            if (b) {
                if (a.lastIndexOf(":") > -1) {
                    a = a.substring(0, a.lastIndexOf(":"));
                }
            }
            var path = map.path || "/";
            map.url = p + "://" + a + path;
            return map;
        }
        var tab = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        function nonce(length) {
            var s = "", tl = tab.length;
            for (var i = 0; i < length; i++) {
                s += tab.charAt(Math.floor(Math.random() * tl));
            }
            return s;
        }
        function timestamp() {
            return Math.floor(new Date().valueOf() / 1000) - 2;
        }
        function signature(data, key, type) {
            if (type && type != "PLAINTEXT" && type != "HMAC-SHA1") {
                throw new Error("dojox.io.OAuth: the only supported signature encodings are PLAINTEXT and HMAC-SHA1.");
            }
            if (type == "PLAINTEXT") {
                return key;
            } else {
                return SHA1._hmac(data, key);
            }
        }
        function key(args) {
            return encode(args.consumer.secret) + "&" + (args.token && args.token.secret ? encode(args.token.secret) : "");
        }
        function addOAuth(args, oaa) {
            var o = {oauth_consumer_key:oaa.consumer.key, oauth_nonce:nonce(16), oauth_signature_method:oaa.sig_method || "HMAC-SHA1", oauth_timestamp:timestamp(), oauth_version:"1.0"};
            if (oaa.token) {
                o.oauth_token = oaa.token.key;
            }
            args.content = dojo.mixin(args.content || {}, o);
        }
        function convertArgs(args) {
            var miArgs = [{}], formObject;
            if (args.form) {
                if (!args.content) {
                    args.content = {};
                }
                var form = dojo.byId(args.form);
                var actnNode = form.getAttributeNode("action");
                args.url = args.url || (actnNode ? actnNode.value : null);
                formObject = dojo.formToObject(form);
                delete args.form;
            }
            if (formObject) {
                miArgs.push(formObject);
            }
            if (args.content) {
                miArgs.push(args.content);
            }
            var map = parseUrl(args.url);
            if (map.query) {
                var tmp = dojo.queryToObject(map.query);
                for (var p in tmp) {
                    tmp[p] = encodeURIComponent(tmp[p]);
                }
                miArgs.push(tmp);
            }
            args._url = map.url;
            var a = [];
            for (var i = 0, l = miArgs.length; i < l; i++) {
                var item = miArgs[i];
                for (var p in item) {
                    if (dojo.isArray(item[p])) {
                        for (var j = 0, jl = item.length; j < jl; j++) {
                            a.push([p, item[j]]);
                        }
                    } else {
                        a.push([p, item[p]]);
                    }
                }
            }
            args._parameters = a;
            return args;
        }
        function baseString(method, args, oaa) {
            addOAuth(args, oaa);
            convertArgs(args);
            var a = args._parameters;
            a.sort(function (a, b) {
                if (a[0] > b[0]) {
                    return 1;
                }
                if (a[0] < b[0]) {
                    return -1;
                }
                if (a[1] > b[1]) {
                    return 1;
                }
                if (a[1] < b[1]) {
                    return -1;
                }
                return 0;
            });
            var s = dojo.map(a, function (item) {
                return encode(item[0]) + "=" + encode(("" + item[1]).length ? item[1] : "");
            }).join("&");
            var baseString = method.toUpperCase() + "&" + encode(args._url) + "&" + encode(s);
            return baseString;
        }
        function sign(method, args, oaa) {
            var k = key(oaa), message = baseString(method, args, oaa), s = signature(message, k, oaa.sig_method || "HMAC-SHA1");
            args.content["oauth_signature"] = s;
            return args;
        }
        this.sign = function (method, args, oaa) {
            return sign(method, args, oaa);
        };
        this.xhr = function (method, args, oaa, hasBody) {
            sign(method, args, oaa);
            return xhr(method, args, hasBody);
        };
        this.xhrGet = function (args, oaa) {
            return this.xhr("GET", args, oaa);
        };
        this.xhrPost = this.xhrRawPost = function (args, oaa) {
            return this.xhr("POST", args, oaa, true);
        };
        this.xhrPut = this.xhrRawPut = function (args, oaa) {
            return this.xhr("PUT", args, oaa, true);
        };
        this.xhrDelete = function (args, oaa) {
            return this.xhr("DELETE", args, oaa);
        };
    })();
    return dojox.io.OAuth;
});

