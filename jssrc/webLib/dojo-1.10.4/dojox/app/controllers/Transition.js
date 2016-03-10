//>>built

define("dojox/app/controllers/Transition", ["require", "dojo/_base/lang", "dojo/_base/declare", "dojo/has", "dojo/on", "dojo/Deferred", "dojo/when", "dojo/dom-style", "../Controller", "../utils/constraints"], function (require, lang, declare, has, on, Deferred, when, domStyle, Controller, constraints) {
    var transit;
    var MODULE = "app/controllers/Transition";
    var LOGKEY = "logTransitions:";
    return declare("dojox.app.controllers.Transition", Controller, {proceeding:false, waitingQueue:[], constructor:function (app, events) {
        this.events = {"app-transition":this.transition, "app-domNode":this.onDomNodeChange};
        require([this.app.transit || "dojox/css3/transit"], function (t) {
            transit = t;
        });
        if (this.app.domNode) {
            this.onDomNodeChange({oldNode:null, newNode:this.app.domNode});
        }
    }, transition:function (event) {
        var F = MODULE + ":transition";
        this.app.log(LOGKEY, F, " ");
        this.app.log(LOGKEY, F, "New Transition event.viewId=[" + event.viewId + "]");
        this.app.log(F, "event.viewId=[" + event.viewId + "]", "event.opts=", event.opts);
        var viewsId = event.viewId || "";
        this.proceedingSaved = this.proceeding;
        var parts = viewsId.split("+");
        var removePartsTest = viewsId.split("-");
        var viewId, newEvent;
        if (parts.length > 0 || removePartsTest.length > 0) {
            while (parts.length > 1) {
                viewId = parts.shift();
                newEvent = lang.clone(event);
                if (viewId.indexOf("-") >= 0) {
                    var removeParts = viewId.split("-");
                    if (removeParts.length > 0) {
                        viewId = removeParts.shift();
                        if (viewId) {
                            newEvent._removeView = false;
                            newEvent.viewId = viewId;
                            this.proceeding = true;
                            this.proceedTransition(newEvent);
                            newEvent = lang.clone(event);
                        }
                        viewId = removeParts.shift();
                        if (viewId) {
                            newEvent._removeView = true;
                            newEvent.viewId = viewId;
                            this.proceeding = true;
                            this.proceedTransition(newEvent);
                        }
                    }
                } else {
                    newEvent._removeView = false;
                    newEvent.viewId = viewId;
                    this.proceeding = true;
                    this.proceedTransition(newEvent);
                }
            }
            viewId = parts.shift();
            var removeParts = viewId.split("-");
            if (removeParts.length > 0) {
                viewId = removeParts.shift();
            }
            if (viewId.length > 0) {
                this.proceeding = this.proceedingSaved;
                event.viewId = viewId;
                event._doResize = true;
                event._removeView = false;
                this.proceedTransition(event);
            }
            if (removeParts.length > 0) {
                while (removeParts.length > 0) {
                    var remViewId = removeParts.shift();
                    newEvent = lang.clone(event);
                    newEvent.viewId = remViewId;
                    newEvent._removeView = true;
                    newEvent._doResize = true;
                    this.proceedTransition(newEvent);
                }
            }
        } else {
            event._doResize = true;
            event._removeView = false;
            this.proceedTransition(event);
        }
    }, onDomNodeChange:function (evt) {
        if (evt.oldNode != null) {
            this.unbind(evt.oldNode, "startTransition");
        }
        this.bind(evt.newNode, "startTransition", lang.hitch(this, this.onStartTransition));
    }, onStartTransition:function (evt) {
        if (evt.preventDefault) {
            evt.preventDefault();
        }
        evt.cancelBubble = true;
        if (evt.stopPropagation) {
            evt.stopPropagation();
        }
        var target = evt.detail.target;
        var regex = /#(.+)/;
        if (!target && regex.test(evt.detail.href)) {
            target = evt.detail.href.match(regex)[1];
        }
        this.transition({"viewId":target, opts:lang.mixin({}, evt.detail), data:evt.detail.data});
    }, _addTransitionEventToWaitingQueue:function (transitionEvt) {
        if (transitionEvt.defaultView && this.waitingQueue.length > 0) {
            var addedEvt = false;
            for (var i = 0; i < this.waitingQueue.length; i++) {
                var evt = this.waitingQueue[i];
                if (!evt.defaultView) {
                    this.waitingQueue.splice(i, 0, transitionEvt);
                    addedEvt = true;
                    break;
                }
            }
            if (!addedEvt) {
                this.waitingQueue.push(transitionEvt);
            }
        } else {
            this.waitingQueue.push(transitionEvt);
        }
    }, proceedTransition:function (transitionEvt) {
        var F = MODULE + ":proceedTransition";
        if (this.proceeding) {
            this._addTransitionEventToWaitingQueue(transitionEvt);
            this.app.log(F + " added this event to waitingQueue", transitionEvt);
            this.processingQueue = false;
            return;
        }
        this.app.log(F + " this.waitingQueue.length =" + this.waitingQueue.length + " this.processingQueue=" + this.processingQueue);
        if (this.waitingQueue.length > 0 && !this.processingQueue) {
            this.processingQueue = true;
            this._addTransitionEventToWaitingQueue(transitionEvt);
            this.app.log(F + " added this event to waitingQueue passed proceeding", transitionEvt);
            transitionEvt = this.waitingQueue.shift();
            this.app.log(F + " shifted waitingQueue to process", transitionEvt);
        }
        this.proceeding = true;
        this.app.log(F + " calling trigger load", transitionEvt);
        if (!transitionEvt.opts) {
            transitionEvt.opts = {};
        }
        var params = transitionEvt.params || transitionEvt.opts.params;
        this.app.emit("app-load", {"viewId":transitionEvt.viewId, "params":params, "forceTransitionNone":transitionEvt.forceTransitionNone, "callback":lang.hitch(this, function (needToHandleDefaultView, defaultHasPlus) {
            if (needToHandleDefaultView) {
                this.proceeding = false;
                this.processingQueue = true;
                var nextEvt = (defaultHasPlus) ? this.waitingQueue.shift() : this.waitingQueue.pop();
                if (nextEvt) {
                    this.proceedTransition(nextEvt);
                }
            } else {
                var transitionDef = this._doTransition(transitionEvt.viewId, transitionEvt.opts, params, transitionEvt.opts.data, this.app, transitionEvt._removeView, transitionEvt._doResize, transitionEvt.forceTransitionNone);
                when(transitionDef, lang.hitch(this, function () {
                    this.proceeding = false;
                    this.processingQueue = true;
                    var nextEvt = this.waitingQueue.shift();
                    if (nextEvt) {
                        this.proceedTransition(nextEvt);
                    }
                }));
            }
        })});
    }, _getTransition:function (nextView, parent, transitionTo, opts, forceTransitionNone) {
        if (forceTransitionNone) {
            return "none";
        }
        var parentView = parent;
        var transition = null;
        if (nextView) {
            transition = nextView.transition;
        }
        if (!transition && parentView.views[transitionTo]) {
            transition = parentView.views[transitionTo].transition;
        }
        if (!transition) {
            transition = parentView.transition;
        }
        var defaultTransition = (nextView && nextView.defaultTransition) ? nextView.defaultTransition : parentView.defaultTransition;
        while (!transition && parentView.parent) {
            parentView = parentView.parent;
            transition = parentView.transition;
            if (!defaultTransition) {
                defaultTransition = parentView.defaultTransition;
            }
        }
        return transition || opts.transition || defaultTransition || "none";
    }, _getParamsForView:function (view, params) {
        var viewParams = {};
        for (var item in params) {
            var value = params[item];
            if (lang.isObject(value)) {
                if (item == view) {
                    viewParams = lang.mixin(viewParams, value);
                }
            } else {
                if (item && value != null) {
                    viewParams[item] = params[item];
                }
            }
        }
        return viewParams;
    }, _doTransition:function (transitionTo, opts, params, data, parent, removeView, doResize, forceTransitionNone, nested) {
        var F = MODULE + ":_doTransition";
        if (!parent) {
            throw Error("view parent not found in transition.");
        }
        this.app.log(F + " transitionTo=[", transitionTo, "], removeView=[", removeView, "] parent.name=[", parent.name, "], opts=", opts);
        var parts, toId, subIds, next;
        if (transitionTo) {
            parts = transitionTo.split(",");
        } else {
            parts = parent.defaultView.split(",");
        }
        toId = parts.shift();
        subIds = parts.join(",");
        next = parent.children[parent.id + "_" + toId];
        if (!next) {
            if (removeView) {
                this.app.log(F + " called with removeView true, but that view is not available to remove");
                return;
            }
            throw Error("child view must be loaded before transition.");
        }
        if (!subIds && next.defaultView) {
            subIds = next.defaultView;
        }
        var nextSubViewArray = [next || parent];
        if (subIds) {
            nextSubViewArray = this._getNextSubViewArray(subIds, next, parent);
        }
        var current = constraints.getSelectedChild(parent, next.constraint);
        var currentSubViewArray = this._getCurrentSubViewArray(parent, nextSubViewArray, removeView);
        var currentSubNames = this._getNamesFromArray(currentSubViewArray, false);
        var nextSubNames = this._getNamesFromArray(nextSubViewArray, true);
        next.params = this._getParamsForView(next.name, params);
        if (removeView) {
            if (next !== current) {
                this.app.log(F + " called with removeView true, but that view is not available to remove");
                return;
            }
            this.app.log(LOGKEY, F, "Transition Remove current From=[" + currentSubNames + "]");
            next = null;
        }
        if (nextSubNames == currentSubNames && next == current) {
            this.app.log(LOGKEY, F, "Transition current and next DO MATCH From=[" + currentSubNames + "] TO=[" + nextSubNames + "]");
            this._handleMatchingViews(nextSubViewArray, next, current, parent, data, removeView, doResize, subIds, currentSubNames, toId, forceTransitionNone, opts);
        } else {
            this.app.log(LOGKEY, F, "Transition current and next DO NOT MATCH From=[" + currentSubNames + "] TO=[" + nextSubNames + "]");
            if (!removeView && next) {
                var nextLastSubChild = this.nextLastSubChildMatch || next;
                var startHiding = false;
                for (var i = nextSubViewArray.length - 1; i >= 0; i--) {
                    var v = nextSubViewArray[i];
                    if (startHiding || v.id == nextLastSubChild.id) {
                        startHiding = true;
                        if (!v._needsResize && v.domNode) {
                            this.app.log(LOGKEY, F, " setting domStyle visibility hidden for v.id=[" + v.id + "], display=[" + v.domNode.style.display + "], visibility=[" + v.domNode.style.visibility + "]");
                            this._setViewVisible(v, false);
                        }
                    }
                }
            }
            if (current && current._active) {
                this._handleBeforeDeactivateCalls(currentSubViewArray, this.nextLastSubChildMatch || next, current, data, subIds);
            }
            if (next) {
                this.app.log(F + " calling _handleBeforeActivateCalls next name=[", next.name, "], parent.name=[", next.parent.name, "]");
                this._handleBeforeActivateCalls(nextSubViewArray, this.currentLastSubChildMatch || current, data, subIds);
            }
            if (!removeView) {
                var nextLastSubChild = this.nextLastSubChildMatch || next;
                var trans = this._getTransition(nextLastSubChild, parent, toId, opts, forceTransitionNone);
                this.app.log(F + " calling _handleLayoutAndResizeCalls trans=" + trans);
                this._handleLayoutAndResizeCalls(nextSubViewArray, removeView, doResize, subIds, forceTransitionNone, trans);
            } else {
                for (var i = 0; i < nextSubViewArray.length; i++) {
                    var v = nextSubViewArray[i];
                    this.app.log(LOGKEY, F, "setting visibility visible for v.id=[" + v.id + "]");
                    if (v.domNode) {
                        this.app.log(LOGKEY, F, "  setting domStyle for removeView visibility visible for v.id=[" + v.id + "], display=[" + v.domNode.style.display + "]");
                        this._setViewVisible(v, true);
                    }
                }
            }
            var result = true;
            if (transit && (!nested || this.currentLastSubChildMatch != null) && this.currentLastSubChildMatch !== next) {
                result = this._handleTransit(next, parent, this.currentLastSubChildMatch, opts, toId, removeView, forceTransitionNone, doResize);
            }
            when(result, lang.hitch(this, function () {
                if (next) {
                    this.app.log(F + " back from transit for next =" + next.name);
                }
                if (removeView) {
                    var nextLastSubChild = this.nextLastSubChildMatch || next;
                    var trans = this._getTransition(nextLastSubChild, parent, toId, opts, forceTransitionNone);
                    this._handleLayoutAndResizeCalls(nextSubViewArray, removeView, doResize, subIds, forceTransitionNone, trans);
                }
                this._handleAfterDeactivateCalls(currentSubViewArray, this.nextLastSubChildMatch || next, current, data, subIds);
                this._handleAfterActivateCalls(nextSubViewArray, removeView, this.currentLastSubChildMatch || current, data, subIds);
            }));
            return result;
        }
    }, _handleMatchingViews:function (subs, next, current, parent, data, removeView, doResize, subIds, currentSubNames, toId, forceTransitionNone, opts) {
        var F = MODULE + ":_handleMatchingViews";
        this._handleBeforeDeactivateCalls(subs, this.nextLastSubChildMatch || next, current, data, subIds);
        this._handleAfterDeactivateCalls(subs, this.nextLastSubChildMatch || next, current, data, subIds);
        this._handleBeforeActivateCalls(subs, this.currentLastSubChildMatch || current, data, subIds);
        var nextLastSubChild = this.nextLastSubChildMatch || next;
        var trans = this._getTransition(nextLastSubChild, parent, toId, opts, forceTransitionNone);
        this._handleLayoutAndResizeCalls(subs, removeView, doResize, subIds, trans);
        this._handleAfterActivateCalls(subs, removeView, this.currentLastSubChildMatch || current, data, subIds);
    }, _handleBeforeDeactivateCalls:function (subs, next, current, data, subIds) {
        var F = MODULE + ":_handleBeforeDeactivateCalls";
        if (current._active) {
            for (var i = subs.length - 1; i >= 0; i--) {
                var v = subs[i];
                if (v && v.beforeDeactivate && v._active) {
                    this.app.log(LOGKEY, F, "beforeDeactivate for v.id=" + v.id);
                    v.beforeDeactivate(next, data);
                }
            }
        }
    }, _handleAfterDeactivateCalls:function (subs, next, current, data, subIds) {
        var F = MODULE + ":_handleAfterDeactivateCalls";
        if (current && current._active) {
            for (var i = 0; i < subs.length; i++) {
                var v = subs[i];
                if (v && v.beforeDeactivate && v._active) {
                    this.app.log(LOGKEY, F, "afterDeactivate for v.id=" + v.id);
                    v.afterDeactivate(next, data);
                    v._active = false;
                }
            }
        }
    }, _handleBeforeActivateCalls:function (subs, current, data, subIds) {
        var F = MODULE + ":_handleBeforeActivateCalls";
        for (var i = subs.length - 1; i >= 0; i--) {
            var v = subs[i];
            this.app.log(LOGKEY, F, "beforeActivate for v.id=" + v.id);
            v.beforeActivate(current, data);
        }
    }, _handleLayoutAndResizeCalls:function (subs, removeView, doResize, subIds, forceTransitionNone, transition) {
        var F = MODULE + ":_handleLayoutAndResizeCalls";
        var remove = removeView;
        for (var i = 0; i < subs.length; i++) {
            var v = subs[i];
            this.app.log(LOGKEY, F, "emit layoutView v.id=[" + v.id + "] removeView=[" + remove + "]");
            this.app.emit("app-layoutView", {"parent":v.parent, "view":v, "removeView":remove, "doResize":false, "transition":transition, "currentLastSubChildMatch":this.currentLastSubChildMatch});
            remove = false;
        }
        if (doResize) {
            this.app.log(LOGKEY, F, "emit doResize called");
            this.app.emit("app-resize");
            if (transition == "none") {
                this._showSelectedChildren(this.app);
            }
        }
    }, _showSelectedChildren:function (w) {
        var F = MODULE + ":_showSelectedChildren";
        this.app.log(LOGKEY, F, " setting domStyle visibility visible for w.id=[" + w.id + "], display=[" + w.domNode.style.display + "], visibility=[" + w.domNode.style.visibility + "]");
        this._setViewVisible(w, true);
        w._needsResize = false;
        for (var hash in w.selectedChildren) {
            if (w.selectedChildren[hash] && w.selectedChildren[hash].domNode) {
                this.app.log(LOGKEY, F, " calling _showSelectedChildren for w.selectedChildren[hash].id=" + w.selectedChildren[hash].id);
                this._showSelectedChildren(w.selectedChildren[hash]);
            }
        }
    }, _setViewVisible:function (v, visible) {
        if (visible) {
            domStyle.set(v.domNode, "visibility", "visible");
        } else {
            domStyle.set(v.domNode, "visibility", "hidden");
        }
    }, _handleAfterActivateCalls:function (subs, removeView, current, data, subIds) {
        var F = MODULE + ":_handleAfterActivateCalls";
        var startInt = 0;
        if (removeView && subs.length > 1) {
            startInt = 1;
        }
        for (var i = startInt; i < subs.length; i++) {
            var v = subs[i];
            if (v.afterActivate) {
                this.app.log(LOGKEY, F, "afterActivate for v.id=" + v.id);
                v.afterActivate(current, data);
                v._active = true;
            }
        }
    }, _getNextSubViewArray:function (subIds, next, parent) {
        var F = MODULE + ":_getNextSubViewArray";
        var parts = [];
        var p = next || parent;
        if (subIds) {
            parts = subIds.split(",");
        }
        var nextSubViewArray = [p];
        for (var i = 0; i < parts.length; i++) {
            toId = parts[i];
            var v = p.children[p.id + "_" + toId];
            if (v) {
                nextSubViewArray.push(v);
                p = v;
            }
        }
        nextSubViewArray.reverse();
        return nextSubViewArray;
    }, _getCurrentSubViewArray:function (parent, nextSubViewArray, removeView) {
        var F = MODULE + ":_getCurrentSubViewArray";
        var currentSubViewArray = [];
        var constraint, type, hash;
        var p = parent;
        this.currentLastSubChildMatch = null;
        this.nextLastSubChildMatch = null;
        for (var i = nextSubViewArray.length - 1; i >= 0; i--) {
            constraint = nextSubViewArray[i].constraint;
            type = typeof (constraint);
            hash = (type == "string" || type == "number") ? constraint : constraint.__hash;
            if (p && p.selectedChildren && p.selectedChildren[hash]) {
                if (p.selectedChildren[hash] == nextSubViewArray[i]) {
                    this.currentLastSubChildMatch = p.selectedChildren[hash];
                    this.nextLastSubChildMatch = nextSubViewArray[i];
                    currentSubViewArray.push(this.currentLastSubChildMatch);
                    p = this.currentLastSubChildMatch;
                } else {
                    this.currentLastSubChildMatch = p.selectedChildren[hash];
                    currentSubViewArray.push(this.currentLastSubChildMatch);
                    this.nextLastSubChildMatch = nextSubViewArray[i];
                    if (!removeView) {
                        var selChildren = constraints.getAllSelectedChildren(this.currentLastSubChildMatch);
                        currentSubViewArray = currentSubViewArray.concat(selChildren);
                    }
                    break;
                }
            } else {
                this.currentLastSubChildMatch = null;
                this.nextLastSubChildMatch = nextSubViewArray[i];
                break;
            }
        }
        if (removeView) {
            var selChildren = constraints.getAllSelectedChildren(p);
            currentSubViewArray = currentSubViewArray.concat(selChildren);
        }
        return currentSubViewArray;
    }, _getNamesFromArray:function (subViewArray, backward) {
        var F = MODULE + ":_getNamesFromArray";
        var subViewNames = "";
        if (backward) {
            for (var i = subViewArray.length - 1; i >= 0; i--) {
                subViewNames = subViewNames ? subViewNames + "," + subViewArray[i].name : subViewArray[i].name;
            }
        } else {
            for (var i = 0; i < subViewArray.length; i++) {
                subViewNames = subViewNames ? subViewNames + "," + subViewArray[i].name : subViewArray[i].name;
            }
        }
        return subViewNames;
    }, _handleTransit:function (next, parent, currentLastSubChild, opts, toId, removeView, forceTransitionNone, resizeDone) {
        var F = MODULE + ":_handleTransit";
        var nextLastSubChild = this.nextLastSubChildMatch || next;
        var mergedOpts = lang.mixin({}, opts);
        mergedOpts = lang.mixin({}, mergedOpts, {reverse:(mergedOpts.reverse || mergedOpts.transitionDir === -1) ? true : false, transition:this._getTransition(nextLastSubChild, parent, toId, mergedOpts, forceTransitionNone)});
        if (removeView) {
            nextLastSubChild = null;
        }
        if (currentLastSubChild) {
            this.app.log(LOGKEY, F, "transit FROM currentLastSubChild.id=[" + currentLastSubChild.id + "]");
        }
        if (nextLastSubChild) {
            if (mergedOpts.transition !== "none") {
                if (!resizeDone && nextLastSubChild._needsResize) {
                    this.app.log(LOGKEY, F, "emit doResize called from _handleTransit");
                    this.app.emit("app-resize");
                }
                this.app.log(LOGKEY, F, "  calling _showSelectedChildren for w3.id=[" + nextLastSubChild.id + "], display=[" + nextLastSubChild.domNode.style.display + "], visibility=[" + nextLastSubChild.domNode.style.visibility + "]");
                this._showSelectedChildren(this.app);
            }
            this.app.log(LOGKEY, F, "transit TO nextLastSubChild.id=[" + nextLastSubChild.id + "] transition=[" + mergedOpts.transition + "]");
        } else {
            this._showSelectedChildren(this.app);
        }
        return transit(currentLastSubChild && currentLastSubChild.domNode, nextLastSubChild && nextLastSubChild.domNode, mergedOpts);
    }});
});

