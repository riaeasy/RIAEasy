//RIAStudio Client Runtime(rias).

//var rias = {};

define([
	"exports",
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/has",
	"dojo/Deferred",
	"dojo/promise/all",
	"dojo/ready"
], function (exports, dojo, lang, has, Deferred, all, ready) {

	//var rias = {};

	///TODO:zensst. 已经定义时的处理。
	dojo.setObject("rias", exports);
	exports._scopeName = "rias";
	dojo.scopeMap.rias = ["rias", exports];

	var _d = new Deferred();
	exports.whenLoaded = function(callback){
		var self = this;
		return all(exports.whenLoaded._deferreds).then(function(result){
			return callback.apply(self, [true]);
		}, function(result){
			return callback.apply(self, [false]);
		});
	};
	exports.whenLoaded._deferreds = [_d];

	///不在前面加载，是为了保障加载的是打包后的 dojo/dojo 和 dijit/dijit（host-browser）
	require(["rias/main"], function (rias) {
		if (has("host-browser")) {
			rias.require(["dijit/main"], function () {///mobile 中不支持 _base/，需要打包显式加载
				rias.require([
					"rias/riasw/riastudio"
				], function (rias) {
					_d.resolve(rias);
				});
			});
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