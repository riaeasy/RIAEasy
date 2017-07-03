
/// riasw.form.Switch

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_maskUtils",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin"
], function(rias, _WidgetBase, _maskUtils, _CssStateMixin, _FormWidgetMixin){

	// module:
	//		riasw/form/Switch

	//rias.theme.loadMobileThemeCss([
	//	"Switch.css"
	//]);
	//rias.theme.loadThemeCss([
	//	"riasw/form/Switch.css"
	//]);

	var riaswType = "riasw.form.Switch";
	var Switch = rias.declare(riaswType, [_WidgetBase, _CssStateMixin, _FormWidgetMixin],{

		baseClass: "riaswSwitch",

		// name: String
		//		A name for a hidden input field, which holds the current value.
		name: "",
		// value: String
		//		The initial state of the switch: "on" or "off". The default
		//		value is "on".
		value: "on",
		_handleValue: true,
		checked: true,

		// role: [private] String
		//		The accessibility role.
		role: "", // a11y
		// tabIndex: String
		//		Tabindex setting for this widget so users can hit the tab key to
		//		focus on it.
		tabIndex: "0",
		_setTabIndexAttr: "", // sets tabIndex to domNode

		// stateOnLabel: String
		//		The left-side label of the switch.
		stateOnLabel: "on",
		// stateOffLabel: String
		//		The right-side label of the switch.
		stateOffLabel: "off",

		// shape: String
		//		The shape of the switch.
		//		"riaswSwitchDefaultShape", "riaswSwitchSquareShape", "riaswSwitchRoundShape",
		//		The default value is "riaswSwitchDefaultShape".
		shape: "riaswSwitchDefaultShape",

		buildRendering: function(){
			if(!this.templateString){ // true if this widget is not templated
				this.domNode = (this.srcNodeRef && this.srcNodeRef.tagName === "SPAN") ?
					this.srcNodeRef : rias.dom.create("span");
			}
			// prevent browser scrolling on IE10 (evt.preventDefault() is not enough)
			rias.dom._setTouchAction(this.domNode, "none");
			this.inherited(arguments);
			if(!this.templateString){ // true if this widget is not templated
				var c = (this.srcNodeRef && this.srcNodeRef.className) || this.className || this["class"];
				if((c = c.match(/riaswSwitch.*Shape\d*/))){
					this.shape = c;
				}
				rias.dom.addClass(this.domNode, this.shape);
				var nameAttr = this.name ? " name=\"" + this.name + "\"" : "";
				this.domNode.innerHTML =
					'<div class="riaswSwitchInner">' +
						'<div class="riaswSwitchBg riaswSwitchBgLeft">' +
							'<div class="riaswSwitchText riaswSwitchTextLeft"></div>' +
						'</div>' +
						'<div class="riaswSwitchBg riaswSwitchBgRight">' +
							'<div class="riaswSwitchText riaswSwitchTextRight"></div>' +
						'</div>' +
						'<div class="riaswSwitchKnob"></div>' +
						'<input type="hidden"' + nameAttr + ' value="' + this.value + '"></div>' +
					 '</div>';
				var n = this.innerNode = this.domNode.firstChild;
				this.leftNode = n.childNodes[0];
				this.rightNode = n.childNodes[1];
				this.knobNode = n.childNodes[2];
				this.inputNode = n.childNodes[3];
			}
			rias.dom.setAttr(this.domNode, "role", "checkbox"); //a11y
			rias.dom.setAttr(this.domNode, "aria-checked", (this.value === "on") ? "true" : "false"); //a11y

			this.focusNode = this.domNode;

			/*if(rias.has("windows-theme")) {
				var rootNode = rias.dom.create("div", {
					className: "riaswSwitchContainer"
				});
				this.labelNode = rias.dom.create("label", {
					"class": "riaswSwitchLabel",
					"for": this.id
				}, rootNode);
				rootNode.appendChild(this.domNode.cloneNode(true));
				this.domNode = rootNode;
				this.labelNode.innerHTML = (this.value === "off") ? this.stateOffLabel : this.stateOnLabel;
				this.focusNode = rootNode.childNodes[1];
				var inner = this.innerNode = rootNode.childNodes[1].firstChild;
				this.leftNode = inner.childNodes[0];
				this.rightNode = inner.childNodes[1];
				this.knobNode = inner.childNodes[2];
				this.inputNode = inner.childNodes[3];
			}*/

			if(!this.isLeftToRight()){
				rias.dom.addClass(this.leftNode, "riaswSwitchBgLeftRtl");
				rias.dom.addClass(this.leftNode.firstChild, "riaswSwitchTextLeftRtl");
				rias.dom.addClass(this.rightNode, "riaswSwitchBgRightRtl");
				rias.dom.addClass(this.rightNode.firstChild, "riaswSwitchTextRightRtl");
			}
		},
		postCreate: function(){
			this.on(this.focusNode, "click", "_onClick");
			this.on(this.focusNode, "keydown", "_onClick");
			this.on(this.focusNode, rias.touch.press, "onTouchStart");
		},
		_onDestroy: function(/*Boolean*/ preserveDom){
			if(this._timer){
				this._timer.remove();
				delete this._timer;
			}
			this.inherited(arguments);
			delete this.leftNode;
			delete this.rightNode;
			delete this.knobNode;
			delete this.inputNode;
			delete this.innerNode;
			delete this.focusNode;
		},
		startup: function(){
			var started = this._started;
			this.inherited(arguments);
			if(!started){
				this.resize();
			}
		},

		_createMaskImage: function(){
			if(this._timer){
				this._timer.remove();
				delete this._timer;
			}
			if(this._hasMaskImage){
				return;
			}
			var w = rias.dom.getStyle(this.domNode, "width"),
				h = rias.dom.getStyle(this.domNode, "height");
			this._width = (w - rias.dom.getStyle(this.knobNode, "width"));
			this._hasMaskImage = true;
			if(!(rias.has("mask-image"))){
				return;
			}
			var rDef = rias.dom.getStyle(this.leftNode, "borderTopLeftRadius");
			if(rDef === "0px"){
				return;
			}
			var rDefs = rDef.split(" "),
				rx = rias.dom.toPixelValue(this.leftNode, rDefs[0]),
				ry = (rDefs.length === 1) ? rx : rias.dom.toPixelValue(this.leftNode, rDefs[1]);

			//var id = (this.shape + "Mask" + w + h + rx + ry).replace(/\./,"_");

			_maskUtils.createRoundMask(this.focusNode, 0, 0, 0, 0, w, h, rx, ry, 1);
		},
		_resize: function(box){
			this.needResize = false;
			if(box){
				rias.dom.setMarginBox(this.domNode, box);
			}
			//if(rias.has("windows-theme")){
				// Override the custom CSS width (if any) to avoid misplacement.
				// Per design, the windows theme does not allow resizing the controls.
				// The label of the switch is placed next to the switch, and a custom
				// width would only have the effect to increase the distance between the
				// label and the switch, which is undesired. Hence, on windows theme,
				// ensure the width of root DOM node is 100%.
			//	rias.dom.setStyle(this.domNode, "width", "100%");
			//}else{
				var value = rias.dom.getStyle(this.domNode, "width");
				var outWidth = value + "px";
				var innWidth = (value - rias.dom.getStyle(this.knobNode, "width")) + "px";
				rias.dom.setStyle(this.leftNode, "width", outWidth);
				rias.dom.setStyle(this.rightNode, this.isLeftToRight() ? {
					width: outWidth,
					left: innWidth
				} : {
					width: outWidth
				});
				rias.dom.setStyle(this.leftNode.firstChild, "width", innWidth);
				rias.dom.setStyle(this.rightNode.firstChild, "width", innWidth);
				rias.dom.setStyle(this.knobNode, "left", innWidth);
				if(this.value === "off"){
					rias.dom.setStyle(this.innerNode, "left", this.isLeftToRight() ? ("-" + innWidth) : 0);
				}
				this._hasMaskImage = false;
				this._createMaskImage();
			//}
			return box;
		},

		_newState: function(newState){
			if(this.isLeftToRight()){
				return newState;
			}
			return (this.innerNode.offsetLeft < -(this._width/2)) ? "on" : "off";
		},
		_changeState: function(/*String*/state, /*Boolean*/anim){
			var on = (state === "on");
			this.leftNode.style.display = "";
			this.rightNode.style.display = "";
			this.innerNode.style.left = "";
			if(anim){
				rias.dom.addClass(this.focusNode, "riaswSwitchAnimation");
			}
			rias.dom.removeClass(this.focusNode, on ? "riaswSwitchOff" : "riaswSwitchOn");
			rias.dom.addClass(this.focusNode, on ? "riaswSwitchOn" : "riaswSwitchOff");
			rias.dom.setAttr(this.focusNode, "checked", on);
			rias.dom.setAttr(this.focusNode, "aria-checked", on ? "true" : "false"); //a11y
			this._set("checked", on);

			if (this.labelNode) {
				this.labelNode.innerHTML = on ? this.stateOnLabel : this.stateOffLabel;
			}
			//if(!on && !rias.has("windows-theme")){
			if(!on){
				this.innerNode.style.left  = (this.isLeftToRight() ? (-(rias.dom.getStyle(this.domNode, "width") - rias.dom.getStyle(this.knobNode, "width"))) : 0) + "px";
			}

			this._timer = this.defer(function(){
				this.leftNode.style.display = on ? "" : "none";
				this.rightNode.style.display = !on ? "" : "none";
				rias.dom.removeClass(this.focusNode, "riaswSwitchAnimation");
			}, anim ? 35 : 0);
		},
		_setValueAttr: function(/*String*/value, priorityChange){
			this._changeState(value, true);
			this.inherited(arguments);
		},
		_setCheckedAttr: function(/*Boolean*/ value, priorityChange){
			value = !!value;
			this._setValueAttr(value ? "on" : "off", priorityChange);
		},

		_onSetTextDir: function(textDir){
			this.inherited(arguments);
			this.applyTextDir(this.leftNode.firstChild);
			this.applyTextDir(this.rightNode.firstChild);
		},
		_setStateOnLabelAttr: function(/*String*/label){
			this.stateOnLabel = label;
			this.leftNode.firstChild.innerHTML = label;
		},
		_setStateOffLabelAttr: function(/*String*/label){
			this.stateOffLabel = label;
			this.rightNode.firstChild.innerHTML = label;
		},

		_onClick: function(e){
			// summary:
			//		Internal handler for click events.
			// tags:
			//		private
			/// readOnly 可以 click
			if(this.disabled || this.isBusy || this.readOnly){
				e.stopPropagation();
				e.preventDefault();
				return false;
			}
			if(e && e.type === "keydown" && e.keyCode !== rias.keys.SPACE){
				return;
			}
			///inherited 要检测 disabled，只能先 inherited 再 set("isBusy").
			if(this.onClick(e) === false){
				e.preventDefault();
			}
			if(!this._moved){
				this._setValueAttr(this.inputNode.value = (this.value === "on") ? "off" : "on", true);
			}
			return !e.defaultPrevented;
		},
		onClick: function(/*Event*/ /*===== e =====*/){
			// summary:
			//		User defined function to handle clicks
			// tags:
			//		callback
		},
		onTouchStart: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchStart events.
			if(this.disabled || this.isBusy || this.readOnly){
				e.stopPropagation();
				e.preventDefault();
				return false;
			}

			this._moved = false;
			this.innerStartX = this.innerNode.offsetLeft;
			if(!this._conn){
				this._conn = [
					this.on(this.innerNode, rias.touch.move, "onTouchMove"),
					this.on(rias.dom.doc, rias.touch.release, "onTouchEnd")
				];

				/* While moving the slider knobNode sometimes IE fires MSPointerCancel event. That prevents firing
				MSPointerUp event (http://msdn.microsoft.com/ru-ru/library/ie/hh846776%28v=vs.85%29.aspx) so the
				 knobNode can be stuck in the middle of the switch. As a fix we handle MSPointerCancel event with the
				same lintener as for MSPointerUp event.
				*/
				if(rias.has("windows-theme")){
					this._conn.push(this.on(rias.dom.doc, "MSPointerCancel", "onTouchEnd"));
				}
			}
			this.touchStartX = e.touches ? e.touches[0].pageX : e.clientX;
			this.leftNode.style.display = "";
			this.rightNode.style.display = "";
			this._createMaskImage();

			rias.stopEvent(e);
			return false;
		},
		onTouchMove: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchMove events.
			e.preventDefault();
			var dx;
			if(e.targetTouches){
				if(e.targetTouches.length !== 1){
					return;
				}
				dx = e.targetTouches[0].clientX - this.touchStartX;
			}else{
				dx = e.clientX - this.touchStartX;
			}
			var pos = this.innerStartX + dx;
			var d = 10;
			if(pos <= -(this._width - d)){
				pos = -this._width;
			}
			if(pos >= -d){
				pos = 0;
			}
			this.innerNode.style.left = pos + "px";
			if(Math.abs(dx) > d){
				this._moved = true;
			}
		},
		onTouchEnd: function(/*Event*/e){
			// summary:
			//		Internal function to handle touchEnd events.
			rias.forEach(this._conn, function(h){
				h.remove();
			});
			this._conn = null;
			if(this.innerStartX === this.innerNode.offsetLeft){
				// need to send a synthetic click?
				if(rias.has("touch") && rias.has("clicks-prevented")){
					rias.dom._sendClick(this.innerNode, e);
				}
				return;
			}
			var newState = (this.innerNode.offsetLeft < -(this._width / 2)) ? "off" : "on";
			newState = this._newState(newState);
			this._setValueAttr(newState, true);
		}

	});

	return Switch;
});
