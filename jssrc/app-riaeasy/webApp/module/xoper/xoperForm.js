define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 672,
	"_riaswVersion": "0.7",
	"style": {
		"height": "12em",
		"padding": "0px",
		"width": "56em"
	},
	"onSubmit": function (){
		var m = this,
			d = rias.newDeferred();
		rias.when(m.baseModule.onSubmit(), function(){
			d.resolve(1);
		}, function(){
			d.reject(0);
		});
		return d.promise;
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.studio.Module",
			"_riaswIdOfModule": "baseModule",
			"layoutPriority": 0,
			"moduleMeta": "appModule/xoper/xoperBase",
			"op": {
				"$refScript": "return module.op;"
			},
			"query": {
				"$refScript": "return module.query;"
			},
			"region": "center",
			"style": {
			}
		}
	]
}
	
});
