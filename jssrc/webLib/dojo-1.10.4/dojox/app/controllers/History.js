//>>built

define("dojox/app/controllers/History", ["dojo/_base/lang", "dojo/_base/declare", "dojo/on", "../Controller", "../utils/hash", "dojo/topic"], function (lang, declare, on, Controller, hash, topic) {
    return declare("dojox.app.controllers.History", Controller, {_currentPosition:0, currentState:{}, constructor:function () {
        this.events = {"app-domNode":this.onDomNodeChange};
        if (this.app.domNode) {
            this.onDomNodeChange({oldNode:null, newNode:this.app.domNode});
        }
        this.bind(window, "popstate", lang.hitch(this, this.onPopState));
    }, onDomNodeChange:function (evt) {
        if (evt.oldNode != null) {
            this.unbind(evt.oldNode, "startTransition");
        }
        this.bind(evt.newNode, "startTransition", lang.hitch(this, this.onStartTransition));
    }, onStartTransition:function (evt) {
        var currentHash = window.location.hash;
        var currentView = hash.getTarget(currentHash, this.app.defaultView);
        var currentParams = hash.getParams(currentHash);
        var _detail = lang.clone(evt.detail);
        _detail.target = _detail.title = currentView;
        _detail.url = currentHash;
        _detail.params = currentParams;
        _detail.id = this._currentPosition;
        if (history.length == 1) {
            history.pushState(_detail, _detail.href, currentHash);
        }
        _detail.bwdTransition = _detail.transition;
        lang.mixin(this.currentState, _detail);
        history.replaceState(this.currentState, this.currentState.href, currentHash);
        this._currentPosition += 1;
        evt.detail.id = this._currentPosition;
        var newHash = evt.detail.url || "#" + evt.detail.target;
        if (evt.detail.params) {
            newHash = hash.buildWithParams(newHash, evt.detail.params);
        }
        evt.detail.fwdTransition = evt.detail.transition;
        history.pushState(evt.detail, evt.detail.href, newHash);
        this.currentState = lang.clone(evt.detail);
        topic.publish("/app/history/pushState", evt.detail.target);
    }, onPopState:function (evt) {
        if ((this.app.getStatus() !== this.app.lifecycle.STARTED) || !evt.state) {
            return;
        }
        var backward = evt.state.id < this._currentPosition;
        backward ? this._currentPosition -= 1 : this._currentPosition += 1;
        var opts = lang.mixin({reverse:backward ? true : false}, evt.state);
        opts.transition = backward ? opts.bwdTransition : opts.fwdTransition;
        this.app.emit("app-transition", {viewId:evt.state.target, opts:opts});
        topic.publish("/app/history/popState", evt.state.target);
    }});
});

