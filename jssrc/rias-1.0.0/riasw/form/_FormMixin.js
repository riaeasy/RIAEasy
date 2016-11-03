
define([
	"rias"
], function(rias){

	var riaswType = "rias.riasw.form._FormMixin";
	return rias.declare(riaswType, null,{

		/// FormLike =================================///

		modified: false,

		name: "",
		state: "",

		postMixInProperties: function(){
			/// getValue 需要有 name
			if(!this.name && (this._riaswIdOfModule != undefined)){
				this.name = this._riaswIdOfModule;
			}
			this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
			this.inherited(arguments);
		},
		destroy: function(){
			this.inherited(arguments);
		},
		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.inherited(arguments);

			self.value = {};//self.get("value");
			self.state = "";//self._getState();
			self.own(
				rias.on(
					self.containerNode,
					"attrmodified-state, attrmodified-disabled, attrmodified-value, attrmodified-checked, attrmodified-modified",
					function(evt){
						if(evt.target == self.domNode){
							return;	// ignore events that I fire on myself because my children changed
						}
						self._onChildChange(evt.type.replace("attrmodified-", ""));
					}
				),
				self.watch("state", function(attr, oldVal, newVal){
					self._onState(newVal, oldVal);
				})
			);
		},

		_getDescendantFormWidgets: function(/*dijit/_WidgetBase[]?*/ children){
			// summary:
			//		Returns all form widget descendants, searching through non-form child widgets like BorderContainer
			var res = [];
			//console.debug("_getDescendantFormWidgets - " + this.id);
			rias.forEach(children || this.getChildren(), function(child){
				//console.debug("child - " + child.id);
				if("value" in child){
					res.push(child);
				}else{
					res = res.concat(this._getDescendantFormWidgets(child.getChildren()));
				}
			}, this);
			return res;
		},
		getWidgetByName: function(name){
			var w;
			rias.forEach(this._getDescendantFormWidgets(), function (widget) {
				if (widget.value !== undefined && widget.name === name) {
					w = widget;
				}
			});
			return w;
		},

		_setValueAttr: function(/*Object*/ obj){
			var map = {};
			rias.forEach(this._getDescendantFormWidgets(), function(widget){
				if(!widget.name){
					return;
				}
				var entry = map[widget.name] || (map[widget.name] = []);
				entry.push(widget);
			});

			for(var name in map){
				if(!map.hasOwnProperty(name)){
					continue;
				}
				var widgets = map[name],
					values = rias.getObject(name, false, obj);

				if(values === undefined){
					continue;
				}
				values = [].concat(values);
				if(typeof widgets[0].checked == 'boolean'){
					// for checkbox/radio, values is a list of which widgets should be checked
					rias.forEach(widgets, function(w){
						w.set('value', rias.contains(values, w._get('value')));
					});
				}else if(widgets[0].multiple){
					// it takes an array (e.g. multi-select)
					widgets[0].set('value', values);
				}else{
					// otherwise, values is a list of values to be assigned sequentially to each widget
					rias.forEach(widgets, function(w, i){
						w.set('value', values[i]);
					});
				}
			}
		},
		_getValueAttr: function(){
			var obj = { };
			rias.forEach(this._getDescendantFormWidgets(), function(widget){
				var name = widget.name;
				if(!name || widget.get("disabled")){
					return;
				}
				var value = widget.get('value');
				// Store widget's value(s) as a scalar, except for checkboxes which are automatically arrays
				if(typeof widget.checked == 'boolean'){
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
						var ary=rias.getObject(name, false, obj);
						if(!ary){
							ary=[];
							rias.setObject(name, ary, obj);
						}
						if(value !== false){
							ary.push(value);
						}
					}
				}else{
					var prev=rias.getObject(name, false, obj);
					if(typeof prev != "undefined"){
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
			var m = this._getDescendantFormWidgets();
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
				rias.forEach(this._getDescendantFormWidgets(), function(child){
					child.set("modified", false);
				});
				this._resetValue = this.get("value");
			}
			this._set("modified", value);
			//console.debug(this.id + ".modified: ", value);
		},

		validate: function(){
			var didFocus = false;
			return rias.every(rias.map(this._getDescendantFormWidgets(), function(widget){
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
			return this.state == "";
		},
		_onState: function(value, oldValue){
		},
		_getState: function(){
			var states = rias.map(this._getDescendantFormWidgets(), function(w){
				return w.get("state") || "";
			});
			return rias.contains(states, "Error") ? "Error" :
				rias.contains(states, "Incomplete") ? "Incomplete" : "";
		},

		///无用了。
		/*connectChildren: function(inStartup){
			rias.forEach(this._getDescendantFormWidgets(), function(child){
				if(!child._started){
					child.startup();
				}
			});
			if(!inStartup){
				this._onChildChange();
			}
		},*/

		_onChildChange: function(/*String*/ attr){
			if(!attr || attr == "modified"){
				this._set("modified", this._getChildrenModified());
			}
			if(!attr || attr == "state" || attr == "disabled"){
				this._set("state", this._getState());
			}
			if(!attr || attr == "value" || attr == "disabled" || attr == "checked"){
				if(this._onChangeDelayTimer){
					this._onChangeDelayTimer.remove();
				}
				this._onChangeDelayTimer = this.defer(function(){
					this._onChangeDelayTimer = undefined;
					this._set("value", this.get("value"));
				}, 10);
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
			self.closeResult = undefined;
			return rias.when(self.onReset(evt), function(result){
				if(!(result === false)){ // only exactly false stops submit
					rias.forEach(self._getDescendantFormWidgets(), function(widget){
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
		afterSubmit: function(result){
		},
		_afterSubmit: function(result){
			this.afterSubmit.apply(this, arguments || []);
		},
		submit: function(evt){
			///注意：rias 不提供 rias.riasw.form.Form 控件，而是用 rias.riasw.studio.Module/rias.riasw.layout.ContentPanel 等控件来替代。
			///故，此处的 submit 与 dijit.form.Form 不同，不是 domNode.submit，而需要自己在 onSubmit 中实现具体的方法。
			var self = this,
				c = evt;
			if(rias.isDomEvent(evt)){
				evt.stopPropagation();
				evt.preventDefault();
				c = rias.by(evt.target);
				if(c){
					c = c.closeResult;
				}
			}
			self.closeResult = (c == undefined ? rias.closeResult.crSubmit : c);
			self.canClose = false;
			return rias.when(self.onSubmit.apply(self, arguments || []), function(result){
				///注意：这里不再 return _afterSubmit 的返回值，即只判断是否成功 onSubmit，而忽略 afterSubmit 是否有错。
				///     只要成功 onSubmit，submitDeferred 即 resolve。
				///     onSubmit 失败，则 submitDeferred 不动作。
				///这里先设置 modified，可能在 afterSubmit 中会使用。
				self.canClose = true;
				if(result != false){
					self.set("modified", false);
					self._afterSubmit(result);
				}
				return result;
			}, function(e){
				self.canClose = false;
				return e;
			});
		},
		onCancel: function(){
			return true;
		},
		afterCancel: function(result){
		},
		_afterCancel: function(result){
			this.afterCancel.apply(this, arguments || []);
		},
		cancel: function(evt){
			var self = this,
				c = evt;
			if(rias.isDomEvent(evt)){
				evt.stopPropagation();
				evt.preventDefault();
				c = rias.by(evt.target);
				if(c){
					c = c.closeResult;
				}
			}
			self.closeResult = (c == undefined ? rias.closeResult.crCancel : c);
			self.canClose = true;
			return rias.when(self.onCancel.apply(self, arguments || []), function(result){
				///注意：这里不再 return _afterCancel 的返回值，即只判断是否成功 onCancel，而忽略 afterCancel 是否有错。
				///     同 submit。
				///这里先设置 modified，可能在 afterSubmit 中会使用。
				if(result != false){
					self.set("modified", false);
					self._afterCancel(result);
				}
			}, function(e){
				return e;
			});
		}

	});

});