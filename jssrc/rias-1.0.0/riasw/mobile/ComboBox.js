
//RIAStudio client runtime widget - ComboBox

define([
	"rias",
	"rias/riasw/form/_AutoCompleterMixin",
	"rias/riasw/mobile/TextBox",
	"rias/riasw/mobile/_ComboBoxMenu",
	"rias/riasw/mobile/scrollable"
], function(rias, _AutoCompleterMixin, TextBox, _ComboBoxMenu){

	rias.theme.loadMobileThemeCss([
		"ComboBox.css"
	]);

	var riaswType = "rias.riasw.mobile.ComboBox";
	var Widget = rias.declare(riaswType, [TextBox, _AutoCompleterMixin], {
		// summary:
		//		A non-templated auto-completing text box widget.

		// dropDownClass: [protected extension] String
		//		Name of the drop-down widget class used to select a date/time.
		//		Should be specified by subclasses.
		dropDownClass: _ComboBoxMenu,

		// initially disable selection since iphone displays selection handles
		// that makes it hard to pick from the list

		// selectOnClick: Boolean
		//		Flag which enables the selection on click.
		selectOnClick: false,

		// autoComplete: Boolean
		//		Flag which enables the auto-completion.
		autoComplete: false,

		// dropDown: [protected] Widget
		//		The widget to display as a popup. This widget *must* be
		//		defined before the startup function is called.
		dropDown: null,

		// maxHeight: [protected] int
		//		The maximum height for the drop-down.
		//		Any drop-down taller than this value will have scrollbars.
		//		Set to -1 to limit the height to the available space in the viewport.
		maxHeight: -1,

		// dropDownPosition: [const] String[]
		//		This variable controls the position of the drop-down.
		//		It is an array of strings with the following values:
		//
		//		- before: places drop down to the left of the target node/widget, or to the right in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- after: places drop down to the right of the target node/widget, or to the left in
		//		  the case of RTL scripts like Hebrew and Arabic
		//		- above: drop down goes above target node
		//		- below: drop down goes below target node
		//
		//		The list is positions is tried, in order, until a position is found where the drop down fits
		//		within the viewport.
		dropDownPosition: ["below","above"],

		_throttleOpenClose: function(){
			// summary:
			//		Prevents the open/close in rapid succession.
			// tags:
			//		private
			if(this._throttleHandler){
				this._throttleHandler.remove();
			}
			this._throttleHandler = this.defer(function(){ this._throttleHandler = null; }, 500);
		},

		_onFocus: function(){
			// summary:
			//		Shows drop-down if the user is selecting Next/Previous from the virtual keyboard.
			// tags:
			//		private
			this.inherited(arguments);
			if(!this._opened && !this._throttleHandler){
				this._startSearchAll();
			}

			if(rias.has("windows-theme")) {
				this.domNode.blur();
			}
		},

		onInput: function(e){
			if(!e || e.charCode !== 0){ // #18047
				this._onKey(e);
				this.inherited(arguments);
			}
		},

		_setListAttr: function(v){
			// tags:
			//		private
			this._set('list', v); // needed for Firefox 4+ to prevent HTML5 mode
		},

		closeDropDown: function(){
			// summary:
			//		Closes the drop down on this widget
			// tags:
			//		protected

			this._throttleOpenClose();
			if(this.endHandler){
				this.disconnect(this.startHandler);
				this.disconnect(this.endHandler);
				this.disconnect(this.moveHandler);
				clearInterval(this.repositionTimer);
				this.repositionTimer = this.endHandler = null;
			}
			this.inherited(arguments);
			rias.dom.removeAttr(this.domNode, "aria-owns");
			rias.dom.setAttr(this.domNode, "aria-expanded", "false");
			rias.closePopup(this.dropDown);
			this._opened = false;

			// Remove disable attribute to make input element clickable after context menu closed
			if(rias.has("windows-theme") && this.domNode.disabled){
				this.defer(function(){
					this.domNode.removeAttribute("disabled");
				}, 300);
			}

		},

		openDropDown: function(){
			// summary:
			//		Opens the dropdown for this widget. To be called only when this.dropDown
			//		has been created and is ready to display (that is, its data is loaded).
			// returns:
			//		Returns the value of popup.open().
			// tags:
			//		protected

			var wasClosed = !this._opened;
			var dropDown = this.dropDown,
				ddNode = dropDown.domNode,
				aroundNode = this.domNode,
				self = this;

			rias.dom.setAttr(dropDown.domNode, "role", "listbox");
			rias.dom.setAttr(this.domNode, "aria-expanded", "true");
			if(dropDown.id){
				rias.dom.setAttr(this.domNode, "aria-owns", dropDown.id);
			}

			if(rias.has("touch") && (!rias.has("ios") || rias.has("ios") < 8)){
				rias.global.scrollBy(0, rias.dom.position(aroundNode, false).y); // don't call scrollIntoView since it messes up ScrollableView
			}

			// TODO: isn't maxHeight dependent on the return value from popup.open(),
			// i.e., dependent on how much space is available (BK)

			if(!this._preparedNode){
				this._preparedNode = true;
				// Check if we have explicitly set width and height on the dropdown widget dom node
				if(ddNode.style.width){
					this._explicitDDWidth = true;
				}
				if(ddNode.style.height){
					this._explicitDDHeight = true;
				}
			}

			// Code for resizing dropdown (height limitation, or increasing width to match my width)
			var myStyle = {
				display: "",
				overflow: "hidden",
				visibility: "hidden"
			};
			if(!this._explicitDDWidth){
				myStyle.width = "";
			}
			if(!this._explicitDDHeight){
				myStyle.height = "";
			}
			rias.dom.setStyle(ddNode, myStyle);

			// Figure out maximum height allowed (if there is a height restriction)
			var maxHeight = this.maxHeight;
			if(maxHeight == -1){
				// limit height to space available in viewport either above or below my domNode
				// (whichever side has more room)
				var viewport = rias.dom.getWindowBox(),
					position = rias.dom.position(aroundNode, false);
				maxHeight = Math.floor(Math.max(position.y, viewport.h - (position.y + position.h)));
			}

			// Attach dropDown to DOM and make make visibility:hidden rather than display:none
			// so we call startup() and also get the size
			rias.dom.moveOffScreen(dropDown);

			if(dropDown.startup && !dropDown._started){
				dropDown.startup(); // this has to be done after being added to the DOM
			}
			// Get size of drop down, and determine if vertical scroll bar needed
			var mb = rias.dom.position(this.dropDown.containerNode, false);
			var overHeight = (maxHeight && mb.h > maxHeight);
			if(overHeight){
				mb.h = maxHeight;
			}

			// Adjust dropdown width to match or be larger than my width
			mb.w = Math.max(mb.w, aroundNode.offsetWidth);
			rias.dom.setMarginBox(ddNode, mb);

			var retVal = rias.openPopup({
				parent: this,
				popup: dropDown,
				around: aroundNode,
				orient: rias.has("windows-theme") ? ["above"] : this.dropDownPosition,
				onExecute: function(){
					self.closeDropDown();
				},
				onCancel: function(){
					self.closeDropDown();
				},
				onClose: function(){
					self._opened = false;
				}
			});
			this._opened=true;

			if(wasClosed){
				var	isGesture = false,
					skipReposition = false,
					active = false,
					wrapper = dropDown.domNode.parentNode,
					aroundNodePos = rias.dom.position(aroundNode, false),
					popupPos = rias.dom.position(wrapper, false),
					deltaX = popupPos.x - aroundNodePos.x,
					deltaY = popupPos.y - aroundNodePos.y,
					startX = -1, startY = -1;

				// touchstart isn't really needed since touchmove implies touchstart, but
				// mousedown is needed since mousemove doesn't know if the left button is down or not
				this.startHandler = this.connect(rias.dom.doc.documentElement, rias.touch.press,
					function(e){
						skipReposition = true;
						active = true;
						isGesture = false;
						startX = e.clientX;
						startY = e.clientY;
					}
				);
				this.moveHandler = this.connect(rias.dom.doc.documentElement, rias.touch.move,
					function(e){
						skipReposition = true;
						if(e.touches){
							active = isGesture = true; // touchmove implies touchstart
						}else if(active && (e.clientX != startX || e.clientY != startY)){
							isGesture = true;
						}
					}
				);
				this.clickHandler = this.connect(dropDown.domNode, "onclick",
					function(){
						skipReposition = true;
						active = isGesture = false; // click implies no gesture movement
					}
				);
				this.endHandler = this.connect(rias.dom.doc.documentElement, rias.touch.release,
					function(){
						this.defer(function(){ // allow onclick to go first
							skipReposition = true;
							if(!isGesture && active){ // if click without move, then close dropdown
								this.closeDropDown();
							}
							active = false;
						});
					}
				);
				this.repositionTimer = setInterval(rias.hitch(this, function(){
					if(skipReposition){ // don't reposition if busy
						skipReposition = false;
						return;
					}
					var	currentAroundNodePos = rias.dom.position(aroundNode, false),
						currentPopupPos = rias.dom.position(wrapper, false),
						currentDeltaX = currentPopupPos.x - currentAroundNodePos.x,
						currentDeltaY = currentPopupPos.y - currentAroundNodePos.y;
					// if the popup is no longer placed correctly, relocate it
					if(Math.abs(currentDeltaX - deltaX) >= 1 || Math.abs(currentDeltaY - deltaY) >= 1){ // Firefox plays with partial pixels
						rias.dom.setStyle(wrapper, { left: parseInt(rias.dom.getStyle(wrapper, "left")) + deltaX - currentDeltaX + 'px', top: parseInt(rias.dom.getStyle(wrapper, "top")) + deltaY - currentDeltaY + 'px' });
					}
				}), 50); // yield a short time to allow for consolidation for better CPU throughput
			}

			// We need to disable input control in order to prevent opening the soft keyboard in IE
			if(rias.has("windows-theme")){
				this.domNode.setAttribute("disabled", true);
			}

			return retVal;
		},

		postCreate: function(){
			this.inherited(arguments);
			this.connect(this.domNode, "onclick", "_onClick");
			rias.dom.setAttr(this.domNode, "role", "combobox");
			rias.dom.setAttr(this.domNode, "aria-expanded", "false");
		},

		//修改
		destroy: function(){
			if(this.dropDown){
				rias.destroy(this.dropDown);
			}
			if(this.repositionTimer){
				clearInterval(this.repositionTimer);
			}
			this.inherited(arguments);
		},


		_onClick: function(/*Event*/ e){
			// tags:
			//		private

			// throttle clicks to prevent double click from doing double actions
			if(!this._throttleHandler){
				if(this.opened){
					this.closeDropDown();
				}else{
					this._startSearchAll();
				}
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswComboBoxIcon",
		iconClass16: "riaswComboBoxIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
