
//RIAStudio client runtime widget - Button

define([
	"rias",
	"dijit/_WidgetBase",
	"dijit/form/_FormWidgetMixin",
	"rias/riasw/form/_ButtonMixin",
	"rias/riasw/mobile/BaseMixin"
], function(rias, _WidgetBase, _FormWidgetMixin, _ButtonMixin, BaseMixin){

	rias.theme.loadMobileThemeCss([
		"Button.css"
	]);

	var riaswType = "rias.riasw.mobile.Button";
	var Widget = rias.declare(riaswType, [_WidgetBase, _FormWidgetMixin, _ButtonMixin, BaseMixin], {
		// summary:
		//		Non-templated BUTTON widget with a thin API wrapper for click
		//		events and for setting the label.
		//
		//		Buttons can display a label, an icon, or both.
		//		A label should always be specified (through innerHTML) or the label
		//		attribute.  It can be hidden via showLabel=false.
		// example:
		//	|	<button data-dojo-type="dojox/mobile/Button" onClick="...">Hello world</button>

		// baseClass: String
		//		The name of the CSS class of this widget.
		baseClass: "mblButton",

		// _setTypeAttr: [private] Function
		//		Overrides the automatic assignment of type to nodes, because it causes
		//		exception on IE. Instead, the type must be specified as this.type
		//		when the node is created, as part of the original DOM.
		_setTypeAttr: null,

		/*=====
		 // label: String
		 //		The label of the button.
		 label: "",
		 =====*/


		isFocusable: function(){
			// Override of the method of dijit/_WidgetBase.
			return false;
		},

		buildRendering: function(){
			if(!this.srcNodeRef){
				this.srcNodeRef = rias.dom.create("button", {"type": this.type});
			}else if(this._cv){
				var n = this.srcNodeRef.firstChild;
				if(n && n.nodeType === 3){
					n.nodeValue = this._cv(n.nodeValue);
				}
			}
			this.inherited(arguments);
			this.focusNode = this.labelNode = this.domNode;
		},

		postCreate: function(){
			this.inherited(arguments);

			// we need to ensure the synthetic click is emitted by
			// touch.doClicks even if we moved (inside or outside) before we
			// released in the button area.
			this.domNode.dojoClick = "useTarget";
			// handle touch.press event
			var _this = this;
			this.on(rias.touch.press, function(e){
				e.preventDefault();

				if(_this.domNode.disabled){return;}
				_this._press(true);

				// change button state depending on where we are
				var isFirstMoveDone = false;
				_this._moveh = rias.on(rias.dom.doc, rias.touch.move, function(e){
					if(!isFirstMoveDone){
						// #17220: preventDefault may not have any effect.
						// causing minor impact on some android
						// (Galaxy Tab 2 with stock browser 4.1.1) where button
						// display does not reflect the actual button state
						// when user moves back and forth from the button area.
						e.preventDefault();
						isFirstMoveDone = true;
					}
					_this._press(rias.dom.isDescendant(e.target, _this.domNode));
				});

				// handle touch.release
				_this._endh = rias.on(rias.dom.doc, rias.touch.release, function(e){
					_this._press(false);
					_this._moveh.remove();
					_this._endh.remove();
				});
			});

			this.common.setSelectable(this.focusNode, false);
			this.connect(this.domNode, "onclick", "_onClick");
		},

		_press: function(pressed){
			// tags:
			//		private
			if(pressed != this._pressed){
				this._pressed = pressed;
				var button = this.focusNode || this.domNode;
				var newStateClasses = (this.baseClass + ' ' + this["class"]).split(" ");
				newStateClasses = rias.map(newStateClasses, function(c){
					return c + "Selected";
				});
				rias.dom.toggleClass(button, newStateClasses, pressed);
			}
		},

		_setLabelAttr: function(/*String*/ content){
			// tags:
			//		private
			this.inherited(arguments, [this._cv ? this._cv(content) : content]);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswButtonIcon",
		iconClass16: "riaswButtonIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
