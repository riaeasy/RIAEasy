define([
	"rias"
], function(rias){
	return {
		"_rsfVersion": 18,
		"region": "center",
		"_riaswVersion": "1.0",
		"actions": function (){
			return {
				"login": this.dataServerAddr + "act/login",
				"logout": this.dataServerAddr + "act/logout"
			};
		},
		"initDatas": function (querys){
			var m = this,
				d = rias.newDeferred();
			if(!m.datas){
				d.resolve();
			}else{
				m.datas.whenLoadedAll(function(isOk){
					if(!isOk){
						d.reject("App.datas load error.");
						return false;
					}
					return m.datas.loadDatas(querys).then(function(result){
						d.resolve(result);
						return result;
					}, function(e){
						rias.warn({
							dialogType: "modal",
							//around: around,
							content: "初始化数据失败，请重新登录.\n" + e
						});
						d.reject(e);
						return e;
					});
				});
			}
			return d.promise;
		},
		postHeartbeat: function(){
			rias.xhr.post({
				url: this.heartbeatUrl,
				postData: {
					operCode: this.oper.code
				},
				handleAs: "json",
				timeout: this.defaultTimeout,
				ioPublish: false
			});
		},
		"login": function(args){
			args = args || {};
			var m = this,
				d,
				data = args.data,
				url = args.url;
			if(data){
				if(data.code){
					data.code = rias.encoding.SimpleAES.encrypt(data.code, "riaeasy");
				}
				if(data.password){
					data.password = rias.encoding.SimpleAES.encrypt(data.password, "riaeasy");
				}
			}
			if(!url){
				if(rias.isFunction(m.actions)){
					url = m.actions().login;
				}else if(rias.isObject(m.actions)){
					url = m.actions.login;
				}
			}
			if(url){
				d = rias.xhr.post({
					url: url,
					handleAs: "json",
					timeout: m.defaultTimeout
				}, data);
			}else{
				d = rias.newDeferred();
				d.resolve();
			}
			d.promise.always(function(result){
				var r;
				if(!result || !result.success || result.success < 1){
					if(rias.isFunction(args.onError)){
						args.onError.apply(this, arguments || []);
					}
					r = m.oper = m.getNullOper();
				}else{
					r = m.oper = result && result.success ? result.value.oper : m.getNullOper();
					if(m.oper.logged){
						r = m.initDatas({}).then(function(result){
							return result;
						}, function(result){
							return result;
						});
					}
				}
				return r;
			});
			d.then(function(){
				return m._afterLogin();
			});
			return d.promise;
		},
		"doLogin": function (args){
			//args = {
			//	around,
			//	callback,
			//	onCancel,
			//	onError
			//};
			args = args || {};
			var m = this;
			if(!m._doingLogin){
				m._doingLogin = rias.show({
					ownerRiasw: m,
					_riaswIdOfModule: "winLogin",
					iconClass: "loginIcon",
					around: args.around,
					//positions: ["below-alt"],
					dialogType: "modal",
					//id: "winLogin",
					caption: rias.i18n.webApp.login,
					resizable: "",
					maxable: false,
					state: 0,
					//cookieName: "",
					//persist: false,
					moduleMeta: "appModule/app/login"
				}).whenClose(function(closeResult){
						var result = rias.closeResult.isOk(closeResult);
						if(!result){
							console.info("App doLogin cancel.");
							rias.webApp.logout();
						}
						m._doingLogin = undefined;
						return result;
					});
			}
			return m._doingLogin;
		},
		"_riaswChildren": [
			{
				"_riaswType": "rias.riasw.studio.Module",
				"_riaswIdOfModule": "datas",
				"moduleMeta": "appModule/app/datas"
			}
		]
	}

});
