//RIAStudio Client Runtime(rias.webApp).

define([
	"rias",
	"dojo/i18n!./nls/appi18n",
	"./riaswMappers",
	"rias/riasw/studio/App",
	"rias/riasw/studio/Module",
	"rias/riasw/studio/DefaultError"
], function(rias, appi18n, riaswMappers, App) {

	rias.registerRiaswMappers(riaswMappers);
	rias.i18n.webApp = appi18n;

	rias.theme.loadWebAppCss([
		"webApp.css"
	]);

	var body = rias.body(rias.doc),
		params = body.id ? undefined : {
			id: "webApp"
		};
	if(!rias.webApp){
		rias.webApp = rias.createRiasw(App, params, body);

		rias.setObject("webApp", rias.webApp);
		rias.webApp._scopeName = "webApp";
		dojo.scopeMap.webApp = ["webApp", rias.webApp];

		rias.webApp.own(rias.webApp._onBeforeUnload = rias.on(window, "beforeunload", function(e){
			return "是否退出并关闭[" + rias.webApp.appTitle + "]?";
		}));
	}

	return rias.webApp;

});