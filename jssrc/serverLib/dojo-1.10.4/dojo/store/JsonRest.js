//>>built

define("dojo/store/JsonRest", ["../_base/xhr", "../_base/lang", "../json", "../_base/declare", "./util/QueryResults"], function (xhr, lang, JSON, declare, QueryResults) {
    var base = null;
    return declare("dojo.store.JsonRest", base, {constructor:function (options) {
        this.headers = {};
        declare.safeMixin(this, options);
    }, headers:{}, target:"", idProperty:"id", ascendingPrefix:"+", descendingPrefix:"-", _getTarget:function (id) {
        var target = this.target;
        if (typeof id != "undefined") {
            if (target.charAt(target.length - 1) == "/") {
                target += id;
            } else {
                target += "/" + id;
            }
        }
        return target;
    }, get:function (id, options) {
        options = options || {};
        var headers = lang.mixin({Accept:this.accepts}, this.headers, options.headers || options);
        return xhr("GET", {url:this._getTarget(id), handleAs:"json", headers:headers});
    }, accepts:"application/javascript, application/json", getIdentity:function (object) {
        return object[this.idProperty];
    }, put:function (object, options) {
        options = options || {};
        var id = ("id" in options) ? options.id : this.getIdentity(object);
        var hasId = typeof id != "undefined";
        return xhr(hasId && !options.incremental ? "PUT" : "POST", {url:this._getTarget(id), postData:JSON.stringify(object), handleAs:"json", headers:lang.mixin({"Content-Type":"application/json", Accept:this.accepts, "If-Match":options.overwrite === true ? "*" : null, "If-None-Match":options.overwrite === false ? "*" : null}, this.headers, options.headers)});
    }, add:function (object, options) {
        options = options || {};
        options.overwrite = false;
        return this.put(object, options);
    }, remove:function (id, options) {
        options = options || {};
        return xhr("DELETE", {url:this._getTarget(id), headers:lang.mixin({}, this.headers, options.headers)});
    }, query:function (query, options) {
        options = options || {};
        var headers = lang.mixin({Accept:this.accepts}, this.headers, options.headers);
        var hasQuestionMark = this.target.indexOf("?") > -1;
        if (query && typeof query == "object") {
            query = xhr.objectToQuery(query);
            query = query ? (hasQuestionMark ? "&" : "?") + query : "";
        }
        if (options.start >= 0 || options.count >= 0) {
            headers["X-Range"] = "items=" + (options.start || "0") + "-" + (("count" in options && options.count != Infinity) ? (options.count + (options.start || 0) - 1) : "");
            if (this.rangeParam) {
                query += (query || hasQuestionMark ? "&" : "?") + this.rangeParam + "=" + headers["X-Range"];
                hasQuestionMark = true;
            } else {
                headers.Range = headers["X-Range"];
            }
        }
        if (options && options.sort) {
            var sortParam = this.sortParam;
            query += (query || hasQuestionMark ? "&" : "?") + (sortParam ? sortParam + "=" : "sort(");
            for (var i = 0; i < options.sort.length; i++) {
                var sort = options.sort[i];
                query += (i > 0 ? "," : "") + (sort.descending ? this.descendingPrefix : this.ascendingPrefix) + encodeURIComponent(sort.attribute);
            }
            if (!sortParam) {
                query += ")";
            }
        }
        var results = xhr("GET", {url:this.target + (query || ""), handleAs:"json", headers:headers});
        results.total = results.then(function () {
            var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
            if (!range) {
                range = results.ioArgs.xhr.getResponseHeader("X-Content-Range");
            }
            return range && (range = range.match(/\/(.*)/)) && +range[1];
        });
        return QueryResults(results);
    }});
});

