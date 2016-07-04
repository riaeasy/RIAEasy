//RIAStudio Client Runtime(rias.webApp).

define([
	"rias",
	"dojo/i18n!./nls/appi18n",
	"./riaswMappers"
], function(rias, appi18n, riaswMappers) {

	rias.registerRiaswMappers(riaswMappers);
	rias.i18n.webApp = appi18n;

	rias.theme.loadWebAppCss([
		"webApp.css"
	]);

	var d = rias.newDeferred();
	if(!rias.webApp){
		rias.createWebApp({
			id: rias.dom.docBody.id ? rias.dom.docBody.id : "webApp"
		}).then(function(webApp){
			rias.setObject("webApp", webApp);
			webApp._scopeName = "webApp";
			dojo.scopeMap.webApp = ["webApp", webApp];

			webApp.own(webApp._onBeforeUnload = rias.on(window, "beforeunload", function(e){
				return "是否退出并关闭[" + webApp.appTitle + "]?";
			}));
			webApp.moduleMeta = "appModule/app/app";
			rias.mixin(webApp, {
				"appBuildtime": new Date(),
				"appHome": "http://www.riaeasy.com:8081/",
				"appOwner": "成都世高科技有限公司",
				"appTitle": "RIAEasy 1.0",
				"appUser": "成都世高科技有限公司",
				"appVersion": {
					"flag": "",
					"major": "1",
					"minor": "0",
					"patch": "0",
					"revision": "1.0",
					"toString": function (){
						var v = rias.studioVersion;
						return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
							" (RIAStudio: " + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
					}
				}
			});
			webApp.startup();
		});
	}

	return d.promise;

});