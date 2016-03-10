//>>built

define("dojox/date/timezone", ["dojo/_base/array", "dojo/_base/config", "dojo/_base/declare", "dojo/_base/kernel", "dojo/_base/lang", "dojo/date", "dojo/date/locale", "dojo/request", "dojo/request/handlers"], function (arrayUtil, config, declare, kernel, lang, dateUtil, localeUtil, request, handlers) {
    kernel.experimental("dojox.date.timezone");
    var _zoneFiles = ["africa", "antarctica", "asia", "australasia", "backward", "etcetera", "europe", "northamerica", "pacificnew", "southamerica"];
    var _minYear = 1835, _maxYear = 2038;
    var _loadedZones = {}, _zones = {}, _loadedRanges = {}, _rules = {};
    var loadingScheme = config.timezoneLoadingScheme || "preloadAll";
    var defaultZoneFile = config.defaultZoneFile || ((loadingScheme == "preloadAll") ? _zoneFiles : "northamerica");
    handlers.register("olson_zoneinfo", function (response) {
        var text = response.text, s = "", lines = text.split("\n"), arr = [], chunk = "", zone = null, rule = null, ret = {zones:{}, rules:{}};
        for (var i = 0; i < lines.length; i++) {
            var l = lines[i];
            if (l.match(/^\s/)) {
                l = "Zone " + zone + l;
            }
            l = l.split("#")[0];
            if (l.length > 3) {
                arr = l.split(/\s+/);
                chunk = arr.shift();
                switch (chunk) {
                  case "Zone":
                    zone = arr.shift();
                    if (arr[0]) {
                        if (!ret.zones[zone]) {
                            ret.zones[zone] = [];
                        }
                        ret.zones[zone].push(arr);
                    }
                    break;
                  case "Rule":
                    rule = arr.shift();
                    if (!ret.rules[rule]) {
                        ret.rules[rule] = [];
                    }
                    ret.rules[rule].push(arr);
                    break;
                  case "Link":
                    if (ret.zones[arr[1]]) {
                        throw new Error("Error with Link " + arr[1]);
                    }
                    ret.zones[arr[1]] = arr[0];
                    break;
                  case "Leap":
                    break;
                  default:
                    break;
                }
            }
        }
        return ret;
    });
    function loadZoneData(data) {
        data = data || {};
        _zones = lang.mixin(_zones, data.zones || {});
        _rules = lang.mixin(_rules, data.rules || {});
    }
    function loadZoneFile(fileName) {
        _loadedZones[fileName] = true;
        request.get(require.toUrl((config.timezoneFileBasePath || "dojox/date/zoneinfo") + "/" + fileName), {handleAs:"olson_zoneinfo", sync:true}).then(loadZoneData, function (e) {
            console.error("Error loading zone file:", e);
            throw e;
        });
    }
    var monthMap = {"jan":0, "feb":1, "mar":2, "apr":3, "may":4, "jun":5, "jul":6, "aug":7, "sep":8, "oct":9, "nov":10, "dec":11}, dayMap = {"sun":0, "mon":1, "tue":2, "wed":3, "thu":4, "fri":5, "sat":6}, regionMap = {"EST":"northamerica", "MST":"northamerica", "HST":"northamerica", "EST5EDT":"northamerica", "CST6CDT":"northamerica", "MST7MDT":"northamerica", "PST8PDT":"northamerica", "America":"northamerica", "Pacific":"australasia", "Atlantic":"europe", "Africa":"africa", "Indian":"africa", "Antarctica":"antarctica", "Asia":"asia", "Australia":"australasia", "Europe":"europe", "WET":"europe", "CET":"europe", "MET":"europe", "EET":"europe"}, regionExceptions = {"Pacific/Honolulu":"northamerica", "Atlantic/Bermuda":"northamerica", "Atlantic/Cape_Verde":"africa", "Atlantic/St_Helena":"africa", "Indian/Kerguelen":"antarctica", "Indian/Chagos":"asia", "Indian/Maldives":"asia", "Indian/Christmas":"australasia", "Indian/Cocos":"australasia", "America/Danmarkshavn":"europe", "America/Scoresbysund":"europe", "America/Godthab":"europe", "America/Thule":"europe", "Asia/Yekaterinburg":"europe", "Asia/Omsk":"europe", "Asia/Novosibirsk":"europe", "Asia/Krasnoyarsk":"europe", "Asia/Irkutsk":"europe", "Asia/Yakutsk":"europe", "Asia/Vladivostok":"europe", "Asia/Sakhalin":"europe", "Asia/Magadan":"europe", "Asia/Kamchatka":"europe", "Asia/Anadyr":"europe", "Africa/Ceuta":"europe", "America/Argentina/Buenos_Aires":"southamerica", "America/Argentina/Cordoba":"southamerica", "America/Argentina/Tucuman":"southamerica", "America/Argentina/La_Rioja":"southamerica", "America/Argentina/San_Juan":"southamerica", "America/Argentina/Jujuy":"southamerica", "America/Argentina/Catamarca":"southamerica", "America/Argentina/Mendoza":"southamerica", "America/Argentina/Rio_Gallegos":"southamerica", "America/Argentina/Ushuaia":"southamerica", "America/Aruba":"southamerica", "America/La_Paz":"southamerica", "America/Noronha":"southamerica", "America/Belem":"southamerica", "America/Fortaleza":"southamerica", "America/Recife":"southamerica", "America/Araguaina":"southamerica", "America/Maceio":"southamerica", "America/Bahia":"southamerica", "America/Sao_Paulo":"southamerica", "America/Campo_Grande":"southamerica", "America/Cuiaba":"southamerica", "America/Porto_Velho":"southamerica", "America/Boa_Vista":"southamerica", "America/Manaus":"southamerica", "America/Eirunepe":"southamerica", "America/Rio_Branco":"southamerica", "America/Santiago":"southamerica", "Pacific/Easter":"southamerica", "America/Bogota":"southamerica", "America/Curacao":"southamerica", "America/Guayaquil":"southamerica", "Pacific/Galapagos":"southamerica", "Atlantic/Stanley":"southamerica", "America/Cayenne":"southamerica", "America/Guyana":"southamerica", "America/Asuncion":"southamerica", "America/Lima":"southamerica", "Atlantic/South_Georgia":"southamerica", "America/Paramaribo":"southamerica", "America/Port_of_Spain":"southamerica", "America/Montevideo":"southamerica", "America/Caracas":"southamerica"}, abbrExceptions = {"US":"S", "Chatham":"S", "NZ":"S", "NT_YK":"S", "Edm":"S", "Salv":"S", "Canada":"S", "StJohns":"S", "TC":"S", "Guat":"S", "Mexico":"S", "Haiti":"S", "Barb":"S", "Belize":"S", "CR":"S", "Moncton":"S", "Swift":"S", "Hond":"S", "Thule":"S", "NZAQ":"S", "Zion":"S", "ROK":"S", "PRC":"S", "Taiwan":"S", "Ghana":"GMT", "SL":"WAT", "Chicago":"S", "Detroit":"S", "Vanc":"S", "Denver":"S", "Halifax":"S", "Cuba":"S", "Indianapolis":"S", "Starke":"S", "Marengo":"S", "Pike":"S", "Perry":"S", "Vincennes":"S", "Pulaski":"S", "Louisville":"S", "CA":"S", "Nic":"S", "Menominee":"S", "Mont":"S", "Bahamas":"S", "NYC":"S", "Regina":"S", "Resolute":"ES", "DR":"S", "Toronto":"S", "Winn":"S"};
    function invalidTZError(t) {
        throw new Error("Timezone \"" + t + "\" is either incorrect, or not loaded in the timezone registry.");
    }
    function getRegionForTimezone(tz) {
        var ret = regionExceptions[tz];
        if (!ret) {
            var reg = tz.split("/")[0];
            ret = regionMap[reg];
            if (!ret) {
                var link = _zones[tz];
                if (typeof link == "string") {
                    return getRegionForTimezone(link);
                } else {
                    if (!_loadedZones.backward) {
                        loadZoneFile("backward");
                        return getRegionForTimezone(tz);
                    } else {
                        invalidTZError(tz);
                    }
                }
            }
        }
        return ret;
    }
    function parseTimeString(str) {
        var pat = /(\d+)(?::0*(\d*))?(?::0*(\d*))?([su])?$/;
        var hms = str.match(pat);
        if (!hms) {
            return null;
        }
        hms[1] = parseInt(hms[1], 10);
        hms[2] = hms[2] ? parseInt(hms[2], 10) : 0;
        hms[3] = hms[3] ? parseInt(hms[3], 10) : 0;
        return hms;
    }
    function getUTCStamp(y, m, d, h, mn, s, off) {
        return Date.UTC(y, m, d, h, mn, s) + ((off || 0) * 60 * 1000);
    }
    function getMonthNumber(m) {
        return monthMap[m.substr(0, 3).toLowerCase()];
    }
    function getOffsetInMins(str) {
        var off = parseTimeString(str);
        if (off === null) {
            return 0;
        }
        var adj = str.indexOf("-") === 0 ? -1 : 1;
        off = adj * (((off[1] * 60 + off[2]) * 60 + off[3]) * 1000);
        return -off / 60 / 1000;
    }
    function _getRuleStart(rule, year, off) {
        var month = getMonthNumber(rule[3]), day = rule[4], time = parseTimeString(rule[5]);
        if (time[4] == "u") {
            off = 0;
        }
        var d, dtDay, incr;
        if (isNaN(day)) {
            if (day.substr(0, 4) == "last") {
                day = dayMap[day.substr(4, 3).toLowerCase()];
                d = new Date(getUTCStamp(year, month + 1, 1, time[1] - 24, time[2], time[3], off));
                dtDay = dateUtil.add(d, "minute", -off).getUTCDay();
                incr = (day > dtDay) ? (day - dtDay - 7) : (day - dtDay);
                if (incr !== 0) {
                    d = dateUtil.add(d, "hour", incr * 24);
                }
                return d;
            } else {
                day = dayMap[day.substr(0, 3).toLowerCase()];
                if (day != "undefined") {
                    if (rule[4].substr(3, 2) == ">=") {
                        d = new Date(getUTCStamp(year, month, parseInt(rule[4].substr(5), 10), time[1], time[2], time[3], off));
                        dtDay = dateUtil.add(d, "minute", -off).getUTCDay();
                        incr = (day < dtDay) ? (day - dtDay + 7) : (day - dtDay);
                        if (incr !== 0) {
                            d = dateUtil.add(d, "hour", incr * 24);
                        }
                        return d;
                    } else {
                        if (day.substr(3, 2) == "<=") {
                            d = new Date(getUTCStamp(year, month, parseInt(rule[4].substr(5), 10), time[1], time[2], time[3], off));
                            dtDay = dateUtil.add(d, "minute", -off).getUTCDay();
                            incr = (day > dtDay) ? (day - dtDay - 7) : (day - dtDay);
                            if (incr !== 0) {
                                d = dateUtil.add(d, "hour", incr * 24);
                            }
                            return d;
                        }
                    }
                }
            }
        } else {
            d = new Date(getUTCStamp(year, month, parseInt(day, 10), time[1], time[2], time[3], off));
            return d;
        }
        return null;
    }
    function _getRulesForYear(zone, year) {
        var rules = [];
        arrayUtil.forEach(_rules[zone[1]] || [], function (r) {
            for (var i = 0; i < 2; i++) {
                switch (r[i]) {
                  case "min":
                    r[i] = _minYear;
                    break;
                  case "max":
                    r[i] = _maxYear;
                    break;
                  case "only":
                    break;
                  default:
                    r[i] = parseInt(r[i], 10);
                    if (isNaN(r[i])) {
                        throw new Error("Invalid year found on rule");
                    }
                    break;
                }
            }
            if (typeof r[6] == "string") {
                r[6] = getOffsetInMins(r[6]);
            }
            if ((r[0] <= year && r[1] >= year) || (r[0] == year && r[1] == "only")) {
                rules.push({r:r, d:_getRuleStart(r, year, zone[0])});
            }
        });
        return rules;
    }
    function _loadZoneRanges(tz, zoneList) {
        var zr = _loadedRanges[tz] = [];
        for (var i = 0; i < zoneList.length; i++) {
            var z = zoneList[i];
            var r = zr[i] = [];
            var prevZone = null;
            var prevRange = null;
            var prevRules = [];
            if (typeof z[0] == "string") {
                z[0] = getOffsetInMins(z[0]);
            }
            if (i === 0) {
                r[0] = Date.UTC(_minYear, 0, 1, 0, 0, 0, 0);
            } else {
                r[0] = zr[i - 1][1];
                prevZone = zoneList[i - 1];
                prevRange = zr[i - 1];
                prevRules = prevRange[2];
            }
            var startYear = new Date(r[0]).getUTCFullYear();
            var endYear = z[3] ? parseInt(z[3], 10) : _maxYear;
            var rlz = [];
            var j;
            for (j = startYear; j <= endYear; j++) {
                rlz = rlz.concat(_getRulesForYear(z, j));
            }
            rlz.sort(function (a, b) {
                return dateUtil.compare(a.d, b.d);
            });
            var rl;
            for (j = 0, rl; (rl = rlz[j]); j++) {
                var prevRule = j > 0 ? rlz[j - 1] : null;
                if (rl.r[5].indexOf("u") < 0 && rl.r[5].indexOf("s") < 0) {
                    if (j === 0 && i > 0) {
                        if (prevRules.length) {
                            rl.d = dateUtil.add(rl.d, "minute", prevRules[prevRules.length - 1].r[6]);
                        } else {
                            if (dateUtil.compare(new Date(prevRange[1]), rl.d, "date") === 0) {
                                rl.d = new Date(prevRange[1]);
                            } else {
                                rl.d = dateUtil.add(rl.d, "minute", getOffsetInMins(prevZone[1]));
                            }
                        }
                    } else {
                        if (j > 0) {
                            rl.d = dateUtil.add(rl.d, "minute", prevRule.r[6]);
                        }
                    }
                }
            }
            r[2] = rlz;
            if (!z[3]) {
                r[1] = Date.UTC(_maxYear, 11, 31, 23, 59, 59, 999);
            } else {
                var year = parseInt(z[3], 10), month = getMonthNumber(z[4] || "Jan"), day = parseInt(z[5] || "1", 10), time = parseTimeString(z[6] || "0");
                var utcStmp = r[1] = getUTCStamp(year, month, day, time[1], time[2], time[3], ((time[4] == "u") ? 0 : z[0]));
                if (isNaN(utcStmp)) {
                    utcStmp = r[1] = _getRuleStart([0, 0, 0, z[4], z[5], z[6] || "0"], year, ((time[4] == "u") ? 0 : z[0])).getTime();
                }
                var matches = arrayUtil.filter(rlz, function (rl, idx) {
                    var o = idx > 0 ? rlz[idx - 1].r[6] * 60 * 1000 : 0;
                    return (rl.d.getTime() < utcStmp + o);
                });
                if (time[4] != "u" && time[4] != "s") {
                    if (matches.length) {
                        r[1] += matches[matches.length - 1].r[6] * 60 * 1000;
                    } else {
                        r[1] += getOffsetInMins(z[1]) * 60 * 1000;
                    }
                }
            }
        }
    }
    function getZoneInfo(dt, tz) {
        var t = tz;
        var zoneList = _zones[t];
        while (typeof zoneList == "string") {
            t = zoneList;
            zoneList = _zones[t];
        }
        if (!zoneList) {
            if (!_loadedZones.backward) {
                var parsed = loadZoneFile("backward", true);
                return getZoneInfo(dt, tz);
            }
            invalidTZError(t);
        }
        if (!_loadedRanges[tz]) {
            _loadZoneRanges(tz, zoneList);
        }
        var ranges = _loadedRanges[tz];
        var tm = dt.getTime();
        for (var i = 0, r; (r = ranges[i]); i++) {
            if (tm >= r[0] && tm < r[1]) {
                return {zone:zoneList[i], range:ranges[i], idx:i};
            }
        }
        throw new Error("No Zone found for \"" + tz + "\" on " + dt);
    }
    function getRule(dt, zoneInfo) {
        var lastMatch = -1;
        var rules = zoneInfo.range[2] || [];
        var tsp = dt.getTime();
        var zr = zoneInfo.range;
        for (var i = 0, r; (r = rules[i]); i++) {
            if (tsp >= r.d.getTime()) {
                lastMatch = i;
            }
        }
        if (lastMatch >= 0) {
            return rules[lastMatch].r;
        }
        return null;
    }
    function getAbbreviation(tz, zoneInfo, rule) {
        var res;
        var zone = zoneInfo.zone;
        var base = zone[2];
        if (base.indexOf("%s") > -1) {
            var repl;
            if (rule) {
                repl = rule[7];
                if (repl == "-") {
                    repl = "";
                }
            } else {
                if (zone[1] in abbrExceptions) {
                    repl = abbrExceptions[zone[1]];
                } else {
                    if (zoneInfo.idx > 0) {
                        var pz = _zones[tz][zoneInfo.idx - 1];
                        var pb = pz[2];
                        if (pb.indexOf("%s") < 0) {
                            if (base.replace("%s", "S") == pb) {
                                repl = "S";
                            } else {
                                repl = "";
                            }
                        } else {
                            repl = "";
                        }
                    } else {
                        repl = "";
                    }
                }
            }
            res = base.replace("%s", repl);
        } else {
            if (base.indexOf("/") > -1) {
                var bs = base.split("/");
                if (rule) {
                    res = bs[rule[6] === 0 ? 0 : 1];
                } else {
                    res = bs[0];
                }
            } else {
                res = base;
            }
        }
        return res;
    }
    lang.setObject("dojox.date.timezone", {getTzInfo:function (dt, tz) {
        if (loadingScheme == "lazyLoad") {
            var zoneFile = getRegionForTimezone(tz);
            if (!zoneFile) {
                throw new Error("Not a valid timezone ID.");
            } else {
                if (!_loadedZones[zoneFile]) {
                    loadZoneFile(zoneFile);
                }
            }
        }
        var zoneInfo = getZoneInfo(dt, tz);
        var off = zoneInfo.zone[0];
        var rule = getRule(dt, zoneInfo);
        if (rule) {
            off += rule[6];
        } else {
            if (_rules[zoneInfo.zone[1]] && zoneInfo.idx > 0) {
                off += getOffsetInMins(_zones[tz][zoneInfo.idx - 1][1]);
            } else {
                off += getOffsetInMins(zoneInfo.zone[1]);
            }
        }
        var abbr = getAbbreviation(tz, zoneInfo, rule);
        return {tzOffset:off, tzAbbr:abbr};
    }, loadZoneData:function (data) {
        loadZoneData(data);
    }, getAllZones:function () {
        var arr = [];
        for (var z in _zones) {
            arr.push(z);
        }
        arr.sort();
        return arr;
    }});
    if (typeof defaultZoneFile == "string" && defaultZoneFile) {
        defaultZoneFile = [defaultZoneFile];
    }
    if (defaultZoneFile instanceof Array) {
        arrayUtil.forEach(defaultZoneFile, loadZoneFile);
    }
    var oLocaleFmt = localeUtil.format, oGetZone = localeUtil._getZone;
    localeUtil.format = function (dateObject, options) {
        options = options || {};
        if (options.timezone && !options._tzInfo) {
            options._tzInfo = dojox.date.timezone.getTzInfo(dateObject, options.timezone);
        }
        if (options._tzInfo) {
            var offset = dateObject.getTimezoneOffset() - options._tzInfo.tzOffset;
            dateObject = new Date(dateObject.getTime() + (offset * 60 * 1000));
        }
        return oLocaleFmt.call(this, dateObject, options);
    };
    localeUtil._getZone = function (dateObject, getName, options) {
        if (options._tzInfo) {
            return getName ? options._tzInfo.tzAbbr : options._tzInfo.tzOffset;
        }
        return oGetZone.call(this, dateObject, getName, options);
    };
    return dojox.date.timezone;
});

