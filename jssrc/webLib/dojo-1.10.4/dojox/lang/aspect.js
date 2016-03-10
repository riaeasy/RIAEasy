//>>built

define("dojox/lang/aspect", ["dijit", "dojo", "dojox"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.lang.aspect");
    (function () {
        var d = dojo, aop = dojox.lang.aspect, ap = Array.prototype, contextStack = [], context;
        var Advice = function () {
            this.next_before = this.prev_before = this.next_around = this.prev_around = this.next_afterReturning = this.prev_afterReturning = this.next_afterThrowing = this.prev_afterThrowing = this;
            this.counter = 0;
        };
        d.extend(Advice, {add:function (advice) {
            var dyn = d.isFunction(advice), node = {advice:advice, dynamic:dyn};
            this._add(node, "before", "", dyn, advice);
            this._add(node, "around", "", dyn, advice);
            this._add(node, "after", "Returning", dyn, advice);
            this._add(node, "after", "Throwing", dyn, advice);
            ++this.counter;
            return node;
        }, _add:function (node, topic, subtopic, dyn, advice) {
            var full = topic + subtopic;
            if (dyn || advice[topic] || (subtopic && advice[full])) {
                var next = "next_" + full, prev = "prev_" + full;
                (node[prev] = this[prev])[next] = node;
                (node[next] = this)[prev] = node;
            }
        }, remove:function (node) {
            this._remove(node, "before");
            this._remove(node, "around");
            this._remove(node, "afterReturning");
            this._remove(node, "afterThrowing");
            --this.counter;
        }, _remove:function (node, topic) {
            var next = "next_" + topic, prev = "prev_" + topic;
            if (node[next]) {
                node[next][prev] = node[prev];
                node[prev][next] = node[next];
            }
        }, isEmpty:function () {
            return !this.counter;
        }});
        var getDispatcher = function () {
            return function () {
                var self = arguments.callee, advices = self.advices, ret, i, a, e, t;
                if (context) {
                    contextStack.push(context);
                }
                context = {instance:this, joinPoint:self, depth:contextStack.length, around:advices.prev_around, dynAdvices:[], dynIndex:0};
                try {
                    for (i = advices.prev_before; i != advices; i = i.prev_before) {
                        if (i.dynamic) {
                            context.dynAdvices.push(a = new i.advice(context));
                            if (t = a.before) {
                                t.apply(a, arguments);
                            }
                        } else {
                            t = i.advice;
                            t.before.apply(t, arguments);
                        }
                    }
                    try {
                        ret = (advices.prev_around == advices ? self.target : aop.proceed).apply(this, arguments);
                    }
                    catch (e) {
                        context.dynIndex = context.dynAdvices.length;
                        for (i = advices.next_afterThrowing; i != advices; i = i.next_afterThrowing) {
                            a = i.dynamic ? context.dynAdvices[--context.dynIndex] : i.advice;
                            if (t = a.afterThrowing) {
                                t.call(a, e);
                            }
                            if (t = a.after) {
                                t.call(a);
                            }
                        }
                        throw e;
                    }
                    context.dynIndex = context.dynAdvices.length;
                    for (i = advices.next_afterReturning; i != advices; i = i.next_afterReturning) {
                        a = i.dynamic ? context.dynAdvices[--context.dynIndex] : i.advice;
                        if (t = a.afterReturning) {
                            t.call(a, ret);
                        }
                        if (t = a.after) {
                            t.call(a);
                        }
                    }
                    var ls = self._listeners;
                    for (i in ls) {
                        if (!(i in ap)) {
                            ls[i].apply(this, arguments);
                        }
                    }
                }
                finally {
                    for (i = 0; i < context.dynAdvices.length; ++i) {
                        a = context.dynAdvices[i];
                        if (a.destroy) {
                            a.destroy();
                        }
                    }
                    context = contextStack.length ? contextStack.pop() : null;
                }
                return ret;
            };
        };
        aop.advise = function (obj, method, advice) {
            if (typeof obj != "object") {
                obj = obj.prototype;
            }
            var methods = [];
            if (!(method instanceof Array)) {
                method = [method];
            }
            for (var j = 0; j < method.length; ++j) {
                var t = method[j];
                if (t instanceof RegExp) {
                    for (var i in obj) {
                        if (d.isFunction(obj[i]) && t.test(i)) {
                            methods.push(i);
                        }
                    }
                } else {
                    if (d.isFunction(obj[t])) {
                        methods.push(t);
                    }
                }
            }
            if (!d.isArray(advice)) {
                advice = [advice];
            }
            return aop.adviseRaw(obj, methods, advice);
        };
        aop.adviseRaw = function (obj, methods, advices) {
            if (!methods.length || !advices.length) {
                return null;
            }
            var m = {}, al = advices.length;
            for (var i = methods.length - 1; i >= 0; --i) {
                var name = methods[i], o = obj[name], ao = new Array(al), t = o.advices;
                if (!t) {
                    var x = obj[name] = getDispatcher();
                    x.target = o.target || o;
                    x.targetName = name;
                    x._listeners = o._listeners || [];
                    x.advices = new Advice;
                    t = x.advices;
                }
                for (var j = 0; j < al; ++j) {
                    ao[j] = t.add(advices[j]);
                }
                m[name] = ao;
            }
            return [obj, m];
        };
        aop.unadvise = function (handle) {
            if (!handle) {
                return;
            }
            var obj = handle[0], methods = handle[1];
            for (var name in methods) {
                var o = obj[name], t = o.advices, ao = methods[name];
                for (var i = ao.length - 1; i >= 0; --i) {
                    t.remove(ao[i]);
                }
                if (t.isEmpty()) {
                    var empty = true, ls = o._listeners;
                    if (ls.length) {
                        for (i in ls) {
                            if (!(i in ap)) {
                                empty = false;
                                break;
                            }
                        }
                    }
                    if (empty) {
                        obj[name] = o.target;
                    } else {
                        var x = obj[name] = d._listener.getDispatcher();
                        x.target = o.target;
                        x._listeners = ls;
                    }
                }
            }
        };
        aop.getContext = function () {
            return context;
        };
        aop.getContextStack = function () {
            return contextStack;
        };
        aop.proceed = function () {
            var joinPoint = context.joinPoint, advices = joinPoint.advices;
            for (var c = context.around; c != advices; c = context.around) {
                context.around = c.prev_around;
                if (c.dynamic) {
                    var a = context.dynAdvices[context.dynIndex++], t = a.around;
                    if (t) {
                        return t.apply(a, arguments);
                    }
                } else {
                    return c.advice.around.apply(c.advice, arguments);
                }
            }
            return joinPoint.target.apply(context.instance, arguments);
        };
    })();
});

