//RIAStudio client runtime widget - PopupMenuItem

define([
	"riasw/riaswBase",
	"riasw/sys/MenuItem",
	"riasw/sys/Menu"
], function(rias, MenuItem, Menu) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Menu.css"
	//]);

	var riaswType = "riasw.sys.PopupMenuItem";
	var Widget = rias.declare(riaswType, [MenuItem], {
		// summary:
		//		An item in a Menu that spawn a drop down (usually a drop down menu)

		baseClass: "riaswMenuItem riaswPopupMenuItem",

		//修改
		_fillContent: function(){
			if(!this.dropDownContainer){
				if(this.srcNodeRef){
					var nodes = rias.dom.query("*", this.srcNodeRef);
					this.inherited(arguments, [nodes[0]]);
					this.dropDownContainer = this.srcNodeRef;
				}
			}
		},
		//修改
		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);

			// We didn't copy the dropdown widget from the this.srcNodeRef, so it's in no-man's
			// land now.  Move it to <body>.
			if(!this._popup && this.dropDownContainer){
				var node = rias.dom.query("[widgetId]", this.dropDownContainer)[0];
				this._popup = rias.by(node);
			}
			this._linkPopup();
			if(this.arrowWrapper){
				rias.dom.setStyle(this.arrowWrapper, "visibility", "");
			}
			this.focusNode.setAttribute("aria-haspopup", "true");
		},

		//增加
		_setPopupAttr: function(value){
			if(this._popup !== value){
				if(this._popup){
					this._hidePopup();
					this._popup.domNode.style.display = "none";
					this.ownerDocumentBody.removeChild(this._popup.domNode);
				}
				if(rias.isRiaswParam(value)){
					if(!value.ownerRiasw){
						value.ownerRiasw = this;
					}
					value = rias.newRiasw(value);
				}
				if(rias.is(value, Menu)){
					if(!value.getOwnerRiasw()){
						value.setOwnerRiasw(this);
					}
				}else{
					value = undefined;
				}
				this._set("popup", value);
				if(this._started && this._popup){
					this._linkPopup();
				}
			}
		},
		//增加
		_linkPopup: function(){
			if(this._popup){
				this.ownerDocumentBody.appendChild(this._popup.domNode);
				this._popup.domNode.setAttribute("aria-labelledby", this.containerNode.id);
				this._popup.startup();
				this._popup.domNode.style.display = "none";
			}
		},
		//修改
		_openPopup: function(/*Object*/ params, /*Boolean*/ focus){
			var popup = this._popup;

			rias.popupManager.popup(rias.mixinDeep({}, params, {
				popup: popup,
				popupOwner: this,
				around: this.domNode
			}));

			if(focus && popup.focus){
				popup.focus();
			}
		},
		//修改
		_hidePopup: function(){
			rias.popupManager.hide(this._popup);
			if(this._popup){
				this._popup.parentMenu = null;
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		allowedParent: "riasw.sys.Menu",
		allowedChild: "",
		"property": {
			"label": {
				"datatype": "string",
				"title": "Label"
			},
			"popup": {
				"datatype": "object",
				"title": "Popup"
			},
			"iconClass": {
				"datatype": "string",
				"title": "Icon Class"
			},
			"accelKey": {
				"datatype": "string",
				"title": "Shortcut Key"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			}
		}
	};

	return Widget;

});