//RIAStudio client runtime widget - PopupMenuItem

define([
	"rias",
	"dijit/PopupMenuItem"
], function(rias, _Widget) {

	rias.theme.loadRiasCss([
		"widget/Menu.css"
	]);

	_Widget.extend({
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
		_linkPopup: function(){
			if(this._popup){
				this.ownerDocumentBody.appendChild(this._popup.domNode);
				this._popup.domNode.setAttribute("aria-labelledby", this.containerNode.id);
				this._popup.startup();
				this._popup.domNode.style.display="none";
			}
		},

		_fillContent: function(){
			if(!this.dropDownContainer){
				if(this.srcNodeRef){
					var nodes = query("*", this.srcNodeRef);
					this.inherited(arguments, [nodes[0]]);
					this.dropDownContainer = this.srcNodeRef;
				}
			}
		},
		_openPopup: function(/*Object*/ params, /*Boolean*/ focus){
			var popup = this._popup;

			rias.openPopup(rias.delegate(params, {
				popup: popup,
				around: this.domNode
			}));

			if(focus && popup.focus){
				popup.focus();
			}
		},

		_closePopup: function(){
			rias.closePopup(this._popup);
			if(this._popup){
				this._popup.parentMenu = null;
			}
		},

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

		destroyDescendants: function(/*Boolean*/ preserveDom){
			if(this._popup){
				// Destroy the popup, unless it's already been destroyed.  This can happen because
				// the popup is a direct child of <body> even though it's logically my child.
				if(!this._popup._destroyed){
					this._popup.destroyRecursive(preserveDom);
				}
				delete this._popup;
			}
			this.inherited(arguments);
		}
	});

	var riasType = "rias.riasw.widget.PopupMenuItem";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPopupMenuItemIcon",
		iconClass16: "riaswPopupMenuItemIcon16",
		defaultParams: {
			//content: "<span></span>",
			label: "PopupMenuItem"
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