define([
	"riasw/riaswBase",
	"../_Plugin",
	"../range",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/Dialog",
	"riasw/form/Button",
	"riasw/form/TextBox",
	"riasw/form/FilteringSelect",
	"riasw/form/ColorPalette",
	"riasw/form/ColorPicker",
	"riasw/sys/Menu",
	"riasw/sys/MenuItem",
	"riasw/sys/MenuSeparator",
	"dojo/text!./TablePlugins/insertTable.html",
	"dojo/text!./TablePlugins/modifyTable.html",
	"dojo/i18n!./nls/TableDialog"
], function(rias, _Plugin, rangapi, _WidgetBase, _TemplatedMixin,
	Dialog, Button, TextBox, FilteringSelect, ColorPalette, ColorPicker, Menu, MenuItem, MenuSeparator,
	insertTableTemplate, modifyTableTemplate, tableDialogStrings) {

// TODO:	Currently not supporting merging or splitting cells
// FIXME:	Undo is very buggy, and therefore unimplemented in all browsers except IE - which itself has only been lightly tested.
// FIXME:	Selecting multiple table cells in Firefox looks to be impossible.
//			This affect the 'colorTableCell' plugin. Cells can still be
//			colored individually or in rows.
	//rias.experimental("dojox.editor.plugins.TablePlugins");
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var TableHandler = rias.declare(_Plugin, {
		// summary:
		//		A global object that handles common tasks for all the plugins. Since
		//		there are several plugins that are all calling common methods, it's preferable
		//		that they call a centralized location that either has a set variable or a
		//		timeout to only repeat code-heavy calls when necessary.
		//
		tablesConnected:false,
		currentlyAvailable: false,
		alwaysAvailable:false,
		availableCurrentlySet:false,
		initialized:false,
		tableData: null,
		shiftKeyDown:false,
		editorDomNode: null,
		undoEnabled: true, //Using custom undo for all browsers.
		refCount: 0,

		doMixins: function(){

			rias.mixin(this.editor,{
				getAncestorElement: function(tagName){
					return this._sCall("getAncestorElement", [tagName]);
				},
				hasAncestorElement: function(tagName){
					return this._sCall("hasAncestorElement", [tagName]);
				},
				selectElement: function(elem){
					this._sCall("selectElement", [elem]);
				},
				byId: function(id){
					return rias.dom.byId(id, this.document);
				},
				query: function(arg, scope, returnFirstOnly){
					// this shortcut is dubious - not sure scoping is necessary
					var ar = rias.dom.query(arg, scope || this.document);
					return (returnFirstOnly) ? ar[0] : ar;
				}
			});

		},
		initialize: function(editor){
			// summary:
			//		Initialize the global handler upon a plugin's first instance of setEditor
			//

			// All plugins will attempt initialization. We only need to do so once.
			// But keep track so that it is cleaned up when all usage of it for an editor has
			// been removed.
			this.refCount++;

			// Turn on custom undo for all.
			editor.customUndo = true;

			if(this.initialized){ return; }

			this.initialized = true;
			this.editor = editor;

			this.editor._tablePluginHandler = this;

			//Editor loads async, can't assume doc is ready yet.  So, use the deferred of the
			//editor to init at the right time.
			editor.onLoadDeferred.then(rias.hitch(this, function(){
				this.editorDomNode = this.editor.editNode || this.editor.iframe.document.body.firstChild;

				// RichText should have a mouseup connection to recognize drag-selections
				// Example would be selecting multiple table cells
				this._myListeners = [
					this.on(this.editorDomNode , "mouseup", rias.hitch(this.editor, "onClick")),
					this.on(this.editor, "onDisplayChanged", "checkAvailable"),
					this.on(this.editor, "onBlur", "checkAvailable"),
					this.on(this.editor, "_saveSelection", function(){
						// because on IE, the selection is lost when the iframe goes out of focus
						this._savedTableInfo = this.getTableInfo();
					}),
					this.on(this.editor, "_restoreSelection", function(){
						delete this._savedTableInfo;
					})
				];
				this.doMixins();
				this.connectDraggable();
			}));
		},

		getTableInfo: function(forceNewData){
			// summary:
			//		Gets the table in focus
			//		Collects info on the table - see return params
			//

			if(this._savedTableInfo){
				// Avoid trying to query the table info when the iframe is blurred; doesn't work on IE.
				return this._savedTableInfo;
			}

			if(forceNewData){ this._tempStoreTableData(false); }
			if(this.tableData){
				// tableData is set for a short amount of time, so that all
				// plugins get the same return without doing the method over
				//console.log("returning current tableData:", this.tableData);
				return this.tableData;
			}
			var tr, trs, td, tds, tbl, cols, tdIndex, trIndex, o;

			td = this.editor.getAncestorElement("td");
			if(td){ tr = td.parentNode; }

			tbl = this.editor.getAncestorElement("table");
			//console.log("td:", td);console.log("tr:", tr);console.log("tbl:", tbl)

			if(tbl){
				tds = rias.dom.query("td", tbl);
				tds.forEach(function(d, i){
					if(td==d){tdIndex = i;}
				});
				trs = rias.dom.query("tr", tbl);
				trs.forEach(function(r, i){
					if(tr==r){trIndex = i;}
				});
				cols = tds.length/trs.length;

				o = {
					tbl:tbl,		// focused table
					td:td,			// focused TD
					tr:tr,			// focused TR
					trs:trs,		// rows
					tds:tds,		// cells
					rows:trs.length,// row amount
					cols:cols,		// column amount
					tdIndex:tdIndex,// index of focused cell
					trIndex:trIndex,	// index of focused row
					colIndex:tdIndex%cols
				};
			}else{
				// Means there's no table in focus.   Use {} not null so that this._savedTableInfo is non-null
				o = {};
			}
			//console.log("NEW tableData:",o);
			this.tableData = o;
			this._tempStoreTableData(500);
			return this.tableData;
		},

		connectDraggable: function(){
			// summary:
			//		Detects drag-n-drop in the editor (could probably be moved to there)
			//		Currently only checks if item dragged was a TABLE, and removes its align attr
			//		DOES NOT WORK IN FF - it could - but FF's drag detection is a monster
			//
			if(!rias.has("ie")){
				//console.warn("Drag and Drop is currently only detectable in IE.");
				return;
			}

			// IE ONLY
			this.editorDomNode.ondragstart = rias.hitch(this, "onDragStart");
			this.editorDomNode.ondragend = rias.hitch(this, "onDragEnd");

			//NOTES:
			// FF _ Able to detect the drag-over object (the editor.domNode)
			//	Not able to detect an item's ondrag() event
			//	Don't know why - I actually got it working when there was an error
			//	Something to do with different documents or windows I'm sure
			//
			//console.log("connectDraggable", tbl);
			/*tbl.ondragstart=rias.hitch(this, "onDragStart");

			 tbl.addEventListener("dragstart", rias.hitch(this, "onDragStart"), false);
			 tbl.addEventListener("drag", rias.hitch(this, "onDragStart2"), false);
			 tbl.addEventListener("dragend", rias.hitch(this, "onDragStart3"), false);

			 this.editor._sCall("selectElement", [tbl]);

			 tbl.ondragstart = function(){
			 //console.log("ondragstart");
			 };
			 tbl.ondrag = function(){
			 alert("drag")
			 //console.log("ondrag");
			 */
		},
		onDragStart: function(){
			var e = window.event;
			if(!e.srcElement.id){
				e.srcElement.id = "tbl_"+(new Date().getTime());
			}
			//console.log("onDragStart", e.srcElement.id);
		},
		onDragEnd: function(){
			// summary:
			//		Detects that an object has been dragged into place
			//		Currently, this code is only used for when a table is dragged
			//		and clears the "align" attribute, so that the table will look
			//		to be more in the place that the user expected.
			//		TODO: This code can be used for other things, most
			//		notably UNDO, which currently is not quite usable.
			//		This code could also find itself in the Editor code when it is
			//		complete.

			//console.log("onDragEnd");
			var e = window.event;
			var node = e.srcElement;
			var id = node.id;
			var doc = this.editor.document;
			//console.log("NODE:", node.tagName, node.id,  rias.dom.getAttr(node, "align"));

			// clearing a table's align attr
			// TODO: when ondrag becomes more robust, this code block
			//	should move to its own method
			if(node.tagName.toLowerCase()=="table"){
				setTimeout(function(){
					var node = rias.dom.byId(id, doc);
					rias.dom.removeAttr(node, "align");
					//console.log("set", node.tagName, rias.dom.getAttr(node, "align"))
				}, 100);
			}
		},
		checkAvailable: function(){
			// summary:
			//		For table plugs
			//		Checking if a table or part of a table has focus so that
			//		Plugs can change their status
			//
			if(this.availableCurrentlySet){
				// availableCurrentlySet is set for a short amount of time, so that all
				// plugins get the same return without doing the method over
				//console.log("availableCurrentlySet:", this.availableCurrentlySet, "currentlyAvailable:", this.currentlyAvailable)
				return this.currentlyAvailable;
			}
			//console.log("G - checkAvailable...");

			if(!this.editor) {
				//console.log("editor not ready")
				return false;
			}
			if(this.alwaysAvailable) {
				//console.log(" return always available")
				return true;
			}

			// Only return available if the editor is focused.
			this.currentlyAvailable = this.editor.focused && (this._savedTableInfo ? this._savedTableInfo.tbl :
				this.editor.hasAncestorElement("table"));

			if(this.currentlyAvailable){
				this.connectTableKeys();
			}else{
				this.disconnectTableKeys();
			}

			this._tempAvailability(500);

			rias.publish(this.editor.id + "_tablePlugins", [ this.currentlyAvailable ]);
			return this.currentlyAvailable;
		},

		_prepareTable: function(tbl){
			//	For IE's sake, we are adding IDs to the TDs if none is there
			//	We go ahead and use it for other code for convenience
			//
			var tds = this.editor.query("td", tbl);
			console.log("prep:", tds, tbl);
			if(!tds[0].id){
				tds.forEach(function(td, i){
					if(!td.id){
						td.id = "tdid"+i+this.getTimeStamp();
					}
				}, this);
			}
			return tds;
		},

		getTimeStamp: function(){
			return new Date().getTime(); // Fixed the bug that this method always returns the same timestamp
//		return Math.floor(new Date().getTime() * 0.00000001);
		},

		_tempStoreTableData: function(type){
			// caching or clearing table data, depending on the arg
			//
			if(type===true){
				//store indefinitely
			}else if(type===false){
				// clear object
				this.tableData = null;
			}else if(type===undefined){
				console.warn("_tempStoreTableData must be passed an argument");
			}else{
				// type is a number/ms
				setTimeout(rias.hitch(this, function(){
					this.tableData = null;
				}), type);
			}
		},

		_tempAvailability: function(type){
			// caching or clearing availability, depending on the arg
			if(type===true){
				//store indefinitely
				this.availableCurrentlySet = true;
			}else if(type===false){
				// clear object
				this.availableCurrentlySet = false;
			}else if(type===undefined){
				console.warn("_tempAvailability must be passed an argument");
			}else{
				// type is a number/ms
				this.availableCurrentlySet = true;
				setTimeout(rias.hitch(this, function(){
					this.availableCurrentlySet = false;
				}), type);
			}

		},

		connectTableKeys: function(){
			// summary:
			//		When a table is in focus, start detecting keys
			//		Mainly checking for the TAB key so user can tab
			//		through a table (blocking the browser's desire to
			//		tab away from teh editor completely)
			if(this.tablesConnected){ return; }
			this.tablesConnected = true;
			var node = (this.editor.iframe) ? this.editor.document : this.editor.editNode;
			this.cnKeyDn = this.on(node, "onkeydown", "onKeyDown");
			this.cnKeyUp = this.on(node, "onkeyup", "onKeyUp");
			this._myListeners.push(this.on(node, "onkeypress", "onKeyUp"));
		},

		disconnectTableKeys: function(){
			//console.log("disconnect")
			if(this.cnKeyDn){
				this.cnKeyDn.remove();
				this.cnKeyDn = null;
			}
			if(this.cnKeyUp){
				this.cnKeyUp.remove();
				this.cnKeyUp = null;
			}
			this.tablesConnected = false;
		},

		onKeyDown: function(evt){
			var key = evt.keyCode;
			//console.log(" -> DOWN:", key);
			if(key == 16){ this.shiftKeyDown = true;}
			if(key == 9) {
				var o = this.getTableInfo();
				//console.log("TAB ", o.tdIndex, o);
				// modifying the o.tdIndex in the tableData directly, because we may save it
				// FIXME: tabTo is a global
				o.tdIndex = (this.shiftKeyDown) ? o.tdIndex-1 : tabTo = o.tdIndex+1;
				if(o.tdIndex>=0 && o.tdIndex<o.tds.length){

					this.editor.selectElement(o.tds[o.tdIndex]);

					// we know we are still within a table, so block the need
					//	to run the method
					this.currentlyAvailable = true;
					this._tempAvailability(true);
					//
					this._tempStoreTableData(true);
					this.stopEvent = true;
				}else{
					//tabbed out of table
					this.stopEvent = false;
					this.onDisplayChanged();
				}
				if(this.stopEvent) {
					rias.stopEvent(evt);
				}
			}
		},

		onKeyUp: function(evt){
			var key = evt.keyCode;
			//console.log(" -> UP:", key)
			if(key == 16){ this.shiftKeyDown = false;}
			if(key == 37 || key == 38 || key == 39 || key == 40 ){
				// user can arrow or tab out of table - need to recheck
				this.onDisplayChanged();
			}
			if(key == 9 && this.stopEvent){
				rias.stopEvent(evt);
			}
		},

		onDisplayChanged: function(){
			//console.log("onDisplayChanged")
			this.currentlyAvailable = false;
			this._tempStoreTableData(false);
			this._tempAvailability(false);
			this.checkAvailable();
		},

		uninitialize: function(editor){
			// summary:
			//		Function to handle cleaning up of connects
			//		and such.  It only finally destroys everything once
			//		all 'references' to it have gone.  As in all plugins
			//		that called init on it destroyed their refs in their
			//		cleanup calls.
			// editor:
			//		The editor to detach from.
			if(this.editor === editor){
				this.refCount--;
				if(!this.refCount && this.initialized){
					if(this.tablesConnected){
						this.disconnectTableKeys();
					}
					this.initialized = false;
					rias.forEach(this._myListeners, function(l){
						l.remove();
					});
					delete this._myListeners;
					delete this.editor._tablePluginHandler;
					delete this.editor;
				}
				this.inherited(arguments);
			}
		}
	});

	var TablePlugins = rias.declare(pluginsName + ".TablePlugins", _Plugin, {
			// summary:
			//		A collection of Plugins for inserting and modifying tables in the Editor
			//		See end of this document for all available plugs
			//		and dojox/editorPlugins/tests/editorTablePlugs.html for an example
			//
			//		NOT IMPLEMENTED: Not handling cell merge, span or split
			//

			iconClassPrefix: "editorIcon",
			useDefaultCommand: false,
			buttonClass: Button,
			commandName:"",
			label:"",
			alwaysAvailable:false,
			undoEnabled:true,

			onDisplayChanged: function(withinTable){
				// summary:
				//	 	subscribed to from the global object's publish method

				//console.log("onDisplayChanged", this.name);
				if(!this.alwaysAvailable){
					this.available = withinTable;
					this.button.set('disabled', !this.available);
				}
			},

			setEditor: function(editor){
				this.editor = editor;
				this.editor.customUndo = true;
				this.inherited(arguments);
				this._availableTopic = rias.subscribe(this.editor.id + "_tablePlugins", rias.hitch(this, "onDisplayChanged"));
				this.onEditorLoaded();
			},
			onEditorLoaded: function(){
				if(!this.editor._tablePluginHandler){
					// Create it and init it off the editor.  This
					// will create the _tablePluginHandler reference on
					// the Editor instance.  This avoids a global.
					var tablePluginHandler = new TableHandler();
					tablePluginHandler.initialize(this.editor);
				}else{
					this.editor._tablePluginHandler.initialize(this.editor);
				}
			},

			selectTable: function(){
				// selects table that is in focus
				var o = this.getTableInfo();
				if(o && o.tbl){
					this.editor._sCall("selectElement", [o.tbl]);
				}
			},

			_initButton: function(){
				this.command = this.name;

				this.label = this.editor.commands[this.command] = this._makeTitle(this.command);
				this.inherited(arguments);
				delete this.command;

				this.after(this.button, "onClick", "modTable", true);

				this.onDisplayChanged(false);
			},

			modTable: function(cmd, args){
				// summary:
				//		Where each plugin performs its action.
				//		Note: not using execCommand. In spite of their presence in the
				//		Editor as query-able plugins, I was not able to find any evidence
				//		that they are supported (especially in NOT IE). If they are
				//		supported in other browsers, it may help with the undo problem.

				if(rias.has("ie")){
					// IE can lose selections on focus changes, so focus back
					// in order to restore it.
					this.editor.focus();
				}

				this.begEdit();
				var o = this.getTableInfo();
				var sw = (rias.isString(cmd))?cmd : this.name;
				var r, c, i;
				var adjustColWidth = false;
				//console.log("modTable:", sw)

				switch(sw){
					case "insertTableRowBefore":
						r = o.tbl.insertRow(o.trIndex);
						for(i=0;i<o.cols;i++){
							c = r.insertCell(-1);
							c.innerHTML = "&nbsp;";
						}
						break;
					case "insertTableRowAfter":
						r = o.tbl.insertRow(o.trIndex+1);
						for(i=0;i<o.cols;i++){
							c = r.insertCell(-1);
							c.innerHTML = "&nbsp;";
						}
						break;
					case "insertTableColumnBefore":
						o.trs.forEach(function(r){
							c = r.insertCell(o.colIndex);
							c.innerHTML = "&nbsp;";
						});
						adjustColWidth = true;
						break;
					case "insertTableColumnAfter":
						o.trs.forEach(function(r){
							c = r.insertCell(o.colIndex+1);
							c.innerHTML = "&nbsp;";
						});
						adjustColWidth = true;
						break;
					case "deleteTableRow":
						o.tbl.deleteRow(o.trIndex);
						console.log("TableInfo:", this.getTableInfo());
						break;
					case "deleteTableColumn":
						o.trs.forEach(function(tr){
							tr.deleteCell(o.colIndex);
						});
						adjustColWidth = true;
						break;

					case "modifyTable":
						break;
					case "insertTable":
						break;

				}
				if(adjustColWidth){
					this.makeColumnsEven();
				}
				this.endEdit();
			},

			begEdit: function(){
				if(this.editor._tablePluginHandler.undoEnabled){
					//console.log("UNDO:", this.editor.customUndo);
					if(this.editor.customUndo){
						this.editor.beginEditing();
					}else{
						this.valBeforeUndo = this.editor.getValue();
						//console.log("VAL:", this.valBeforeUndo);

					}
				}
			},
			endEdit: function(){
				if(this.editor._tablePluginHandler.undoEnabled){
					if(this.editor.customUndo){
						this.editor.endEditing();
					}else{
						// This code ALMOST works for undo -
						//	It seems to only work for one step
						//	back in history however
						var afterUndo = this.editor.getValue();
						//this.editor.execCommand("inserthtml", "<p>mike</p>");
						this.editor.set("value", this.valBeforeUndo);
						this.editor.replaceValue(afterUndo);
					}

					this.editor.onDisplayChanged();
				}
			},

			makeColumnsEven: function(){
				// summary:
				//		After changing column amount, change widths to
				//		keep columns even

				// the timeout helps prevent an occasional snafu
				setTimeout(rias.hitch(this, function(){
					var o = this.getTableInfo(true);
					var w = Math.floor(100/o.cols);
					o.tds.forEach(function(d){
						rias.dom.setAttr(d, "width", w+"%");
					});
				}), 10);
			},

			getTableInfo: function(forceNewData){
				// summary:
				//		Gets the table in focus
				//		Collects info on the table - see return params
				//
				return this.editor._tablePluginHandler.getTableInfo(forceNewData);
			},
			_makeTitle: function(str){
				// Uses the commandName to get the localized Title
				this._strings = rias.i18n.getLocalization(pluginsName, "TableDialog");
				var title = this._strings[str + "Title"] || this._strings[str + "Label"] || str;
				return title;
			},



			getSelectedCells: function(){
				// summary:
				//		Gets the selected cells from the passed table.
				// returns:
				//		array of TDs or empty array
				var cells = [];
				var tbl = this.getTableInfo().tbl;
				this.editor._tablePluginHandler._prepareTable(tbl);
				var e = this.editor;

				// Lets do this the way IE originally was (Looking up ids).  Walking the selection
				// is inconsistent in the browsers (and painful), so going by ids is simpler.
				var text = e._sCall("getSelectedHtml", [null]);
				var str = text.match(/id="*\w*"*/g);
				rias.forEach(str, function(a){
					var id = a.substring(3, a.length);
					if(id.charAt(0) == "\"" && id.charAt(id.length - 1) == "\""){
						id = id.substring(1, id.length - 1);
					}
					var node = e.byId(id);
					if(node && node.tagName.toLowerCase() == "td"){
						cells.push(node);
					}
				}, this);

				if(!cells.length){
					//May just be in a cell (cursor point, or selection in a cell), so look upwards.
					//for a cell container.
					var sel = rangapi.getSelection(e.window);
					if(sel.rangeCount){
						var r = sel.getRangeAt(0);
						var node = r.startContainer;
						while(node && node != e.editNode && node != e.document){
							if(node.nodeType === 1){
								var tg = node.tagName ? node.tagName.toLowerCase() : "";
								if(tg === "td"){
									return [node];
								}
							}
							node = node.parentNode;
						}
					}
				}
				return cells;
			},

			updateState: function(){
				// summary:
				//		Over-ride for button state control for disabled to work.
				if(this.button){
					if((this.available || this.alwaysAvailable) && !this.get("disabled")){
						this.button.set("disabled",false);
					}else{
						this.button.set("disabled",true);
					}
				}
			},

			_onDestroy: function(){
				// summary:
				//		Over-ridden destroy to do some cleanup.
				this.inherited(arguments);
				if(this._availableTopic){
					this._availableTopic.remove();
					this._availableTopic = null;
				}

				// Disconnect the editor from the handler
				// to clean up refs.  Moved to using a per-editor
				// 'handler' to avoid collisions on the old global.
				this.editor._tablePluginHandler.uninitialize(this.editor);
			}

		}
	);

	var TableContextMenu = rias.declare(TablePlugins, {
		constructor: function(){
			// summary:
			//		Initialize certain plugins
			//
			this.after(this, "setEditor", function(editor){
				editor.onLoadDeferred.then(rias.hitch(this, function() {
					this._createContextMenu();
				}));
				this.button.domNode.style.display = "none";
			}, true);
		},

		_onDestroy: function(){
			// summary:
			//	Over-ride to do menu cleanup.
			if(this.menu){
				this.menu.destroy();
				delete this.menu;
			}
			this.inherited(arguments);
		},


		_initButton: function(){
			this.inherited(arguments);
			if(this.name==="tableContextMenu"){ this.button.domNode.display = "none";}
		},

		_createContextMenu: function(){
			// summary:
			//		Building context menu for right-click shortcuts within a table

			var pMenu = new Menu({targetNodeIds:[this.editor.iframe]});
			var messages = tableDialogStrings;
			pMenu.addChild(new MenuItem({label: messages.selectTableLabel, onClick: rias.hitch(this, "selectTable")}));
			pMenu.addChild(new MenuSeparator());

			pMenu.addChild(new MenuItem({label: messages.insertTableRowBeforeLabel, onClick: rias.hitch(this, "modTable", "insertTableRowBefore" )}));
			pMenu.addChild(new MenuItem({label: messages.insertTableRowAfterLabel, onClick: rias.hitch(this, "modTable", "insertTableRowAfter" )}));
			pMenu.addChild(new MenuItem({label: messages.insertTableColumnBeforeLabel, onClick: rias.hitch(this, "modTable", "insertTableColumnBefore" )}));
			pMenu.addChild(new MenuItem({label: messages.insertTableColumnAfterLabel, onClick: rias.hitch(this, "modTable", "insertTableColumnAfter" )}));
			pMenu.addChild(new MenuSeparator());
			pMenu.addChild(new MenuItem({label: messages.deleteTableRowLabel, onClick: rias.hitch(this, "modTable", "deleteTableRow" )}));
			pMenu.addChild(new MenuItem({label: messages.deleteTableColumnLabel, onClick: rias.hitch(this, "modTable", "deleteTableColumn" )}));

			this.menu = pMenu;
		}
	});

	var EditorTableDialog = rias.declare(pluginsName + ".EditorTableDialog", [Dialog, _TemplatedMixin], {
		// summary:
		//		Dialog box with options for table creation

		baseClass:"EditorTableDialog",

		templateString: insertTableTemplate,

		postMixInProperties: function(){
			rias.mixin(this, tableDialogStrings);
			this.inherited(arguments);
		},

		postCreate: function(){
			rias.dom.addClass(this.domNode, this.baseClass); //FIXME - why isn't Dialog accepting the baseClass?
			this.inherited(arguments);
		},

		onInsert: function(){
			console.log("insert");

			var rows =		this.selectRow.get("value") || 1,
				cols =		this.selectCol.get("value") || 1,
				width =		this.selectWidth.get("value"),
				widthType = this.selectWidthType.get("value"),
				border =	this.selectBorder.get("value"),
				pad =		this.selectPad.get("value"),
				space =		this.selectSpace.get("value"),
				_id =		"tbl_"+(new Date().getTime()),
				t = '<table id="' + _id + '"width="' + width + ((widthType == "percent") ? '%' : '') + '" border="' + border + '" cellspacing="' + space + '" cellpadding="' + pad + '">\n';

			for(var r = 0; r < rows; r++){
				t += '\t<tr>\n';
				for(var c = 0; c < cols; c++){
					t += '\t\t<td width="' + (Math.floor(100 / cols))+'%">&nbsp;</td>\n';
				}
				t += '\t</tr>\n';
			}
			t += '</table><br />';

			var self = this;
			///TODO:zensst. 明确 cl 在没有 _onHide 时的 remove
			var cl = this.on("_onHide", function(){
				cl.remove();
				setTimeout(function(){
					self.destroy();
				}, 10);
			});
			this.hide();

			//console.log(t);
			this.onBuildTable({
				htmlText:t,
				id:_id
			});
		},

		onCancel: function(){
			// summary:
			//		Function to clean up memory so that the dialog is destroyed
			//		when closed.
			var self = this;
			///TODO:zensst. 明确 c 在没有 _onHide 时的 remove
			var c = this.on("_onHide", function(){
				rias.disconnect(c);
				setTimeout(function(){
					self.destroy();
				}, 10);
			});
		},

		onBuildTable: function(tableText){
			//stub
		}
	});

	var InsertTable = rias.declare(pluginsName + ".InsertTable", TablePlugins, {
		alwaysAvailable: true,

		modTable: function(){
			var ed = this.editor,
				w = new EditorTableDialog({});
			w.show();
			///TODO:zensst. 明确 c 在没有 onBuildTable 时的 remove
			var c = w.on("onBuildTable", function(obj){
				c.remove();

				ed.focus();
				var res = ed.execCommand('inserthtml', obj.htmlText);

				// commenting this line, due to msg below
				//var td = this.editor.query("td", this.editor.byId(obj.id));

				//HMMMM.... This throws a security error now. didn't used to.
				//this.editor.selectElement(td);
			});
		}
	});

	var EditorModifyTableDialog = rias.declare([Dialog, _TemplatedMixin], {

		// summary:
		//		Dialog box with options for editing a table
		//

		baseClass:"EditorTableDialog",

		table:null, //html table to be modified
		tableAtts:{},
		templateString: modifyTableTemplate,

		postMixInProperties: function(){
			rias.mixin(this, tableDialogStrings);
			this.inherited(arguments);
		},

		postCreate: function(){
			rias.dom.addClass(this.domNode, this.baseClass); //FIXME - why isn't Dialog accepting the baseClass?
			this.inherited(arguments);
			var w1 = new this.colorPicker({
				params: this.params
			});
			this.after(w1, "onChange", function(color){
				if(!this._started){ return; } // not during startup()
				rias.popupManager.hide(w1);
				this.setBrdColor(color);
			}, true);
			this.after(w1, "onBlur", function(){
				rias.popupManager.hide(w1);
			}, true);
			this.on(this.borderCol, "click", function(){
				w1.set('value', this.brdColor, false);
				rias.popupManager.popup({
					popup: w1,
					popupOwner: this,
					around: this.borderCol
				});
				w1.focus();
			});
			var w2 = new this.colorPicker({params: this.params});

			this.after(w2, "onChange", function(color){
				if(!this._started){ return; } // not during startup()
				rias.popupManager.hide(w2);
				this.setBkColor(color);
			}, true);
			this.after(w2, "onBlur", function(){
				rias.popupManager.hide(w2);
			}, true);
			this.on(this.backgroundCol, "click", function(){
				w2.set('value', this.bkColor, false);
				rias.popupManager.popup({
					popup: w2,
					popupOwner: this,
					around: this.backgroundCol
				});
				w2.focus();
			});
			this.own(w1, w2);
			this.pickers = [ w1, w2 ];

			this.setBrdColor(rias.dom.getStyle(this.table, "borderColor"));
			this.setBkColor(rias.dom.getStyle(this.table, "backgroundColor"));
			var w = rias.dom.getAttr(this.table, "width");
			if(!w){
				w = this.table.style.width;
			}
			var p = "pixels";
			if(rias.isString(w) && w.indexOf("%")>-1){
				p = "percent";
				w = w.replace(/%/, "");
			}

			if(w){
				this.selectWidth.set("value", w);
				this.selectWidthType.set("value", p);
			}else{
				this.selectWidth.set("value", "");
				this.selectWidthType.set("value", "percent");
			}

			this.selectBorder.set("value", rias.dom.getAttr(this.table, "border"));
			this.selectPad.set("value", rias.dom.getAttr(this.table, "cellPadding"));
			this.selectSpace.set("value", rias.dom.getAttr(this.table, "cellSpacing"));
			this.selectAlign.set("value", rias.dom.getAttr(this.table, "align"));
		},
		startup: function() {
			rias.forEach(this.pickers, function(picker){ picker.startup(); });
			this.inherited(arguments);
		},

		setBrdColor: function(color){
			this.brdColor = color;
			rias.dom.setStyle(this.borderCol, "backgroundColor", color);
		},

		setBkColor: function(color){
			this.bkColor = color;
			rias.dom.setStyle(this.backgroundCol, "backgroundColor", color);
		},
		onSet: function(){
			rias.dom.setStyle(this.table, "borderColor", this.brdColor);
			rias.dom.setStyle(this.table, "backgroundColor", this.bkColor);
			if(this.selectWidth.get("value")){
				// Just in case, remove it from style since we're setting it as a table attribute.
				rias.dom.setStyle(this.table, "width", "");
				rias.dom.setAttr(this.table, "width", (this.selectWidth.get("value") + ((this.selectWidthType.get("value")=="pixels")?"":"%") ));
			}
			rias.dom.setAttr(this.table, "border", this.selectBorder.get("value"));
			rias.dom.setAttr(this.table, "cellPadding", this.selectPad.get("value"));
			rias.dom.setAttr(this.table, "cellSpacing", this.selectSpace.get("value"));
			rias.dom.setAttr(this.table, "align", this.selectAlign.get("value"));
			var self = this;
			///TODO:zensst. 明确 c 在没有 _onHide 时的 remove
			var c = this.on("_onHide", function(){
				c.remove();
				setTimeout(function(){
					self.destroy();
				}, 10);
			});
			this.hide();
		},

		onCancel: function(){
			// summary:
			//		Function to clean up memory so that the dialog is destroyed
			//		when closed.
			var self = this;
			///TODO:zensst. 明确 c 在没有 _onHide 时的 remove
			var c = this.on("_onHide", function(){
				c.remove();
				setTimeout(function(){
					self.destroy();
				}, 10);
			});
		},

		onSetTable: function(tableText){
			//stub
		}
	});

	var ModifyTable = rias.declare(pluginsName + ".ModifyTable", TablePlugins, {
		// colorPicker: Constructor
		//		The color picker riasWidget to use, defaults to riasw/form/ColorPalette
		colorPicker: ColorPalette,

		modTable: function(){
			if (!this.editor._tablePluginHandler.checkAvailable()) {return;}
			var o = this.getTableInfo();
			//console.log("LAUNCH DIALOG");

			var w = new EditorModifyTableDialog({
				table:o.tbl,
				colorPicker: typeof this.colorPicker === 'string' ? require(this.colorPicker) : this.colorPicker,
				params: this.params
			});
			w.show();
			this.after(w, "onSetTable", function(color){
				// uhm... not sure whats going on here...
				var o = this.getTableInfo();
				//console.log("set color:", color);
				rias.dom.setStyle(o.td, "backgroundColor", color);
			}, true);
		}
	});

	var CellColorDropDown = rias.declare([_WidgetBase, _TemplatedMixin], {
		// summary:
		//		A simple widget that uses/creates a dropdown with a customisable color picker.  Also provides
		//		passthroughs to the value of the color picker and convenient hook points.
		// tags:
		//		private

		// colorPicker: Constructor
		//		The color picker riasWidget to use, defaults to riasw/form/ColorPicker
		colorPicker: ColorPicker,

		// templateString: String
		//		The template used to create the ColorPicker.
		templateString:
			"<div style='display: none; position: absolute; top: -10000; z-index: -10000'>" +
				"<div dojoType='riasw.sys.Dialog' data-dojo-attach-point='dialog' class='riaswEditorColorPicker'>" +
					"<div data-dojo-attach-point='_colorPicker'></div>" +
					"<div style='margin: 0.5em 0em 0em 0em'>" +
						"<button dojoType='riasw.form.Button' type='submit' data-dojo-attach-point='_setButton'>${buttonSet}</button>" +
						"&nbsp;" +
						"<button dojoType='riasw.form.Button' type='button' data-dojo-attach-point='_cancelButton'>${buttonCancel}</button>" +
					"</div>" +
				"</div>" +
			"</div>",

		// widgetsInTemplate: Boolean
		//		Flag denoting widgets are contained in the template.
		widgetsInTemplate: true,

		constructor: function(){
			// summary:
			//		Constructor over-ride so that the translated strings are mixed in so
			//		the template fills out.
			rias.mixin(this, tableDialogStrings);
		},
		postCreate: function() {
			// summary:
			//		Create color picker dynamically rather than hardcode in template.
			var ColorPicker = typeof this.colorPicker == "string" ? require(this.colorPicker) : this.colorPicker;
			this._colorPicker = new ColorPicker({
				params: this.params
			}, this._colorPicker);
		},

		startup: function(){
			// summary:
			//		Over-ride of startup to do the basic connect setups and such.
			if(!this._started){
				this.inherited(arguments);
				this.after(this.dialog, "onSubmit", function(){
					this.onChange(this.get("value"));
				}, true);
				this.after(this._cancelButton, "onClick", function(){
					rias.popupManager.hide(this.dialog);
				}, true);
				this.after(this.dialog, "onCancel", "onCancel", true);

				// Fully started, so go ahead and remove the hide.
				rias.dom.setStyle(this.domNode, "display", "block");
			}
		},

		_setValueAttr: function(value, priorityChange){
			// summary:
			//		Passthrough function for the color picker value.
			// value: String
			//		The value to set in the color picker
			// priorityChange:
			//		Value to indicate whether or not to trigger an onChange event.
			this._colorPicker.set("value", value, priorityChange);
		},

		_getValueAttr: function(){
			// summary:
			//		Passthrough function for the color picker value.
			return this._colorPicker.get("value");
		},

		onChange: function(value){
			// summary:
			//		Hook point to get the value when the color picker value is selected.
			// value: String
			//		The value from the color picker.
		},

		onCancel: function(){
			// summary:
			//		Hook point to get when the dialog is canceled.
		}
	});

	var ColorTableCell = rias.declare(pluginsName + ".ColorTableCell", TablePlugins, {
		// colorPicker: Constructor
		//		The color picker riasWidget to use, defaults to riasw/form/ColorPicker
		colorPicker: ColorPicker,

		constructor: function(){
			// summary:
			//		Initialize ColorTableCell plugin
			this.closable = true;
			this.buttonClass = Button;
		},
		buildRendering: function(){
			this.inherited(arguments);
			var self = this,
				picker,
				pickerInit = {
					colorPicker: this.colorPicker,
					params: this.params
				};

			// We may have been given the dropdown to use, or we can use a default.
			if(!this.dropDown){
				// Create our default dropdown dialog
				picker = new CellColorDropDown(pickerInit);
				picker.startup(); // we don't have startup so just invoke it now

				// In this case the dropdown isn't the thing firing events, its
				//  dialog is.
				this.dropDown = picker.dialog;
			}else{
				// Assume the dropdown we've been given is the picker we should attach to.
				picker = this.dropDown;
				picker.set(pickerInit);
			}

			this.after(picker, "onChange", function(color){
				this.editor.focus();
				this.modTable(null, color);
			}, true);
			this.after(picker, "onCancel", function(){
				this.editor.focus();
			}, true);
			// Calculate and assign value before onOpen fires, so onOpen may rely on
			//  having a value when it runs.
			this.before(this.dropDown, "_onShow", function(){
				var o = self.getTableInfo(),
					tds = self.getSelectedCells(o.tbl);
				if(tds && tds.length > 0){
					var t = tds[0] === self.lastObject ? tds[0] : tds[tds.length - 1],
						color;
					while(t && t !== self.editor.document && ((color = rias.dom.getStyle(t, "backgroundColor")) === "transparent" || color.indexOf("rgba") === 0)){
						t = t.parentNode;
					}
					if(color !== "transparent" && color.indexOf("rgba") !== 0){
						picker.set('value', rias.Color.fromString(color).toHex());
					}
				}
			});
			this.after(this, "setEditor", function(editor){
				editor.onLoadDeferred.then(rias.hitch(this, function(){
					this.on(this.editor.editNode, "mouseup", function(evt){
						this.lastObject = evt.target;
					});
				}));
			}, true);
		},

		_initButton: function(){
			this.command = this.name;

			this.label = this.editor.commands[this.command] = this._makeTitle(this.command);
			this.inherited(arguments);
			delete this.command;

			this.onDisplayChanged(false);
		},

		modTable: function(cmd, args){
			// summary:
			//		Where each plugin performs its action.
			//		Note: not using execCommand. In spite of their presence in the
			//		Editor as query-able plugins, I was not able to find any evidence
			//		that they are supported (especially in NOT IE). If they are
			//		supported in other browsers, it may help with the undo problem.

			this.begEdit();
			var o = this.getTableInfo();
			// The one plugin that really needs use of the very verbose
			//	getSelectedCells()
			var tds = this.getSelectedCells(o.tbl);
			//console.debug("SELECTED CELLS ", tds , " FOR ", o);
			rias.forEach(tds, function(td){
				rias.dom.setStyle(td, "backgroundColor", args);
			});
			this.endEdit();
		}
	});

// Register these plugins.
	function registerGeneric(args) {
		return new TablePlugins(args);
	}
	_Plugin.registry["insertTableRowBefore"] = _Plugin.registry["inserttablerowbefore"] = registerGeneric;
	_Plugin.registry["insertTableRowAfter"] = _Plugin.registry["inserttablerowafter"] = registerGeneric;
	_Plugin.registry["insertTableColumnBefore"] = _Plugin.registry["inserttablecolumnbefore"] = registerGeneric;
	_Plugin.registry["insertTableColumnAfter"] = _Plugin.registry["inserttablecolumnafter"] = registerGeneric;
	_Plugin.registry["deleteTableRow"] = _Plugin.registry["deletetablerow"] = registerGeneric;
	_Plugin.registry["deleteTableColumn"] = _Plugin.registry["deletetablecolumn"] = registerGeneric;
	_Plugin.registry["colorTableCell"] = _Plugin.registry["colortablecell"] = function(args) {
		return new ColorTableCell(args);
	};
	_Plugin.registry["modifyTable"] = _Plugin.registry["modifytable"] = function(args) {
		return new ModifyTable(args);
	};
	_Plugin.registry["insertTable"] = _Plugin.registry["inserttable"] = function(args) {
		return new InsertTable(args);
	};
	_Plugin.registry["tableContextMenu"] = _Plugin.registry["tablecontextmenu"] = function(args) {
		return new TableContextMenu(args);
	};

	return TablePlugins;
});
