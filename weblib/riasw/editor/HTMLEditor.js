//RIAStudio client runtime widget - HTMLEditor(RichTextEditor)

define([
	"riasw/riaswBase",
	"riasw/editor/RichText",///修改 style 不是字符串时的问题。
	"riasw/sys/Toolbar",
	"riasw/sys/ToolbarSeparator",
	"riasw/sys/ToolbarLineBreak",
	"riasw/form/ToggleButton",
	"./htmleditor/_Plugin",
	"./htmleditor/html",
	"./htmleditor/range",

	"./htmleditor/plugins/EnterKeyHandling",
	"./htmleditor/plugins/AlwaysShowToolbar",
	//"./htmleditor/plugins/FullScreen",
	"./htmleditor/plugins/NewPage",
	"./htmleditor/plugins/Print",
	"./htmleditor/plugins/ViewSource",
	"./htmleditor/plugins/FontChoice",
	"./htmleditor/plugins/ToggleDir",
	"./htmleditor/plugins/LinkDialog",
	"./htmleditor/plugins/TabIndent",
	/// ===================== ///
	"./htmleditor/plugins/ResizeTableColumn",
	"./htmleditor/plugins/AutoSave",
	"./htmleditor/plugins/AutoUrlLink",
	"./htmleditor/plugins/BidiSupport",
	"./htmleditor/plugins/Blockquote",
	"./htmleditor/plugins/Breadcrumb",
	"./htmleditor/plugins/CollapsibleToolbar",
	"./htmleditor/plugins/EntityPalette",
	"./htmleditor/plugins/FindReplace",
	"./htmleditor/plugins/InsertAnchor",
	"./htmleditor/plugins/InsertEntity",
	"./htmleditor/plugins/LocalImage",
	"./htmleditor/plugins/NormalizeIndentOutdent",
	"./htmleditor/plugins/NormalizeStyle",
	"./htmleditor/plugins/PageBreak",
	//"./htmleditor/plugins/PasteFromWord",
	"./htmleditor/plugins/PrettyPrint",
	"./htmleditor/plugins/Preview",
	//"./htmleditor/plugins/SafePaste",
	"./htmleditor/plugins/Save",
	"./htmleditor/plugins/ShowBlockNodes",
	"./htmleditor/plugins/Smiley",
	//"./htmleditor/plugins/_SpellCheckParser",
	//"./htmleditor/plugins/SpellCheck",
	//"./htmleditor/plugins/StatusBar",
	"./htmleditor/plugins/TablePlugins",
	"./htmleditor/plugins/TextColor",
	//"./htmleditor/plugins/UploadImage",
	"dojo/i18n!./htmleditor/plugins/nls/commands"
], function(rias, RichText, Toolbar, ToolbarSeparator, ToolbarLineBreak, ToggleButton, _Plugin, htmlapi, rangeapi) {

	//rias.theme.loadThemeCss([
	//	"riasw/editor/HTMLEditor.css"
	//]);

	var pluginsName = "riasw.editor.htmleditor.plugins";

	// Register the "default plugins", ie, the built-in editor commands
	function simplePluginFactory(args){
		return new _Plugin({
			ownerRiasw: args.ownerRiasw,
			command: args.name
		});
	}

	function togglePluginFactory(args){
		return new _Plugin({
			ownerRiasw: args.ownerRiasw,
			buttonClass: ToggleButton,
			command: args.name
		});
	}

	rias.mixin(_Plugin.registry, {
		"undo": simplePluginFactory,
		"redo": simplePluginFactory,
		"cut": simplePluginFactory,
		"copy": simplePluginFactory,
		"paste": simplePluginFactory,
		"insertOrderedList": simplePluginFactory,
		"insertorderedlist": simplePluginFactory,
		"insertUnorderedList": simplePluginFactory,
		"insertunorderedlist": simplePluginFactory,
		"indent": simplePluginFactory,
		"outdent": simplePluginFactory,
		"justifyCenter": simplePluginFactory,
		"justifycenter": simplePluginFactory,
		"justifyFull": simplePluginFactory,
		"justifyfull": simplePluginFactory,
		"justifyLeft": simplePluginFactory,
		"justifyleft": simplePluginFactory,
		"justifyRight": simplePluginFactory,
		"justifyright": simplePluginFactory,
		"delete": simplePluginFactory,
		"selectAll": simplePluginFactory,
		"selectall": simplePluginFactory,
		"removeFormat": simplePluginFactory,
		"removeformat": simplePluginFactory,
		"unlink": simplePluginFactory,
		"insertHorizontalRule": simplePluginFactory,
		"inserthorizontalrule": simplePluginFactory,

		"bold": togglePluginFactory,
		"italic": togglePluginFactory,
		"underline": togglePluginFactory,
		"strikethrough": togglePluginFactory,
		"subscript": togglePluginFactory,
		"superscript": togglePluginFactory,

		"|": function(args){
			return new _Plugin({
				ownerRiasw: args.ownerRiasw,
				setEditor: function(editor){
					this.editor = editor;
					this.button = new ToolbarSeparator({
						//ownerDocument: editor.ownerDocument,
						ownerRiasw: this
					});
				}
			});
		},
		"||": function(args){
			return new _Plugin({
				ownerRiasw: args.ownerRiasw,
				setEditor: function(editor){
					this.editor = editor;
					this.button = new ToolbarLineBreak({
						//ownerDocument: editor.ownerDocument,
						ownerRiasw: this
					});
				}
			});
		}
	});

	var keys = rias.keys,
		has = rias.has,
		_dom = rias.dom;
	var pluginsBase = [
			"insertEntity", "smiley", "insertImage",
			"|", "bold", "italic", "underline", "strikethrough", "subscript", "superscript", "foreColor", "hiliteColor",
			"||", "enterKeyHandling", "normalizeIndentOutdent",
			//"autoUrlLink",///TODO:zensst.该插件的 169行有错，需要判断 node 是否 undefined，以后修改
			{name: "normalizeStyle", mode: "css"}
		],
		pluginsAll = [
			"newPage", "autoSave", "preview", "print",
			{name: "prettyPrint", indentBy: "3", entityMap: _dom.html.entities.html.concat(_dom.html.entities.latin)},
			{name: "viewSource", stripScripts: true, stripComments: true}, "showBlockNodes",
			//{name: "fullscreen", zIndex: 5000},///暂时不用，需要修改为 弹出窗口
			"|", "undo", "redo", "cut", "copy", "paste", //"pasteFromWord",
			"blockquote",
			"|", "insertEntity", "smiley", "createLink", "unlink", "insertAnchor", "insertImage", "pageBreak", "insertHorizontalRule",
			"||", {name: "fontName", extraFonts: ["微软雅黑", "宋体"]}, "fontSize", "formatBlock",
			"|", "bold", "italic", "underline", "strikethrough", "subscript", "superscript", "foreColor", "hiliteColor",
			"||", "justifyLeft", "justifyRight", "justifyCenter", "justifyFull",
			"|", "insertOrderedList", "insertUnorderedList", "indent", "outdent", "toggleDir",
			"|", "removeFormat", "delete", "selectAll", "findReplace",
			//{name: "localImage", uploadable: true, uploadUrl: "../../form/tests/UploadFile.php", baseImageUrl: "../../form/tests/"},
			/*"||", {name: "insertTable", command: "insertTable", title: "插入表格", alwaysAvailable: true},
			{name: "modifyTable", command: "modifyTable", title: "修改"},
			{name: "insertTableRowBefore", command: "InsertTableRowBefore", title: "插入行"},
			{name: "insertTableRowAfter", command: "InsertTableRowAfter", title: "追加行"},
			{name: "insertTableColumnBefore", command: "insertTableColumnBefore", title: "插入列"},
			{name: "insertTableColumnAfter", command: "insertTableColumnAfter", title: "追加列"},
			{name: "deleteTableRow", command: "deleteTableRow", title: "删除行"},
			{name: "deleteTableColumn", command: "deleteTableColumn", title: "删除列"},
			{name: "colorTableCell", command: "colorTableCell", title: "单元格颜色"},
			{name: "tableContextMenu", command: "tableContextMenu", title: "表格菜单"},
			{name: "ResizeTableColumn", command: "resizeTableColumn", title: "改变列宽"},*/
			"||", "enterKeyHandling", "normalizeIndentOutdent", "breadcrumb",
			 //"autoUrlLink",///TODO:zensst.该插件的 169行有错，需要判断 node 是否 undefined，以后修改
			{name: "normalizeStyle", mode: "css"},
			//{name: "statusBar", resizable: false},//没必要，建议在应用中单独设置
			//"safePaste",
			"collapsibleToolbar"
		];

	var riaswType = "riasw.editor.HTMLEditor";
	var Widget = rias.declare(riaswType, [RichText], {
		// summary:
		//		A rich text Editing widget
		//
		// description:
		//		This widget provides basic WYSIWYG editing features, based on the browser's
		//		underlying rich text editing capability, accompanied by a toolbar (`riasw.sys.Toolbar`).
		//		A plugin model is available to extend the editor's capabilities as well as the
		//		the options available in the toolbar.  Content generation may vary across
		//		browsers, and clipboard operations may have different results, to name
		//		a few limitations.  Note: this widget should not be used with the HTML
		//		&lt;TEXTAREA&gt; tag -- see riasw/_editor/RichText for details.

		// plugins: [const] Object[]
		//		A list of plugin names (as strings) or instances (as objects)
		//		for this widget.
		//
		//		When declared in markup, it might look like:
		//	|	plugins="['bold',{name:'riasw._editor.plugins.FontChoice', command:'fontName', generic:true}]"
		plugins: null,

		// extraPlugins: [const] Object[]
		//		A list of extra plugin names which will be appended to plugins array
		extraPlugins: null,

		constructor: function(/*===== params, srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Initial settings for any of the attributes, except readonly attributes.
			// srcNodeRef: DOMNode
			//		The editor replaces the specified DOMNode.

			if(!rias.isArray(this.plugins)){
				this.plugins = pluginsBase;
			}

			this._plugins = [];
			this._editInterval = this.editActionInterval * 1000;

			//IE will always lose focus when other element gets focus, while for FF and safari,
			//when no iframe is used, focus will be lost whenever another element gets focus.
			//For IE, we can connect to onBeforeDeactivate, which will be called right before
			//the focus is lost, so we can obtain the selected range. For other browsers,
			//no equivalent of onBeforeDeactivate, so we need to do two things to make sure
			//selection is properly saved before focus is lost: 1) when user clicks another
			//element in the page, in which case we listen to mousedown on the entire page and
			//see whether user clicks out of a focus editor, if so, save selection (focus will
			//only lost after onmousedown event is fired, so we can obtain correct caret pos.)
			//2) when user tabs away from the editor, which is handled in onKeyDown below.
			if(has("ie") || has("trident") || has("edge")){
				this.events.push("onBeforeDeactivate");
				this.events.push("onBeforeActivate");
			}
		},

		postMixInProperties: function(){
			// summary:
			//	Extension to make sure a deferred is in place before certain functions
			//	execute, like making sure all the plugins are properly inserted.

			// Set up a deferred so that the value isn't applied to the editor
			// until all the plugins load, needed to avoid timing condition
			// reported in #10537.
			this.inherited(arguments);
			this.setValueDeferred = rias.newDeferred();
		},

		postCreate: function(){
			this.inherited(arguments);

			//for custom undo/redo, if enabled.
			this._steps = this._steps.slice(0);
			this._undoedSteps = this._undoedSteps.slice(0);

			if(rias.isArray(this.extraPlugins)){
				this.plugins = this.plugins.concat(this.extraPlugins);
			}

			this.commands = rias.i18n.getLocalization(pluginsName, "commands", this.lang);

			if(has("webkit")){
				// Disable selecting the entire editor by inadvertent double-clicks.
				// on buttons, title bar, etc.  Otherwise clicking too fast on
				// a button such as undo/redo selects the entire editor.
				_dom.setStyle(this.domNode, "KhtmlUserSelect", "none");
			}

			///增加
			this.contentDomPreFilters.push(rias.hitch(this, this._preDomFilter));
			this.contentDomPostFilters.push(rias.hitch(this, this._postDomFilter));
		},
		_onDestroy: function(){
			rias.forEach(this._plugins, function(p){
				rias.destroy(p);
			});
			this._plugins = [];
			if(this.toolbar){
				this.toolbar.destroy();
				this.toolbar = undefined;
			}
			this.inherited(arguments);
		},

		_preDomFilter: function(node){
			var id, _n;
			node = (node ? node.firstChild : undefined);
			while(node){
				_n = node;
				node = node.nextSibling;
				if(_n.nodeType === 1 && (id = _n.getAttribute("widgetId"))){
					if(rias.by(id)){
						_n.parentNode.removeChild(_n);
					}
				}
			}
			//_dom.query("a[name]:not([href])", this.editNode).addClass("riaswEditorPluginInsertAnchorStyle");
		},
		_postDomFilter: function(node){
			//console.debug(node);
			//if(node){	// avoid error when Editor.get("value") called before editor's iframe initialized
			//	_dom.query("a[name]:not([href])", node).removeClass("riaswEditorPluginInsertAnchorStyle");
			//}
			return node;
		},

		startup: function(){
			///避免二次 startup()，以致显示不正确。
			if(this._started){
				return;
			}
			this.inherited(arguments);

			if(!this.toolbar){
				// if we haven't been assigned a toolbar, create one
				this.toolbar = new Toolbar({
					//ownerDocument: editor.ownerDocument,
					ownerRiasw: this,
					dir: this.dir,
					lang: this.lang,
					"aria-label": this.id,
					"class": "riaswEditorToolbar"
				});
				this.header.appendChild(this.toolbar.domNode);
			}

			var i = rias.indexOf(this.plugins, "base");
			if(i >= 0){
				this.plugins.splice.apply(this.plugins, [i, 1].concat(rias.filter(pluginsBase, function(a){
					return !rias.contains(this.plugins, a);
				}, this)));
			}
			i = rias.indexOf(this.plugins, "all");
			if(i >= 0){
				this.plugins.splice.apply(this.plugins, [i, 1].concat(rias.filter(pluginsAll, function(a){
					return !rias.contains(this.plugins, a);
				}, this)));
			}
			rias.forEach(this.plugins, this.addPlugin, this);

			// Okay, denote the value can now be set.
			this.setValueDeferred.resolve(true);

			//_dom.addClass(this.iframe.parentNode, "riaswEditorContainer");
			//_dom.addClass(this.iframe, "riaswEditorIFrame");
			//_dom.setAttr(this.iframe, "allowTransparency", true);

			this.toolbar.startup();
			//this.onNormalizedDisplayChanged(); //update toolbar button status
			this.publish(this.id + "_normalizedDisplayChanged", [this]);
		},
		addPlugin: function(/*String||Object||Function*/ plugin, /*Integer?*/ index){
			// summary:
			//		takes a plugin name as a string or a plugin instance and
			//		adds it to the toolbar and associates it with this editor
			//		instance. The resulting plugin is added to the Editor's
			//		plugins array. If index is passed, it's placed in the plugins
			//		array at that index. No big magic, but a nice helper for
			//		passing in plugin names via markup.
			// plugin:
			//		String, args object, plugin instance, or plugin constructor
			// args:
			//		This object will be passed to the plugin constructor
			// index:
			//		Used when creating an instance from
			//		something already in this.plugins. Ensures that the new
			//		instance is assigned to this.plugins at that index.
			var args = rias.isString(plugin) ? {
				name: plugin
			} : rias.isFunction(plugin) ? {
				ctor: plugin
			} : rias.mixin({}, plugin);
			if(!args.ownerRiasw){
				args.ownerRiasw = this;
			}
			if(!args.setEditor){
				var obj = {
					"args": args,
					"plugin": null,
					"editor": this
				};
				if(args.name){
					// search registry for a plugin factory matching args.name, if it's not there then
					// fallback to 1.0 API:
					// ask all loaded plugin modules to fill in obj.plugin if they can (ie, if they implement args.name)
					// remove fallback for 2.0.
					if(_Plugin.registry[args.name]){
						obj.plugin = _Plugin.registry[args.name](args);
					}
				}
				if(!obj.plugin){
					try{
						var pc = args.ctor;
						if(pc){
							obj.plugin = new pc(args);
						}
					}catch(e){
						console.error(this.id + ": cannot new plugin instance of [" + args.name + "]");
						return;
					}
				}
				if(!obj.plugin){
					console.error(this.id + ": cannot find plugin [" + args.name + "]");
					return;
				}else{
					plugin = obj.plugin;
				}
			}
			if(plugin){
				if(arguments.length > 1){
					this._plugins[index] = plugin;
				}else{
					this._plugins.push(plugin);
				}
				plugin.setEditor(this);
				if(rias.isFunction(plugin.setToolbar)){
					plugin.setToolbar(this.toolbar);
				}
			}
		},

		_onIEMouseDown: function(/*Event*/ e){
			// summary:
			//		IE only to prevent 2 clicks to focus
			// tags:
			//		private
			var outsideClientArea;
			// IE 8's componentFromPoint is broken, which is a shame since it
			// was smaller code, but oh well.  We have to do this brute force
			// to detect if the click was scroller or not.
			var b = this.document.body;
			var clientWidth = b.clientWidth;
			var clientHeight = b.clientHeight;
			var clientLeft = b.clientLeft;
			var offsetWidth = b.offsetWidth;
			var offsetHeight = b.offsetHeight;
			var offsetLeft = b.offsetLeft;

			//Check for vertical scroller click.
			if(/^rtl$/i.test(b.dir || "")){
				if(clientWidth < offsetWidth && e.x > clientWidth && e.x < offsetWidth){
					// Check the click was between width and offset width, if so, scroller
					outsideClientArea = true;
				}
			}else{
				// RTL mode, we have to go by the left offsets.
				if(e.x < clientLeft && e.x > offsetLeft){
					// Check the click was between width and offset width, if so, scroller
					outsideClientArea = true;
				}
			}
			if(!outsideClientArea){
				// Okay, might be horiz scroller, check that.
				if(clientHeight < offsetHeight && e.y > clientHeight && e.y < offsetHeight){
					// Horizontal scroller.
					outsideClientArea = true;
				}
			}
			if(!outsideClientArea){
				delete this._cursorToStart; // Remove the force to cursor to start position.
				delete this._savedSelection; // new mouse position overrides old selection
				if(e.target.tagName === "BODY"){
					this.defer("placeCursorAtEnd");
				}
				this.inherited(arguments);
			}
		},
		onBeforeActivate: function(){
			this._restoreSelection();
		},
		onBeforeDeactivate: function(e){
			// summary:
			//		Called on IE right before focus is lost.   Saves the selected range.
			// tags:
			//		private
			if(this.customUndo){
				this.endEditing(true);
			}
			//in IE, the selection will be lost when other elements get focus,
			//let's save focus before the editor is deactivated
			if(e.target.tagName !== "BODY"){
				this._saveSelection();
			}
			//console.log('onBeforeDeactivate',this);
		},

		/* beginning of custom undo/redo support */

		// customUndo: Boolean
		//		Whether we shall use custom undo/redo support instead of the native
		//		browser support. By default, we now use custom undo.  It works better
		//		than native browser support and provides a consistent behavior across
		//		browsers with a minimal performance hit.  We already had the hit on
		//		the slowest browser, IE, anyway.
		customUndo: true,

		// editActionInterval: Integer
		//		When using customUndo, not every keystroke will be saved as a step.
		//		Instead typing (including delete) will be grouped together: after
		//		a user stops typing for editActionInterval seconds, a step will be
		//		saved; if a user resume typing within editActionInterval seconds,
		//		the timeout will be restarted. By default, editActionInterval is 3
		//		seconds.
		editActionInterval: 3,

		beginEditing: function(cmd){
			// summary:
			//		Called to note that the user has started typing alphanumeric characters, if it's not already noted.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(!this._inEditing){
				this._inEditing = true;
				this._beginEditing(cmd);
			}
			if(this.editActionInterval > 0){
				if(this._editTimer){
					this._editTimer.remove();
				}
				this._editTimer = this.defer("endEditing", this._editInterval);
			}
		},

		// TODO: declaring these in the prototype is meaningless, just create in the constructor/postCreate
		_steps: [],
		_undoedSteps: [],

		execCommand: function(cmd){
			// summary:
			//		Main handler for executing any commands to the editor, like paste, bold, etc.
			//		Called by plugins, but not meant to be called by end users.
			// tags:
			//		protected
			if(this.customUndo && (cmd === 'undo' || cmd === 'redo')){
				return this[cmd]();
			}else{
				if(this.customUndo){
					this.endEditing();
					this._beginEditing();
				}
				var r = this.inherited(arguments);
				if(this.customUndo){
					this._endEditing();
				}
				return r;
			}
		},

		_pasteImpl: function(){
			// summary:
			//		Over-ride of paste command control to make execCommand cleaner
			// tags:
			//		Protected
			return this._clipboardCommand("paste");
		},

		_cutImpl: function(){
			// summary:
			//		Over-ride of cut command control to make execCommand cleaner
			// tags:
			//		Protected
			return this._clipboardCommand("cut");
		},

		_copyImpl: function(){
			// summary:
			//		Over-ride of copy command control to make execCommand cleaner
			// tags:
			//		Protected
			return this._clipboardCommand("copy");
		},

		_clipboardCommand: function(cmd){
			// summary:
			//		Function to handle processing clipboard commands (or at least try to).
			// tags:
			//		Private
			var r;
			try{
				// Try to exec the superclass exec-command and see if it works.
				r = this.document.execCommand(cmd, false, null);
				if(has("webkit") && !r){ //see #4598: webkit does not guarantee clipboard support from js
					console.error(this.id + "._clipboardCommand error. " + cmd); // throw to show the warning
				}
			}catch(e){
				//Ticket #18467 removed the checks to specific codes
				// Warn user of platform limitation.  Cannot programmatically access clipboard. See ticket #4136
				var sub = rias.substitute,
					accel = {
						cut: 'X',
						copy: 'C',
						paste: 'V'
					};
				sub = sub(this.commands.systemShortcut, [this.commands[cmd], sub(this.commands[has("mac") ? 'appleKey' : 'ctrlKey'], [accel[cmd]])]);
				console.error(sub);
				rias.error(sub, this);
				r = false;
			}
			return r;
		},

		queryCommandEnabled: function(cmd){
			// summary:
			//		Returns true if specified editor command is enabled.
			//		Used by the plugins to know when to highlight/not highlight buttons.
			// tags:
			//		protected
			if(this.customUndo && (cmd === 'undo' || cmd === 'redo')){
				return cmd === 'undo' ? (this._steps.length > 1) : (this._undoedSteps.length > 0);
			}else{
				return this.inherited(arguments);
			}
		},
		_moveToBookmark: function(b){
			// summary:
			//		Selects the text specified in bookmark b
			// tags:
			//		private
			var bookmark = b.mark;
			var mark = b.mark;
			var col = b.isCollapsed;
			var r, sNode, eNode, sel;
			if(mark){
				if(has("ie") < 9 || (has("ie") === 9 && has("quirks"))){
					if(rias.isArray(mark)){
						// IE CONTROL, have to use the native bookmark.
						bookmark = [];
						rias.forEach(mark, function(n){
							bookmark.push(rangeapi.getNode(n, this.editNode));
						}, this);
						this.selection.moveToBookmark({mark: bookmark, isCollapsed: col});
					}else{
						if(mark.startContainer && mark.endContainer){
							// Use the pseudo WC3 range API.  This works better for positions
							// than the IE native bookmark code.
							sel = rangeapi.getSelection(this.window);
							if(sel && sel.removeAllRanges){
								sel.removeAllRanges();
								r = rangeapi.create(this.window);
								sNode = rangeapi.getNode(mark.startContainer, this.editNode);
								eNode = rangeapi.getNode(mark.endContainer, this.editNode);
								if(sNode && eNode){
									// Okay, we believe we found the position, so add it into the selection
									// There are cases where it may not be found, particularly in undo/redo, when
									// IE changes the underlying DOM on us (wraps text in a <p> tag or similar.
									// So, in those cases, don't bother restoring selection.
									r.setStart(sNode, mark.startOffset);
									r.setEnd(eNode, mark.endOffset);
									sel.addRange(r);
								}
							}
						}
					}
				}else{//w3c range
					sel = rangeapi.getSelection(this.window);
					if(sel && sel.removeAllRanges){
						sel.removeAllRanges();
						r = rangeapi.create(this.window);
						sNode = rangeapi.getNode(mark.startContainer, this.editNode);
						eNode = rangeapi.getNode(mark.endContainer, this.editNode);
						if(sNode && eNode){
							// Okay, we believe we found the position, so add it into the selection
							// There are cases where it may not be found, particularly in undo/redo, when
							// formatting as been done and so on, so don't restore selection then.
							r.setStart(sNode, mark.startOffset);
							r.setEnd(eNode, mark.endOffset);
							sel.addRange(r);
						}
					}
				}
			}
		},
		_changeToStep: function(from, to){
			// summary:
			//		Reverts editor to "to" setting, from the undo stack.
			// tags:
			//		private
			this.set("value", to.text);
			var b = to.bookmark;
			if(!b){
				return;
			}
			this._moveToBookmark(b);
		},
		undo: function(){
			// summary:
			//		Handler for editor undo (ex: ctrl-z) operation
			// tags:
			//		private
			var ret = false;
			if(!this._undoRedoActive){
				this._undoRedoActive = true;
				this.endEditing(true);
				var s = this._steps.pop();
				if(s && this._steps.length > 0){
					this.focus();
					this._changeToStep(s, this._steps[this._steps.length - 1]);
					this._undoedSteps.push(s);
					this.onDisplayChanged();
					delete this._undoRedoActive;
					ret = true;
				}
				delete this._undoRedoActive;
			}
			return ret;
		},
		redo: function(){
			// summary:
			//		Handler for editor redo (ex: ctrl-y) operation
			// tags:
			//		private
			var ret = false;
			if(!this._undoRedoActive){
				this._undoRedoActive = true;
				this.endEditing(true);
				var s = this._undoedSteps.pop();
				if(s && this._steps.length > 0){
					this.focus();
					this._changeToStep(this._steps[this._steps.length - 1], s);
					this._steps.push(s);
					this.onDisplayChanged();
					ret = true;
				}
				delete this._undoRedoActive;
			}
			return ret;
		},
		endEditing: function(ignore_caret){
			// summary:
			//		Called to note that the user has stopped typing alphanumeric characters, if it's not already noted.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(this._editTimer){
				this._editTimer = this._editTimer.remove();
			}
			if(this._inEditing){
				this._endEditing(ignore_caret);
				this._inEditing = false;
			}
		},

		_getBookmark: function(){
			// summary:
			//		Get the currently selected text
			// tags:
			//		protected
			var b = this.selection.getBookmark();
			var tmp = [];
			if(b && b.mark){
				var mark = b.mark;
				if(has("ie") < 9 || (has("ie") === 9 && has("quirks"))){
					// Try to use the pseudo range API on IE for better accuracy.
					var sel = rangeapi.getSelection(this.window);
					if(!rias.isArray(mark)){
						if(sel){
							var range;
							if(sel.rangeCount){
								range = sel.getRangeAt(0);
							}
							if(range){
								b.mark = range.cloneRange();
							}else{
								b.mark = this.selection.getBookmark();
							}
						}
					}else{
						// Control ranges (img, table, etc), handle differently.
						rias.forEach(b.mark, function(n){
							tmp.push(rangeapi.getIndex(n, this.editNode).o);
						}, this);
						b.mark = tmp;
					}
				}
				try{
					if(b.mark && b.mark.startContainer){
						tmp = rangeapi.getIndex(b.mark.startContainer, this.editNode).o;
						b.mark = {startContainer: tmp,
							startOffset: b.mark.startOffset,
							endContainer: b.mark.endContainer === b.mark.startContainer ? tmp : rangeapi.getIndex(b.mark.endContainer, this.editNode).o,
							endOffset: b.mark.endOffset};
					}
				}catch(e){
					b.mark = null;
				}
			}
			return b;
		},
		_beginEditing: function(){
			// summary:
			//		Called when the user starts typing alphanumeric characters.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private
			if(this._steps.length === 0){
				// You want to use the editor content without post filtering
				// to make sure selection restores right for the 'initial' state.
				// and undo is called.  So not using this.value, as it was 'processed'
				// and the line-up for selections may have been altered.
				this._steps.push({'text': htmlapi.getChildrenHtml(this.editNode), 'bookmark': this._getBookmark()});
			}
		},
		_endEditing: function(){
			// summary:
			//		Called when the user stops typing alphanumeric characters.
			//		Deals with saving undo; see editActionInterval parameter.
			// tags:
			//		private

			// Avoid filtering to make sure selections restore.
			var v = htmlapi.getChildrenHtml(this.editNode);

			this._undoedSteps = [];//clear undoed steps
			this._steps.push({text: v, bookmark: this._getBookmark()});
		},
		onKeyDown: function(e){
			// summary:
			//		Handler for onkeydown event.
			// tags:
			//		private

			//We need to save selection if the user TAB away from this editor
			//no need to call _saveSelection for IE, as that will be taken care of in onBeforeDeactivate
			if(!has("ie") && !this.iframe && e.keyCode === keys.TAB && !this.tabIndent){
				this._saveSelection();
			}
			if(!this.customUndo){
				this.inherited(arguments);
				return;
			}
			var k = e.keyCode;
			if(e.ctrlKey && !e.shiftKey && !e.altKey){//undo and redo only if the special right Alt + z/y are not pressed #5892
				if(k === 90 || k === 122){ //z, but also F11 key
					e.stopPropagation();
					e.preventDefault();
					this.undo();
					return;
				}else if(k === 89 || k === 121){ //y
					e.stopPropagation();
					e.preventDefault();
					this.redo();
					return;
				}
			}
			this.inherited(arguments);

			switch(k){
				case keys.ENTER:
				case keys.BACKSPACE:
				case keys.DELETE:
					this.beginEditing();
					break;
				case 88: //x
				case 86: //v
					if(e.ctrlKey && !e.altKey && !e.metaKey){
						this.endEditing();//end current typing step if any
						if(e.keyCode === 88){
							this.beginEditing('cut');
						}else{
							this.beginEditing('paste');
						}
						//use timeout to trigger after the paste is complete
						this.defer("endEditing", 1);
						break;
					}
				//pass through
				default:
					if(!e.ctrlKey && !e.altKey && !e.metaKey && (e.keyCode < keys.F1 || e.keyCode > keys.F15)){
						this.beginEditing();
						break;
					}
				//pass through
				case keys.ALT:
					this.endEditing();
					break;
				case keys.UP_ARROW:
				case keys.DOWN_ARROW:
				case keys.LEFT_ARROW:
				case keys.RIGHT_ARROW:
				case keys.HOME:
				case keys.END:
				case keys.PAGE_UP:
				case keys.PAGE_DOWN:
					this.endEditing(true);
					break;
				//maybe ctrl+backspace/delete, so don't endEditing when ctrl is pressed
				case keys.CTRL:
				case keys.SHIFT:
				case keys.TAB:
					break;
			}
		},
		_onBlur: function(){
			// summary:
			//		Called from focus manager when focus has moved away from this editor
			// tags:
			//		protected

			//this._saveSelection();
			this.inherited(arguments);
			this.endEditing(true);
		},
		_saveSelection: function(){
			// summary:
			//		Save the currently selected text in _savedSelection attribute
			// tags:
			//		private
			try{
				this._savedSelection = this._getBookmark();
			}catch(e){ /* Squelch any errors that occur if selection save occurs due to being hidden simultaneously. */
			}
		},
		_restoreSelection: function(){
			// summary:
			//		Re-select the text specified in _savedSelection attribute;
			//		see _saveSelection().
			// tags:
			//		private
			if(this._savedSelection){
				// Clear off cursor to start, we're deliberately going to a selection.
				delete this._cursorToStart;
				// only restore the selection if the current range is collapsed
				// if not collapsed, then it means the editor does not lose
				// selection and there is no need to restore it
				if(this.selection.isCollapsed()){
					this._moveToBookmark(this._savedSelection);
				}
				delete this._savedSelection;
			}
		},

		onClick: function(){
			// summary:
			//		Handler for when editor is clicked
			// tags:
			//		protected
			this.endEditing(true);
			this.inherited(arguments);
		},

		replaceValue: function(/*String*/ html){
			// summary:
			//		over-ride of replaceValue to support custom undo and stack maintenance.
			// tags:
			//		protected
			if(!this.customUndo){
				this.inherited(arguments);
			}else{
				if(this.isClosed){
					this.set("value", html);
				}else{
					this.beginEditing();
					if(!html){
						html = "&#160;";	// &nbsp;
					}
					this.set("value", html);
					this.endEditing();
				}
			}
		},

		_setDisabledAttr: function(/*Boolean*/ value){
			this.setValueDeferred.then(rias.hitch(this, function(){
				if((!this.disabled && value) || (!this._buttonEnabledPlugins && value)){
					// Disable editor: disable all enabled buttons and remember that list
					rias.forEach(this._plugins, function(p){
						p.set("disabled", true);
					});
				}else if(this.disabled && !value){
					// Restore plugins to being active.
					rias.forEach(this._plugins, function(p){
						p.set("disabled", false);
					});
				}
			}));
			this.inherited(arguments);
		},

		_setStateClass: function(){
			try{
				this.inherited(arguments);

				// Let theme set the editor's text color based on editor enabled/disabled state.
				// We need to jump through hoops because the main document (where the theme CSS is)
				// is separate from the iframe's document.
				if(this.document && this.document.body){
					_dom.setStyle(this.document.body, "color", _dom.getStyle(this.iframe, "color"));
				}
			}catch(e){ /* Squelch any errors caused by focus change if hidden during a state change */
			}
		}
	});

	Widget.pluginsBase = pluginsBase;
	Widget.pluginsAll = pluginsAll;

	Widget.makeParams = function(params){
		var p = params.plugins;
		if(rias.isArray(p)){
			if(p.length === 0){
				//p = pluginsBase;
			}
		}else if(rias.isString(p)){
			if(p.toLowerCase() === "all"){
				p = pluginsAll;
				//}else if(p.toLowerCase() === "default"){
				//	p = pluginsBase;
			}else{
				p = pluginsBase;
			}
		}else{
			p = pluginsBase;
		}
		delete params.plugins;
		params = rias.mixinDeep({}, {
			extraPlugins: [],
			plugins: p
		}, params);
		return params;
	};
	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
			"minHeight": {
				"datatype": "string",
				"defaultValue": "1em",
				"title": "minHeight"
			},
			"updateInterval": {
				"datatype": "number",
				"defaultValue": 200,
				"title": "Timeout Change"
			},
			"value": {
				"datatype": "string",
				"description": "The value of the editor.",
				"hidden": false
			},
			"tabIndex": {
				"datatype": "string",
				"description": "Widget tab index.",
				"hidden": false
			}
		}
	};

	return Widget;

});