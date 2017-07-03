//RIAStudio client runtime widget - ToolButton

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin"
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/ToolButton.css"
	//]);

	var riaswType = "riasw.sys.ToolButton";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin], {

		templateString:
			"<span data-dojo-attach-point='focusNode,buttonNode' class='dijitReset' data-dojo-attach-event='ondijitclick:_onClick' role='button'>"+
				//"<span data-dojo-attach-point='badgeNode' class='${badgeClass}'></span>"+
				//"<span data-dojo-attach-point='iconNode' class='riaswButtonIcon riaswNoIcon'></span>"+
				//"<span data-dojo-attach-point='labelNode' class='riaswButtonLabel riaswNoLabel' role='presentation'></span>"+
			"</span>",

		baseClass: "riaswToolButton",
		type: "button",

		tabIndex: "-1",

		layoutVertical: false,
		iconLayoutTop: false,
		label: "",
		showLabel: false,

		busyLabel: "",
		canBusy: true,
		// isBusy: Boolean
		isBusy: false,
		checkBusyInterval: 500,
		formatBusyLabel: function(msTime){
			return this.busyLabel + msTime > 0 ? "(" + rias.toFixed(msTime / 1000, 1) + ")" : ""; /// this.busyLabel
		},
		onCheckBusy: function(msTime){
			return false;
		},
		_onCheckBusy: function(msTime){
			var b = !!this.onCheckBusy(msTime);
			//console.debug("_onCheckBusy - " + b + " - " + this.id);
			if(b !== true){
				this.set("isBusy", false);
			}
			return b;
		},
		startCheckBusy: function(){
			var self = this,
				dt0 = new Date();
			if(!(self.checkBusyInterval >= 100)){///有可能会导致 _containerLayout，建议 >= 100 ms and <= 5000。
				self.checkBusyInterval = 100;
			}
			if(!(self.checkBusyInterval <= 5000)){///有可能会导致 _containerLayout，建议 >= 100 ms and <= 5000。
				self.checkBusyInterval = 5000;
			}
			self._hCheckBusy = setInterval(function(){
				if(self._onCheckBusy() && self.busyLabel){
					self.set("label", self.formatBusyLabel(new Date() - dt0));
				}
			}, self.checkBusyInterval);
			//console.debug("startCheckBusyInterval - " + self.checkBusyInterval + " ms. - " + self.id);
			if(self._onCheckBusy() && self.busyLabel){
				self.set("label", self.formatBusyLabel(new Date() - dt0));
			}
		},
		stopCheckBusy: function(){
			if(this._hCheckBusy){
				clearInterval(this._hCheckBusy);
				delete this._hCheckBusy;
				//console.debug("stopCheckBusyInterval - " + this.id);
			}
		},
		_setIsBusyAttr: function(value, oldValue){
			value = !!value;
			if(!rias.isEqual(this.isBusy, value)){
				this._set("isBusy", value);
				if(value){
					this._disabled0 = this.get("disabled");
					this.set("disabled", true);
					if(this.busyLabel){
						this._label0 = this.get("label");
					}
					this.startCheckBusy();
				}else{
					this.stopCheckBusy();
					if("_disabled0" in this){
						this.set("disabled", this._disabled0 ? this._disabled0 : false);
						this._disabled0 = undefined;
					}
					if("_label0" in this){
						this.set("label", this._label0);
						this._label0 = undefined;
					}
				}
			}
		},

		_setIconClassAttr: function(value){
			//layoutVertical: false,
			//iconLayoutTop: false,
			value = (value && value !== "riaswNoIcon") ? value : "";
			if(value){
				if(!this.iconNode){
					var ref, pos;
					if(this.labelNode){
						ref = this.labelNode;
						pos = "before";
					}else if(this.badgeNode){
						ref = this.badgeNode;
						pos = "after";
					}else{
						ref = this.domNode;
						pos = "first";
					}
					this.iconNode = rias.dom.place("<span data-dojo-attach-point='iconNode' class='riaswButtonIcon riaswNoIcon'></span>", ref, pos);
				}
			}else{
				if(this.iconNode && this.iconNode !== this._iconNode0){
					rias.dom.destroy(this.iconNode);
					delete this.iconNode;
				}
			}
			this.inherited(arguments, [value]);
		},

		postCreate: function(){
			this.inherited(arguments);

			// we need to ensure the synthetic click is emitted by
			// touch.doClicks even if we moved (inside or outside) before we
			// released in the button area.
			this.domNode.dojoClick = "useTarget";
			// handle touch.press event
			var self = this;
			this.on(rias.touch.press, function(e){
				e.preventDefault();

				if(this.disabled || this.isBusy || this.readOnly){
					return;
				}
				self.set("selected", true);

				// change button state depending on where we are
				var isFirstMoveDone = false;
				self._moveh = rias.on(rias.dom.doc, rias.touch.move, function(e){
					if(!isFirstMoveDone){
						// #17220: preventDefault may not have any effect.
						// causing minor impact on some android
						// (Galaxy Tab 2 with stock browser 4.1.1) where button
						// display does not reflect the actual button state
						// when user moves back and forth from the button area.
						e.preventDefault();
						isFirstMoveDone = true;
					}
					self.set("selected", rias.dom.isDescendant(e.target, self.domNode));
				});

				// handle touch.release
				self._endh = rias.on(rias.dom.doc, rias.touch.release, function(e){
					self.set("selected", false);
					self._moveh.remove();
					self._endh.remove();
				});
			});

			rias.dom.setSelectable(this.focusNode, false);
			if(this.titleNode){
				this.titleNode.title = "";
			}
		},
		_onDestroy: function(){
			if(this._hCheckBusy){
				clearInterval(this._hCheckBusy);
				delete this._hCheckBusy;
			}
			if(this.labelNode && this.labelNode !== this._labelNode0){
				rias.dom.destroy(this.labelNode);
				delete this.labelNode;
			}
			if(this.iconNode && this.iconNode !== this._iconNode0){
				rias.dom.destroy(this.iconNode);
				delete this.iconNode;
			}
			this.inherited(arguments);
		},

		_setSelectedAttr: function(value){
			value = !!value;
			if(value !== this.selected){
				this._set("selected", value);
			}
		},

		onClick: function(e){
			return true;		// Boolean
		},
		_onClick: function(e){
			// summary:
			//		on button click the button state gets changed

			// only do something if button is not busy
			/// readOnly 也屏蔽好些
			if(this.disabled || this.isBusy || this.readOnly){
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
			if(e && e.type === "keydown" && e.keyCode !== rias.keys.SPACE){
				return;
			}
			if(this.onClick(e) === false){
				e.preventDefault();
			}
			if(this.canBusy){
				this.set("isBusy", true);
			}
			return !e.defaultPrevented;
		},

		_setIconLayoutTopAttr: function(value){
			value = !!value;
			if(value){
				rias.dom.toggleClass(this.buttonNode, "riaswIconLayoutTop", !!value);///注意：riaswIconLayoutTop 不要跨 Widget
			}
			this._set("iconLayoutTop", value);
		},
		_setLayoutVerticalAttr: function(value){
			value = !!value;
			///注意：riaswDisplayVertical 和 riaswTextVertical 不要跨 Widget，即不要加到 Container.domNode 或 Container.containerNode
			rias.dom.toggleClass(this.domNode, "riaswDisplayVertical", value);
			rias.forEach(this.splitBaseClass(), function(cls){
				rias.dom.toggleClass(this.domNode, cls + "Vertical", value);
			}, this);
			if(this.labelNode){
				rias.dom.toggleClass(this.labelNode, "riaswTextVertical", value);
			}
			this._set("layoutVertical", value);
			this.set("label", this.label);
		},

		_setShowLabelAttr: function(value){
			value = !!value;
			this._set("showLabel", value);
			if(value){
				if(!this.labelNode){
					var ref = this.iconNode || this.badgeNode;
					this.labelNode = rias.dom.place("<span data-dojo-attach-point='labelNode' class='riaswButtonLabel riaswNoLabel' id='" + this.id + "_label' role='presentation'></span>", ref ? ref : this.domNode, ref ? "after" : "first");
					this.set("label", this.label);
					this.set("layoutVertical", this.layoutVertical);
				}
			}else{
				if(this.labelNode && this.labelNode !== this._labelNode0){
					rias.dom.destroy(this.labelNode);
					delete this.labelNode;
				}
			}
			var ln = this.labelNode;
			if(ln){
				rias.dom.toggleClass(ln, "riaswHidden", !value);
				rias.dom.toggleClass(ln, "riaswNoLabel", !value || !this.label);
				rias.dom.toggleClass(ln, "riaswHasLabel", value && !!this.label);
				if(value){
					ln.innerHTML = this.label;
				}else{
					ln.innerHTML = "";
				}
			}
		},
		onSetLabel: function(value){
		},
		_setLabelAttr: function(value){
			this._set("label", value);
			if(this.labelNode){
				rias.dom.toggleClass(this.labelNode, "riaswNoLabel", !this.showLabel || !this.label);
				rias.dom.toggleClass(this.labelNode, "riaswHasLabel", this.showLabel && !!this.label);
				if(this.showLabel){
					this.labelNode.innerHTML = value;
				}
				//rias.dom.toggleClass(this.labelNode, "riaswHidden", !this.showLabel || !value);
				//if(this.applyTextDir){
				//	this.applyTextDir(this.labelNode);
				//}
				this.onSetLabel(value);

				if(!this.showLabel && this.iconNode){
					this.iconNode.alt = rias.trim(this.labelNode.innerText || this.labelNode.textContent || '');
					if(this.applyTextDir){
						this.applyTextDir(this.iconNode, this.iconNode.alt);
					}
				}
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		property: {
			type: {
				datatype: "string",
				option: [
					{
						value: "button"
					},
					{
						value: "submit"
					},
					{
						value: "reset"
					}
				],
				defaultValue: "button",
				title: "Type"
			},
			name: {
				datatype: "string",
				title: "Name"
			},
			alt: {
				datatype: "string",
				hidden: true
			},
			tabIndex: {
				datatype: "string",
				defaultValue: "0",
				title: "Tab Index"
			},
			disabled: {
				datatype: "boolean",
				title: "Disabled"
			},
			readOnly: {
				datatype: "boolean",
				hidden: true
			},
			intermediateChanges: {
				datatype: "boolean",
				hidden: true
			},
			label: {
				datatype: "string",
				title: "Label"
			},
			showLabel: {
				datatype: "boolean",
				defaultValue: true,
				title: "Show Label"
			},
			iconClass: {
				datatype: "string",
				title: "Icon Class"
			}
		}
	};

	return Widget;

});