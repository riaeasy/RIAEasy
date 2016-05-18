//>>built

define("dojo/aspect", [], function () {
    "use strict";
    var undefined, nextId = 0;
    function advise(dispatcher, type, advice, receiveArguments) {
        var previous = dispatcher[type];
        var around = type == "around";
        var signal;
        if (around) {
            var advised = advice(function () {
                return previous.advice(this, arguments);
            });
            signal = {remove:function () {
                if (advised) {
                    advised = dispatcher = advice = null;
                }
            }, advice:function (target, args) {
                return advised ? advised.apply(target, args) : previous.advice(target, args);
            }};
        } else {
            signal = {remove:function () {
                if (signal.advice) {
                    var previous = signal.previous;
                    var next = signal.next;
                    if (!next && !previous) {
                        delete dispatcher[type];
                    } else {
                        if (previous) {
                            previous.next = next;
                        } else {
                            dispatcher[type] = next;
                        }
                        if (next) {
                            next.previous = previous;
                        }
                    }
                    dispatcher = advice = signal.advice = null;
                }
            }, id:nextId++, advice:advice, receiveArguments:receiveArguments};
        }
        if (previous && !around) {
            if (type == "after") {
                while (previous.next && (previous = previous.next)) {
                }
                previous.next = signal;
                signal.previous = previous;
            } else {
                if (type == "before") {
                    dispatcher[type] = signal;
                    signal.next = previous;
                    previous.previous = signal;
                }
            }
        } else {
            dispatcher[type] = signal;
        }
        return signal;
    }
    function aspect(type) {
        return function (target, methodName, advice, receiveArguments) {
            var existing = target[methodName], dispatcher;
            if (!existing || existing.target != target) {
                target[methodName] = dispatcher = function () {
                    var executionId = nextId;
                    var args = arguments;
                    var before = dispatcher.before;
                    while (before) {
                        args = before.advice.apply(this, args) || args;
                        before = before.next;
                    }
                    if (dispatcher.around) {
                        var results = dispatcher.around.advice(this, args);
                    }
                    var after = dispatcher.after;
                    while (after && after.id < executionId) {
                        if (after.receiveArguments) {
                            var newResults = after.advice.apply(this, args);
                            results = newResults === undefined ? results : newResults;
                        } else {
                            results = after.advice.call(this, results, args);
                        }
                        after = after.next;
                    }
                    return results;
                };
                if (existing) {
                    dispatcher.around = {advice:function (target, args) {
                        return existing.apply(target, args);
                    }};
                }
                dispatcher.target = target;
            }
            var results = advise((dispatcher || existing), type, advice, receiveArguments);
            advice = null;
            return results;
        };
    }
    var after = aspect("after");
    var before = aspect("before");
    var around = aspect("around");
    return {before:before, around:around, after:after};
});

