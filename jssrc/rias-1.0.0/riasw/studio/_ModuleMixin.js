
define([
	"rias"
], function(rias){

	var _exFuncName = [
		"constructor"
	];

	var riaswType = "rias.riasw.studio._ModuleMixin";
	var Widget = rias.declare(riaswType, null,{

		moduleParams: {},

		///moduleMeta: "", //moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
		content: "",

		//_loadMetaDeferred: null,
		//_loadAllDeferred: null,
		_loadingMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingIcon'></span>${0}</span>",
		_errorMessage: "<span class='riaswModuleLoading'><span class='dijitInline riaswModuleLoadingError'></span>${0}</span>",
		loadingMessage: rias.i18n.message.loading,
		errorMessage: rias.i18n.message.loadError,
		isLoading: false,
		isLoaded: false,
		loadError: false,
		loadMetaOnStartup: true,
		loadAllDeferredTimeout: 30,//seconds, 0 is no

		// extractContent: Boolean
		//		Extract visible content from inside of `<body> .... </body>`.
		//		I.e., strip `<html>` and `<head>` (and it's contents) from the href
		extractContent: false,
		// parseOnLoad: Boolean
		//		Parse content and create the widgets, if any.
		parseOnLoad: true,
		// parserScope: String
		//		Flag passed to parser.  Root for attribute names to search for.   If scopeName is dojo,
		//		will search for data-dojo-type (or dojoType).  For backwards compatibility
		//		reasons defaults to dojo._scopeName (which is "dojo" except when
		//		multi-version support is used, when it will be something like dojo16, dojo20, etc.)
		parserScope: dojo._scopeName,
		// Flag to parser that I'll parse my contents, so it shouldn't.
		stopParser: true,

		__inheritedMeta: function(args, a, f){
			var name, caller, meta;

			if(typeof args == "string"){
				name = args;
				args = a;
				a = f;
			}
			f = 0;
			caller = args.callee;
			name = name || caller.nom;
			if(!name){
				throw new Error(this.id + ".__inheritedMeta error: " + "can't deduce a name to call inheritedMeta() - " + name);
			}
			meta = this._riaswModuleMeta;
			if(!rias.contains(_exFuncName, name)){
				if(meta && meta.hasOwnProperty(name)){
					if(rias.isFunction(meta[name])){
						f = meta[name];
					}
				}
			}
			if(f){
				return a === true ? f : f.apply(this, a || args);
			}
		},
		getInheritedMeta: function(name, args){
			if(typeof name == "string"){
				return this.__inheritedMeta(name, args, true);
			}
			return this.__inheritedMeta(name, true);
		},
		inheritedMeta: function(args, a1, a2){
			var f = this.getInheritedMeta(args, a1);
			if(f){
				return f.apply(this, a2 || a1 || args);
			}
		},

		postMixInProperties: function(){
			this.loadingMessage = rias.substitute(this._loadingMessage, [this.loadingMessage]);
			this.errorMessage = rias.substitute(this._errorMessage, [this.errorMessage]);
			this._loadingDeferreds = [];
			this.inherited(arguments);
		},
		buildRendering: function(){
			this.inherited(arguments);
		},
		postCreate: function(){
			this.inherited(arguments);
			///this._onContent(this.content);///无需初始化
			this._initAttr([{
				name: "moduleMeta",
				initialize: false
			},{
				name: "moduleResult",
				initialize: false
			}]);
		},
		_beforeDestroy: function(){
			if (rias.isFunction(this.beforeDestroy)){
				this.beforeDestroy();
			}
		},
		_destroyModuleChildren: function(){
			if(this._contentSetter){
				this._contentSetter.empty(false);
			}
			///this._riasrElements 可能包含非自身 bind 的 widget
			//rias.forEach(this._riasrElements, function(el){
			//	rias.destroy(el);
			//});
			if(this._riasrModuleChildren){
				rias.forEach(this._riasrModuleChildren, function(el){
					rias.destroy(el);
				});
			}
			this._riasrModuleChildren = [];
		},
		destroyDescendants: function(/*Boolean*/ preserveDom){
			/// onUnload 可以用 _beforeDestroy 代替。
			//if(this.isLoaded){
			//	this._onUnload();
			//}
			this._destroyModuleChildren();
			this.inherited(arguments);
			if(!preserveDom && this.containerNode){
				rias.dom.empty(this.containerNode);/// 兼容 ie，ie 不能对 null 用 in
			}
		},
		destroy: function(){
			/*if(this._loadMetaDeferred){
				this._loadMetaDeferred.cancel(this.id + " destroy(), _loadMetaDeferred cancel.");
			}
			if(this._loadAllDeferred){
				this._loadAllDeferred.cancel(this.id + " destroy(), _loadAllDeferred cancel.");
			}*/
			try{
				this._cancelLoad();
				this._beforeDestroy();
			}catch(e){
				console.error(rias.captureStackTrace(e));
			}
			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){
				return;
			}
			if(!this.isLoading && !this.isLoaded && this.loadMetaOnStartup){
				this._load();
			}else{
				this.defer(function(){
					if(!this.isLoading && !this.isLoaded){
						this._load();
					}
				}, 110);
			}
			this.inherited(arguments);
		},
		_startChildren: function(){
			if(this._started){
				rias.forEach(this.getChildren(), function(obj){
					if(!obj._started && !obj.isDestroyed(true) && rias.isFunction(obj.startup)){
						obj.startup();
						obj._started = true;
					}
				});
				if(this._contentSetter){
					rias.forEach(this._contentSetter.parseResults, function(obj){
						if(!obj._started && !obj.isDestroyed(true) && rias.isFunction(obj.startup)){
							obj.startup();
							obj._started = true;
						}
					}, this);
				}
			}
		},

		onModuleResult: function(value, oldValue){
			return value;
		},
		_onModuleResult: function(value, oldValue){
			this.moduleResult = this.onModuleResult(value, oldValue);
			return value;
		},

		_initSize: function(){
			/// _loadModuleMeta 时设置 containerNode，这里是设置 domNode，params 是 create 时的 params
		},
		_show: function(newState){
			var self = this,
				args = arguments,
				d = rias.newDeferred();
			function _do(){
				rias.when(self.inherited(args), function(){
					self._loadAllDeferred.promise.always(function(){
						d.resolve(self.loadError);
					});
				});
			}
			if(!self.isLoading && !self.isLoaded){
				self._load();
			}
			if(self.isLoading && self._loadMetaDeferred){
				self._loadMetaDeferred.promise.always(function(){
					_do();
				});
			}else{
				//self._startChildren();
				_do();
			}
			d.then(function(){
				if(self._needLoadedAllAndShown){// && self._wasResized){
					try{
						self._afterLoadedAllAndShown();
						self._needLoadedAllAndShown = undefined;
					}catch(e){
						console.error("after _afterLoadedAllAndShown execute error:", e, self, rias.captureStackTrace(e));
						rias.error("after _afterLoadedAllAndShown execute error:\n" + e, null, self);
					}

				}
			});
			return d.promise;
		},

		/*onUnload: function(){
		},
		_onUnload: function(){
			this.isLoaded = false;
			try{
				this.onUnload();
			}catch(e){
				console.error('Error ' + this.widgetId + ' running custom onUnload code: ' + e.message);
			}
		},*/
		_startLoading: function(){

		},
		_endLoading: function(){

		},
		_setContent: function(/*String|DocumentFragment*/ content){
			///该方法不继承。继承不好处理。
			var self = this;

			///this._stopPlay();/// _stopPlay 会导致显示不正确。
			self.destroyDescendants();

			//if(rias.isDijit(content) || rias.isDomNode(content)){
			//	self.parseOnLoad = false;
			//}else{
			//	self.parseOnLoad = true;
			//	//content = rias.toHTMLStr(content);
			//}
			var setterParams = rias.mixin({
				cleanContent: self.cleanContent,
				extractContent: self.extractContent,
				parseContent: !content.domNode && self.parseOnLoad,
				parserScope: self.parserScope,
				startup: false,/// 用 _startChildren 手动 startup。
				dir: self.dir,
				lang: self.lang,
				textDir: self.textDir
			}, self._contentSetterParams || {});

			if(!self._contentSetter || !self._contentSetter instanceof rias.html._ContentSetter){
				self._contentSetter = new rias.html._ContentSetter({
					node: self.containerNode
				});
			}
			return self._contentSetter.setContent((rias.isObject(content) && content.domNode) ? content.domNode : content, setterParams);
		},

		_onModuleMeta: function(/*String|Object*/meta){
			///TODO:zensst.因为无法彻底还原到初始状态，故不能二次赋值 moduleMeta。是否可以尝试清除 OwnerProperty？
			if(this.moduleMeta){
				throw "The moduleMeta['" + this.id + "'] already exists.";
			}
			//this.content = "";
			//this.href = "";
			this.moduleMeta = meta;
			return this._load();
		},
		_checkLoadDeferreds: function(){

		},
		_cancelLoad: function(){
			if(this._whenLoadedDeferred){
				this._whenLoadedDeferred.cancel(this.id + "._whenLoadedDeferred _cancelLoad.");
				this._whenLoadedDeferred = undefined;
			}
			if(this._contentSetter){
				//this._contentSetter.empty(false);
				if(this._contentSetter.parseDeferred){
					this._contentSetter.parseDeferred.cancel(this.id + "._contentSetter _cancelLoad.");
					delete this._contentSetter.parseDeferred;
				}
			}
			if(this._loadMetaDeferred){
				this._loadMetaDeferred.cancel(this.id + "._loadMetaDeferred _cancelLoad.");
				this._loadMetaDeferred = undefined;
			}
			if(this._riasrModule){
				rias.removeItems(this._riasrModule._loadingDeferreds, this._loadMetaDeferred);
			}
			///使用后进先出，并逐一删除。
			for(var i = this._loadingDeferreds.length - 1; i >= 0; i--){
				this._loadingDeferreds.pop().cancel();
			}
			if(this._loadAllDeferred){
				this._loadAllDeferred.cancel(this.id + "._loadAllDeferred _cancelLoad.");
				this._loadAllDeferred = undefined;
			}
		},
		beforeLoad: function(){
			return true;
		},
		_beforeLoad: function(){
			var self = this,
				wd = self._whenLoadedDeferred;
			//if(self._loadAllDeferred){
			//	self._loadAllDeferred.cancel(self.id + " _beforeLoad() cancel.");
			//}
			self._cancelLoad();
			self.loadError = false;
			self.isLoading = true;
			self.isLoaded = false;
			self._loadMetaDeferred = rias.newDeferred(this.id + "._loadMetaDeferred", rias.defaultDeferredTimeout, function(){
				this.cancel();
			}, self);
			self._loadMetaDeferred.then(function(result){
				try{
					self.afterLoaded(result);
				}catch(e){
					console.error("afterLoaded execute error:", e, self, rias.captureStackTrace(e));
					rias.error("afterLoaded execute error:\n" + e, null, self);
				}
			}, function(result){
				self.loadError = true;
			});
			self._loadAllDeferred = rias.newDeferred(this.id + "._loadAllDeferred", rias.defaultDeferredTimeout << 1, function(){
				this.cancel();
			});
			self._loadAllDeferred.promise.always(function(result){
				try{
					self._afterLoadedAll(result);
				}catch(e){
					console.error("_afterLoadedAll execute error:", e, self, rias.captureStackTrace(e));
					rias.error("_afterLoadedAll execute error:\n" + e, null, self);
				}
				if(self.isShown(false)){// && self._wasResized){
					try{
						self._afterLoadedAllAndShown();
					}catch(e){
						console.error("_afterLoadedAllAndShown execute error:", e, self, rias.captureStackTrace(e));
						rias.error("_afterLoadedAllAndShown execute error:\n" + e, null, self);
					}
					//if(self.domNode.style.height == "" || self.domNode.style.width == ""){
					//	///只要有一方向是 自适应，即要 _parentResize
					//	self._parentResize();/// layoutChildren 之后，TablePanel 的尺寸一般会改变，需要 _parentResize
					//}
					///速度优化，可以屏蔽
					//if(self.region){
					//	self._parentResize();/// layoutChildren 之后，TablePanel 的尺寸一般会改变，需要 _parentResize
					//}else{
					//	self.resize();
					//}
				}else{
					self._needLoadedAllAndShown = true;
				}
				if(wd){
					if(wd._needWhenDeferredResolve){
						wd.resolve(!self.loadError);
					}
				}
			});
			if(self._riasrModule){
				self._riasrModule._loadingDeferreds.push(self._loadMetaDeferred);
			}
			//rias.dom.removeClass(self.containerNode, "riaswDialogPanelContentMessage");
			if(self.beforeLoad() != false){
				self._needLoad = undefined;
			}else{
				self._needLoad = true;
			}
			return self._loadAllDeferred.promise;
		},
		afterLoaded: function(result){
		},
		_afterLoaded: function(result){
			var self = this;
			self._startChildren();

			function _af(){
				self._loadMetaDeferred.resolve(result);
				rias.all(self._loadingDeferreds, rias.defaultDeferredTimeout << 1, function(arr, _p){
					this.cancel();
				}, self).then(function(_result){
					//self.loadError = false;
					return _result;
				}, function(err){
					self.loadError = true;
					return err;
				}).always(function(_result){
						self.isLoaded = true;
						self.isLoading = false;
						self._loadingDeferreds.length = 0;
						self._loadAllDeferred.resolve(self.loadError ? _result : result);///注意 results 和 result 的区别
					});
			}
			try{
				if(self._loadMetaDeferred){
					if(self._contentSetter && self._contentSetter.parseDeferred){
						self._contentSetter.parseDeferred.then(function(){
							_af();
						});
					}else{
						_af();
					}
				}else{
					console.debug(self.id + " has no _loadMetaDeferred.");
				}
			}catch(e){
				console.error('Error ' + self.widgetId + ' running custom onLoaded code: ' + e.message);
			}

			if(result && result.errors){
				rias.error(result.errors, null, self);
			}
		},
		afterLoadedAll: function(result){
		},
		_afterLoadedAll: function(result){
			this.afterLoadedAll();
		},
		afterLoadedAllAndShown: function(){
		},
		_afterLoadedAllAndShown: function(){
			this.afterLoadedAllAndShown();
		},
		refresh: function(){
			return this._load();
		},
		_loading: function(){
			var self = this;
			///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
			//ready(100, function())是dojo.parser.parse().
			//ready(1000, function())是缺省.
			rias.ready(1000, function(){
				if(!self.isDestroyed(true)){
					//self.defer(function(){
						///需要等待 给 _started 赋值
						//self._setContent(self.loadingMessage).then(function(){
							self._loadModuleMeta();
						//});
					//}, 10);
				}
			});
		},
		_load: function(){
			var r = this._beforeLoad();
			this._loading();
			return r;
		},
		whenLoadedAll: function(callback){
			//只应该对本次 load 有效，即 new _loadAllDeferred 之后，不应该 always 之前的。
			var self = this,
				d = self._whenLoadedDeferred || (self._whenLoadedDeferred = rias.newDeferred(function(){
					self._whenLoadedDeferred = undefined;
				}));
			if(!self.isDestroyed(true)){
				if(!self._loadAllDeferred){
					d._needWhenDeferredResolve = true;
				}else{
					self._loadAllDeferred.promise.always(function(){
						d.resolve(!self.loadError);
					});
				}
				return d.promise.always(function(result){
					if(rias.isFunction(callback)){
						callback.apply(self, [!self.loadError]);
					}
					return result;
				});
			}
			return d.promise;
		},

		_beforeLoadMeta: function(){
			this._beforeUpdateSize(this.id + " - _beforeLoadMeta.");
			//在 _loadModuleMeta 之前，没有“继承”关系.
			if (rias.isFunction(this.beforeLoadMeta)){
				this.beforeLoadMeta();
			}
		},
		_afterLoadMeta: function(){
			if (rias.isFunction(this.afterLoadMeta)){
				this.afterLoadMeta();
			}
			this._afterUpdateSize(this.id + " - _afterLoadMeta.");
		},
		_beforeBind: function(){
			if (rias.isFunction(this.beforeBind)){
				this.beforeBind();
			}
		},
		_afterBind: function(/*{widgets: widgets, parent: parent, module: m}*/result){
			if (rias.isFunction(this.afterBind)){
				this.afterBind(result);
			}
		},
		_loadModuleMeta: function(){
			var self = this,
				errs = "";
			function _do(func, args){
				try{
					func.apply(self, rias.toArray(arguments, 1));
				}catch(e){
					console.error(e, self, rias.captureStackTrace(e));
					if(e instanceof Error){
						errs += e.message + "\n";
					}else{
						errs += e + "\n";
					}
				}
			}
			function _af(result){
				self._riasrModuleChildren.concat(result.widgets);
				_do(self._afterBind, result);
				self.defer(function(){///保证 _loadMetaDeferred 正确 fullFilled
					_do(self._afterLoaded, result);
				});
			}
			function _e(s, e){
				if(e instanceof Error){
					console.error(s, self, rias.captureStackTrace(e));
				}else{
					console.error(s, self);
				}
				rias.bind([{
						_riaswType: "rias.riasw.studio.DefaultError",
						errorMessage: s
					}], self).then(function(result){
						result.errors = s;
						_af(result);
					});
			}
			function _bind(p){
				//if(rias.isDebug){
				//	console.debug(self.id, self);
				//}
				var pn,
					_p = p;///此时，_p 为运行期 params。
				///处理设计值，替换设计值为运行值
				//p = rias.mixinDeep({}, self._riaswModuleMeta, p);///使用 _riaswModuleMeta._riaswChildren
				p = rias.mixinDeep({}, self._riaswModuleMeta);///此时，p 为设计值
				rias.decodeRiaswParams(self, p);
				/// p.style(_riaswModuleMeta.style) 是设置 containerNode 的（Module.containerNode = domNode）
				/// parames.style 是设置 domNode 的，在 create 中已经设置了，这里不能 mixin
				/// CaptionPanel/DialogPanel 等有 CaptionNode 存在，不应该设置 domNode.style，而应该设置 containerNode
				rias.dom.addClass(self.containerNode, p["class"]);
				rias.dom.setStyle(self.containerNode, p.style);
				rias.deleteDeep(p, _p);
				delete p.style;
				delete p["class"];
				///先混合 meta，避免执行 _setXXXAttr 出现错误。此时不会触发 _onXXX()。
				for(pn in _p){
					///需要重新 set 在 _riaswModuleMeta 中有 _setXXXAttr 的 params 值
					/// _p 是 parames，检测 p(self._riaswModuleMeta)，此时的 p 已经是 params 中未覆盖的 _setXXXAttr
					/// 此时，p 中可能没有 p[pn]，所以不能 p.hasOwnProperty(pn)
					if(p["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
						p[pn] = _p[pn];
					}
				}
				_p = rias.mixin({}, p);
				for(pn in _p){
					if(_p.hasOwnProperty(pn) && self["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
						delete _p[pn];
					}
				}
				rias.mixinDeep(self, _p);///mixinDeep 支持 safeMixin
				self._initSize();
				for(pn in p){
					//if(p.hasOwnProperty(pn) && rias.isFunction(self["_set" + rias.upperCaseFirst(pn) + "Attr"])){
					if(p.hasOwnProperty(pn) && self["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
						self.set(pn, p[pn]);
					}
				}

				////使用 self 而不是 _riaswModuleMeta 的 _riaswChildren 创建，保持 _riaswModuleMeta 不变。
				//self._setContent("");///需要先清空，再 load。
				self._destroyModuleChildren();
				_do(self._beforeBind, self);
				rias.bind(self._riaswChildren, self).then(function(result){
					_af(result);
				}, function(error){
					_e("loading Module error:\n" + error.message + "\n\n" + errs, error);
				});
			}
			function _pro(meta, mixinMeta){
				//使用副本，避免原始 meta 被修改.
				self._riaswModuleMeta = rias.mixinDeep({}, meta);
				if(self.moduleParams){
					rias.mixinDeep(self._riaswModuleMeta, self.moduleParams);
				}
				_do(self._afterLoadMeta);
				delete self._riaswModuleMeta._riaswType;/// _riaswType 已经是 self 明确了的，_riaswModuleMeta 不应该再指定。
				///delete self._riaswModuleMeta._riaswChildren;//保留，后面要使用 meta 的 _riaswChildren 创建
				delete self._riaswModuleMeta._riaswIdOfModule;/// _riaswType 已经是 self 明确了的，_riaswModuleMeta 不应该再指定。
				///delete self._riaswModuleMeta._riaswVersion;//可以保留
				rias._deleDP(self._riaswModuleMeta, true, false, false);//保留 _riaswChildren，后面要使用 meta 的 _riaswChildren 创建

				///为了实现自动布局，由 params 的 region 和 style 设置，params 不设置时，由 ModuleMeta.style 处理。
				// 都不设置时，再在？先删除 ModuleMeta.region，
				delete self._riaswModuleMeta.region;

				/*///loadMeta 时，self.params 中的值有可能已经改变，需要取当前值，用 rias.copy
				var p = rias.mixinDeep(rias.copy(rias.mixin({}, self.params), self), mixinMeta);*/
				///还是取 初始值 好些。
				var p = rias.mixinDeep({}, self.params, mixinMeta);
				delete p._riaswType;
				delete p.ownerRiasw;
				//delete p._riaswChildren;//在下面的 rias._deleDP 中删除，使用 meta 的 _riaswChildren 创建
				//delete p._riaswIdOfModule;//保留运行期的 _riaswIdOfModule
				delete p._riaswVersion;
				/*delete p._riasrOwner;
				delete p._riasrElements;
				delete p._riasrParent;
				delete p._riasrModule;
				delete p._riaspParent;
				delete p._riaspChildren;
				delete p._riasrWidget;*/
				///rias._deleDP(p, false, false, false);
				delete p.moduleMeta;///避免设计期循环，可以用 module.params 或者 module._riaswModuleMeta
				if(self._riaswModuleMeta.moduleMeta){///避免设计期循环
					if(rias.isDebug){
						console.debug(self.id + ": _riaswModuleMeta.moduleMeta = " + self._riaswModuleMeta.moduleMeta, self);
					}
					delete self._riaswModuleMeta.moduleMeta;
				}
				rias._deleDP(p, false, false, false);

				var r = self._riaswModuleMeta.requires,
					c = self._riaswModuleMeta.themeCss;
				r = rias.isString(r) ? [r] : rias.isArray(r) ? r : [];
				c = rias.isString(c) ? [c] : rias.isArray(c) ? c : [];
				if(c.length > 0){
					rias.theme.loadThemeCss(c, true);
				}
				try{
					if(r.length > 0){
						rias.require(r, function(){
							rias.hitch(self, _bind)(p);
						}, function(moduleId){
							_e("require module's requires error: " + r);
						});
					}else{
						rias.hitch(self, _bind)(p);
					}
				}catch(e){
					_e("require module's requires error: " + e.message, e);
				}
			}

			if(!self.moduleMeta){
				try{
					self.moduleMeta = {};
					_do(self._beforeLoadMeta);
					_do(_pro, self.moduleMeta);
				}catch(error){
					_e("_loadModuleMeta error: " + error.message, error);
				}
			}else{
				if(self.moduleMeta.$refObj){//
					self.moduleMeta = rias.getObject(self.moduleMeta.$refObj, 0, self) || rias.getObject(self.moduleMeta.$refObj) || rias.by(self.moduleMeta.$refObj);
				}else if(self.moduleMeta.$refScript){//
					try{
						self.moduleMeta = rias.$runByModule(self, self.moduleMeta.$refScript, self.id + "[moduleMeta]");
					}catch(e){
						self.moduleMeta = {};
					}
				}
			}
			if(rias.isObjectSimple(self.moduleMeta)){
				try{
					if(self.moduleMeta.moduleMeta){
						_e("Please rias.mixinDeep(moduleMeta, moduleMeta.moduleMeta).");
					}else{
						_do(self._beforeLoadMeta);
						_do(_pro, self.moduleMeta);
					}
				}catch(error){
					_e("_loadModuleMeta error: " + error.message, error);
				}
			}else if(rias.isString(self.moduleMeta)){
				try{
					//self.moduleMeta = self.moduleMeta.replace(/\.js$/g, "").replace(/\./g, "/") + ".js";
					rias.require([self.moduleMeta], function(meta){
						_do(self._beforeLoadMeta);
						if(rias.isObjectSimple(meta)){
							_do(_pro, meta);
						}else{
							_e("_loadModuleMeta error: " + self.id + ".moduleMeta['" + self.moduleMeta + "'], " + meta);
						}
					});
					//rias.require._riasrWatch(self.moduleMeta, "error", function(){
					//});
				}catch(error){
					_e("_loadModuleMeta error: " + error.message, error);
				}
			}else{
				_e("The Module must has moduleMeta.");
			}

			//不检查 self._loadAllDeferred === null 的情况，如果调用不正常，就报错。
			return self._loadAllDeferred.promise;
		}

	});

	return Widget;

});