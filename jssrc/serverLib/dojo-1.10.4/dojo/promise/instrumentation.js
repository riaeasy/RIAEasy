//>>built

define("dojo/promise/instrumentation", ["./tracer", "../has", "../_base/lang", "../_base/array"], function (tracer, has, lang, arrayUtil) {
    has.add("config-useDeferredInstrumentation", "report-unhandled-rejections");
    function logError(error, rejection, deferred) {
        var stack = "";
        if (error && error.stack) {
            stack += error.stack;
        }
        if (rejection && rejection.stack) {
            stack += "\n    ----------------------------------------\n    rejected" + rejection.stack.split("\n").slice(1).join("\n").replace(/^\s+/, " ");
        }
        if (deferred && deferred.stack) {
            stack += "\n    ----------------------------------------\n" + deferred.stack;
        }
        console.error(error, stack);
    }
    function reportRejections(error, handled, rejection, deferred) {
        if (!handled) {
            logError(error, rejection, deferred);
        }
    }
    var errors = [];
    var activeTimeout = false;
    var unhandledWait = 1000;
    function trackUnhandledRejections(error, handled, rejection, deferred) {
        if (!arrayUtil.some(errors, function (obj) {
            if (obj.error === error) {
                if (handled) {
                    obj.handled = true;
                }
                return true;
            }
        })) {
            errors.push({error:error, rejection:rejection, handled:handled, deferred:deferred, timestamp:new Date().getTime()});
        }
        if (!activeTimeout) {
            activeTimeout = setTimeout(logRejected, unhandledWait);
        }
    }
    function logRejected() {
        var now = new Date().getTime();
        var reportBefore = now - unhandledWait;
        errors = arrayUtil.filter(errors, function (obj) {
            if (obj.timestamp < reportBefore) {
                if (!obj.handled) {
                    logError(obj.error, obj.rejection, obj.deferred);
                }
                return false;
            }
            return true;
        });
        if (errors.length) {
            activeTimeout = setTimeout(logRejected, errors[0].timestamp + unhandledWait - now);
        } else {
            activeTimeout = false;
        }
    }
    return function (Deferred) {
        var usage = has("config-useDeferredInstrumentation");
        if (usage) {
            tracer.on("resolved", lang.hitch(console, "log", "resolved"));
            tracer.on("rejected", lang.hitch(console, "log", "rejected"));
            tracer.on("progress", lang.hitch(console, "log", "progress"));
            var args = [];
            if (typeof usage === "string") {
                args = usage.split(",");
                usage = args.shift();
            }
            if (usage === "report-rejections") {
                Deferred.instrumentRejected = reportRejections;
            } else {
                if (usage === "report-unhandled-rejections" || usage === true || usage === 1) {
                    Deferred.instrumentRejected = trackUnhandledRejections;
                    unhandledWait = parseInt(args[0], 10) || unhandledWait;
                } else {
                    throw new Error("Unsupported instrumentation usage <" + usage + ">");
                }
            }
        }
    };
});

