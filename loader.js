
//RIAStudio Server loader.

///Load Environment=========================================================================///

(function () {
	var SysUtil = com.riastudio.util.SysUtil;

	var log = function (level, objName, req, message) {
		if (typeof req == "string" || req instanceof String) {
			SysUtil.log(level, objName, req);
		} else {
			if (message) {
				SysUtil.logRequest(level, objName, req, message);
			} else {
				SysUtil.logRequest(level, objName, req);
			}
		}
	};

	startServer = function (/*boolean*/newServer) {
		//如果要获取根目录，需在该函数返回后在前面加上"/"。
		function trimPath(str) {
			var p = 0,
				trim = " /\\";
			if (trim.indexOf(str.charAt(p)) >= 0) {
				p++;
			}
			str = str.substring(p);
			p = str.length;
			if (trim.indexOf(str.charAt(p - 1)) >= 0) {
				p--;
			}
			return str.substring(0, p);
		}
		function compactPath(path){
			var result = [],
				segment, lastSegment;
			path = path.replace(/\\/g, '/').split('/');
			while(path.length){
				segment = path.shift();
				if(segment == ".." && result.length && lastSegment != ".."){
					result.pop();
					lastSegment = result[result.length - 1];
				}else if(segment != "."){
					result.push(lastSegment = segment);
				} // else ignore "."
			}
			return result.join("/");
		}
		function isObjectExact(it) {
			return (it !== undefined) && (it !== null) &&
				(typeof it === "object" && !(it instanceof Array || typeof it === "array")) &&
				(Object.prototype.toString.call(it) !== "[object Function]");
		}
		function _loadServer() {

			log(1, "loader", "Loading ..." + riasServerConfig.dojoFile);
			load(riasServerConfig.dojoFile);
			log(1, "loader", riasServerConfig.dojoFile + " Loaded.");

			require(["rias"], function (rias) {
				rias.log = log;
				rias.afterLoaded(function () {
					rias.webServer = {};
					var sn;
					for(sn in riasServerConfig.appPackage){
						if(riasServerConfig.appPackage.hasOwnProperty(sn)){
							log(1, "loader", "Loading serverApp ... [" + sn + "] @ " + compactPath(rias.require.baseUrl + riasServerConfig.appPackage[sn]));
							rias.require.packs[sn] = {name: sn, location: riasServerConfig.appPackage[sn], main: "serverApp/serverApp"};

							rias.require([
								"rias/riass/JettyServer",
								sn
							], function (JettyServer, sApp) {
								sApp.config.appName = sn;
								sApp.config.path = {};
								//sApp.config.path.riasLib = trimPath(sApp.config.path.riasLib);
								//sApp.config.path.webLib = trimPath(sApp.config.path.webLib);
								//sApp.config.path.appRoot = trimPath(sApp.config.path.appRoot);
								sApp.config.path.riasLib = trimPath(riasServerConfig.riasLib);
								sApp.config.path.webLib = trimPath(riasServerConfig.webLib);
								sApp.config.path.appRoot = rias.require.baseUrl + riasServerConfig.appPackage[sn];
								rias.webServer[sn] = new JettyServer(sApp.config);
								rias.webServer[sn].start();
							});
						}
					}
				});
			});
		}
		_loadServer();
	};
	try {
		startServer(true, true);
	} catch (e) {
		log(3, "loader", "Load Environment Error: " + e + "\n" + e.javaException);
	}

}());
