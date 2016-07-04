define([
	"rias"
], function(rias){
	return {
		"_rsfVersion": 17,
		"region": "center",
		"_riaswVersion": "1.0",
		"currentTheme": "rias",
		"defaultTimeout": 15000,
		"oper": {
			"logged": false,
			"code": "",
			"name": "",
			"petname": "",
			"rights": {},
			"persist": {}
		},
		"actions": function (){
			return {
				"login": rias.webApp.dataServerAddr + "act/login",
				"logout": rias.webApp.dataServerAddr + "act/logout"
			};
		},
		"afterLogin": function(){
		},
		"_afterLogin": function(){
			var m = this;
			if(!rias.webApp.oper.logged){
				m._afterLogout();
			}else{
				rias.cookie("operCode", rias.webApp.oper.code, {expires: 7});
				m.loadDatas({}, function(){
					m.afterLogin();
				});
			}
		},
		"afterLogout": function(){
		},
		"_afterLogout": function(){
			var m = this;
			m.afterLogout();
		},
		"login": function(data){
			var m = this,
				r = false;
			function _after(result){
				rias.webApp.oper = result && result.success ? result.value.oper : {
					"logged": false,
					"code": "",
					"name": "",
					"petname": "",
					"rights": {},
					"persist": {}
				};
				m._afterLogin();
			}
			if(data && data.password){
				data.password = rias.encoding.SimpleAES.encrypt(data.password, "riaeasy");
			}
			if(m.actions().login){
				r = rias.xhrPost({
						url: m.actions().login,
						handleAs: "json",
						timeout: rias.webApp.defaultTimeout
					}, data, function(result){
						if(!result.success || result.success < 1){
							//_after();
						}else{
							_after(result);
						}
					}
				);
			}
			return r;
		},
		"logout": function(data){
			var m = this,
				r = false;
			function _after(){
				rias.webApp.oper = {
					"logged": false,
					"code": "",
					"name": "",
					"petname": "",
					"rights": {},
					"persist": {}
				};
				m._afterLogout();
			}
			if(m.actions().logout){
				r = rias.xhrPost({
						url: m.actions().logout,
						handleAs: "json",
						timeout: rias.webApp.defaultTimeout
					}, data, function(result){
						_after();
					}
				);
			}
			return r;
		},
		"doLogin": function (around){
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
				moduleMeta: "appModule/app/login"
			});
		},
		"doLogout": function (around){
			var m = this;
			rias.choose({
				ownerRiasw: m,//rias.webApp,
				_riaswIdOfModule: "winLogout",
				iconClass: "loginIcon",
				around: around,
				dialogType: "modal",
				//id: "winLogout",
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
					rias.webApp.logout();
				}
			});
		},
		"getLocation": function (){
			var loc = this.location();
			if (loc.charAt(loc.length-1) === '/'){
				loc=loc.substring(0, loc.length - 1);
			}
			return loc;
		},
		"loadDatas": function (querys, callback){
			var m = this;
			return m.datas.onceLoaded(function(){
				return m.datas.loadDatas(querys).then(function(){
					if(rias.isFunction(callback)){
						callback(m.datas);
					}
				}, function(){
					rias.warn({
						dialogType: "modal",
						//around: around,
						content: "初始化数据失败，请重新登录."
					});
				});
			});
		},
		"hasRight": function (rightCode){
			rightCode = rias.trim(rightCode).toLowerCase();
			rightCode = this.oper.rights[rightCode];
			return rightCode == true;
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
