//>>built

define("dojo/promise/Promise", ["../_base/lang"], function (lang) {
    "use strict";
    function throwAbstract() {
        throw new TypeError("abstract");
    }
    return lang.extend(function Promise() {
    }, {then:function (callback, errback, progback) {
        throwAbstract();
    }, cancel:function (reason, strict) {
        throwAbstract();
    }, isResolved:function () {
        throwAbstract();
    }, isRejected:function () {
        throwAbstract();
    }, isFulfilled:function () {
        throwAbstract();
    }, isCanceled:function () {
        throwAbstract();
    }, always:function (callbackOrErrback) {
        return this.then(callbackOrErrback, callbackOrErrback);
    }, otherwise:function (errback) {
        return this.then(null, errback);
    }, trace:function () {
        return this;
    }, traceRejected:function () {
        return this;
    }, toString:function () {
        return "[object Promise]";
    }});
});

