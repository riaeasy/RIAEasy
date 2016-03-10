//>>built

define("dojo/_base/fx", ["./kernel", "./config", "./lang", "../Evented", "./Color", "../aspect", "../sniff", "../dom", "../dom-style"], function (dojo, config, lang, Evented, Color, aspect, has, dom, style) {
    var _mixin = lang.mixin;
    var basefx = {};
    var _Line = basefx._Line = function (start, end) {
        this.start = start;
        this.end = end;
    };
    _Line.prototype.getValue = function (n) {
        return ((this.end - this.start) * n) + this.start;
    };
    var Animation = basefx.Animation = function (args) {
        _mixin(this, args);
        if (lang.isArray(this.curve)) {
            this.curve = new _Line(this.curve[0], this.curve[1]);
        }
    };
    Animation.prototype = new Evented();
    lang.extend(Animation, {duration:350, repeat:0, rate:20, _percent:0, _startRepeatCount:0, _getStep:function () {
        var _p = this._percent, _e = this.easing;
        return _e ? _e(_p) : _p;
    }, _fire:function (evt, args) {
        var a = args || [];
        if (this[evt]) {
            if (config.debugAtAllCosts) {
                this[evt].apply(this, a);
            } else {
                try {
                    this[evt].apply(this, a);
                }
                catch (e) {
                    console.error("exception in animation handler for:", evt);
                    console.error(e);
                }
            }
        }
        return this;
    }, play:function (delay, gotoStart) {
        var _t = this;
        if (_t._delayTimer) {
            _t._clearTimer();
        }
        if (gotoStart) {
            _t._stopTimer();
            _t._active = _t._paused = false;
            _t._percent = 0;
        } else {
            if (_t._active && !_t._paused) {
                return _t;
            }
        }
        _t._fire("beforeBegin", [_t.node]);
        var de = delay || _t.delay, _p = lang.hitch(_t, "_play", gotoStart);
        if (de > 0) {
            _t._delayTimer = setTimeout(_p, de);
            return _t;
        }
        _p();
        return _t;
    }, _play:function (gotoStart) {
        var _t = this;
        if (_t._delayTimer) {
            _t._clearTimer();
        }
        _t._startTime = new Date().valueOf();
        if (_t._paused) {
            _t._startTime -= _t.duration * _t._percent;
        }
        _t._active = true;
        _t._paused = false;
        var value = _t.curve.getValue(_t._getStep());
        if (!_t._percent) {
            if (!_t._startRepeatCount) {
                _t._startRepeatCount = _t.repeat;
            }
            _t._fire("onBegin", [value]);
        }
        _t._fire("onPlay", [value]);
        _t._cycle();
        return _t;
    }, pause:function () {
        var _t = this;
        if (_t._delayTimer) {
            _t._clearTimer();
        }
        _t._stopTimer();
        if (!_t._active) {
            return _t;
        }
        _t._paused = true;
        _t._fire("onPause", [_t.curve.getValue(_t._getStep())]);
        return _t;
    }, gotoPercent:function (percent, andPlay) {
        var _t = this;
        _t._stopTimer();
        _t._active = _t._paused = true;
        _t._percent = percent;
        if (andPlay) {
            _t.play();
        }
        return _t;
    }, stop:function (gotoEnd) {
        var _t = this;
        if (_t._delayTimer) {
            _t._clearTimer();
        }
        if (!_t._timer) {
            return _t;
        }
        _t._stopTimer();
        if (gotoEnd) {
            _t._percent = 1;
        }
        _t._fire("onStop", [_t.curve.getValue(_t._getStep())]);
        _t._active = _t._paused = false;
        return _t;
    }, destroy:function () {
        this.stop();
    }, status:function () {
        if (this._active) {
            return this._paused ? "paused" : "playing";
        }
        return "stopped";
    }, _cycle:function () {
        var _t = this;
        if (_t._active) {
            var curr = new Date().valueOf();
            var step = _t.duration === 0 ? 1 : (curr - _t._startTime) / (_t.duration);
            if (step >= 1) {
                step = 1;
            }
            _t._percent = step;
            if (_t.easing) {
                step = _t.easing(step);
            }
            _t._fire("onAnimate", [_t.curve.getValue(step)]);
            if (_t._percent < 1) {
                _t._startTimer();
            } else {
                _t._active = false;
                if (_t.repeat > 0) {
                    _t.repeat--;
                    _t.play(null, true);
                } else {
                    if (_t.repeat == -1) {
                        _t.play(null, true);
                    } else {
                        if (_t._startRepeatCount) {
                            _t.repeat = _t._startRepeatCount;
                            _t._startRepeatCount = 0;
                        }
                    }
                }
                _t._percent = 0;
                _t._fire("onEnd", [_t.node]);
                !_t.repeat && _t._stopTimer();
            }
        }
        return _t;
    }, _clearTimer:function () {
        clearTimeout(this._delayTimer);
        delete this._delayTimer;
    }});
    var ctr = 0, timer = null, runner = {run:function () {
    }};
    lang.extend(Animation, {_startTimer:function () {
        if (!this._timer) {
            this._timer = aspect.after(runner, "run", lang.hitch(this, "_cycle"), true);
            ctr++;
        }
        if (!timer) {
            timer = setInterval(lang.hitch(runner, "run"), this.rate);
        }
    }, _stopTimer:function () {
        if (this._timer) {
            this._timer.remove();
            this._timer = null;
            ctr--;
        }
        if (ctr <= 0) {
            clearInterval(timer);
            timer = null;
            ctr = 0;
        }
    }});
    var _makeFadeable = has("ie") ? function (node) {
        var ns = node.style;
        if (!ns.width.length && style.get(node, "width") == "auto") {
            ns.width = "auto";
        }
    } : function () {
    };
    basefx._fade = function (args) {
        args.node = dom.byId(args.node);
        var fArgs = _mixin({properties:{}}, args), props = (fArgs.properties.opacity = {});
        props.start = !("start" in fArgs) ? function () {
            return +style.get(fArgs.node, "opacity") || 0;
        } : fArgs.start;
        props.end = fArgs.end;
        var anim = basefx.animateProperty(fArgs);
        aspect.after(anim, "beforeBegin", lang.partial(_makeFadeable, fArgs.node), true);
        return anim;
    };
    basefx.fadeIn = function (args) {
        return basefx._fade(_mixin({end:1}, args));
    };
    basefx.fadeOut = function (args) {
        return basefx._fade(_mixin({end:0}, args));
    };
    basefx._defaultEasing = function (n) {
        return 0.5 + ((Math.sin((n + 1.5) * Math.PI)) / 2);
    };
    var PropLine = function (properties) {
        this._properties = properties;
        for (var p in properties) {
            var prop = properties[p];
            if (prop.start instanceof Color) {
                prop.tempColor = new Color();
            }
        }
    };
    PropLine.prototype.getValue = function (r) {
        var ret = {};
        for (var p in this._properties) {
            var prop = this._properties[p], start = prop.start;
            if (start instanceof Color) {
                ret[p] = Color.blendColors(start, prop.end, r, prop.tempColor).toCss();
            } else {
                if (!lang.isArray(start)) {
                    ret[p] = ((prop.end - start) * r) + start + (p != "opacity" ? prop.units || "px" : 0);
                }
            }
        }
        return ret;
    };
    basefx.animateProperty = function (args) {
        var n = args.node = dom.byId(args.node);
        if (!args.easing) {
            args.easing = dojo._defaultEasing;
        }
        var anim = new Animation(args);
        aspect.after(anim, "beforeBegin", lang.hitch(anim, function () {
            var pm = {};
            for (var p in this.properties) {
                if (p == "width" || p == "height") {
                    this.node.display = "block";
                }
                var prop = this.properties[p];
                if (lang.isFunction(prop)) {
                    prop = prop(n);
                }
                prop = pm[p] = _mixin({}, (lang.isObject(prop) ? prop : {end:prop}));
                if (lang.isFunction(prop.start)) {
                    prop.start = prop.start(n);
                }
                if (lang.isFunction(prop.end)) {
                    prop.end = prop.end(n);
                }
                var isColor = (p.toLowerCase().indexOf("color") >= 0);
                function getStyle(node, p) {
                    var v = {height:node.offsetHeight, width:node.offsetWidth}[p];
                    if (v !== undefined) {
                        return v;
                    }
                    v = style.get(node, p);
                    return (p == "opacity") ? +v : (isColor ? v : parseFloat(v));
                }
                if (!("end" in prop)) {
                    prop.end = getStyle(n, p);
                } else {
                    if (!("start" in prop)) {
                        prop.start = getStyle(n, p);
                    }
                }
                if (isColor) {
                    prop.start = new Color(prop.start);
                    prop.end = new Color(prop.end);
                } else {
                    prop.start = (p == "opacity") ? +prop.start : parseFloat(prop.start);
                }
            }
            this.curve = new PropLine(pm);
        }), true);
        aspect.after(anim, "onAnimate", lang.hitch(style, "set", anim.node), true);
        return anim;
    };
    basefx.anim = function (node, properties, duration, easing, onEnd, delay) {
        return basefx.animateProperty({node:node, duration:duration || Animation.prototype.duration, properties:properties, easing:easing, onEnd:onEnd}).play(delay || 0);
    };
    if (1) {
        _mixin(dojo, basefx);
        dojo._Animation = Animation;
    }
    return basefx;
});

