//>>built

define("dojox/wire/ml/Invocation", ["dijit", "dojo", "dojox", "dojo/require!dojox/wire/ml/Action"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.wire.ml.Invocation");
    dojo.require("dojox.wire.ml.Action");
    dojo.declare("dojox.wire.ml.Invocation", dojox.wire.ml.Action, {object:"", method:"", topic:"", parameters:"", result:"", error:"", _run:function () {
        if (this.topic) {
            var args = this._getParameters(arguments);
            try {
                dojo.publish(this.topic, args);
                this.onComplete();
            }
            catch (e) {
                this.onError(e);
            }
        } else {
            if (this.method) {
                var scope = (this.object ? dojox.wire.ml._getValue(this.object) : dojo.global);
                if (!scope) {
                    return;
                }
                var args = this._getParameters(arguments);
                var func = scope[this.method];
                if (!func) {
                    func = scope.callMethod;
                    if (!func) {
                        return;
                    }
                    args = [this.method, args];
                }
                try {
                    var connected = false;
                    if (scope.getFeatures) {
                        var features = scope.getFeatures();
                        if ((this.method == "fetch" && features["dojo.data.api.Read"]) || (this.method == "save" && features["dojo.data.api.Write"])) {
                            var arg = args[0];
                            if (!arg.onComplete) {
                                arg.onComplete = function () {
                                };
                            }
                            this.connect(arg, "onComplete", "onComplete");
                            if (!arg.onError) {
                                arg.onError = function () {
                                };
                            }
                            this.connect(arg, "onError", "onError");
                            connected = true;
                        }
                    }
                    var r = func.apply(scope, args);
                    if (!connected) {
                        if (r && (r instanceof dojo.Deferred)) {
                            var self = this;
                            r.addCallbacks(function (result) {
                                self.onComplete(result);
                            }, function (error) {
                                self.onError(error);
                            });
                        } else {
                            this.onComplete(r);
                        }
                    }
                }
                catch (e) {
                    this.onError(e);
                }
            }
        }
    }, onComplete:function (result) {
        if (this.result) {
            dojox.wire.ml._setValue(this.result, result);
        }
        if (this.error) {
            dojox.wire.ml._setValue(this.error, "");
        }
    }, onError:function (error) {
        if (this.error) {
            if (error && error.message) {
                error = error.message;
            }
            dojox.wire.ml._setValue(this.error, error);
        }
    }, _getParameters:function (args) {
        if (!this.parameters) {
            return args;
        }
        var parameters = [];
        var list = this.parameters.split(",");
        if (list.length == 1) {
            var parameter = dojox.wire.ml._getValue(dojo.trim(list[0]), args);
            if (dojo.isArray(parameter)) {
                parameters = parameter;
            } else {
                parameters.push(parameter);
            }
        } else {
            for (var i in list) {
                parameters.push(dojox.wire.ml._getValue(dojo.trim(list[i]), args));
            }
        }
        return parameters;
    }});
});

