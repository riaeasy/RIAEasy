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
			webApp.startup();
		});
	}

	return d.promise;

});