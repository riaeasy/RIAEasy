
//RIAStudio business intelligence(riasbi).

define("riasbi/main", [
	"riasw/riaswBase",
	"dojo/i18n!riasbi/nls/riasbiI18n"
], function(rias, riasbiI18n) {

/// riasbi ******************************************************************************///

	rias.i18n.riasbi = riasbiI18n;///需要这里先赋值。

	var riasbi = rias.getObject("riasbi", true);
	riasbi._scopeName = "riasbi";
	dojo.scopeMap.riasbi = ["riasbi", riasbi];
	//rias.riasbi = riasbi;

	rias._initRiasbi = function(){
		var d = rias.newDeferred("_initRiasbi", rias.defaultDeferredTimeout, function(){
			this.cancel();
		});
		rias.require([
			"riasbi/riasbiBase"
		], function(rias){
			rias.require([
				"riasbi/riasbiMetas"
			], function(riasbiMetas){
				try{
					rias.theme.loadCss([
						rias.toUrl("riasbi/resources/riasbi.css")
					]);

					if(riasbiMetas === "not-a-module"){
						rias.has.add("riasbi", 0, 0, 1);
						d.reject(false);
					}else{
						rias.registerRiaswMetas(1, riasbiMetas);
						d.resolve(riasbi);
					}
				}catch(e){
					rias.has.add("riasbi", 0, 0, 1);
					d.resolve(false);
				}
			});
		});
		return d.promise;
	};

	return riasbi;

});
