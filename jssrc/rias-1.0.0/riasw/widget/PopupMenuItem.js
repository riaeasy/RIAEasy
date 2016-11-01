//RIAStudio client runtime widget - PopupMenuItem

define([
	"rias",
	"rias/riasw/widget/MenuItem"
], function(rias, MenuItem) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Menu.css"
	//]);

	var riaswType = "rias.riasw.widget.PopupMenuItem";
	var Widget = rias.declare(riaswType, [MenuItem], {
		// summary:
		//		An item in a Menu that spawn a drop down (usually a drop down menu)

		baseClass: "dijitMenuItem dijitPopupMenuItem",

		//修改
		destroyDescendants: function(/*Boolean*/ preserveDom){
			if(this._popup){
				// Destroy the popup, unless it's already been destroyed.  This can happen because
				// the popup is a direct child of <body> even though it's logically my child.
				if(!this._popup._destroyed){
					this._popup.destroyRecursive(preserveDom);
				}
				this._popup = undefined;
			}
			this.inherited(arguments);
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

		//增加
		_setPopupAttr: function(value){
			if(this._popup != value){
				if(this._popup){
					this._closePopup();
					this._popup.domNode.style.display="none";
					this.ownerDocumentBody.removeChild(this._popup.domNode);
				}
				this._popup = value;
				if(this._started && this._popup){
					this._linkPopup();
				}
			}
			this._set("popup", value);
		},
		//增加
		_linkPopup: function(){
			if(this._popup){
				this.ownerDocumentBody.appendChild(this._popup.domNode);
				this._popup.domNode.setAttribute("aria-labelledby", this.containerNode.id);
				this._popup.startup();
				this._popup.domNode.style.display="none";
			}
		},
		//修改
		_openPopup: function(/*Object*/ params, /*Boolean*/ focus){
			var popup = this._popup;

			rias.dom.openPopup(rias.delegate(params, {
				popup: popup,
				around: this.domNode
			}));

			if(focus && popup.focus){
				popup.focus();
			}
		},
		//修改
		_closePopup: function(){
			rias.dom.closePopup(this._popup);
			if(this._popup){
				this._popup.parentMenu = null;
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPopupMenuItemIcon",
		iconClass16: "riaswPopupMenuItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			//label: "PopupMenuItem"
		},
		initialSize: {},
		resizable: "none",
		allowedParent: "rias.riasw.Menu, dijit.Menu",
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