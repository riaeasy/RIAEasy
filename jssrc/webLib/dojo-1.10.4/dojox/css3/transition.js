//>>built

define("dojox/css3/transition", ["dojo/_base/lang", "dojo/_base/array", "dojo/Deferred", "dojo/when", "dojo/promise/all", "dojo/on", "dojo/sniff"], function (lang, array, Deferred, when, all, on, has) {
    var transitionEndEventName = "transitionend";
    var transitionPrefix = "t";
    var translateMethodStart = "translate3d(";
    var translateMethodEnd = ",0,0)";
    if (has("webkit")) {
        transitionPrefix = "WebkitT";
        transitionEndEventName = "webkitTransitionEnd";
    } else {
        if (has("mozilla")) {
            transitionPrefix = "MozT";
            translateMethodStart = "translateX(";
            translateMethodEnd = ")";
        }
    }
    var transition = function (args) {
        var defaultConfig = {startState:{}, endState:{}, node:null, duration:250, "in":true, direction:1, autoClear:true};
        lang.mixin(this, defaultConfig);
        lang.mixin(this, args);
        if (!this.deferred) {
            this.deferred = new Deferred();
        }
    };
    lang.extend(transition, {play:function () {
        transition.groupedPlay([this]);
    }, _applyState:function (state) {
        var style = this.node.style;
        for (var property in state) {
            if (state.hasOwnProperty(property)) {
                style[property] = state[property];
            }
        }
    }, initState:function () {
        this.node.style[transitionPrefix + "ransitionProperty"] = "none";
        this.node.style[transitionPrefix + "ransitionDuration"] = "0ms";
        this._applyState(this.startState);
    }, _beforeStart:function () {
        if (this.node.style.display === "none") {
            this.node.style.display = "";
        }
        this.beforeStart();
    }, _beforeClear:function () {
        this.node.style[transitionPrefix + "ransitionProperty"] = "";
        this.node.style[transitionPrefix + "ransitionDuration"] = "";
        if (this["in"] !== true) {
            this.node.style.display = "none";
        }
        this.beforeClear();
    }, _onAfterEnd:function () {
        this.deferred.resolve(this.node);
        if (this.node.id && transition.playing[this.node.id] === this.deferred) {
            delete transition.playing[this.node.id];
        }
        this.onAfterEnd();
    }, beforeStart:function () {
    }, beforeClear:function () {
    }, onAfterEnd:function () {
    }, start:function () {
        this._beforeStart();
        this._startTime = new Date().getTime();
        this._cleared = false;
        var self = this;
        self.node.style[transitionPrefix + "ransitionProperty"] = "all";
        self.node.style[transitionPrefix + "ransitionDuration"] = self.duration + "ms";
        on.once(self.node, transitionEndEventName, function () {
            self.clear();
        });
        this._applyState(this.endState);
    }, clear:function () {
        if (this._cleared) {
            return;
        }
        this._cleared = true;
        this._beforeClear();
        this._removeState(this.endState);
        this._onAfterEnd();
    }, _removeState:function (state) {
        var style = this.node.style;
        for (var property in state) {
            if (state.hasOwnProperty(property)) {
                style[property] = "";
            }
        }
    }});
    transition.slide = function (node, config) {
        var ret = new transition(config);
        ret.node = node;
        var startX = "0";
        var endX = "0";
        if (ret["in"]) {
            if (ret.direction === 1) {
                startX = "100%";
            } else {
                startX = "-100%";
            }
        } else {
            if (ret.direction === 1) {
                endX = "-100%";
            } else {
                endX = "100%";
            }
        }
        ret.startState[transitionPrefix + "ransform"] = translateMethodStart + startX + translateMethodEnd;
        ret.endState[transitionPrefix + "ransform"] = translateMethodStart + endX + translateMethodEnd;
        return ret;
    };
    transition.fade = function (node, config) {
        var ret = new transition(config);
        ret.node = node;
        var startOpacity = "0";
        var endOpacity = "0";
        if (ret["in"]) {
            endOpacity = "1";
        } else {
            startOpacity = "1";
        }
        lang.mixin(ret, {startState:{"opacity":startOpacity}, endState:{"opacity":endOpacity}});
        return ret;
    };
    transition.flip = function (node, config) {
        var ret = new transition(config);
        ret.node = node;
        if (ret["in"]) {
            lang.mixin(ret, {startState:{"opacity":"0"}, endState:{"opacity":"1"}});
            ret.startState[transitionPrefix + "ransform"] = "scale(0,0.8) skew(0,-30deg)";
            ret.endState[transitionPrefix + "ransform"] = "scale(1,1) skew(0,0)";
        } else {
            lang.mixin(ret, {startState:{"opacity":"1"}, endState:{"opacity":"0"}});
            ret.startState[transitionPrefix + "ransform"] = "scale(1,1) skew(0,0)";
            ret.endState[transitionPrefix + "ransform"] = "scale(0,0.8) skew(0,30deg)";
        }
        return ret;
    };
    var getWaitingList = function (nodes) {
        var defs = [];
        array.forEach(nodes, function (node) {
            if (node.id && transition.playing[node.id]) {
                defs.push(transition.playing[node.id]);
            }
        });
        return all(defs);
    };
    transition.getWaitingList = getWaitingList;
    transition.groupedPlay = function (args) {
        var animNodes = array.filter(args, function (item) {
            return item.node;
        });
        var waitingList = getWaitingList(animNodes);
        array.forEach(args, function (item) {
            if (item.node.id) {
                transition.playing[item.node.id] = item.deferred;
            }
        });
        when(waitingList, function () {
            array.forEach(args, function (item) {
                item.initState();
            });
            setTimeout(function () {
                array.forEach(args, function (item) {
                    item.start();
                });
                on.once(args[args.length - 1].node, transitionEndEventName, function () {
                    var timeout;
                    for (var i = 0; i < args.length - 1; i++) {
                        if (args[i].deferred.fired !== 0 && !args[i]._cleared) {
                            timeout = new Date().getTime() - args[i]._startTime;
                            if (timeout >= args[i].duration) {
                                args[i].clear();
                            }
                        }
                    }
                });
                setTimeout(function () {
                    var timeout;
                    for (var i = 0; i < args.length; i++) {
                        if (args[i].deferred.fired !== 0 && !args[i]._cleared) {
                            timeout = new Date().getTime() - args[i]._startTime;
                            if (timeout >= args[i].duration) {
                                args[i].clear();
                            }
                        }
                    }
                }, args[0].duration + 50);
            }, 33);
        });
    };
    transition.chainedPlay = function (args) {
        var animNodes = array.filter(args, function (item) {
            return item.node;
        });
        var waitingList = getWaitingList(animNodes);
        array.forEach(args, function (item) {
            if (item.node.id) {
                transition.playing[item.node.id] = item.deferred;
            }
        });
        when(waitingList, function () {
            array.forEach(args, function (item) {
                item.initState();
            });
            for (var i = 1, len = args.length; i < len; i++) {
                args[i - 1].deferred.then(lang.hitch(args[i], function () {
                    this.start();
                }));
            }
            setTimeout(function () {
                args[0].start();
            }, 33);
        });
    };
    transition.playing = {};
    return transition;
});

