//RIAStudio client runtime widget - NumberSpinner

define([
	"riasw/riaswBase",
	"riasw/form/RangeBoundTextBox"
], function(rias, RangeBoundTextBox) {

	var keys = rias.keys,
		mouse = rias.mouse,
		typematic = rias.typematic;
	//rias.theme.loadThemeCss([
	//	"riasw/form/Spinner.css"
	//]);

	var riaswType = "riasw.form._Spinner";
	var Widget = rias.declare(riaswType, [RangeBoundTextBox], {

		// summary:
		//		Mixin for validation widgets with a spinner.
		// description:
		//		This class basically (conceptually) extends `riasw/form/ValidationTextBox`.
		//		It modifies the template to have up/down arrows, and provides related handling code.

		templateString:
			'<div class="dijitReset" id="widget_${id}" role="presentation">'+
				//'<div class="riaswTextBoxLabel" data-dojo-attach-point="labelNode" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="riaswTextBoxContainer" data-dojo-attach-point="containerNode,_aroundNode">'+
					'<span class="riaswSpinnerButtonContainer" data-dojo-attach-point="_dropDownContainer">'+
						'<span class="riaswArrowButton riaswUpArrowButton" data-dojo-attach-point="upArrowNode" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}></span>'+
						'<span class="riaswArrowButton riaswDownArrowButton" data-dojo-attach-point="downArrowNode" type="text" tabIndex="-1" readonly="readonly" role="button presentation" aria-hidden="true" ${_buttonInputDisabled}></span>'+
					'</span>'+
					'<span class="riaswValidationContainer" data-dojo-attach-point="validationNode">'+
						//'<input class="riaswValidationIcon riaswValidationInner" value="&#935;" type="text" tabIndex="-1" readonly="readonly" role="presentation"/>'+
					'</span>'+
					'<span class="riaswInputContainer">'+
						'<input class="riaswInputInner" data-dojo-attach-point="textbox,focusNode" type="${type}" data-dojo-attach-event="onkeydown:_onKeyDown" role="spinbutton" autocomplete="off" ${!nameAttrSetting}/>'+
					'</span>'+
				'</div>'+
			'</div>',

		baseClass: "riaswTextBox riaswSpinner",
		cssStateNodes: {
			"upArrowNode": "riaswArrowButton",
			"downArrowNode": "riaswArrowButton"
		},

		// defaultTimeout: Number
		//		Number of milliseconds before a held arrow key or up/down button becomes typematic
		defaultTimeout: 500,

		// minimumTimeout: Number
		//		minimum number of milliseconds that typematic event fires when held key or button is held
		minimumTimeout: 10,

		// timeoutChangeRate: Number
		//		Fraction of time used to change the typematic timer between events.
		//		1.0 means that each typematic event fires at defaultTimeout intervals.
		//		Less than 1.0 means that each typematic event fires at an increasing faster rate.
		timeoutChangeRate: 0.90,

		// smallDelta: Number
		//		Adjust the value by this much when spinning using the arrow keys/buttons
		smallDelta: 1,

		// largeDelta: Number
		//		Adjust the value by this much when spinning using the PgUp/Dn keys
		largeDelta: 10,

		adjust: function(val /*=====, delta =====*/){
			// summary:
			//		Overridable function used to adjust a primitive value(Number/Date/...) by the delta amount specified.
			//		The val is adjusted in a way that makes sense to the object type.
			// val: Object
			// delta: Number
			// tags:
			//		protected extension
			return val;
		},

		_arrowPressed: function(/*Node*/ nodePressed, /*Number*/ direction, /*Number*/ increment){
			// summary:
			//		Handler for arrow button or arrow key being pressed
			if(this.disabled || this.readOnly){
				return;
			}
			this.set("value", this.adjust(this.get('value'), direction * increment), false);
			rias.dom.selectInputText(this.textbox, this.textbox.value.length);
		},

		_arrowReleased: function(/*Node*/ /*===== node =====*/){
			// summary:
			//		Handler for arrow button or arrow key being released
			this._wheelTimer = null;
		},

		_typematicCallback: function(/*Number*/ count, /*DOMNode*/ node, /*Event*/ evt){
			var inc = this.smallDelta;
			if(node === this.textbox){
				var key = evt.keyCode;
				inc = (key === keys.PAGE_UP || key === keys.PAGE_DOWN) ? this.largeDelta : this.smallDelta;
				node = (key === keys.UP_ARROW || key === keys.PAGE_UP) ? this.upArrowNode : this.downArrowNode;
			}
			if(count === -1){
				this._arrowReleased(node);
			}
			else{
				this._arrowPressed(node, (node === this.upArrowNode) ? 1 : -1, inc);
			}
		},

		_wheelTimer: null,
		_mouseWheeled: function(/*Event*/ evt){
			// summary:
			//		Mouse wheel listener where supported

			if(!this.focused){
				// If use is scrolling over page and we happen to get the mouse wheel event, just ignore it.
				return;
			}

			evt.stopPropagation();
			evt.preventDefault();
			// FIXME: Safari bubbles

			// be nice to DOH and scroll as much as the event says to
			var wheelDelta = evt.wheelDelta / 120;
			if(Math.floor(wheelDelta) !== wheelDelta){
				// If not an int multiple of 120, then its touchpad scrolling.
				// This can change very fast so just assume 1 wheel click to make it more manageable.
				wheelDelta = evt.wheelDelta > 0 ? 1 : -1;
			}
			var scrollAmount = evt.detail ? (evt.detail * -1) : wheelDelta;
			if(scrollAmount !== 0){
				var node = this[(scrollAmount > 0 ? "upArrowNode" : "downArrowNode" )];

				this._arrowPressed(node, scrollAmount, this.smallDelta);

				if(this._wheelTimer){
					this._wheelTimer.remove();
				}
				this._wheelTimer = this.defer(function(){
					this._arrowReleased(node);
				}, 50);
			}
		},

		_setConstraintsAttr: function(/*Object*/ constraints){
			this.inherited(arguments);
			if(this.focusNode){ // not set when called from postMixInProperties
				if(this.constraints.min !== undefined){
					this.focusNode.setAttribute("aria-valuemin", this.constraints.min);
				}else{
					this.focusNode.removeAttribute("aria-valuemin");
				}
				if(this.constraints.max !== undefined){
					this.focusNode.setAttribute("aria-valuemax", this.constraints.max);
				}else{
					this.focusNode.removeAttribute("aria-valuemax");
				}
			}
		},

		_setValueAttr: function(/*Number*/ value, /*Boolean?*/ priorityChange){
			// summary:
			//		Hook so set('value', ...) works.

			this.focusNode.setAttribute("aria-valuenow", value);
			this.inherited(arguments);
		},

		postCreate: function(){
			this.inherited(arguments);

			// extra listeners
			this.own(
				rias.on(this.domNode, mouse.wheel, rias.hitch(this, "_mouseWheeled")),
				typematic.addListener(this.upArrowNode, this.textbox, {keyCode: keys.UP_ARROW, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout),
				typematic.addListener(this.downArrowNode, this.textbox, {keyCode: keys.DOWN_ARROW, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout),
				typematic.addListener(this.upArrowNode, this.textbox, {keyCode: keys.PAGE_UP, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout),
				typematic.addListener(this.downArrowNode, this.textbox, {keyCode: keys.PAGE_DOWN, ctrlKey: false, altKey: false, shiftKey: false, metaKey: false}, this, "_typematicCallback", this.timeoutChangeRate, this.defaultTimeout, this.minimumTimeout)
			);
		}

	});

	return Widget;

});