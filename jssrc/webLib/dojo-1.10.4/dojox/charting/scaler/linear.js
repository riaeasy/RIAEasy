//>>built

define("dojox/charting/scaler/linear", ["dojo/_base/lang", "./common"], function (lang, common) {
    var linear = lang.getObject("dojox.charting.scaler.linear", true);
    var deltaLimit = 3, getLabel = common.getNumericLabel;
    function findString(val, text) {
        val = val.toLowerCase();
        for (var i = text.length - 1; i >= 0; --i) {
            if (val === text[i]) {
                return true;
            }
        }
        return false;
    }
    var calcTicks = function (min, max, kwArgs, majorTick, minorTick, microTick, span) {
        kwArgs = lang.delegate(kwArgs);
        if (!majorTick) {
            if (kwArgs.fixUpper == "major") {
                kwArgs.fixUpper = "minor";
            }
            if (kwArgs.fixLower == "major") {
                kwArgs.fixLower = "minor";
            }
        }
        if (!minorTick) {
            if (kwArgs.fixUpper == "minor") {
                kwArgs.fixUpper = "micro";
            }
            if (kwArgs.fixLower == "minor") {
                kwArgs.fixLower = "micro";
            }
        }
        if (!microTick) {
            if (kwArgs.fixUpper == "micro") {
                kwArgs.fixUpper = "none";
            }
            if (kwArgs.fixLower == "micro") {
                kwArgs.fixLower = "none";
            }
        }
        var lowerBound = findString(kwArgs.fixLower, ["major"]) ? Math.floor(kwArgs.min / majorTick) * majorTick : findString(kwArgs.fixLower, ["minor"]) ? Math.floor(kwArgs.min / minorTick) * minorTick : findString(kwArgs.fixLower, ["micro"]) ? Math.floor(kwArgs.min / microTick) * microTick : kwArgs.min, upperBound = findString(kwArgs.fixUpper, ["major"]) ? Math.ceil(kwArgs.max / majorTick) * majorTick : findString(kwArgs.fixUpper, ["minor"]) ? Math.ceil(kwArgs.max / minorTick) * minorTick : findString(kwArgs.fixUpper, ["micro"]) ? Math.ceil(kwArgs.max / microTick) * microTick : kwArgs.max;
        if (kwArgs.useMin) {
            min = lowerBound;
        }
        if (kwArgs.useMax) {
            max = upperBound;
        }
        var majorStart = (!majorTick || kwArgs.useMin && findString(kwArgs.fixLower, ["major"])) ? min : Math.ceil(min / majorTick) * majorTick, minorStart = (!minorTick || kwArgs.useMin && findString(kwArgs.fixLower, ["major", "minor"])) ? min : Math.ceil(min / minorTick) * minorTick, microStart = (!microTick || kwArgs.useMin && findString(kwArgs.fixLower, ["major", "minor", "micro"])) ? min : Math.ceil(min / microTick) * microTick, majorCount = !majorTick ? 0 : (kwArgs.useMax && findString(kwArgs.fixUpper, ["major"]) ? Math.round((max - majorStart) / majorTick) : Math.floor((max - majorStart) / majorTick)) + 1, minorCount = !minorTick ? 0 : (kwArgs.useMax && findString(kwArgs.fixUpper, ["major", "minor"]) ? Math.round((max - minorStart) / minorTick) : Math.floor((max - minorStart) / minorTick)) + 1, microCount = !microTick ? 0 : (kwArgs.useMax && findString(kwArgs.fixUpper, ["major", "minor", "micro"]) ? Math.round((max - microStart) / microTick) : Math.floor((max - microStart) / microTick)) + 1, minorPerMajor = minorTick ? Math.round(majorTick / minorTick) : 0, microPerMinor = microTick ? Math.round(minorTick / microTick) : 0, majorPrecision = majorTick ? Math.floor(Math.log(majorTick) / Math.LN10) : 0, minorPrecision = minorTick ? Math.floor(Math.log(minorTick) / Math.LN10) : 0, scale = span / (max - min);
        if (!isFinite(scale)) {
            scale = 1;
        }
        return {bounds:{lower:lowerBound, upper:upperBound, from:min, to:max, scale:scale, span:span}, major:{tick:majorTick, start:majorStart, count:majorCount, prec:majorPrecision}, minor:{tick:minorTick, start:minorStart, count:minorCount, prec:minorPrecision}, micro:{tick:microTick, start:microStart, count:microCount, prec:0}, minorPerMajor:minorPerMajor, microPerMinor:microPerMinor, scaler:linear};
    };
    return lang.mixin(linear, {buildScaler:function (min, max, span, kwArgs, delta, minorDelta) {
        var h = {fixUpper:"none", fixLower:"none", natural:false};
        if (kwArgs) {
            if ("fixUpper" in kwArgs) {
                h.fixUpper = String(kwArgs.fixUpper);
            }
            if ("fixLower" in kwArgs) {
                h.fixLower = String(kwArgs.fixLower);
            }
            if ("natural" in kwArgs) {
                h.natural = Boolean(kwArgs.natural);
            }
        }
        minorDelta = !minorDelta || minorDelta < deltaLimit ? deltaLimit : minorDelta;
        if ("min" in kwArgs) {
            min = kwArgs.min;
        }
        if ("max" in kwArgs) {
            max = kwArgs.max;
        }
        if (kwArgs.includeZero) {
            if (min > 0) {
                min = 0;
            }
            if (max < 0) {
                max = 0;
            }
        }
        h.min = min;
        h.useMin = true;
        h.max = max;
        h.useMax = true;
        if ("from" in kwArgs) {
            min = kwArgs.from;
            h.useMin = false;
        }
        if ("to" in kwArgs) {
            max = kwArgs.to;
            h.useMax = false;
        }
        if (max <= min) {
            return calcTicks(min, max, h, 0, 0, 0, span);
        }
        if (!delta) {
            delta = max - min;
        }
        var mag = Math.floor(Math.log(delta) / Math.LN10), major = kwArgs && ("majorTickStep" in kwArgs) ? kwArgs.majorTickStep : Math.pow(10, mag), minor = 0, micro = 0, ticks;
        if (kwArgs && ("minorTickStep" in kwArgs)) {
            minor = kwArgs.minorTickStep;
        } else {
            do {
                minor = major / 10;
                if (!h.natural || minor > 0.9) {
                    ticks = calcTicks(min, max, h, major, minor, 0, span);
                    if (ticks.bounds.scale * ticks.minor.tick > minorDelta) {
                        break;
                    }
                }
                minor = major / 5;
                if (!h.natural || minor > 0.9) {
                    ticks = calcTicks(min, max, h, major, minor, 0, span);
                    if (ticks.bounds.scale * ticks.minor.tick > minorDelta) {
                        break;
                    }
                }
                minor = major / 2;
                if (!h.natural || minor > 0.9) {
                    ticks = calcTicks(min, max, h, major, minor, 0, span);
                    if (ticks.bounds.scale * ticks.minor.tick > minorDelta) {
                        break;
                    }
                }
                return calcTicks(min, max, h, major, 0, 0, span);
            } while (false);
        }
        if (kwArgs && ("microTickStep" in kwArgs)) {
            micro = kwArgs.microTickStep;
            ticks = calcTicks(min, max, h, major, minor, micro, span);
        } else {
            do {
                micro = minor / 10;
                if (!h.natural || micro > 0.9) {
                    ticks = calcTicks(min, max, h, major, minor, micro, span);
                    if (ticks.bounds.scale * ticks.micro.tick > deltaLimit) {
                        break;
                    }
                }
                micro = minor / 5;
                if (!h.natural || micro > 0.9) {
                    ticks = calcTicks(min, max, h, major, minor, micro, span);
                    if (ticks.bounds.scale * ticks.micro.tick > deltaLimit) {
                        break;
                    }
                }
                micro = minor / 2;
                if (!h.natural || micro > 0.9) {
                    ticks = calcTicks(min, max, h, major, minor, micro, span);
                    if (ticks.bounds.scale * ticks.micro.tick > deltaLimit) {
                        break;
                    }
                }
                micro = 0;
            } while (false);
        }
        return micro ? ticks : calcTicks(min, max, h, major, minor, 0, span);
    }, buildTicks:function (scaler, kwArgs) {
        var step, next, tick, nextMajor = scaler.major.start, nextMinor = scaler.minor.start, nextMicro = scaler.micro.start;
        if (kwArgs.microTicks && scaler.micro.tick) {
            step = scaler.micro.tick, next = nextMicro;
        } else {
            if (kwArgs.minorTicks && scaler.minor.tick) {
                step = scaler.minor.tick, next = nextMinor;
            } else {
                if (scaler.major.tick) {
                    step = scaler.major.tick, next = nextMajor;
                } else {
                    return null;
                }
            }
        }
        var revScale = 1 / scaler.bounds.scale;
        if (scaler.bounds.to <= scaler.bounds.from || isNaN(revScale) || !isFinite(revScale) || step <= 0 || isNaN(step) || !isFinite(step)) {
            return null;
        }
        var majorTicks = [], minorTicks = [], microTicks = [];
        while (next <= scaler.bounds.to + revScale) {
            if (Math.abs(nextMajor - next) < step / 2) {
                tick = {value:nextMajor};
                if (kwArgs.majorLabels) {
                    tick.label = getLabel(nextMajor, scaler.major.prec, kwArgs);
                }
                majorTicks.push(tick);
                nextMajor += scaler.major.tick;
                nextMinor += scaler.minor.tick;
                nextMicro += scaler.micro.tick;
            } else {
                if (Math.abs(nextMinor - next) < step / 2) {
                    if (kwArgs.minorTicks) {
                        tick = {value:nextMinor};
                        if (kwArgs.minorLabels && (scaler.minMinorStep <= scaler.minor.tick * scaler.bounds.scale)) {
                            tick.label = getLabel(nextMinor, scaler.minor.prec, kwArgs);
                        }
                        minorTicks.push(tick);
                    }
                    nextMinor += scaler.minor.tick;
                    nextMicro += scaler.micro.tick;
                } else {
                    if (kwArgs.microTicks) {
                        microTicks.push({value:nextMicro});
                    }
                    nextMicro += scaler.micro.tick;
                }
            }
            next += step;
        }
        return {major:majorTicks, minor:minorTicks, micro:microTicks};
    }, getTransformerFromModel:function (scaler) {
        var offset = scaler.bounds.from, scale = scaler.bounds.scale;
        return function (x) {
            return (x - offset) * scale;
        };
    }, getTransformerFromPlot:function (scaler) {
        var offset = scaler.bounds.from, scale = scaler.bounds.scale;
        return function (x) {
            return x / scale + offset;
        };
    }});
});

