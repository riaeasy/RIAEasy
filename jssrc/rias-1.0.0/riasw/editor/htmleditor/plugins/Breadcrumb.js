define([
	"rias",
	"../_Plugin",
	"../range",
	"rias/riasw/form/ComboButton",
	"rias/riasw/widget/Menu",
	"rias/riasw/widget/MenuItem",
	"rias/riasw/widget/MenuSeparator",
	"rias/riasw/widget/Toolbar",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_Contained",
	"dojo/i18n!./nls/Breadcrumb"
], function(rias, _Plugin, rangeapi, ComboButton, Menu, MenuItem, MenuSeparator, Toolbar, _Widget, _TemplatedMixin, _Contained) {

	//rias.experimental("dojox.editor.plugins.Breadcrumb");
	var pluginsName = "rias.riasw.editor.htmleditor.plugins";

	var BreadcrumbMenuTitle = rias.declare(pluginsName + "._BreadcrumbMenuTitle", [_Widget, _TemplatedMixin, _Contained],{
		// summary:
		//		Simple internal, non-clickable, menu entry to act as a menu title bar.
		templateString: "<tr class='riaswMenuCaption'><td dojoAttachPoint=\"title\" colspan=\"4\" class=\"dijitToolbar\" style=\"font-weight: bold; padding: 3px;\"></td></tr>",

		menuTitle: "",

		postCreate: function(){
			rias.dom.setSelectable(this.domNode, false);
			var label = this.id + "_text";
			this.domNode.setAttribute("aria-labelledby", label);
		},

		_setMenuTitleAttr: function(str){
			this.title.innerHTML = str;
		},
		_getMenuTitleAttr: function(str){
			return this.title.innerHTML;
		},

		_setSelected: function(selected){
		},
		isFocusable: function(){
			return false; // Boolean
		}
	});


	var Breadcrumb = rias.declare(pluginsName + ".Breadcrumb", _Plugin, {
		// summary:
		//		This plugin provides Breadcrumb capability to the editor. As you move
		//		around the editor, it updates with your current indention depth.

		// _menu: [private] Object
		//		The popup menu that is displayed.
		_menu: null,

		// breadcrumbBar: [protected] dijit/Toolbar
		//		The toolbar containing the breadcrumb.
		breadcrumbBar: null,

		setEditor: function(editor){
			// summary:
			//		Over-ride for the setting of the editor.
			// editor: Object
			//		The editor to configure for this plugin to use.
			this.editor = editor;
			this._buttons = [];
			this.breadcrumbBar = new Toolbar({
				ownerRiasw: this
			});

			var strings = rias.i18n.getLocalization(pluginsName, "Breadcrumb");
			this._titleTemplate = strings.nodeActions;

			rias.dom.place(this.breadcrumbBar.domNode, editor.footer);
			var self = this;
			editor.onLoadDeferred.then(function(){
				self._menu = new Menu({
					ownerRiasw: self
				});
				rias.dom.addClass(self.breadcrumbBar.domNode, "dojoxEditorBreadcrumbArrow");
				var body = new ComboButton({
					ownerRiasw: self,
					showLabel: true,
					label: "body",
					tooltip: "body",
					_selNode: editor.editNode,
					dropDown: self._menu,
					onClick: function(){
						self._menuTarget = editor.editNode;
						self._selectContents();
					}
				});

				// Build the menu
				self._menuTitle = new BreadcrumbMenuTitle({ownerRiasw: self, menuTitle: strings.nodeActions});
				self._selCMenu = new MenuItem({ownerRiasw: self, label: strings.selectContents, onClick: rias.hitch(self, self._selectContents)});
				self._delCMenu = new MenuItem({ownerRiasw: self, label: strings.deleteContents, onClick: rias.hitch(self, self._deleteContents)});
				self._selEMenu = new MenuItem({ownerRiasw: self, label: strings.selectElement, onClick: rias.hitch(self, self._selectElement)});
				self._delEMenu = new MenuItem({ownerRiasw: self, label: strings.deleteElement, onClick: rias.hitch(self, self._deleteElement)});
				self._moveSMenu = new MenuItem({ownerRiasw: self, label: strings.moveStart, onClick: rias.hitch(self, self._moveCToStart)});
				self._moveEMenu = new MenuItem({ownerRiasw: self, label: strings.moveEnd, onClick: rias.hitch(self, self._moveCToEnd)});

				self._menu.addChild(self._menuTitle);
				self._menu.addChild(self._selCMenu);
				self._menu.addChild(self._delCMenu);
				self._menu.addChild(new MenuSeparator({ownerRiasw: self}));
				self._menu.addChild(self._selEMenu);
				self._menu.addChild(self._delEMenu);
				self._menu.addChild(new MenuSeparator({ownerRiasw: self}));
				self._menu.addChild(self._moveSMenu);
				self._menu.addChild(self._moveEMenu);

				body._ddConnect = rias.connect(body, "openDropDown", function(){
					self._menuTarget = body._selNode;
					self._menuTitle.set("menuTitle", rias.substitute(self._titleTemplate,{
						"nodeName": "&lt;body&gt;"
					}));
					self._selEMenu.set("disabled", true);
					self._delEMenu.set("disabled", true);
					self._selCMenu.set("disabled", false);
					self._delCMenu.set("disabled", false);
					self._moveSMenu.set("disabled", false);
					self._moveEMenu.set("disabled", false);
				});
				self.breadcrumbBar.addChild(body);
				//self.connect(self.editor, "onNormalizedDisplayChanged", "updateState");
				self.subscribe(editor.id + "_normalizedDisplayChanged", function(){
					self.updateState();
				});
			});
			self.breadcrumbBar.startup();
			if(rias.has("ie")){
				// Sometimes IE will mess up layout and needs to be poked.
				setTimeout(function(){
					self.breadcrumbBar.domNode.className = self.breadcrumbBar.domNode.className;
				}, 100);
			}
		},

		_selectContents: function(){
			// summary:
			//		Internal function for selecting the contents of a node.
			this.editor.focus();
			if(this._menuTarget){
				var nodeName = this._menuTarget.tagName.toLowerCase();
				switch(nodeName){
					case 'br':
					case 'hr':
					case 'img':
					case 'input':
					case 'base':
					case 'meta':
					case 'area':
					case 'basefont':
						break;
					default:
						try{
							this.editor._sCall("collapse", [null]);
							this.editor._sCall("selectElementChildren", [this._menuTarget]);
							this.editor.onDisplayChanged();
						}catch(e){/*squelch*/}
				}
			}
		},

		_deleteContents: function(){
			// summary:
			//		Internal function for selecting the contents of a node.
			if(this._menuTarget){
				this.editor.beginEditing();
				this._selectContents();
				this.editor._sCall("remove", [this._menuTarget]);
				this.editor.endEditing();
				this._updateBreadcrumb();
				this.editor.onDisplayChanged();
			}
		},

		_selectElement: function(){
			// summary:
			//		Internal function for selecting the contents of a node.
			this.editor.focus();
			if(this._menuTarget){
				this.editor._sCall("collapse", [null]);
				this.editor._sCall("selectElement", [this._menuTarget]);
				this.editor.onDisplayChanged();

			}
		},

		_deleteElement: function(){
			// summary:
			//		Internal function for selecting the contents of a node.
			if(this._menuTarget){
				this.editor.beginEditing();
				this._selectElement();
				this.editor._sCall("remove", [this._menuTarget]);
				this.editor.endEditing();
				this._updateBreadcrumb();
				this.editor.onDisplayChanged();
			}
		},

		_moveCToStart: function(){
			// summary:
			//		Internal function for selecting the contents of a node.
			this.editor.focus();
			if(this._menuTarget){
				this._selectContents();
				this.editor._sCall("collapse", [true]);
			}
		},

		_moveCToEnd: function(){
			// summary:
			//		Internal function for selecting the contents of a node.
			this.editor.focus();
			if(this._menuTarget){
				this._selectContents();
				this.editor._sCall("collapse", [false]);
			}
		},

		_updateBreadcrumb: function(){
			// summary:
			//		Function to trigger updating of the breadcrumb
			// tags:
			//		private
			var ed = this.editor;
			if(ed.window){
				var sel = rangeapi.getSelection(ed.window);
				if(sel && sel.rangeCount > 0){
					var range = sel.getRangeAt(0);

					// Check the getSelectedElement call.  Needed when dealing with img tags.
					var node = ed._sCall("getSelectedElement", []) || range.startContainer;
					//var node = range.startContainer;
					var bcList = [];

					// Make sure we get a selection within the editor document,
					// have seen cases on IE where this wasn't true.
					if(node && node.ownerDocument === ed.document){
						while(node && node !== ed.editNode && node != ed.document.body && node != ed.document){
							if(node.nodeType === 1){
								bcList.push({type: node.tagName.toLowerCase(), node: node});
							}
							node = node.parentNode;
						}
						bcList = bcList.reverse();

						while(this._buttons.length){
							var db = this._buttons.pop();
							rias.disconnect(db._ddConnect);
							this.breadcrumbBar.removeChild(db);
						}
						this._buttons = [];

						var i;
						var self = this;
						for(i = 0; i < bcList.length; i++){
							var bc = bcList[i];
							var b = new ComboButton({
								ownerRiasw: self,
								showLabel: true,
								label: bc.type,
								_selNode: bc.node,
								dropDown: this._menu,
								onClick: function(){
									self._menuTarget = this._selNode;
									self._selectContents();
								}
							});
							b._ddConnect = rias.connect(b, "openDropDown", function(){
								self._menuTarget = b._selNode;
								var nodeName = self._menuTarget.tagName.toLowerCase();
								var title = rias.substitute(self._titleTemplate,{
									"nodeName": "&lt;" + nodeName + "&gt;"
								});
								self._menuTitle.set("menuTitle", title);
								switch(nodeName){
									case 'br':
									case 'hr':
									case 'img':
									case 'input':
									case 'base':
									case 'meta':
									case 'area':
									case 'basefont':
										self._selCMenu.set("disabled", true);
										self._delCMenu.set("disabled", true);
										self._moveSMenu.set("disabled", true);
										self._moveEMenu.set("disabled", true);
										self._selEMenu.set("disabled", false);
										self._delEMenu.set("disabled", false);
										break;
									default:
										self._selCMenu.set("disabled", false);
										self._delCMenu.set("disabled", false);
										self._selEMenu.set("disabled", false);
										self._delEMenu.set("disabled", false);
										self._moveSMenu.set("disabled", false);
										self._moveEMenu.set("disabled", false);
								}
							});
							this._buttons.push(b);
							this.breadcrumbBar.addChild(b);
						}
						if(rias.has("ie")){
							// Prod it to fix layout.
							this.breadcrumbBar.domNode.className = this.breadcrumbBar.domNode.className;
						}

					}
				}
			}
		},

		updateState: function(){
			// summary:
			//		Over-ride of updateState to hide the toolbar when the iframe is not visible.
			//		Also triggers the breadcrumb update.
			if(rias.dom.getStyle(this.editor.iframe, "display") === "none" || this.get("disabled")){
				rias.dom.setStyle(this.breadcrumbBar.domNode, "display", "none");
			}else{
				if(rias.dom.getStyle(this.breadcrumbBar.domNode, "display") === "none"){
					rias.dom.setStyle(this.breadcrumbBar.domNode, "display", "block");
				}
				this._updateBreadcrumb();

				// Some themes do padding, so we have to resize again after display.
				var size = rias.dom.getMarginBox(this.editor.domNode);
				this.editor.resize({h: size.h});
			}
		},

		destroy: function(){
			// summary:
			//		Over-ride to clean up the breadcrumb toolbar.
			if(this.breadcrumbBar){
				this.breadcrumbBar.destroyRecursive();
				this.breadcrumbBar = null;
			}
			if(this._menu){
				this._menu.destroyRecursive();
				delete this._menu;
			}
			this._buttons = null;
			delete this.editor.breadcrumbBar;
			this.inherited(arguments);
		}
	});

// For monkey patching
	Breadcrumb._BreadcrumbMenuTitle = BreadcrumbMenuTitle;

// Register this plugin.
	_Plugin.registry["breadcrumb"] = _Plugin.registry["breadcrumb"] = function(args){
		return new Breadcrumb(args);
	};

	return Breadcrumb;

});
