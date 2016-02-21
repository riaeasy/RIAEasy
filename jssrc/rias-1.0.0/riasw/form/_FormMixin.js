
define([
	"rias"
], function(rias){

	var riasType = "rias.riasw.form._FormMixin";
	return rias.declare(riasType, null,{

		/// FormLike =================================///

		closeResult: -1,
		submitDisplayState: "",
		name: "",
		state: "",

		postMixInProperties: function(){
			this.nameAttrSetting = this.name ? ("name='" + this.name + "'") : "";
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
					"attrmodified-state, attrmodified-disabled, attrmodified-value, attrmodified-checked",
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
			rias.forEach(children || this.getChildren(), function(child){
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
						w.set('value', rias.indexOf(values, w._get('value')) != -1);
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
				if(!name || widget.disabled){
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
			return rias.indexOf(states, "Error") >= 0 ? "Error" :
				rias.indexOf(states, "Incomplete") >= 0 ? "Incomplete" : "";
		},

		connectChildren: function(/*Boolean*/ inStartup){
			rias.forEach(this._getDescendantFormWidgets(), function(child){
				if(!child._started){
					child.startup();
				}
			});
			if(!inStartup){
				this._onChildChange();
			}
		},

		_onChildChange: function(/*String*/ attr){
			if(!attr || attr == "state" || attr == "disabled"){
				this._set("state", this._getState());
			}
			if(!attr || attr == "value" || attr == "disabled" || attr == "checked"){
				if(this._onChangeDelayTimer){
					this._onChangeDelayTimer.remove();
				}
				this._onChangeDelayTimer = this.defer(function(){
					delete this._onChangeDelayTimer;
					this._set("value", this.get("value"));
				}, 10);
			}
		},

		onReset: function(/*Event?*/ /*===== e =====*/){
			return true; // Boolean
		},
		reset: function(e){
			var self = this;
			self.closeResult = -1;
			if(e){
				e.stopPropagation();
				e.preventDefault();
			}
			return rias.when(self.onReset(e), function(result){
				if(!(result === false)){ // only exactly false stops submit
					rias.forEach(self._getDescendantFormWidgets(), function(widget){
						if(widget.reset){
							widget.reset();
						}
					});
				}
			});
		},
		onSubmit: function(/*Event?*/ /*===== e =====*/){
			return this.isValid();// this.get("state") == ""; // Boolean
		},
		afterSubmit: function(){
		},
		submit: function(e){
			var self = this;
			if(e){
				e.stopPropagation();
				e.preventDefault();
			}
			return rias.when(self.onSubmit.apply(self, arguments), function(result){
				if(!(result === false)){
					rias.when(self.afterSubmit(result), function(result){
						if(self.submitDisplayState){
							self.closeResult = 1;
							//self.close(self.closeResult);
							self.set("displayState", self.submitDisplayState);
						}
					});
				}
			});
		},
		onCancel: function(){
			return true;
		},
		cancel: function(e){
			var self = this;
			if(e){
				e.stopPropagation();
				e.preventDefault();
			}
			return rias.when(self.onCancel(e), function(result){
				if(!(result === false)){
					//if(self.submitDisplayState){
						self.closeResult = 0;
						self.close(self.closeResult);
					//}
				}
			});
		}

	});

});