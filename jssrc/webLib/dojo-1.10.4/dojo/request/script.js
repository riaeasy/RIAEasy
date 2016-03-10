//>>built

define("dojo/request/script", ["module", "./watch", "./util", "../_base/kernel", "../_base/array", "../_base/lang", "../on", "../dom", "../dom-construct", "../has", "../_base/window"], function (module, watch, util, kernel, array, lang, on, dom, domConstruct, has, win) {
    has.add("script-readystatechange", function (global, document) {
        var script = document.createElement("script");
        return typeof script["onreadystatechange"] !== "undefined" && (typeof global["opera"] === "undefined" || global["opera"].toString() !== "[object Opera]");
    });
    var mid = module.id.replace(/[\/\.\-]/g, "_"), counter = 0, loadEvent = has("script-readystatechange") ? "readystatechange" : "load", readyRegExp = /complete|loaded/, callbacks = kernel.global[mid + "_callbacks"] = {}, deadScripts = [];
    function attach(id, url, frameDoc) {
        var doc = (frameDoc || win.doc), element = doc.createElement("script");
        element.type = "text/javascript";
        element.src = url;
        element.id = id;
        element.async = true;
        element.charset = "utf-8";
        return doc.getElementsByTagName("head")[0].appendChild(element);
    }
    function remove(id, frameDoc, cleanup) {
        domConstruct.destroy(dom.byId(id, frameDoc));
        if (callbacks[id]) {
            if (cleanup) {
                callbacks[id] = function () {
                    delete callbacks[id];
                };
            } else {
                delete callbacks[id];
            }
        }
    }
    function _addDeadScript(dfd) {
        var options = dfd.response.options, frameDoc = options.ioArgs ? options.ioArgs.frameDoc : options.frameDoc;
        deadScripts.push({id:dfd.id, frameDoc:frameDoc});
        if (options.ioArgs) {
            options.ioArgs.frameDoc = null;
        }
        options.frameDoc = null;
    }
    function canceler(dfd, response) {
        if (dfd.canDelete) {
            script._remove(dfd.id, response.options.frameDoc, true);
        }
    }
    function isValid(response) {
        if (deadScripts && deadScripts.length) {
            array.forEach(deadScripts, function (_script) {
                script._remove(_script.id, _script.frameDoc);
                _script.frameDoc = null;
            });
            deadScripts = [];
        }
        return response.options.jsonp ? !response.data : true;
    }
    function isReadyScript(response) {
        return !!this.scriptLoaded;
    }
    function isReadyCheckString(response) {
        var checkString = response.options.checkString;
        return checkString && eval("typeof(" + checkString + ") !== \"undefined\"");
    }
    function handleResponse(response, error) {
        if (this.canDelete) {
            _addDeadScript(this);
        }
        if (error) {
            this.reject(error);
        } else {
            this.resolve(response);
        }
    }
    function script(url, options, returnDeferred) {
        var response = util.parseArgs(url, util.deepCopy({}, options));
        url = response.url;
        options = response.options;
        var dfd = util.deferred(response, canceler, isValid, options.jsonp ? null : (options.checkString ? isReadyCheckString : isReadyScript), handleResponse);
        lang.mixin(dfd, {id:mid + (counter++), canDelete:false});
        if (options.jsonp) {
            var queryParameter = new RegExp("[?&]" + options.jsonp + "=");
            if (!queryParameter.test(url)) {
                url += (~url.indexOf("?") ? "&" : "?") + options.jsonp + "=" + (options.frameDoc ? "parent." : "") + mid + "_callbacks." + dfd.id;
            }
            dfd.canDelete = true;
            callbacks[dfd.id] = function (json) {
                response.data = json;
                dfd.handleResponse(response);
            };
        }
        if (util.notify) {
            util.notify.emit("send", response, dfd.promise.cancel);
        }
        if (!options.canAttach || options.canAttach(dfd)) {
            var node = script._attach(dfd.id, url, options.frameDoc);
            if (!options.jsonp && !options.checkString) {
                var handle = on(node, loadEvent, function (evt) {
                    if (evt.type === "load" || readyRegExp.test(node.readyState)) {
                        handle.remove();
                        dfd.scriptLoaded = evt;
                    }
                });
            }
        }
        watch(dfd);
        return returnDeferred ? dfd : dfd.promise;
    }
    script.get = script;
    script._attach = attach;
    script._remove = remove;
    script._callbacksProperty = mid + "_callbacks";
    return script;
});

