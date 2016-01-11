

//RIAStudio Servlet of action.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”

define([
	"rias"
], function (rias) {

	//必须在 service 中完成全部操作，否则多线程不安全。共享变量、对象实例、静态函数/方法等需要单独处理线程安全问题。
	//req.setAttribute是session共享，注意线程安全问题。
	function service(req, res) {
		var server = this,//rias.webServer,
			_cache = server._cacheAction,
			url = server.getRequestURL(req),
			cmd = server.getServletPath(req),
			act = server.getPathInfo(req),
			method = server.getMethod(req),
			p = server.getParameters(req),
			useCache = 1,
			actFunc,
			oper;

		if (method === "POST") {
			switch (server.getConditionSrv(0, req, "_method")) {
				case "DELETE":
					method = "DELETE";
					break;
				case "PUT":
					method = "PUT";
					break;
				default:
			}
		}

		var dt0 = 0,
			dt1 = 0;
		if (rias.isDebug) {
			dt0 = new Date();
		}
		function _doFunc(func) {
			//rias.log(0, "action", "Executing... " + act + "\n");
			try {
				var r = func.apply(server, [method, req, res]);
				var code,
					str = "";
				if (r) {
					if (r.code) {
						code = r.code;
					} else if (r.success === 1 || r.success === true) {
						if (method === "GET") {
							code = server.responseCode.SC_OK;
						} else if (method === "PUT") {
							code = server.responseCode.SC_ACCEPTED;
						} else if (method === "POST") {
							code = server.responseCode.SC_CREATED;
						} else if (method === "DELETE") {
							code = server.responseCode.SC_OK;
						} else {
							code = server.responseCode.SC_OK;
						}
					} else {
						code = server.responseCode.SC_INTERNAL_SERVER_ERROR;
					}
					if (method === "GET") {
						if (r.args && ("count" in r.args)) {
							res.setHeader("Content-Range", "items " + r.args.start + "-" + r.args.end + "/" + r.args.count);
						}
						//res.setHeader("Access-Control-Allow-Origin:", req.getScheme()+"://"+req.getServerName()+":"+req.getServerPort());
						str = (rias.isString(r.value) ? r.value : rias.toJson(r.value));
					} else if (rias.isString(r)) {
						str = r;
					} else {
						delete r.args;
						str = rias.toJson(r);
					}
					server.response(req, res, code, str);
					if (rias.isDebug) {
						dt1 = new Date();
						rias.log(0, "action", req, "response: (" + str.length + " B) - 耗时：" + (dt1 - dt0) + " 毫秒，从" +
							rias.datetime.format(dt0, "HH:mm:ss:SSS") + " 到 " + rias.datetime.format(dt1, "HH:mm:ss:SSS") + "\n"
							+ " - result: " + (str.length < 255 ? str : (str.substr(0, 252) + "...")) + "\n");
					}
				} else {
					rias.log(3, "action", rias.substitute("action Servlet Error: ${0}, url: '${1}'.", ["no result.", url]) + "\n");
					//server.response(req, res, server.responseCode.SC_INTERNAL_SERVER_ERROR, e);
					server.response(req, res, server.responseCode.SC_INTERNAL_SERVER_ERROR, url);
				}
			} catch (e) {
				rias.log(3, "action", rias.substitute("action Servlet Error: ${0}, url: '${1}'.", [e, url]) + "\n");
				//server.response(req, res, server.responseCode.SC_INTERNAL_SERVER_ERROR, e);
				server.response(req, res, server.responseCode.SC_INTERNAL_SERVER_ERROR, url);
			} finally {
				//if(rias.isDebug){
				//	rias.undef(fn);
				//}//启用了 server.monitor，不需要此处处理了。
			}
		}

		//debugLevel = 0: debug; 1: info; 2: warn; 3: error;
		delete p._define;
		delete p._meta;
		//p._rsfs = string;
		//if (p._rsfs) {
		//	//delete params._rsfs.items;
		//	p._rsfs.items = [];
		//}
		delete p._rsfs;
		oper = server.getOper(req);
		rias.log(1, "action", req, "params: " + rias.toJson(p) + "\n");
		try {
			req.setCharacterEncoding("utf-8");
			res.setContentType("text/html;charset=utf-8");
			if (cmd === "/act") {
				act = rias.trimStart(act, "/\\");
				act = rias.trimEnd(act, "/\\");
				var paths = act.split('/'),
					m = [], fn, appName = "",
					s;
				if (paths.length < 1) {
					throw "Invalid act path...";
				} else {
					if (paths[0].startWith("rias")) {
						m.push("rias");
						if (paths[0] !== "rias") {
							m.push(paths[0]);
						}
						m.push("act");
						paths.shift()
					} else {
						///m.push(server.appName);///包路径转换已经包含了 appName 路径，且第一个必须是 packagename
						appName = server.appName + "/";
						m.push("serverApp");
						m.push("act");
					}
					for (var i = 0, l = paths.length; i < l; i++) {
						s = paths[i];
						if (/\s|\./.test(s)) {
							throw "Invalid act path...";
						} else if (s === "") {
							continue;
						} else if (s === "webApp") {///如果变换了包路径，则后面需要用 load() 而不是 require() 。
							//m.push("appRoot/act")
						} else if (s === "rias") {
							//m.push("rias/riass/act")
						} else {
							m.push(s);
						}
					}
					if (m.length < 1) {
						throw "Invalid act path...";
					}
					fn = m.join("/");
					if (!server.hasRight(oper, act, method)) {
						rias.log(2, "action", req, rias.substitute("oper(${0}) has no right of action(${1}).${2}", [oper.operCode, act, method]) + "\n");
						throw act + ".hasNoRight";
					}
					if (useCache) {
						actFunc = _cache.get(appName + fn);
						if (rias.isDebug && actFunc) {
							rias.log(0, "action", req, "From cache: " + appName + fn + "\n");
						}
					}
					if (actFunc) {
						_doFunc(actFunc);
					} else {
						if (rias.isDebug) {
							rias.log(0, "action", req, "Loading... " + appName + fn + "\n");
						}
						///FIXME:zensst. 线程安全？ 增加 'act'.js 的 cache，去掉 require
						if (server.fileExists(fn + ".js", m[0])) {
							rias.require([appName + fn], function (func) {
								_cache.put(appName + fn, func);
								_doFunc(func);
							});
						} else {
							rias.log(3, "action", "Not Found:" + url + "\n");
							server.response(req, res, server.responseCode.SC_NOT_FOUND, rias.substitute(rias.i18n.message.notfound, [url]));
						}
					}
				}
			} else {
				rias.log(2, "action", "Not Found:" + url + "\n");
				server.response(req, res, server.responseCode.SC_NOT_FOUND, rias.substitute(rias.i18n.message.notfound, [url]));
			}
		} catch (e) {
			rias.log(3, "action", rias.substitute("action Servlet Error: ${0}, url: '${1}'.\n", [e, url]) + "\n");
			server.response(req, res, server.responseCode.SC_INTERNAL_SERVER_ERROR, e.message);
		}
	}

	return service;

});
