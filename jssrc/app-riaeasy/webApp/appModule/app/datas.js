define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 71,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "0.7",
	"caption": "",
	"style": {
	},
	"title": "数据集",
	"actions": function (){
		return {
			xdict: 'act/xdict/query',		
			xoper: 'act/xoper/query'		
		};
	},
	"afterLoaded": function (){
		var m = this;
		if(rias.hostMobile && rias.mobileShell){
			m.xdict.target = rias.xhr.toServerUrl(m.actions().xdict);
			m.xoper.target = rias.xhr.toServerUrl(m.actions().xoper);
		}else{
			m.xdict.target = m.actions().xdict;
			m.xoper.target = m.actions().xoper;
		}	
	},
	"loadDatas": function (querys){
		var m = this,
			dfs;
		m.dataLoaded = false;
		console.debug("begin datas.loadDatas()");
		try{
			dfs = (rias.hostMobile && rias.mobileShell ? [
				//m.loadXdict(querys && querys.xdict),
				//m.loadXoper(querys && querys.xoper),
			] : [
				//m.loadXdict(querys && querys.xdict),
				//m.loadXoper(querys && querys.xoper),
			]);
		}catch(e){
			dfs = [];
			console.error("datas.loadDatas() error.", rias.getStackTrace(e));
		}
		return rias.all(dfs).then(function(){
			m.dataLoaded = true;
			console.debug("end datas.loadDatas()");
		}, function(e){
			m.dataLoadError = true;
			console.error("datas.loadDatas() error.", e);
		});
	},
	"loadXdict": function (query){
		return this.xdict.loadByHttp(query || {
			_initData: 1
		});
	},
	"loadXoper": function (query){
		return this.xoper.loadByHttp(query || {
			_initData: 1
		});
	},
	"getXdictTextById": function (id){
		return this.xoper.index[id] ? this.xoper.data[this.xoper.index[id]].text : id;
	},
	"getXoperTextById": function (id){
		return this.xoper.index[id] ? this.xoper.data[this.xoper.index[id]].text : id;
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.store.MemoryStore",
			"_riaswIdOfModule": "xdict",
			"defaultData": [
				{
					"id": "",
					"code": "",
					"parentCode": "",
					"text": "无"
				}
			],
			"idAttribute": "id",
			"target": {
				"$refScript": "return module.actions.xdict;"
			},
			"timeout": {
				"$refScript": "return rias.webApp.defaultTimeout;"
			}
		},
		{
			"_riaswType": "rias.riasw.store.MemoryStore",
			"_riaswIdOfModule": "xoper",
			"defaultData": [
				{
					"code": "",
					"id": "",
					"text": "无",
					"typ": ""
				}
			],
			"idAttribute": "id",
			"target": {
				"$refScript": "return module.actions.xoper;"
			},
			"timeout": {
				"$refScript": "return rias.webApp.defaultTimeout;"
			}
		}
	]
}
	
});
