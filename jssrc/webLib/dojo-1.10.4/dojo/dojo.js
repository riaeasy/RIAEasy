//>>built

(function (userConfig, defaultConfig) {
    var noop = function () {
    }, isEmpty = function (it) {
        for (var p in it) {
            return 0;
        }
        return 1;
    }, toString = {}.toString, isFunction = function (it) {
        return toString.call(it) == "[object Function]";
    }, isString = function (it) {
        return toString.call(it) == "[object String]";
    }, isArray = function (it) {
        return toString.call(it) == "[object Array]";
    }, forEach = function (vector, callback) {
        if (vector) {
            for (var i = 0; i < vector.length; ) {
                callback(vector[i++]);
            }
        }
    }, mix = function (dest, src) {
        for (var p in src) {
            dest[p] = src[p];
        }
        return dest;
    }, makeError = function (error, info) {
        return mix(new Error(error), {src:"dojoLoader", info:info});
    }, uidSeed = 1, uid = function () {
        return "_" + uidSeed++;
    }, req = function (config, dependencies, callback) {
        return contextRequire(config, dependencies, callback, 0, req);
    }, global = this, doc = global.document, element = doc && doc.createElement("DiV"), has = req.has = function (name) {
        return isFunction(hasCache[name]) ? (hasCache[name] = hasCache[name](global, doc, element)) : hasCache[name];
    }, hasCache = has.cache = defaultConfig.hasCache;
    has.add = function (name, test, now, force) {
        (hasCache[name] === undefined || force) && (hasCache[name] = test);
        return now && has(name);
    };
    0 && has.add("host-node", userConfig.has && "host-node" in userConfig.has ? userConfig.has["host-node"] : (typeof process == "object" && process.versions && process.versions.node && process.versions.v8));
    if (0) {
        require("./_base/configNode.js").config(defaultConfig);
        defaultConfig.loaderPatch.nodeRequire = require;
    }
    0 && has.add("host-rhino", userConfig.has && "host-rhino" in userConfig.has ? userConfig.has["host-rhino"] : (typeof load == "function" && (typeof Packages == "function" || typeof Packages == "object")));
    if (0) {
        for (var baseUrl = userConfig.baseUrl || ".", arg, rhinoArgs = this.arguments, i = 0; i < rhinoArgs.length; ) {
            arg = (rhinoArgs[i++] + "").split("=");
            if (arg[0] == "baseUrl") {
                baseUrl = arg[1];
                break;
            }
        }
        load(baseUrl + "/_base/configRhino.js");
        rhinoDojoConfig(defaultConfig, baseUrl, rhinoArgs);
    }
    has.add("host-webworker", ((typeof WorkerGlobalScope !== "undefined") && (self instanceof WorkerGlobalScope)));
    if (has("host-webworker")) {
        mix(defaultConfig.hasCache, {"host-browser":0, "dom":0, "dojo-dom-ready-api":0, "dojo-sniff":0, "dojo-inject-api":1, "host-webworker":1});
        defaultConfig.loaderPatch = {injectUrl:function (url, callback) {
            try {
                importScripts(url);
                callback();
            }
            catch (e) {
                console.info("failed to load resource (" + url + ")");
                console.error(e);
            }
        }};
    }
    for (var p in userConfig.has) {
        has.add(p, userConfig.has[p], 0, 1);
    }
    var requested = 1, arrived = 2, nonmodule = 3, executing = 4, executed = 5;
    if (1) {
        requested = "requested";
        arrived = "arrived";
        nonmodule = "not-a-module";
        executing = "executing";
        executed = "executed";
    }
    var legacyMode = 0, sync = "sync", xd = "xd", syncExecStack = [], dojoRequirePlugin = 0, checkDojoRequirePlugin = noop, transformToAmd = noop, getXhr;
    if (0) {
        req.isXdUrl = noop;
        req.initSyncLoader = function (dojoRequirePlugin_, checkDojoRequirePlugin_, transformToAmd_) {
            if (!dojoRequirePlugin) {
                dojoRequirePlugin = dojoRequirePlugin_;
                checkDojoRequirePlugin = checkDojoRequirePlugin_;
                transformToAmd = transformToAmd_;
            }
            return {sync:sync, requested:requested, arrived:arrived, nonmodule:nonmodule, executing:executing, executed:executed, syncExecStack:syncExecStack, modules:modules, execQ:execQ, getModule:getModule, injectModule:injectModule, setArrived:setArrived, signal:signal, finishExec:finishExec, execModule:execModule, dojoRequirePlugin:dojoRequirePlugin, getLegacyMode:function () {
                return legacyMode;
            }, guardCheckComplete:guardCheckComplete};
        };
        if (1 || has("host-webworker")) {
            var locationProtocol = location.protocol, locationHost = location.host;
            req.isXdUrl = function (url) {
                if (/^\./.test(url)) {
                    return false;
                }
                if (/^\/\//.test(url)) {
                    return true;
                }
                var match = url.match(/^([^\/\:]+\:)\/+([^\/]+)/);
                return match && (match[1] != locationProtocol || (locationHost && match[2] != locationHost));
            };
            1 || has.add("dojo-xhr-factory", 1);
            has.add("dojo-force-activex-xhr", 1 && !doc.addEventListener && window.location.protocol == "file:");
            has.add("native-xhr", typeof XMLHttpRequest != "undefined");
            if (has("native-xhr") && !has("dojo-force-activex-xhr")) {
                getXhr = function () {
                    return new XMLHttpRequest();
                };
            } else {
                for (var XMLHTTP_PROGIDS = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"], progid, i = 0; i < 3; ) {
                    try {
                        progid = XMLHTTP_PROGIDS[i++];
                        if (new ActiveXObject(progid)) {
                            break;
                        }
                    }
                    catch (e) {
                    }
                }
                getXhr = function () {
                    return new ActiveXObject(progid);
                };
            }
            req.getXhr = getXhr;
            has.add("dojo-gettext-api", 1);
            req.getText = function (url, async, onLoad) {
                var xhr = getXhr();
                xhr.open("GET", fixupUrl(url), false);
                xhr.send(null);
                if (xhr.status == 200 || (!location.host && !xhr.status)) {
                    if (onLoad) {
                        onLoad(xhr.responseText, async);
                    }
                } else {
                    throw makeError("xhrFailed", xhr.status);
                }
                return xhr.responseText;
            };
        }
    } else {
        req.async = 1;
    }
    var eval_ = new Function("return eval(arguments[0]);");
    req.eval = function (text, hint) {
        return eval_(text + "\r\n//# sourceURL=" + hint);
    };
    var listenerQueues = {}, error = "error", signal = req.signal = function (type, args) {
        var queue = listenerQueues[type];
        forEach(queue && queue.slice(0), function (listener) {
            listener.apply(null, isArray(args) ? args : [args]);
        });
    }, on = req.on = function (type, listener) {
        var queue = listenerQueues[type] || (listenerQueues[type] = []);
        queue.push(listener);
        return {remove:function () {
            for (var i = 0; i < queue.length; i++) {
                if (queue[i] === listener) {
                    queue.splice(i, 1);
                    return;
                }
            }
        }};
    };
    var aliases = [], paths = {}, pathsMapProg = [], packs = {}, map = req.map = {}, mapProgs = [], modules = {}, cacheBust = "", cache = {}, urlKeyPrefix = "url:", pendingCacheInsert = {}, dojoSniffConfig = {}, insertPointSibling = 0;
    if (1) {
        var consumePendingCacheInsert = function (referenceModule) {
            var p, item, match, now, m;
            for (p in pendingCacheInsert) {
                item = pendingCacheInsert[p];
                match = p.match(/^url\:(.+)/);
                if (match) {
                    cache[urlKeyPrefix + toUrl(match[1], referenceModule)] = item;
                } else {
                    if (p == "*now") {
                        now = item;
                    } else {
                        if (p != "*noref") {
                            m = getModuleInfo(p, referenceModule, true);
                            cache[m.mid] = cache[urlKeyPrefix + m.url] = item;
                        }
                    }
                }
            }
            if (now) {
                now(createRequire(referenceModule));
            }
            pendingCacheInsert = {};
        }, escapeString = function (s) {
            return s.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function (c) {
                return "\\" + c;
            });
        }, computeMapProg = function (map, dest) {
            dest.splice(0, dest.length);
            for (var p in map) {
                dest.push([p, map[p], new RegExp("^" + escapeString(p) + "(/|$)"), p.length]);
            }
            dest.sort(function (lhs, rhs) {
                return rhs[3] - lhs[3];
            });
            return dest;
        }, computeAliases = function (config, dest) {
            forEach(config, function (pair) {
                dest.push([isString(pair[0]) ? new RegExp("^" + escapeString(pair[0]) + "$") : pair[0], pair[1]]);
            });
        }, fixupPackageInfo = function (packageInfo) {
            var name = packageInfo.name;
            if (!name) {
                name = packageInfo;
                packageInfo = {name:name};
            }
            packageInfo = mix({main:"main"}, packageInfo);
            packageInfo.location = packageInfo.location ? packageInfo.location : name;
            if (packageInfo.packageMap) {
                map[name] = packageInfo.packageMap;
            }
            if (!packageInfo.main.indexOf("./")) {
                packageInfo.main = packageInfo.main.substring(2);
            }
            packs[name] = packageInfo;
        }, delayedModuleConfig = [], config = function (config, booting, referenceModule) {
            for (var p in config) {
                if (p == "waitSeconds") {
                    req.waitms = (config[p] || 0) * 1000;
                }
                if (p == "cacheBust") {
                    cacheBust = config[p] ? (isString(config[p]) ? config[p] : (new Date()).getTime() + "") : "";
                }
                if (p == "baseUrl" || p == "combo") {
                    req[p] = config[p];
                }
                if (0 && p == "async") {
                    var mode = config[p];
                    req.legacyMode = legacyMode = (isString(mode) && /sync|legacyAsync/.test(mode) ? mode : (!mode ? sync : false));
                    req.async = !legacyMode;
                }
                if (config[p] !== hasCache) {
                    req.rawConfig[p] = config[p];
                    p != "has" && has.add("config-" + p, config[p], 0, booting);
                }
            }
            if (!req.baseUrl) {
                req.baseUrl = "./";
            }
            if (!/\/$/.test(req.baseUrl)) {
                req.baseUrl += "/";
            }
            for (p in config.has) {
                has.add(p, config.has[p], 0, booting);
            }
            forEach(config.packages, fixupPackageInfo);
            for (var baseUrl in config.packagePaths) {
                forEach(config.packagePaths[baseUrl], function (packageInfo) {
                    var location = baseUrl + "/" + packageInfo;
                    if (isString(packageInfo)) {
                        packageInfo = {name:packageInfo};
                    }
                    packageInfo.location = location;
                    fixupPackageInfo(packageInfo);
                });
            }
            computeMapProg(mix(map, config.map), mapProgs);
            forEach(mapProgs, function (item) {
                item[1] = computeMapProg(item[1], []);
                if (item[0] == "*") {
                    mapProgs.star = item;
                }
            });
            computeMapProg(mix(paths, config.paths), pathsMapProg);
            computeAliases(config.aliases, aliases);
            if (booting) {
                delayedModuleConfig.push({config:config.config});
            } else {
                for (p in config.config) {
                    var module = getModule(p, referenceModule);
                    module.config = mix(module.config || {}, config.config[p]);
                }
            }
            if (config.cache) {
                consumePendingCacheInsert();
                pendingCacheInsert = config.cache;
                if (config.cache["*noref"]) {
                    consumePendingCacheInsert();
                }
            }
            signal("config", [config, req.rawConfig]);
        };
        if (has("dojo-cdn") || 1) {
            var scripts = doc.getElementsByTagName("script"), i = 0, script, dojoDir, src, match;
            while (i < scripts.length) {
                script = scripts[i++];
                if ((src = script.getAttribute("src")) && (match = src.match(/(((.*)\/)|^)dojo\.js(\W|$)/i))) {
                    dojoDir = match[3] || "";
                    defaultConfig.baseUrl = defaultConfig.baseUrl || dojoDir;
                    insertPointSibling = script;
                }
                if ((src = (script.getAttribute("data-dojo-config") || script.getAttribute("djConfig")))) {
                    dojoSniffConfig = req.eval("({ " + src + " })", "data-dojo-config");
                    insertPointSibling = script;
                }
                if (1) {
                    if ((src = script.getAttribute("data-main"))) {
                        dojoSniffConfig.deps = dojoSniffConfig.deps || [src];
                    }
                }
            }
        }
        if (1) {
            try {
                if (window.parent != window && window.parent.require) {
                    var doh = window.parent.require("doh");
                    doh && mix(dojoSniffConfig, doh.testConfig);
                }
            }
            catch (e) {
            }
        }
        req.rawConfig = {};
        config(defaultConfig, 1);
        if (has("dojo-cdn")) {
            packs.dojo.location = dojoDir;
            if (dojoDir) {
                dojoDir += "/";
            }
            packs.dijit.location = dojoDir + "../dijit/";
            packs.dojox.location = dojoDir + "../dojox/";
        }
        config(userConfig, 1);
        config(dojoSniffConfig, 1);
    } else {
        paths = defaultConfig.paths;
        pathsMapProg = defaultConfig.pathsMapProg;
        packs = defaultConfig.packs;
        aliases = defaultConfig.aliases;
        mapProgs = defaultConfig.mapProgs;
        modules = defaultConfig.modules;
        cache = defaultConfig.cache;
        cacheBust = defaultConfig.cacheBust;
        req.rawConfig = defaultConfig;
    }
    if (0) {
        req.combo = req.combo || {add:noop};
        var comboPending = 0, combosPending = [], comboPendingTimer = null;
    }
    var injectDependencies = function (module) {
        guardCheckComplete(function () {
            forEach(module.deps, injectModule);
            if (0 && comboPending && !comboPendingTimer) {
                comboPendingTimer = setTimeout(function () {
                    comboPending = 0;
                    comboPendingTimer = null;
                    req.combo.done(function (mids, url) {
                        var onLoadCallback = function () {
                            runDefQ(0, mids);
                            checkComplete();
                        };
                        combosPending.push(mids);
                        injectingModule = mids;
                        req.injectUrl(url, onLoadCallback, mids);
                        injectingModule = 0;
                    }, req);
                }, 0);
            }
        });
    }, contextRequire = function (a1, a2, a3, referenceModule, contextRequire) {
        var module, syntheticMid;
        if (isString(a1)) {
            module = getModule(a1, referenceModule, true);
            if (module && module.executed) {
                return module.result;
            }
            throw makeError("undefinedModule", a1);
        }
        if (!isArray(a1)) {
            config(a1, 0, referenceModule);
            a1 = a2;
            a2 = a3;
        }
        if (isArray(a1)) {
            if (!a1.length) {
                a2 && a2();
            } else {
                syntheticMid = "require*" + uid();
                for (var mid, deps = [], i = 0; i < a1.length; ) {
                    mid = a1[i++];
                    deps.push(getModule(mid, referenceModule));
                }
                module = mix(makeModuleInfo("", syntheticMid, 0, ""), {injected:arrived, deps:deps, def:a2 || noop, require:referenceModule ? referenceModule.require : req, gc:1});
                modules[module.mid] = module;
                injectDependencies(module);
                var strict = checkCompleteGuard && legacyMode != sync;
                guardCheckComplete(function () {
                    execModule(module, strict);
                });
                if (!module.executed) {
                    execQ.push(module);
                }
                checkComplete();
            }
        }
        return contextRequire;
    }, createRequire = function (module) {
        if (!module) {
            return req;
        }
        var result = module.require;
        if (!result) {
            result = function (a1, a2, a3) {
                return contextRequire(a1, a2, a3, module, result);
            };
            module.require = mix(result, req);
            result.module = module;
            result.toUrl = function (name) {
                return toUrl(name, module);
            };
            result.toAbsMid = function (mid) {
                return toAbsMid(mid, module);
            };
            if (1) {
                result.undef = function (mid) {
                    req.undef(mid, module);
                };
            }
            if (0) {
                result.syncLoadNls = function (mid) {
                    var nlsModuleInfo = getModuleInfo(mid, module), nlsModule = modules[nlsModuleInfo.mid];
                    if (!nlsModule || !nlsModule.executed) {
                        cached = cache[nlsModuleInfo.mid] || cache[urlKeyPrefix + nlsModuleInfo.url];
                        if (cached) {
                            evalModuleText(cached);
                            nlsModule = modules[nlsModuleInfo.mid];
                        }
                    }
                    return nlsModule && nlsModule.executed && nlsModule.result;
                };
            }
        }
        return result;
    }, execQ = [], defQ = [], waiting = {}, setRequested = function (module) {
        module.injected = requested;
        waiting[module.mid] = 1;
        if (module.url) {
            waiting[module.url] = module.pack || 1;
        }
        startTimer();
    }, setArrived = function (module) {
        module.injected = arrived;
        delete waiting[module.mid];
        if (module.url) {
            delete waiting[module.url];
        }
        if (isEmpty(waiting)) {
            clearTimer();
            0 && legacyMode == xd && (legacyMode = sync);
        }
    }, execComplete = req.idle = function () {
        return !defQ.length && isEmpty(waiting) && !execQ.length && !checkCompleteGuard;
    }, runMapProg = function (targetMid, map) {
        if (map) {
            for (var i = 0; i < map.length; i++) {
                if (map[i][2].test(targetMid)) {
                    return map[i];
                }
            }
        }
        return 0;
    }, compactPath = function (path) {
        var result = [], segment, lastSegment;
        path = path.replace(/\\/g, "/").split("/");
        while (path.length) {
            segment = path.shift();
            if (segment == ".." && result.length && lastSegment != "..") {
                result.pop();
                lastSegment = result[result.length - 1];
            } else {
                if (segment != ".") {
                    result.push(lastSegment = segment);
                }
            }
        }
        return result.join("/");
    }, makeModuleInfo = function (pid, mid, pack, url) {
        if (0) {
            var xd = req.isXdUrl(url);
            return {pid:pid, mid:mid, pack:pack, url:url, executed:0, def:0, isXd:xd, isAmd:!!(xd || (packs[pid] && packs[pid].isAmd))};
        } else {
            return {pid:pid, mid:mid, pack:pack, url:url, executed:0, def:0};
        }
    }, getModuleInfo_ = function (mid, referenceModule, packs, modules, baseUrl, mapProgs, pathsMapProg, aliases, alwaysCreate) {
        var pid, pack, midInPackage, mapItem, url, result, isRelative, requestedMid;
        requestedMid = mid;
        isRelative = /^\./.test(mid);
        if (/(^\/)|(\:)|(\.js$)/.test(mid) || (isRelative && !referenceModule)) {
            return makeModuleInfo(0, mid, 0, mid);
        } else {
            mid = compactPath(isRelative ? (referenceModule.mid + "/../" + mid) : mid);
            if (/^\./.test(mid)) {
                throw makeError("irrationalPath", mid);
            }
            if (referenceModule) {
                mapItem = runMapProg(referenceModule.mid, mapProgs);
            }
            mapItem = mapItem || mapProgs.star;
            mapItem = mapItem && runMapProg(mid, mapItem[1]);
            if (mapItem) {
                mid = mapItem[1] + mid.substring(mapItem[3]);
            }
            match = mid.match(/^([^\/]+)(\/(.+))?$/);
            pid = match ? match[1] : "";
            if ((pack = packs[pid])) {
                mid = pid + "/" + (midInPackage = (match[3] || pack.main));
            } else {
                pid = "";
            }
            var candidateLength = 0, candidate = 0;
            forEach(aliases, function (pair) {
                var match = mid.match(pair[0]);
                if (match && match.length > candidateLength) {
                    candidate = isFunction(pair[1]) ? mid.replace(pair[0], pair[1]) : pair[1];
                }
            });
            if (candidate) {
                return getModuleInfo_(candidate, 0, packs, modules, baseUrl, mapProgs, pathsMapProg, aliases, alwaysCreate);
            }
            result = modules[mid];
            if (result) {
                return alwaysCreate ? makeModuleInfo(result.pid, result.mid, result.pack, result.url) : modules[mid];
            }
        }
        mapItem = runMapProg(mid, pathsMapProg);
        if (mapItem) {
            url = mapItem[1] + mid.substring(mapItem[3]);
        } else {
            if (pid) {
                url = pack.location + "/" + midInPackage;
            } else {
                if (1) {
                    url = "../" + mid;
                } else {
                    url = mid;
                }
            }
        }
        if (!(/(^\/)|(\:)/.test(url))) {
            url = baseUrl + url;
        }
        url += ".js";
        return makeModuleInfo(pid, mid, pack, compactPath(url));
    }, getModuleInfo = function (mid, referenceModule, fromPendingCache) {
        return getModuleInfo_(mid, referenceModule, packs, modules, req.baseUrl, fromPendingCache ? [] : mapProgs, fromPendingCache ? [] : pathsMapProg, fromPendingCache ? [] : aliases);
    }, resolvePluginResourceId = function (plugin, prid, referenceModule) {
        return plugin.normalize ? plugin.normalize(prid, function (mid) {
            return toAbsMid(mid, referenceModule);
        }) : toAbsMid(prid, referenceModule);
    }, dynamicPluginUidGenerator = 0, getModule = function (mid, referenceModule, immediate) {
        var match, plugin, prid, result;
        match = mid.match(/^(.+?)\!(.*)$/);
        if (match) {
            plugin = getModule(match[1], referenceModule, immediate);
            if (0 && legacyMode == sync && !plugin.executed) {
                injectModule(plugin);
                if (plugin.injected === arrived && !plugin.executed) {
                    guardCheckComplete(function () {
                        execModule(plugin);
                    });
                }
                if (plugin.executed) {
                    promoteModuleToPlugin(plugin);
                } else {
                    execQ.unshift(plugin);
                }
            }
            if (plugin.executed === executed && !plugin.load) {
                promoteModuleToPlugin(plugin);
            }
            if (plugin.load) {
                prid = resolvePluginResourceId(plugin, match[2], referenceModule);
                mid = (plugin.mid + "!" + (plugin.dynamic ? ++dynamicPluginUidGenerator + "!" : "") + prid);
            } else {
                prid = match[2];
                mid = plugin.mid + "!" + (++dynamicPluginUidGenerator) + "!waitingForPlugin";
            }
            result = {plugin:plugin, mid:mid, req:createRequire(referenceModule), prid:prid};
        } else {
            result = getModuleInfo(mid, referenceModule);
        }
        return modules[result.mid] || (!immediate && (modules[result.mid] = result));
    }, toAbsMid = req.toAbsMid = function (mid, referenceModule) {
        return getModuleInfo(mid, referenceModule).mid;
    }, toUrl = req.toUrl = function (name, referenceModule) {
        var moduleInfo = getModuleInfo(name + "/x", referenceModule), url = moduleInfo.url;
        return fixupUrl(moduleInfo.pid === 0 ? name : url.substring(0, url.length - 5));
    }, nonModuleProps = {injected:arrived, executed:executed, def:nonmodule, result:nonmodule}, makeCjs = function (mid) {
        return modules[mid] = mix({mid:mid}, nonModuleProps);
    }, cjsRequireModule = makeCjs("require"), cjsExportsModule = makeCjs("exports"), cjsModuleModule = makeCjs("module"), runFactory = function (module, args) {
        req.trace("loader-run-factory", [module.mid]);
        var factory = module.def, result;
        0 && syncExecStack.unshift(module);
        if (1) {
            try {
                result = isFunction(factory) ? factory.apply(null, args) : factory;
            }
            catch (e) {
                signal(error, module.result = makeError("factoryThrew", [module, e]));
            }
        } else {
            result = isFunction(factory) ? factory.apply(null, args) : factory;
        }
        module.result = result === undefined && module.cjs ? module.cjs.exports : result;
        0 && syncExecStack.shift(module);
    }, abortExec = {}, defOrder = 0, promoteModuleToPlugin = function (pluginModule) {
        var plugin = pluginModule.result;
        pluginModule.dynamic = plugin.dynamic;
        pluginModule.normalize = plugin.normalize;
        pluginModule.load = plugin.load;
        return pluginModule;
    }, resolvePluginLoadQ = function (plugin) {
        var map = {};
        forEach(plugin.loadQ, function (pseudoPluginResource) {
            var prid = resolvePluginResourceId(plugin, pseudoPluginResource.prid, pseudoPluginResource.req.module), mid = plugin.dynamic ? pseudoPluginResource.mid.replace(/waitingForPlugin$/, prid) : (plugin.mid + "!" + prid), pluginResource = mix(mix({}, pseudoPluginResource), {mid:mid, prid:prid, injected:0});
            if (!modules[mid]) {
                injectPlugin(modules[mid] = pluginResource);
            }
            map[pseudoPluginResource.mid] = modules[mid];
            setArrived(pseudoPluginResource);
            delete modules[pseudoPluginResource.mid];
        });
        plugin.loadQ = 0;
        var substituteModules = function (module) {
            for (var replacement, deps = module.deps || [], i = 0; i < deps.length; i++) {
                replacement = map[deps[i].mid];
                if (replacement) {
                    deps[i] = replacement;
                }
            }
        };
        for (var p in modules) {
            substituteModules(modules[p]);
        }
        forEach(execQ, substituteModules);
    }, finishExec = function (module) {
        req.trace("loader-finish-exec", [module.mid]);
        module.executed = executed;
        module.defOrder = defOrder++;
        0 && forEach(module.provides, function (cb) {
            cb();
        });
        if (module.loadQ) {
            promoteModuleToPlugin(module);
            resolvePluginLoadQ(module);
        }
        for (i = 0; i < execQ.length; ) {
            if (execQ[i] === module) {
                execQ.splice(i, 1);
            } else {
                i++;
            }
        }
        if (/^require\*/.test(module.mid)) {
            delete modules[module.mid];
        }
    }, circleTrace = [], execModule = function (module, strict) {
        if (module.executed === executing) {
            req.trace("loader-circular-dependency", [circleTrace.concat(module.mid).join("->")]);
            return (!module.def || strict) ? abortExec : (module.cjs && module.cjs.exports);
        }
        if (!module.executed) {
            if (!module.def) {
                return abortExec;
            }
            var mid = module.mid, deps = module.deps || [], arg, argResult, args = [], i = 0;
            if (1) {
                circleTrace.push(mid);
                req.trace("loader-exec-module", ["exec", circleTrace.length, mid]);
            }
            module.executed = executing;
            while ((arg = deps[i++])) {
                argResult = ((arg === cjsRequireModule) ? createRequire(module) : ((arg === cjsExportsModule) ? module.cjs.exports : ((arg === cjsModuleModule) ? module.cjs : execModule(arg, strict))));
                if (argResult === abortExec) {
                    module.executed = 0;
                    req.trace("loader-exec-module", ["abort", mid]);
                    1 && circleTrace.pop();
                    return abortExec;
                }
                args.push(argResult);
            }
            runFactory(module, args);
            finishExec(module);
            1 && circleTrace.pop();
        }
        return module.result;
    }, checkCompleteGuard = 0, guardCheckComplete = function (proc) {
        try {
            checkCompleteGuard++;
            proc();
        }
        finally {
            checkCompleteGuard--;
        }
        if (execComplete()) {
            signal("idle", []);
        }
    }, checkComplete = function () {
        if (checkCompleteGuard) {
            return;
        }
        guardCheckComplete(function () {
            checkDojoRequirePlugin();
            for (var currentDefOrder, module, i = 0; i < execQ.length; ) {
                currentDefOrder = defOrder;
                module = execQ[i];
                execModule(module);
                if (currentDefOrder != defOrder) {
                    checkDojoRequirePlugin();
                    i = 0;
                } else {
                    i++;
                }
            }
        });
    };
    if (1) {
        req.undef = function (moduleId, referenceModule) {
            var module = getModule(moduleId, referenceModule);
            setArrived(module);
            mix(module, {def:0, executed:0, injected:0, node:0});
        };
    }
    if (1) {
        if (has("dojo-loader-eval-hint-url") === undefined) {
            has.add("dojo-loader-eval-hint-url", 1);
        }
        var fixupUrl = typeof userConfig.fixupUrl == "function" ? userConfig.fixupUrl : function (url) {
            url += "";
            return url + (cacheBust ? ((/\?/.test(url) ? "&" : "?") + cacheBust) : "");
        }, injectPlugin = function (module) {
            var plugin = module.plugin;
            if (plugin.executed === executed && !plugin.load) {
                promoteModuleToPlugin(plugin);
            }
            var onLoad = function (def) {
                module.result = def;
                setArrived(module);
                finishExec(module);
                checkComplete();
            };
            if (plugin.load) {
                plugin.load(module.prid, module.req, onLoad);
            } else {
                if (plugin.loadQ) {
                    plugin.loadQ.push(module);
                } else {
                    plugin.loadQ = [module];
                    execQ.unshift(plugin);
                    injectModule(plugin);
                }
            }
        }, cached = 0, injectingModule = 0, injectingCachedModule = 0, evalModuleText = function (text, module) {
            if (has("config-stripStrict")) {
                text = text.replace(/"use strict"/g, "");
            }
            injectingCachedModule = 1;
            if (1) {
                try {
                    if (text === cached) {
                        cached.call(null);
                    } else {
                        req.eval(text, has("dojo-loader-eval-hint-url") ? module.url : module.mid);
                    }
                }
                catch (e) {
                    signal(error, makeError("evalModuleThrew", module));
                }
            } else {
                if (text === cached) {
                    cached.call(null);
                } else {
                    req.eval(text, has("dojo-loader-eval-hint-url") ? module.url : module.mid);
                }
            }
            injectingCachedModule = 0;
        }, injectModule = function (module) {
            var mid = module.mid, url = module.url;
            if (module.executed || module.injected || waiting[mid] || (module.url && ((module.pack && waiting[module.url] === module.pack) || waiting[module.url] == 1))) {
                return;
            }
            setRequested(module);
            if (0) {
                var viaCombo = 0;
                if (module.plugin && module.plugin.isCombo) {
                    req.combo.add(module.plugin.mid, module.prid, 0, req);
                    viaCombo = 1;
                } else {
                    if (!module.plugin) {
                        viaCombo = req.combo.add(0, module.mid, module.url, req);
                    }
                }
                if (viaCombo) {
                    comboPending = 1;
                    return;
                }
            }
            if (module.plugin) {
                injectPlugin(module);
                return;
            }
            var onLoadCallback = function () {
                runDefQ(module);
                if (module.injected !== arrived) {
                    if (has("dojo-enforceDefine")) {
                        signal(error, makeError("noDefine", module));
                        return;
                    }
                    setArrived(module);
                    mix(module, nonModuleProps);
                    req.trace("loader-define-nonmodule", [module.url]);
                }
                if (0 && legacyMode) {
                    !syncExecStack.length && checkComplete();
                } else {
                    checkComplete();
                }
            };
            cached = cache[mid] || cache[urlKeyPrefix + module.url];
            if (cached) {
                req.trace("loader-inject", ["cache", module.mid, url]);
                evalModuleText(cached, module);
                onLoadCallback();
                return;
            }
            if (0 && legacyMode) {
                if (module.isXd) {
                    legacyMode == sync && (legacyMode = xd);
                } else {
                    if (module.isAmd && legacyMode != sync) {
                    } else {
                        var xhrCallback = function (text) {
                            if (legacyMode == sync) {
                                syncExecStack.unshift(module);
                                evalModuleText(text, module);
                                syncExecStack.shift();
                                runDefQ(module);
                                if (!module.cjs) {
                                    setArrived(module);
                                    finishExec(module);
                                }
                                if (module.finish) {
                                    var finishMid = mid + "*finish", finish = module.finish;
                                    delete module.finish;
                                    def(finishMid, ["dojo", ("dojo/require!" + finish.join(",")).replace(/\./g, "/")], function (dojo) {
                                        forEach(finish, function (mid) {
                                            dojo.require(mid);
                                        });
                                    });
                                    execQ.unshift(getModule(finishMid));
                                }
                                onLoadCallback();
                            } else {
                                text = transformToAmd(module, text);
                                if (text) {
                                    evalModuleText(text, module);
                                    onLoadCallback();
                                } else {
                                    injectingModule = module;
                                    req.injectUrl(fixupUrl(url), onLoadCallback, module);
                                    injectingModule = 0;
                                }
                            }
                        };
                        req.trace("loader-inject", ["xhr", module.mid, url, legacyMode != sync]);
                        if (1) {
                            try {
                                req.getText(url, legacyMode != sync, xhrCallback);
                            }
                            catch (e) {
                                signal(error, makeError("xhrInjectFailed", [module, e]));
                            }
                        } else {
                            req.getText(url, legacyMode != sync, xhrCallback);
                        }
                        return;
                    }
                }
            }
            req.trace("loader-inject", ["script", module.mid, url]);
            injectingModule = module;
            req.injectUrl(fixupUrl(url), onLoadCallback, module);
            injectingModule = 0;
        }, defineModule = function (module, deps, def) {
            req.trace("loader-define-module", [module.mid, deps]);
            if (0 && module.plugin && module.plugin.isCombo) {
                module.result = isFunction(def) ? def() : def;
                setArrived(module);
                finishExec(module);
                return module;
            }
            var mid = module.mid;
            if (module.injected === arrived) {
                signal(error, makeError("multipleDefine", module));
                return module;
            }
            mix(module, {deps:deps, def:def, cjs:{id:module.mid, uri:module.url, exports:(module.result = {}), setExports:function (exports) {
                module.cjs.exports = exports;
            }, config:function () {
                return module.config;
            }}});
            for (var i = 0; deps[i]; i++) {
                deps[i] = getModule(deps[i], module);
            }
            if (0 && legacyMode && !waiting[mid]) {
                injectDependencies(module);
                execQ.push(module);
                checkComplete();
            }
            setArrived(module);
            if (!isFunction(def) && !deps.length) {
                module.result = def;
                finishExec(module);
            }
            return module;
        }, runDefQ = function (referenceModule, mids) {
            var definedModules = [], module, args;
            while (defQ.length) {
                args = defQ.shift();
                mids && (args[0] = mids.shift());
                module = (args[0] && getModule(args[0])) || referenceModule;
                definedModules.push([module, args[1], args[2]]);
            }
            consumePendingCacheInsert(referenceModule);
            forEach(definedModules, function (args) {
                injectDependencies(defineModule.apply(null, args));
            });
        };
    }
    var timerId = 0, clearTimer = noop, startTimer = noop;
    if (1) {
        clearTimer = function () {
            timerId && clearTimeout(timerId);
            timerId = 0;
        };
        startTimer = function () {
            clearTimer();
            if (req.waitms) {
                timerId = global.setTimeout(function () {
                    clearTimer();
                    signal(error, makeError("timeout", waiting));
                }, req.waitms);
            }
        };
    }
    if (1) {
        has.add("ie-event-behavior", doc.attachEvent && typeof Windows === "undefined" && (typeof opera === "undefined" || opera.toString() != "[object Opera]"));
    }
    if (1 && (1 || 1)) {
        var domOn = function (node, eventName, ieEventName, handler) {
            if (!has("ie-event-behavior")) {
                node.addEventListener(eventName, handler, false);
                return function () {
                    node.removeEventListener(eventName, handler, false);
                };
            } else {
                node.attachEvent(ieEventName, handler);
                return function () {
                    node.detachEvent(ieEventName, handler);
                };
            }
        }, windowOnLoadListener = domOn(window, "load", "onload", function () {
            req.pageLoaded = 1;
            doc.readyState != "complete" && (doc.readyState = "complete");
            windowOnLoadListener();
        });
        if (1) {
            var scripts = doc.getElementsByTagName("script"), i = 0, script;
            while (!insertPointSibling) {
                if (!/^dojo/.test((script = scripts[i++]) && script.type)) {
                    insertPointSibling = script;
                }
            }
            req.injectUrl = function (url, callback, owner) {
                var node = owner.node = doc.createElement("script"), onLoad = function (e) {
                    e = e || window.event;
                    var node = e.target || e.srcElement;
                    if (e.type === "load" || /complete|loaded/.test(node.readyState)) {
                        loadDisconnector();
                        errorDisconnector();
                        callback && callback();
                    }
                }, loadDisconnector = domOn(node, "load", "onreadystatechange", onLoad), errorDisconnector = domOn(node, "error", "onerror", function (e) {
                    loadDisconnector();
                    errorDisconnector();
                    signal(error, makeError("scriptError", [url, e]));
                });
                node.type = "text/javascript";
                node.charset = "utf-8";
                node.src = url;
                insertPointSibling.parentNode.insertBefore(node, insertPointSibling);
                return node;
            };
        }
    }
    if (1) {
        req.log = function () {
            try {
                for (var i = 0; i < arguments.length; i++) {
                    console.log(arguments[i]);
                }
            }
            catch (e) {
            }
        };
    } else {
        req.log = noop;
    }
    if (1) {
        var trace = req.trace = function (group, args) {
            if (trace.on && trace.group[group]) {
                signal("trace", [group, args]);
                for (var arg, dump = [], text = "trace:" + group + (args.length ? (":" + args[0]) : ""), i = 1; i < args.length; ) {
                    arg = args[i++];
                    if (isString(arg)) {
                        text += ", " + arg;
                    } else {
                        dump.push(arg);
                    }
                }
                req.log(text);
                dump.length && dump.push(".");
                req.log.apply(req, dump);
            }
        };
        mix(trace, {on:1, group:{}, set:function (group, value) {
            if (isString(group)) {
                trace.group[group] = value;
            } else {
                mix(trace.group, group);
            }
        }});
        trace.set(mix(mix(mix({}, defaultConfig.trace), userConfig.trace), dojoSniffConfig.trace));
        on("config", function (config) {
            config.trace && trace.set(config.trace);
        });
    } else {
        req.trace = noop;
    }
    var def = function (mid, dependencies, factory) {
        var arity = arguments.length, defaultDeps = ["require", "exports", "module"], args = [0, mid, dependencies];
        if (arity == 1) {
            args = [0, (isFunction(mid) ? defaultDeps : []), mid];
        } else {
            if (arity == 2 && isString(mid)) {
                args = [mid, (isFunction(dependencies) ? defaultDeps : []), dependencies];
            } else {
                if (arity == 3) {
                    args = [mid, dependencies, factory];
                }
            }
        }
        if (0 && args[1] === defaultDeps) {
            args[2].toString().replace(/(\/\*([\s\S]*?)\*\/|\/\/(.*)$)/mg, "").replace(/require\(["']([\w\!\-_\.\/]+)["']\)/g, function (match, dep) {
                args[1].push(dep);
            });
        }
        req.trace("loader-define", args.slice(0, 2));
        var targetModule = args[0] && getModule(args[0]), module;
        if (targetModule && !waiting[targetModule.mid]) {
            injectDependencies(defineModule(targetModule, args[1], args[2]));
        } else {
            if (!has("ie-event-behavior") || !1 || injectingCachedModule) {
                defQ.push(args);
            } else {
                targetModule = targetModule || injectingModule;
                if (!targetModule) {
                    for (mid in waiting) {
                        module = modules[mid];
                        if (module && module.node && module.node.readyState === "interactive") {
                            targetModule = module;
                            break;
                        }
                    }
                    if (0 && !targetModule) {
                        for (var i = 0; i < combosPending.length; i++) {
                            targetModule = combosPending[i];
                            if (targetModule.node && targetModule.node.readyState === "interactive") {
                                break;
                            }
                            targetModule = 0;
                        }
                    }
                }
                if (0 && isArray(targetModule)) {
                    injectDependencies(defineModule(getModule(targetModule.shift()), args[1], args[2]));
                    if (!targetModule.length) {
                        combosPending.splice(i, 1);
                    }
                } else {
                    if (targetModule) {
                        consumePendingCacheInsert(targetModule);
                        injectDependencies(defineModule(targetModule, args[1], args[2]));
                    } else {
                        signal(error, makeError("ieDefineFailed", args[0]));
                    }
                }
                checkComplete();
            }
        }
    };
    def.amd = {vendor:"dojotoolkit.org"};
    if (1) {
        req.def = def;
    }
    mix(mix(req, defaultConfig.loaderPatch), userConfig.loaderPatch);
    on(error, function (arg) {
        try {
            console.error(arg);
            if (arg instanceof Error) {
                for (var p in arg) {
                    console.log(p + ":", arg[p]);
                }
                console.log(".");
            }
        }
        catch (e) {
        }
    });
    mix(req, {uid:uid, cache:cache, packs:packs});
    if (1) {
        mix(req, {paths:paths, aliases:aliases, modules:modules, legacyMode:legacyMode, execQ:execQ, defQ:defQ, waiting:waiting, packs:packs, mapProgs:mapProgs, pathsMapProg:pathsMapProg, listenerQueues:listenerQueues, computeMapProg:computeMapProg, computeAliases:computeAliases, runMapProg:runMapProg, compactPath:compactPath, getModuleInfo:getModuleInfo_});
    }
    if (global.define) {
        if (1) {
            signal(error, makeError("defineAlreadyDefined", 0));
        }
        return;
    } else {
        global.define = def;
        global.require = req;
        if (0) {
            require = req;
        }
    }
    if (0 && req.combo && req.combo.plugins) {
        var plugins = req.combo.plugins, pluginName;
        for (pluginName in plugins) {
            mix(mix(getModule(pluginName), plugins[pluginName]), {isCombo:1, executed:"executed", load:1});
        }
    }
    if (1) {
        forEach(delayedModuleConfig, function (c) {
            config(c);
        });
        var bootDeps = dojoSniffConfig.deps || userConfig.deps || defaultConfig.deps, bootCallback = dojoSniffConfig.callback || userConfig.callback || defaultConfig.callback;
        req.boot = (bootDeps || bootCallback) ? [bootDeps || [], bootCallback] : 0;
    }
    if (!1) {
        !req.async && req(["dojo"]);
        req.boot && req.apply(null, req.boot);
    }
})(this.dojoConfig || this.djConfig || this.require || {}, {async:1, bindEncoding:"UTF-8", "config-deferredInstrumentation":1, "config-dojo-loader-catches":1, "dojo-log-api":1, "dojo-trace-api":1, has:{"dojo-publish-privates":1, "dojo-undef-api":1}, hasCache:{"config-selectorEngine":"lite", "config-tlmSiblingOfDojo":1, "dojo-built":1, "dojo-loader":1, dom:1, "host-browser":1}, isDebug:1, packages:[{location:"../dijit", name:"dijit"}, {location:".", name:"dojo"}, {location:"../dojox", name:"dojox"}], parseOnLoad:0, waitSeconds:15});
require({cache:{"dojo/request/default":function () {
    define(["exports", "require", "../has"], function (exports, require, has) {
        var defId = has("config-requestProvider"), platformId;
        if (1 || has("host-webworker")) {
            platformId = "./xhr";
        } else {
            if (0) {
                platformId = "./node";
            }
        }
        if (!defId) {
            defId = platformId;
        }
        exports.getPlatformDefaultId = function () {
            return platformId;
        };
        exports.load = function (id, parentRequire, loaded, config) {
            require([id == "platform" ? platformId : defId], function (provider) {
                loaded(provider);
            });
        };
    });
}, "dojo/_base/fx":function () {
    define(["./kernel", "./config", "./lang", "../Evented", "./Color", "../aspect", "../sniff", "../dom", "../dom-style"], function (dojo, config, lang, Evented, Color, aspect, has, dom, style) {
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
}, "dojo/dom-form":function () {
    define(["./_base/lang", "./dom", "./io-query", "./json"], function (lang, dom, ioq, json) {
        function setValue(obj, name, value) {
            if (value === null) {
                return;
            }
            var val = obj[name];
            if (typeof val == "string") {
                obj[name] = [val, value];
            } else {
                if (lang.isArray(val)) {
                    val.push(value);
                } else {
                    obj[name] = value;
                }
            }
        }
        var exclude = "file|submit|image|reset|button";
        var form = {fieldToObject:function fieldToObject(inputNode) {
            var ret = null;
            inputNode = dom.byId(inputNode);
            if (inputNode) {
                var _in = inputNode.name, type = (inputNode.type || "").toLowerCase();
                if (_in && type && !inputNode.disabled) {
                    if (type == "radio" || type == "checkbox") {
                        if (inputNode.checked) {
                            ret = inputNode.value;
                        }
                    } else {
                        if (inputNode.multiple) {
                            ret = [];
                            var nodes = [inputNode.firstChild];
                            while (nodes.length) {
                                for (var node = nodes.pop(); node; node = node.nextSibling) {
                                    if (node.nodeType == 1 && node.tagName.toLowerCase() == "option") {
                                        if (node.selected) {
                                            ret.push(node.value);
                                        }
                                    } else {
                                        if (node.nextSibling) {
                                            nodes.push(node.nextSibling);
                                        }
                                        if (node.firstChild) {
                                            nodes.push(node.firstChild);
                                        }
                                        break;
                                    }
                                }
                            }
                        } else {
                            ret = inputNode.value;
                        }
                    }
                }
            }
            return ret;
        }, toObject:function formToObject(formNode) {
            var ret = {}, elems = dom.byId(formNode).elements;
            for (var i = 0, l = elems.length; i < l; ++i) {
                var item = elems[i], _in = item.name, type = (item.type || "").toLowerCase();
                if (_in && type && exclude.indexOf(type) < 0 && !item.disabled) {
                    setValue(ret, _in, form.fieldToObject(item));
                    if (type == "image") {
                        ret[_in + ".x"] = ret[_in + ".y"] = ret[_in].x = ret[_in].y = 0;
                    }
                }
            }
            return ret;
        }, toQuery:function formToQuery(formNode) {
            return ioq.objectToQuery(form.toObject(formNode));
        }, toJson:function formToJson(formNode, prettyPrint) {
            return json.stringify(form.toObject(formNode), null, prettyPrint ? 4 : 0);
        }};
        return form;
    });
}, "dojo/i18n":function () {
    define(["./_base/kernel", "require", "./has", "./_base/array", "./_base/config", "./_base/lang", "./_base/xhr", "./json", "module"], function (dojo, require, has, array, config, lang, xhr, json, module) {
        has.add("dojo-preload-i18n-Api", 1);
        1 || has.add("dojo-v1x-i18n-Api", 1);
        var thisModule = dojo.i18n = {}, nlsRe = /(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/, getAvailableLocales = function (root, locale, bundlePath, bundleName) {
            for (var result = [bundlePath + bundleName], localeParts = locale.split("-"), current = "", i = 0; i < localeParts.length; i++) {
                current += (current ? "-" : "") + localeParts[i];
                if (!root || root[current]) {
                    result.push(bundlePath + current + "/" + bundleName);
                    result.specificity = current;
                }
            }
            return result;
        }, cache = {}, getBundleName = function (moduleName, bundleName, locale) {
            locale = locale ? locale.toLowerCase() : dojo.locale;
            moduleName = moduleName.replace(/\./g, "/");
            bundleName = bundleName.replace(/\./g, "/");
            return (/root/i.test(locale)) ? (moduleName + "/nls/" + bundleName) : (moduleName + "/nls/" + locale + "/" + bundleName);
        }, getL10nName = dojo.getL10nName = function (moduleName, bundleName, locale) {
            return moduleName = module.id + "!" + getBundleName(moduleName, bundleName, locale);
        }, doLoad = function (require, bundlePathAndName, bundlePath, bundleName, locale, load) {
            require([bundlePathAndName], function (root) {
                var current = lang.clone(root.root || root.ROOT), availableLocales = getAvailableLocales(!root._v1x && root, locale, bundlePath, bundleName);
                require(availableLocales, function () {
                    for (var i = 1; i < availableLocales.length; i++) {
                        current = lang.mixin(lang.clone(current), arguments[i]);
                    }
                    var target = bundlePathAndName + "/" + locale;
                    cache[target] = current;
                    current.$locale = availableLocales.specificity;
                    load();
                });
            });
        }, normalize = function (id, toAbsMid) {
            return /^\./.test(id) ? toAbsMid(id) : id;
        }, getLocalesToLoad = function (targetLocale) {
            var list = config.extraLocale || [];
            list = lang.isArray(list) ? list : [list];
            list.push(targetLocale);
            return list;
        }, load = function (id, require, load) {
            if (has("dojo-preload-i18n-Api")) {
                var split = id.split("*"), preloadDemand = split[1] == "preload";
                if (preloadDemand) {
                    if (!cache[id]) {
                        cache[id] = 1;
                        preloadL10n(split[2], json.parse(split[3]), 1, require);
                    }
                    load(1);
                }
                if (preloadDemand || waitForPreloads(id, require, load)) {
                    return;
                }
            }
            var match = nlsRe.exec(id), bundlePath = match[1] + "/", bundleName = match[5] || match[4], bundlePathAndName = bundlePath + bundleName, localeSpecified = (match[5] && match[4]), targetLocale = localeSpecified || dojo.locale || "", loadTarget = bundlePathAndName + "/" + targetLocale, loadList = localeSpecified ? [targetLocale] : getLocalesToLoad(targetLocale), remaining = loadList.length, finish = function () {
                if (!--remaining) {
                    load(lang.delegate(cache[loadTarget]));
                }
            };
            array.forEach(loadList, function (locale) {
                var target = bundlePathAndName + "/" + locale;
                if (has("dojo-preload-i18n-Api")) {
                    checkForLegacyModules(target);
                }
                if (!cache[target]) {
                    doLoad(require, bundlePathAndName, bundlePath, bundleName, locale, finish);
                } else {
                    finish();
                }
            });
        };
        if (has("dojo-unit-tests")) {
            var unitTests = thisModule.unitTests = [];
        }
        if (has("dojo-preload-i18n-Api") || 1) {
            var normalizeLocale = thisModule.normalizeLocale = function (locale) {
                var result = locale ? locale.toLowerCase() : dojo.locale;
                return result == "root" ? "ROOT" : result;
            }, isXd = function (mid, contextRequire) {
                return (0 && 1) ? contextRequire.isXdUrl(require.toUrl(mid + ".js")) : true;
            }, preloading = 0, preloadWaitQueue = [], preloadL10n = thisModule._preloadLocalizations = function (bundlePrefix, localesGenerated, guaranteedAmdFormat, contextRequire) {
                contextRequire = contextRequire || require;
                function doRequire(mid, callback) {
                    if (isXd(mid, contextRequire) || guaranteedAmdFormat) {
                        contextRequire([mid], callback);
                    } else {
                        syncRequire([mid], callback, contextRequire);
                    }
                }
                function forEachLocale(locale, func) {
                    var parts = locale.split("-");
                    while (parts.length) {
                        if (func(parts.join("-"))) {
                            return;
                        }
                        parts.pop();
                    }
                    func("ROOT");
                }
                function preloadingAddLock() {
                    preloading++;
                }
                function preloadingRelLock() {
                    --preloading;
                    while (!preloading && preloadWaitQueue.length) {
                        load.apply(null, preloadWaitQueue.shift());
                    }
                }
                function cacheId(path, name, loc, require) {
                    return require.toAbsMid(path + name + "/" + loc);
                }
                function preload(locale) {
                    locale = normalizeLocale(locale);
                    forEachLocale(locale, function (loc) {
                        if (array.indexOf(localesGenerated, loc) >= 0) {
                            var mid = bundlePrefix.replace(/\./g, "/") + "_" + loc;
                            preloadingAddLock();
                            doRequire(mid, function (rollup) {
                                for (var p in rollup) {
                                    var bundle = rollup[p], match = p.match(/(.+)\/([^\/]+)$/), bundleName, bundlePath;
                                    if (!match) {
                                        continue;
                                    }
                                    bundleName = match[2];
                                    bundlePath = match[1] + "/";
                                    bundle._localized = bundle._localized || {};
                                    var localized;
                                    if (loc === "ROOT") {
                                        var root = localized = bundle._localized;
                                        delete bundle._localized;
                                        root.root = bundle;
                                        cache[require.toAbsMid(p)] = root;
                                    } else {
                                        localized = bundle._localized;
                                        cache[cacheId(bundlePath, bundleName, loc, require)] = bundle;
                                    }
                                    if (loc !== locale) {
                                        function improveBundle(bundlePath, bundleName, bundle, localized) {
                                            var requiredBundles = [], cacheIds = [];
                                            forEachLocale(locale, function (loc) {
                                                if (localized[loc]) {
                                                    requiredBundles.push(require.toAbsMid(bundlePath + loc + "/" + bundleName));
                                                    cacheIds.push(cacheId(bundlePath, bundleName, loc, require));
                                                }
                                            });
                                            if (requiredBundles.length) {
                                                preloadingAddLock();
                                                contextRequire(requiredBundles, function () {
                                                    for (var i = 0; i < requiredBundles.length; i++) {
                                                        bundle = lang.mixin(lang.clone(bundle), arguments[i]);
                                                        cache[cacheIds[i]] = bundle;
                                                    }
                                                    cache[cacheId(bundlePath, bundleName, locale, require)] = lang.clone(bundle);
                                                    preloadingRelLock();
                                                });
                                            } else {
                                                cache[cacheId(bundlePath, bundleName, locale, require)] = bundle;
                                            }
                                        }
                                        improveBundle(bundlePath, bundleName, bundle, localized);
                                    }
                                }
                                preloadingRelLock();
                            });
                            return true;
                        }
                        return false;
                    });
                }
                preload();
                array.forEach(dojo.config.extraLocale, preload);
            }, waitForPreloads = function (id, require, load) {
                if (preloading) {
                    preloadWaitQueue.push([id, require, load]);
                }
                return preloading;
            }, checkForLegacyModules = function () {
            };
        }
        if (1) {
            var amdValue = {}, evalBundle = new Function("__bundle", "__checkForLegacyModules", "__mid", "__amdValue", "var define = function(mid, factory){define.called = 1; __amdValue.result = factory || mid;}," + "\t   require = function(){define.called = 1;};" + "try{" + "define.called = 0;" + "eval(__bundle);" + "if(define.called==1)" + "return __amdValue;" + "if((__checkForLegacyModules = __checkForLegacyModules(__mid)))" + "return __checkForLegacyModules;" + "}catch(e){}" + "try{" + "return eval('('+__bundle+')');" + "}catch(e){" + "return e;" + "}"), syncRequire = function (deps, callback, require) {
                var results = [];
                array.forEach(deps, function (mid) {
                    var url = require.toUrl(mid + ".js");
                    function load(text) {
                        var result = evalBundle(text, checkForLegacyModules, mid, amdValue);
                        if (result === amdValue) {
                            results.push(cache[url] = amdValue.result);
                        } else {
                            if (result instanceof Error) {
                                console.error("failed to evaluate i18n bundle; url=" + url, result);
                                result = {};
                            }
                            results.push(cache[url] = (/nls\/[^\/]+\/[^\/]+$/.test(url) ? result : {root:result, _v1x:1}));
                        }
                    }
                    if (cache[url]) {
                        results.push(cache[url]);
                    } else {
                        var bundle = require.syncLoadNls(mid);
                        if (bundle) {
                            results.push(bundle);
                        } else {
                            if (!xhr) {
                                try {
                                    require.getText(url, true, load);
                                }
                                catch (e) {
                                    results.push(cache[url] = {});
                                }
                            } else {
                                xhr.get({url:url, sync:true, load:load, error:function () {
                                    results.push(cache[url] = {});
                                }});
                            }
                        }
                    }
                });
                callback && callback.apply(null, results);
            };
            checkForLegacyModules = function (target) {
                for (var result, names = target.split("/"), object = dojo.global[names[0]], i = 1; object && i < names.length - 1; object = object[names[i++]]) {
                }
                if (object) {
                    result = object[names[i]];
                    if (!result) {
                        result = object[names[i].replace(/-/g, "_")];
                    }
                    if (result) {
                        cache[target] = result;
                    }
                }
                return result;
            };
            thisModule.getLocalization = function (moduleName, bundleName, locale) {
                var result, l10nName = getBundleName(moduleName, bundleName, locale);
                load(l10nName, (!isXd(l10nName, require) ? function (deps, callback) {
                    syncRequire(deps, callback, require);
                } : require), function (result_) {
                    result = result_;
                });
                return result;
            };
            if (has("dojo-unit-tests")) {
                unitTests.push(function (doh) {
                    doh.register("tests.i18n.unit", function (t) {
                        var check;
                        check = evalBundle("{prop:1}", checkForLegacyModules, "nonsense", amdValue);
                        t.is({prop:1}, check);
                        t.is(undefined, check[1]);
                        check = evalBundle("({prop:1})", checkForLegacyModules, "nonsense", amdValue);
                        t.is({prop:1}, check);
                        t.is(undefined, check[1]);
                        check = evalBundle("{'prop-x':1}", checkForLegacyModules, "nonsense", amdValue);
                        t.is({"prop-x":1}, check);
                        t.is(undefined, check[1]);
                        check = evalBundle("({'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
                        t.is({"prop-x":1}, check);
                        t.is(undefined, check[1]);
                        check = evalBundle("define({'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
                        t.is(amdValue, check);
                        t.is({"prop-x":1}, amdValue.result);
                        check = evalBundle("define('some/module', {'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
                        t.is(amdValue, check);
                        t.is({"prop-x":1}, amdValue.result);
                        check = evalBundle("this is total nonsense and should throw an error", checkForLegacyModules, "nonsense", amdValue);
                        t.is(check instanceof Error, true);
                    });
                });
            }
        }
        return lang.mixin(thisModule, {dynamic:true, normalize:normalize, load:load, cache:cache, getL10nName:getL10nName});
    });
}, "dojo/string":function () {
    define(["./_base/kernel", "./_base/lang"], function (kernel, lang) {
        var ESCAPE_REGEXP = /[&<>'"\/]/g;
        var ESCAPE_MAP = {"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#x27;", "/":"&#x2F;"};
        var string = {};
        lang.setObject("dojo.string", string);
        string.escape = function (str) {
            if (!str) {
                return "";
            }
            return str.replace(ESCAPE_REGEXP, function (c) {
                return ESCAPE_MAP[c];
            });
        };
        string.rep = function (str, num) {
            if (num <= 0 || !str) {
                return "";
            }
            var buf = [];
            for (; ; ) {
                if (num & 1) {
                    buf.push(str);
                }
                if (!(num >>= 1)) {
                    break;
                }
                str += str;
            }
            return buf.join("");
        };
        string.pad = function (text, size, ch, end) {
            if (!ch) {
                ch = "0";
            }
            var out = String(text), pad = string.rep(ch, Math.ceil((size - out.length) / ch.length));
            return end ? out + pad : pad + out;
        };
        string.substitute = function (template, map, transform, thisObject) {
            thisObject = thisObject || kernel.global;
            transform = transform ? lang.hitch(thisObject, transform) : function (v) {
                return v;
            };
            return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g, function (match, key, format) {
                var value = lang.getObject(key, false, map);
                if (format) {
                    value = lang.getObject(format, false, thisObject).call(thisObject, value, key);
                }
                return transform(value, key).toString();
            });
        };
        string.trim = String.prototype.trim ? lang.trim : function (str) {
            str = str.replace(/^\s+/, "");
            for (var i = str.length - 1; i >= 0; i--) {
                if (/\S/.test(str.charAt(i))) {
                    str = str.substring(0, i + 1);
                    break;
                }
            }
            return str;
        };
        return string;
    });
}, "dojo/_base/html":function () {
    define(["./kernel", "../dom", "../dom-style", "../dom-attr", "../dom-prop", "../dom-class", "../dom-construct", "../dom-geometry"], function (dojo, dom, style, attr, prop, cls, ctr, geom) {
        dojo.byId = dom.byId;
        dojo.isDescendant = dom.isDescendant;
        dojo.setSelectable = dom.setSelectable;
        dojo.getAttr = attr.get;
        dojo.setAttr = attr.set;
        dojo.hasAttr = attr.has;
        dojo.removeAttr = attr.remove;
        dojo.getNodeProp = attr.getNodeProp;
        dojo.attr = function (node, name, value) {
            if (arguments.length == 2) {
                return attr[typeof name == "string" ? "get" : "set"](node, name);
            }
            return attr.set(node, name, value);
        };
        dojo.hasClass = cls.contains;
        dojo.addClass = cls.add;
        dojo.removeClass = cls.remove;
        dojo.toggleClass = cls.toggle;
        dojo.replaceClass = cls.replace;
        dojo._toDom = dojo.toDom = ctr.toDom;
        dojo.place = ctr.place;
        dojo.create = ctr.create;
        dojo.empty = function (node) {
            ctr.empty(node);
        };
        dojo._destroyElement = dojo.destroy = function (node) {
            ctr.destroy(node);
        };
        dojo._getPadExtents = dojo.getPadExtents = geom.getPadExtents;
        dojo._getBorderExtents = dojo.getBorderExtents = geom.getBorderExtents;
        dojo._getPadBorderExtents = dojo.getPadBorderExtents = geom.getPadBorderExtents;
        dojo._getMarginExtents = dojo.getMarginExtents = geom.getMarginExtents;
        dojo._getMarginSize = dojo.getMarginSize = geom.getMarginSize;
        dojo._getMarginBox = dojo.getMarginBox = geom.getMarginBox;
        dojo.setMarginBox = geom.setMarginBox;
        dojo._getContentBox = dojo.getContentBox = geom.getContentBox;
        dojo.setContentSize = geom.setContentSize;
        dojo._isBodyLtr = dojo.isBodyLtr = geom.isBodyLtr;
        dojo._docScroll = dojo.docScroll = geom.docScroll;
        dojo._getIeDocumentElementOffset = dojo.getIeDocumentElementOffset = geom.getIeDocumentElementOffset;
        dojo._fixIeBiDiScrollLeft = dojo.fixIeBiDiScrollLeft = geom.fixIeBiDiScrollLeft;
        dojo.position = geom.position;
        dojo.marginBox = function marginBox(node, box) {
            return box ? geom.setMarginBox(node, box) : geom.getMarginBox(node);
        };
        dojo.contentBox = function contentBox(node, box) {
            return box ? geom.setContentSize(node, box) : geom.getContentBox(node);
        };
        dojo.coords = function (node, includeScroll) {
            dojo.deprecated("dojo.coords()", "Use dojo.position() or dojo.marginBox().");
            node = dom.byId(node);
            var s = style.getComputedStyle(node), mb = geom.getMarginBox(node, s);
            var abs = geom.position(node, includeScroll);
            mb.x = abs.x;
            mb.y = abs.y;
            return mb;
        };
        dojo.getProp = prop.get;
        dojo.setProp = prop.set;
        dojo.prop = function (node, name, value) {
            if (arguments.length == 2) {
                return prop[typeof name == "string" ? "get" : "set"](node, name);
            }
            return prop.set(node, name, value);
        };
        dojo.getStyle = style.get;
        dojo.setStyle = style.set;
        dojo.getComputedStyle = style.getComputedStyle;
        dojo.__toPixelValue = dojo.toPixelValue = style.toPixelValue;
        dojo.style = function (node, name, value) {
            switch (arguments.length) {
              case 1:
                return style.get(node);
              case 2:
                return style[typeof name == "string" ? "get" : "set"](node, name);
            }
            return style.set(node, name, value);
        };
        return dojo;
    });
}, "dojo/_base/Deferred":function () {
    define(["./kernel", "../Deferred", "../promise/Promise", "../errors/CancelError", "../has", "./lang", "../when"], function (dojo, NewDeferred, Promise, CancelError, has, lang, when) {
        var mutator = function () {
        };
        var freeze = Object.freeze || function () {
        };
        var Deferred = dojo.Deferred = function (canceller) {
            var result, finished, canceled, fired, isError, head, nextListener;
            var promise = (this.promise = new Promise());
            function complete(value) {
                if (finished) {
                    throw new Error("This deferred has already been resolved");
                }
                result = value;
                finished = true;
                notify();
            }
            function notify() {
                var mutated;
                while (!mutated && nextListener) {
                    var listener = nextListener;
                    nextListener = nextListener.next;
                    if ((mutated = (listener.progress == mutator))) {
                        finished = false;
                    }
                    var func = (isError ? listener.error : listener.resolved);
                    if (has("config-useDeferredInstrumentation")) {
                        if (isError && NewDeferred.instrumentRejected) {
                            NewDeferred.instrumentRejected(result, !!func);
                        }
                    }
                    if (func) {
                        try {
                            var newResult = func(result);
                            if (newResult && typeof newResult.then === "function") {
                                newResult.then(lang.hitch(listener.deferred, "resolve"), lang.hitch(listener.deferred, "reject"), lang.hitch(listener.deferred, "progress"));
                                continue;
                            }
                            var unchanged = mutated && newResult === undefined;
                            if (mutated && !unchanged) {
                                isError = newResult instanceof Error;
                            }
                            listener.deferred[unchanged && isError ? "reject" : "resolve"](unchanged ? result : newResult);
                        }
                        catch (e) {
                            listener.deferred.reject(e);
                        }
                    } else {
                        if (isError) {
                            listener.deferred.reject(result);
                        } else {
                            listener.deferred.resolve(result);
                        }
                    }
                }
            }
            this.isResolved = promise.isResolved = function () {
                return fired == 0;
            };
            this.isRejected = promise.isRejected = function () {
                return fired == 1;
            };
            this.isFulfilled = promise.isFulfilled = function () {
                return fired >= 0;
            };
            this.isCanceled = promise.isCanceled = function () {
                return canceled;
            };
            this.resolve = this.callback = function (value) {
                this.fired = fired = 0;
                this.results = [value, null];
                complete(value);
            };
            this.reject = this.errback = function (error) {
                isError = true;
                this.fired = fired = 1;
                if (has("config-useDeferredInstrumentation")) {
                    if (NewDeferred.instrumentRejected) {
                        NewDeferred.instrumentRejected(error, !!nextListener);
                    }
                }
                complete(error);
                this.results = [null, error];
            };
            this.progress = function (update) {
                var listener = nextListener;
                while (listener) {
                    var progress = listener.progress;
                    progress && progress(update);
                    listener = listener.next;
                }
            };
            this.addCallbacks = function (callback, errback) {
                this.then(callback, errback, mutator);
                return this;
            };
            promise.then = this.then = function (resolvedCallback, errorCallback, progressCallback) {
                var returnDeferred = progressCallback == mutator ? this : new Deferred(promise.cancel);
                var listener = {resolved:resolvedCallback, error:errorCallback, progress:progressCallback, deferred:returnDeferred};
                if (nextListener) {
                    head = head.next = listener;
                } else {
                    nextListener = head = listener;
                }
                if (finished) {
                    notify();
                }
                return returnDeferred.promise;
            };
            var deferred = this;
            promise.cancel = this.cancel = function () {
                if (!finished) {
                    var error = canceller && canceller(deferred);
                    if (!finished) {
                        if (!(error instanceof Error)) {
                            error = new CancelError(error);
                        }
                        error.log = false;
                        deferred.reject(error);
                    }
                }
                canceled = true;
            };
            freeze(promise);
        };
        lang.extend(Deferred, {addCallback:function (callback) {
            return this.addCallbacks(lang.hitch.apply(dojo, arguments));
        }, addErrback:function (errback) {
            return this.addCallbacks(null, lang.hitch.apply(dojo, arguments));
        }, addBoth:function (callback) {
            var enclosed = lang.hitch.apply(dojo, arguments);
            return this.addCallbacks(enclosed, enclosed);
        }, fired:-1});
        Deferred.when = dojo.when = when;
        return Deferred;
    });
}, "dojo/date":function () {
    define(["./has", "./_base/lang"], function (has, lang) {
        var date = {};
        date.getDaysInMonth = function (dateObject) {
            var month = dateObject.getMonth();
            var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            if (month == 1 && date.isLeapYear(dateObject)) {
                return 29;
            }
            return days[month];
        };
        date.isLeapYear = function (dateObject) {
            var year = dateObject.getFullYear();
            return !(year % 400) || (!(year % 4) && !!(year % 100));
        };
        date.getTimezoneName = function (dateObject) {
            var str = dateObject.toString();
            var tz = "";
            var match;
            var pos = str.indexOf("(");
            if (pos > -1) {
                tz = str.substring(++pos, str.indexOf(")"));
            } else {
                var pat = /([A-Z\/]+) \d{4}$/;
                if ((match = str.match(pat))) {
                    tz = match[1];
                } else {
                    str = dateObject.toLocaleString();
                    pat = / ([A-Z\/]+)$/;
                    if ((match = str.match(pat))) {
                        tz = match[1];
                    }
                }
            }
            return (tz == "AM" || tz == "PM") ? "" : tz;
        };
        date.compare = function (date1, date2, portion) {
            date1 = new Date(+date1);
            date2 = new Date(+(date2 || new Date()));
            if (portion == "date") {
                date1.setHours(0, 0, 0, 0);
                date2.setHours(0, 0, 0, 0);
            } else {
                if (portion == "time") {
                    date1.setFullYear(0, 0, 0);
                    date2.setFullYear(0, 0, 0);
                }
            }
            if (date1 > date2) {
                return 1;
            }
            if (date1 < date2) {
                return -1;
            }
            return 0;
        };
        date.add = function (date, interval, amount) {
            var sum = new Date(+date);
            var fixOvershoot = false;
            var property = "Date";
            switch (interval) {
              case "day":
                break;
              case "weekday":
                var days, weeks;
                var mod = amount % 5;
                if (!mod) {
                    days = (amount > 0) ? 5 : -5;
                    weeks = (amount > 0) ? ((amount - 5) / 5) : ((amount + 5) / 5);
                } else {
                    days = mod;
                    weeks = parseInt(amount / 5);
                }
                var strt = date.getDay();
                var adj = 0;
                if (strt == 6 && amount > 0) {
                    adj = 1;
                } else {
                    if (strt == 0 && amount < 0) {
                        adj = -1;
                    }
                }
                var trgt = strt + days;
                if (trgt == 0 || trgt == 6) {
                    adj = (amount > 0) ? 2 : -2;
                }
                amount = (7 * weeks) + days + adj;
                break;
              case "year":
                property = "FullYear";
                fixOvershoot = true;
                break;
              case "week":
                amount *= 7;
                break;
              case "quarter":
                amount *= 3;
              case "month":
                fixOvershoot = true;
                property = "Month";
                break;
              default:
                property = "UTC" + interval.charAt(0).toUpperCase() + interval.substring(1) + "s";
            }
            if (property) {
                sum["set" + property](sum["get" + property]() + amount);
            }
            if (fixOvershoot && (sum.getDate() < date.getDate())) {
                sum.setDate(0);
            }
            return sum;
        };
        date.difference = function (date1, date2, interval) {
            date2 = date2 || new Date();
            interval = interval || "day";
            var yearDiff = date2.getFullYear() - date1.getFullYear();
            var delta = 1;
            switch (interval) {
              case "quarter":
                var m1 = date1.getMonth();
                var m2 = date2.getMonth();
                var q1 = Math.floor(m1 / 3) + 1;
                var q2 = Math.floor(m2 / 3) + 1;
                q2 += (yearDiff * 4);
                delta = q2 - q1;
                break;
              case "weekday":
                var days = Math.round(date.difference(date1, date2, "day"));
                var weeks = parseInt(date.difference(date1, date2, "week"));
                var mod = days % 7;
                if (mod == 0) {
                    days = weeks * 5;
                } else {
                    var adj = 0;
                    var aDay = date1.getDay();
                    var bDay = date2.getDay();
                    weeks = parseInt(days / 7);
                    mod = days % 7;
                    var dtMark = new Date(date1);
                    dtMark.setDate(dtMark.getDate() + (weeks * 7));
                    var dayMark = dtMark.getDay();
                    if (days > 0) {
                        switch (true) {
                          case aDay == 6:
                            adj = -1;
                            break;
                          case aDay == 0:
                            adj = 0;
                            break;
                          case bDay == 6:
                            adj = -1;
                            break;
                          case bDay == 0:
                            adj = -2;
                            break;
                          case (dayMark + mod) > 5:
                            adj = -2;
                        }
                    } else {
                        if (days < 0) {
                            switch (true) {
                              case aDay == 6:
                                adj = 0;
                                break;
                              case aDay == 0:
                                adj = 1;
                                break;
                              case bDay == 6:
                                adj = 2;
                                break;
                              case bDay == 0:
                                adj = 1;
                                break;
                              case (dayMark + mod) < 0:
                                adj = 2;
                            }
                        }
                    }
                    days += adj;
                    days -= (weeks * 2);
                }
                delta = days;
                break;
              case "year":
                delta = yearDiff;
                break;
              case "month":
                delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
                break;
              case "week":
                delta = parseInt(date.difference(date1, date2, "day") / 7);
                break;
              case "day":
                delta /= 24;
              case "hour":
                delta /= 60;
              case "minute":
                delta /= 60;
              case "second":
                delta /= 1000;
              case "millisecond":
                delta *= date2.getTime() - date1.getTime();
            }
            return Math.round(delta);
        };
        1 && lang.mixin(lang.getObject("dojo.date", true), date);
        return date;
    });
}, "dojo/NodeList-dom":function () {
    define(["./_base/kernel", "./query", "./_base/array", "./_base/lang", "./dom-class", "./dom-construct", "./dom-geometry", "./dom-attr", "./dom-style"], function (dojo, query, array, lang, domCls, domCtr, domGeom, domAttr, domStyle) {
        var magicGuard = function (a) {
            return a.length == 1 && (typeof a[0] == "string");
        };
        var orphan = function (node) {
            var p = node.parentNode;
            if (p) {
                p.removeChild(node);
            }
        };
        var NodeList = query.NodeList, awc = NodeList._adaptWithCondition, aafe = NodeList._adaptAsForEach, aam = NodeList._adaptAsMap;
        function getSet(module) {
            return function (node, name, value) {
                if (arguments.length == 2) {
                    return module[typeof name == "string" ? "get" : "set"](node, name);
                }
                return module.set(node, name, value);
            };
        }
        lang.extend(NodeList, {_normalize:function (content, refNode) {
            var parse = content.parse === true;
            if (typeof content.template == "string") {
                var templateFunc = content.templateFunc || (dojo.string && dojo.string.substitute);
                content = templateFunc ? templateFunc(content.template, content) : content;
            }
            var type = (typeof content);
            if (type == "string" || type == "number") {
                content = domCtr.toDom(content, (refNode && refNode.ownerDocument));
                if (content.nodeType == 11) {
                    content = lang._toArray(content.childNodes);
                } else {
                    content = [content];
                }
            } else {
                if (!lang.isArrayLike(content)) {
                    content = [content];
                } else {
                    if (!lang.isArray(content)) {
                        content = lang._toArray(content);
                    }
                }
            }
            if (parse) {
                content._runParse = true;
            }
            return content;
        }, _cloneNode:function (node) {
            return node.cloneNode(true);
        }, _place:function (ary, refNode, position, useClone) {
            if (refNode.nodeType != 1 && position == "only") {
                return;
            }
            var rNode = refNode, tempNode;
            var length = ary.length;
            for (var i = length - 1; i >= 0; i--) {
                var node = (useClone ? this._cloneNode(ary[i]) : ary[i]);
                if (ary._runParse && dojo.parser && dojo.parser.parse) {
                    if (!tempNode) {
                        tempNode = rNode.ownerDocument.createElement("div");
                    }
                    tempNode.appendChild(node);
                    dojo.parser.parse(tempNode);
                    node = tempNode.firstChild;
                    while (tempNode.firstChild) {
                        tempNode.removeChild(tempNode.firstChild);
                    }
                }
                if (i == length - 1) {
                    domCtr.place(node, rNode, position);
                } else {
                    rNode.parentNode.insertBefore(node, rNode);
                }
                rNode = node;
            }
        }, position:aam(domGeom.position), attr:awc(getSet(domAttr), magicGuard), style:awc(getSet(domStyle), magicGuard), addClass:aafe(domCls.add), removeClass:aafe(domCls.remove), toggleClass:aafe(domCls.toggle), replaceClass:aafe(domCls.replace), empty:aafe(domCtr.empty), removeAttr:aafe(domAttr.remove), marginBox:aam(domGeom.getMarginBox), place:function (queryOrNode, position) {
            var item = query(queryOrNode)[0];
            return this.forEach(function (node) {
                domCtr.place(node, item, position);
            });
        }, orphan:function (filter) {
            return (filter ? query._filterResult(this, filter) : this).forEach(orphan);
        }, adopt:function (queryOrListOrNode, position) {
            return query(queryOrListOrNode).place(this[0], position)._stash(this);
        }, query:function (queryStr) {
            if (!queryStr) {
                return this;
            }
            var ret = new NodeList;
            this.map(function (node) {
                query(queryStr, node).forEach(function (subNode) {
                    if (subNode !== undefined) {
                        ret.push(subNode);
                    }
                });
            });
            return ret._stash(this);
        }, filter:function (filter) {
            var a = arguments, items = this, start = 0;
            if (typeof filter == "string") {
                items = query._filterResult(this, a[0]);
                if (a.length == 1) {
                    return items._stash(this);
                }
                start = 1;
            }
            return this._wrap(array.filter(items, a[start], a[start + 1]), this);
        }, addContent:function (content, position) {
            content = this._normalize(content, this[0]);
            for (var i = 0, node; (node = this[i]); i++) {
                if (content.length) {
                    this._place(content, node, position, i > 0);
                } else {
                    domCtr.empty(node);
                }
            }
            return this;
        }});
        return NodeList;
    });
}, "dojo/query":function () {
    define(["./_base/kernel", "./has", "./dom", "./on", "./_base/array", "./_base/lang", "./selector/_loader", "./selector/_loader!default"], function (dojo, has, dom, on, array, lang, loader, defaultEngine) {
        "use strict";
        has.add("array-extensible", function () {
            return lang.delegate([], {length:1}).length == 1 && !has("bug-for-in-skips-shadowed");
        });
        var ap = Array.prototype, aps = ap.slice, apc = ap.concat, forEach = array.forEach;
        var tnl = function (a, parent, NodeListCtor) {
            var nodeList = new (NodeListCtor || this._NodeListCtor || nl)(a);
            return parent ? nodeList._stash(parent) : nodeList;
        };
        var loopBody = function (f, a, o) {
            a = [0].concat(aps.call(a, 0));
            o = o || dojo.global;
            return function (node) {
                a[0] = node;
                return f.apply(o, a);
            };
        };
        var adaptAsForEach = function (f, o) {
            return function () {
                this.forEach(loopBody(f, arguments, o));
                return this;
            };
        };
        var adaptAsMap = function (f, o) {
            return function () {
                return this.map(loopBody(f, arguments, o));
            };
        };
        var adaptAsFilter = function (f, o) {
            return function () {
                return this.filter(loopBody(f, arguments, o));
            };
        };
        var adaptWithCondition = function (f, g, o) {
            return function () {
                var a = arguments, body = loopBody(f, a, o);
                if (g.call(o || dojo.global, a)) {
                    return this.map(body);
                }
                this.forEach(body);
                return this;
            };
        };
        var NodeList = function (array) {
            var isNew = this instanceof nl && has("array-extensible");
            if (typeof array == "number") {
                array = Array(array);
            }
            var nodeArray = (array && "length" in array) ? array : arguments;
            if (isNew || !nodeArray.sort) {
                var target = isNew ? this : [], l = target.length = nodeArray.length;
                for (var i = 0; i < l; i++) {
                    target[i] = nodeArray[i];
                }
                if (isNew) {
                    return target;
                }
                nodeArray = target;
            }
            lang._mixin(nodeArray, nlp);
            nodeArray._NodeListCtor = function (array) {
                return nl(array);
            };
            return nodeArray;
        };
        var nl = NodeList, nlp = nl.prototype = has("array-extensible") ? [] : {};
        nl._wrap = nlp._wrap = tnl;
        nl._adaptAsMap = adaptAsMap;
        nl._adaptAsForEach = adaptAsForEach;
        nl._adaptAsFilter = adaptAsFilter;
        nl._adaptWithCondition = adaptWithCondition;
        forEach(["slice", "splice"], function (name) {
            var f = ap[name];
            nlp[name] = function () {
                return this._wrap(f.apply(this, arguments), name == "slice" ? this : null);
            };
        });
        forEach(["indexOf", "lastIndexOf", "every", "some"], function (name) {
            var f = array[name];
            nlp[name] = function () {
                return f.apply(dojo, [this].concat(aps.call(arguments, 0)));
            };
        });
        lang.extend(NodeList, {constructor:nl, _NodeListCtor:nl, toString:function () {
            return this.join(",");
        }, _stash:function (parent) {
            this._parent = parent;
            return this;
        }, on:function (eventName, listener) {
            var handles = this.map(function (node) {
                return on(node, eventName, listener);
            });
            handles.remove = function () {
                for (var i = 0; i < handles.length; i++) {
                    handles[i].remove();
                }
            };
            return handles;
        }, end:function () {
            if (this._parent) {
                return this._parent;
            } else {
                return new this._NodeListCtor(0);
            }
        }, concat:function (item) {
            var t = aps.call(this, 0), m = array.map(arguments, function (a) {
                return aps.call(a, 0);
            });
            return this._wrap(apc.apply(t, m), this);
        }, map:function (func, obj) {
            return this._wrap(array.map(this, func, obj), this);
        }, forEach:function (callback, thisObj) {
            forEach(this, callback, thisObj);
            return this;
        }, filter:function (filter) {
            var a = arguments, items = this, start = 0;
            if (typeof filter == "string") {
                items = query._filterResult(this, a[0]);
                if (a.length == 1) {
                    return items._stash(this);
                }
                start = 1;
            }
            return this._wrap(array.filter(items, a[start], a[start + 1]), this);
        }, instantiate:function (declaredClass, properties) {
            var c = lang.isFunction(declaredClass) ? declaredClass : lang.getObject(declaredClass);
            properties = properties || {};
            return this.forEach(function (node) {
                new c(properties, node);
            });
        }, at:function () {
            var t = new this._NodeListCtor(0);
            forEach(arguments, function (i) {
                if (i < 0) {
                    i = this.length + i;
                }
                if (this[i]) {
                    t.push(this[i]);
                }
            }, this);
            return t._stash(this);
        }});
        function queryForEngine(engine, NodeList) {
            var query = function (query, root) {
                if (typeof root == "string") {
                    root = dom.byId(root);
                    if (!root) {
                        return new NodeList([]);
                    }
                }
                var results = typeof query == "string" ? engine(query, root) : query ? (query.end && query.on) ? query : [query] : [];
                if (results.end && results.on) {
                    return results;
                }
                return new NodeList(results);
            };
            query.matches = engine.match || function (node, selector, root) {
                return query.filter([node], selector, root).length > 0;
            };
            query.filter = engine.filter || function (nodes, selector, root) {
                return query(selector, root).filter(function (node) {
                    return array.indexOf(nodes, node) > -1;
                });
            };
            if (typeof engine != "function") {
                var search = engine.search;
                engine = function (selector, root) {
                    return search(root || document, selector);
                };
            }
            return query;
        }
        var query = queryForEngine(defaultEngine, NodeList);
        dojo.query = queryForEngine(defaultEngine, function (array) {
            return NodeList(array);
        });
        query.load = function (id, parentRequire, loaded) {
            loader.load(id, parentRequire, function (engine) {
                loaded(queryForEngine(engine, NodeList));
            });
        };
        dojo._filterQueryResult = query._filterResult = function (nodes, selector, root) {
            return new NodeList(query.filter(nodes, selector, root));
        };
        dojo.NodeList = query.NodeList = NodeList;
        return query;
    });
}, "dojo/json":function () {
    define(["./has"], function (has) {
        "use strict";
        var hasJSON = typeof JSON != "undefined";
        has.add("json-parse", hasJSON);
        has.add("json-stringify", hasJSON && JSON.stringify({a:0}, function (k, v) {
            return v || 1;
        }) == "{\"a\":1}");
        if (has("json-stringify")) {
            return JSON;
        } else {
            var escapeString = function (str) {
                return ("\"" + str.replace(/(["\\])/g, "\\$1") + "\"").replace(/[\f]/g, "\\f").replace(/[\b]/g, "\\b").replace(/[\n]/g, "\\n").replace(/[\t]/g, "\\t").replace(/[\r]/g, "\\r");
            };
            return {parse:has("json-parse") ? JSON.parse : function (str, strict) {
                if (strict && !/^([\s\[\{]*(?:"(?:\\.|[^"])*"|-?\d[\d\.]*(?:[Ee][+-]?\d+)?|null|true|false|)[\s\]\}]*(?:,|:|$))+$/.test(str)) {
                    throw new SyntaxError("Invalid characters in JSON");
                }
                return eval("(" + str + ")");
            }, stringify:function (value, replacer, spacer) {
                var undef;
                if (typeof replacer == "string") {
                    spacer = replacer;
                    replacer = null;
                }
                function stringify(it, indent, key) {
                    if (replacer) {
                        it = replacer(key, it);
                    }
                    var val, objtype = typeof it;
                    if (objtype == "number") {
                        return isFinite(it) ? it + "" : "null";
                    }
                    if (objtype == "boolean") {
                        return it + "";
                    }
                    if (it === null) {
                        return "null";
                    }
                    if (typeof it == "string") {
                        return escapeString(it);
                    }
                    if (objtype == "function" || objtype == "undefined") {
                        return undef;
                    }
                    if (typeof it.toJSON == "function") {
                        return stringify(it.toJSON(key), indent, key);
                    }
                    if (it instanceof Date) {
                        return "\"{FullYear}-{Month+}-{Date}T{Hours}:{Minutes}:{Seconds}Z\"".replace(/\{(\w+)(\+)?\}/g, function (t, prop, plus) {
                            var num = it["getUTC" + prop]() + (plus ? 1 : 0);
                            return num < 10 ? "0" + num : num;
                        });
                    }
                    if (it.valueOf() !== it) {
                        return stringify(it.valueOf(), indent, key);
                    }
                    var nextIndent = spacer ? (indent + spacer) : "";
                    var sep = spacer ? " " : "";
                    var newLine = spacer ? "\n" : "";
                    if (it instanceof Array) {
                        var itl = it.length, res = [];
                        for (key = 0; key < itl; key++) {
                            var obj = it[key];
                            val = stringify(obj, nextIndent, key);
                            if (typeof val != "string") {
                                val = "null";
                            }
                            res.push(newLine + nextIndent + val);
                        }
                        return "[" + res.join(",") + newLine + indent + "]";
                    }
                    var output = [];
                    for (key in it) {
                        var keyStr;
                        if (it.hasOwnProperty(key)) {
                            if (typeof key == "number") {
                                keyStr = "\"" + key + "\"";
                            } else {
                                if (typeof key == "string") {
                                    keyStr = escapeString(key);
                                } else {
                                    continue;
                                }
                            }
                            val = stringify(it[key], nextIndent, key);
                            if (typeof val != "string") {
                                continue;
                            }
                            output.push(newLine + nextIndent + keyStr + ":" + sep + val);
                        }
                    }
                    return "{" + output.join(",") + newLine + indent + "}";
                }
                return stringify(value, "", "");
            }};
        }
    });
}, "dojo/_base/declare":function () {
    define(["./kernel", "../has", "./lang"], function (dojo, has, lang) {
        var mix = lang.mixin, op = Object.prototype, opts = op.toString, xtor = new Function, counter = 0, cname = "constructor";
        function err(msg, cls) {
            throw new Error("declare" + (cls ? " " + cls : "") + ": " + msg);
        }
        function c3mro(bases, className) {
            var result = [], roots = [{cls:0, refs:[]}], nameMap = {}, clsCount = 1, l = bases.length, i = 0, j, lin, base, top, proto, rec, name, refs;
            for (; i < l; ++i) {
                base = bases[i];
                if (!base) {
                    err("mixin #" + i + " is unknown. Did you use dojo.require to pull it in?", className);
                } else {
                    if (opts.call(base) != "[object Function]") {
                        err("mixin #" + i + " is not a callable constructor.", className);
                    }
                }
                lin = base._meta ? base._meta.bases : [base];
                top = 0;
                for (j = lin.length - 1; j >= 0; --j) {
                    proto = lin[j].prototype;
                    if (!proto.hasOwnProperty("declaredClass")) {
                        proto.declaredClass = "uniqName_" + (counter++);
                    }
                    name = proto.declaredClass;
                    if (!nameMap.hasOwnProperty(name)) {
                        nameMap[name] = {count:0, refs:[], cls:lin[j]};
                        ++clsCount;
                    }
                    rec = nameMap[name];
                    if (top && top !== rec) {
                        rec.refs.push(top);
                        ++top.count;
                    }
                    top = rec;
                }
                ++top.count;
                roots[0].refs.push(top);
            }
            while (roots.length) {
                top = roots.pop();
                result.push(top.cls);
                --clsCount;
                while (refs = top.refs, refs.length == 1) {
                    top = refs[0];
                    if (!top || --top.count) {
                        top = 0;
                        break;
                    }
                    result.push(top.cls);
                    --clsCount;
                }
                if (top) {
                    for (i = 0, l = refs.length; i < l; ++i) {
                        top = refs[i];
                        if (!--top.count) {
                            roots.push(top);
                        }
                    }
                }
            }
            if (clsCount) {
                err("can't build consistent linearization", className);
            }
            base = bases[0];
            result[0] = base ? base._meta && base === result[result.length - base._meta.bases.length] ? base._meta.bases.length : 1 : 0;
            return result;
        }
        function inherited(args, a, f) {
            var name, chains, bases, caller, meta, base, proto, opf, pos, cache = this._inherited = this._inherited || {};
            if (typeof args == "string") {
                name = args;
                args = a;
                a = f;
            }
            f = 0;
            caller = args.callee;
            name = name || caller.nom;
            if (!name) {
                err("can't deduce a name to call inherited()", this.declaredClass);
            }
            meta = this.constructor._meta;
            bases = meta.bases;
            pos = cache.p;
            if (name != cname) {
                if (cache.c !== caller) {
                    pos = 0;
                    base = bases[0];
                    meta = base._meta;
                    if (meta.hidden[name] !== caller) {
                        chains = meta.chains;
                        if (chains && typeof chains[name] == "string") {
                            err("calling chained method with inherited: " + name, this.declaredClass);
                        }
                        do {
                            meta = base._meta;
                            proto = base.prototype;
                            if (meta && (proto[name] === caller && proto.hasOwnProperty(name) || meta.hidden[name] === caller)) {
                                break;
                            }
                        } while (base = bases[++pos]);
                        pos = base ? pos : -1;
                    }
                }
                base = bases[++pos];
                if (base) {
                    proto = base.prototype;
                    if (base._meta && proto.hasOwnProperty(name)) {
                        f = proto[name];
                    } else {
                        opf = op[name];
                        do {
                            proto = base.prototype;
                            f = proto[name];
                            if (f && (base._meta ? proto.hasOwnProperty(name) : f !== opf)) {
                                break;
                            }
                        } while (base = bases[++pos]);
                    }
                }
                f = base && f || op[name];
            } else {
                if (cache.c !== caller) {
                    pos = 0;
                    meta = bases[0]._meta;
                    if (meta && meta.ctor !== caller) {
                        chains = meta.chains;
                        if (!chains || chains.constructor !== "manual") {
                            err("calling chained constructor with inherited", this.declaredClass);
                        }
                        while (base = bases[++pos]) {
                            meta = base._meta;
                            if (meta && meta.ctor === caller) {
                                break;
                            }
                        }
                        pos = base ? pos : -1;
                    }
                }
                while (base = bases[++pos]) {
                    meta = base._meta;
                    f = meta ? meta.ctor : base;
                    if (f) {
                        break;
                    }
                }
                f = base && f;
            }
            cache.c = f;
            cache.p = pos;
            if (f) {
                return a === true ? f : f.apply(this, a || args);
            }
        }
        function getInherited(name, args) {
            if (typeof name == "string") {
                return this.__inherited(name, args, true);
            }
            return this.__inherited(name, true);
        }
        function inherited__debug(args, a1, a2) {
            var f = this.getInherited(args, a1);
            if (f) {
                return f.apply(this, a2 || a1 || args);
            }
        }
        var inheritedImpl = dojo.config.isDebug ? inherited__debug : inherited;
        function isInstanceOf(cls) {
            var bases = this.constructor._meta.bases;
            for (var i = 0, l = bases.length; i < l; ++i) {
                if (bases[i] === cls) {
                    return true;
                }
            }
            return this instanceof cls;
        }
        function mixOwn(target, source) {
            for (var name in source) {
                if (name != cname && source.hasOwnProperty(name)) {
                    target[name] = source[name];
                }
            }
            if (has("bug-for-in-skips-shadowed")) {
                for (var extraNames = lang._extraNames, i = extraNames.length; i; ) {
                    name = extraNames[--i];
                    if (name != cname && source.hasOwnProperty(name)) {
                        target[name] = source[name];
                    }
                }
            }
        }
        function safeMixin(target, source) {
            var name, t;
            for (name in source) {
                t = source[name];
                if ((t !== op[name] || !(name in op)) && name != cname) {
                    if (opts.call(t) == "[object Function]") {
                        t.nom = name;
                    }
                    target[name] = t;
                }
            }
            if (has("bug-for-in-skips-shadowed")) {
                for (var extraNames = lang._extraNames, i = extraNames.length; i; ) {
                    name = extraNames[--i];
                    t = source[name];
                    if ((t !== op[name] || !(name in op)) && name != cname) {
                        if (opts.call(t) == "[object Function]") {
                            t.nom = name;
                        }
                        target[name] = t;
                    }
                }
            }
            return target;
        }
        function extend(source) {
            declare.safeMixin(this.prototype, source);
            return this;
        }
        function createSubclass(mixins, props) {
            if (!(mixins instanceof Array || typeof mixins == "function")) {
                props = mixins;
                mixins = undefined;
            }
            props = props || {};
            mixins = mixins || [];
            return declare([this].concat(mixins), props);
        }
        function chainedConstructor(bases, ctorSpecial) {
            return function () {
                var a = arguments, args = a, a0 = a[0], f, i, m, l = bases.length, preArgs;
                if (!(this instanceof a.callee)) {
                    return applyNew(a);
                }
                if (ctorSpecial && (a0 && a0.preamble || this.preamble)) {
                    preArgs = new Array(bases.length);
                    preArgs[0] = a;
                    for (i = 0; ; ) {
                        a0 = a[0];
                        if (a0) {
                            f = a0.preamble;
                            if (f) {
                                a = f.apply(this, a) || a;
                            }
                        }
                        f = bases[i].prototype;
                        f = f.hasOwnProperty("preamble") && f.preamble;
                        if (f) {
                            a = f.apply(this, a) || a;
                        }
                        if (++i == l) {
                            break;
                        }
                        preArgs[i] = a;
                    }
                }
                for (i = l - 1; i >= 0; --i) {
                    f = bases[i];
                    m = f._meta;
                    f = m ? m.ctor : f;
                    if (f) {
                        f.apply(this, preArgs ? preArgs[i] : a);
                    }
                }
                f = this.postscript;
                if (f) {
                    f.apply(this, args);
                }
            };
        }
        function singleConstructor(ctor, ctorSpecial) {
            return function () {
                var a = arguments, t = a, a0 = a[0], f;
                if (!(this instanceof a.callee)) {
                    return applyNew(a);
                }
                if (ctorSpecial) {
                    if (a0) {
                        f = a0.preamble;
                        if (f) {
                            t = f.apply(this, t) || t;
                        }
                    }
                    f = this.preamble;
                    if (f) {
                        f.apply(this, t);
                    }
                }
                if (ctor) {
                    ctor.apply(this, a);
                }
                f = this.postscript;
                if (f) {
                    f.apply(this, a);
                }
            };
        }
        function simpleConstructor(bases) {
            return function () {
                var a = arguments, i = 0, f, m;
                if (!(this instanceof a.callee)) {
                    return applyNew(a);
                }
                for (; f = bases[i]; ++i) {
                    m = f._meta;
                    f = m ? m.ctor : f;
                    if (f) {
                        f.apply(this, a);
                        break;
                    }
                }
                f = this.postscript;
                if (f) {
                    f.apply(this, a);
                }
            };
        }
        function chain(name, bases, reversed) {
            return function () {
                var b, m, f, i = 0, step = 1;
                if (reversed) {
                    i = bases.length - 1;
                    step = -1;
                }
                for (; b = bases[i]; i += step) {
                    m = b._meta;
                    f = (m ? m.hidden : b.prototype)[name];
                    if (f) {
                        f.apply(this, arguments);
                    }
                }
            };
        }
        function forceNew(ctor) {
            xtor.prototype = ctor.prototype;
            var t = new xtor;
            xtor.prototype = null;
            return t;
        }
        function applyNew(args) {
            var ctor = args.callee, t = forceNew(ctor);
            ctor.apply(t, args);
            return t;
        }
        function declare(className, superclass, props) {
            if (typeof className != "string") {
                props = superclass;
                superclass = className;
                className = "";
            }
            props = props || {};
            var proto, i, t, ctor, name, bases, chains, mixins = 1, parents = superclass;
            if (opts.call(superclass) == "[object Array]") {
                bases = c3mro(superclass, className);
                t = bases[0];
                mixins = bases.length - t;
                superclass = bases[mixins];
            } else {
                bases = [0];
                if (superclass) {
                    if (opts.call(superclass) == "[object Function]") {
                        t = superclass._meta;
                        bases = bases.concat(t ? t.bases : superclass);
                    } else {
                        err("base class is not a callable constructor.", className);
                    }
                } else {
                    if (superclass !== null) {
                        err("unknown base class. Did you use dojo.require to pull it in?", className);
                    }
                }
            }
            if (superclass) {
                for (i = mixins - 1; ; --i) {
                    proto = forceNew(superclass);
                    if (!i) {
                        break;
                    }
                    t = bases[i];
                    (t._meta ? mixOwn : mix)(proto, t.prototype);
                    ctor = new Function;
                    ctor.superclass = superclass;
                    ctor.prototype = proto;
                    superclass = proto.constructor = ctor;
                }
            } else {
                proto = {};
            }
            declare.safeMixin(proto, props);
            t = props.constructor;
            if (t !== op.constructor) {
                t.nom = cname;
                proto.constructor = t;
            }
            for (i = mixins - 1; i; --i) {
                t = bases[i]._meta;
                if (t && t.chains) {
                    chains = mix(chains || {}, t.chains);
                }
            }
            if (proto["-chains-"]) {
                chains = mix(chains || {}, proto["-chains-"]);
            }
            t = !chains || !chains.hasOwnProperty(cname);
            bases[0] = ctor = (chains && chains.constructor === "manual") ? simpleConstructor(bases) : (bases.length == 1 ? singleConstructor(props.constructor, t) : chainedConstructor(bases, t));
            ctor._meta = {bases:bases, hidden:props, chains:chains, parents:parents, ctor:props.constructor};
            ctor.superclass = superclass && superclass.prototype;
            ctor.extend = extend;
            ctor.createSubclass = createSubclass;
            ctor.prototype = proto;
            proto.constructor = ctor;
            proto.getInherited = getInherited;
            proto.isInstanceOf = isInstanceOf;
            proto.inherited = inheritedImpl;
            proto.__inherited = inherited;
            if (className) {
                proto.declaredClass = className;
                lang.setObject(className, ctor);
            }
            if (chains) {
                for (name in chains) {
                    if (proto[name] && typeof chains[name] == "string" && name != cname) {
                        t = proto[name] = chain(name, bases, chains[name] === "after");
                        t.nom = name;
                    }
                }
            }
            return ctor;
        }
        dojo.safeMixin = declare.safeMixin = safeMixin;
        dojo.declare = declare;
        return declare;
    });
}, "dojo/cldr/supplemental":function () {
    define(["../_base/lang", "../i18n"], function (lang, i18n) {
        var supplemental = {};
        lang.setObject("dojo.cldr.supplemental", supplemental);
        supplemental.getFirstDayOfWeek = function (locale) {
            var firstDay = {bd:5, mv:5, ae:6, af:6, bh:6, dj:6, dz:6, eg:6, iq:6, ir:6, jo:6, kw:6, ly:6, ma:6, om:6, qa:6, sa:6, sd:6, sy:6, ye:6, ag:0, ar:0, as:0, au:0, br:0, bs:0, bt:0, bw:0, by:0, bz:0, ca:0, cn:0, co:0, dm:0, "do":0, et:0, gt:0, gu:0, hk:0, hn:0, id:0, ie:0, il:0, "in":0, jm:0, jp:0, ke:0, kh:0, kr:0, la:0, mh:0, mm:0, mo:0, mt:0, mx:0, mz:0, ni:0, np:0, nz:0, pa:0, pe:0, ph:0, pk:0, pr:0, py:0, sg:0, sv:0, th:0, tn:0, tt:0, tw:0, um:0, us:0, ve:0, vi:0, ws:0, za:0, zw:0};
            var country = supplemental._region(locale);
            var dow = firstDay[country];
            return (dow === undefined) ? 1 : dow;
        };
        supplemental._region = function (locale) {
            locale = i18n.normalizeLocale(locale);
            var tags = locale.split("-");
            var region = tags[1];
            if (!region) {
                region = {aa:"et", ab:"ge", af:"za", ak:"gh", am:"et", ar:"eg", as:"in", av:"ru", ay:"bo", az:"az", ba:"ru", be:"by", bg:"bg", bi:"vu", bm:"ml", bn:"bd", bo:"cn", br:"fr", bs:"ba", ca:"es", ce:"ru", ch:"gu", co:"fr", cr:"ca", cs:"cz", cv:"ru", cy:"gb", da:"dk", de:"de", dv:"mv", dz:"bt", ee:"gh", el:"gr", en:"us", es:"es", et:"ee", eu:"es", fa:"ir", ff:"sn", fi:"fi", fj:"fj", fo:"fo", fr:"fr", fy:"nl", ga:"ie", gd:"gb", gl:"es", gn:"py", gu:"in", gv:"gb", ha:"ng", he:"il", hi:"in", ho:"pg", hr:"hr", ht:"ht", hu:"hu", hy:"am", ia:"fr", id:"id", ig:"ng", ii:"cn", ik:"us", "in":"id", is:"is", it:"it", iu:"ca", iw:"il", ja:"jp", ji:"ua", jv:"id", jw:"id", ka:"ge", kg:"cd", ki:"ke", kj:"na", kk:"kz", kl:"gl", km:"kh", kn:"in", ko:"kr", ks:"in", ku:"tr", kv:"ru", kw:"gb", ky:"kg", la:"va", lb:"lu", lg:"ug", li:"nl", ln:"cd", lo:"la", lt:"lt", lu:"cd", lv:"lv", mg:"mg", mh:"mh", mi:"nz", mk:"mk", ml:"in", mn:"mn", mo:"ro", mr:"in", ms:"my", mt:"mt", my:"mm", na:"nr", nb:"no", nd:"zw", ne:"np", ng:"na", nl:"nl", nn:"no", no:"no", nr:"za", nv:"us", ny:"mw", oc:"fr", om:"et", or:"in", os:"ge", pa:"in", pl:"pl", ps:"af", pt:"br", qu:"pe", rm:"ch", rn:"bi", ro:"ro", ru:"ru", rw:"rw", sa:"in", sd:"in", se:"no", sg:"cf", si:"lk", sk:"sk", sl:"si", sm:"ws", sn:"zw", so:"so", sq:"al", sr:"rs", ss:"za", st:"za", su:"id", sv:"se", sw:"tz", ta:"in", te:"in", tg:"tj", th:"th", ti:"et", tk:"tm", tl:"ph", tn:"za", to:"to", tr:"tr", ts:"za", tt:"ru", ty:"pf", ug:"cn", uk:"ua", ur:"pk", uz:"uz", ve:"za", vi:"vn", wa:"be", wo:"sn", xh:"za", yi:"il", yo:"ng", za:"cn", zh:"cn", zu:"za", ace:"id", ady:"ru", agq:"cm", alt:"ru", amo:"ng", asa:"tz", ast:"es", awa:"in", bal:"pk", ban:"id", bas:"cm", bax:"cm", bbc:"id", bem:"zm", bez:"tz", bfq:"in", bft:"pk", bfy:"in", bhb:"in", bho:"in", bik:"ph", bin:"ng", bjj:"in", bku:"ph", bqv:"ci", bra:"in", brx:"in", bss:"cm", btv:"pk", bua:"ru", buc:"yt", bug:"id", bya:"id", byn:"er", cch:"ng", ccp:"in", ceb:"ph", cgg:"ug", chk:"fm", chm:"ru", chp:"ca", chr:"us", cja:"kh", cjm:"vn", ckb:"iq", crk:"ca", csb:"pl", dar:"ru", dav:"ke", den:"ca", dgr:"ca", dje:"ne", doi:"in", dsb:"de", dua:"cm", dyo:"sn", dyu:"bf", ebu:"ke", efi:"ng", ewo:"cm", fan:"gq", fil:"ph", fon:"bj", fur:"it", gaa:"gh", gag:"md", gbm:"in", gcr:"gf", gez:"et", gil:"ki", gon:"in", gor:"id", grt:"in", gsw:"ch", guz:"ke", gwi:"ca", haw:"us", hil:"ph", hne:"in", hnn:"ph", hoc:"in", hoj:"in", ibb:"ng", ilo:"ph", inh:"ru", jgo:"cm", jmc:"tz", kaa:"uz", kab:"dz", kaj:"ng", kam:"ke", kbd:"ru", kcg:"ng", kde:"tz", kdt:"th", kea:"cv", ken:"cm", kfo:"ci", kfr:"in", kha:"in", khb:"cn", khq:"ml", kht:"in", kkj:"cm", kln:"ke", kmb:"ao", koi:"ru", kok:"in", kos:"fm", kpe:"lr", krc:"ru", kri:"sl", krl:"ru", kru:"in", ksb:"tz", ksf:"cm", ksh:"de", kum:"ru", lag:"tz", lah:"pk", lbe:"ru", lcp:"cn", lep:"in", lez:"ru", lif:"np", lis:"cn", lki:"ir", lmn:"in", lol:"cd", lua:"cd", luo:"ke", luy:"ke", lwl:"th", mad:"id", mag:"in", mai:"in", mak:"id", man:"gn", mas:"ke", mdf:"ru", mdh:"ph", mdr:"id", men:"sl", mer:"ke", mfe:"mu", mgh:"mz", mgo:"cm", min:"id", mni:"in", mnk:"gm", mnw:"mm", mos:"bf", mua:"cm", mwr:"in", myv:"ru", nap:"it", naq:"na", nds:"de", "new":"np", niu:"nu", nmg:"cm", nnh:"cm", nod:"th", nso:"za", nus:"sd", nym:"tz", nyn:"ug", pag:"ph", pam:"ph", pap:"bq", pau:"pw", pon:"fm", prd:"ir", raj:"in", rcf:"re", rej:"id", rjs:"np", rkt:"in", rof:"tz", rwk:"tz", saf:"gh", sah:"ru", saq:"ke", sas:"id", sat:"in", saz:"in", sbp:"tz", scn:"it", sco:"gb", sdh:"ir", seh:"mz", ses:"ml", shi:"ma", shn:"mm", sid:"et", sma:"se", smj:"se", smn:"fi", sms:"fi", snk:"ml", srn:"sr", srr:"sn", ssy:"er", suk:"tz", sus:"gn", swb:"yt", swc:"cd", syl:"bd", syr:"sy", tbw:"ph", tcy:"in", tdd:"cn", tem:"sl", teo:"ug", tet:"tl", tig:"er", tiv:"ng", tkl:"tk", tmh:"ne", tpi:"pg", trv:"tw", tsg:"ph", tts:"th", tum:"mw", tvl:"tv", twq:"ne", tyv:"ru", tzm:"ma", udm:"ru", uli:"fm", umb:"ao", unr:"in", unx:"in", vai:"lr", vun:"tz", wae:"ch", wal:"et", war:"ph", xog:"ug", xsr:"np", yao:"mz", yap:"fm", yav:"cm", zza:"tr"}[tags[0]];
            } else {
                if (region.length == 4) {
                    region = tags[2];
                }
            }
            return region;
        };
        supplemental.getWeekend = function (locale) {
            var weekendStart = {"in":0, af:4, dz:4, ir:4, om:4, sa:4, ye:4, ae:5, bh:5, eg:5, il:5, iq:5, jo:5, kw:5, ly:5, ma:5, qa:5, sd:5, sy:5, tn:5}, weekendEnd = {af:5, dz:5, ir:5, om:5, sa:5, ye:5, ae:6, bh:5, eg:6, il:6, iq:6, jo:6, kw:6, ly:6, ma:6, qa:6, sd:6, sy:6, tn:6}, country = supplemental._region(locale), start = weekendStart[country], end = weekendEnd[country];
            if (start === undefined) {
                start = 6;
            }
            if (end === undefined) {
                end = 0;
            }
            return {start:start, end:end};
        };
        return supplemental;
    });
}, "dojox/main":function () {
    define(["dojo/_base/kernel"], function (dojo) {
        return dojo.dojox;
    });
}, "dojo/dom":function () {
    define(["./sniff", "./_base/window"], function (has, win) {
        if (has("ie") <= 7) {
            try {
                document.execCommand("BackgroundImageCache", false, true);
            }
            catch (e) {
            }
        }
        var dom = {};
        if (has("ie")) {
            dom.byId = function (id, doc) {
                if (typeof id != "string") {
                    return id;
                }
                var _d = doc || win.doc, te = id && _d.getElementById(id);
                if (te && (te.attributes.id.value == id || te.id == id)) {
                    return te;
                } else {
                    var eles = _d.all[id];
                    if (!eles || eles.nodeName) {
                        eles = [eles];
                    }
                    var i = 0;
                    while ((te = eles[i++])) {
                        if ((te.attributes && te.attributes.id && te.attributes.id.value == id) || te.id == id) {
                            return te;
                        }
                    }
                }
            };
        } else {
            dom.byId = function (id, doc) {
                return ((typeof id == "string") ? (doc || win.doc).getElementById(id) : id) || null;
            };
        }
        dom.isDescendant = function (node, ancestor) {
            try {
                node = dom.byId(node);
                ancestor = dom.byId(ancestor);
                while (node) {
                    if (node == ancestor) {
                        return true;
                    }
                    node = node.parentNode;
                }
            }
            catch (e) {
            }
            return false;
        };
        has.add("css-user-select", function (global, doc, element) {
            if (!element) {
                return false;
            }
            var style = element.style;
            var prefixes = ["Khtml", "O", "Moz", "Webkit"], i = prefixes.length, name = "userSelect", prefix;
            do {
                if (typeof style[name] !== "undefined") {
                    return name;
                }
            } while (i-- && (name = prefixes[i] + "UserSelect"));
            return false;
        });
        var cssUserSelect = has("css-user-select");
        dom.setSelectable = cssUserSelect ? function (node, selectable) {
            dom.byId(node).style[cssUserSelect] = selectable ? "" : "none";
        } : function (node, selectable) {
            node = dom.byId(node);
            var nodes = node.getElementsByTagName("*"), i = nodes.length;
            if (selectable) {
                node.removeAttribute("unselectable");
                while (i--) {
                    nodes[i].removeAttribute("unselectable");
                }
            } else {
                node.setAttribute("unselectable", "on");
                while (i--) {
                    nodes[i].setAttribute("unselectable", "on");
                }
            }
        };
        return dom;
    });
}, "dojo/touch":function () {
    define(["./_base/kernel", "./aspect", "./dom", "./dom-class", "./_base/lang", "./on", "./has", "./mouse", "./domReady", "./_base/window"], function (dojo, aspect, dom, domClass, lang, on, has, mouse, domReady, win) {
        var ios4 = has("ios") < 5;
        var hasPointer = has("pointer-events") || has("MSPointer"), pointer = (function () {
            var pointer = {};
            for (var type in {down:1, move:1, up:1, cancel:1, over:1, out:1}) {
                pointer[type] = has("MSPointer") ? "MSPointer" + type.charAt(0).toUpperCase() + type.slice(1) : "pointer" + type;
            }
            return pointer;
        })();
        var hasTouch = has("touch-events");
        var clicksInited, clickTracker, useTarget = false, clickTarget, clickX, clickY, clickDx, clickDy, clickTime;
        var lastTouch;
        function dualEvent(mouseType, touchType, pointerType) {
            if (hasPointer && pointerType) {
                return function (node, listener) {
                    return on(node, pointerType, listener);
                };
            } else {
                if (hasTouch) {
                    return function (node, listener) {
                        var handle1 = on(node, touchType, function (evt) {
                            listener.call(this, evt);
                            lastTouch = (new Date()).getTime();
                        }), handle2 = on(node, mouseType, function (evt) {
                            if (!lastTouch || (new Date()).getTime() > lastTouch + 1000) {
                                listener.call(this, evt);
                            }
                        });
                        return {remove:function () {
                            handle1.remove();
                            handle2.remove();
                        }};
                    };
                } else {
                    return function (node, listener) {
                        return on(node, mouseType, listener);
                    };
                }
            }
        }
        function marked(node) {
            do {
                if (node.dojoClick !== undefined) {
                    return node;
                }
            } while (node = node.parentNode);
        }
        function doClicks(e, moveType, endType) {
            var markedNode = marked(e.target);
            clickTracker = !e.target.disabled && markedNode && markedNode.dojoClick;
            if (clickTracker) {
                useTarget = (clickTracker == "useTarget");
                clickTarget = (useTarget ? markedNode : e.target);
                if (useTarget) {
                    e.preventDefault();
                }
                clickX = e.changedTouches ? e.changedTouches[0].pageX - win.global.pageXOffset : e.clientX;
                clickY = e.changedTouches ? e.changedTouches[0].pageY - win.global.pageYOffset : e.clientY;
                clickDx = (typeof clickTracker == "object" ? clickTracker.x : (typeof clickTracker == "number" ? clickTracker : 0)) || 4;
                clickDy = (typeof clickTracker == "object" ? clickTracker.y : (typeof clickTracker == "number" ? clickTracker : 0)) || 4;
                if (!clicksInited) {
                    clicksInited = true;
                    function updateClickTracker(e) {
                        if (useTarget) {
                            clickTracker = dom.isDescendant(win.doc.elementFromPoint((e.changedTouches ? e.changedTouches[0].pageX - win.global.pageXOffset : e.clientX), (e.changedTouches ? e.changedTouches[0].pageY - win.global.pageYOffset : e.clientY)), clickTarget);
                        } else {
                            clickTracker = clickTracker && (e.changedTouches ? e.changedTouches[0].target : e.target) == clickTarget && Math.abs((e.changedTouches ? e.changedTouches[0].pageX - win.global.pageXOffset : e.clientX) - clickX) <= clickDx && Math.abs((e.changedTouches ? e.changedTouches[0].pageY - win.global.pageYOffset : e.clientY) - clickY) <= clickDy;
                        }
                    }
                    win.doc.addEventListener(moveType, function (e) {
                        updateClickTracker(e);
                        if (useTarget) {
                            e.preventDefault();
                        }
                    }, true);
                    win.doc.addEventListener(endType, function (e) {
                        updateClickTracker(e);
                        if (clickTracker) {
                            clickTime = (new Date()).getTime();
                            var target = (useTarget ? clickTarget : e.target);
                            if (target.tagName === "LABEL") {
                                target = dom.byId(target.getAttribute("for")) || target;
                            }
                            var src = (e.changedTouches) ? e.changedTouches[0] : e;
                            var clickEvt = document.createEvent("MouseEvents");
                            clickEvt._dojo_click = true;
                            clickEvt.initMouseEvent("click", true, true, e.view, e.detail, src.screenX, src.screenY, src.clientX, src.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);
                            setTimeout(function () {
                                on.emit(target, "click", clickEvt);
                                clickTime = (new Date()).getTime();
                            }, 0);
                        }
                    }, true);
                    function stopNativeEvents(type) {
                        win.doc.addEventListener(type, function (e) {
                            if (!e._dojo_click && (new Date()).getTime() <= clickTime + 1000 && !(e.target.tagName == "INPUT" && domClass.contains(e.target, "dijitOffScreen"))) {
                                e.stopPropagation();
                                e.stopImmediatePropagation && e.stopImmediatePropagation();
                                if (type == "click" && (e.target.tagName != "INPUT" || e.target.type == "radio" || e.target.type == "checkbox") && e.target.tagName != "TEXTAREA" && e.target.tagName != "AUDIO" && e.target.tagName != "VIDEO") {
                                    e.preventDefault();
                                }
                            }
                        }, true);
                    }
                    stopNativeEvents("click");
                    stopNativeEvents("mousedown");
                    stopNativeEvents("mouseup");
                }
            }
        }
        var hoveredNode;
        if (hasPointer) {
            domReady(function () {
                win.doc.addEventListener(pointer.down, function (evt) {
                    doClicks(evt, pointer.move, pointer.up);
                }, true);
            });
        } else {
            if (hasTouch) {
                domReady(function () {
                    hoveredNode = win.body();
                    win.doc.addEventListener("touchstart", function (evt) {
                        lastTouch = (new Date()).getTime();
                        var oldNode = hoveredNode;
                        hoveredNode = evt.target;
                        on.emit(oldNode, "dojotouchout", {relatedTarget:hoveredNode, bubbles:true});
                        on.emit(hoveredNode, "dojotouchover", {relatedTarget:oldNode, bubbles:true});
                        doClicks(evt, "touchmove", "touchend");
                    }, true);
                    function copyEventProps(evt) {
                        var props = lang.delegate(evt, {bubbles:true});
                        if (has("ios") >= 6) {
                            props.touches = evt.touches;
                            props.altKey = evt.altKey;
                            props.changedTouches = evt.changedTouches;
                            props.ctrlKey = evt.ctrlKey;
                            props.metaKey = evt.metaKey;
                            props.shiftKey = evt.shiftKey;
                            props.targetTouches = evt.targetTouches;
                        }
                        return props;
                    }
                    on(win.doc, "touchmove", function (evt) {
                        lastTouch = (new Date()).getTime();
                        var newNode = win.doc.elementFromPoint(evt.pageX - (ios4 ? 0 : win.global.pageXOffset), evt.pageY - (ios4 ? 0 : win.global.pageYOffset));
                        if (newNode) {
                            if (hoveredNode !== newNode) {
                                on.emit(hoveredNode, "dojotouchout", {relatedTarget:newNode, bubbles:true});
                                on.emit(newNode, "dojotouchover", {relatedTarget:hoveredNode, bubbles:true});
                                hoveredNode = newNode;
                            }
                            if (!on.emit(newNode, "dojotouchmove", copyEventProps(evt))) {
                                evt.preventDefault();
                            }
                        }
                    });
                    on(win.doc, "touchend", function (evt) {
                        lastTouch = (new Date()).getTime();
                        var node = win.doc.elementFromPoint(evt.pageX - (ios4 ? 0 : win.global.pageXOffset), evt.pageY - (ios4 ? 0 : win.global.pageYOffset)) || win.body();
                        on.emit(node, "dojotouchend", copyEventProps(evt));
                    });
                });
            }
        }
        var touch = {press:dualEvent("mousedown", "touchstart", pointer.down), move:dualEvent("mousemove", "dojotouchmove", pointer.move), release:dualEvent("mouseup", "dojotouchend", pointer.up), cancel:dualEvent(mouse.leave, "touchcancel", hasPointer ? pointer.cancel : null), over:dualEvent("mouseover", "dojotouchover", pointer.over), out:dualEvent("mouseout", "dojotouchout", pointer.out), enter:mouse._eventHandler(dualEvent("mouseover", "dojotouchover", pointer.over)), leave:mouse._eventHandler(dualEvent("mouseout", "dojotouchout", pointer.out))};
        1 && (dojo.touch = touch);
        return touch;
    });
}, "dojo/_base/browser":function () {
    if (require.has) {
        require.has.add("config-selectorEngine", "acme");
    }
    define(["../ready", "./kernel", "./connect", "./unload", "./window", "./event", "./html", "./NodeList", "../query", "./xhr", "./fx"], function (dojo) {
        return dojo;
    });
}, "dojo/dom-style":function () {
    define(["./sniff", "./dom"], function (has, dom) {
        var getComputedStyle, style = {};
        if (has("webkit")) {
            getComputedStyle = function (node) {
                var s;
                if (node.nodeType == 1) {
                    var dv = node.ownerDocument.defaultView;
                    s = dv.getComputedStyle(node, null);
                    if (!s && node.style) {
                        node.style.display = "";
                        s = dv.getComputedStyle(node, null);
                    }
                }
                return s || {};
            };
        } else {
            if (has("ie") && (has("ie") < 9 || has("quirks"))) {
                getComputedStyle = function (node) {
                    return node.nodeType == 1 && node.currentStyle ? node.currentStyle : {};
                };
            } else {
                getComputedStyle = function (node) {
                    return node.nodeType == 1 ? node.ownerDocument.defaultView.getComputedStyle(node, null) : {};
                };
            }
        }
        style.getComputedStyle = getComputedStyle;
        var toPixel;
        if (!has("ie")) {
            toPixel = function (element, value) {
                return parseFloat(value) || 0;
            };
        } else {
            toPixel = function (element, avalue) {
                if (!avalue) {
                    return 0;
                }
                if (avalue == "medium") {
                    return 4;
                }
                if (avalue.slice && avalue.slice(-2) == "px") {
                    return parseFloat(avalue);
                }
                var s = element.style, rs = element.runtimeStyle, cs = element.currentStyle, sLeft = s.left, rsLeft = rs.left;
                rs.left = cs.left;
                try {
                    s.left = avalue;
                    avalue = s.pixelLeft;
                }
                catch (e) {
                    avalue = 0;
                }
                s.left = sLeft;
                rs.left = rsLeft;
                return avalue;
            };
        }
        style.toPixelValue = toPixel;
        var astr = "DXImageTransform.Microsoft.Alpha";
        var af = function (n, f) {
            try {
                return n.filters.item(astr);
            }
            catch (e) {
                return f ? {} : null;
            }
        };
        var _getOpacity = has("ie") < 9 || (has("ie") < 10 && has("quirks")) ? function (node) {
            try {
                return af(node).Opacity / 100;
            }
            catch (e) {
                return 1;
            }
        } : function (node) {
            return getComputedStyle(node).opacity;
        };
        var _setOpacity = has("ie") < 9 || (has("ie") < 10 && has("quirks")) ? function (node, opacity) {
            if (opacity === "") {
                opacity = 1;
            }
            var ov = opacity * 100, fullyOpaque = opacity === 1;
            if (fullyOpaque) {
                node.style.zoom = "";
                if (af(node)) {
                    node.style.filter = node.style.filter.replace(new RegExp("\\s*progid:" + astr + "\\([^\\)]+?\\)", "i"), "");
                }
            } else {
                node.style.zoom = 1;
                if (af(node)) {
                    af(node, 1).Opacity = ov;
                } else {
                    node.style.filter += " progid:" + astr + "(Opacity=" + ov + ")";
                }
                af(node, 1).Enabled = true;
            }
            if (node.tagName.toLowerCase() == "tr") {
                for (var td = node.firstChild; td; td = td.nextSibling) {
                    if (td.tagName.toLowerCase() == "td") {
                        _setOpacity(td, opacity);
                    }
                }
            }
            return opacity;
        } : function (node, opacity) {
            return node.style.opacity = opacity;
        };
        var _pixelNamesCache = {left:true, top:true};
        var _pixelRegExp = /margin|padding|width|height|max|min|offset/;
        function _toStyleValue(node, type, value) {
            type = type.toLowerCase();
            if (has("ie") || has("trident")) {
                if (value == "auto") {
                    if (type == "height") {
                        return node.offsetHeight;
                    }
                    if (type == "width") {
                        return node.offsetWidth;
                    }
                }
                if (type == "fontweight") {
                    switch (value) {
                      case 700:
                        return "bold";
                      case 400:
                      default:
                        return "normal";
                    }
                }
            }
            if (!(type in _pixelNamesCache)) {
                _pixelNamesCache[type] = _pixelRegExp.test(type);
            }
            return _pixelNamesCache[type] ? toPixel(node, value) : value;
        }
        var _floatAliases = {cssFloat:1, styleFloat:1, "float":1};
        style.get = function getStyle(node, name) {
            var n = dom.byId(node), l = arguments.length, op = (name == "opacity");
            if (l == 2 && op) {
                return _getOpacity(n);
            }
            name = _floatAliases[name] ? "cssFloat" in n.style ? "cssFloat" : "styleFloat" : name;
            var s = style.getComputedStyle(n);
            return (l == 1) ? s : _toStyleValue(n, name, s[name] || n.style[name]);
        };
        style.set = function setStyle(node, name, value) {
            var n = dom.byId(node), l = arguments.length, op = (name == "opacity");
            name = _floatAliases[name] ? "cssFloat" in n.style ? "cssFloat" : "styleFloat" : name;
            if (l == 3) {
                return op ? _setOpacity(n, value) : n.style[name] = value;
            }
            for (var x in name) {
                style.set(node, x, name[x]);
            }
            return style.getComputedStyle(n);
        };
        return style;
    });
}, "dojo/dom-geometry":function () {
    define(["./sniff", "./_base/window", "./dom", "./dom-style"], function (has, win, dom, style) {
        var geom = {};
        geom.boxModel = "content-box";
        if (has("ie")) {
            geom.boxModel = document.compatMode == "BackCompat" ? "border-box" : "content-box";
        }
        geom.getPadExtents = function getPadExtents(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), px = style.toPixelValue, l = px(node, s.paddingLeft), t = px(node, s.paddingTop), r = px(node, s.paddingRight), b = px(node, s.paddingBottom);
            return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
        };
        var none = "none";
        geom.getBorderExtents = function getBorderExtents(node, computedStyle) {
            node = dom.byId(node);
            var px = style.toPixelValue, s = computedStyle || style.getComputedStyle(node), l = s.borderLeftStyle != none ? px(node, s.borderLeftWidth) : 0, t = s.borderTopStyle != none ? px(node, s.borderTopWidth) : 0, r = s.borderRightStyle != none ? px(node, s.borderRightWidth) : 0, b = s.borderBottomStyle != none ? px(node, s.borderBottomWidth) : 0;
            return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
        };
        geom.getPadBorderExtents = function getPadBorderExtents(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), p = geom.getPadExtents(node, s), b = geom.getBorderExtents(node, s);
            return {l:p.l + b.l, t:p.t + b.t, r:p.r + b.r, b:p.b + b.b, w:p.w + b.w, h:p.h + b.h};
        };
        geom.getMarginExtents = function getMarginExtents(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), px = style.toPixelValue, l = px(node, s.marginLeft), t = px(node, s.marginTop), r = px(node, s.marginRight), b = px(node, s.marginBottom);
            return {l:l, t:t, r:r, b:b, w:l + r, h:t + b};
        };
        geom.getMarginBox = function getMarginBox(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), me = geom.getMarginExtents(node, s), l = node.offsetLeft - me.l, t = node.offsetTop - me.t, p = node.parentNode, px = style.toPixelValue, pcs;
            if (has("mozilla")) {
                var sl = parseFloat(s.left), st = parseFloat(s.top);
                if (!isNaN(sl) && !isNaN(st)) {
                    l = sl;
                    t = st;
                } else {
                    if (p && p.style) {
                        pcs = style.getComputedStyle(p);
                        if (pcs.overflow != "visible") {
                            l += pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
                            t += pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
                        }
                    }
                }
            } else {
                if (has("opera") || (has("ie") == 8 && !has("quirks"))) {
                    if (p) {
                        pcs = style.getComputedStyle(p);
                        l -= pcs.borderLeftStyle != none ? px(node, pcs.borderLeftWidth) : 0;
                        t -= pcs.borderTopStyle != none ? px(node, pcs.borderTopWidth) : 0;
                    }
                }
            }
            return {l:l, t:t, w:node.offsetWidth + me.w, h:node.offsetHeight + me.h};
        };
        geom.getContentBox = function getContentBox(node, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), w = node.clientWidth, h, pe = geom.getPadExtents(node, s), be = geom.getBorderExtents(node, s);
            if (!w) {
                w = node.offsetWidth;
                h = node.offsetHeight;
            } else {
                h = node.clientHeight;
                be.w = be.h = 0;
            }
            if (has("opera")) {
                pe.l += be.l;
                pe.t += be.t;
            }
            return {l:pe.l, t:pe.t, w:w - pe.w - be.w, h:h - pe.h - be.h};
        };
        function setBox(node, l, t, w, h, u) {
            u = u || "px";
            var s = node.style;
            if (!isNaN(l)) {
                s.left = l + u;
            }
            if (!isNaN(t)) {
                s.top = t + u;
            }
            if (w >= 0) {
                s.width = w + u;
            }
            if (h >= 0) {
                s.height = h + u;
            }
        }
        function isButtonTag(node) {
            return node.tagName.toLowerCase() == "button" || node.tagName.toLowerCase() == "input" && (node.getAttribute("type") || "").toLowerCase() == "button";
        }
        function usesBorderBox(node) {
            return geom.boxModel == "border-box" || node.tagName.toLowerCase() == "table" || isButtonTag(node);
        }
        geom.setContentSize = function setContentSize(node, box, computedStyle) {
            node = dom.byId(node);
            var w = box.w, h = box.h;
            if (usesBorderBox(node)) {
                var pb = geom.getPadBorderExtents(node, computedStyle);
                if (w >= 0) {
                    w += pb.w;
                }
                if (h >= 0) {
                    h += pb.h;
                }
            }
            setBox(node, NaN, NaN, w, h);
        };
        var nilExtents = {l:0, t:0, w:0, h:0};
        geom.setMarginBox = function setMarginBox(node, box, computedStyle) {
            node = dom.byId(node);
            var s = computedStyle || style.getComputedStyle(node), w = box.w, h = box.h, pb = usesBorderBox(node) ? nilExtents : geom.getPadBorderExtents(node, s), mb = geom.getMarginExtents(node, s);
            if (has("webkit")) {
                if (isButtonTag(node)) {
                    var ns = node.style;
                    if (w >= 0 && !ns.width) {
                        ns.width = "4px";
                    }
                    if (h >= 0 && !ns.height) {
                        ns.height = "4px";
                    }
                }
            }
            if (w >= 0) {
                w = Math.max(w - pb.w - mb.w, 0);
            }
            if (h >= 0) {
                h = Math.max(h - pb.h - mb.h, 0);
            }
            setBox(node, box.l, box.t, w, h);
        };
        geom.isBodyLtr = function isBodyLtr(doc) {
            doc = doc || win.doc;
            return (win.body(doc).dir || doc.documentElement.dir || "ltr").toLowerCase() == "ltr";
        };
        geom.docScroll = function docScroll(doc) {
            doc = doc || win.doc;
            var node = win.doc.parentWindow || win.doc.defaultView;
            return "pageXOffset" in node ? {x:node.pageXOffset, y:node.pageYOffset} : (node = has("quirks") ? win.body(doc) : doc.documentElement) && {x:geom.fixIeBiDiScrollLeft(node.scrollLeft || 0, doc), y:node.scrollTop || 0};
        };
        if (has("ie")) {
            geom.getIeDocumentElementOffset = function getIeDocumentElementOffset(doc) {
                doc = doc || win.doc;
                var de = doc.documentElement;
                if (has("ie") < 8) {
                    var r = de.getBoundingClientRect(), l = r.left, t = r.top;
                    if (has("ie") < 7) {
                        l += de.clientLeft;
                        t += de.clientTop;
                    }
                    return {x:l < 0 ? 0 : l, y:t < 0 ? 0 : t};
                } else {
                    return {x:0, y:0};
                }
            };
        }
        geom.fixIeBiDiScrollLeft = function fixIeBiDiScrollLeft(scrollLeft, doc) {
            doc = doc || win.doc;
            var ie = has("ie");
            if (ie && !geom.isBodyLtr(doc)) {
                var qk = has("quirks"), de = qk ? win.body(doc) : doc.documentElement, pwin = win.global;
                if (ie == 6 && !qk && pwin.frameElement && de.scrollHeight > de.clientHeight) {
                    scrollLeft += de.clientLeft;
                }
                return (ie < 8 || qk) ? (scrollLeft + de.clientWidth - de.scrollWidth) : -scrollLeft;
            }
            return scrollLeft;
        };
        geom.position = function (node, includeScroll) {
            node = dom.byId(node);
            var db = win.body(node.ownerDocument), ret = node.getBoundingClientRect();
            ret = {x:ret.left, y:ret.top, w:ret.right - ret.left, h:ret.bottom - ret.top};
            if (has("ie") < 9) {
                var offset = geom.getIeDocumentElementOffset(node.ownerDocument);
                ret.x -= offset.x + (has("quirks") ? db.clientLeft + db.offsetLeft : 0);
                ret.y -= offset.y + (has("quirks") ? db.clientTop + db.offsetTop : 0);
            }
            if (includeScroll) {
                var scroll = geom.docScroll(node.ownerDocument);
                ret.x += scroll.x;
                ret.y += scroll.y;
            }
            return ret;
        };
        geom.getMarginSize = function getMarginSize(node, computedStyle) {
            node = dom.byId(node);
            var me = geom.getMarginExtents(node, computedStyle || style.getComputedStyle(node));
            var size = node.getBoundingClientRect();
            return {w:(size.right - size.left) + me.w, h:(size.bottom - size.top) + me.h};
        };
        geom.normalizeEvent = function (event) {
            if (!("layerX" in event)) {
                event.layerX = event.offsetX;
                event.layerY = event.offsetY;
            }
            if (!has("dom-addeventlistener")) {
                var se = event.target;
                var doc = (se && se.ownerDocument) || document;
                var docBody = has("quirks") ? doc.body : doc.documentElement;
                var offset = geom.getIeDocumentElementOffset(doc);
                event.pageX = event.clientX + geom.fixIeBiDiScrollLeft(docBody.scrollLeft || 0, doc) - offset.x;
                event.pageY = event.clientY + (docBody.scrollTop || 0) - offset.y;
            }
        };
        return geom;
    });
}, "dojo/Stateful":function () {
    define(["./_base/declare", "./_base/lang", "./_base/array", "./when"], function (declare, lang, array, when) {
        return declare("dojo.Stateful", null, {_attrPairNames:{}, _getAttrNames:function (name) {
            var apn = this._attrPairNames;
            if (apn[name]) {
                return apn[name];
            }
            return (apn[name] = {s:"_" + name + "Setter", g:"_" + name + "Getter"});
        }, postscript:function (params) {
            if (params) {
                this.set(params);
            }
        }, _get:function (name, names) {
            return typeof this[names.g] === "function" ? this[names.g]() : this[name];
        }, get:function (name) {
            return this._get(name, this._getAttrNames(name));
        }, set:function (name, value) {
            if (typeof name === "object") {
                for (var x in name) {
                    if (name.hasOwnProperty(x) && x != "_watchCallbacks") {
                        this.set(x, name[x]);
                    }
                }
                return this;
            }
            var names = this._getAttrNames(name), oldValue = this._get(name, names), setter = this[names.s], result;
            if (typeof setter === "function") {
                result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                this[name] = value;
            }
            if (this._watchCallbacks) {
                var self = this;
                when(result, function () {
                    self._watchCallbacks(name, oldValue, value);
                });
            }
            return this;
        }, _changeAttrValue:function (name, value) {
            var oldValue = this.get(name);
            this[name] = value;
            if (this._watchCallbacks) {
                this._watchCallbacks(name, oldValue, value);
            }
            return this;
        }, watch:function (name, callback) {
            var callbacks = this._watchCallbacks;
            if (!callbacks) {
                var self = this;
                callbacks = this._watchCallbacks = function (name, oldValue, value, ignoreCatchall) {
                    var notify = function (propertyCallbacks) {
                        if (propertyCallbacks) {
                            propertyCallbacks = propertyCallbacks.slice();
                            for (var i = 0, l = propertyCallbacks.length; i < l; i++) {
                                propertyCallbacks[i].call(self, name, oldValue, value);
                            }
                        }
                    };
                    notify(callbacks["_" + name]);
                    if (!ignoreCatchall) {
                        notify(callbacks["*"]);
                    }
                };
            }
            if (!callback && typeof name === "function") {
                callback = name;
                name = "*";
            } else {
                name = "_" + name;
            }
            var propertyCallbacks = callbacks[name];
            if (typeof propertyCallbacks !== "object") {
                propertyCallbacks = callbacks[name] = [];
            }
            propertyCallbacks.push(callback);
            var handle = {};
            handle.unwatch = handle.remove = function () {
                var index = array.indexOf(propertyCallbacks, callback);
                if (index > -1) {
                    propertyCallbacks.splice(index, 1);
                }
            };
            return handle;
        }});
    });
}, "dojo/dom-prop":function () {
    define(["exports", "./_base/kernel", "./sniff", "./_base/lang", "./dom", "./dom-style", "./dom-construct", "./_base/connect"], function (exports, dojo, has, lang, dom, style, ctr, conn) {
        var _evtHdlrMap = {}, _ctr = 0, _attrId = dojo._scopeName + "attrid";
        has.add("dom-textContent", function (global, doc, element) {
            return "textContent" in element;
        });
        exports.names = {"class":"className", "for":"htmlFor", tabindex:"tabIndex", readonly:"readOnly", colspan:"colSpan", frameborder:"frameBorder", rowspan:"rowSpan", textcontent:"textContent", valuetype:"valueType"};
        function getText(node) {
            var text = "", ch = node.childNodes;
            for (var i = 0, n; n = ch[i]; i++) {
                if (n.nodeType != 8) {
                    if (n.nodeType == 1) {
                        text += getText(n);
                    } else {
                        text += n.nodeValue;
                    }
                }
            }
            return text;
        }
        exports.get = function getProp(node, name) {
            node = dom.byId(node);
            var lc = name.toLowerCase(), propName = exports.names[lc] || name;
            if (propName == "textContent" && !has("dom-textContent")) {
                return getText(node);
            }
            return node[propName];
        };
        exports.set = function setProp(node, name, value) {
            node = dom.byId(node);
            var l = arguments.length;
            if (l == 2 && typeof name != "string") {
                for (var x in name) {
                    exports.set(node, x, name[x]);
                }
                return node;
            }
            var lc = name.toLowerCase(), propName = exports.names[lc] || name;
            if (propName == "style" && typeof value != "string") {
                style.set(node, value);
                return node;
            }
            if (propName == "innerHTML") {
                if (has("ie") && node.tagName.toLowerCase() in {col:1, colgroup:1, table:1, tbody:1, tfoot:1, thead:1, tr:1, title:1}) {
                    ctr.empty(node);
                    node.appendChild(ctr.toDom(value, node.ownerDocument));
                } else {
                    node[propName] = value;
                }
                return node;
            }
            if (propName == "textContent" && !has("dom-textContent")) {
                ctr.empty(node);
                node.appendChild(node.ownerDocument.createTextNode(value));
                return node;
            }
            if (lang.isFunction(value)) {
                var attrId = node[_attrId];
                if (!attrId) {
                    attrId = _ctr++;
                    node[_attrId] = attrId;
                }
                if (!_evtHdlrMap[attrId]) {
                    _evtHdlrMap[attrId] = {};
                }
                var h = _evtHdlrMap[attrId][propName];
                if (h) {
                    conn.disconnect(h);
                } else {
                    try {
                        delete node[propName];
                    }
                    catch (e) {
                    }
                }
                if (value) {
                    _evtHdlrMap[attrId][propName] = conn.connect(node, propName, value);
                } else {
                    node[propName] = null;
                }
                return node;
            }
            node[propName] = value;
            return node;
        };
    });
}, "dojo/fx/easing":function () {
    define(["../_base/lang"], function (lang) {
        var easingFuncs = {linear:function (n) {
            return n;
        }, quadIn:function (n) {
            return Math.pow(n, 2);
        }, quadOut:function (n) {
            return n * (n - 2) * -1;
        }, quadInOut:function (n) {
            n = n * 2;
            if (n < 1) {
                return Math.pow(n, 2) / 2;
            }
            return -1 * ((--n) * (n - 2) - 1) / 2;
        }, cubicIn:function (n) {
            return Math.pow(n, 3);
        }, cubicOut:function (n) {
            return Math.pow(n - 1, 3) + 1;
        }, cubicInOut:function (n) {
            n = n * 2;
            if (n < 1) {
                return Math.pow(n, 3) / 2;
            }
            n -= 2;
            return (Math.pow(n, 3) + 2) / 2;
        }, quartIn:function (n) {
            return Math.pow(n, 4);
        }, quartOut:function (n) {
            return -1 * (Math.pow(n - 1, 4) - 1);
        }, quartInOut:function (n) {
            n = n * 2;
            if (n < 1) {
                return Math.pow(n, 4) / 2;
            }
            n -= 2;
            return -1 / 2 * (Math.pow(n, 4) - 2);
        }, quintIn:function (n) {
            return Math.pow(n, 5);
        }, quintOut:function (n) {
            return Math.pow(n - 1, 5) + 1;
        }, quintInOut:function (n) {
            n = n * 2;
            if (n < 1) {
                return Math.pow(n, 5) / 2;
            }
            n -= 2;
            return (Math.pow(n, 5) + 2) / 2;
        }, sineIn:function (n) {
            return -1 * Math.cos(n * (Math.PI / 2)) + 1;
        }, sineOut:function (n) {
            return Math.sin(n * (Math.PI / 2));
        }, sineInOut:function (n) {
            return -1 * (Math.cos(Math.PI * n) - 1) / 2;
        }, expoIn:function (n) {
            return (n == 0) ? 0 : Math.pow(2, 10 * (n - 1));
        }, expoOut:function (n) {
            return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
        }, expoInOut:function (n) {
            if (n == 0) {
                return 0;
            }
            if (n == 1) {
                return 1;
            }
            n = n * 2;
            if (n < 1) {
                return Math.pow(2, 10 * (n - 1)) / 2;
            }
            --n;
            return (-1 * Math.pow(2, -10 * n) + 2) / 2;
        }, circIn:function (n) {
            return -1 * (Math.sqrt(1 - Math.pow(n, 2)) - 1);
        }, circOut:function (n) {
            n = n - 1;
            return Math.sqrt(1 - Math.pow(n, 2));
        }, circInOut:function (n) {
            n = n * 2;
            if (n < 1) {
                return -1 / 2 * (Math.sqrt(1 - Math.pow(n, 2)) - 1);
            }
            n -= 2;
            return 1 / 2 * (Math.sqrt(1 - Math.pow(n, 2)) + 1);
        }, backIn:function (n) {
            var s = 1.70158;
            return Math.pow(n, 2) * ((s + 1) * n - s);
        }, backOut:function (n) {
            n = n - 1;
            var s = 1.70158;
            return Math.pow(n, 2) * ((s + 1) * n + s) + 1;
        }, backInOut:function (n) {
            var s = 1.70158 * 1.525;
            n = n * 2;
            if (n < 1) {
                return (Math.pow(n, 2) * ((s + 1) * n - s)) / 2;
            }
            n -= 2;
            return (Math.pow(n, 2) * ((s + 1) * n + s) + 2) / 2;
        }, elasticIn:function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = 0.3;
            var s = p / 4;
            n = n - 1;
            return -1 * Math.pow(2, 10 * n) * Math.sin((n - s) * (2 * Math.PI) / p);
        }, elasticOut:function (n) {
            if (n == 0 || n == 1) {
                return n;
            }
            var p = 0.3;
            var s = p / 4;
            return Math.pow(2, -10 * n) * Math.sin((n - s) * (2 * Math.PI) / p) + 1;
        }, elasticInOut:function (n) {
            if (n == 0) {
                return 0;
            }
            n = n * 2;
            if (n == 2) {
                return 1;
            }
            var p = 0.3 * 1.5;
            var s = p / 4;
            if (n < 1) {
                n -= 1;
                return -0.5 * (Math.pow(2, 10 * n) * Math.sin((n - s) * (2 * Math.PI) / p));
            }
            n -= 1;
            return 0.5 * (Math.pow(2, -10 * n) * Math.sin((n - s) * (2 * Math.PI) / p)) + 1;
        }, bounceIn:function (n) {
            return (1 - easingFuncs.bounceOut(1 - n));
        }, bounceOut:function (n) {
            var s = 7.5625;
            var p = 2.75;
            var l;
            if (n < (1 / p)) {
                l = s * Math.pow(n, 2);
            } else {
                if (n < (2 / p)) {
                    n -= (1.5 / p);
                    l = s * Math.pow(n, 2) + 0.75;
                } else {
                    if (n < (2.5 / p)) {
                        n -= (2.25 / p);
                        l = s * Math.pow(n, 2) + 0.9375;
                    } else {
                        n -= (2.625 / p);
                        l = s * Math.pow(n, 2) + 0.984375;
                    }
                }
            }
            return l;
        }, bounceInOut:function (n) {
            if (n < 0.5) {
                return easingFuncs.bounceIn(n * 2) / 2;
            }
            return (easingFuncs.bounceOut(n * 2 - 1) / 2) + 0.5;
        }};
        lang.setObject("dojo.fx.easing", easingFuncs);
        return easingFuncs;
    });
}, "dojo/when":function () {
    define(["./Deferred", "./promise/Promise"], function (Deferred, Promise) {
        "use strict";
        return function when(valueOrPromise, callback, errback, progback) {
            var receivedPromise = valueOrPromise && typeof valueOrPromise.then === "function";
            var nativePromise = receivedPromise && valueOrPromise instanceof Promise;
            if (!receivedPromise) {
                if (arguments.length > 1) {
                    return callback ? callback(valueOrPromise) : valueOrPromise;
                } else {
                    return new Deferred().resolve(valueOrPromise);
                }
            } else {
                if (!nativePromise) {
                    var deferred = new Deferred(valueOrPromise.cancel);
                    valueOrPromise.then(deferred.resolve, deferred.reject, deferred.progress);
                    valueOrPromise = deferred.promise;
                }
            }
            if (callback || errback || progback) {
                return valueOrPromise.then(callback, errback, progback);
            }
            return valueOrPromise;
        };
    });
}, "dojo/number":function () {
    define(["./_base/lang", "./i18n", "./i18n!./cldr/nls/number", "./string", "./regexp"], function (lang, i18n, nlsNumber, dstring, dregexp) {
        var number = {};
        lang.setObject("dojo.number", number);
        number.format = function (value, options) {
            options = lang.mixin({}, options || {});
            var locale = i18n.normalizeLocale(options.locale), bundle = i18n.getLocalization("dojo.cldr", "number", locale);
            options.customs = bundle;
            var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
            if (isNaN(value) || Math.abs(value) == Infinity) {
                return null;
            }
            return number._applyPattern(value, pattern, options);
        };
        number._numberPatternRE = /[#0,]*[#0](?:\.0*#*)?/;
        number._applyPattern = function (value, pattern, options) {
            options = options || {};
            var group = options.customs.group, decimal = options.customs.decimal, patternList = pattern.split(";"), positivePattern = patternList[0];
            pattern = patternList[(value < 0) ? 1 : 0] || ("-" + positivePattern);
            if (pattern.indexOf("%") != -1) {
                value *= 100;
            } else {
                if (pattern.indexOf("\u2030") != -1) {
                    value *= 1000;
                } else {
                    if (pattern.indexOf("\xa4") != -1) {
                        group = options.customs.currencyGroup || group;
                        decimal = options.customs.currencyDecimal || decimal;
                        pattern = pattern.replace(/\u00a4{1,3}/, function (match) {
                            var prop = ["symbol", "currency", "displayName"][match.length - 1];
                            return options[prop] || options.currency || "";
                        });
                    } else {
                        if (pattern.indexOf("E") != -1) {
                            throw new Error("exponential notation not supported");
                        }
                    }
                }
            }
            var numberPatternRE = number._numberPatternRE;
            var numberPattern = positivePattern.match(numberPatternRE);
            if (!numberPattern) {
                throw new Error("unable to find a number expression in pattern: " + pattern);
            }
            if (options.fractional === false) {
                options.places = 0;
            }
            return pattern.replace(numberPatternRE, number._formatAbsolute(value, numberPattern[0], {decimal:decimal, group:group, places:options.places, round:options.round}));
        };
        number.round = function (value, places, increment) {
            var factor = 10 / (increment || 10);
            return (factor * +value).toFixed(places) / factor;
        };
        if ((0.9).toFixed() == 0) {
            var round = number.round;
            number.round = function (v, p, m) {
                var d = Math.pow(10, -p || 0), a = Math.abs(v);
                if (!v || a >= d) {
                    d = 0;
                } else {
                    a /= d;
                    if (a < 0.5 || a >= 0.95) {
                        d = 0;
                    }
                }
                return round(v, p, m) + (v > 0 ? d : -d);
            };
        }
        number._formatAbsolute = function (value, pattern, options) {
            options = options || {};
            if (options.places === true) {
                options.places = 0;
            }
            if (options.places === Infinity) {
                options.places = 6;
            }
            var patternParts = pattern.split("."), comma = typeof options.places == "string" && options.places.indexOf(","), maxPlaces = options.places;
            if (comma) {
                maxPlaces = options.places.substring(comma + 1);
            } else {
                if (!(maxPlaces >= 0)) {
                    maxPlaces = (patternParts[1] || []).length;
                }
            }
            if (!(options.round < 0)) {
                value = number.round(value, maxPlaces, options.round);
            }
            var valueParts = String(Math.abs(value)).split("."), fractional = valueParts[1] || "";
            if (patternParts[1] || options.places) {
                if (comma) {
                    options.places = options.places.substring(0, comma);
                }
                var pad = options.places !== undefined ? options.places : (patternParts[1] && patternParts[1].lastIndexOf("0") + 1);
                if (pad > fractional.length) {
                    valueParts[1] = dstring.pad(fractional, pad, "0", true);
                }
                if (maxPlaces < fractional.length) {
                    valueParts[1] = fractional.substr(0, maxPlaces);
                }
            } else {
                if (valueParts[1]) {
                    valueParts.pop();
                }
            }
            var patternDigits = patternParts[0].replace(",", "");
            pad = patternDigits.indexOf("0");
            if (pad != -1) {
                pad = patternDigits.length - pad;
                if (pad > valueParts[0].length) {
                    valueParts[0] = dstring.pad(valueParts[0], pad);
                }
                if (patternDigits.indexOf("#") == -1) {
                    valueParts[0] = valueParts[0].substr(valueParts[0].length - pad);
                }
            }
            var index = patternParts[0].lastIndexOf(","), groupSize, groupSize2;
            if (index != -1) {
                groupSize = patternParts[0].length - index - 1;
                var remainder = patternParts[0].substr(0, index);
                index = remainder.lastIndexOf(",");
                if (index != -1) {
                    groupSize2 = remainder.length - index - 1;
                }
            }
            var pieces = [];
            for (var whole = valueParts[0]; whole; ) {
                var off = whole.length - groupSize;
                pieces.push((off > 0) ? whole.substr(off) : whole);
                whole = (off > 0) ? whole.slice(0, off) : "";
                if (groupSize2) {
                    groupSize = groupSize2;
                    delete groupSize2;
                }
            }
            valueParts[0] = pieces.reverse().join(options.group || ",");
            return valueParts.join(options.decimal || ".");
        };
        number.regexp = function (options) {
            return number._parseInfo(options).regexp;
        };
        number._parseInfo = function (options) {
            options = options || {};
            var locale = i18n.normalizeLocale(options.locale), bundle = i18n.getLocalization("dojo.cldr", "number", locale), pattern = options.pattern || bundle[(options.type || "decimal") + "Format"], group = bundle.group, decimal = bundle.decimal, factor = 1;
            if (pattern.indexOf("%") != -1) {
                factor /= 100;
            } else {
                if (pattern.indexOf("\u2030") != -1) {
                    factor /= 1000;
                } else {
                    var isCurrency = pattern.indexOf("\xa4") != -1;
                    if (isCurrency) {
                        group = bundle.currencyGroup || group;
                        decimal = bundle.currencyDecimal || decimal;
                    }
                }
            }
            var patternList = pattern.split(";");
            if (patternList.length == 1) {
                patternList.push("-" + patternList[0]);
            }
            var re = dregexp.buildGroupRE(patternList, function (pattern) {
                pattern = "(?:" + dregexp.escapeString(pattern, ".") + ")";
                return pattern.replace(number._numberPatternRE, function (format) {
                    var flags = {signed:false, separator:options.strict ? group : [group, ""], fractional:options.fractional, decimal:decimal, exponent:false}, parts = format.split("."), places = options.places;
                    if (parts.length == 1 && factor != 1) {
                        parts[1] = "###";
                    }
                    if (parts.length == 1 || places === 0) {
                        flags.fractional = false;
                    } else {
                        if (places === undefined) {
                            places = options.pattern ? parts[1].lastIndexOf("0") + 1 : Infinity;
                        }
                        if (places && options.fractional == undefined) {
                            flags.fractional = true;
                        }
                        if (!options.places && (places < parts[1].length)) {
                            places += "," + parts[1].length;
                        }
                        flags.places = places;
                    }
                    var groups = parts[0].split(",");
                    if (groups.length > 1) {
                        flags.groupSize = groups.pop().length;
                        if (groups.length > 1) {
                            flags.groupSize2 = groups.pop().length;
                        }
                    }
                    return "(" + number._realNumberRegexp(flags) + ")";
                });
            }, true);
            if (isCurrency) {
                re = re.replace(/([\s\xa0]*)(\u00a4{1,3})([\s\xa0]*)/g, function (match, before, target, after) {
                    var prop = ["symbol", "currency", "displayName"][target.length - 1], symbol = dregexp.escapeString(options[prop] || options.currency || "");
                    before = before ? "[\\s\\xa0]" : "";
                    after = after ? "[\\s\\xa0]" : "";
                    if (!options.strict) {
                        if (before) {
                            before += "*";
                        }
                        if (after) {
                            after += "*";
                        }
                        return "(?:" + before + symbol + after + ")?";
                    }
                    return before + symbol + after;
                });
            }
            return {regexp:re.replace(/[\xa0 ]/g, "[\\s\\xa0]"), group:group, decimal:decimal, factor:factor};
        };
        number.parse = function (expression, options) {
            var info = number._parseInfo(options), results = (new RegExp("^" + info.regexp + "$")).exec(expression);
            if (!results) {
                return NaN;
            }
            var absoluteMatch = results[1];
            if (!results[1]) {
                if (!results[2]) {
                    return NaN;
                }
                absoluteMatch = results[2];
                info.factor *= -1;
            }
            absoluteMatch = absoluteMatch.replace(new RegExp("[" + info.group + "\\s\\xa0" + "]", "g"), "").replace(info.decimal, ".");
            return absoluteMatch * info.factor;
        };
        number._realNumberRegexp = function (flags) {
            flags = flags || {};
            if (!("places" in flags)) {
                flags.places = Infinity;
            }
            if (typeof flags.decimal != "string") {
                flags.decimal = ".";
            }
            if (!("fractional" in flags) || /^0/.test(flags.places)) {
                flags.fractional = [true, false];
            }
            if (!("exponent" in flags)) {
                flags.exponent = [true, false];
            }
            if (!("eSigned" in flags)) {
                flags.eSigned = [true, false];
            }
            var integerRE = number._integerRegexp(flags), decimalRE = dregexp.buildGroupRE(flags.fractional, function (q) {
                var re = "";
                if (q && (flags.places !== 0)) {
                    re = "\\" + flags.decimal;
                    if (flags.places == Infinity) {
                        re = "(?:" + re + "\\d+)?";
                    } else {
                        re += "\\d{" + flags.places + "}";
                    }
                }
                return re;
            }, true);
            var exponentRE = dregexp.buildGroupRE(flags.exponent, function (q) {
                if (q) {
                    return "([eE]" + number._integerRegexp({signed:flags.eSigned}) + ")";
                }
                return "";
            });
            var realRE = integerRE + decimalRE;
            if (decimalRE) {
                realRE = "(?:(?:" + realRE + ")|(?:" + decimalRE + "))";
            }
            return realRE + exponentRE;
        };
        number._integerRegexp = function (flags) {
            flags = flags || {};
            if (!("signed" in flags)) {
                flags.signed = [true, false];
            }
            if (!("separator" in flags)) {
                flags.separator = "";
            } else {
                if (!("groupSize" in flags)) {
                    flags.groupSize = 3;
                }
            }
            var signRE = dregexp.buildGroupRE(flags.signed, function (q) {
                return q ? "[-+]" : "";
            }, true);
            var numberRE = dregexp.buildGroupRE(flags.separator, function (sep) {
                if (!sep) {
                    return "(?:\\d+)";
                }
                sep = dregexp.escapeString(sep);
                if (sep == " ") {
                    sep = "\\s";
                } else {
                    if (sep == "\xa0") {
                        sep = "\\s\\xa0";
                    }
                }
                var grp = flags.groupSize, grp2 = flags.groupSize2;
                if (grp2) {
                    var grp2RE = "(?:0|[1-9]\\d{0," + (grp2 - 1) + "}(?:[" + sep + "]\\d{" + grp2 + "})*[" + sep + "]\\d{" + grp + "})";
                    return ((grp - grp2) > 0) ? "(?:" + grp2RE + "|(?:0|[1-9]\\d{0," + (grp - 1) + "}))" : grp2RE;
                }
                return "(?:0|[1-9]\\d{0," + (grp - 1) + "}(?:[" + sep + "]\\d{" + grp + "})*)";
            }, true);
            return signRE + numberRE;
        };
        return number;
    });
}, "dojo/fx/Toggler":function () {
    define(["../_base/lang", "../_base/declare", "../_base/fx", "../aspect"], function (lang, declare, baseFx, aspect) {
        return declare("dojo.fx.Toggler", null, {node:null, showFunc:baseFx.fadeIn, hideFunc:baseFx.fadeOut, showDuration:200, hideDuration:200, constructor:function (args) {
            var _t = this;
            lang.mixin(_t, args);
            _t.node = args.node;
            _t._showArgs = lang.mixin({}, args);
            _t._showArgs.node = _t.node;
            _t._showArgs.duration = _t.showDuration;
            _t.showAnim = _t.showFunc(_t._showArgs);
            _t._hideArgs = lang.mixin({}, args);
            _t._hideArgs.node = _t.node;
            _t._hideArgs.duration = _t.hideDuration;
            _t.hideAnim = _t.hideFunc(_t._hideArgs);
            aspect.after(_t.showAnim, "beforeBegin", lang.hitch(_t.hideAnim, "stop", true), true);
            aspect.after(_t.hideAnim, "beforeBegin", lang.hitch(_t.showAnim, "stop", true), true);
        }, show:function (delay) {
            return this.showAnim.play(delay || 0);
        }, hide:function (delay) {
            return this.hideAnim.play(delay || 0);
        }});
    });
}, "dojo/dom-attr":function () {
    define(["exports", "./sniff", "./_base/lang", "./dom", "./dom-style", "./dom-prop"], function (exports, has, lang, dom, style, prop) {
        var forcePropNames = {innerHTML:1, textContent:1, className:1, htmlFor:has("ie"), value:1}, attrNames = {classname:"class", htmlfor:"for", tabindex:"tabIndex", readonly:"readOnly"};
        function _hasAttr(node, name) {
            var attr = node.getAttributeNode && node.getAttributeNode(name);
            return !!attr && attr.specified;
        }
        exports.has = function hasAttr(node, name) {
            var lc = name.toLowerCase();
            return forcePropNames[prop.names[lc] || name] || _hasAttr(dom.byId(node), attrNames[lc] || name);
        };
        exports.get = function getAttr(node, name) {
            node = dom.byId(node);
            var lc = name.toLowerCase(), propName = prop.names[lc] || name, forceProp = forcePropNames[propName], value = node[propName];
            if (forceProp && typeof value != "undefined") {
                return value;
            }
            if (propName == "textContent") {
                return prop.get(node, propName);
            }
            if (propName != "href" && (typeof value == "boolean" || lang.isFunction(value))) {
                return value;
            }
            var attrName = attrNames[lc] || name;
            return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
        };
        exports.set = function setAttr(node, name, value) {
            node = dom.byId(node);
            if (arguments.length == 2) {
                for (var x in name) {
                    exports.set(node, x, name[x]);
                }
                return node;
            }
            var lc = name.toLowerCase(), propName = prop.names[lc] || name, forceProp = forcePropNames[propName];
            if (propName == "style" && typeof value != "string") {
                style.set(node, value);
                return node;
            }
            if (forceProp || typeof value == "boolean" || lang.isFunction(value)) {
                return prop.set(node, name, value);
            }
            node.setAttribute(attrNames[lc] || name, value);
            return node;
        };
        exports.remove = function removeAttr(node, name) {
            dom.byId(node).removeAttribute(attrNames[name.toLowerCase()] || name);
        };
        exports.getNodeProp = function getNodeProp(node, name) {
            node = dom.byId(node);
            var lc = name.toLowerCase(), propName = prop.names[lc] || name;
            if ((propName in node) && propName != "href") {
                return node[propName];
            }
            var attrName = attrNames[lc] || name;
            return _hasAttr(node, attrName) ? node.getAttribute(attrName) : null;
        };
    });
}, "dojo/dom-construct":function () {
    define(["exports", "./_base/kernel", "./sniff", "./_base/window", "./dom", "./dom-attr"], function (exports, dojo, has, win, dom, attr) {
        var tagWrap = {option:["select"], tbody:["table"], thead:["table"], tfoot:["table"], tr:["table", "tbody"], td:["table", "tbody", "tr"], th:["table", "thead", "tr"], legend:["fieldset"], caption:["table"], colgroup:["table"], col:["table", "colgroup"], li:["ul"]}, reTag = /<\s*([\w\:]+)/, masterNode = {}, masterNum = 0, masterName = "__" + dojo._scopeName + "ToDomId";
        for (var param in tagWrap) {
            if (tagWrap.hasOwnProperty(param)) {
                var tw = tagWrap[param];
                tw.pre = param == "option" ? "<select multiple=\"multiple\">" : "<" + tw.join("><") + ">";
                tw.post = "</" + tw.reverse().join("></") + ">";
            }
        }
        var html5domfix;
        if (has("ie") <= 8) {
            html5domfix = function (doc) {
                doc.__dojo_html5_tested = "yes";
                var div = create("div", {innerHTML:"<nav>a</nav>", style:{visibility:"hidden"}}, doc.body);
                if (div.childNodes.length !== 1) {
                    ("abbr article aside audio canvas details figcaption figure footer header " + "hgroup mark meter nav output progress section summary time video").replace(/\b\w+\b/g, function (n) {
                        doc.createElement(n);
                    });
                }
                destroy(div);
            };
        }
        function _insertBefore(node, ref) {
            var parent = ref.parentNode;
            if (parent) {
                parent.insertBefore(node, ref);
            }
        }
        function _insertAfter(node, ref) {
            var parent = ref.parentNode;
            if (parent) {
                if (parent.lastChild == ref) {
                    parent.appendChild(node);
                } else {
                    parent.insertBefore(node, ref.nextSibling);
                }
            }
        }
        exports.toDom = function toDom(frag, doc) {
            doc = doc || win.doc;
            var masterId = doc[masterName];
            if (!masterId) {
                doc[masterName] = masterId = ++masterNum + "";
                masterNode[masterId] = doc.createElement("div");
            }
            if (has("ie") <= 8) {
                if (!doc.__dojo_html5_tested && doc.body) {
                    html5domfix(doc);
                }
            }
            frag += "";
            var match = frag.match(reTag), tag = match ? match[1].toLowerCase() : "", master = masterNode[masterId], wrap, i, fc, df;
            if (match && tagWrap[tag]) {
                wrap = tagWrap[tag];
                master.innerHTML = wrap.pre + frag + wrap.post;
                for (i = wrap.length; i; --i) {
                    master = master.firstChild;
                }
            } else {
                master.innerHTML = frag;
            }
            if (master.childNodes.length == 1) {
                return master.removeChild(master.firstChild);
            }
            df = doc.createDocumentFragment();
            while ((fc = master.firstChild)) {
                df.appendChild(fc);
            }
            return df;
        };
        exports.place = function place(node, refNode, position) {
            refNode = dom.byId(refNode);
            if (typeof node == "string") {
                node = /^\s*</.test(node) ? exports.toDom(node, refNode.ownerDocument) : dom.byId(node);
            }
            if (typeof position == "number") {
                var cn = refNode.childNodes;
                if (!cn.length || cn.length <= position) {
                    refNode.appendChild(node);
                } else {
                    _insertBefore(node, cn[position < 0 ? 0 : position]);
                }
            } else {
                switch (position) {
                  case "before":
                    _insertBefore(node, refNode);
                    break;
                  case "after":
                    _insertAfter(node, refNode);
                    break;
                  case "replace":
                    refNode.parentNode.replaceChild(node, refNode);
                    break;
                  case "only":
                    exports.empty(refNode);
                    refNode.appendChild(node);
                    break;
                  case "first":
                    if (refNode.firstChild) {
                        _insertBefore(node, refNode.firstChild);
                        break;
                    }
                  default:
                    refNode.appendChild(node);
                }
            }
            return node;
        };
        var create = exports.create = function create(tag, attrs, refNode, pos) {
            var doc = win.doc;
            if (refNode) {
                refNode = dom.byId(refNode);
                doc = refNode.ownerDocument;
            }
            if (typeof tag == "string") {
                tag = doc.createElement(tag);
            }
            if (attrs) {
                attr.set(tag, attrs);
            }
            if (refNode) {
                exports.place(tag, refNode, pos);
            }
            return tag;
        };
        function _empty(node) {
            if ("innerHTML" in node) {
                try {
                    node.innerHTML = "";
                    return;
                }
                catch (e) {
                }
            }
            for (var c; c = node.lastChild; ) {
                node.removeChild(c);
            }
        }
        exports.empty = function empty(node) {
            _empty(dom.byId(node));
        };
        function _destroy(node, parent) {
            if (node.firstChild) {
                _empty(node);
            }
            if (parent) {
                has("ie") && parent.canHaveChildren && "removeNode" in node ? node.removeNode(false) : parent.removeChild(node);
            }
        }
        var destroy = exports.destroy = function destroy(node) {
            node = dom.byId(node);
            if (!node) {
                return;
            }
            _destroy(node, node.parentNode);
        };
    });
}, "dojo/request/xhr":function () {
    define(["../errors/RequestError", "./watch", "./handlers", "./util", "../has"], function (RequestError, watch, handlers, util, has) {
        has.add("native-xhr", function () {
            return typeof XMLHttpRequest !== "undefined";
        });
        has.add("dojo-force-activex-xhr", function () {
            return has("activex") && !document.addEventListener && window.location.protocol === "file:";
        });
        has.add("native-xhr2", function () {
            if (!has("native-xhr")) {
                return;
            }
            var x = new XMLHttpRequest();
            return typeof x["addEventListener"] !== "undefined" && (typeof opera === "undefined" || typeof x["upload"] !== "undefined");
        });
        has.add("native-formdata", function () {
            return typeof FormData !== "undefined";
        });
        has.add("native-response-type", function () {
            return has("native-xhr") && typeof new XMLHttpRequest().responseType !== "undefined";
        });
        has.add("native-xhr2-blob", function () {
            if (!has("native-response-type")) {
                return;
            }
            var x = new XMLHttpRequest();
            x.open("GET", "/", true);
            x.responseType = "blob";
            var responseType = x.responseType;
            x.abort();
            return responseType === "blob";
        });
        var nativeResponseTypes = {"blob":has("native-xhr2-blob") ? "blob" : "arraybuffer", "document":"document", "arraybuffer":"arraybuffer"};
        function handleResponse(response, error) {
            var _xhr = response.xhr;
            response.status = response.xhr.status;
            try {
                response.text = _xhr.responseText;
            }
            catch (e) {
            }
            if (response.options.handleAs === "xml") {
                response.data = _xhr.responseXML;
            }
            if (!error) {
                try {
                    handlers(response);
                }
                catch (e) {
                    error = e;
                }
            }
            if (error) {
                this.reject(error);
            } else {
                if (util.checkStatus(_xhr.status)) {
                    this.resolve(response);
                } else {
                    error = new RequestError("Unable to load " + response.url + " status: " + _xhr.status, response);
                    this.reject(error);
                }
            }
        }
        var isValid, isReady, addListeners, cancel;
        if (has("native-xhr2")) {
            isValid = function (response) {
                return !this.isFulfilled();
            };
            cancel = function (dfd, response) {
                response.xhr.abort();
            };
            addListeners = function (_xhr, dfd, response) {
                function onLoad(evt) {
                    dfd.handleResponse(response);
                }
                function onError(evt) {
                    var _xhr = evt.target;
                    var error = new RequestError("Unable to load " + response.url + " status: " + _xhr.status, response);
                    dfd.handleResponse(response, error);
                }
                function onProgress(evt) {
                    if (evt.lengthComputable) {
                        response.loaded = evt.loaded;
                        response.total = evt.total;
                        dfd.progress(response);
                    } else {
                        if (response.xhr.readyState === 3) {
                            response.loaded = evt.position;
                            dfd.progress(response);
                        }
                    }
                }
                _xhr.addEventListener("load", onLoad, false);
                _xhr.addEventListener("error", onError, false);
                _xhr.addEventListener("progress", onProgress, false);
                return function () {
                    _xhr.removeEventListener("load", onLoad, false);
                    _xhr.removeEventListener("error", onError, false);
                    _xhr.removeEventListener("progress", onProgress, false);
                    _xhr = null;
                };
            };
        } else {
            isValid = function (response) {
                return response.xhr.readyState;
            };
            isReady = function (response) {
                return 4 === response.xhr.readyState;
            };
            cancel = function (dfd, response) {
                var xhr = response.xhr;
                var _at = typeof xhr.abort;
                if (_at === "function" || _at === "object" || _at === "unknown") {
                    xhr.abort();
                }
            };
        }
        function getHeader(headerName) {
            return this.xhr.getResponseHeader(headerName);
        }
        var undefined, defaultOptions = {data:null, query:null, sync:false, method:"GET"};
        function xhr(url, options, returnDeferred) {
            var isFormData = has("native-formdata") && options && options.data && options.data instanceof FormData;
            var response = util.parseArgs(url, util.deepCreate(defaultOptions, options), isFormData);
            url = response.url;
            options = response.options;
            var remover, last = function () {
                remover && remover();
            };
            var dfd = util.deferred(response, cancel, isValid, isReady, handleResponse, last);
            var _xhr = response.xhr = xhr._create();
            if (!_xhr) {
                dfd.cancel(new RequestError("XHR was not created"));
                return returnDeferred ? dfd : dfd.promise;
            }
            response.getHeader = getHeader;
            if (addListeners) {
                remover = addListeners(_xhr, dfd, response);
            }
            var data = options.data, async = !options.sync, method = options.method;
            try {
                _xhr.open(method, url, async, options.user || undefined, options.password || undefined);
                if (options.withCredentials) {
                    _xhr.withCredentials = options.withCredentials;
                }
                if (has("native-response-type") && options.handleAs in nativeResponseTypes) {
                    _xhr.responseType = nativeResponseTypes[options.handleAs];
                }
                var headers = options.headers, contentType = isFormData ? false : "application/x-www-form-urlencoded";
                if (headers) {
                    for (var hdr in headers) {
                        if (hdr.toLowerCase() === "content-type") {
                            contentType = headers[hdr];
                        } else {
                            if (headers[hdr]) {
                                _xhr.setRequestHeader(hdr, headers[hdr]);
                            }
                        }
                    }
                }
                if (contentType && contentType !== false) {
                    _xhr.setRequestHeader("Content-Type", contentType);
                }
                if (!headers || !("X-Requested-With" in headers)) {
                    _xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                }
                if (util.notify) {
                    util.notify.emit("send", response, dfd.promise.cancel);
                }
                _xhr.send(data);
            }
            catch (e) {
                dfd.reject(e);
            }
            watch(dfd);
            _xhr = null;
            return returnDeferred ? dfd : dfd.promise;
        }
        xhr._create = function () {
            throw new Error("XMLHTTP not available");
        };
        if (has("native-xhr") && !has("dojo-force-activex-xhr")) {
            xhr._create = function () {
                return new XMLHttpRequest();
            };
        } else {
            if (has("activex")) {
                try {
                    new ActiveXObject("Msxml2.XMLHTTP");
                    xhr._create = function () {
                        return new ActiveXObject("Msxml2.XMLHTTP");
                    };
                }
                catch (e) {
                    try {
                        new ActiveXObject("Microsoft.XMLHTTP");
                        xhr._create = function () {
                            return new ActiveXObject("Microsoft.XMLHTTP");
                        };
                    }
                    catch (e) {
                    }
                }
            }
        }
        util.addCommonMethods(xhr);
        return xhr;
    });
}, "dojo/_base/url":function () {
    define(["./kernel"], function (dojo) {
        var ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$"), ire = new RegExp("^((([^\\[:]+):)?([^@]+)@)?(\\[([^\\]]+)\\]|([^\\[:]*))(:([0-9]+))?$"), _Url = function () {
            var n = null, _a = arguments, uri = [_a[0]];
            for (var i = 1; i < _a.length; i++) {
                if (!_a[i]) {
                    continue;
                }
                var relobj = new _Url(_a[i] + ""), uriobj = new _Url(uri[0] + "");
                if (relobj.path == "" && !relobj.scheme && !relobj.authority && !relobj.query) {
                    if (relobj.fragment != n) {
                        uriobj.fragment = relobj.fragment;
                    }
                    relobj = uriobj;
                } else {
                    if (!relobj.scheme) {
                        relobj.scheme = uriobj.scheme;
                        if (!relobj.authority) {
                            relobj.authority = uriobj.authority;
                            if (relobj.path.charAt(0) != "/") {
                                var path = uriobj.path.substring(0, uriobj.path.lastIndexOf("/") + 1) + relobj.path;
                                var segs = path.split("/");
                                for (var j = 0; j < segs.length; j++) {
                                    if (segs[j] == ".") {
                                        if (j == segs.length - 1) {
                                            segs[j] = "";
                                        } else {
                                            segs.splice(j, 1);
                                            j--;
                                        }
                                    } else {
                                        if (j > 0 && !(j == 1 && segs[0] == "") && segs[j] == ".." && segs[j - 1] != "..") {
                                            if (j == (segs.length - 1)) {
                                                segs.splice(j, 1);
                                                segs[j - 1] = "";
                                            } else {
                                                segs.splice(j - 1, 2);
                                                j -= 2;
                                            }
                                        }
                                    }
                                }
                                relobj.path = segs.join("/");
                            }
                        }
                    }
                }
                uri = [];
                if (relobj.scheme) {
                    uri.push(relobj.scheme, ":");
                }
                if (relobj.authority) {
                    uri.push("//", relobj.authority);
                }
                uri.push(relobj.path);
                if (relobj.query) {
                    uri.push("?", relobj.query);
                }
                if (relobj.fragment) {
                    uri.push("#", relobj.fragment);
                }
            }
            this.uri = uri.join("");
            var r = this.uri.match(ore);
            this.scheme = r[2] || (r[1] ? "" : n);
            this.authority = r[4] || (r[3] ? "" : n);
            this.path = r[5];
            this.query = r[7] || (r[6] ? "" : n);
            this.fragment = r[9] || (r[8] ? "" : n);
            if (this.authority != n) {
                r = this.authority.match(ire);
                this.user = r[3] || n;
                this.password = r[4] || n;
                this.host = r[6] || r[7];
                this.port = r[9] || n;
            }
        };
        _Url.prototype.toString = function () {
            return this.uri;
        };
        return dojo._Url = _Url;
    });
}, "dojo/date/stamp":function () {
    define(["../_base/lang", "../_base/array"], function (lang, array) {
        var stamp = {};
        lang.setObject("dojo.date.stamp", stamp);
        stamp.fromISOString = function (formattedString, defaultTime) {
            if (!stamp._isoRegExp) {
                stamp._isoRegExp = /^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
            }
            var match = stamp._isoRegExp.exec(formattedString), result = null;
            if (match) {
                match.shift();
                if (match[1]) {
                    match[1]--;
                }
                if (match[6]) {
                    match[6] *= 1000;
                }
                if (defaultTime) {
                    defaultTime = new Date(defaultTime);
                    array.forEach(array.map(["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"], function (prop) {
                        return defaultTime["get" + prop]();
                    }), function (value, index) {
                        match[index] = match[index] || value;
                    });
                }
                result = new Date(match[0] || 1970, match[1] || 0, match[2] || 1, match[3] || 0, match[4] || 0, match[5] || 0, match[6] || 0);
                if (match[0] < 100) {
                    result.setFullYear(match[0] || 1970);
                }
                var offset = 0, zoneSign = match[7] && match[7].charAt(0);
                if (zoneSign != "Z") {
                    offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
                    if (zoneSign != "-") {
                        offset *= -1;
                    }
                }
                if (zoneSign) {
                    offset -= result.getTimezoneOffset();
                }
                if (offset) {
                    result.setTime(result.getTime() + offset * 60000);
                }
            }
            return result;
        };
        stamp.toISOString = function (dateObject, options) {
            var _ = function (n) {
                return (n < 10) ? "0" + n : n;
            };
            options = options || {};
            var formattedDate = [], getter = options.zulu ? "getUTC" : "get", date = "";
            if (options.selector != "time") {
                var year = dateObject[getter + "FullYear"]();
                date = ["0000".substr((year + "").length) + year, _(dateObject[getter + "Month"]() + 1), _(dateObject[getter + "Date"]())].join("-");
            }
            formattedDate.push(date);
            if (options.selector != "date") {
                var time = [_(dateObject[getter + "Hours"]()), _(dateObject[getter + "Minutes"]()), _(dateObject[getter + "Seconds"]())].join(":");
                var millis = dateObject[getter + "Milliseconds"]();
                if (options.milliseconds) {
                    time += "." + (millis < 100 ? "0" : "") + _(millis);
                }
                if (options.zulu) {
                    time += "Z";
                } else {
                    if (options.selector != "time") {
                        var timezoneOffset = dateObject.getTimezoneOffset();
                        var absOffset = Math.abs(timezoneOffset);
                        time += (timezoneOffset > 0 ? "-" : "+") + _(Math.floor(absOffset / 60)) + ":" + _(absOffset % 60);
                    }
                }
                formattedDate.push(time);
            }
            return formattedDate.join("T");
        };
        return stamp;
    });
}, "dojo/text":function () {
    define(["./_base/kernel", "require", "./has", "./request"], function (dojo, require, has, request) {
        var getText;
        if (1) {
            getText = function (url, sync, load) {
                request(url, {sync:!!sync, headers:{"X-Requested-With":null}}).then(load);
            };
        } else {
            if (require.getText) {
                getText = require.getText;
            } else {
                console.error("dojo/text plugin failed to load because loader does not support getText");
            }
        }
        var theCache = {}, strip = function (text) {
            if (text) {
                text = text.replace(/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im, "");
                var matches = text.match(/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im);
                if (matches) {
                    text = matches[1];
                }
            } else {
                text = "";
            }
            return text;
        }, notFound = {}, pending = {};
        dojo.cache = function (module, url, value) {
            var key;
            if (typeof module == "string") {
                if (/\//.test(module)) {
                    key = module;
                    value = url;
                } else {
                    key = require.toUrl(module.replace(/\./g, "/") + (url ? ("/" + url) : ""));
                }
            } else {
                key = module + "";
                value = url;
            }
            var val = (value != undefined && typeof value != "string") ? value.value : value, sanitize = value && value.sanitize;
            if (typeof val == "string") {
                theCache[key] = val;
                return sanitize ? strip(val) : val;
            } else {
                if (val === null) {
                    delete theCache[key];
                    return null;
                } else {
                    if (!(key in theCache)) {
                        getText(key, true, function (text) {
                            theCache[key] = text;
                        });
                    }
                    return sanitize ? strip(theCache[key]) : theCache[key];
                }
            }
        };
        return {dynamic:true, normalize:function (id, toAbsMid) {
            var parts = id.split("!"), url = parts[0];
            return (/^\./.test(url) ? toAbsMid(url) : url) + (parts[1] ? "!" + parts[1] : "");
        }, load:function (id, require, load) {
            var parts = id.split("!"), stripFlag = parts.length > 1, absMid = parts[0], url = require.toUrl(parts[0]), requireCacheUrl = "url:" + url, text = notFound, finish = function (text) {
                load(stripFlag ? strip(text) : text);
            };
            if (absMid in theCache) {
                text = theCache[absMid];
            } else {
                if (require.cache && requireCacheUrl in require.cache) {
                    text = require.cache[requireCacheUrl];
                } else {
                    if (url in theCache) {
                        text = theCache[url];
                    }
                }
            }
            if (text === notFound) {
                if (pending[url]) {
                    pending[url].push(finish);
                } else {
                    var pendingList = pending[url] = [finish];
                    getText(url, !require.async, function (text) {
                        theCache[absMid] = theCache[url] = text;
                        for (var i = 0; i < pendingList.length; ) {
                            pendingList[i++](text);
                        }
                        delete pending[url];
                    });
                }
            } else {
                finish(text);
            }
        }};
    });
}, "dojo/keys":function () {
    define(["./_base/kernel", "./sniff"], function (dojo, has) {
        return dojo.keys = {BACKSPACE:8, TAB:9, CLEAR:12, ENTER:13, SHIFT:16, CTRL:17, ALT:18, META:has("webkit") ? 91 : 224, PAUSE:19, CAPS_LOCK:20, ESCAPE:27, SPACE:32, PAGE_UP:33, PAGE_DOWN:34, END:35, HOME:36, LEFT_ARROW:37, UP_ARROW:38, RIGHT_ARROW:39, DOWN_ARROW:40, INSERT:45, DELETE:46, HELP:47, LEFT_WINDOW:91, RIGHT_WINDOW:92, SELECT:93, NUMPAD_0:96, NUMPAD_1:97, NUMPAD_2:98, NUMPAD_3:99, NUMPAD_4:100, NUMPAD_5:101, NUMPAD_6:102, NUMPAD_7:103, NUMPAD_8:104, NUMPAD_9:105, NUMPAD_MULTIPLY:106, NUMPAD_PLUS:107, NUMPAD_ENTER:108, NUMPAD_MINUS:109, NUMPAD_PERIOD:110, NUMPAD_DIVIDE:111, F1:112, F2:113, F3:114, F4:115, F5:116, F6:117, F7:118, F8:119, F9:120, F10:121, F11:122, F12:123, F13:124, F14:125, F15:126, NUM_LOCK:144, SCROLL_LOCK:145, UP_DPAD:175, DOWN_DPAD:176, LEFT_DPAD:177, RIGHT_DPAD:178, copyKey:has("mac") && !has("air") ? (has("safari") ? 91 : 224) : 17};
    });
}, "dojo/domReady":function () {
    define(["./has"], function (has) {
        var global = (function () {
            return this;
        })(), doc = document, readyStates = {"loaded":1, "complete":1}, fixReadyState = typeof doc.readyState != "string", ready = !!readyStates[doc.readyState], readyQ = [], recursiveGuard;
        function domReady(callback) {
            readyQ.push(callback);
            if (ready) {
                processQ();
            }
        }
        domReady.load = function (id, req, load) {
            domReady(load);
        };
        domReady._Q = readyQ;
        domReady._onQEmpty = function () {
        };
        if (fixReadyState) {
            doc.readyState = "loading";
        }
        function processQ() {
            if (recursiveGuard) {
                return;
            }
            recursiveGuard = true;
            while (readyQ.length) {
                try {
                    (readyQ.shift())(doc);
                }
                catch (err) {
                    console.error(err, "in domReady callback", err.stack);
                }
            }
            recursiveGuard = false;
            domReady._onQEmpty();
        }
        if (!ready) {
            var tests = [], detectReady = function (evt) {
                evt = evt || global.event;
                if (ready || (evt.type == "readystatechange" && !readyStates[doc.readyState])) {
                    return;
                }
                if (fixReadyState) {
                    doc.readyState = "complete";
                }
                ready = 1;
                processQ();
            }, on = function (node, event) {
                node.addEventListener(event, detectReady, false);
                readyQ.push(function () {
                    node.removeEventListener(event, detectReady, false);
                });
            };
            if (!has("dom-addeventlistener")) {
                on = function (node, event) {
                    event = "on" + event;
                    node.attachEvent(event, detectReady);
                    readyQ.push(function () {
                        node.detachEvent(event, detectReady);
                    });
                };
                var div = doc.createElement("div");
                try {
                    if (div.doScroll && global.frameElement === null) {
                        tests.push(function () {
                            try {
                                div.doScroll("left");
                                return 1;
                            }
                            catch (e) {
                            }
                        });
                    }
                }
                catch (e) {
                }
            }
            on(doc, "DOMContentLoaded");
            on(global, "load");
            if ("onreadystatechange" in doc) {
                on(doc, "readystatechange");
            } else {
                if (!fixReadyState) {
                    tests.push(function () {
                        return readyStates[doc.readyState];
                    });
                }
            }
            if (tests.length) {
                var poller = function () {
                    if (ready) {
                        return;
                    }
                    var i = tests.length;
                    while (i--) {
                        if (tests[i]()) {
                            detectReady("poller");
                            return;
                        }
                    }
                    setTimeout(poller, 30);
                };
                poller();
            }
        }
        return domReady;
    });
}, "dojo/promise/all":function () {
    define(["../_base/array", "../Deferred", "../when"], function (array, Deferred, when) {
        "use strict";
        var some = array.some;
        return function all(objectOrArray) {
            var object, array;
            if (objectOrArray instanceof Array) {
                array = objectOrArray;
            } else {
                if (objectOrArray && typeof objectOrArray === "object") {
                    object = objectOrArray;
                }
            }
            var results;
            var keyLookup = [];
            if (object) {
                array = [];
                for (var key in object) {
                    if (Object.hasOwnProperty.call(object, key)) {
                        keyLookup.push(key);
                        array.push(object[key]);
                    }
                }
                results = {};
            } else {
                if (array) {
                    results = [];
                }
            }
            if (!array || !array.length) {
                return new Deferred().resolve(results);
            }
            var deferred = new Deferred();
            deferred.promise.always(function () {
                results = keyLookup = null;
            });
            var waiting = array.length;
            some(array, function (valueOrPromise, index) {
                if (!object) {
                    keyLookup.push(index);
                }
                when(valueOrPromise, function (value) {
                    if (!deferred.isFulfilled()) {
                        results[keyLookup[index]] = value;
                        if (--waiting === 0) {
                            deferred.resolve(results);
                        }
                    }
                }, deferred.reject);
                return deferred.isFulfilled();
            });
            return deferred.promise;
        };
    });
}, "dojo/window":function () {
    define(["./_base/lang", "./sniff", "./_base/window", "./dom", "./dom-geometry", "./dom-style", "./dom-construct"], function (lang, has, baseWindow, dom, geom, style, domConstruct) {
        has.add("rtl-adjust-position-for-verticalScrollBar", function (win, doc) {
            var body = baseWindow.body(doc), scrollable = domConstruct.create("div", {style:{overflow:"scroll", overflowX:"visible", direction:"rtl", visibility:"hidden", position:"absolute", left:"0", top:"0", width:"64px", height:"64px"}}, body, "last"), div = domConstruct.create("div", {style:{overflow:"hidden", direction:"ltr"}}, scrollable, "last"), ret = geom.position(div).x != 0;
            scrollable.removeChild(div);
            body.removeChild(scrollable);
            return ret;
        });
        has.add("position-fixed-support", function (win, doc) {
            var body = baseWindow.body(doc), outer = domConstruct.create("span", {style:{visibility:"hidden", position:"fixed", left:"1px", top:"1px"}}, body, "last"), inner = domConstruct.create("span", {style:{position:"fixed", left:"0", top:"0"}}, outer, "last"), ret = geom.position(inner).x != geom.position(outer).x;
            outer.removeChild(inner);
            body.removeChild(outer);
            return ret;
        });
        var window = {getBox:function (doc) {
            doc = doc || baseWindow.doc;
            var scrollRoot = (doc.compatMode == "BackCompat") ? baseWindow.body(doc) : doc.documentElement, scroll = geom.docScroll(doc), w, h;
            if (1) {
                var uiWindow = window.get(doc);
                w = uiWindow.innerWidth || scrollRoot.clientWidth;
                h = uiWindow.innerHeight || scrollRoot.clientHeight;
            } else {
                w = scrollRoot.clientWidth;
                h = scrollRoot.clientHeight;
            }
            return {l:scroll.x, t:scroll.y, w:w, h:h};
        }, get:function (doc) {
            if (has("ie") && window !== document.parentWindow) {
                doc.parentWindow.execScript("document._parentWindow = window;", "Javascript");
                var win = doc._parentWindow;
                doc._parentWindow = null;
                return win;
            }
            return doc.parentWindow || doc.defaultView;
        }, scrollIntoView:function (node, pos) {
            try {
                node = dom.byId(node);
                var doc = node.ownerDocument || baseWindow.doc, body = baseWindow.body(doc), html = doc.documentElement || body.parentNode, isIE = has("ie"), isWK = has("webkit");
                if (node == body || node == html) {
                    return;
                }
                if (!(has("mozilla") || isIE || isWK || has("opera") || has("trident")) && ("scrollIntoView" in node)) {
                    node.scrollIntoView(false);
                    return;
                }
                var backCompat = doc.compatMode == "BackCompat", rootWidth = Math.min(body.clientWidth || html.clientWidth, html.clientWidth || body.clientWidth), rootHeight = Math.min(body.clientHeight || html.clientHeight, html.clientHeight || body.clientHeight), scrollRoot = (isWK || backCompat) ? body : html, nodePos = pos || geom.position(node), el = node.parentNode, isFixed = function (el) {
                    return (isIE <= 6 || (isIE == 7 && backCompat)) ? false : (has("position-fixed-support") && (style.get(el, "position").toLowerCase() == "fixed"));
                }, self = this, scrollElementBy = function (el, x, y) {
                    if (el.tagName == "BODY" || el.tagName == "HTML") {
                        self.get(el.ownerDocument).scrollBy(x, y);
                    } else {
                        x && (el.scrollLeft += x);
                        y && (el.scrollTop += y);
                    }
                };
                if (isFixed(node)) {
                    return;
                }
                while (el) {
                    if (el == body) {
                        el = scrollRoot;
                    }
                    var elPos = geom.position(el), fixedPos = isFixed(el), rtl = style.getComputedStyle(el).direction.toLowerCase() == "rtl";
                    if (el == scrollRoot) {
                        elPos.w = rootWidth;
                        elPos.h = rootHeight;
                        if (scrollRoot == html && (isIE || has("trident")) && rtl) {
                            elPos.x += scrollRoot.offsetWidth - elPos.w;
                        }
                        if (elPos.x < 0 || !isIE || isIE >= 9 || has("trident")) {
                            elPos.x = 0;
                        }
                        if (elPos.y < 0 || !isIE || isIE >= 9 || has("trident")) {
                            elPos.y = 0;
                        }
                    } else {
                        var pb = geom.getPadBorderExtents(el);
                        elPos.w -= pb.w;
                        elPos.h -= pb.h;
                        elPos.x += pb.l;
                        elPos.y += pb.t;
                        var clientSize = el.clientWidth, scrollBarSize = elPos.w - clientSize;
                        if (clientSize > 0 && scrollBarSize > 0) {
                            if (rtl && has("rtl-adjust-position-for-verticalScrollBar")) {
                                elPos.x += scrollBarSize;
                            }
                            elPos.w = clientSize;
                        }
                        clientSize = el.clientHeight;
                        scrollBarSize = elPos.h - clientSize;
                        if (clientSize > 0 && scrollBarSize > 0) {
                            elPos.h = clientSize;
                        }
                    }
                    if (fixedPos) {
                        if (elPos.y < 0) {
                            elPos.h += elPos.y;
                            elPos.y = 0;
                        }
                        if (elPos.x < 0) {
                            elPos.w += elPos.x;
                            elPos.x = 0;
                        }
                        if (elPos.y + elPos.h > rootHeight) {
                            elPos.h = rootHeight - elPos.y;
                        }
                        if (elPos.x + elPos.w > rootWidth) {
                            elPos.w = rootWidth - elPos.x;
                        }
                    }
                    var l = nodePos.x - elPos.x, t = nodePos.y - elPos.y, r = l + nodePos.w - elPos.w, bot = t + nodePos.h - elPos.h;
                    var s, old;
                    if (r * l > 0 && (!!el.scrollLeft || el == scrollRoot || el.scrollWidth > el.offsetHeight)) {
                        s = Math[l < 0 ? "max" : "min"](l, r);
                        if (rtl && ((isIE == 8 && !backCompat) || isIE >= 9 || has("trident"))) {
                            s = -s;
                        }
                        old = el.scrollLeft;
                        scrollElementBy(el, s, 0);
                        s = el.scrollLeft - old;
                        nodePos.x -= s;
                    }
                    if (bot * t > 0 && (!!el.scrollTop || el == scrollRoot || el.scrollHeight > el.offsetHeight)) {
                        s = Math.ceil(Math[t < 0 ? "max" : "min"](t, bot));
                        old = el.scrollTop;
                        scrollElementBy(el, 0, s);
                        s = el.scrollTop - old;
                        nodePos.y -= s;
                    }
                    el = (el != scrollRoot) && !fixedPos && el.parentNode;
                }
            }
            catch (error) {
                console.error("scrollIntoView: " + error);
                node.scrollIntoView(false);
            }
        }};
        1 && lang.setObject("dojo.window", window);
        return window;
    });
}, "dojo/mouse":function () {
    define(["./_base/kernel", "./on", "./has", "./dom", "./_base/window"], function (dojo, on, has, dom, win) {
        has.add("dom-quirks", win.doc && win.doc.compatMode == "BackCompat");
        has.add("events-mouseenter", win.doc && "onmouseenter" in win.doc.createElement("div"));
        has.add("events-mousewheel", win.doc && "onmousewheel" in win.doc);
        var mouseButtons;
        if ((has("dom-quirks") && has("ie")) || !has("dom-addeventlistener")) {
            mouseButtons = {LEFT:1, MIDDLE:4, RIGHT:2, isButton:function (e, button) {
                return e.button & button;
            }, isLeft:function (e) {
                return e.button & 1;
            }, isMiddle:function (e) {
                return e.button & 4;
            }, isRight:function (e) {
                return e.button & 2;
            }};
        } else {
            mouseButtons = {LEFT:0, MIDDLE:1, RIGHT:2, isButton:function (e, button) {
                return e.button == button;
            }, isLeft:function (e) {
                return e.button == 0;
            }, isMiddle:function (e) {
                return e.button == 1;
            }, isRight:function (e) {
                return e.button == 2;
            }};
        }
        dojo.mouseButtons = mouseButtons;
        function eventHandler(type, selectHandler) {
            var handler = function (node, listener) {
                return on(node, type, function (evt) {
                    if (selectHandler) {
                        return selectHandler(evt, listener);
                    }
                    if (!dom.isDescendant(evt.relatedTarget, node)) {
                        return listener.call(this, evt);
                    }
                });
            };
            handler.bubble = function (select) {
                return eventHandler(type, function (evt, listener) {
                    var target = select(evt.target);
                    var relatedTarget = evt.relatedTarget;
                    if (target && (target != (relatedTarget && relatedTarget.nodeType == 1 && select(relatedTarget)))) {
                        return listener.call(target, evt);
                    }
                });
            };
            return handler;
        }
        var wheel;
        if (has("events-mousewheel")) {
            wheel = "mousewheel";
        } else {
            wheel = function (node, listener) {
                return on(node, "DOMMouseScroll", function (evt) {
                    evt.wheelDelta = -evt.detail;
                    listener.call(this, evt);
                });
            };
        }
        return {_eventHandler:eventHandler, enter:eventHandler("mouseover"), leave:eventHandler("mouseout"), wheel:wheel, isLeft:mouseButtons.isLeft, isMiddle:mouseButtons.isMiddle, isRight:mouseButtons.isRight};
    });
}, "dojo/topic":function () {
    define(["./Evented"], function (Evented) {
        var hub = new Evented;
        return {publish:function (topic, event) {
            return hub.emit.apply(hub, arguments);
        }, subscribe:function (topic, listener) {
            return hub.on.apply(hub, arguments);
        }};
    });
}, "dojo/_base/xhr":function () {
    define(["./kernel", "./sniff", "require", "../io-query", "../dom", "../dom-form", "./Deferred", "./config", "./json", "./lang", "./array", "../on", "../aspect", "../request/watch", "../request/xhr", "../request/util"], function (dojo, has, require, ioq, dom, domForm, Deferred, config, json, lang, array, on, aspect, watch, _xhr, util) {
        dojo._xhrObj = _xhr._create;
        var cfg = dojo.config;
        dojo.objectToQuery = ioq.objectToQuery;
        dojo.queryToObject = ioq.queryToObject;
        dojo.fieldToObject = domForm.fieldToObject;
        dojo.formToObject = domForm.toObject;
        dojo.formToQuery = domForm.toQuery;
        dojo.formToJson = domForm.toJson;
        dojo._blockAsync = false;
        var handlers = dojo._contentHandlers = dojo.contentHandlers = {"text":function (xhr) {
            return xhr.responseText;
        }, "json":function (xhr) {
            return json.fromJson(xhr.responseText || null);
        }, "json-comment-filtered":function (xhr) {
            if (!config.useCommentedJson) {
                console.warn("Consider using the standard mimetype:application/json." + " json-commenting can introduce security issues. To" + " decrease the chances of hijacking, use the standard the 'json' handler and" + " prefix your json with: {}&&\n" + "Use djConfig.useCommentedJson=true to turn off this message.");
            }
            var value = xhr.responseText;
            var cStartIdx = value.indexOf("/*");
            var cEndIdx = value.lastIndexOf("*/");
            if (cStartIdx == -1 || cEndIdx == -1) {
                throw new Error("JSON was not comment filtered");
            }
            return json.fromJson(value.substring(cStartIdx + 2, cEndIdx));
        }, "javascript":function (xhr) {
            return dojo.eval(xhr.responseText);
        }, "xml":function (xhr) {
            var result = xhr.responseXML;
            if (result && has("dom-qsa2.1") && !result.querySelectorAll && has("dom-parser")) {
                result = new DOMParser().parseFromString(xhr.responseText, "application/xml");
            }
            if (has("ie")) {
                if ((!result || !result.documentElement)) {
                    var ms = function (n) {
                        return "MSXML" + n + ".DOMDocument";
                    };
                    var dp = ["Microsoft.XMLDOM", ms(6), ms(4), ms(3), ms(2)];
                    array.some(dp, function (p) {
                        try {
                            var dom = new ActiveXObject(p);
                            dom.async = false;
                            dom.loadXML(xhr.responseText);
                            result = dom;
                        }
                        catch (e) {
                            return false;
                        }
                        return true;
                    });
                }
            }
            return result;
        }, "json-comment-optional":function (xhr) {
            if (xhr.responseText && /^[^{\[]*\/\*/.test(xhr.responseText)) {
                return handlers["json-comment-filtered"](xhr);
            } else {
                return handlers["json"](xhr);
            }
        }};
        dojo._ioSetArgs = function (args, canceller, okHandler, errHandler) {
            var ioArgs = {args:args, url:args.url};
            var formObject = null;
            if (args.form) {
                var form = dom.byId(args.form);
                var actnNode = form.getAttributeNode("action");
                ioArgs.url = ioArgs.url || (actnNode ? actnNode.value : null);
                formObject = domForm.toObject(form);
            }
            var miArgs = [{}];
            if (formObject) {
                miArgs.push(formObject);
            }
            if (args.content) {
                miArgs.push(args.content);
            }
            if (args.preventCache) {
                miArgs.push({"dojo.preventCache":new Date().valueOf()});
            }
            ioArgs.query = ioq.objectToQuery(lang.mixin.apply(null, miArgs));
            ioArgs.handleAs = args.handleAs || "text";
            var d = new Deferred(function (dfd) {
                dfd.canceled = true;
                canceller && canceller(dfd);
                var err = dfd.ioArgs.error;
                if (!err) {
                    err = new Error("request cancelled");
                    err.dojoType = "cancel";
                    dfd.ioArgs.error = err;
                }
                return err;
            });
            d.addCallback(okHandler);
            var ld = args.load;
            if (ld && lang.isFunction(ld)) {
                d.addCallback(function (value) {
                    return ld.call(args, value, ioArgs);
                });
            }
            var err = args.error;
            if (err && lang.isFunction(err)) {
                d.addErrback(function (value) {
                    return err.call(args, value, ioArgs);
                });
            }
            var handle = args.handle;
            if (handle && lang.isFunction(handle)) {
                d.addBoth(function (value) {
                    return handle.call(args, value, ioArgs);
                });
            }
            d.addErrback(function (error) {
                return errHandler(error, d);
            });
            if (cfg.ioPublish && dojo.publish && ioArgs.args.ioPublish !== false) {
                d.addCallbacks(function (res) {
                    dojo.publish("/dojo/io/load", [d, res]);
                    return res;
                }, function (res) {
                    dojo.publish("/dojo/io/error", [d, res]);
                    return res;
                });
                d.addBoth(function (res) {
                    dojo.publish("/dojo/io/done", [d, res]);
                    return res;
                });
            }
            d.ioArgs = ioArgs;
            return d;
        };
        var _deferredOk = function (dfd) {
            var ret = handlers[dfd.ioArgs.handleAs](dfd.ioArgs.xhr);
            return ret === undefined ? null : ret;
        };
        var _deferError = function (error, dfd) {
            if (!dfd.ioArgs.args.failOk) {
                console.error(error);
            }
            return error;
        };
        var _checkPubCount = function (dfd) {
            if (_pubCount <= 0) {
                _pubCount = 0;
                if (cfg.ioPublish && dojo.publish && (!dfd || dfd && dfd.ioArgs.args.ioPublish !== false)) {
                    dojo.publish("/dojo/io/stop");
                }
            }
        };
        var _pubCount = 0;
        aspect.after(watch, "_onAction", function () {
            _pubCount -= 1;
        });
        aspect.after(watch, "_onInFlight", _checkPubCount);
        dojo._ioCancelAll = watch.cancelAll;
        dojo._ioNotifyStart = function (dfd) {
            if (cfg.ioPublish && dojo.publish && dfd.ioArgs.args.ioPublish !== false) {
                if (!_pubCount) {
                    dojo.publish("/dojo/io/start");
                }
                _pubCount += 1;
                dojo.publish("/dojo/io/send", [dfd]);
            }
        };
        dojo._ioWatch = function (dfd, validCheck, ioCheck, resHandle) {
            var args = dfd.ioArgs.options = dfd.ioArgs.args;
            lang.mixin(dfd, {response:dfd.ioArgs, isValid:function (response) {
                return validCheck(dfd);
            }, isReady:function (response) {
                return ioCheck(dfd);
            }, handleResponse:function (response) {
                return resHandle(dfd);
            }});
            watch(dfd);
            _checkPubCount(dfd);
        };
        var _defaultContentType = "application/x-www-form-urlencoded";
        dojo._ioAddQueryToUrl = function (ioArgs) {
            if (ioArgs.query.length) {
                ioArgs.url += (ioArgs.url.indexOf("?") == -1 ? "?" : "&") + ioArgs.query;
                ioArgs.query = null;
            }
        };
        dojo.xhr = function (method, args, hasBody) {
            var rDfd;
            var dfd = dojo._ioSetArgs(args, function (dfd) {
                rDfd && rDfd.cancel();
            }, _deferredOk, _deferError);
            var ioArgs = dfd.ioArgs;
            if ("postData" in args) {
                ioArgs.query = args.postData;
            } else {
                if ("putData" in args) {
                    ioArgs.query = args.putData;
                } else {
                    if ("rawBody" in args) {
                        ioArgs.query = args.rawBody;
                    } else {
                        if ((arguments.length > 2 && !hasBody) || "POST|PUT".indexOf(method.toUpperCase()) === -1) {
                            dojo._ioAddQueryToUrl(ioArgs);
                        }
                    }
                }
            }
            var options = {method:method, handleAs:"text", timeout:args.timeout, withCredentials:args.withCredentials, ioArgs:ioArgs};
            if (typeof args.headers !== "undefined") {
                options.headers = args.headers;
            }
            if (typeof args.contentType !== "undefined") {
                if (!options.headers) {
                    options.headers = {};
                }
                options.headers["Content-Type"] = args.contentType;
            }
            if (typeof ioArgs.query !== "undefined") {
                options.data = ioArgs.query;
            }
            if (typeof args.sync !== "undefined") {
                options.sync = args.sync;
            }
            dojo._ioNotifyStart(dfd);
            try {
                rDfd = _xhr(ioArgs.url, options, true);
            }
            catch (e) {
                dfd.cancel();
                return dfd;
            }
            dfd.ioArgs.xhr = rDfd.response.xhr;
            rDfd.then(function () {
                dfd.resolve(dfd);
            }).otherwise(function (error) {
                ioArgs.error = error;
                if (error.response) {
                    error.status = error.response.status;
                    error.responseText = error.response.text;
                    error.xhr = error.response.xhr;
                }
                dfd.reject(error);
            });
            return dfd;
        };
        dojo.xhrGet = function (args) {
            return dojo.xhr("GET", args);
        };
        dojo.rawXhrPost = dojo.xhrPost = function (args) {
            return dojo.xhr("POST", args, true);
        };
        dojo.rawXhrPut = dojo.xhrPut = function (args) {
            return dojo.xhr("PUT", args, true);
        };
        dojo.xhrDelete = function (args) {
            return dojo.xhr("DELETE", args);
        };
        dojo._isDocumentOk = function (x) {
            return util.checkStatus(x.status);
        };
        dojo._getText = function (url) {
            var result;
            dojo.xhrGet({url:url, sync:true, load:function (text) {
                result = text;
            }});
            return result;
        };
        lang.mixin(dojo.xhr, {_xhrObj:dojo._xhrObj, fieldToObject:domForm.fieldToObject, formToObject:domForm.toObject, objectToQuery:ioq.objectToQuery, formToQuery:domForm.toQuery, formToJson:domForm.toJson, queryToObject:ioq.queryToObject, contentHandlers:handlers, _ioSetArgs:dojo._ioSetArgs, _ioCancelAll:dojo._ioCancelAll, _ioNotifyStart:dojo._ioNotifyStart, _ioWatch:dojo._ioWatch, _ioAddQueryToUrl:dojo._ioAddQueryToUrl, _isDocumentOk:dojo._isDocumentOk, _getText:dojo._getText, get:dojo.xhrGet, post:dojo.xhrPost, put:dojo.xhrPut, del:dojo.xhrDelete});
        return dojo.xhr;
    });
}, "dojo/_base/unload":function () {
    define(["./kernel", "./lang", "../on"], function (dojo, lang, on) {
        var win = window;
        var unload = {addOnWindowUnload:function (obj, functionName) {
            if (!dojo.windowUnloaded) {
                on(win, "unload", (dojo.windowUnloaded = function () {
                }));
            }
            on(win, "unload", lang.hitch(obj, functionName));
        }, addOnUnload:function (obj, functionName) {
            on(win, "beforeunload", lang.hitch(obj, functionName));
        }};
        dojo.addOnWindowUnload = unload.addOnWindowUnload;
        dojo.addOnUnload = unload.addOnUnload;
        return unload;
    });
}, "dojo/_base/NodeList":function () {
    define(["./kernel", "../query", "./array", "./html", "../NodeList-dom"], function (dojo, query, array) {
        var NodeList = query.NodeList, nlp = NodeList.prototype;
        nlp.connect = NodeList._adaptAsForEach(function () {
            return dojo.connect.apply(this, arguments);
        });
        nlp.coords = NodeList._adaptAsMap(dojo.coords);
        NodeList.events = ["blur", "focus", "change", "click", "error", "keydown", "keypress", "keyup", "load", "mousedown", "mouseenter", "mouseleave", "mousemove", "mouseout", "mouseover", "mouseup", "submit"];
        array.forEach(NodeList.events, function (evt) {
            var _oe = "on" + evt;
            nlp[_oe] = function (a, b) {
                return this.connect(_oe, a, b);
            };
        });
        dojo.NodeList = NodeList;
        return NodeList;
    });
}, "dojox/gesture/Base":function () {
    define(["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/array", "dojo/_base/lang", "dojo/dom", "dojo/on", "dojo/touch", "dojo/has", "../main"], function (kernel, declare, array, lang, dom, on, touch, has, dojox) {
        kernel.experimental("dojox.gesture.Base");
        lang.getObject("gesture", true, dojox);
        return declare(null, {defaultEvent:" ", subEvents:[], touchOnly:false, _elements:null, constructor:function (args) {
            lang.mixin(this, args);
            this.init();
        }, init:function () {
            this._elements = [];
            if (!1 && this.touchOnly) {
                console.warn("Gestures:[", this.defaultEvent, "] is only supported on touch devices!");
                return;
            }
            var evt = this.defaultEvent;
            this.call = this._handle(evt);
            this._events = [evt];
            array.forEach(this.subEvents, function (subEvt) {
                this[subEvt] = this._handle(evt + "." + subEvt);
                this._events.push(evt + "." + subEvt);
            }, this);
        }, _handle:function (eventType) {
            var self = this;
            return function (node, listener) {
                var a = arguments;
                if (a.length > 2) {
                    node = a[1];
                    listener = a[2];
                }
                var isNode = node && (node.nodeType || node.attachEvent || node.addEventListener);
                if (!isNode) {
                    return on(node, eventType, listener);
                } else {
                    var onHandle = self._add(node, eventType, listener);
                    var signal = {remove:function () {
                        onHandle.remove();
                        self._remove(node, eventType);
                    }};
                    return signal;
                }
            };
        }, _add:function (node, type, listener) {
            var element = this._getGestureElement(node);
            if (!element) {
                element = {target:node, data:{}, handles:{}};
                var _press = lang.hitch(this, "_process", element, "press");
                var _move = lang.hitch(this, "_process", element, "move");
                var _release = lang.hitch(this, "_process", element, "release");
                var _cancel = lang.hitch(this, "_process", element, "cancel");
                var handles = element.handles;
                if (this.touchOnly) {
                    handles.press = on(node, "touchstart", _press);
                    handles.move = on(node, "touchmove", _move);
                    handles.release = on(node, "touchend", _release);
                    handles.cancel = on(node, "touchcancel", _cancel);
                } else {
                    handles.press = touch.press(node, _press);
                    handles.move = touch.move(node, _move);
                    handles.release = touch.release(node, _release);
                    handles.cancel = touch.cancel(node, _cancel);
                }
                this._elements.push(element);
            }
            element.handles[type] = !element.handles[type] ? 1 : ++element.handles[type];
            return on(node, type, listener);
        }, _getGestureElement:function (node) {
            var i = 0, element;
            for (; i < this._elements.length; i++) {
                element = this._elements[i];
                if (element.target === node) {
                    return element;
                }
            }
        }, _process:function (element, phase, e) {
            e._locking = e._locking || {};
            if (e._locking[this.defaultEvent] || this.isLocked(e.currentTarget)) {
                return;
            }
            if ((e.target.tagName != "INPUT" || e.target.type == "radio" || e.target.type == "checkbox") && e.target.tagName != "TEXTAREA") {
                e.preventDefault();
            }
            e._locking[this.defaultEvent] = true;
            this[phase](element.data, e);
        }, press:function (data, e) {
        }, move:function (data, e) {
        }, release:function (data, e) {
        }, cancel:function (data, e) {
        }, fire:function (node, event) {
            if (!node || !event) {
                return;
            }
            event.bubbles = true;
            event.cancelable = true;
            on.emit(node, event.type, event);
        }, _remove:function (node, type) {
            var element = this._getGestureElement(node);
            if (!element || !element.handles) {
                return;
            }
            element.handles[type]--;
            var handles = element.handles;
            if (!array.some(this._events, function (evt) {
                return handles[evt] > 0;
            })) {
                this._cleanHandles(handles);
                var i = array.indexOf(this._elements, element);
                if (i >= 0) {
                    this._elements.splice(i, 1);
                }
            }
        }, _cleanHandles:function (handles) {
            for (var x in handles) {
                if (handles[x].remove) {
                    handles[x].remove();
                }
                delete handles[x];
            }
        }, lock:function (node) {
            this._lock = node;
        }, unLock:function () {
            this._lock = null;
        }, isLocked:function (node) {
            if (!this._lock || !node) {
                return false;
            }
            return this._lock !== node && dom.isDescendant(node, this._lock);
        }, destroy:function () {
            array.forEach(this._elements, function (element) {
                this._cleanHandles(element.handles);
            }, this);
            this._elements = null;
        }});
    });
}, "dojo/_base/Color":function () {
    define(["./kernel", "./lang", "./array", "./config"], function (dojo, lang, ArrayUtil, config) {
        var Color = dojo.Color = function (color) {
            if (color) {
                this.setColor(color);
            }
        };
        Color.named = {"black":[0, 0, 0], "silver":[192, 192, 192], "gray":[128, 128, 128], "white":[255, 255, 255], "maroon":[128, 0, 0], "red":[255, 0, 0], "purple":[128, 0, 128], "fuchsia":[255, 0, 255], "green":[0, 128, 0], "lime":[0, 255, 0], "olive":[128, 128, 0], "yellow":[255, 255, 0], "navy":[0, 0, 128], "blue":[0, 0, 255], "teal":[0, 128, 128], "aqua":[0, 255, 255], "transparent":config.transparentColor || [0, 0, 0, 0]};
        lang.extend(Color, {r:255, g:255, b:255, a:1, _set:function (r, g, b, a) {
            var t = this;
            t.r = r;
            t.g = g;
            t.b = b;
            t.a = a;
        }, setColor:function (color) {
            if (lang.isString(color)) {
                Color.fromString(color, this);
            } else {
                if (lang.isArray(color)) {
                    Color.fromArray(color, this);
                } else {
                    this._set(color.r, color.g, color.b, color.a);
                    if (!(color instanceof Color)) {
                        this.sanitize();
                    }
                }
            }
            return this;
        }, sanitize:function () {
            return this;
        }, toRgb:function () {
            var t = this;
            return [t.r, t.g, t.b];
        }, toRgba:function () {
            var t = this;
            return [t.r, t.g, t.b, t.a];
        }, toHex:function () {
            var arr = ArrayUtil.map(["r", "g", "b"], function (x) {
                var s = this[x].toString(16);
                return s.length < 2 ? "0" + s : s;
            }, this);
            return "#" + arr.join("");
        }, toCss:function (includeAlpha) {
            var t = this, rgb = t.r + ", " + t.g + ", " + t.b;
            return (includeAlpha ? "rgba(" + rgb + ", " + t.a : "rgb(" + rgb) + ")";
        }, toString:function () {
            return this.toCss(true);
        }});
        Color.blendColors = dojo.blendColors = function (start, end, weight, obj) {
            var t = obj || new Color();
            ArrayUtil.forEach(["r", "g", "b", "a"], function (x) {
                t[x] = start[x] + (end[x] - start[x]) * weight;
                if (x != "a") {
                    t[x] = Math.round(t[x]);
                }
            });
            return t.sanitize();
        };
        Color.fromRgb = dojo.colorFromRgb = function (color, obj) {
            var m = color.toLowerCase().match(/^rgba?\(([\s\.,0-9]+)\)/);
            return m && Color.fromArray(m[1].split(/\s*,\s*/), obj);
        };
        Color.fromHex = dojo.colorFromHex = function (color, obj) {
            var t = obj || new Color(), bits = (color.length == 4) ? 4 : 8, mask = (1 << bits) - 1;
            color = Number("0x" + color.substr(1));
            if (isNaN(color)) {
                return null;
            }
            ArrayUtil.forEach(["b", "g", "r"], function (x) {
                var c = color & mask;
                color >>= bits;
                t[x] = bits == 4 ? 17 * c : c;
            });
            t.a = 1;
            return t;
        };
        Color.fromArray = dojo.colorFromArray = function (a, obj) {
            var t = obj || new Color();
            t._set(Number(a[0]), Number(a[1]), Number(a[2]), Number(a[3]));
            if (isNaN(t.a)) {
                t.a = 1;
            }
            return t.sanitize();
        };
        Color.fromString = dojo.colorFromString = function (str, obj) {
            var a = Color.named[str];
            return a && Color.fromArray(a, obj) || Color.fromRgb(str, obj) || Color.fromHex(str, obj);
        };
        return Color;
    });
}, "dojo/request":function () {
    define(["./request/default!"], function (request) {
        return request;
    });
}, "dojo/selector/_loader":function () {
    define(["../has", "require"], function (has, require) {
        "use strict";
        var testDiv = document.createElement("div");
        has.add("dom-qsa2.1", !!testDiv.querySelectorAll);
        has.add("dom-qsa3", function () {
            try {
                testDiv.innerHTML = "<p class='TEST'></p>";
                return testDiv.querySelectorAll(".TEST:empty").length == 1;
            }
            catch (e) {
            }
        });
        var fullEngine;
        var acme = "./acme", lite = "./lite";
        return {load:function (id, parentRequire, loaded, config) {
            var req = require;
            id = id == "default" ? has("config-selectorEngine") || "css3" : id;
            id = id == "css2" || id == "lite" ? lite : id == "css2.1" ? has("dom-qsa2.1") ? lite : acme : id == "css3" ? has("dom-qsa3") ? lite : acme : id == "acme" ? acme : (req = parentRequire) && id;
            if (id.charAt(id.length - 1) == "?") {
                id = id.substring(0, id.length - 1);
                var optionalLoad = true;
            }
            if (optionalLoad && (has("dom-compliant-qsa") || fullEngine)) {
                return loaded(fullEngine);
            }
            req([id], function (engine) {
                if (id != "./lite") {
                    fullEngine = engine;
                }
                loaded(engine);
            });
        }};
    });
}, "dojox/gesture/tap":function () {
    define(["dojo/_base/kernel", "dojo/_base/declare", "dojo/_base/lang", "./Base", "../main"], function (kernel, declare, lang, Base, dojox) {
        kernel.experimental("dojox.gesture.tap");
        var clz = declare(Base, {defaultEvent:"tap", subEvents:["hold", "doubletap"], holdThreshold:500, doubleTapTimeout:250, tapRadius:10, press:function (data, e) {
            if (e.touches && e.touches.length >= 2) {
                clearTimeout(data.tapTimeOut);
                delete data.context;
                return;
            }
            var target = e.target;
            this._initTap(data, e);
            data.tapTimeOut = setTimeout(lang.hitch(this, function () {
                if (this._isTap(data, e)) {
                    this.fire(target, {type:"tap.hold"});
                }
                delete data.context;
            }), this.holdThreshold);
        }, release:function (data, e) {
            if (!data.context) {
                clearTimeout(data.tapTimeOut);
                return;
            }
            if (this._isTap(data, e)) {
                switch (data.context.c) {
                  case 1:
                    this.fire(e.target, {type:"tap"});
                    break;
                  case 2:
                    this.fire(e.target, {type:"tap.doubletap"});
                    break;
                }
            }
            clearTimeout(data.tapTimeOut);
        }, _initTap:function (data, e) {
            if (!data.context) {
                data.context = {x:0, y:0, t:0, c:0};
            }
            var ct = new Date().getTime();
            if (ct - data.context.t <= this.doubleTapTimeout) {
                data.context.c++;
            } else {
                data.context.c = 1;
                data.context.x = e.screenX;
                data.context.y = e.screenY;
            }
            data.context.t = ct;
        }, _isTap:function (data, e) {
            var dx = Math.abs(data.context.x - e.screenX);
            var dy = Math.abs(data.context.y - e.screenY);
            return dx <= this.tapRadius && dy <= this.tapRadius;
        }});
        dojox.gesture.tap = new clz();
        dojox.gesture.tap.Tap = clz;
        return dojox.gesture.tap;
    });
}, "dojo/_base/sniff":function () {
    define(["./kernel", "./lang", "../sniff"], function (dojo, lang, has) {
        if (!1) {
            return has;
        }
        dojo._name = "browser";
        lang.mixin(dojo, {isBrowser:true, isFF:has("ff"), isIE:has("ie"), isKhtml:has("khtml"), isWebKit:has("webkit"), isMozilla:has("mozilla"), isMoz:has("mozilla"), isOpera:has("opera"), isSafari:has("safari"), isChrome:has("chrome"), isMac:has("mac"), isIos:has("ios"), isAndroid:has("android"), isWii:has("wii"), isQuirks:has("quirks"), isAir:has("air")});
        return has;
    });
}, "dojo/parser":function () {
    define(["require", "./_base/kernel", "./_base/lang", "./_base/array", "./_base/config", "./dom", "./_base/window", "./_base/url", "./aspect", "./promise/all", "./date/stamp", "./Deferred", "./has", "./query", "./on", "./ready"], function (require, dojo, dlang, darray, config, dom, dwindow, _Url, aspect, all, dates, Deferred, has, query, don, ready) {
        new Date("X");
        function myEval(text) {
            return eval("(" + text + ")");
        }
        var extendCnt = 0;
        aspect.after(dlang, "extend", function () {
            extendCnt++;
        }, true);
        function getNameMap(ctor) {
            var map = ctor._nameCaseMap, proto = ctor.prototype;
            if (!map || map._extendCnt < extendCnt) {
                map = ctor._nameCaseMap = {};
                for (var name in proto) {
                    if (name.charAt(0) === "_") {
                        continue;
                    }
                    map[name.toLowerCase()] = name;
                }
                map._extendCnt = extendCnt;
            }
            return map;
        }
        var _ctorMap = {};
        function getCtor(types, contextRequire) {
            var ts = types.join();
            if (!_ctorMap[ts]) {
                var mixins = [];
                for (var i = 0, l = types.length; i < l; i++) {
                    var t = types[i];
                    mixins[mixins.length] = (_ctorMap[t] = _ctorMap[t] || (dlang.getObject(t) || (~t.indexOf("/") && (contextRequire ? contextRequire(t) : require(t)))));
                }
                var ctor = mixins.shift();
                _ctorMap[ts] = mixins.length ? (ctor.createSubclass ? ctor.createSubclass(mixins) : ctor.extend.apply(ctor, mixins)) : ctor;
            }
            return _ctorMap[ts];
        }
        var parser = {_clearCache:function () {
            extendCnt++;
            _ctorMap = {};
        }, _functionFromScript:function (script, attrData) {
            var preamble = "", suffix = "", argsStr = (script.getAttribute(attrData + "args") || script.getAttribute("args")), withStr = script.getAttribute("with");
            var fnArgs = (argsStr || "").split(/\s*,\s*/);
            if (withStr && withStr.length) {
                darray.forEach(withStr.split(/\s*,\s*/), function (part) {
                    preamble += "with(" + part + "){";
                    suffix += "}";
                });
            }
            return new Function(fnArgs, preamble + script.innerHTML + suffix);
        }, instantiate:function (nodes, mixin, options) {
            mixin = mixin || {};
            options = options || {};
            var dojoType = (options.scope || dojo._scopeName) + "Type", attrData = "data-" + (options.scope || dojo._scopeName) + "-", dataDojoType = attrData + "type", dataDojoMixins = attrData + "mixins";
            var list = [];
            darray.forEach(nodes, function (node) {
                var type = dojoType in mixin ? mixin[dojoType] : node.getAttribute(dataDojoType) || node.getAttribute(dojoType);
                if (type) {
                    var mixinsValue = node.getAttribute(dataDojoMixins), types = mixinsValue ? [type].concat(mixinsValue.split(/\s*,\s*/)) : [type];
                    list.push({node:node, types:types});
                }
            });
            return this._instantiate(list, mixin, options);
        }, _instantiate:function (nodes, mixin, options, returnPromise) {
            var thelist = darray.map(nodes, function (obj) {
                var ctor = obj.ctor || getCtor(obj.types, options.contextRequire);
                if (!ctor) {
                    throw new Error("Unable to resolve constructor for: '" + obj.types.join() + "'");
                }
                return this.construct(ctor, obj.node, mixin, options, obj.scripts, obj.inherited);
            }, this);
            function onConstruct(thelist) {
                if (!mixin._started && !options.noStart) {
                    darray.forEach(thelist, function (instance) {
                        if (typeof instance.startup === "function" && !instance._started) {
                            instance.startup();
                        }
                    });
                }
                return thelist;
            }
            if (returnPromise) {
                return all(thelist).then(onConstruct);
            } else {
                return onConstruct(thelist);
            }
        }, construct:function (ctor, node, mixin, options, scripts, inherited) {
            var proto = ctor && ctor.prototype;
            options = options || {};
            var params = {};
            if (options.defaults) {
                dlang.mixin(params, options.defaults);
            }
            if (inherited) {
                dlang.mixin(params, inherited);
            }
            var attributes;
            if (has("dom-attributes-explicit")) {
                attributes = node.attributes;
            } else {
                if (has("dom-attributes-specified-flag")) {
                    attributes = darray.filter(node.attributes, function (a) {
                        return a.specified;
                    });
                } else {
                    var clone = /^input$|^img$/i.test(node.nodeName) ? node : node.cloneNode(false), attrs = clone.outerHTML.replace(/=[^\s"']+|="[^"]*"|='[^']*'/g, "").replace(/^\s*<[a-zA-Z0-9]*\s*/, "").replace(/\s*>.*$/, "");
                    attributes = darray.map(attrs.split(/\s+/), function (name) {
                        var lcName = name.toLowerCase();
                        return {name:name, value:(node.nodeName == "LI" && name == "value") || lcName == "enctype" ? node.getAttribute(lcName) : node.getAttributeNode(lcName).value};
                    });
                }
            }
            var scope = options.scope || dojo._scopeName, attrData = "data-" + scope + "-", hash = {};
            if (scope !== "dojo") {
                hash[attrData + "props"] = "data-dojo-props";
                hash[attrData + "type"] = "data-dojo-type";
                hash[attrData + "mixins"] = "data-dojo-mixins";
                hash[scope + "type"] = "dojoType";
                hash[attrData + "id"] = "data-dojo-id";
            }
            var i = 0, item, funcAttrs = [], jsname, extra;
            while (item = attributes[i++]) {
                var name = item.name, lcName = name.toLowerCase(), value = item.value;
                switch (hash[lcName] || lcName) {
                  case "data-dojo-type":
                  case "dojotype":
                  case "data-dojo-mixins":
                    break;
                  case "data-dojo-props":
                    extra = value;
                    break;
                  case "data-dojo-id":
                  case "jsid":
                    jsname = value;
                    break;
                  case "data-dojo-attach-point":
                  case "dojoattachpoint":
                    params.dojoAttachPoint = value;
                    break;
                  case "data-dojo-attach-event":
                  case "dojoattachevent":
                    params.dojoAttachEvent = value;
                    break;
                  case "class":
                    params["class"] = node.className;
                    break;
                  case "style":
                    params["style"] = node.style && node.style.cssText;
                    break;
                  default:
                    if (!(name in proto)) {
                        var map = getNameMap(ctor);
                        name = map[lcName] || name;
                    }
                    if (name in proto) {
                        switch (typeof proto[name]) {
                          case "string":
                            params[name] = value;
                            break;
                          case "number":
                            params[name] = value.length ? Number(value) : NaN;
                            break;
                          case "boolean":
                            params[name] = value.toLowerCase() != "false";
                            break;
                          case "function":
                            if (value === "" || value.search(/[^\w\.]+/i) != -1) {
                                params[name] = new Function(value);
                            } else {
                                params[name] = dlang.getObject(value, false) || new Function(value);
                            }
                            funcAttrs.push(name);
                            break;
                          default:
                            var pVal = proto[name];
                            params[name] = (pVal && "length" in pVal) ? (value ? value.split(/\s*,\s*/) : []) : (pVal instanceof Date) ? (value == "" ? new Date("") : value == "now" ? new Date() : dates.fromISOString(value)) : (pVal instanceof _Url) ? (dojo.baseUrl + value) : myEval(value);
                        }
                    } else {
                        params[name] = value;
                    }
                }
            }
            for (var j = 0; j < funcAttrs.length; j++) {
                var lcfname = funcAttrs[j].toLowerCase();
                node.removeAttribute(lcfname);
                node[lcfname] = null;
            }
            if (extra) {
                try {
                    extra = myEval.call(options.propsThis, "{" + extra + "}");
                    dlang.mixin(params, extra);
                }
                catch (e) {
                    throw new Error(e.toString() + " in data-dojo-props='" + extra + "'");
                }
            }
            dlang.mixin(params, mixin);
            if (!scripts) {
                scripts = (ctor && (ctor._noScript || proto._noScript) ? [] : query("> script[type^='dojo/']", node));
            }
            var aspects = [], calls = [], watches = [], ons = [];
            if (scripts) {
                for (i = 0; i < scripts.length; i++) {
                    var script = scripts[i];
                    node.removeChild(script);
                    var event = (script.getAttribute(attrData + "event") || script.getAttribute("event")), prop = script.getAttribute(attrData + "prop"), method = script.getAttribute(attrData + "method"), advice = script.getAttribute(attrData + "advice"), scriptType = script.getAttribute("type"), nf = this._functionFromScript(script, attrData);
                    if (event) {
                        if (scriptType == "dojo/connect") {
                            aspects.push({method:event, func:nf});
                        } else {
                            if (scriptType == "dojo/on") {
                                ons.push({event:event, func:nf});
                            } else {
                                params[event] = nf;
                            }
                        }
                    } else {
                        if (scriptType == "dojo/aspect") {
                            aspects.push({method:method, advice:advice, func:nf});
                        } else {
                            if (scriptType == "dojo/watch") {
                                watches.push({prop:prop, func:nf});
                            } else {
                                calls.push(nf);
                            }
                        }
                    }
                }
            }
            var markupFactory = ctor.markupFactory || proto.markupFactory;
            var instance = markupFactory ? markupFactory(params, node, ctor) : new ctor(params, node);
            function onInstantiate(instance) {
                if (jsname) {
                    dlang.setObject(jsname, instance);
                }
                for (i = 0; i < aspects.length; i++) {
                    aspect[aspects[i].advice || "after"](instance, aspects[i].method, dlang.hitch(instance, aspects[i].func), true);
                }
                for (i = 0; i < calls.length; i++) {
                    calls[i].call(instance);
                }
                for (i = 0; i < watches.length; i++) {
                    instance.watch(watches[i].prop, watches[i].func);
                }
                for (i = 0; i < ons.length; i++) {
                    don(instance, ons[i].event, ons[i].func);
                }
                return instance;
            }
            if (instance.then) {
                return instance.then(onInstantiate);
            } else {
                return onInstantiate(instance);
            }
        }, scan:function (root, options) {
            var list = [], mids = [], midsHash = {};
            var dojoType = (options.scope || dojo._scopeName) + "Type", attrData = "data-" + (options.scope || dojo._scopeName) + "-", dataDojoType = attrData + "type", dataDojoTextDir = attrData + "textdir", dataDojoMixins = attrData + "mixins";
            var node = root.firstChild;
            var inherited = options.inherited;
            if (!inherited) {
                function findAncestorAttr(node, attr) {
                    return (node.getAttribute && node.getAttribute(attr)) || (node.parentNode && findAncestorAttr(node.parentNode, attr));
                }
                inherited = {dir:findAncestorAttr(root, "dir"), lang:findAncestorAttr(root, "lang"), textDir:findAncestorAttr(root, dataDojoTextDir)};
                for (var key in inherited) {
                    if (!inherited[key]) {
                        delete inherited[key];
                    }
                }
            }
            var parent = {inherited:inherited};
            var scripts;
            var scriptsOnly;
            function getEffective(parent) {
                if (!parent.inherited) {
                    parent.inherited = {};
                    var node = parent.node, grandparent = getEffective(parent.parent);
                    var inherited = {dir:node.getAttribute("dir") || grandparent.dir, lang:node.getAttribute("lang") || grandparent.lang, textDir:node.getAttribute(dataDojoTextDir) || grandparent.textDir};
                    for (var key in inherited) {
                        if (inherited[key]) {
                            parent.inherited[key] = inherited[key];
                        }
                    }
                }
                return parent.inherited;
            }
            while (true) {
                if (!node) {
                    if (!parent || !parent.node) {
                        break;
                    }
                    node = parent.node.nextSibling;
                    scriptsOnly = false;
                    parent = parent.parent;
                    scripts = parent.scripts;
                    continue;
                }
                if (node.nodeType != 1) {
                    node = node.nextSibling;
                    continue;
                }
                if (scripts && node.nodeName.toLowerCase() == "script") {
                    type = node.getAttribute("type");
                    if (type && /^dojo\/\w/i.test(type)) {
                        scripts.push(node);
                    }
                    node = node.nextSibling;
                    continue;
                }
                if (scriptsOnly) {
                    node = node.nextSibling;
                    continue;
                }
                var type = node.getAttribute(dataDojoType) || node.getAttribute(dojoType);
                var firstChild = node.firstChild;
                if (!type && (!firstChild || (firstChild.nodeType == 3 && !firstChild.nextSibling))) {
                    node = node.nextSibling;
                    continue;
                }
                var current;
                var ctor = null;
                if (type) {
                    var mixinsValue = node.getAttribute(dataDojoMixins), types = mixinsValue ? [type].concat(mixinsValue.split(/\s*,\s*/)) : [type];
                    try {
                        ctor = getCtor(types, options.contextRequire);
                    }
                    catch (e) {
                    }
                    if (!ctor) {
                        darray.forEach(types, function (t) {
                            if (~t.indexOf("/") && !midsHash[t]) {
                                midsHash[t] = true;
                                mids[mids.length] = t;
                            }
                        });
                    }
                    var childScripts = ctor && !ctor.prototype._noScript ? [] : null;
                    current = {types:types, ctor:ctor, parent:parent, node:node, scripts:childScripts};
                    current.inherited = getEffective(current);
                    list.push(current);
                } else {
                    current = {node:node, scripts:scripts, parent:parent};
                }
                scripts = childScripts;
                scriptsOnly = node.stopParser || (ctor && ctor.prototype.stopParser && !(options.template));
                parent = current;
                node = firstChild;
            }
            var d = new Deferred();
            if (mids.length) {
                if (1) {
                    console.warn("WARNING: Modules being Auto-Required: " + mids.join(", "));
                }
                var r = options.contextRequire || require;
                r(mids, function () {
                    d.resolve(darray.filter(list, function (widget) {
                        if (!widget.ctor) {
                            try {
                                widget.ctor = getCtor(widget.types, options.contextRequire);
                            }
                            catch (e) {
                            }
                        }
                        var parent = widget.parent;
                        while (parent && !parent.types) {
                            parent = parent.parent;
                        }
                        var proto = widget.ctor && widget.ctor.prototype;
                        widget.instantiateChildren = !(proto && proto.stopParser && !(options.template));
                        widget.instantiate = !parent || (parent.instantiate && parent.instantiateChildren);
                        return widget.instantiate;
                    }));
                });
            } else {
                d.resolve(list);
            }
            return d.promise;
        }, _require:function (script, options) {
            var hash = myEval("{" + script.innerHTML + "}"), vars = [], mids = [], d = new Deferred();
            var contextRequire = (options && options.contextRequire) || require;
            for (var name in hash) {
                vars.push(name);
                mids.push(hash[name]);
            }
            contextRequire(mids, function () {
                for (var i = 0; i < vars.length; i++) {
                    dlang.setObject(vars[i], arguments[i]);
                }
                d.resolve(arguments);
            });
            return d.promise;
        }, _scanAmd:function (root, options) {
            var deferred = new Deferred(), promise = deferred.promise;
            deferred.resolve(true);
            var self = this;
            query("script[type='dojo/require']", root).forEach(function (node) {
                promise = promise.then(function () {
                    return self._require(node, options);
                });
                node.parentNode.removeChild(node);
            });
            return promise;
        }, parse:function (rootNode, options) {
            var root;
            if (!options && rootNode && rootNode.rootNode) {
                options = rootNode;
                root = options.rootNode;
            } else {
                if (rootNode && dlang.isObject(rootNode) && !("nodeType" in rootNode)) {
                    options = rootNode;
                } else {
                    root = rootNode;
                }
            }
            root = root ? dom.byId(root) : dwindow.body();
            options = options || {};
            var mixin = options.template ? {template:true} : {}, instances = [], self = this;
            var p = this._scanAmd(root, options).then(function () {
                return self.scan(root, options);
            }).then(function (parsedNodes) {
                return self._instantiate(parsedNodes, mixin, options, true);
            }).then(function (_instances) {
                return instances = instances.concat(_instances);
            }).otherwise(function (e) {
                console.error("dojo/parser::parse() error", e);
                throw e;
            });
            dlang.mixin(instances, p);
            return instances;
        }};
        if (1) {
            dojo.parser = parser;
        }
        if (config.parseOnLoad) {
            ready(100, parser, "parse");
        }
        return parser;
    });
}, "dojo/cookie":function () {
    define(["./_base/kernel", "./regexp"], function (dojo, regexp) {
        dojo.cookie = function (name, value, props) {
            var c = document.cookie, ret;
            if (arguments.length == 1) {
                var matches = c.match(new RegExp("(?:^|; )" + regexp.escapeString(name) + "=([^;]*)"));
                ret = matches ? decodeURIComponent(matches[1]) : undefined;
            } else {
                props = props || {};
                var exp = props.expires;
                if (typeof exp == "number") {
                    var d = new Date();
                    d.setTime(d.getTime() + exp * 24 * 60 * 60 * 1000);
                    exp = props.expires = d;
                }
                if (exp && exp.toUTCString) {
                    props.expires = exp.toUTCString();
                }
                value = encodeURIComponent(value);
                var updatedCookie = name + "=" + value, propName;
                for (propName in props) {
                    updatedCookie += "; " + propName;
                    var propValue = props[propName];
                    if (propValue !== true) {
                        updatedCookie += "=" + propValue;
                    }
                }
                document.cookie = updatedCookie;
            }
            return ret;
        };
        dojo.cookie.isSupported = function () {
            if (!("cookieEnabled" in navigator)) {
                this("__djCookieTest__", "CookiesAllowed");
                navigator.cookieEnabled = this("__djCookieTest__") == "CookiesAllowed";
                if (navigator.cookieEnabled) {
                    this("__djCookieTest__", "", {expires:-1});
                }
            }
            return navigator.cookieEnabled;
        };
        return dojo.cookie;
    });
}, "dojox/fx/_base":function () {
    define(["dojo/_base/array", "dojo/_base/lang", "dojo/_base/fx", "dojo/fx", "dojo/dom", "dojo/dom-style", "dojo/dom-geometry", "dojo/_base/connect", "dojo/_base/html"], function (arrayUtil, lang, baseFx, coreFx, dom, domStyle, domGeom, connectUtil, htmlUtil) {
        var dojoxFx = lang.getObject("dojox.fx", true);
        lang.mixin(dojoxFx, {anim:baseFx.anim, animateProperty:baseFx.animateProperty, fadeTo:baseFx._fade, fadeIn:baseFx.fadeIn, fadeOut:baseFx.fadeOut, combine:coreFx.combine, chain:coreFx.chain, slideTo:coreFx.slideTo, wipeIn:coreFx.wipeIn, wipeOut:coreFx.wipeOut});
        dojoxFx.sizeTo = function (args) {
            var node = args.node = dom.byId(args.node), abs = "absolute";
            var method = args.method || "chain";
            if (!args.duration) {
                args.duration = 500;
            }
            if (method == "chain") {
                args.duration = Math.floor(args.duration / 2);
            }
            var top, newTop, left, newLeft, width, height = null;
            var init = (function (n) {
                return function () {
                    var cs = domStyle.getComputedStyle(n), pos = cs.position, w = cs.width, h = cs.height;
                    top = (pos == abs ? n.offsetTop : parseInt(cs.top) || 0);
                    left = (pos == abs ? n.offsetLeft : parseInt(cs.left) || 0);
                    width = (w == "auto" ? 0 : parseInt(w));
                    height = (h == "auto" ? 0 : parseInt(h));
                    newLeft = left - Math.floor((args.width - width) / 2);
                    newTop = top - Math.floor((args.height - height) / 2);
                    if (pos != abs && pos != "relative") {
                        var ret = domStyle.coords(n, true);
                        top = ret.y;
                        left = ret.x;
                        n.style.position = abs;
                        n.style.top = top + "px";
                        n.style.left = left + "px";
                    }
                };
            })(node);
            var anim1 = baseFx.animateProperty(lang.mixin({properties:{height:function () {
                init();
                return {end:args.height || 0, start:height};
            }, top:function () {
                return {start:top, end:newTop};
            }}}, args));
            var anim2 = baseFx.animateProperty(lang.mixin({properties:{width:function () {
                return {start:width, end:args.width || 0};
            }, left:function () {
                return {start:left, end:newLeft};
            }}}, args));
            var anim = coreFx[(args.method == "combine" ? "combine" : "chain")]([anim1, anim2]);
            return anim;
        };
        dojoxFx.slideBy = function (args) {
            var node = args.node = dom.byId(args.node), top, left;
            var init = (function (n) {
                return function () {
                    var cs = domStyle.getComputedStyle(n);
                    var pos = cs.position;
                    top = (pos == "absolute" ? n.offsetTop : parseInt(cs.top) || 0);
                    left = (pos == "absolute" ? n.offsetLeft : parseInt(cs.left) || 0);
                    if (pos != "absolute" && pos != "relative") {
                        var ret = domGeom.coords(n, true);
                        top = ret.y;
                        left = ret.x;
                        n.style.position = "absolute";
                        n.style.top = top + "px";
                        n.style.left = left + "px";
                    }
                };
            })(node);
            init();
            var _anim = baseFx.animateProperty(lang.mixin({properties:{top:top + (args.top || 0), left:left + (args.left || 0)}}, args));
            connectUtil.connect(_anim, "beforeBegin", _anim, init);
            return _anim;
        };
        dojoxFx.crossFade = function (args) {
            var node1 = args.nodes[0] = dom.byId(args.nodes[0]), op1 = htmlUtil.style(node1, "opacity"), node2 = args.nodes[1] = dom.byId(args.nodes[1]), op2 = htmlUtil.style(node2, "opacity");
            var _anim = coreFx.combine([baseFx[(op1 == 0 ? "fadeIn" : "fadeOut")](lang.mixin({node:node1}, args)), baseFx[(op1 == 0 ? "fadeOut" : "fadeIn")](lang.mixin({node:node2}, args))]);
            return _anim;
        };
        dojoxFx.highlight = function (args) {
            var node = args.node = dom.byId(args.node);
            args.duration = args.duration || 400;
            var startColor = args.color || "#ffff99", endColor = htmlUtil.style(node, "backgroundColor");
            if (endColor == "rgba(0, 0, 0, 0)") {
                endColor = "transparent";
            }
            var anim = baseFx.animateProperty(lang.mixin({properties:{backgroundColor:{start:startColor, end:endColor}}}, args));
            if (endColor == "transparent") {
                connectUtil.connect(anim, "onEnd", anim, function () {
                    node.style.backgroundColor = endColor;
                });
            }
            return anim;
        };
        dojoxFx.wipeTo = function (args) {
            args.node = dom.byId(args.node);
            var node = args.node, s = node.style;
            var dir = (args.width ? "width" : "height"), endVal = args[dir], props = {};
            props[dir] = {start:function () {
                s.overflow = "hidden";
                if (s.visibility == "hidden" || s.display == "none") {
                    s[dir] = "1px";
                    s.display = "";
                    s.visibility = "";
                    return 1;
                } else {
                    var now = htmlUtil.style(node, dir);
                    return Math.max(now, 1);
                }
            }, end:endVal};
            var anim = baseFx.animateProperty(lang.mixin({properties:props}, args));
            return anim;
        };
        return dojoxFx;
    });
}, "dojo/_base/json":function () {
    define(["./kernel", "../json"], function (dojo, json) {
        dojo.fromJson = function (js) {
            return eval("(" + js + ")");
        };
        dojo._escapeString = json.stringify;
        dojo.toJsonIndentStr = "\t";
        dojo.toJson = function (it, prettyPrint) {
            return json.stringify(it, function (key, value) {
                if (value) {
                    var tf = value.__json__ || value.json;
                    if (typeof tf == "function") {
                        return tf.call(value);
                    }
                }
                return value;
            }, prettyPrint && dojo.toJsonIndentStr);
        };
        return dojo;
    });
}, "dojo/dom-class":function () {
    define(["./_base/lang", "./_base/array", "./dom"], function (lang, array, dom) {
        var className = "className";
        var cls, spaces = /\s+/, a1 = [""];
        function str2array(s) {
            if (typeof s == "string" || s instanceof String) {
                if (s && !spaces.test(s)) {
                    a1[0] = s;
                    return a1;
                }
                var a = s.split(spaces);
                if (a.length && !a[0]) {
                    a.shift();
                }
                if (a.length && !a[a.length - 1]) {
                    a.pop();
                }
                return a;
            }
            if (!s) {
                return [];
            }
            return array.filter(s, function (x) {
                return x;
            });
        }
        var fakeNode = {};
        cls = {contains:function containsClass(node, classStr) {
            return ((" " + dom.byId(node)[className] + " ").indexOf(" " + classStr + " ") >= 0);
        }, add:function addClass(node, classStr) {
            node = dom.byId(node);
            classStr = str2array(classStr);
            var cls = node[className], oldLen;
            cls = cls ? " " + cls + " " : " ";
            oldLen = cls.length;
            for (var i = 0, len = classStr.length, c; i < len; ++i) {
                c = classStr[i];
                if (c && cls.indexOf(" " + c + " ") < 0) {
                    cls += c + " ";
                }
            }
            if (oldLen < cls.length) {
                node[className] = cls.substr(1, cls.length - 2);
            }
        }, remove:function removeClass(node, classStr) {
            node = dom.byId(node);
            var cls;
            if (classStr !== undefined) {
                classStr = str2array(classStr);
                cls = " " + node[className] + " ";
                for (var i = 0, len = classStr.length; i < len; ++i) {
                    cls = cls.replace(" " + classStr[i] + " ", " ");
                }
                cls = lang.trim(cls);
            } else {
                cls = "";
            }
            if (node[className] != cls) {
                node[className] = cls;
            }
        }, replace:function replaceClass(node, addClassStr, removeClassStr) {
            node = dom.byId(node);
            fakeNode[className] = node[className];
            cls.remove(fakeNode, removeClassStr);
            cls.add(fakeNode, addClassStr);
            if (node[className] !== fakeNode[className]) {
                node[className] = fakeNode[className];
            }
        }, toggle:function toggleClass(node, classStr, condition) {
            node = dom.byId(node);
            if (condition === undefined) {
                classStr = str2array(classStr);
                for (var i = 0, len = classStr.length, c; i < len; ++i) {
                    c = classStr[i];
                    cls[cls.contains(node, c) ? "remove" : "add"](node, c);
                }
            } else {
                cls[condition ? "add" : "remove"](node, classStr);
            }
            return condition;
        }};
        return cls;
    });
}, "dojo/date/locale":function () {
    define(["../_base/lang", "../_base/array", "../date", "../cldr/supplemental", "../i18n", "../regexp", "../string", "../i18n!../cldr/nls/gregorian", "module"], function (lang, array, date, supplemental, i18n, regexp, string, gregorian, module) {
        var exports = {};
        lang.setObject(module.id.replace(/\//g, "."), exports);
        function formatPattern(dateObject, bundle, options, pattern) {
            return pattern.replace(/([a-z])\1*/ig, function (match) {
                var s, pad, c = match.charAt(0), l = match.length, widthList = ["abbr", "wide", "narrow"];
                switch (c) {
                  case "G":
                    s = bundle[(l < 4) ? "eraAbbr" : "eraNames"][dateObject.getFullYear() < 0 ? 0 : 1];
                    break;
                  case "y":
                    s = dateObject.getFullYear();
                    switch (l) {
                      case 1:
                        break;
                      case 2:
                        if (!options.fullYear) {
                            s = String(s);
                            s = s.substr(s.length - 2);
                            break;
                        }
                      default:
                        pad = true;
                    }
                    break;
                  case "Q":
                  case "q":
                    s = Math.ceil((dateObject.getMonth() + 1) / 3);
                    pad = true;
                    break;
                  case "M":
                  case "L":
                    var m = dateObject.getMonth();
                    if (l < 3) {
                        s = m + 1;
                        pad = true;
                    } else {
                        var propM = ["months", c == "L" ? "standAlone" : "format", widthList[l - 3]].join("-");
                        s = bundle[propM][m];
                    }
                    break;
                  case "w":
                    var firstDay = 0;
                    s = exports._getWeekOfYear(dateObject, firstDay);
                    pad = true;
                    break;
                  case "d":
                    s = dateObject.getDate();
                    pad = true;
                    break;
                  case "D":
                    s = exports._getDayOfYear(dateObject);
                    pad = true;
                    break;
                  case "e":
                  case "c":
                    var d = dateObject.getDay();
                    if (l < 2) {
                        s = (d - supplemental.getFirstDayOfWeek(options.locale) + 8) % 7;
                        break;
                    }
                  case "E":
                    d = dateObject.getDay();
                    if (l < 3) {
                        s = d + 1;
                        pad = true;
                    } else {
                        var propD = ["days", c == "c" ? "standAlone" : "format", widthList[l - 3]].join("-");
                        s = bundle[propD][d];
                    }
                    break;
                  case "a":
                    var timePeriod = dateObject.getHours() < 12 ? "am" : "pm";
                    s = options[timePeriod] || bundle["dayPeriods-format-wide-" + timePeriod];
                    break;
                  case "h":
                  case "H":
                  case "K":
                  case "k":
                    var h = dateObject.getHours();
                    switch (c) {
                      case "h":
                        s = (h % 12) || 12;
                        break;
                      case "H":
                        s = h;
                        break;
                      case "K":
                        s = (h % 12);
                        break;
                      case "k":
                        s = h || 24;
                        break;
                    }
                    pad = true;
                    break;
                  case "m":
                    s = dateObject.getMinutes();
                    pad = true;
                    break;
                  case "s":
                    s = dateObject.getSeconds();
                    pad = true;
                    break;
                  case "S":
                    s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l - 3));
                    pad = true;
                    break;
                  case "v":
                  case "z":
                    s = exports._getZone(dateObject, true, options);
                    if (s) {
                        break;
                    }
                    l = 4;
                  case "Z":
                    var offset = exports._getZone(dateObject, false, options);
                    var tz = [(offset <= 0 ? "+" : "-"), string.pad(Math.floor(Math.abs(offset) / 60), 2), string.pad(Math.abs(offset) % 60, 2)];
                    if (l == 4) {
                        tz.splice(0, 0, "GMT");
                        tz.splice(3, 0, ":");
                    }
                    s = tz.join("");
                    break;
                  default:
                    throw new Error("dojo.date.locale.format: invalid pattern char: " + pattern);
                }
                if (pad) {
                    s = string.pad(s, l);
                }
                return s;
            });
        }
        exports._getZone = function (dateObject, getName, options) {
            if (getName) {
                return date.getTimezoneName(dateObject);
            } else {
                return dateObject.getTimezoneOffset();
            }
        };
        exports.format = function (dateObject, options) {
            options = options || {};
            var locale = i18n.normalizeLocale(options.locale), formatLength = options.formatLength || "short", bundle = exports._getGregorianBundle(locale), str = [], sauce = lang.hitch(this, formatPattern, dateObject, bundle, options);
            if (options.selector == "year") {
                return _processPattern(bundle["dateFormatItem-yyyy"] || "yyyy", sauce);
            }
            var pattern;
            if (options.selector != "date") {
                pattern = options.timePattern || bundle["timeFormat-" + formatLength];
                if (pattern) {
                    str.push(_processPattern(pattern, sauce));
                }
            }
            if (options.selector != "time") {
                pattern = options.datePattern || bundle["dateFormat-" + formatLength];
                if (pattern) {
                    str.push(_processPattern(pattern, sauce));
                }
            }
            return str.length == 1 ? str[0] : bundle["dateTimeFormat-" + formatLength].replace(/\'/g, "").replace(/\{(\d+)\}/g, function (match, key) {
                return str[key];
            });
        };
        exports.regexp = function (options) {
            return exports._parseInfo(options).regexp;
        };
        exports._parseInfo = function (options) {
            options = options || {};
            var locale = i18n.normalizeLocale(options.locale), bundle = exports._getGregorianBundle(locale), formatLength = options.formatLength || "short", datePattern = options.datePattern || bundle["dateFormat-" + formatLength], timePattern = options.timePattern || bundle["timeFormat-" + formatLength], pattern;
            if (options.selector == "date") {
                pattern = datePattern;
            } else {
                if (options.selector == "time") {
                    pattern = timePattern;
                } else {
                    pattern = bundle["dateTimeFormat-" + formatLength].replace(/\{(\d+)\}/g, function (match, key) {
                        return [timePattern, datePattern][key];
                    });
                }
            }
            var tokens = [], re = _processPattern(pattern, lang.hitch(this, _buildDateTimeRE, tokens, bundle, options));
            return {regexp:re, tokens:tokens, bundle:bundle};
        };
        exports.parse = function (value, options) {
            var controlChars = /[\u200E\u200F\u202A\u202E]/g, info = exports._parseInfo(options), tokens = info.tokens, bundle = info.bundle, re = new RegExp("^" + info.regexp.replace(controlChars, "") + "$", info.strict ? "" : "i"), match = re.exec(value && value.replace(controlChars, ""));
            if (!match) {
                return null;
            }
            var widthList = ["abbr", "wide", "narrow"], result = [1970, 0, 1, 0, 0, 0, 0], amPm = "", valid = array.every(match, function (v, i) {
                if (!i) {
                    return true;
                }
                var token = tokens[i - 1], l = token.length, c = token.charAt(0);
                switch (c) {
                  case "y":
                    if (l != 2 && options.strict) {
                        result[0] = v;
                    } else {
                        if (v < 100) {
                            v = Number(v);
                            var year = "" + new Date().getFullYear(), century = year.substring(0, 2) * 100, cutoff = Math.min(Number(year.substring(2, 4)) + 20, 99);
                            result[0] = (v < cutoff) ? century + v : century - 100 + v;
                        } else {
                            if (options.strict) {
                                return false;
                            }
                            result[0] = v;
                        }
                    }
                    break;
                  case "M":
                  case "L":
                    if (l > 2) {
                        var months = bundle["months-" + (c == "L" ? "standAlone" : "format") + "-" + widthList[l - 3]].concat();
                        if (!options.strict) {
                            v = v.replace(".", "").toLowerCase();
                            months = array.map(months, function (s) {
                                return s.replace(".", "").toLowerCase();
                            });
                        }
                        v = array.indexOf(months, v);
                        if (v == -1) {
                            return false;
                        }
                    } else {
                        v--;
                    }
                    result[1] = v;
                    break;
                  case "E":
                  case "e":
                  case "c":
                    var days = bundle["days-" + (c == "c" ? "standAlone" : "format") + "-" + widthList[l - 3]].concat();
                    if (!options.strict) {
                        v = v.toLowerCase();
                        days = array.map(days, function (d) {
                            return d.toLowerCase();
                        });
                    }
                    v = array.indexOf(days, v);
                    if (v == -1) {
                        return false;
                    }
                    break;
                  case "D":
                    result[1] = 0;
                  case "d":
                    result[2] = v;
                    break;
                  case "a":
                    var am = options.am || bundle["dayPeriods-format-wide-am"], pm = options.pm || bundle["dayPeriods-format-wide-pm"];
                    if (!options.strict) {
                        var period = /\./g;
                        v = v.replace(period, "").toLowerCase();
                        am = am.replace(period, "").toLowerCase();
                        pm = pm.replace(period, "").toLowerCase();
                    }
                    if (options.strict && v != am && v != pm) {
                        return false;
                    }
                    amPm = (v == pm) ? "p" : (v == am) ? "a" : "";
                    break;
                  case "K":
                    if (v == 24) {
                        v = 0;
                    }
                  case "h":
                  case "H":
                  case "k":
                    if (v > 23) {
                        return false;
                    }
                    result[3] = v;
                    break;
                  case "m":
                    result[4] = v;
                    break;
                  case "s":
                    result[5] = v;
                    break;
                  case "S":
                    result[6] = v;
                }
                return true;
            });
            var hours = +result[3];
            if (amPm === "p" && hours < 12) {
                result[3] = hours + 12;
            } else {
                if (amPm === "a" && hours == 12) {
                    result[3] = 0;
                }
            }
            var dateObject = new Date(result[0], result[1], result[2], result[3], result[4], result[5], result[6]);
            if (options.strict) {
                dateObject.setFullYear(result[0]);
            }
            var allTokens = tokens.join(""), dateToken = allTokens.indexOf("d") != -1, monthToken = allTokens.indexOf("M") != -1;
            if (!valid || (monthToken && dateObject.getMonth() > result[1]) || (dateToken && dateObject.getDate() > result[2])) {
                return null;
            }
            if ((monthToken && dateObject.getMonth() < result[1]) || (dateToken && dateObject.getDate() < result[2])) {
                dateObject = date.add(dateObject, "hour", 1);
            }
            return dateObject;
        };
        function _processPattern(pattern, applyPattern, applyLiteral, applyAll) {
            var identity = function (x) {
                return x;
            };
            applyPattern = applyPattern || identity;
            applyLiteral = applyLiteral || identity;
            applyAll = applyAll || identity;
            var chunks = pattern.match(/(''|[^'])+/g), literal = pattern.charAt(0) == "'";
            array.forEach(chunks, function (chunk, i) {
                if (!chunk) {
                    chunks[i] = "";
                } else {
                    chunks[i] = (literal ? applyLiteral : applyPattern)(chunk.replace(/''/g, "'"));
                    literal = !literal;
                }
            });
            return applyAll(chunks.join(""));
        }
        function _buildDateTimeRE(tokens, bundle, options, pattern) {
            pattern = regexp.escapeString(pattern);
            if (!options.strict) {
                pattern = pattern.replace(" a", " ?a");
            }
            return pattern.replace(/([a-z])\1*/ig, function (match) {
                var s, c = match.charAt(0), l = match.length, p2 = "", p3 = "";
                if (options.strict) {
                    if (l > 1) {
                        p2 = "0" + "{" + (l - 1) + "}";
                    }
                    if (l > 2) {
                        p3 = "0" + "{" + (l - 2) + "}";
                    }
                } else {
                    p2 = "0?";
                    p3 = "0{0,2}";
                }
                switch (c) {
                  case "y":
                    s = "\\d{2,4}";
                    break;
                  case "M":
                  case "L":
                    s = (l > 2) ? "\\S+?" : "1[0-2]|" + p2 + "[1-9]";
                    break;
                  case "D":
                    s = "[12][0-9][0-9]|3[0-5][0-9]|36[0-6]|" + p2 + "[1-9][0-9]|" + p3 + "[1-9]";
                    break;
                  case "d":
                    s = "3[01]|[12]\\d|" + p2 + "[1-9]";
                    break;
                  case "w":
                    s = "[1-4][0-9]|5[0-3]|" + p2 + "[1-9]";
                    break;
                  case "E":
                  case "e":
                  case "c":
                    s = ".+?";
                    break;
                  case "h":
                    s = "1[0-2]|" + p2 + "[1-9]";
                    break;
                  case "k":
                    s = "1[01]|" + p2 + "\\d";
                    break;
                  case "H":
                    s = "1\\d|2[0-3]|" + p2 + "\\d";
                    break;
                  case "K":
                    s = "1\\d|2[0-4]|" + p2 + "[1-9]";
                    break;
                  case "m":
                  case "s":
                    s = "[0-5]\\d";
                    break;
                  case "S":
                    s = "\\d{" + l + "}";
                    break;
                  case "a":
                    var am = options.am || bundle["dayPeriods-format-wide-am"], pm = options.pm || bundle["dayPeriods-format-wide-pm"];
                    s = am + "|" + pm;
                    if (!options.strict) {
                        if (am != am.toLowerCase()) {
                            s += "|" + am.toLowerCase();
                        }
                        if (pm != pm.toLowerCase()) {
                            s += "|" + pm.toLowerCase();
                        }
                        if (s.indexOf(".") != -1) {
                            s += "|" + s.replace(/\./g, "");
                        }
                    }
                    s = s.replace(/\./g, "\\.");
                    break;
                  default:
                    s = ".*";
                }
                if (tokens) {
                    tokens.push(match);
                }
                return "(" + s + ")";
            }).replace(/[\xa0 ]/g, "[\\s\\xa0]");
        }
        var _customFormats = [];
        exports.addCustomFormats = function (packageName, bundleName) {
            _customFormats.push({pkg:packageName, name:bundleName});
        };
        exports._getGregorianBundle = function (locale) {
            var gregorian = {};
            array.forEach(_customFormats, function (desc) {
                var bundle = i18n.getLocalization(desc.pkg, desc.name, locale);
                gregorian = lang.mixin(gregorian, bundle);
            }, this);
            return gregorian;
        };
        exports.addCustomFormats(module.id.replace(/\/date\/locale$/, ".cldr"), "gregorian");
        exports.getNames = function (item, type, context, locale) {
            var label, lookup = exports._getGregorianBundle(locale), props = [item, context, type];
            if (context == "standAlone") {
                var key = props.join("-");
                label = lookup[key];
                if (label[0] == 1) {
                    label = undefined;
                }
            }
            props[1] = "format";
            return (label || lookup[props.join("-")]).concat();
        };
        exports.isWeekend = function (dateObject, locale) {
            var weekend = supplemental.getWeekend(locale), day = (dateObject || new Date()).getDay();
            if (weekend.end < weekend.start) {
                weekend.end += 7;
                if (day < weekend.start) {
                    day += 7;
                }
            }
            return day >= weekend.start && day <= weekend.end;
        };
        exports._getDayOfYear = function (dateObject) {
            return date.difference(new Date(dateObject.getFullYear(), 0, 1, dateObject.getHours()), dateObject) + 1;
        };
        exports._getWeekOfYear = function (dateObject, firstDayOfWeek) {
            if (arguments.length == 1) {
                firstDayOfWeek = 0;
            }
            var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1).getDay(), adj = (firstDayOfYear - firstDayOfWeek + 7) % 7, week = Math.floor((exports._getDayOfYear(dateObject) + adj - 1) / 7);
            if (firstDayOfYear == firstDayOfWeek) {
                week++;
            }
            return week;
        };
        return exports;
    });
}, "dijit/Destroyable":function () {
    define(["dojo/_base/array", "dojo/aspect", "dojo/_base/declare"], function (array, aspect, declare) {
        return declare("dijit.Destroyable", null, {destroy:function (preserveDom) {
            this._destroyed = true;
        }, own:function () {
            var cleanupMethods = ["destroyRecursive", "destroy", "remove"];
            array.forEach(arguments, function (handle) {
                var destroyMethodName;
                var odh = aspect.before(this, "destroy", function (preserveDom) {
                    handle[destroyMethodName](preserveDom);
                });
                var hdhs = [];
                function onManualDestroy() {
                    odh.remove();
                    array.forEach(hdhs, function (hdh) {
                        hdh.remove();
                    });
                }
                if (handle.then) {
                    destroyMethodName = "cancel";
                    handle.then(onManualDestroy, onManualDestroy);
                } else {
                    array.forEach(cleanupMethods, function (cleanupMethod) {
                        if (typeof handle[cleanupMethod] === "function") {
                            if (!destroyMethodName) {
                                destroyMethodName = cleanupMethod;
                            }
                            hdhs.push(aspect.after(handle, cleanupMethod, onManualDestroy, true));
                        }
                    });
                }
            }, this);
            return arguments;
        }});
    });
}, "dojo/regexp":function () {
    define(["./_base/kernel", "./_base/lang"], function (dojo, lang) {
        var regexp = {};
        lang.setObject("dojo.regexp", regexp);
        regexp.escapeString = function (str, except) {
            return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+\-^])/g, function (ch) {
                if (except && except.indexOf(ch) != -1) {
                    return ch;
                }
                return "\\" + ch;
            });
        };
        regexp.buildGroupRE = function (arr, re, nonCapture) {
            if (!(arr instanceof Array)) {
                return re(arr);
            }
            var b = [];
            for (var i = 0; i < arr.length; i++) {
                b.push(re(arr[i]));
            }
            return regexp.group(b.join("|"), nonCapture);
        };
        regexp.group = function (expression, nonCapture) {
            return "(" + (nonCapture ? "?:" : "") + expression + ")";
        };
        return regexp;
    });
}, "dojo/cache":function () {
    define(["./_base/kernel", "./text"], function (dojo) {
        return dojo.cache;
    });
}, "dojo/fx":function () {
    define(["./_base/lang", "./Evented", "./_base/kernel", "./_base/array", "./aspect", "./_base/fx", "./dom", "./dom-style", "./dom-geometry", "./ready", "require"], function (lang, Evented, dojo, arrayUtil, aspect, baseFx, dom, domStyle, geom, ready, require) {
        if (!dojo.isAsync) {
            ready(0, function () {
                var requires = ["./fx/Toggler"];
                require(requires);
            });
        }
        var coreFx = dojo.fx = {};
        var _baseObj = {_fire:function (evt, args) {
            if (this[evt]) {
                this[evt].apply(this, args || []);
            }
            return this;
        }};
        var _chain = function (animations) {
            this._index = -1;
            this._animations = animations || [];
            this._current = this._onAnimateCtx = this._onEndCtx = null;
            this.duration = 0;
            arrayUtil.forEach(this._animations, function (a) {
                this.duration += a.duration;
                if (a.delay) {
                    this.duration += a.delay;
                }
            }, this);
        };
        _chain.prototype = new Evented();
        lang.extend(_chain, {_onAnimate:function () {
            this._fire("onAnimate", arguments);
        }, _onEnd:function () {
            this._onAnimateCtx.remove();
            this._onEndCtx.remove();
            this._onAnimateCtx = this._onEndCtx = null;
            if (this._index + 1 == this._animations.length) {
                this._fire("onEnd");
            } else {
                this._current = this._animations[++this._index];
                this._onAnimateCtx = aspect.after(this._current, "onAnimate", lang.hitch(this, "_onAnimate"), true);
                this._onEndCtx = aspect.after(this._current, "onEnd", lang.hitch(this, "_onEnd"), true);
                this._current.play(0, true);
            }
        }, play:function (delay, gotoStart) {
            if (!this._current) {
                this._current = this._animations[this._index = 0];
            }
            if (!gotoStart && this._current.status() == "playing") {
                return this;
            }
            var beforeBegin = aspect.after(this._current, "beforeBegin", lang.hitch(this, function () {
                this._fire("beforeBegin");
            }), true), onBegin = aspect.after(this._current, "onBegin", lang.hitch(this, function (arg) {
                this._fire("onBegin", arguments);
            }), true), onPlay = aspect.after(this._current, "onPlay", lang.hitch(this, function (arg) {
                this._fire("onPlay", arguments);
                beforeBegin.remove();
                onBegin.remove();
                onPlay.remove();
            }));
            if (this._onAnimateCtx) {
                this._onAnimateCtx.remove();
            }
            this._onAnimateCtx = aspect.after(this._current, "onAnimate", lang.hitch(this, "_onAnimate"), true);
            if (this._onEndCtx) {
                this._onEndCtx.remove();
            }
            this._onEndCtx = aspect.after(this._current, "onEnd", lang.hitch(this, "_onEnd"), true);
            this._current.play.apply(this._current, arguments);
            return this;
        }, pause:function () {
            if (this._current) {
                var e = aspect.after(this._current, "onPause", lang.hitch(this, function (arg) {
                    this._fire("onPause", arguments);
                    e.remove();
                }), true);
                this._current.pause();
            }
            return this;
        }, gotoPercent:function (percent, andPlay) {
            this.pause();
            var offset = this.duration * percent;
            this._current = null;
            arrayUtil.some(this._animations, function (a, index) {
                if (offset <= a.duration) {
                    this._current = a;
                    this._index = index;
                    return true;
                }
                offset -= a.duration;
                return false;
            }, this);
            if (this._current) {
                this._current.gotoPercent(offset / this._current.duration);
            }
            if (andPlay) {
                this.play();
            }
            return this;
        }, stop:function (gotoEnd) {
            if (this._current) {
                if (gotoEnd) {
                    for (; this._index + 1 < this._animations.length; ++this._index) {
                        this._animations[this._index].stop(true);
                    }
                    this._current = this._animations[this._index];
                }
                var e = aspect.after(this._current, "onStop", lang.hitch(this, function (arg) {
                    this._fire("onStop", arguments);
                    e.remove();
                }), true);
                this._current.stop();
            }
            return this;
        }, status:function () {
            return this._current ? this._current.status() : "stopped";
        }, destroy:function () {
            this.stop();
            if (this._onAnimateCtx) {
                this._onAnimateCtx.remove();
            }
            if (this._onEndCtx) {
                this._onEndCtx.remove();
            }
        }});
        lang.extend(_chain, _baseObj);
        coreFx.chain = function (animations) {
            return new _chain(animations);
        };
        var _combine = function (animations) {
            this._animations = animations || [];
            this._connects = [];
            this._finished = 0;
            this.duration = 0;
            arrayUtil.forEach(animations, function (a) {
                var duration = a.duration;
                if (a.delay) {
                    duration += a.delay;
                }
                if (this.duration < duration) {
                    this.duration = duration;
                }
                this._connects.push(aspect.after(a, "onEnd", lang.hitch(this, "_onEnd"), true));
            }, this);
            this._pseudoAnimation = new baseFx.Animation({curve:[0, 1], duration:this.duration});
            var self = this;
            arrayUtil.forEach(["beforeBegin", "onBegin", "onPlay", "onAnimate", "onPause", "onStop", "onEnd"], function (evt) {
                self._connects.push(aspect.after(self._pseudoAnimation, evt, function () {
                    self._fire(evt, arguments);
                }, true));
            });
        };
        lang.extend(_combine, {_doAction:function (action, args) {
            arrayUtil.forEach(this._animations, function (a) {
                a[action].apply(a, args);
            });
            return this;
        }, _onEnd:function () {
            if (++this._finished > this._animations.length) {
                this._fire("onEnd");
            }
        }, _call:function (action, args) {
            var t = this._pseudoAnimation;
            t[action].apply(t, args);
        }, play:function (delay, gotoStart) {
            this._finished = 0;
            this._doAction("play", arguments);
            this._call("play", arguments);
            return this;
        }, pause:function () {
            this._doAction("pause", arguments);
            this._call("pause", arguments);
            return this;
        }, gotoPercent:function (percent, andPlay) {
            var ms = this.duration * percent;
            arrayUtil.forEach(this._animations, function (a) {
                a.gotoPercent(a.duration < ms ? 1 : (ms / a.duration), andPlay);
            });
            this._call("gotoPercent", arguments);
            return this;
        }, stop:function (gotoEnd) {
            this._doAction("stop", arguments);
            this._call("stop", arguments);
            return this;
        }, status:function () {
            return this._pseudoAnimation.status();
        }, destroy:function () {
            this.stop();
            arrayUtil.forEach(this._connects, function (handle) {
                handle.remove();
            });
        }});
        lang.extend(_combine, _baseObj);
        coreFx.combine = function (animations) {
            return new _combine(animations);
        };
        coreFx.wipeIn = function (args) {
            var node = args.node = dom.byId(args.node), s = node.style, o;
            var anim = baseFx.animateProperty(lang.mixin({properties:{height:{start:function () {
                o = s.overflow;
                s.overflow = "hidden";
                if (s.visibility == "hidden" || s.display == "none") {
                    s.height = "1px";
                    s.display = "";
                    s.visibility = "";
                    return 1;
                } else {
                    var height = domStyle.get(node, "height");
                    return Math.max(height, 1);
                }
            }, end:function () {
                return node.scrollHeight;
            }}}}, args));
            var fini = function () {
                s.height = "auto";
                s.overflow = o;
            };
            aspect.after(anim, "onStop", fini, true);
            aspect.after(anim, "onEnd", fini, true);
            return anim;
        };
        coreFx.wipeOut = function (args) {
            var node = args.node = dom.byId(args.node), s = node.style, o;
            var anim = baseFx.animateProperty(lang.mixin({properties:{height:{end:1}}}, args));
            aspect.after(anim, "beforeBegin", function () {
                o = s.overflow;
                s.overflow = "hidden";
                s.display = "";
            }, true);
            var fini = function () {
                s.overflow = o;
                s.height = "auto";
                s.display = "none";
            };
            aspect.after(anim, "onStop", fini, true);
            aspect.after(anim, "onEnd", fini, true);
            return anim;
        };
        coreFx.slideTo = function (args) {
            var node = args.node = dom.byId(args.node), top = null, left = null;
            var init = (function (n) {
                return function () {
                    var cs = domStyle.getComputedStyle(n);
                    var pos = cs.position;
                    top = (pos == "absolute" ? n.offsetTop : parseInt(cs.top) || 0);
                    left = (pos == "absolute" ? n.offsetLeft : parseInt(cs.left) || 0);
                    if (pos != "absolute" && pos != "relative") {
                        var ret = geom.position(n, true);
                        top = ret.y;
                        left = ret.x;
                        n.style.position = "absolute";
                        n.style.top = top + "px";
                        n.style.left = left + "px";
                    }
                };
            })(node);
            init();
            var anim = baseFx.animateProperty(lang.mixin({properties:{top:args.top || 0, left:args.left || 0}}, args));
            aspect.after(anim, "beforeBegin", init, true);
            return anim;
        };
        return coreFx;
    });
}, "dojo/_base/event":function () {
    define(["./kernel", "../on", "../has", "../dom-geometry"], function (dojo, on, has, dom) {
        if (on._fixEvent) {
            var fixEvent = on._fixEvent;
            on._fixEvent = function (evt, se) {
                evt = fixEvent(evt, se);
                if (evt) {
                    dom.normalizeEvent(evt);
                }
                return evt;
            };
        }
        var ret = {fix:function (evt, sender) {
            if (on._fixEvent) {
                return on._fixEvent(evt, sender);
            }
            return evt;
        }, stop:function (evt) {
            if (has("dom-addeventlistener") || (evt && evt.preventDefault)) {
                evt.preventDefault();
                evt.stopPropagation();
            } else {
                evt = evt || window.event;
                evt.cancelBubble = true;
                on._preventDefault.call(evt);
            }
        }};
        if (1) {
            dojo.fixEvent = ret.fix;
            dojo.stopEvent = ret.stop;
        }
        return ret;
    });
}, "dojo/request/handlers":function () {
    define(["../json", "../_base/kernel", "../_base/array", "../has", "../selector/_loader"], function (JSON, kernel, array, has) {
        has.add("activex", typeof ActiveXObject !== "undefined");
        has.add("dom-parser", function (global) {
            return "DOMParser" in global;
        });
        var handleXML;
        if (has("activex")) {
            var dp = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML.DOMDocument"];
            var lastParser;
            handleXML = function (response) {
                var result = response.data;
                var text = response.text;
                if (result && has("dom-qsa2.1") && !result.querySelectorAll && has("dom-parser")) {
                    result = new DOMParser().parseFromString(text, "application/xml");
                }
                function createDocument(p) {
                    try {
                        var dom = new ActiveXObject(p);
                        dom.async = false;
                        dom.loadXML(text);
                        result = dom;
                        lastParser = p;
                    }
                    catch (e) {
                        return false;
                    }
                    return true;
                }
                if (!result || !result.documentElement) {
                    if (!lastParser || !createDocument(lastParser)) {
                        array.some(dp, createDocument);
                    }
                }
                return result;
            };
        }
        var handleNativeResponse = function (response) {
            if (!has("native-xhr2-blob") && response.options.handleAs === "blob" && typeof Blob !== "undefined") {
                return new Blob([response.xhr.response], {type:response.xhr.getResponseHeader("Content-Type")});
            }
            return response.xhr.response;
        };
        var handlers = {"javascript":function (response) {
            return kernel.eval(response.text || "");
        }, "json":function (response) {
            return JSON.parse(response.text || null);
        }, "xml":handleXML, "blob":handleNativeResponse, "arraybuffer":handleNativeResponse, "document":handleNativeResponse};
        function handle(response) {
            var handler = handlers[response.options.handleAs];
            response.data = handler ? handler(response) : (response.data || response.text);
            return response;
        }
        handle.register = function (name, handler) {
            handlers[name] = handler;
        };
        return handle;
    });
}, "dojox/gesture/swipe":function () {
    define(["dojo/_base/kernel", "dojo/_base/declare", "./Base", "../main"], function (kernel, declare, Base, dojox) {
        kernel.experimental("dojox.gesture.swipe");
        var clz = declare(Base, {defaultEvent:"swipe", subEvents:["end"], press:function (data, e) {
            if (e.touches && e.touches.length >= 2) {
                delete data.context;
                return;
            }
            if (!data.context) {
                data.context = {x:0, y:0, t:0};
            }
            data.context.x = e.screenX;
            data.context.y = e.screenY;
            data.context.t = new Date().getTime();
            this.lock(e.currentTarget);
        }, move:function (data, e) {
            this._recognize(data, e, "swipe");
        }, release:function (data, e) {
            this._recognize(data, e, "swipe.end");
            delete data.context;
            this.unLock();
        }, cancel:function (data, e) {
            delete data.context;
            this.unLock();
        }, _recognize:function (data, e, type) {
            if (!data.context) {
                return;
            }
            var info = this._getSwipeInfo(data, e);
            if (!info) {
                return;
            }
            info.type = type;
            this.fire(e.target, info);
        }, _getSwipeInfo:function (data, e) {
            var dx, dy, info = {}, startData = data.context;
            info.time = new Date().getTime() - startData.t;
            dx = e.screenX - startData.x;
            dy = e.screenY - startData.y;
            if (dx === 0 && dy === 0) {
                return null;
            }
            info.dx = dx;
            info.dy = dy;
            return info;
        }});
        dojox.gesture.swipe = new clz();
        dojox.gesture.swipe.Swipe = clz;
        return dojox.gesture.swipe;
    });
}, "dojo/_base/connect":function () {
    define(["./kernel", "../on", "../topic", "../aspect", "./event", "../mouse", "./sniff", "./lang", "../keys"], function (dojo, on, hub, aspect, eventModule, mouse, has, lang) {
        has.add("events-keypress-typed", function () {
            var testKeyEvent = {charCode:0};
            try {
                testKeyEvent = document.createEvent("KeyboardEvent");
                (testKeyEvent.initKeyboardEvent || testKeyEvent.initKeyEvent).call(testKeyEvent, "keypress", true, true, null, false, false, false, false, 9, 3);
            }
            catch (e) {
            }
            return testKeyEvent.charCode == 0 && !has("opera");
        });
        function connect_(obj, event, context, method, dontFix) {
            method = lang.hitch(context, method);
            if (!obj || !(obj.addEventListener || obj.attachEvent)) {
                return aspect.after(obj || dojo.global, event, method, true);
            }
            if (typeof event == "string" && event.substring(0, 2) == "on") {
                event = event.substring(2);
            }
            if (!obj) {
                obj = dojo.global;
            }
            if (!dontFix) {
                switch (event) {
                  case "keypress":
                    event = keypress;
                    break;
                  case "mouseenter":
                    event = mouse.enter;
                    break;
                  case "mouseleave":
                    event = mouse.leave;
                    break;
                }
            }
            return on(obj, event, method, dontFix);
        }
        var _punctMap = {106:42, 111:47, 186:59, 187:43, 188:44, 189:45, 190:46, 191:47, 192:96, 219:91, 220:92, 221:93, 222:39, 229:113};
        var evtCopyKey = has("mac") ? "metaKey" : "ctrlKey";
        var _synthesizeEvent = function (evt, props) {
            var faux = lang.mixin({}, evt, props);
            setKeyChar(faux);
            faux.preventDefault = function () {
                evt.preventDefault();
            };
            faux.stopPropagation = function () {
                evt.stopPropagation();
            };
            return faux;
        };
        function setKeyChar(evt) {
            evt.keyChar = evt.charCode ? String.fromCharCode(evt.charCode) : "";
            evt.charOrCode = evt.keyChar || evt.keyCode;
        }
        var keypress;
        if (has("events-keypress-typed")) {
            var _trySetKeyCode = function (e, code) {
                try {
                    return (e.keyCode = code);
                }
                catch (e) {
                    return 0;
                }
            };
            keypress = function (object, listener) {
                var keydownSignal = on(object, "keydown", function (evt) {
                    var k = evt.keyCode;
                    var unprintable = (k != 13) && k != 32 && (k != 27 || !has("ie")) && (k < 48 || k > 90) && (k < 96 || k > 111) && (k < 186 || k > 192) && (k < 219 || k > 222) && k != 229;
                    if (unprintable || evt.ctrlKey) {
                        var c = unprintable ? 0 : k;
                        if (evt.ctrlKey) {
                            if (k == 3 || k == 13) {
                                return listener.call(evt.currentTarget, evt);
                            } else {
                                if (c > 95 && c < 106) {
                                    c -= 48;
                                } else {
                                    if ((!evt.shiftKey) && (c >= 65 && c <= 90)) {
                                        c += 32;
                                    } else {
                                        c = _punctMap[c] || c;
                                    }
                                }
                            }
                        }
                        var faux = _synthesizeEvent(evt, {type:"keypress", faux:true, charCode:c});
                        listener.call(evt.currentTarget, faux);
                        if (has("ie")) {
                            _trySetKeyCode(evt, faux.keyCode);
                        }
                    }
                });
                var keypressSignal = on(object, "keypress", function (evt) {
                    var c = evt.charCode;
                    c = c >= 32 ? c : 0;
                    evt = _synthesizeEvent(evt, {charCode:c, faux:true});
                    return listener.call(this, evt);
                });
                return {remove:function () {
                    keydownSignal.remove();
                    keypressSignal.remove();
                }};
            };
        } else {
            if (has("opera")) {
                keypress = function (object, listener) {
                    return on(object, "keypress", function (evt) {
                        var c = evt.which;
                        if (c == 3) {
                            c = 99;
                        }
                        c = c < 32 && !evt.shiftKey ? 0 : c;
                        if (evt.ctrlKey && !evt.shiftKey && c >= 65 && c <= 90) {
                            c += 32;
                        }
                        return listener.call(this, _synthesizeEvent(evt, {charCode:c}));
                    });
                };
            } else {
                keypress = function (object, listener) {
                    return on(object, "keypress", function (evt) {
                        setKeyChar(evt);
                        return listener.call(this, evt);
                    });
                };
            }
        }
        var connect = {_keypress:keypress, connect:function (obj, event, context, method, dontFix) {
            var a = arguments, args = [], i = 0;
            args.push(typeof a[0] == "string" ? null : a[i++], a[i++]);
            var a1 = a[i + 1];
            args.push(typeof a1 == "string" || typeof a1 == "function" ? a[i++] : null, a[i++]);
            for (var l = a.length; i < l; i++) {
                args.push(a[i]);
            }
            return connect_.apply(this, args);
        }, disconnect:function (handle) {
            if (handle) {
                handle.remove();
            }
        }, subscribe:function (topic, context, method) {
            return hub.subscribe(topic, lang.hitch(context, method));
        }, publish:function (topic, args) {
            return hub.publish.apply(hub, [topic].concat(args));
        }, connectPublisher:function (topic, obj, event) {
            var pf = function () {
                connect.publish(topic, arguments);
            };
            return event ? connect.connect(obj, event, pf) : connect.connect(obj, pf);
        }, isCopyKey:function (e) {
            return e[evtCopyKey];
        }};
        connect.unsubscribe = connect.disconnect;
        1 && lang.mixin(dojo, connect);
        return connect;
    });
}, "dojo/ready":function () {
    define(["./_base/kernel", "./has", "require", "./domReady", "./_base/lang"], function (dojo, has, require, domReady, lang) {
        var isDomReady = 0, loadQ = [], onLoadRecursiveGuard = 0, handleDomReady = function () {
            isDomReady = 1;
            dojo._postLoad = dojo.config.afterOnLoad = true;
            onEvent();
        }, onEvent = function () {
            if (onLoadRecursiveGuard) {
                return;
            }
            onLoadRecursiveGuard = 1;
            while (isDomReady && (!domReady || domReady._Q.length == 0) && (require.idle ? require.idle() : true) && loadQ.length) {
                var f = loadQ.shift();
                try {
                    f();
                }
                catch (e) {
                    e.info = e.message;
                    if (require.signal) {
                        require.signal("error", e);
                    } else {
                        throw e;
                    }
                }
            }
            onLoadRecursiveGuard = 0;
        };
        require.on && require.on("idle", onEvent);
        if (domReady) {
            domReady._onQEmpty = onEvent;
        }
        var ready = dojo.ready = dojo.addOnLoad = function (priority, context, callback) {
            var hitchArgs = lang._toArray(arguments);
            if (typeof priority != "number") {
                callback = context;
                context = priority;
                priority = 1000;
            } else {
                hitchArgs.shift();
            }
            callback = callback ? lang.hitch.apply(dojo, hitchArgs) : function () {
                context();
            };
            callback.priority = priority;
            for (var i = 0; i < loadQ.length && priority >= loadQ[i].priority; i++) {
            }
            loadQ.splice(i, 0, callback);
            onEvent();
        };
        1 || has.add("dojo-config-addOnLoad", 1);
        if (1) {
            var dca = dojo.config.addOnLoad;
            if (dca) {
                ready[(lang.isArray(dca) ? "apply" : "call")](dojo, dca);
            }
        }
        if (0 && dojo.config.parseOnLoad && !dojo.isAsync) {
            ready(99, function () {
                if (!dojo.parser) {
                    dojo.deprecated("Add explicit require(['dojo/parser']);", "", "2.0");
                    require(["dojo/parser"]);
                }
            });
        }
        if (domReady) {
            domReady(handleDomReady);
        } else {
            handleDomReady();
        }
        return ready;
    });
}, "dojox/mobile/_css3":function () {
    define(["dojo/_base/window", "dojo/_base/array", "dojo/has"], function (win, arr, has) {
        var cnames = [], hnames = [];
        var style = win.doc.createElement("div").style;
        var prefixes = ["webkit"];
        has.add("css3-animations", function (global, document, element) {
            var style = element.style;
            return (style["animation"] !== undefined && style["transition"] !== undefined) || arr.some(prefixes, function (p) {
                return style[p + "Animation"] !== undefined && style[p + "Transition"] !== undefined;
            });
        });
        has.add("t17164", function (global, document, element) {
            return (element.style["transition"] !== undefined) && !("TransitionEvent" in window);
        });
        var css3 = {name:function (p, hyphen) {
            var n = (hyphen ? hnames : cnames)[p];
            if (!n) {
                if (/End|Start/.test(p)) {
                    var idx = p.length - (p.match(/End/) ? 3 : 5);
                    var s = p.substr(0, idx);
                    var pp = this.name(s);
                    if (pp == s) {
                        n = p.toLowerCase();
                    } else {
                        n = pp + p.substr(idx);
                    }
                } else {
                    if (p == "keyframes") {
                        var pk = this.name("animation", hyphen);
                        if (pk == "animation") {
                            n = p;
                        } else {
                            if (hyphen) {
                                n = pk.replace(/animation/, "keyframes");
                            } else {
                                n = pk.replace(/Animation/, "Keyframes");
                            }
                        }
                    } else {
                        var cn = hyphen ? p.replace(/-(.)/g, function (match, p1) {
                            return p1.toUpperCase();
                        }) : p;
                        if (style[cn] !== undefined && !has("t17164")) {
                            n = p;
                        } else {
                            cn = cn.charAt(0).toUpperCase() + cn.slice(1);
                            arr.some(prefixes, function (prefix) {
                                if (style[prefix + cn] !== undefined) {
                                    if (hyphen) {
                                        n = "-" + prefix + "-" + p;
                                    } else {
                                        n = prefix + cn;
                                    }
                                }
                            });
                        }
                    }
                }
                if (!n) {
                    n = p;
                }
                (hyphen ? hnames : cnames)[p] = n;
            }
            return n;
        }, add:function (styles, css3Styles) {
            for (var p in css3Styles) {
                if (css3Styles.hasOwnProperty(p)) {
                    styles[css3.name(p)] = css3Styles[p];
                }
            }
            return styles;
        }};
        return css3;
    });
}, "*now":function (r) {
    r(["dojo/i18n!*preload*dojo/nls/dojo*[\"ar\",\"ca\",\"cs\",\"da\",\"de\",\"el\",\"en-gb\",\"en-us\",\"es-es\",\"fi-fi\",\"fr-fr\",\"he-il\",\"hu\",\"it-it\",\"ja-jp\",\"ko-kr\",\"nl-nl\",\"nb\",\"pl\",\"pt-br\",\"pt-pt\",\"ru\",\"sk\",\"sl\",\"sv\",\"th\",\"tr\",\"zh-tw\",\"zh-cn\",\"ROOT\"]"]);
}}});
(function () {
    var require = this.require;
    require({cache:{}});
    !require.async && require(["dojo"]);
    require.boot && require.apply(null, require.boot);
})();

