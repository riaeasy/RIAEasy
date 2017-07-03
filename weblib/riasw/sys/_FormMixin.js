
define([
	"riasw/riaswBase"
], function(rias){

	var riaswType = "riasw.sys._FormMixin";
	return rias.declare(riaswType, null,{

		/// FormLike =================================///
		/// 注意：_FormWidgetMixin 需要响应 _doContainerChanged，故须继承自 _Container

		formResult: rias.formResult.frNone,
		modified: false,
		handleChildrenModified: true,
		checkModifiedWhenHide: false,
		checkResultWhenHide: false,
		closeWhenSubmit: false,
		closeWhenAbort: false,

		confirmCloseFormModified: rias.i18n.action.confirmCloseFormModified,

		name: "",
		autoName: true,

		state: "",

		postMixInProperties: function(){
			this.inherited(arguments);
			/// getValue 需要有 name
			if(this.autoName && this.name === "" && (this._riaswIdInModule != undefined)){
				this.name = this._riaswIdInModule;
			}
			//this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";///修改到 buildRendering 中显式设置
		},
		buildRendering: function(){
			this.inherited(arguments);
			if(this.name){
				rias.dom.setAttr(this.domNode, "name", this.name);
			}
		},
		//_onDestroy: function(){
		//	this.inherited(arguments);
		//},
		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.inherited(arguments);

			self.value = {};//self.get("value");
			self.state = "";//self._getState();
			self.own(
				/*rias.on(
					self.containerNode,
					"attrmodified-state, attrmodified-disabled, attrmodified-value, attrmodified-checked, attrmodified-modified",
					function(evt){
						if(evt.target === self.domNode){
							return;	// ignore events that I fire on myself because my children changed
						}
						self._onChildChange(evt.type.replace("attrmodified-", ""));
					}
				),*/
				self.watch("state", function(attr, oldVal, newVal){
					self._onState(newVal, oldVal);
				})
			);
		},

		getValueWidgets: function(/*_WidgetBase[]?*/ children){
			// summary:
			//		Returns all form widget descendants, searching through non-form child widgets like BorderContainer
			var res = [];
			//console.debug("getValueWidgets - " + this.id);
			rias.forEach(children || this.getChildren(), function(child){
				//console.debug("child - " + child.id);
				if("value" in child){
					res.push(child);
				}else{
					res = res.concat(this.getValueWidgets(child.getChildren()));
				}
			}, this);
			return res;
		},

		_setValueAttr: function(/*Object*/ obj){
			var entry,
				name,
				map = {};

			function _setBoolean(w){
				w.set('value', rias.contains(values, w._get('value')));
			}
			function _set(w, i){
				w.set('value', values[i]);
			}
			rias.forEach(this.getValueWidgets(), function(widget){
				if(!widget.name){
					return;
				}
				entry = map[widget.name] || (map[widget.name] = []);
				entry.push(widget);
			});

			for(name in map){
				if(!map.hasOwnProperty(name)){
					continue;
				}
				var widgets = map[name],
					values = rias.getObject(name, false, obj);

				if(values === undefined){
					continue;
				}
				values = [].concat(values);
				if(typeof widgets[0].checked === 'boolean'){
					// for checkbox/radio, values is a list of which widgets should be checked
					rias.forEach(widgets, _setBoolean);
				}else if(widgets[0].multiple){
					// it takes an array (e.g. multi-select)
					widgets[0].set('value', values);
				}else{
					// otherwise, values is a list of values to be assigned sequentially to each widget
					rias.forEach(widgets, _set);
				}
			}
		},
		_getValueAttr: function(){
			var obj = {};
			rias.forEach(this.getValueWidgets(), function(widget){
				var name = widget.name;
				if(!name || widget.get("disabled")){
					return;
				}
				var value = widget.get('value');
				///使用 副本，避免 destroy 不能完全释放。
				if(rias.isObject(value)){
					try{
						value = rias.mixinDeep({}, value);
					}catch(err){
						console.error(widget.id + " - mixinDeep the value error: ", err);
						value = undefined;
					}
				}
				// Store widget's value(s) as a scalar, except for checkboxes which are automatically arrays
				if(typeof widget.checked === 'boolean'){
					if(/Radio/.test(widget.declaredClass)){
						// radio button
						if(value !== false){
							rias.setObject(name, value, obj);
						}else{
							// give radio widgets a default of null
							value = rias.getObject(name, false, obj);
							if(value === undefined){
								rias.setObject(name, null, obj);
							}
						}
					}else{
						// checkbox/toggle button
						var ary = rias.getObject(name, false, obj);
						if(!ary){
							ary = [];
							rias.setObject(name, ary, obj);
						}
						if(value !== false){
							ary.push(value);
						}
					}
				}else{
					var prev = rias.getObject(name, false, obj);
					if(prev !== undefined){///允许 null
						if(rias.isArray(prev)){
							prev.push(value);
						}else{
							rias.setObject(name, [prev, value], obj);
						}
					}else{
						// unique name
						rias.setObject(name, value, obj);
					}
				}
			});
			return obj;
		},
		_getChildrenModified: function(){
			var m = this.getValueWidgets();
			m = rias.some(m, function(child){
				return !child.get("disabled") && !child.get("readOnly") && child.get("modified");
			});
			return !!m;
		},
		//_getModifiedAttr: function(){
		//	return !!this.modified;
		//},
		_setModifiedAttr: function(value){
			value = !!value;
			if(!value){
				rias.forEach(this.getValueWidgets(), function(child){
					child.set("modified", false);
				});
				this._resetValue = this.get("value");
			}
			this._set("modified", value);
			//console.debug(this.id + ".modified: ", value);
		},

		validate: function(){
			var didFocus = false;
			return rias.every(rias.map(this.getValueWidgets(), function(widget){
				// Need to set this so that "required" widgets get their
				// state set.
				widget._hasBeenBlurred = true;
				var valid = widget.disabled || !widget.validate || widget.validate();
				if(!valid && !didFocus){
					// Set focus of the first non-valid widget
					rias.dom.scrollIntoView(widget.containerNode || widget.domNode);
					widget.focus();
					didFocus = true;
				}
				return valid;
			}), function(item){
				return item;
			});
		},
		isValid: function(){
			return this.state === "";
		},
		_onState: function(value, oldValue){
		},
		_getState: function(){
			var states = rias.map(this.getValueWidgets(), function(w){
				return w.get("state") || "";
			});
			return rias.contains(states, "Error") ? "Error" :
				rias.contains(states, "Incomplete") ? "Incomplete" : "";
		},

		///无用了。
		/*connectChildren: function(inStartup){
			rias.forEach(this.getValueWidgets(), function(child){
				if(!child._started){
					child.startup();
				}
			});
			if(!inStartup){
				this._onChildChange();
			}
		},*/

		onChange: function(newValue, oldValue){
			return true;
		},
		_onChildChangeDelay: 30,
		_onChildChange: function(/*String*/ attr){
			if(!attr || attr === "state" || attr === "disabled"){
				this._set("state", this._getState());
			}
			if(!attr || attr === "value" || attr === "disabled" || attr === "modified" || attr === "checked"){
				if(this._onChangeDelayTimer){
					this._onChangeDelayTimer.remove();
				}
				this._onChangeDelayTimer = this.defer(function(){
					this._onChangeDelayTimer = undefined;
					if(this.handleChildrenModified){
						this._set("modified", this._getChildrenModified());
					}
					var oldValue = this.value,
						newValue = this.get("value");
					this._set("value", newValue);
					if(!rias.isEqual(oldValue, newValue)){
						if(this.onChange(newValue, oldValue) != false){
							var f = rias.formBy(this._getContainerRiasw());
							if(f){
								f._onChildChange();
							}
						}
					}
				}, this._onChildChangeDelay >= 0 ? this._onChildChangeDelay : 30);
			}
		},

		onReset: function(/*Event?*/ /*===== evt =====*/){
			return true; // Boolean
		},
		reset: function(evt){
			var self = this;
			if(evt){
				evt.stopPropagation();
				evt.preventDefault();
			}
			self.formResult = undefined;
			return rias.when(self.onReset.apply(self, arguments || [])).then(
				function(result){
					if(!(result === false)){ // only exactly false stops submit
						rias.forEach(self.getValueWidgets(), function(widget){
							if(widget.reset){
								widget.reset();
							}
						});
						self.set("modified", false);
					}
				});
		},

		onSubmit: function(/*Event?*/ /*===== evt =====*/){
			return this.isValid();// this.get("state") == ""; // Boolean
		},
		afterSubmit: function(submitValue){
			return true;///return toClose
		},
		_afterSubmit: function(submitValue){
			var self = this;
			///没必要用 Deferred
			rias.when(self.afterSubmit.apply(self, arguments || [])).then(function(result){
				if(self.closeWhenSubmit){
					self.close();
				}
			});
		},
		submit: function(evt){
			///此处的 submit 与 dijit.form.Form 不同，不是 domNode.submit，而需要自己在 onSubmit 中实现具体的方法。
			var self = this,
				c = evt;/// evt 可以是 Event，也可以由调用者传递 formResult
			if(rias.isDomEvent(evt)){
				evt.stopPropagation();
				evt.preventDefault();
				c = rias.by(evt.target);
				if(c){
					c = c.formResult;
				}
			}
			self.formResult = (c == undefined ? rias.formResult.frSubmit : c);
			self.submitError = undefined;
			return rias.when(self.onSubmit.apply(self, arguments || [])).then(function(result){
				///注意：这里不再 return _afterSubmit 的返回值，即只判断是否成功 onSubmit，而忽略 afterSubmit 是否有错。
				///     只要成功 onSubmit，submitDeferred 即 resolve。
				///     onSubmit 失败，则 submitDeferred 不动作。
				///这里先设置 modified，可能在 afterSubmit 中会使用。
				if(result != false){
					self.set("modified", false);
					self._afterSubmit(self.get("submitValue"));
				}
				return result;
			}, function(e){
				self.submitError = e;
				self.formResult = rias.formResult.frError;
				return rias.newDeferredReject(e);
			});
		},
		onAbort: function(){
			return true;
		},
		afterAbort: function(result){
		},
		_afterAbort: function(result){
			var self = this;
			///没必要用 Deferred
			rias.when(self.afterAbort.apply(self, arguments || [])).then(function(result){
				if(self.closeWhenAbort){
					self.close();
				}
			});
		},
		abort: function(evt){
			var self = this,
				c = evt;/// evt 可以是 Event，也可以由调用者传递 formResult
			if(rias.isDomEvent(evt)){
				evt.stopPropagation();
				evt.preventDefault();
				c = rias.by(evt.target);
				if(c){
					c = c.formResult;
				}
			}
			self.formResult = (c == undefined ? rias.formResult.frCancel : c);
			self.submitError = undefined;
			return rias.when(self.onAbort.apply(self, arguments || [])).then(function(result){
				///注意：这里不再 return _afterAbort 的返回值，即只判断是否成功 onAbort，而忽略 afterAbort 是否有错。
				///     同 submit。
				///这里先设置 modified，可能在 afterAbort 中会使用。
				if(result != false){
					self.set("modified", false);
					self._afterAbort(result);
				}
				return result;
			}, function(e){
				self.submitError = e;
				self.formResult = rias.formResult.frError;
				return rias.newDeferredReject(e);
			});
		},
		_checkCanHide: function(){
			///this.canHide() 有可能是 promise，返回 this.canHide()
			var self = this;
			return rias.when(this.inherited(arguments, [this.formResult])).always(function(result){
				if(result != false){
					var r = rias.formResult.isNone(self.formResult) || rias.formResult.isError(self.formResult);
					if(self.checkResultWhenHide && r){
						return false;
					}
					if(self.checkModifiedWhenHide && self.get("modified")){
						var pos = rias.dom.getPosition(self.domNode, false);
						///存在多次 _checkCanHide 情况，需要判断 _checkModifiedWhenHide。
						return self._checkModifiedWhenHide || (self._checkModifiedWhenHide = rias.choose({
							ownerRiasw: self,
							popupArgs: {
								parent: rias.desktop, ///self._getContainerRiasw() 有可能容不下，或者是 StackPanel 等容器，会造成 addChild
								around: {
									x: pos.x + (pos.w >> 1),
									y: pos.y + (pos.h >> 1)
								},
								popupPositions: ["centered"]
							},
							content: self.confirmCloseFormModified,/// "是否放弃修改并退出？",
							caption: rias.i18n.action.choose,
							actionBar: [
								"btnYes",
								"btnNo"
							]
						}).whenHide(function(formResult){
							delete self._checkModifiedWhenHide;
							if(rias.formResult.isSubmit(formResult)){
								self.reset();
								return true;
							}
							return false;
						}));
					}
					return true;
				}
				return false;
			});
		}

	});

});