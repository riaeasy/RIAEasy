//>>built

define("dojox/widget/Rotator", ["dojo/aspect", "dojo/_base/declare", "dojo/_base/Deferred", "dojo/_base/lang", "dojo/_base/array", "dojo/_base/fx", "dojo/dom", "dojo/dom-attr", "dojo/dom-construct", "dojo/dom-geometry", "dojo/dom-style", "dojo/topic", "dojo/on", "dojo/parser", "dojo/query", "dojo/fx/easing", "dojo/NodeList-dom"], function (aspect, declare, Deferred, lang, array, fx, dom, domAttr, domConstruct, domGeometry, domStyle, topic, on, parser, query) {
    var _defaultTransition = "dojox.widget.rotator.swap", _defaultTransitionDuration = 500, _displayStr = "display", _noneStr = "none", _zIndex = "zIndex";
    var Rotator = declare("dojox.widget.Rotator", null, {transition:_defaultTransition, transitionParams:"duration:" + _defaultTransitionDuration, panes:null, constructor:function (params, node) {
        lang.mixin(this, params);
        var _t = this, t = _t.transition, tt = _t._transitions = {}, idm = _t._idMap = {}, tp = _t.transitionParams = eval("({ " + _t.transitionParams + " })"), node = _t._domNode = dom.byId(node), cb = _t._domNodeContentBox = domGeometry.getContentBox(node), p = {left:0, top:0}, warn = function (bt, dt) {
            console.warn(_t.declaredClass, " - Unable to find transition \"", bt, "\", defaulting to \"", dt, "\".");
        };
        _t.id = node.id || (new Date()).getTime();
        if (domStyle.get(node, "position") == "static") {
            domStyle.set(node, "position", "relative");
        }
        tt[t] = lang.getObject(t);
        if (!tt[t]) {
            warn(t, _defaultTransition);
            tt[_t.transition = _defaultTransition] = lang.getObject(_defaultTransition);
        }
        if (!tp.duration) {
            tp.duration = _defaultTransitionDuration;
        }
        array.forEach(_t.panes, function (p) {
            domConstruct.create("div", p, node);
        });
        var pp = _t.panes = [];
        query("> *", node).forEach(function (n, i) {
            var q = {node:n, idx:i, params:lang.mixin({}, tp, eval("({ " + (domAttr.get(n, "transitionParams") || "") + " })"))}, r = q.trans = domAttr.get(n, "transition") || _t.transition;
            array.forEach(["id", "title", "duration", "waitForEvent"], function (a) {
                q[a] = domAttr.get(n, a);
            });
            if (q.id) {
                idm[q.id] = i;
            }
            if (!tt[r] && !(tt[r] = lang.getObject(r))) {
                warn(r, q.trans = _t.transition);
            }
            p.position = "absolute";
            p.display = _noneStr;
            if (_t.idx == null || domAttr.get(n, "selected")) {
                if (_t.idx != null) {
                    domStyle.set(pp[_t.idx].node, _displayStr, _noneStr);
                }
                _t.idx = i;
                p.display = "";
            }
            domStyle.set(n, p);
            query("> script[type^='dojo/method']", n).orphan().forEach(function (s) {
                var e = domAttr.get(s, "event");
                if (e) {
                    q[e] = parser._functionFromScript(s);
                }
            });
            pp.push(q);
        });
        _t._controlSub = topic.subscribe(_t.id + "/rotator/control", lang.hitch(_t, this.control));
    }, destroy:function () {
        array.forEach([this._controlSub, this.wfe], function (wfe) {
            wfe.remove();
        });
        domConstruct.destroy(this._domNode);
    }, next:function () {
        return this.go(this.idx + 1);
    }, prev:function () {
        return this.go(this.idx - 1);
    }, go:function (p) {
        var _t = this, i = _t.idx, pp = _t.panes, len = pp.length, idm = _t._idMap[p];
        _t._resetWaitForEvent();
        p = idm != null ? idm : (p || 0);
        p = p < len ? (p < 0 ? len - 1 : p) : 0;
        if (p == i || _t.anim) {
            return null;
        }
        var current = pp[i], next = pp[p];
        domStyle.set(current.node, _zIndex, 2);
        domStyle.set(next.node, _zIndex, 1);
        var info = {current:current, next:next, rotator:_t}, anim = _t.anim = _t._transitions[next.trans](lang.mixin({rotatorBox:_t._domNodeContentBox}, info, next.params));
        if (anim) {
            var def = new Deferred(), ev = next.waitForEvent, h = aspect.after(anim, "onEnd", function () {
                domStyle.set(current.node, {display:_noneStr, left:0, opacity:1, top:0, zIndex:0});
                h.remove();
                _t.anim = null;
                _t.idx = p;
                if (current.onAfterOut) {
                    current.onAfterOut(info);
                }
                if (next.onAfterIn) {
                    next.onAfterIn(info);
                }
                _t.onUpdate("onAfterTransition");
                if (!ev) {
                    _t._resetWaitForEvent();
                    def.callback();
                }
            }, true);
            _t.wfe = ev ? topic.subscribe(ev, function () {
                _t._resetWaitForEvent();
                def.callback(true);
            }) : null;
            _t.onUpdate("onBeforeTransition");
            if (current.onBeforeOut) {
                current.onBeforeOut(info);
            }
            if (next.onBeforeIn) {
                next.onBeforeIn(info);
            }
            anim.play();
            return def;
        }
    }, onUpdate:function (type, params) {
        topic.publish(this.id + "/rotator/update", type, this, params || {});
    }, _resetWaitForEvent:function () {
        if (this.wfe) {
            this.wfe.remove();
            delete this.wfe;
        }
    }, control:function (action) {
        var args = lang._toArray(arguments), _t = this;
        args.shift();
        _t._resetWaitForEvent();
        if (_t[action]) {
            var def = _t[action].apply(_t, args);
            if (def) {
                def.addCallback(function () {
                    _t.onUpdate(action);
                });
            }
            _t.onManualChange(action);
        } else {
            console.warn(_t.declaredClass, " - Unsupported action \"", action, "\".");
        }
    }, resize:function (width, height) {
        var b = this._domNodeContentBox = {w:width, h:height};
        domGeometry.setContentSize(this._domNode, b);
        array.forEach(this.panes, function (p) {
            domGeometry.setContentSize(p.node, b);
        });
    }, onManualChange:function () {
    }});
    lang.setObject(_defaultTransition, function (args) {
        return new fx.Animation({play:function () {
            domStyle.set(args.current.node, _displayStr, _noneStr);
            domStyle.set(args.next.node, _displayStr, "");
            this._fire("onEnd");
        }});
    });
    return Rotator;
});

