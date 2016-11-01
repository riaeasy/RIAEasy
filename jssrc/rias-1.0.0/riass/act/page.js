

//RIAStudio Server Page of page.
//非常重要：Rhino中的String不是js的string，请使用 “==” 来判断，而不是“===”
//非常重要：act函数中不能使用能被并发改写的公共变量，否则多线程请求响应会混乱.

define([
	"rias"
], function(rias) {

	return function (method, req, res) {
		var app = this,
			oper = app.getOper(req),
			result = {
				success: false,
				value: ""
			},
			logName = "act/riass/page";

		//if(!app.setXdHeader(req, result)){
		//	return result;
		//}

		if (method === "GET" || method === "POST") {
			var appEnv = "appModule/app/app",
				module = app.getConditionSrv(0, req, "module"),
				appName = app.getConditionSrv(0, req, "appName"),
				pageTitle = app.getConditionSrv(0, req, "title"),
				//appPath = (module.startWith("rias") ? "" : app.appName + "/"),
				fn = app.convertFilePathName(module) + ".js";

			if(!app.hasRightOf(app.pageRight, module, method, oper, result)){
				rias.log(2, logName, rias.substitute("oper(${0}[${1}]) has no right of page-appModule(${2}).${3}", [oper.id, oper.code, module, method]) + "\n");
				result.value = "该模块缺少页面展现的权限.";
			}else{
				var ss = {
					//dojoPathLevel: "../../../../",
					appName: appName,
					pageTitle: pageTitle,
					appEnvModuleMeta: appEnv,
					mainModuleMeta: module,
					seo: ""
				};
				var pageHtmlCache = app.caches.pageHtmlCache,
					appModuleCache = app.caches.appModuleCache;
				var appModuleMeta = appModuleCache.get(fn);
				if (!appModuleMeta) {
					rias.log(0, logName, req, "Loading... " + fn);
					rias.synRequire([fn], function (meta) {
						appModuleMeta = meta;
						appModuleCache.put(fn, meta);
					});
				}
				if(appModuleMeta){
					ss.seo = appModuleMeta.seo || "";
					var htmlname = "rias/riass/act/page.html",
						html = pageHtmlCache.get(htmlname);
					if(!html){
						rias.log(0, logName, req, "Loading... " + htmlname);
						html = app.readText(htmlname, "rias");
						pageHtmlCache.put(htmlname, html);
					}
					//ss.dojoPathLevel = rias.rep("../", module.split("/").length + 1);
					if(html){
						result.success = true;
						result.value = rias.substitute(html, ss);
					}
				}
			}
		//}else if(method === "OPTIONS"){
		//	result.success = true;
		}

		return result;

	}

});
