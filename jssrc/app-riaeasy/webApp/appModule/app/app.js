define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 18,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "1.0",
	"appBuildtime": "@buildtime@",
	"appHome": "http://www.riaeasy.com:8081/",
	"appOwner": "成都世高科技有限公司",
	"appTitle": "RIAEasy 1.0",
	"appUser": "成都世高科技有限公司",
	"appVersion": {
		"flag": "",
		"major": 1,
		"minor": 0,
		"patch": 0,
		"revision": 1,
		"toString": function (){
				var v = rias.version;
				return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
					" (RIAStudio:" + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
			}
	},
	"currentTheme": "rias",
	"defaultTimeout": 15000,
	"logged": false,
	"oper": {
		"code": "",
		"name": "",
		"rights": {
		}
	},
	"region": "center",
	"dataServerAddr": "http://www.riaeasy.com:8081/",
	"getOper": function () {
			return this.oper;
		},
	"getUserWorkspaceUrl": function (){
			var loc = this.location();
			if (loc.charAt(loc.length-1) === '/'){
				loc=loc.substring(0, loc.length - 1);
			}
			return loc;
		},
	"loadDatas": function (querys, callback){
			var m = this;
			return m.datas.loadDatas(querys).then(function(){
				if(rias.isFunction(callback)){
					callback(m.datas);
				}
			}, function(){
				rias.warn({
					dialogType: "modal",
					around: around,
					content: "初始化数据失败，请重新登录."
				});
			});
		},
	"login": function (around, okcall, errcall){
			var m = this;
			rias.show({
				ownerRiasw: m,//rias.webApp,
				_riaswIdOfModule: "winLogin",
				iconClass: "loginIcon",
				around: around,
				//positions: ["below-alt"],
				dialogType: "modal",
				//id: "winLogin",
				caption: rias.i18n.webApp.login,
				autoClose: 0,
				resizable: "",
				maxable: false,
				state: 0,
				//cookieName: "",
				//persist: false,
				moduleMeta: "appModule/app/login",
				afterSubmit: function(){
					if(!rias.webApp.logged){
						rias.info({
							dialogType: "modal",
							around: around,
							content: "未能登录，请重新登录."
						});
						if(rias.isFunction(errcall)){
							errcall(rias.webApp.logged, rias.webApp.oper);
						}
					}else{
						m.loadDatas({}, function(){
							if(rias.isFunction(okcall)){
								okcall(rias.webApp.logged, rias.webApp.oper);
							}
						});
					}
				}
			});
		},
	"logout": function (around, callback){
			rias.choice({
				ownerRiasw: m,//rias.webApp,
				_riaswIdOfModule: "winLogout",
				around: around,
				dialogType: "modal",
				id: "winLogout",
				caption: rias.i18n.webApp.logout,
				autoClose: 0,
				content: "是否退出?",
				//resizable: false,
				//maxable: false,
				//minable: false,
				//state: 0,
				//cookieName: "",
				//persist: false,
				onSubmit: function(){
					rias.webApp.logged = false;
					rias.webApp.oper = {
						code: "",
						name: "",
						rights: {}
					};
					_redef().then(function(){
						if(rias.isFunction(callback)){
							callback(rias.webApp.logged, rias.webApp.oper);
						}
					});
				}
			});
		},
	"hasRight": function (rightCode){
			return true;//FIXME:zensst.
		},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.studio.Module",
			"_riaswIdOfModule": "mainModule",
			"region": "center",
			"moduleMeta": "appModule/app/mainModule",
			"style": {
				"padding": "0px"
			}
		},
		{
			"_riaswType": "rias.riasw.studio.Module",
			"_riaswIdOfModule": "datas",
			"moduleMeta": "appModule/app/datas"
		}
	]
}
	
});
