
define([
	"riasw/riaswBase",
	"riasw/sys/_ContentMixin"
], function(rias, _ContentMixin){

	var _exFuncName = [
		"constructor"
	];

	var riaswType = "riasw.sys._ModuleMixin";
	var Widget = rias.declare(riaswType, [_ContentMixin], {

		///TODO:zensst.因为无法彻底还原到初始状态，故不能二次赋值 moduleMeta。是否可以尝试清除 OwnerProperty？
		///moduleMeta: "", //moduleMeta 要参与 isRiaswModule() 判断，不能在 riasw.sys._ModuleMixin 中初始化，可以在 riasw.sys.Module、 riasw.sys.Desktop 和 riasw.sys.Scene 中初始化。

		__inheritedMeta: function(args, a, f){
			var name, caller, meta;

			if(typeof args === "string"){
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
			if(typeof name === "string"){
				return this.__inheritedMeta(name, args, true);
			}
			return this.__inheritedMeta(name, true);
		},
		inheritedMeta: function(args, a1, a2){
			var f = this.getInheritedMeta(args, a1);
			if(!f){
				f = this.getInherited(args, a1);
			}
			if(f){
				return f.apply(this, a2 || a1 || args);
			}
		},

		postMixInProperties: function(){
			this.inherited(arguments);
			this._catCounter = {};
		},
		_clearContentChildren: function(){
			/// 只清除动态创建的 widget
			/// _riasrModuleChildren 缓存的是 moduleMeta 创建的 widget
			if(this._riasrModuleChildren){
				rias.forEach(this._riasrModuleChildren, function(el){
					rias.destroy(el);
				});
			}
			this._riasrModuleChildren = [];/// _riasrModuleChildren 需要初始化为 []
		},
		destroyDescendants: function(/*Boolean*/ preserveDom){
			/// 只清除动态创建的 moduleChildren
			this._clearContentChildren();
			this.inherited(arguments);
		},
		_onDestroy: function(){
			this.inherited(arguments);
			this._catCounter = undefined;
		},

		/*onModuleResult: function(value, oldValue){
			return value;
		},
		_onModuleResultAttr: function(value, oldValue){
			this.moduleResult = this.onModuleResult(value, oldValue);
			return value;
		},
		_getValueAttr: function(){
			var value = this.inherited(arguments);
			value.moduleResult = this.get("moduleResult");
			return value;
		},
		_setValueAttr: function(value){
			if(value){
				this.set("moduleResult", value.moduleResult);
			}
			return this.inherited(arguments);
		},*/

		//_onModuleMetaAttr: function(/*String|Object*/meta){
		//	///TODO:zensst.因为无法彻底还原到初始状态，故不能二次赋值 moduleMeta。是否可以尝试清除 OwnerProperty？
		//	if(this.moduleMeta && (this.contentLoading || this.contentLoaded)){
		//		throw "The moduleMeta['" + this.id + "'] already exists.";
		//	}
		//	//this.content = "";
		//	//this.href = "";
		//	this.moduleMeta = meta;
		//	if(this._started){
		//		return this.load();
		//	}
		//	return false;
		//},

		_beforeLoad: function(callback){
			this._clearContentChildren();
			this.inherited(arguments);
		},
		_doLoad: function(){
			if(!this.isDestroyed(true)){
				//this.defer(function(){
				///需要等待 给 _started 赋值
				//this._setLoadingMessage(this.loadingMessage).then(function(){
				if(this.moduleMeta){
					this._loadModuleMeta();
				}else{
					this._loadContent();
				}
				//});
				//}, 10);
			}
		},

		//_beforeLoadMeta: function(){
			//在 _loadModuleMeta 之前，没有“继承”关系.
		//	if (rias.isFunction(this.beforeLoadMeta)){
		//		return this.beforeLoadMeta();
		//	}
		//},
		//_afterLoadMeta: function(){
		//	if (rias.isFunction(this.afterLoadMeta)){
		//		return this.afterLoadMeta();
		//	}
		//},
		_beforeParse: function(){
			if (rias.isFunction(this.beforeParse)){
				return this.beforeParse();
			}
		},
		_afterParse: function(/*{widgets: widgets, parent: parent, module: m}*/result){
			if (rias.isFunction(this.afterParse)){
				return this.afterParse(result);
			}
		},

		_loadModuleMeta: function(){
			var self = this,
				errs = "";
			function _when(func, args){
				var r;
				try{
					r = func.apply(self, rias.argsToArray(arguments, 1));
				}catch(e){
					console.error(e, self);
					if(e instanceof Error){
						errs += e.message + "\n";
					}else{
						errs += e + "\n";
					}
				}
				return rias.when(r).then(function(result){
					return result;
				}, function(e){
					console.error(e, self);
					if(e instanceof Error){
						errs += e.message + "\n";
					}else{
						errs += e + "\n";
					}
				});
			}
			function _af(result){
				self._riasrModuleChildren.concat(result.widgets);
				_when(self._afterParse, result).then(function(){
					self.defer(function(){///保证 _loadMetaDeferred 正确 fullFilled
						_when(self._afterLoaded, result).then(function(){
							if(errs){
								rias.error(errs);
							}
						});
					});
				});
			}
			function _e(s, e){
				if(e instanceof Error){
					console.error(s, self);
					errs += e.message + "\n";
				}else{
					console.error(s, self);
					errs += e + "\n";
				}
				rias.parseRiasws([{
					_riaswType: "riasw.sys.DefaultError",
					errorMessage: s
				}], self, self).then(function(result){
					result.errors = s;
					_af(result);
				});
			}
			function _parse(params){
				//if(rias.isDebug){
				//	console.debug(self.id, self);
				//}
				var pn, cn,
					_p,
					meta;
				///处理设计值（Meta），替换设计值为运行值
				//meta = rias.mixinDeep({}, self._riaswModuleMeta, params);///使用 _riaswModuleMeta._riaswElements
				meta = rias.mixinDeep({}, self._riaswModuleMeta);
				rias.decodeRiaswParams(self, meta);/// 后面的 parseRiasws 只处理 _riaswElements，这里需要 decodeRiaswParams
				/// meta.style(即_riaswModuleMeta.style) 是设置 containerNode 的（Module.containerNode = domNode）
				/// parames.style 是设置 domNode 的，在 create 中已经设置了，这里不能 mixin
				/// Dialog 有 CaptionNode 存在，不应该设置 domNode.style，而应该设置 containerNode
				rias.dom.addClass(self.containerNode, meta["class"]);
				rias.dom.setStyle(self.containerNode, meta.style);
				rias.deleteDeep(meta, params);///params 为 new 的 params，优先于 meta，且已生效，故应删除 meta 中已存在于 params 中的值
				delete meta.style;
				delete meta["class"];
				///如果 meta 中有新增的 _setXXXAttr，则需要再次触发 params 中需要 set 的值
				///先混合 meta 中新增的 _setXXXAttr，避免执行 _setXXXAttr 出现错误。此时不会触发 _onXXXAttr()。
				for(pn in params){
					/// 此时，meta 中可能没有 meta[pn]，所以不能 meta.hasOwnProperty(pn)
					if(meta["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// 存在 _setXXXAttr 不是 function 的情况，比如 _setClassAttr。
						meta[pn] = params[pn];
					}
				}
				///混合之前先屏蔽需要 set 的值，混合后在 set，使用 meta 的副本，避免修改 meta
				_p = rias.mixin({}, meta);
				for(pn in _p){
					if(_p.hasOwnProperty(pn) && self["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
						delete _p[pn];
					}
				}
				rias.mixinDeep(self, _p);///mixinDeep 支持 safeMixin
				for(pn in meta){
					if(meta.hasOwnProperty(pn)){
						//if(meta.hasOwnProperty(pn) && rias.isFunction(self["_set" + rias.upperCaseFirst(pn) + "Attr"])){
						if(self["_set" + rias.upperCaseFirst(pn) + "Attr"]){/// _setClassAttr 不是 function
							self.set(pn, meta[pn]);
						}else{
							self._setOn(pn, meta[pn]);
						}
					}
				}

				////使用 self._riaswElements 而不是 _riaswModuleMeta._riaswElements 创建，保持 _riaswModuleMeta 不变。
				_when(self._beforeParse, self).then(function(){
					rias.parseRiasws(self._riaswElements, self, self).then(function(result){
						_af(result);
					}, function(error){
						_e("loading Module error:\n" + error.message, error);
					});
				});
			}
			function _pro(meta, mixinMeta){
				//使用副本，避免原始 meta 被修改.
				self._riaswModuleMeta = rias.mixinDeep({}, meta);
				//_when(self._afterLoadMeta).then(function(){
					delete self._riaswModuleMeta._riaswType;/// _riaswType 已经是 self 明确了的，_riaswModuleMeta 不应该再指定。
					///delete self._riaswModuleMeta._riaswElements;//保留，后面要使用 meta 的 _riaswElements 创建
					delete self._riaswModuleMeta._riaswIdInModule;/// _riaswIdInModule 已经是 self 明确了的，_riaswIdInModule 不应该再指定。
					///delete self._riaswModuleMeta._riaswVersion;//可以保留
					rias._deleDP(self._riaswModuleMeta, true, false, false);//保留 _riaswElements，后面要使用 meta 的 _riaswElements 创建

					///为了实现自动布局，由 params 的 region 和 style 设置，params 不设置时，由 ModuleMeta.style 处理。
					// 都不设置时，再在？先删除 ModuleMeta.region，
					delete self._riaswModuleMeta.region;

					/*///loadMeta 时，self.params 中的值有可能已经改变，需要取当前值，用 rias.copy
					 var p = rias.mixinDeep(rias.copy(rias.mixin({}, self.params), self), mixinMeta);*/
					///还是取 初始值 好些。
					var p = rias.mixinDeep({}, self.params, mixinMeta);
					delete p._riaswType;
					delete p.ownerRiasw;
					//delete p._riaswElements;//在下面的 rias._deleDP 中删除，使用 meta 的 _riaswElements 创建
					//delete p._riaswIdInModule;//保留运行期的 _riaswIdInModule
					delete p._riaswVersion;
					/*delete p._riasrOwner;
					 delete p._riasrElements;
					 delete p._riasrModule;
					 delete p._riaspParent;
					 delete p._riaspChildren;
					 delete p.__riasrWidget;*/
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
								self._riasrRequiresResult = {};
								for(var i = 0, l = r.length; i < l; i++){
									self._riasrRequiresResult[r[i]] = arguments[i];
								}
								_when(_parse, p);
							}, function(moduleId){
								_e("require module's requires error: " + r);
							});
						}else{
							_when(_parse, p);
						}
					}catch(e){
						_e("require module's requires error: " + e.message, e);
					}
				//});
			}

			if(!self.moduleMeta){
				_e("The Module must has moduleMeta.");
			}else{
				if(self.moduleMeta.$refObj){//
					self.moduleMeta = rias.$obj(self, self.moduleMeta.$refObj, self.id);
				}else if(self.moduleMeta.$refScript){//
					try{
						self.moduleMeta = rias.$script(self, self.moduleMeta.$refScript, self.id + "[moduleMeta]");
					}catch(error){
						self.moduleMeta = {};
						_e("_loadModuleMeta error: " + error.message, error);
					}
				}
				if(rias.isObjectSimple(self.moduleMeta)){
					try{
						if(self.moduleMeta.moduleMeta){
							_e("Please rias.mixinDeep(moduleMeta, moduleMeta.moduleMeta).");
						}else{
							//_when(self._beforeLoadMeta).then(function(){
								_when(_pro, self.moduleMeta);
							//});
						}
					}catch(error){
						_e("_loadModuleMeta error: " + error.message, error);
					}
				}else if(rias.isString(self.moduleMeta)){
					try{
						//self.moduleMeta = self.moduleMeta.replace(/\.js$/g, "").replace(/\./g, "/") + ".js";
						rias.require([self.moduleMeta], function(meta){
							//_when(self._beforeLoadMeta).then(function(){
								if(rias.isObjectSimple(meta)){
									_when(_pro, meta);
								}else{
									_e("_loadModuleMeta error: " + self.id + ".moduleMeta['" + self.moduleMeta + "'], " + meta);
								}
							//});
						});
						//rias.require._riasrWatch(self.moduleMeta, "error", function(){
						//});
					}catch(error){
						_e("_loadModuleMeta error: " + error.message, error);
					}
				}else{
					_e("The Module must has moduleMeta.");
				}
			}

			//不检查 self._loadAllDeferred === null 的情况，如果调用不正常，就报错。
			return self._loadAllDeferred.promise;
		}

	});

	return Widget;

});