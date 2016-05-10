
//RIAStudio Server initServer.

///Load Environment=========================================================================///

(function () {
	var SysUtil = com.riastudio.util.SysUtil;
	var ServerConfig = com.riastudio.server.ServerConfig;

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

	//如果要获取根目录，需在该函数返回后在前面加上"/"。
	/*function trimPath(str) {
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
	}*/
	try {
		log(1, "initServer", "Loading ..." + riasServerConfig.dojoFile);
		load(riasServerConfig.dojoFile);
		log(1, "initServer", riasServerConfig.dojoFile + " Loaded.");

		require(["rias"], function (rias) {
			rias.log = log;
			rias.afterLoaded(function () {
				var appName, appConfig, appPath, appServer, dbs;
				//var _dbs = [];
				for(appName in riasServerConfig.appPackage){
					if(riasServerConfig.appPackage.hasOwnProperty(appName)){
						appConfig = riasServerConfig.appPackage[appName];
						//appPath = appConfig.appPath;
						appPath = rias.rep("../", rias.require.baseUrl.split("/").length - 2) + appName;
						log(1, "initServer", "Loading AppServer[" + appName + "] @ " + appPath);
						rias.require.packs[appName] = {name: appName, location: appPath, main: "serverApp/serverApp"};

						rias.require([
							"rias/riass/AppServer",
							appName
						], function (AppServer, serverApp) {
							/*dbs = [];
							rias.forEach(appConfig.dbs, function(db){
								if(rias.indexOf(_dbs, db) < 0){
									dbs.push(db);
								}
							});
							appServer = new AppServer({
								appName: appName,
								defaultDbName: appConfig.defaultDbName,
								dbs: dbs
							});
							rias.concat(_dbs, appServer.dbs);
							appServer.destroy();*/
							appServer = new AppServer({
								appName: appName,
								defaultDbName: appConfig.defaultDbName,
								dbs: appConfig.dbs
							});
							rias.setObject("rias.appServer." + appName, appServer);
							ServerConfig.setApp(appName, appServer);
						});
					}
				}
				rias.require([
					"rias/riass/ActService"
				], function (ActService) {
					rias.setObject("rias.service.ActService", ActService);
					ServerConfig.setService("actService", ActService);
				});
			});
		});
	} catch (e) {
		log(3, "initServer", "Load db Environment Error: " + e + "\n" + e.javaException);
	}

}());
