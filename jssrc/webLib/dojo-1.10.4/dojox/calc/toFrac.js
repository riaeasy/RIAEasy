//>>built

define("dojox/calc/toFrac", ["dojo/_base/lang", "dojox/calc/_Executor"], function (lang, calc) {
    var multiples;
    function _fracHashInit() {
        var sqrts = [5, 6, 7, 10, 11, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 33, 34, 35, 37, 38, 39, 41, 42, 43, 46, 47, 51, 53, 55, 57, 58, 59, 61, 62, 65, 66, 67, 69, 70, 71, 73, 74, 77, 78, 79, 82, 83, 85, 86, 87, 89, 91, 93, 94, 95, 97];
        multiples = {"1":1, "\u221a(2)":Math.sqrt(2), "\u221a(3)":Math.sqrt(3), "pi":Math.PI};
        for (var i in sqrts) {
            var n = sqrts[i];
            multiples["\u221a(" + n + ")"] = Math.sqrt(n);
        }
        multiples["\u221a(pi)"] = Math.sqrt(Math.PI);
    }
    function _fracLookup(number) {
        function findSimpleFraction(fraction) {
            var denom1Low = Math.floor(1 / fraction);
            var quotient = calc.approx(1 / denom1Low);
            if (quotient == fraction) {
                return {n:1, d:denom1Low};
            }
            var denom1High = denom1Low + 1;
            quotient = calc.approx(1 / denom1High);
            if (quotient == fraction) {
                return {n:1, d:denom1High};
            }
            if (denom1Low >= 50) {
                return null;
            }
            var denom2 = denom1Low + denom1High;
            quotient = calc.approx(2 / denom2);
            if (quotient == fraction) {
                return {n:2, d:denom2};
            }
            if (denom1Low >= 34) {
                return null;
            }
            var less2 = fraction < quotient;
            var denom4 = denom2 * 2 + (less2 ? 1 : -1);
            quotient = calc.approx(4 / denom4);
            if (quotient == fraction) {
                return {n:4, d:denom4};
            }
            var less4 = fraction < quotient;
            if ((less2 && !less4) || (!less2 && less4)) {
                var denom3 = (denom2 + denom4) >> 1;
                quotient = calc.approx(3 / denom3);
                if (quotient == fraction) {
                    return {n:3, d:denom3};
                }
            }
            if (denom1Low >= 20) {
                return null;
            }
            var smallestDenom = denom2 + denom1Low * 2;
            var largestDenom = smallestDenom + 2;
            for (var numerator = 5; smallestDenom <= 100; numerator++) {
                smallestDenom += denom1Low;
                largestDenom += denom1High;
                var startDenom = less2 ? ((largestDenom + smallestDenom + 1) >> 1) : smallestDenom;
                var stopDenom = less2 ? largestDenom : ((largestDenom + smallestDenom - 1) >> 1);
                startDenom = less4 ? ((startDenom + stopDenom) >> 1) : startDenom;
                stopDenom = less4 ? stopDenom : ((startDenom + stopDenom) >> 1);
                for (var thisDenom = startDenom; thisDenom <= stopDenom; thisDenom++) {
                    if (numerator & 1 == 0 && thisDenom & 1 == 0) {
                        continue;
                    }
                    quotient = calc.approx(numerator / thisDenom);
                    if (quotient == fraction) {
                        return {n:numerator, d:thisDenom};
                    }
                    if (quotient < fraction) {
                        break;
                    }
                }
            }
            return null;
        }
        number = Math.abs(number);
        for (var mt in multiples) {
            var multiple = multiples[mt];
            var simpleFraction = number / multiple;
            var wholeNumber = Math.floor(simpleFraction);
            simpleFraction = calc.approx(simpleFraction - wholeNumber);
            if (simpleFraction == 0) {
                return {mt:mt, m:multiple, n:wholeNumber, d:1};
            } else {
                var a = findSimpleFraction(simpleFraction);
                if (!a) {
                    continue;
                }
                return {mt:mt, m:multiple, n:(wholeNumber * a.d + a.n), d:a.d};
            }
        }
        return null;
    }
    _fracHashInit();
    return lang.mixin(calc, {toFrac:function (number) {
        var f = _fracLookup(number);
        return f ? ((number < 0 ? "-" : "") + (f.m == 1 ? "" : (f.n == 1 ? "" : (f.n + "*"))) + (f.m == 1 ? f.n : f.mt) + ((f.d == 1 ? "" : "/" + f.d))) : number;
    }, pow:function (base, exponent) {
        function isInt(n) {
            return Math.floor(n) == n;
        }
        if (base > 0 || isInt(exponent)) {
            return Math.pow(base, exponent);
        } else {
            var f = _fracLookup(exponent);
            if (base >= 0) {
                return (f && f.m == 1) ? Math.pow(Math.pow(base, 1 / f.d), exponent < 0 ? -f.n : f.n) : Math.pow(base, exponent);
            } else {
                return (f && f.d & 1) ? Math.pow(Math.pow(-Math.pow(-base, 1 / f.d), exponent < 0 ? -f.n : f.n), f.m) : NaN;
            }
        }
    }});
});

