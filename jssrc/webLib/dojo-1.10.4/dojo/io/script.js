//>>built

define("dojo/io/script", ["../_base/connect", "../_base/kernel", "../_base/lang", "../sniff", "../_base/window", "../_base/xhr", "../dom", "../dom-construct", "../request/script", "../aspect"], function (connect, kernel, lang, has, win, xhr, dom, domConstruct, _script, aspect) {
    kernel.deprecated("dojo/io/script", "Use dojo/request/script.", "2.0");
    var script = {get:function (args) {
        var rDfd;
        var dfd = this._makeScriptDeferred(args, function (dfd) {
            rDfd && rDfd.cancel();
        });
        var ioArgs = dfd.ioArgs;
        xhr._ioAddQueryToUrl(ioArgs);
        xhr._ioNotifyStart(dfd);
        rDfd = _script.get(ioArgs.url, {timeout:args.timeout, jsonp:ioArgs.jsonp, checkString:args.checkString, ioArgs:ioArgs, frameDoc:args.frameDoc, canAttach:function (rDfd) {
            ioArgs.requestId = rDfd.id;
            ioArgs.scriptId = rDfd.scriptId;
            ioArgs.canDelete = rDfd.canDelete;
            return script._canAttach(ioArgs);
        }}, true);
        aspect.around(rDfd, "isValid", function (isValid) {
            return function (response) {
                script._validCheck(dfd);
                return isValid.call(this, response);
            };
        });
        rDfd.then(function () {
            dfd.resolve(dfd);
        }).otherwise(function (error) {
            dfd.ioArgs.error = error;
            dfd.reject(error);
        });
        return dfd;
    }, attach:_script._attach, remove:_script._remove, _makeScriptDeferred:function (args, cancel) {
        var dfd = xhr._ioSetArgs(args, cancel || this._deferredCancel, this._deferredOk, this._deferredError);
        var ioArgs = dfd.ioArgs;
        ioArgs.id = kernel._scopeName + "IoScript" + (this._counter++);
        ioArgs.canDelete = false;
        ioArgs.jsonp = args.callbackParamName || args.jsonp;
        if (ioArgs.jsonp) {
            ioArgs.query = ioArgs.query || "";
            if (ioArgs.query.length > 0) {
                ioArgs.query += "&";
            }
            ioArgs.query += ioArgs.jsonp + "=" + (args.frameDoc ? "parent." : "") + kernel._scopeName + ".io.script.jsonp_" + ioArgs.id + "._jsonpCallback";
            ioArgs.frameDoc = args.frameDoc;
            ioArgs.canDelete = true;
            dfd._jsonpCallback = this._jsonpCallback;
            this["jsonp_" + ioArgs.id] = dfd;
        }
        dfd.addBoth(function (value) {
            if (ioArgs.canDelete) {
                if (value instanceof Error) {
                    script["jsonp_" + ioArgs.id]._jsonpCallback = function () {
                        delete script["jsonp_" + ioArgs.id];
                        if (ioArgs.requestId) {
                            kernel.global[_script._callbacksProperty][ioArgs.requestId]();
                        }
                    };
                } else {
                    script._addDeadScript(ioArgs);
                }
            }
        });
        return dfd;
    }, _deferredCancel:function (dfd) {
        dfd.canceled = true;
    }, _deferredOk:function (dfd) {
        var ioArgs = dfd.ioArgs;
        return ioArgs.json || ioArgs.scriptLoaded || ioArgs;
    }, _deferredError:function (error, dfd) {
        console.log("dojo.io.script error", error);
        return error;
    }, _deadScripts:[], _counter:1, _addDeadScript:function (ioArgs) {
        script._deadScripts.push({id:ioArgs.id, frameDoc:ioArgs.frameDoc});
        ioArgs.frameDoc = null;
    }, _validCheck:function (dfd) {
        var deadScripts = script._deadScripts;
        if (deadScripts && deadScripts.length > 0) {
            for (var i = 0; i < deadScripts.length; i++) {
                script.remove(deadScripts[i].id, deadScripts[i].frameDoc);
                delete script["jsonp_" + deadScripts[i].id];
                deadScripts[i].frameDoc = null;
            }
            script._deadScripts = [];
        }
        return true;
    }, _ioCheck:function (dfd) {
        var ioArgs = dfd.ioArgs;
        if (ioArgs.json || (ioArgs.scriptLoaded && !ioArgs.args.checkString)) {
            return true;
        }
        var checkString = ioArgs.args.checkString;
        return checkString && eval("typeof(" + checkString + ") != 'undefined'");
    }, _resHandle:function (dfd) {
        if (script._ioCheck(dfd)) {
            dfd.callback(dfd);
        } else {
            dfd.errback(new Error("inconceivable dojo.io.script._resHandle error"));
        }
    }, _canAttach:function () {
        return true;
    }, _jsonpCallback:function (json) {
        this.ioArgs.json = json;
        if (this.ioArgs.requestId) {
            kernel.global[_script._callbacksProperty][this.ioArgs.requestId](json);
        }
    }};
    lang.setObject("dojo.io.script", script);
    return script;
});

