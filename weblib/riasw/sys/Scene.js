
/// riasw.sys.Scene

define([
	"riasw/riaswBase",
	"riasw/layout/CaptionPanel",
	"riasw/sys/_FormMixin",
	"riasw/sys/_ModuleMixin"
], function(rias, CaptionPanel, _FormMixin, _ModuleMixin){

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Scene.css"
	//]);

	var riaswType = "riasw.sys.Scene";
	var Widget = rias.declare(riaswType, [CaptionPanel, _FormMixin, _ModuleMixin],{

		baseClass: "riaswScene",

		//checkModifiedWhenHide: false,

		animate: false,
		moduleMeta: "",
		dataServerAddr: "",

		heartbeatUrl: "",
		heartbeat: 0,///minutes
		idleCount: 3,///3次心跳无操作，则 idle，应该 > 1

		_setDataServerAddrAttr: function(value){
			value = value + "";
			if(value && !rias.endWith(value, "/")){
				value = value + "/";
			}
			this._set("dataServerAddr", value);
		},

		constructor: function(params){
		},
		postMixInProperties: function(){
			this.inherited(arguments);
			this.oper = this.getNullOper();
			this.launchedModules = [];
		},
		buildRendering: function(){
			this.inherited(arguments);
			this.containerNode = rias.dom.create("div");
			this.domNode.appendChild(this.containerNode);
		},
		//postCreate: function(){
		//	var self = this;
		//	self.inherited(arguments);
		//},
		_onDestroy: function(){
			this.stopHeartbeat();
			this.inherited(arguments);
		},

		activating: function(){
			this._idleCount = 0;
			//console.debug("Scene activating.");
		},
		onSceneIdle: function(){
			console.debug("Scene idle - " + new Date() + " - scene: " + this.id);
			if(this.oper.logged){
				///this.logout();
				this.doLogin({
					dialogType: "modal"
				});
			}
		},
		postHeartbeat: function(){
			/// postHeartbeat 需要重载具体实现
		},
		startHeartbeat: function(){
			var self = this;
			self._totalHeartbeat = self._idleCount = 0;
			if(!(this.heartbeat > 1)){
				console.error("startHeartbeat - The heartbeat must > 1, current is " + self.heartbeat);
				return;
			}
			self._hIdleCount = self.on("mousedown,keydown", function(){
				self.activating();
			});
			self._hHeartbeat = setInterval(function(){
				self._totalHeartbeat++;
				self._idleCount++;
				if(self._idleCount >= self.idleCount){
					self.onSceneIdle();
				}else{
					console.debug("Scene heartbeat - _idleCount: " + self._idleCount + ", _totalHeartbeat: " + self._totalHeartbeat + " - scene: " + this.id);
					if(self.oper.logged && self.heartbeatUrl){
						self.postHeartbeat();
					}
				}
			}, self.heartbeat * 60000);
			console.debug("startHeartbeat - " + self.heartbeat + " minutes, " + self.heartbeatUrl + " - scene: " + this.id);
		},
		stopHeartbeat: function(){
			if(this._hHeartbeat){
				clearInterval(this._hHeartbeat);
				delete this._hHeartbeat;
			}
			if(this._hIdleCount){
				this._hIdleCount.remove();
				delete this._hIdleCount;
			}
			console.debug("stopHeartbeat - scene: " + this.id);
		},
		_setHeartbeatAttr: function(value){
			if(!(value >= 0)){
				value = 0;
			}
			this._set("heartbeat", value);
			if(this.heartbeat > 0){
				this.startHeartbeat();
			}else{
				this.stopHeartbeat();
			}
		},

		initOk: false,
		init: function(){
			var m = this;
			this.initOk = true;
			m.subscribe("/rias/xhr/timeoutLimit", function(msg){
				m.oper.logged = false;
				///rias.hint(msg);///只需要在 desktop 中 hint
			});
			m.subscribe("/rias/xhr/401", function(params){
				if(rias.xhr.isOrigin(params.url)){
					m.doLogin();
				}
			});
			return m.login();
		},
		//_afterParse: function(){
		//	var self = this;
		//	self.inherited(arguments);
		//},
		_afterLoadedAll: function(loadOk){
			var m = this,
				args = arguments;
			if(!loadOk){
				return m.inherited(args);
			}else{
				return rias.when(m.init()).always(function(){
					return m.inherited(args);
				});
			}
		},

		getNullOper: function(){
			return {
				"logged": false,
				"code": "",
				"name": "",
				"petname": "",
				"dept": "",
				"rights": {}
			};
		},
		hasRight: function (rightCode){
			if(!this.oper.logged){
				return false;
			}
			rightCode = rias.trim(rightCode).toLowerCase();
			rightCode = this.oper.rights[rightCode];
			return rightCode == true;
		},

		"actions": function (){
			return {
				"login": "",
				"logout": ""
			};
		},
		"showLogInfo": function (){
		},
		"afterLogin": function (){
			this.showLogInfo();
		},
		"_afterLogin": function (){
			var m = this,
				a = [rias.hitch(m, m.afterLogin)];
			m._idleCount = 0;
			if(!m.oper.logged){
				return m._afterLogout();
			}else{
				//m.loadOperPersist();
				/// afterLogin 由 allInOrder 来执行
				rias.forEach(rias.concatUnique(m.getRiasrElements(), m.launchedModules), function(c){
					if(c && rias.isFunction(c.afterLogin)){
						a.push(rias.hitch(c, c.afterLogin));
					}
				});
				return rias.allInOrder(a, rias.defaultDeferredTimeout, function(){
					console.error("Scene._afterLogin timout.", arguments);
				});
			}
		},
		"login": function (args){
			var m = this;
			return rias.when(this.oper = rias.mixinDeep({}, this.desktop.oper)).then(function(){
				return m._afterLogin();
			});
		},
		"doLogin": function (args){
			return this.desktop.doLogin.apply(this.desktop, arguments || []);
		},
		"afterLogout": function (){
			this.showLogInfo();
		},
		"_afterLogout": function (){
			var m = this,
				a = [];
			/// afterLogout 由 allInOrder 来执行
			rias.forEach(rias.concatUnique(m.getRiasrElements(), m.launchedModules), function(c){
				if(c && rias.isFunction(c.afterLogout)){
					a.push(rias.hitch(c, c.afterLogout));
				}
			});
			a.push(rias.hitch(m, m.afterLogout));
			var d = rias.allInOrder(a, rias.defaultDeferredTimeout, function(){
				console.error("Scene._afterLogout timout.", arguments);
			});
			for(var i = m.launchedModules.length - 1; i >= 0; i--){
				if(m.launchedModules[i] && m.launchedModules[i].closable){
					rias.destroy(m.launchedModules[i]);///已经 after destroy，无需 removeItems
				}
			}
			return d;
		},
		"logout": function (args){
			args = args || {};
			var m = this,
				d,
				url;
			function _after(){
				m.oper = m.getNullOper();
				return m._afterLogout();
			}
			//return rias.when(m.saveOperPersist()).always(function(){
				if(rias.isFunction(m.actions)){
					url = m.actions().logout;
				}else if(rias.isObject(m.actions)){
					url = m.actions.logout;
				}
				if(url){
					d = rias.xhr.post({
						url: url,
						handleAs: "json",
						timeout: m.defaultTimeout
					}, args.data).then(function(result){
							return _after();
						}, function(result){
							return _after();
						});
				}else{
					d = _after();
				}
				console.info("Scene logout.");
				return d;
			//});
		},
		"doLogout": function (args){
			args = args || {};
			var m = this;
			m._doingLogout = rias.choose({
				_riaswIdInModule: "winLogout",
				iconClass: "loginIcon",
				//id: "winLogout",
				caption: rias.i18n.desktop.logout,
				//closeDelay: 0,
				content: "是否退出?",
				//resizable: false,
				//maxable: false,
				//minable: false,
				//state: 0,
				//style: {
				//	"font-size": "15px"
				//},
				onSubmit: function(){///因为 服务端 有可能处理 logout 出错，这里用 onSubmit 以忽略服务端
					m.logout();
					m._doingLogout = undefined;
				}
			}, m, args.around || args.popupArgs && args.popupArgs.around);
			return m._doingLogout;
		},

		// ============================ //

		toggleContextOption: function(args, around){
			//return;
		},
		launch: function(args){//moduleMeta, _riaswIdInModule, caption, moduleParams, reCreate, id
			/// 注意：launch 中需要 sceneWorkarea，应该在实现中 创建
			var m = this;

			function _do(arg){
				return rias.when(m.oper.logged || arg.requireLogged != true || m.doLogin({
						dialogType: "modal"
					})).then(function(result){
					return m.desktop._launch(arg, m, m.sceneWorkarea).then(function(child){
						m.launchedModules.push(child);
						var _h = rias.after(child, "_afterDestroyed", function(){
							_h.remove();
							rias.removeItems(m.launchedModules, child);
						}, true);
						return child;
					});
				});
			}

			if(!rias.isArray(args)){
				args = [args];
			}
			return rias.allInOrder(args, rias.debugDeferredTimeout ? rias.defaultDeferredTimeout : 0, function(arr){
				this.cancel();
			}, function(item){
				return _do(item);
			});
		}
	});

	/*Widget._riasdMeta = {
		visual: true
	};*/

	return Widget;

});