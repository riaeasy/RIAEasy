//>>built

define("dojo/_base/url", ["./kernel"], function (dojo) {
    var ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$"), ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$"), _Url = function () {
        var n = null, _a = arguments, uri = [_a[0]];
        for (var i = 1; i < _a.length; i++) {
            if (!_a[i]) {
                continue;
            }
            var relobj = new _Url(_a[i] + ""), uriobj = new _Url(uri[0] + "");
            if (relobj.path == "" && !relobj.scheme && !relobj.authority && !relobj.query) {
                if (relobj.fragment != n) {
                    uriobj.fragment = relobj.fragment;
                }
                relobj = uriobj;
            } else {
                if (!relobj.scheme) {
                    relobj.scheme = uriobj.scheme;
                    if (!relobj.authority) {
                        relobj.authority = uriobj.authority;
                        if (relobj.path.charAt(0) != "/") {
                            var path = uriobj.path.substring(0, uriobj.path.lastIndexOf("/") + 1) + relobj.path;
                            var segs = path.split("/");
                            for (var j = 0; j < segs.length; j++) {
                                if (segs[j] == ".") {
                                    if (j == segs.length - 1) {
                                        segs[j] = "";
                                    } else {
                                        segs.splice(j, 1);
                                        j--;
                                    }
                                } else {
                                    if (j > 0 && !(j == 1 && segs[0] == "") && segs[j] == ".." && segs[j - 1] != "..") {
                                        if (j == (segs.length - 1)) {
                                            segs.splice(j, 1);
                                            segs[j - 1] = "";
                                        } else {
                                            segs.splice(j - 1, 2);
                                            j -= 2;
                                        }
                                    }
                                }
                            }
                            relobj.path = segs.join("/");
                        }
                    }
                }
            }
            uri = [];
            if (relobj.scheme) {
                uri.push(relobj.scheme, ":");
            }
            if (relobj.authority) {
                uri.push("//", relobj.authority);
            }
            uri.push(relobj.path);
            if (relobj.query) {
                uri.push("?", relobj.query);
            }
            if (relobj.fragment) {
                uri.push("#", relobj.fragment);
            }
        }
        this.uri = uri.join("");
        var r = this.uri.match(ore);
        this.scheme = r[2] || (r[1] ? "" : n);
        this.authority = r[4] || (r[3] ? "" : n);
        this.path = r[5];
        this.query = r[7] || (r[6] ? "" : n);
        this.fragment = r[9] || (r[8] ? "" : n);
        if (this.authority != n) {
            r = this.authority.match(ire);
            this.user = r[3] || n;
            this.password = r[4] || n;
            this.host = r[6] || r[7];
            this.port = r[9] || n;
        }
    };
    _Url.prototype.toString = function () {
        return this.uri;
    };
    return dojo._Url = _Url;
});

