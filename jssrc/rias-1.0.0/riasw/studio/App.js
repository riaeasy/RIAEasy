
define([
	"rias",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/form/_FormMixin",
	"rias/riasw/studio/_ModuleMixin",
	"rias/riasw/studio/Loading"
], function(rias, _PanelBase, _FormMixin, _ModuleMixin, Loading){

	//rias.theme.loadThemeCss([
	//	"riasw/studio/App.css"
	//]);

	var _riasWidgets = {};
	var riaswType = "rias.riasw.studio.App";
	var Widget = rias.declare(riaswType, [_PanelBase, _FormMixin, _ModuleMixin],{

		_focusStack: true,

		appName: "riaeasy",

		baseClass: "webApp",
		//isLayoutContainer: true,

		animate: false,
		//moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
		moduleMeta: "",
		dataServerAddr: "",
		heartbeat: 0,///minutes
		heartbeatUrl: "",
		idleCount: 2,///2次心跳无操作，则 idle

		_setDataServerAddrAttr: function(value){
			value = value + "";
			if(value && !rias.endWith(value, "/")){
				value = value + "/";
			}
			this._set("dataServerAddr", value);
		},

		constructor: function(params){
			this.__riasrWidgetsCount = 0;
			this._riasWidgets = _riasWidgets;

			this.riasdFileSelector = undefined;
			this.mainModule = undefined;
			//this.mainMenu = undefined;
			this.mainDock = undefined;
			//this.appDock = undefined;
			//this.mainWorkbench = undefined;
			//this.mainWorkarea = undefined;
			//this.datas = undefined;
			this.launchedModules = [];
		},
		postMixInProperties: function(){
			this.oper = this.getNullOper();
			this.inherited(arguments);
			//this.id = 'rias.webApp';///建议不设 id，即 rias.webApp 不绑定 domNode，而直接是 riasWidget。
			//this.loadMetaOnStartup = false;
		},
		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.webAppNode = this.domNode;
			//rias.dom.addClass(this.domNode, "webApp");
			if(rias.hostNative){
				rias.dom.addClass(this.domNode, "mobileBody");
			}
		},
		postCreate: function(){
			var self = this;
			self._onIsNative(self.isNative);
			//self._onLocation(self.ownerDocument.location || document.location);
			//self._onIsLocal(self.location.protocol == "file:");
			self.inherited(arguments);
			self.own(self._onBeforeUnload = rias.addOnUnload(function(e){
				e = e || window.event;
				var modi = self.get("modified");
				if(modi){
					modi = "有数据已修改，尚未保存.\n是否放弃修改，退出并关闭?";
				}else{
					modi = "";
				}
				// For IE and Firefox prior to version 4
				if(e && modi) {
					e.returnValue = modi;
				}
				return modi;
			}));
		},
		destroy: function(){
			this.stopHeartbeat();
			this.inherited(false);
		},
		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.own(rias.subscribe("_riaswPostCreate", function(params){
				if(params.widget){
					self.addWidget(params.widget);
				}
			//}), rias.subscribe("_riaswOrphan", function(params){
			//	if(params.widget){
			//		self.removeWidget(params.widget);
			//	}
			}), rias.subscribe("_riaswDestroy", function(params){
				if(params.widget){
					self.destroyWidget(params.widget);
				}
			}));

			self.inherited(arguments);
		},
		initRiasd: function(){
			var m = this;
			if(m.riasdFileSelector){
				rias.destroy(m.riasdFileSelector);
				delete m.riasdFileSelector;
			}
			return rias.when(rias.initRiasd()).always(function(result){
				if(result != false){
					if(!m.riasdFileSelector){
						m.launchRiasdFileSelector({///这个需要 rias.webApp
							"_riaswIdOfModule": "riasdFileSelector",
							"initDisplayState": "hidden",
							"initPlaceToArgs": {
								around: "_riasrDockNode",
								positions: ["below-centered"]
							},
							reCreate: false,
							autoFocus: false,
							closable: false,
							"dockTo": m.mainDock,
							//dialogType: "top",
							//toggleable: false,
							toggleOnBlur: true,
							//closeDisplayState: "hidden",
							//dockNodeArgs: {
							//	toggleOnEnter: true
							//},
							style: {
								width: "30em",
								height: rias.toInt(m.domNode.clientHeight * 0.7, 600) + "px",//"80em"//rias.toInt(m.domNode.clientHeight * 0.7) + "px"
								"padding": "0px"
							}
						});
					}
				}
				console.info("App initRiasd.");
				return result;
			});
		},

		_onIsNative: function(value, oldValue){
			this.isNative = !!value;
		},
		//_onLocation: function(value, oldValue){
		//	this.location = value + "";
		//},
		//_onIsLocal: function(value, oldValue){
		//	this.isLocal = !!value;
		//},

		doing: function(token){
			rias.publish("/rias/webApp/doing", [token]);
		},
		done: function(token){
			rias.publish("/rias/webApp/done", [token]);
		},

		_loading: function(){
			var self = this;
			///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
			//ready(100, function())是dojo.parser.parse().
			//ready(1000, function())是缺省.
			//ready(500, function())是 App.
			rias.ready(500, function(){
				if(!self.isDestroyed(true)){
					//self.defer(function(){
						self._loadModuleMeta().then(function(result){
							if(result && result.errors){
								rias.error(result.errors, null, self);
							}
							return result;
						});
					//}, 30);
				}
			});
		},

		_setDefaultTimeoutAttr: function(timeout){
			rias.isNumber(timeout) && (timeout > 999) && (rias.xhr.defaultTimeout = timeout);
			this._set("defaultTimeout", rias.xhr.defaultTimeout);
		},
		_setCurrentThemeAttr: function(theme){
			if(rias.theme.currentTheme){
				rias.dom.removeClass(this.domNode, rias.theme.currentTheme);
			}
			rias.theme.currentTheme = theme + "";
			rias.dom.addClass(this.domNode, rias.theme.currentTheme);
		},
		_getCurrentThemeAttr: function(){
			return rias.theme.currentTheme;
		},

		addWidget: function(widget){
			if(!widget.id){
				widget.id = widget._riasrModule && widget._riaswIdOfModule ? (widget._riasrModule.id + "_" + widget._riaswIdOfModule) :
					rias.getUniqueId(this.id + "_" + rias._getUniqueCat(widget), this);
			}
			if(this._riasWidgets[widget.id]){
				throw new Error("Tried to register widget with id['" + widget.id + "'],\n but that id is already registered.");
			}
			this._riasWidgets[widget.id] = widget;
			this.__riasrWidgetsCount++;
		},
		//removeWidget: function(/*String|dijit*/id){
		//	if(!rias.isString(id)){
		//		if(!(id = id.id)){
		//			throw new Error("rias.riasw.studio.App.removeWidget: invalid id: " + id);
		//		}
		//	}
		//	if(this._riasWidgets[id]){
		//		delete this._riasWidgets[id];
		//		this.__riasrWidgetsCount--;
		//	}
		//},
		destroyWidget: function(/*String|dijit*/id){
			if(!rias.isString(id)){
				if(!(id = id.id)){
					throw new Error("rias.riasw.studio.App.destroyWidget: invalid id: " + id);
				}
			}
			if(this._riasWidgets[id]){
				///需要检查用什么方法释放
				rias.destroy(this._riasWidgets[id]);
				delete this._riasWidgets[id];
				this.__riasrWidgetsCount--;
			}
		},
		/*removeWidgets: function(id){
			if(rias.isString(id)){
				id = [id];
			}else if(id && rias.isString(id.id)){
				id = [id.id];
			}else if(!rias.isArray(id)){
				id = [];
			}
			var i = 0;
			for(; i < id.length - 1; i++){
				if(this._riasWidgets[id[i]]){
					delete this._riasWidgets[id[i]];
					this.__riasrWidgetsCount--;
				}
			}
		},*/
		/*destroyModuleChildren: function(module){
			var id;
			for(id in this._riasWidgets){
				if(this._riasWidgets.hasOwnProperty(id)){
					if(this._riasWidgets[id]._riasrModule == module){
						this.destroyWidget(id);
					}
				}
			}
		},*/
		byId: function(/*String|Widget*/ id){
			return typeof id == "string" ? this._riasWidgets[id] : undefined;
		},
		//by: function(/*String|DOMNode|Dijit|riasWidget*/any){
		//	return typeof any == "string" ? this._riasWidgets[any] : any.id ? this._riasWidgets[any.id] : undefined;
		//},

		_internalResize: function(){
			rias.dom.setMarginBox(this.domNode, rias.dom.getContentMargin(this.getParentNode()));

			this.layout();
		},
		/*resize: function(){
			//console.warn("resize(): " + this.id);
			if(!this._canResize()){
				return;
			}
			this.inherited(arguments);
		},*/

		// =========================== //

		activating: function(){
			this._idleCount = 0;
			//console.debug("App activating.");
		},
		onAppIdle: function(){
			console.debug("App idle - " + this._totalHeartbeat);
			if(this.oper.logged){
				///this.logout();
				this.doLogin();
			}
		},
		postHeartbeat: function(){
			/// postHeartbeat 需要重载具体实现
		},
		startHeartbeat: function(){
			var self = this;
			self._totalHeartbeat = self._idleCount = 0;
			if(!(this.heartbeat > 0)){
				console.error("startHeartbeat - The heartbeat must > 0, current is " + self.heartbeat);
				return;
			}
			self._hIdleCount = self.on("mousedown,keydown", function(){
				self.activating();
			});
			self._hHeartbeat = setInterval(function(){
				self._totalHeartbeat++;
				self._idleCount++;
				if(self._idleCount > self.idleCount){
					self.onAppIdle();
				}else{
					console.debug("App heartbeat - _idleCount: " + self._idleCount + ", _totalHeartbeat: " + self._totalHeartbeat);
					if(self.oper.logged && self.heartbeatUrl){
						self.postHeartbeat();
					}
				}
			}, self.heartbeat * 60000);
			console.debug("startHeartbeat - " + self.heartbeat + " minutes, " + self.heartbeatUrl);
		},
		stopHeartbeat: function(){
			if(this._hIdleCount){
				this._hIdleCount.remove();
				delete this._hIdleCount;
			}
			if(this._hHeartbeat){
				clearInterval(this._hHeartbeat);
				delete this._hHeartbeat;
			}
			console.debug("stopHeartbeat - ");
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

		_afterBind: function(){
			var self = this;
			rias.dom.doc.title = self.appTitle;
			//if(!rias.hostNative){
			self.own(self._appLoading = rias.createRiasw(Loading, {
				ownerRiasw: self,
				_riaswIdOfModule: "loading"
			}));
			//self._appLoading.set("content", rias.i18n.message.loading);
			self._appLoading.placeAt(self);
			//}
			self.inherited(arguments);
		},
		_afterLoadedAll: function(loaded){
			var m = this;
			this.inherited(arguments);
			function pro(){
				rias.bind([{
					"_riaswType": "rias.riasw.studio.Module",
					"_riaswIdOfModule": "mainModule",
					"region": "center",
					"moduleMeta": {
						"$refScript": "return rias.webApp.mainModuleMeta;"
					},
					"style": {
						"padding": "0px"
					}
				}], this).then(function(result){
						m.mainModule.whenLoadedAll(function(){
							if(m.oper.logged){
								m.initRiasd();
								if(rias.isFunction(m.mainModule.afterLogin)){
									m.mainModule.afterLogin();
								}
							}else{
								if(rias.isFunction(m.mainModule.afterLogout)){
									m.mainModule.afterLogout();
								}
							}
						});
					});
			}
			if(loaded){
				m.login().then(pro);
			}else{
				m.logout(pro);
			}
			/*rias.bind([{
				"_riaswType": "rias.riasw.studio.Module",
				"_riaswIdOfModule": "mainModule",
				"region": "center",
				"moduleMeta": {
					"$refScript": "return rias.webApp.mainModuleMeta;"
				},
				"style": {
					"padding": "0px"
				}
			}], this).then(function(result){
					m.mainModule.whenLoadedAll(function(){
						if(loaded){
							m.login();
						}else{
							m.logout();
						}
					});
				});*/
		},
		_addLaunchedModule: function(child){
			this.launchedModules.push(child);
		},
		_removeLaunchedModules: function(child){
			rias.removeItems(this.launchedModules, child);
		},

		getNullOper: function(){
			return {
				"logged": false,
				"code": "",
				"name": "",
				"petname": "",
				"dept": "",
				"rights": {},
				"persist": {}
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
		"afterLogin": function (){
		},
		"_afterLogin": function (){
			var m = this,
				a = [rias.hitch(m, m.afterLogin)];
			m._idleCount = 0;
			if(!m.oper.logged){
				return m._afterLogout();
			}else{
				if(m.mainModule){
					m.initRiasd();
				}
				rias.forEach(rias.concatUnique([], m.getRiasrElements(), m.launchedModules), function(c){
					if(c && rias.isFunction(c.afterLogin)){
						a.push(rias.hitch(c, c.afterLogin));
					}
				});
				return rias.allByOrder(a, rias.defaultDeferredTimeout << 1, function(){
					console.error("App _afterLogin timout.", arguments);
				});
			}
		},
		"login": function (args){
			/// login 需要重载具体实现
			return this._afterLogin();
		},
		"doLogin": function (args){
			/// doLogin 需要重载具体实现
			return this.login();
		},
		"afterLogout": function (){
		},
		"_afterLogout": function (){
			var m = this,
				a = [];
			if(m.riasdFileSelector){
				rias.destroy(m.riasdFileSelector);
				delete m.riasdFileSelector;
			}
			rias.forEach(rias.concatUnique([], m.getRiasrElements(), m.launchedModules), function(c){
				if(c && rias.isFunction(c.afterLogout)){
					a.push(rias.hitch(c, c.afterLogout));
				}
			});
			a.push(rias.hitch(m, m.afterLogout));
			var d = rias.allByOrder(a, rias.defaultDeferredTimeout << 1, function(){
				console.error("App _afterLogout timout.", arguments);
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
			console.info("App logout.");
			return d;
		},
		"doLogout": function (around){
			var m = this;
			m._doingLogout = rias.choose({
				ownerRiasw: m,
				_riaswIdOfModule: "winLogout",
				iconClass: "loginIcon",
				around: around,
				dialogType: "modal",
				//id: "winLogout",
				caption: rias.i18n.webApp.logout,
				//closeDelay: 0,
				content: "是否退出?",
				//resizable: false,
				//maxable: false,
				//minable: false,
				//state: 0,
				//cookieName: "",
				//persist: false,
				onSubmit: function(){///因为 服务端 有可能处理 logout 出错，这里用 onSubmit 以忽略服务端
					m.logout();
					m._doingLogout = undefined;
				}
			});
			return m._doingLogout;
		},

		// ============================ //

		launch: function(args){//moduleMeta, _riaswIdOfModule, caption, moduleParams, reCreate, id
			var m = this,
				launchModule, mm = m.mainModule,
				d;
			if(rias.isRiaswModule(mm) && rias.isFunction(mm.launchModule)){
				launchModule = mm.launchModule;
			}
			if(!launchModule){
				d = rias.newDeferred();
				d.reject();
				rias.error("缺少主模块或缺少主模块中的 launchModule 方法。", null, m);
				return d.promise;
			}
			if(rias.isArray(args)){
				var ds = [];
				rias.forEach(args, function(arg){
					ds.push(m.launch(arg));
				});
				return rias.all(ds, rias.defaultDeferredTimeout << 1, function(arr, _p){
					this.cancel();
				}, args);
			}else{
				d = rias.newDeferred();
				rias.when(m.oper.logged || args.requireLogged != true || m.doLogin(), function(result){
					launchModule.apply(mm, [args]).then(function(child){
						m.launchedModules.push(child);
						m.own(rias.before(child, "destroy", function(){
							rias.removeItems(m.launchedModules, this);
						}));
						d.resolve(rias.toArray(arguments));
					}, function(){
						d.reject(rias.toArray(arguments));
					});
				}, function(e){
					d.reject(e);
				});
				return d.promise;
			}
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswModuleIcon",
		iconClass16: "riaswModuleIcon16",
		defaultParams: {
			//content: "<div></div>",
			//doLayout: true
			//"class": "webApp"
		}
	};

	return Widget;

});