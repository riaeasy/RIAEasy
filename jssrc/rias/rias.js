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
		//if(!rias.require.packs.dijit){
		//	rias.require.packs.dijit = {name: 'dijit', location: '../dijit'};
		//}
		//if(!rias.require.packs.dojox){
		//	rias.require.packs.dojox = {name: 'dojox', location: '../dojox'};
		//}
		if (has("host-browser")) {
			rias.require(["dijit/dijit"], function () {
				rias.require([
					"rias/riasw/riastudio",
					"rias/base/validate"
				], function (rias) {
					_d.resolve(rias);
				});
			});
		} else if (has("host-rhino") || has("host-node")) {
			rias.require(["rias/riass/riass"], function (rias) {
				/*if (has("host-rhino")) {
					var timeouts = [];
					clearTimeout = function(idx){
						if(!timeouts[idx]){ return; }
						timeouts[idx].stop();
					};

					setTimeout = function(func, delay){
						var def = {
							sleepTime:delay,
							hasSlept:false,

							run:function(){
								if(!this.hasSlept){
									this.hasSlept = true;
									//java.lang.Thread.currentThread().sleep(this.sleepTime);
									java.lang.Thread.sleep(this.sleepTime);
								}
								try{
									func();
								}catch(e){
									console.debug("Error running setTimeout thread:" + e);
								}
							}
						};

						var runnable = new java.lang.Runnable(def);
						var thread = new java.lang.Thread(runnable);
						thread.start();
						return timeouts.push(thread) - 1;
					};
				}*/
				_d.resolve(rias);
			});
		}
	});

	return exports;

});