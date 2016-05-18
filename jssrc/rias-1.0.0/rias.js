//RIAStudio Client Runtime(rias).

//var rias = {};

define([
	"exports",
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/has",
	"dojo/Deferred",
	"dojo/ready"
], function (exports, dojo, lang, has, Deferred, ready) {

	//var rias = {};

	///TODO:zensst. 已经定义时的处理。
	//var rias = dojo.getObject("rias");
	//if(rias){
	//	dojo.mixin(exports, rias);
	//}else{
	dojo.setObject("rias", exports);
	exports._scopeName = "rias";
	dojo.scopeMap.rias = ["rias", exports];
	//}

	var _d = new Deferred();
	exports.afterLoaded = _d.then;

	///不在前面加载，是为了保障加载的是打包后的 dojo/dojo 和 dijit/dijit（host-browser）
	require(["rias/base/riasBase"], function (rias) {
		if (has("host-browser")) {
			//rias.require(["dijit/main"], function () {
				rias.require([
					"rias/riasw/riastudio",
					"rias/riasw/validate"
				], function (rias) {
					_d.resolve(rias);
				});
			//});
		} else if (has("host-rhino") || has("host-node")) {
			rias.require(["rias/riass/riass"], function (rias) {
				_d.resolve(rias);
			});
		}else{
			_d.resolve(rias);
		}
	});

	return exports;

});