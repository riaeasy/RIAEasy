//RIAStudio client runtime widget - Rating

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin"
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin) {

	//rias.loadThemeCss(["riasw/form/Rating.css"]);

	var riaswType = "riasw.form.Rating";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin], {
		// summary:
		//		A widget for rating using stars.

		/*=====
		 // required: Boolean
		 //		TODO: Can be true or false, default is false.
		 required: false,
		 =====*/

		templateString: null,
		baseClass: "riaswRating",

		// starCount: Integer|Float
		//		The number of stars to show, default is 3.
		starCount: 5,

		// value: Integer|Float
		//		The current value of the Rating
		value: 0,

		buildRendering: function(/*Object*/ params){
			// summary:
			//		Build the templateString. The number of stars is given by this.starCount,
			//		which is normally an attribute to the widget node.

			// The hidden value node is attached as "focusNode" because tabIndex, id, etc. are getting mapped there.
			var tpl =
				'<div class="dijitReset" data-dojo-attach-point="focusNode">' +
					'<input type="hidden" value="0" data-dojo-attach-point="valueNode" />' +
					'<div data-dojo-attach-point="list">' +
						'${stars}' +
					'</div>' +
				'</div>';
			// The value-attribute is used to "read" the value for processing in the widget class
			var starTpl = '<div class="dijitInline riaswRatingStar" value="${value}"></div>';
			var rendered = "";
			for(var i = 0; i < this.starCount; i++){
				rendered += rias.substitute(starTpl, {value: i + 1});
			}
			this.templateString = rias.substitute(tpl, {
				stars: rendered
			});

			this.inherited(arguments);
			this._starNodes = [];
			rias.dom.query(".riaswRatingStar", this.domNode).forEach(function(star, i){
				this._starNodes.push(star);
			}, this);
		},
		postCreate: function(){
			this.inherited(arguments);
			this._renderStars(this.value);
			this.own(
				// Fire when mouse is moved over one of the stars.
				rias.on(this.list, rias.on.selector(".riaswRatingStar", "mouseover"), rias.hitch(this, "_onMouse")),
				rias.on(this.list, rias.on.selector(".riaswRatingStar", "click"), rias.hitch(this, "onStarClick")),
				rias.on(this.list, rias.mouse.leave, rias.hitch(this, function(){
					// go from hover display back to dormant display
					this._renderStars(this.value);
				}))
			);
		},
		_onDestroy: function(){
			this.inherited(arguments);
			this._starNodes = [];
		},

		_renderStars: function(value, hover){
			// summary:
			//		Render the stars depending on the value.
			rias.dom.query(".riaswRatingStar", this.domNode).forEach(function(star, i){
				if(i + 1 > value){
					rias.dom.removeClass(star, "riaswRatingStarHover");
					rias.dom.removeClass(star, "riaswRatingStarChecked");
				}else{
					rias.dom.removeClass(star, "riaswRatingStar" + (hover ? "Checked" : "Hover"));
					rias.dom.addClass(star, "riaswRatingStar" + (hover ? "Hover" : "Checked"));
				}
			});
		},
		_setValueAttr: function(val){
			this.valueNode.value = val;		// reflect the value in our hidden field, for form submission
			this._set("value", val);
			this._renderStars(val);
			this.onChange(val); // Do I really have to call this by hand? :-(
		},

		onStarClick: function(/*Event*/ evt){
			// summary:
			//		Connect on this method to get noticed when a star was clicked.
			// example:
			//	|	connect(widget, "onStarClick", function(event){ ... })
			if(!this.get("disabled") && !this.get("readOnly")){
				var newVal = +rias.dom.getAttr(evt.target, "value");
				this.set("value", newVal === this.value ? 0 : newVal);
				this._renderStars(this.value);
				this.onChange(this.value); // Do I have to call this by hand?
			}
		},
		_onMouse: function(evt){
			// summary:
			//		Called when mouse is moved over one of the stars
			if(!this.get("disabled") && !this.get("readOnly")){
				var hoverValue = +rias.dom.getAttr(evt.target, "value");
				this._renderStars(hoverValue, true);
				this.onMouseOver(evt, hoverValue);
			}
		},
		onMouseOver: function(/*=====evt, value=====*/ ){
			// summary:
			//		Connect here, the value is passed to this function as the second parameter!
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"type": {
				"datatype": "string",
				"defaultValue": "text",
				"hidden": true
			},
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
			},
			"value": {
				"datatype": "number",
				"defaultValue": 0,
				"title": "Value"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"title": "Read Only"
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"hidden": true
			},
			"starCount": {
				"datatype": "number",
				"title": "Number of stars"
			}
		}
	};

	return Widget;

});