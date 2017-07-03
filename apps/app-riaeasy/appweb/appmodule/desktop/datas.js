define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 97,
	"_riaswVersion": "0.7",
	"caption": {
		"$refObj": "rias.i18n.desktop.datas"
	},
	"loadMetaOnStartup": true,
	"style": {
	},
	"actions": function (){
		return {
			xdict: rias.desktop.dataServerAddr + 'act/xdict/initData'
		};
	},
	"afterLoadedAll": function (loadOk){
		var m = this;
		if(loadOk){
			if(rias.hostNative && rias.nativeShell){
				m.xdict.target = rias.xhr.toServerUrl(m.actions().xdict);
			}else{
				m.xdict.target = m.actions().xdict;
			}
			//rias.desktop.datas = m;///需要重置
			return m.initDatas();
		}
	},
	"afterLogin": function (){
	},
	"afterLogout": function (){
	},
	"initDatas": function (querys){
			var m = this,
				dfs = [];
			rias.desktop.initDataOk = false;
			console.debug("begin datas.initDatas()");
			try{
				dfs.push(rias.hostNative && rias.nativeShell ? m.loadXdict(querys && querys.xdict) : m.loadXdict(querys && querys.xdict));
			}catch(e){
				console.error("datas.initDatas() error.", e);
			}
			return rias.all(dfs).then(function(){
				rias.desktop.initDataOk = true;
				console.debug("end datas.initDatas()");
				return true;
			}, function(e){
				console.error("datas.initDatas() error.", e);
				rias.warn("初始化数据失败.\n" + e, m);
				//return rias.newDeferredReject(e);
			});
		},
	"reloadDatas": function (querys){
			var m = this,
				dfs = [];
			m.dataLoaded = false;
			m.dataLoadError = false;
			console.debug("begin datas.reloadDatas()");
			try{
				dfs.push(m.loadXdict(querys && querys.xdict));
				//if(!querys){
				//	if(rias.hostNative && rias.nativeShell){
				//		dfs.push(allOther);
				//	}else{
				//		dfs.push(allOther);
				//	}
				//}else if(querys.xxx){
				//	dfs.push(xxx);
				//}
			}catch(e){
				console.error("datas.reloadDatas() error.", e);
			}
			return rias.all(dfs).then(function(){
				m.dataLoaded = true;
				console.debug("end datas.reloadDatas()");
				return true;
			}, function(e){
				m.dataLoadError = true;
				console.error("datas.reloadDatas() error.", e);
				rias.warn("加载数据失败.\n" + e, m);
				return rias.newDeferredReject(e);
			});
		},
	"loadXdict": function (query){
		return this.xdict.initByHttp(query || {
			_initData: 1
		}).then(function(result){
			console.debug("datas.loadXdict() ok.");
			return result;
		}, function(e){
			console.error("datas.loadXdict() error.", e);
			return rias.newDeferredReject(e);
		});
	},
	"getXdictTextById": function (id){
		return this.xdict.index[id] ? this.xdict.data[this.xdict.index[id]].text : id;
	},
	"getXdictTextByIdpDval": function (idp, dval){
		var item = this.xdict.find({
			idp: idp,
			dval: dval
		});
		return item && item.length > 0 ? item[0].text : dval;
	},
	"getXdictTextByCodepDval": function (codep, dval){
		var item = this.xdict.find({
			parentCode: codep,
			dval: dval
		});
		return item && item.length > 0 ? item[0].text : dval;
	},
	"getXdictTextByCode": function (code){
		var item = this.xdict.find({
			code: code
		});
		return item && item.length > 0 ? item[0].text : code;
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.store.MemoryStore",
			"_riaswIdInModule": "xdict",
			"defaultData": [
			],
			"idProperty": "id",
			"timeout": {
				"$refScript": "return rias.desktop.defaultTimeout;"
			}
		}
	]
};
	
});
