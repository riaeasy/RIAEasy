//>>built

define("dojox/app/controllers/HistoryHash", ["dojo/_base/lang", "dojo/_base/declare", "dojo/topic", "dojo/on", "../Controller", "../utils/hash", "dojo/hash"], function (lang, declare, topic, on, Controller, hash) {
    return declare("dojox.app.controllers.HistoryHash", Controller, {constructor:function (app) {
        this.events = {"app-domNode":this.onDomNodeChange};
        if (this.app.domNode) {
            this.onDomNodeChange({oldNode:null, newNode:this.app.domNode});
        }
        topic.subscribe("/dojo/hashchange", lang.hitch(this, function (newhash) {
            this._onHashChange(newhash);
        }));
        this._historyStack = [];
        this._historyLen = 0;
        this._historyDiff = 0;
        this._current = null;
        this._next = null;
        this._previous = null;
        this._index = 0;
        this._oldHistoryLen = 0;
        this._newHistoryLen = 0;
        this._addToHistoryStack = false;
        this._startTransitionEvent = false;
        var currentHash = window.location.hash;
        if (currentHash && (currentHash.length > 1)) {
            currentHash = currentHash.substr(1);
        }
        this._historyStack.push({"hash":currentHash, "url":window.location.href, "detail":{target:currentHash}});
        this._historyLen = window.history.length;
        this._index = this._historyStack.length - 1;
        this._current = currentHash;
        this._historyDiff = window.history.length - this._historyStack.length;
    }, onDomNodeChange:function (evt) {
        if (evt.oldNode != null) {
            this.unbind(evt.oldNode, "startTransition");
        }
        this.bind(evt.newNode, "startTransition", lang.hitch(this, this.onStartTransition));
    }, onStartTransition:function (evt) {
        var target = evt.detail.target;
        var regex = /#(.+)/;
        if (!target && regex.test(evt.detail.href)) {
            target = evt.detail.href.match(regex)[1];
        }
        var currentHash = evt.detail.url || "#" + target;
        if (evt.detail.params) {
            currentHash = hash.buildWithParams(currentHash, evt.detail.params);
        }
        this._oldHistoryLen = window.history.length;
        window.location.hash = currentHash;
        this._addToHistoryStack = true;
        this._startTransitionEvent = true;
    }, _addHistory:function (hash) {
        this._historyStack.push({"hash":hash, "url":window.location.href, "detail":{target:hash}});
        this._historyLen = window.history.length;
        this._index = this._historyStack.length - 1;
        this._previous = this._current;
        this._current = hash;
        this._next = null;
        this._historyDiff = window.history.length - this._historyStack.length;
        this._addToHistoryStack = false;
    }, _onHashChange:function (currentHash) {
        if (this._index < 0 || this._index > (window.history.length - 1)) {
            throw Error("Application history out of management.");
        }
        this._newHistoryLen = window.history.length;
        if (this._oldHistoryLen > this._newHistoryLen) {
            this._historyStack.splice((this._newHistoryLen - this._historyDiff - 1), (this._historyStack.length - 1));
            this._historyLen = this._historyStack.length;
            this._oldHistoryLen = 0;
        }
        if (this._addToHistoryStack && (this._oldHistoryLen === this._newHistoryLen)) {
            this._historyStack.splice((this._newHistoryLen - this._historyDiff - 1), (this._historyStack.length - 1));
            this._addHistory(currentHash);
            return;
        }
        if (this._historyLen < window.history.length) {
            this._addHistory(currentHash);
            if (!this._startTransitionEvent) {
                this.app.emit("app-transition", {viewId:hash.getTarget(currentHash), opts:{params:hash.getParams(currentHash) || {}}});
            }
        } else {
            if (currentHash == this._current) {
            } else {
                if (currentHash === this._previous) {
                    this._back(currentHash, this._historyStack[this._index]["detail"]);
                } else {
                    if (currentHash === this._next) {
                        this._forward(currentHash, this._historyStack[this._index]["detail"]);
                    } else {
                        var index = -1;
                        for (var i = this._index; i > 0; i--) {
                            if (currentHash === this._historyStack[i]["hash"]) {
                                index = i;
                                break;
                            }
                        }
                        if (-1 === index) {
                            for (var i = this._index; i < this._historyStack.length; i++) {
                                if (currentHash === this._historyStack[i]["hash"]) {
                                    index = i;
                                    break;
                                }
                            }
                        }
                        if (0 < index < this._historyStack.length) {
                            this._go(index, (index - this._index));
                        } else {
                            this.app.log("go error. index out of history stack.");
                        }
                    }
                }
            }
        }
        this._startTransitionEvent = false;
    }, _back:function (currentHash, detail) {
        this.app.log("back");
        this._next = this._historyStack[this._index]["hash"];
        this._index--;
        if (this._index > 0) {
            this._previous = this._historyStack[this._index - 1]["hash"];
        } else {
            this._previous = null;
        }
        this._current = currentHash;
        var target = hash.getTarget(currentHash, this.app.defaultView);
        topic.publish("/app/history/back", {"viewId":target, "detail":detail});
        this.app.emit("app-transition", {viewId:target, opts:lang.mixin({reverse:true}, detail, {"params":hash.getParams(currentHash)})});
    }, _forward:function (currentHash, detail) {
        this.app.log("forward");
        this._previous = this._historyStack[this._index]["hash"];
        this._index++;
        if (this._index < this._historyStack.length - 1) {
            this._next = this._historyStack[this._index + 1]["hash"];
        } else {
            this._next = null;
        }
        this._current = currentHash;
        var target = hash.getTarget(currentHash, this.app.defaultView);
        topic.publish("/app/history/forward", {"viewId":target, "detail":detail});
        this.app.emit("app-transition", {viewId:target, opts:lang.mixin({reverse:false}, detail, {"params":hash.getParams(currentHash)})});
    }, _go:function (index, step) {
        if (index < 0 || (index > window.history.length - 1)) {
            throw Error("Application history.go steps out of management, index: " + index + " length: " + window.history.length);
        }
        this._index = index;
        this._current = this._historyStack[index]["hash"];
        this._previous = this._historyStack[index - 1] ? this._historyStack[index - 1]["hash"] : null;
        this._next = this._historyStack[index + 1] ? this._historyStack[index + 1]["hash"] : null;
        var target = hash.getTarget(this._current, this.app.defaultView);
        topic.publish("/app/history/go", {"viewId":target, "step":step, "detail":this._historyStack[index]["detail"]});
        this.app.emit("app-transition", {viewId:target, opts:lang.mixin({reverse:(step <= 0)}, this._historyStack[index]["detail"], {"params":hash.getParams(this._current)})});
    }});
});

