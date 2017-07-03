//RIAStudio Client Runtime(rias).

//var rias = {};

define([
	"exports",
	"dojo/_base/kernel",
	"dojo/_base/lang",
	"dojo/has",
	"dojo/Deferred",
	"dojo/promise/all"
], function (exports, dojo, lang, has, Deferred, all) {

	//var rias = {};
	///TODO:zensst. 已经定义时的处理。
	lang.setObject("rias", exports);
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

	//has.add("require-encoding", true);

	require([
		"rias/riasBase"
	], function (rias) {
		if (has("host-browser")) {
			rias.getObject("riasw", true);
			if(!rias.require.packs.riasw){
				rias.require.packs.riasw = {
					name: "riasw",
					location: "../riasw",
					main: "main"
				};
			}
			rias.require([
				"riasw/riaswCommon"
			], function (rias) {
				_d.resolve(rias);
			});
		} else if (has("host-rhino") || has("host-node")) {
			rias.getObject("riass", true);
			if(!rias.require.packs.riass){
				rias.require.packs.riass = {
					name: "riass",
					location: "../riass",
					main: "main"
				};
			}
			rias.require([
				"riass/riassBase"
			], function (rias) {
				_d.resolve(rias);
			});
		}else{
			_d.resolve(rias);
		}
	});

	return exports;

});