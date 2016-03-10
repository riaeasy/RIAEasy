//>>built

define("dojox/widget/AutoRotator", ["dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/on", "dojo/mouse", "dojox/widget/Rotator"], function (declare, array, lang, on, mouse, Rotator) {
    return declare("dojox.widget.AutoRotator", Rotator, {suspendOnHover:false, duration:4000, autoStart:true, pauseOnManualChange:false, cycles:-1, random:false, reverse:false, constructor:function () {
        var _t = this;
        if (_t.cycles - 0 == _t.cycles && _t.cycles > 0) {
            _t.cycles++;
        } else {
            _t.cycles = _t.cycles ? -1 : 0;
        }
        _t._signals = [on(_t._domNode, mouse.enter, function () {
            if (_t.suspendOnHover && !_t.anim && !_t.wfe) {
                var t = _t._endTime, n = _t._now();
                _t._suspended = true;
                _t._resetTimer();
                _t._resumeDuration = t > n ? t - n : 0.01;
            }
        }), on(_t._domNode, mouse.leave, function () {
            if (_t.suspendOnHover && !_t.anim) {
                _t._suspended = false;
                if (_t.playing && !_t.wfe) {
                    _t.play(true);
                }
            }
        })];
        if (_t.autoStart && _t.panes.length > 1) {
            _t.play();
        } else {
            _t.pause();
        }
    }, destroy:function () {
        array.forEach(this._signals, function (signal) {
            signal.remove();
        });
        delete this._signals;
        dojo.forEach(this._connects, dojo.disconnect);
        this.inherited(arguments);
    }, play:function (skipCycleDecrement, skipDuration) {
        this.playing = true;
        this._resetTimer();
        if (skipCycleDecrement !== true && this.cycles > 0) {
            this.cycles--;
        }
        if (this.cycles == 0) {
            this.pause();
        } else {
            if (!this._suspended) {
                this.onUpdate("play");
                if (skipDuration) {
                    this._cycle();
                } else {
                    var r = (this._resumeDuration || 0) - 0, u = (r > 0 ? r : (this.panes[this.idx].duration || this.duration)) - 0;
                    this._resumeDuration = 0;
                    this._endTime = this._now() + u;
                    this._timer = setTimeout(lang.hitch(this, "_cycle", false), u);
                }
            }
        }
    }, pause:function () {
        this.playing = this._suspended = false;
        this.cycles = -1;
        this._resetTimer();
        this.onUpdate("pause");
    }, _now:function () {
        return (new Date()).getTime();
    }, _resetTimer:function () {
        clearTimeout(this._timer);
    }, _cycle:function (manual) {
        var _t = this, i = _t.idx, j;
        if (_t.random) {
            do {
                j = Math.floor(Math.random() * _t.panes.length + 1);
            } while (j == i);
        } else {
            j = i + (_t.reverse ? -1 : 1);
        }
        var def = _t.go(j);
        if (def) {
            def.addCallback(function (skipDuration) {
                _t.onUpdate("cycle");
                if (_t.playing) {
                    _t.play(false, skipDuration);
                }
            });
        }
    }, onManualChange:function (action) {
        this.cycles = -1;
        if (action != "play") {
            this._resetTimer();
            if (this.pauseOnManualChange) {
                this.pause();
            }
        }
        if (this.playing) {
            this.play();
        }
    }});
});

