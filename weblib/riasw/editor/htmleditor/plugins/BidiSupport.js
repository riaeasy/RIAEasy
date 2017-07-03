define([
	"riasw/riaswBase",
	"riasw/form/ToggleButton",
	"../_Plugin",
	"../range",
	"./NormalizeIndentOutdent",
	"./EnterKeyHandling",
	"./FontChoice",
	"dojo/i18n!./nls/BidiSupport"
], function(rias, ToggleButton, _Plugin, rangeapi, NormIndentOutdent, EnterKeyHandling, FontChoice){

	// module:
	//		rtebidi/BidiSupport

	var pluginsName = "riasw.editor.htmleditor.plugins";
	var has = rias.has,
		query = rias.dom.query;

	var BidiSupport = rias.declare(pluginsName + ".BidiSupport", _Plugin, {
		// summary:
		//		This plugin provides some advanced BiDi support for 
		//		rich text editing widget. It adds several bidi-specific commands,
		//		which are not released in native RTE's ('set text direction to left-to-right', 
		//		'set text direction to right-to-left', 'change text direction to opposite') 
		//		and overrides some existing native commands.
		
		// Override _Plugin.useDefaultCommand.
		useDefaultCommand: false,
		
		// Override _Plugin.buttonClass. Plugin uses two buttons, defined below.
		buttonClass: null,

		command: "bidiSupport",

		// blockMode: [const] String
		//		This property decides the behavior of Enter key, actually released by EnterKeyHandling 
		//		plugin. Possible values are 'P' and 'DIV'. Used when EnterKeyHandling isn't included 
		//		into the list of the base plugins, loaded with the current Editor, as well as in case,  
		//		if blockNodeForEnter property of EnterKeyHandling plugin isn't set to 'P' or 'DIV'.
		//		The default value is "DIV".
		blockMode: "DIV",

		// shortcutonly: [const] Boolean
		//		If this property is set to 'false', plugin handles all text direction commands
		//		and its behavior is controlled both by buttons and by shortcut (Ctrl+Shift+X). 
		//		In opposite case only command 'change text direction to opposite', controlled by shortcut, 
		//		is supported, and buttons don't appear in the toolbar.
		//		Defaults to false.
		shortcutonly: false,

		// bogusHtmlContent: [private] String
		//		HTML to stick into a new empty block	
		bogusHtmlContent: '&nbsp;',

		// buttonLtr: [private] riasw/form/ToggleButton
		//		Used to set direction of the selected text to left-to-right.
		buttonLtr: null,
		
		// buttonRtl: [private] riasw/form/ToggleButton
		//		Used to set direction of the selected text to right-to-left.
		buttonRtl: null,

		_indentBy: 40,
		_lineTextArray: ["DIV","P","LI","H1","H2","H3","H4","H5","H6","ADDRESS","PRE","DT","DE","TD"],
		_lineStyledTextArray: ["H1","H2","H3","H4","H5","H6","ADDRESS","PRE","P"],
		_tableContainers: ["TABLE","THEAD","TBODY","TR"],
		_blockContainers: ["TABLE","OL","UL","BLOCKQUOTE"],
		
		_initButton: function(){
			// summary:
			//		Override _Plugin._initButton(). Creates two buttons, used for
			//		setting text direction to left-to-right and right-to-left.
			if(this.shortcutonly){
				return;
			}
			if(!this.buttonLtr){
				this.buttonLtr = this._createButton("ltr");
			}
			if(!this.buttonRtl){		
				this.buttonRtl = this._createButton("rtl");
			}
		},

		_createButton: function(direction){
			// summary:
			//		Initialize specific button. 
			this._nlsResources = rias.i18n.getLocalization(pluginsName, "BidiSupport");
			return new ToggleButton(rias.mixin({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: this._nlsResources[direction],
				tooltip: this._nlsResources[direction],
				dir: this.editor.dir,
				lang: this.editor.lang,
				showLabel: false,
				iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + (direction === "ltr" ? "ParaLeftToRight" : "ParaRightToLeft"),
				onClick: rias.hitch(this, "_changeState", [direction])
			}, this.params || {}));			
		},

		setToolbar: function(/*riasw.sys.Toolbar*/ toolbar){
			// summary:
			//		Override _Plugin.setToolbar(). Adds buttons so, that 'ltr' button 
			//		will appear from the left of 'rtl' button regardless of the editor's 
			//		orientation.
			if(this.shortcutonly){
				return;
			}
			if(this.editor.isLeftToRight()){
				toolbar.addChild(this.buttonLtr);
				toolbar.addChild(this.buttonRtl);
			}else{
				toolbar.addChild(this.buttonRtl);
				toolbar.addChild(this.buttonLtr);			
			}
		},

		updateState: function(){
			// summary:
			//		Override _Plugin.updateState(). Determines direction of the text in the 
			//		start point of the current selection. Changes state of the buttons
			//		correspondingly.
			if(!this.editor || !this.editor.isLoaded || this.shortcutonly){
				return;
			}
			this.buttonLtr.set("disabled", !!this.disabled);
			this.buttonRtl.set("disabled", !!this.disabled);
			if(this.disabled){
				return;
			}
			var sel = rangeapi.getSelection(this.editor.window);
			if(!sel || sel.rangeCount === 0){
				return;
			}	
			var range = sel.getRangeAt(0), node;
			if(range.startContainer === this.editor.editNode && !range.startContainer.hasChildNodes()){
				node = range.startContainer;
			}else{
				var startNode = range.startContainer,
					startOffset = range.startOffset;
				if(this._isBlockElement(startNode)){
					while(startNode.hasChildNodes()){
						if(startOffset === startNode.childNodes.length){
							startOffset--;
						}
						startNode = startNode.childNodes[startOffset];
						startOffset = 0;
					}
				}
				node = this._getBlockAncestor(startNode);
			}
			var cDir = rias.dom.getStyle(node, "direction");
			this.buttonLtr.set("checked", "ltr" === cDir);
			this.buttonRtl.set("checked", "rtl" === cDir);
		},
		
		setEditor: function(/*Editor*/ editor){
			// summary:
			//		Override _Plugin.setEditor().
			// description:
			//		Sets editor's flag 'advancedBidi' to true, which may be used by other plugins 
			//		as a switch to bidi-specific behaviour. Adds bidi-specific filters, including 
			//		postDom filter, which provides explicit direction settings for the blocks 
			//		of the text, direction of which isn't defined. Overrides some native commands,
			//		which should be changed or expanded in accordance with bidi-specific needs.
			//		Loads EnterKeyHandling plugin, if it was not loaded, and changes its 
			//		blockNodeForEnter property, if it is needed. Defines shortcut, which will cause
			//		execution of 'change text direction to opposite' ('mirror') command.
			this.editor = editor;
			if(this.blockMode !== "P" && this.blockMode !== "DIV"){
				this.blockMode = "DIV";
			}
			this._initButton();
			var self = this;
			// FF: RTL-oriented DIV's, containing new lines and/or tabs,  can't be converted to lists (exception in native execCommand)
			// Delete new lines and tabs from everywhere excluding contents of PRE elements.
			editor.contentPreFilters.push(this._preFilterNewLines);
			// Explicit direction setting
			var postDomFilterSetDirExplicitly = function(node){
				if(self.disabled || !node.hasChildNodes()){
					return node;
				}
				self._changeStateOfBlocks(editor.editNode, editor.editNode, editor.editNode, "explicitdir", null);
				return editor.editNode;
			};
			editor.contentDomPostFilters.push(postDomFilterSetDirExplicitly);
			// FF: Native change alignment command for more then one DIV doesn't change actually alignment, but damages 
			// markup so, that selected DIV's are converted into sequence of text elements, separated by <br>'s.
			// Override native command
			editor._justifyleftImpl = function(){
				self._changeState("left");
				return true;
			};
			editor._justifyrightImpl = function(){
				self._changeState("right");
				return true;
			};
			editor._justifycenterImpl = function(){
				self._changeState("center");
				return true;
			};
			// FF:	When blocks are converted into list items, their attributes are lost.
			// IE:	1)Instead of converting regular block into list item, IE includes block into the newly created item,
			//		so attributes and styles don't appear in the item.
			//		2)IE always converts list item into <P>.
			// Expand native command		
			editor._insertorderedlistImpl = function(){//rias.hitch(this, "_insertLists", "insertorderedlist");
				self._insertLists("insertorderedlist");
			};
			editor._insertunorderedlistImpl = function(){//rias.hitch(this, "_insertLists", "insertunorderedlist");
				self._insertLists("insertunorderedlist");
			};

			// IE:	Direction of newly created blockquotes is set explicitly,
			//		which creates problems for further editing of the text.
			//	Expand native command
			editor._indentImpl = function(){//rias.hitch(this, "_indentAndOutdent", "indent");
				self._indentAndOutdent("indent");
			};

			// FF:	Outdent for the list items from the first level's list converts them into sequence of 
			//		text elements, separated by <BR>s. Attributes of list items are lost.
			//	Expand native command
			editor._outdentImpl = function(){//rias.hitch(this, "_indentAndOutdent", "outdent");
				self._indentAndOutdent("outdent");
			};

			// FF:	1)Instead of converting <div> to some other block, FF includes newly created block into 
			//		old <div>. Excessive nesting blocks creates problems for further working with the text.
			//		2)Formatting contents of more then one list item (but less then all items in the list) 
			//		caused unexpected merge of their contents.
			//	Expand native command
			editor._formatblockImpl = function(){//rias.hitch(this, "_formatBlocks");
				self._formatBlocks();
			};

			editor.onLoadDeferred.then(function(){
				var edPlugins = editor._plugins,
					i, p,
					ind = edPlugins.length;

				editor.addKeyHandler('9', 1, 0, function(){//rias.hitch(self, "_changeState", "mirror"),
					self._changeState("mirror");
				}); //Ctrl-9
				editor.addKeyHandler('8', 1, 0, function(){//rias.hitch(self, "_changeState", "ltr"),
					self._changeState("ltr");
				}); //Ctrl-8
				editor.addKeyHandler('0', 1, 0, function(){//rias.hitch(self, "_changeState", "rtl");
					self._changeState("rtl");
				}); //Ctrl-0

				for(i = 0; i < edPlugins.length; i++){
					p = edPlugins[i];
					if (!p){
						continue;
					}
					if(p.constructor === EnterKeyHandling){
						p.destroy();
						p = null;
						ind = i;
					}else if(p.constructor === NormIndentOutdent){
						editor._normalizeIndentOutdent = true;
						editor._indentImpl = rias.hitch(self, "_indentAndOutdent", "indent");
						editor._outdentImpl = rias.hitch(self, "_indentAndOutdent", "outdent");
					}else if(p.constructor === FontChoice && p.command === "formatBlock"){
						self.own(rias.before(p.button, "_execCommand", rias.hitch(self, "_handleNoFormat")));
					}
				}
				editor.addPlugin({
					name: "enterKeyHandling",
					blockNodeForEnter: self.blockMode,
					blockNodes: /^(?:P|H1|H2|H3|H4|H5|H6|LI|DIV)$/
				}, ind);
				p = editor._plugins[ind];
				self.own(rias.after(p, "handleEnterKey", function(){//rias.hitch(self, "_checkNewLine"), true));
					return self._checkNewLine();
				}, true));
			});
			//this.own(rias.after(editor, "onNormalizedDisplayChanged", rias.hitch(this, "updateState"), true));
			self.subscribe(editor.id + "_normalizedDisplayChanged", function(){
				self.updateState();
			});
		},

		_checkNewLine: function(){
			var range = rangeapi.getSelection(this.editor.window).getRangeAt(0);
			var curBlock = rangeapi.getBlockAncestor(range.startContainer, null, this.editor.editNode).blockNode;
			if (curBlock.innerHTML === this.bogusHtmlContent && curBlock.previousSibling){
				curBlock.style.cssText = curBlock.previousSibling.style.cssText;
			}else if(curBlock.innerHTML !== this.bogusHtmlContent && curBlock.previousSibling && curBlock.previousSibling.innerHTML === this.bogusHtmlContent){
				 curBlock.previousSibling.style.cssText = curBlock.style.cssText;
			}
		},
		
		_handleNoFormat: function(editor, command, choice){
			if (choice === "noFormat"){
				return [editor, command, "DIV"];
			}
			return arguments;
		},
		
		_execNativeCmd: function(cmd, arg, info){
			// summary:
			//		Call native command for nodes inside selection
			// cmd:
			//		Name of the command (like "insertorderedlist" or "indent")
			// arg:
			//		Arguments of the command
			// info:
			//		Object containing
			//			nodes:  array of all block nodes, which should be handled by this command
			//			groups: array containing groups of nodes. Nodes from each group should be handled by separate 
			//					execution of current command
			//			cells:	array of cells, contents of which should be handled by current command
			// description:
			//			Sometimes native commands "insertorderedlist", "insertunorderedlist", "indent",
			//		"outdent" and "formatblocks" are the cause of various problems. These problems have 
			//		different levels of severity - from crashing of their executing or damage of the editor's 
			//		content to creating visually correct results, which however can cause the future problems,  
			//		not always bidi-specific. For example, Webkit fails with insertlist commands, if selection  
			//		contains some block element (like <H1> or <DIV>), followed by the table, and few cells of  
			//		this table.IE fails,when try to handle insertlist command for list items, containing <PRE>.  
			//		Mozilla and IE produce wrong results for selection,containing more then one cell. Mozilla  
			//		merges contents of some listitems with "formatblock" command. Safari places DIV's in the 
			//		same list with newly created list items. Webkit creates multilevel blocks to format the text.   
			//		IE adds to the list lines of the text,which are outside the selection. Webkit put whole table  
			//		into list item. All browsers lose direction and alignment styles with outdent command,    
			//		executed for items from one-level list. Etc.
			//			We try to avoid these problems and produce correct (and more or less similar) results for     
			//		all supported browsers. This is achieved by separating the each above-mentioned command into 
			//		three parts.
			//			The first ("preparelist","prepareindent","prepareoutdent" and "prepareformat") is performed 
			//		before corresponding native call. It prepares selected region of the editor's content by 
			//		rebuilding it with strong block structure and keeps info about each group of selected  
			//		elements. Separate groups are created for contents of each table cell, as well as for lines of 
			//		text that are before, after and between tables. In case of webkit and insertlist or formatblocks
			//		commands, each selected block element is placed into separate "group".
			//			The second part of the command is native call itself. Native calls are executed separately
			//		for each group of nodes. This requires to reset a selection, each time limiting it to only   
			//		the elements of the current group. 
			//			The third part is perfomed after native call. Its role is to restore missing styles,  
			//		to delete bogus elements, created in the previous steps, to merge sibling lists etc.  
			//		Corresponding commands have the same names, as native (e.g., "insertorderedlist',  
			//		"insertunorderedlist", "indent", "outdent" and "formatblocks"), because just they produce 
			//		the final result. For IE and Mozilla we call one "post" command per native call. For webkit 
			//		we call one "post" command per group of elements.
			
			// If info contains only one group of elements, we, as usually, perform one native call per selection  
			if(this._isSimpleInfo(info)){
				var result = this.editor.document.execCommand(cmd, false, arg);
				// After some operations (like insert lists into cells of tables) webkit inserts BR before table
				if(has("webkit")){
					query("table",this.editor.editNode).prev().forEach(function(x,ind,arr){
						if(this._hasTag(x,"BR")){
							x.parentNode.removeChild(x);
						}
					},this);
				}
				return result;
			}
			var sel = rangeapi.getSelection(this.editor.window);
			if(!sel || sel.rangeCount === 0){
				return false;
			}
			var range = sel.getRangeAt(0),
				tempRange = range.cloneRange();
			var startContainer = range.startContainer,
				startOffset = range.startOffset,
				endContainer = range.endContainer,
				endOffset = range.endOffset;
			for(var i = 0; i < info.groups.length; i++){
				var group = info.groups[i];
				// Set selection for currrent group of elements
				var eOffs = group[group.length - 1].childNodes.length;
				tempRange.setStart(group[0], 0);
				tempRange.setEnd(group[group.length - 1], eOffs);
				sel.removeAllRanges();
				sel.addRange(tempRange);
				var table = this.editor.selection.getParentOfType(group[0], ["TABLE"]);
				// Execute native command for current group
				var returnValue = this.editor.document.execCommand(cmd, false, arg);
				if(has("webkit")){
					if(table && this._hasTag(table.previousSibling, "BR")){
						table.parentNode.removeChild(table.previousSibling);
					}
					this.editor.focus();
					// Keep info about entire selection
					sel = rangeapi.getSelection(this.editor.window);
					var internalRange = sel.getRangeAt(0);
					if(i === 0){
						startContainer = internalRange.endContainer;
						startOffset = internalRange.endOffset;
					}else if(i === info.groups.length - 1){
						endContainer = internalRange.endContainer;
						endOffset = internalRange.endOffset;
					}
				}
				if(!returnValue){
					break;
				}
				// For webkit we execute "post" command for each group of elements. 
				if(has("webkit")){
					this._changeState(cmd);
				}
			}
			// Restore selection
			sel.removeAllRanges();
			try{
				tempRange.setStart(startContainer, startOffset);
				tempRange.setEnd(endContainer, endOffset);
				sel.addRange(tempRange);
			}catch(e){
			}
			return true;
		},
		
		_insertLists: function(cmd){
			// summary:
			//		Overrides native insertorderlist and insertunorderlist commands.
			// cmd: 
			//		Name of the command, one of "insertorderedlist" or "insertunorderedlist"
			// description:
			//		Overrides native insertorderlist and insertunorderlist commands with the goal 
			//		to avoid some bidi-specific problems that arise when these commands are executed. 
			//		Performed in three steps:
			//		1)	prepares selected fragment of the document to execution of native command. 
			//		2)	executes corresponding native command
			//		3)	updates contents of selected fragment of the document after execution of
			//			native comand.
			var info = this._changeState("preparelists",cmd);
			var returnValue = this._execNativeCmd(cmd, null, info);
			if(!returnValue){
				return false;
			}
			// For webkit "post" command executed separately for each group of elements.  
			if(!has("webkit") || this._isSimpleInfo(info)){
				this._changeState(cmd);
			} 
			this._cleanLists();
			this._mergeLists();
			return true;
		},
		
		_indentAndOutdent: function(cmd){
			// summary:
			//		Overrides native indent and outdent commands.
			// cmd:
			//		Name of the command, of of "indent" or "outdent"
			// description:
			//		Overrides native indent and outdent commands with the goal to avoid some 
			//		bidi-specific problems that arise when these commands are executed. 
			//		Performed in three steps:
			//		1)	prepares selected fragment of the document to execution of native command
			//			(outdent only).
			//		2)	executes corresponding native command
			//		3)	updates contents of selected fragment of the document after execution of
			//			native comand.
			if(this.editor._normalizeIndentOutdent){
				// To emulate NormalizeIndentOutdent
				this._changeState("normalize" + cmd);
				return true;
			}
			var oldValue,
				info = this._changeState("prepare" + cmd);

			// If useCSS and styleWithCSS both set to false, mozilla creates blockquotes
			if(has("mozilla")){
				try{
					oldValue = this.editor.document.queryCommandValue("styleWithCSS");
				}catch(e){
					oldValue = false;
				}
				this.editor.document.execCommand("styleWithCSS", false, true);
			}

			var returnValue = this._execNativeCmd(cmd, null, info);
			if(has("mozilla")){
				this.editor.document.execCommand("styleWithCSS", false, oldValue);
			}
			if(!returnValue){
				return false;
			}
			this._changeState(cmd);
			this._mergeLists();
			return true;
		},

		_formatBlocks: function(arg){
			// summary:
			//		Overrides native formatblock command.
			// arg:
			//		Tag name of block type, like H1, DIV or P.
			// description:
			//		Overrides native formatblock command with the goal to avoid some 
			//		bidi-specific problems that arise when this command is executed. 
			//		Performed in three steps:
			//		1)	prepares selected fragment of the document to execution of native command
			//			(Mozilla only).
			//		2)	executes native command
			//		3)	updates contents of selected fragment of the document after execution of
			//			native comand.
			var info;
			if(has("mozilla") || has("webkit")){
				info = this._changeState("prepareformat", arg);
			}
			if(has("ie") && arg && arg.charAt(0) !== "<"){
				arg = "<" + arg + ">";
			}
			var returnValue = this._execNativeCmd("formatblock", arg, info);
			if(!returnValue){
				return false;
			}
			if(!has("webkit") || this._isSimpleInfo(info)){
				this._changeState("formatblock", arg);
			}
			this._mergeLists();
			return true;
		},
		
		_changeState: function(cmd,arg){
			// summary:
			//		Determines and refines current selection and calls method 
			//		_changeStateOfBlocks(), where given action is actually done
			// description:
			//		The main goal of this method is correctly identify the block elements,
			//		that are at the beginning and end of the current selection. 
			// return: nodesInfo
			//		Object containing
			//			nodes:  array of all block nodes, which should be handled by this command
			//			groups: array containing groups of nodes. Nodes from each group should be handled by separate 
			//					execution of current command
			//			cells:	array of cells, contents of which should be handled by current command
			if(!this.editor.window){
				return;
			}
			this.editor.focus();
			var sel = rangeapi.getSelection(this.editor.window);
			if(!sel || sel.rangeCount === 0){
				return;
			}
			var range = sel.getRangeAt(0),
				tempRange = range.cloneRange(),
				startNode, endNode, startOffset, endOffset;
			startNode = range.startContainer;
			startOffset = range.startOffset;
			endNode = range.endContainer;
			endOffset = range.endOffset;
			var isCollapsed = startNode === endNode && startOffset === endOffset;
			if(this._isBlockElement(startNode) || this._hasTagFrom(startNode,this._tableContainers)){
				while(startNode.hasChildNodes()){
					if(startOffset === startNode.childNodes.length){
						startOffset--;
					}	
					startNode = startNode.childNodes[startOffset];
					startOffset = 0;
				}
			}
			tempRange.setStart(startNode, startOffset);
			startNode = this._getClosestBlock(startNode, "start", tempRange);
			var supList = rangeapi.getBlockAncestor(startNode, /li/i, this.editor.editNode).blockNode;
			if(supList && supList !== startNode){
				startNode = supList;
			}
			endNode = tempRange.endContainer;
			endOffset = tempRange.endOffset;
			if(this._isBlockElement(endNode) || this._hasTagFrom(endNode, this._tableContainers)){
				while(endNode.hasChildNodes()){
					if(endOffset === endNode.childNodes.length){
						endOffset--;
					}
					endNode = endNode.childNodes[endOffset];
					if(endNode.hasChildNodes()){
						endOffset = endNode.childNodes.length;
					}else if(endNode.nodeType === 3 && endNode.nodeValue){
						endOffset = endNode.nodeValue.length;
					}else{
						endOffset = 0;
					}
				}
			}
			tempRange.setEnd(endNode, endOffset);
			endNode = this._getClosestBlock(endNode, "end", tempRange);
			supList = rangeapi.getBlockAncestor(endNode, /li/i, this.editor.editNode).blockNode;
			if(supList && supList !== endNode){
				endNode = supList;
			}
			sel = rangeapi.getSelection(this.editor.window, true);
			sel.removeAllRanges();
			sel.addRange(tempRange);
			var commonAncestor = rangeapi.getCommonAncestor(startNode, endNode);
			var nodesInfo = this._changeStateOfBlocks(startNode, endNode, commonAncestor, cmd, arg, tempRange);
			if(isCollapsed){
				endNode = tempRange.startContainer;
				endOffset = tempRange.startOffset;
				tempRange.setEnd(endNode, endOffset);
				sel = rangeapi.getSelection(this.editor.window, true);
				sel.removeAllRanges();
				sel.addRange(tempRange);
			}
			return nodesInfo;
		},

		_isBlockElement: function(node){
			if(!node || node.nodeType !== 1){
				return false;
			}
			var display = rias.dom.getStyle(node, "display");
			return (display === 'block' || display === "list-item" || display === "table-cell");
		},
		
		_isInlineOrTextElement: function(node){
			return !this._isBlockElement(node) && (node.nodeType === 1 || node.nodeType === 3 || node.nodeType === 8);
		},
		
		_isElement: function(node){
			return node && (node.nodeType === 1 || node.nodeType === 3);
		},
		
		_isBlockWithText: function(node){
			return node !== this.editor.editNode && this._hasTagFrom(node,this._lineTextArray);
		},
		
		_getBlockAncestor: function(node){
			while(node.parentNode && !this._isBlockElement(node)){
				node = node.parentNode;
			}
			return node;
		},
		
		_getClosestBlock: function(node, point, tempRange){
			// summary:
			//		Searches for a closest block element containing the text which 
			//		is at a given point of current selection. Refines current
			//		selection, if text element from start or end point was merged 
			//		with its neighbors.
			if(this._isBlockElement(node)){
				return node;
			}
			var parent = node.parentNode,
				firstSibling, lastSibling,
				createOwnBlock = false,
				multiText = false,
				removeOffset = false;
			while(true){
				var sibling = node;
				createOwnBlock = false;
				while(true){
					if(this._isInlineOrTextElement(sibling)){
						firstSibling = sibling;
						if(!lastSibling){
							lastSibling = sibling;
						}
					}
					sibling = sibling.previousSibling;
					if(!sibling){
						break;
					}else if(this._isBlockElement(sibling) || this._hasTagFrom(sibling,this._blockContainers) || this._hasTag(sibling,"BR")){
						createOwnBlock = true;
						break;
					}else if(sibling.nodeType === 3 && sibling.nextSibling.nodeType === 3){
						// Merge neighboring text elements
						sibling.nextSibling.nodeValue = sibling.nodeValue + sibling.nextSibling.nodeValue;
						multiText = true;
						if(point === "start" && sibling === tempRange.startContainer){
							tempRange.setStart(sibling.nextSibling, 0);
						}else if(point === "end" && (sibling === tempRange.endContainer || sibling.nextSibling === tempRange.endContainer)){
							tempRange.setEnd(sibling.nextSibling, sibling.nextSibling.nodeValue.length);
						}
						sibling = sibling.nextSibling;
						sibling.parentNode.removeChild(sibling.previousSibling);
						if(!sibling.previousSibling){
							break;
						}
					}
				}
				sibling = node;
				while(true){
					if(this._isInlineOrTextElement(sibling)){
						if(!firstSibling){
							firstSibling = sibling;
						}
						lastSibling = sibling;
					}	
					sibling = sibling.nextSibling;
					if(!sibling){
						break;
					}else if(this._isBlockElement(sibling) || this._hasTagFrom(sibling,this._blockContainers)){
						createOwnBlock = true;
						break;
					}else if(this._hasTag(sibling,"BR") && sibling.nextSibling && !(this._isBlockElement(sibling.nextSibling) || 
							this._hasTagFrom(sibling.nextSibling,this._blockContainers))){
						lastSibling = sibling;
						createOwnBlock = true;
						break;
					}else if(sibling.nodeType === 3 && sibling.previousSibling.nodeType === 3){
						// Merge neighboring text elements
						sibling.previousSibling.nodeValue += sibling.nodeValue;
						multiText = true;
						if(point === "start" && sibling === tempRange.startContainer){
							tempRange.setStart(sibling.previousSibling, 0);
						}else if(point === "end" && (sibling === tempRange.endContainer || sibling.previousSibling === tempRange.endContainer)){
							tempRange.setEnd(sibling.previousSibling, sibling.previousSibling.nodeValue.length);
						}
						sibling = sibling.previousSibling;
						sibling.parentNode.removeChild(sibling.nextSibling);
						if(!sibling.nextSibling){
							break;
						}
					}
				}
				// If text in the start or end point of the current selection doesn't placed in some block element 
				// or if it has block siblings, new block, containing this text element (and its inline siblings) is created.
				if(createOwnBlock || (this._isBlockElement(parent) && 
						!this._isBlockWithText(parent) && firstSibling)){
					var origStartOffset = tempRange? tempRange.startOffset : 0,
						origEndOffset = tempRange? tempRange.endOffset : 0,
						origStartContainer = tempRange? tempRange.startContainer : null,
						origEndContainer = tempRange? tempRange.endContainer : null,
						divs = this._repackInlineElements(firstSibling, lastSibling, parent),
						div = divs[point === "start"? 0 : divs.length - 1];
						if(tempRange && div && firstSibling === origStartContainer && this._hasTag(firstSibling,"BR")){
							origStartContainer = div;
							origStartOffset = 0;
							if(lastSibling === firstSibling){
								origEndContainer = origStartContainer;
								origEndOffset = 0;
							}
						}
					if(tempRange){
						tempRange.setStart(origStartContainer, origStartOffset);
						tempRange.setEnd(origEndContainer, origEndOffset);
					}
					return div;
				}
				if(this._isBlockElement(parent)){
					return parent;
				}
				node = parent;
				removeOffset = true;
				parent = parent.parentNode;
				firstSibling = lastSibling = null;
			}
		},
		
		_changeStateOfBlocks: function(startNode, endNode, commonAncestor, cmd, arg, tempRange){
			// summary:
			//		Collects all block elements, containing text, which are inside of current selection,
			//		and performs for each of them given action.
			//		Possible commands and corresponding actions:
			//			- "ltr":					change direction to left-to-right
			//			- "rtl":					change direction to right-to-left
			//			- "mirror":					change direction to opposite
			//			- "explicitdir":			explicit direction setting
			//			- "left":					change alignment to left
			//			- "right":					change alignment to right
			//			- "center":					change alignment to center
			//			- "preparelists":			action should be done before executing native insert[un]orderedlist
			//			- "prepareoutdent":			action should be done before executing native outdent
			//			- "prepareindent":			action should be done before executing native indent
			//			- "prepareformat":			action should be done before executing native formatblock
			//			- "insertunorderedlist":	action should be done after executing native insertunorderedlist
			//			- "insertorderedlist":		action should be done after executing native insertorderedlist
			//			- "indent":					action should be done after executing native indent
			//			- "outdent":				action should be done after executing native outdent
			//			- "normalizeindent":		emulate indent done by NormalizeIndentOutdent plugin
			//			- "normalizeoutdent":		emulate outdent done by NormalizeIndentOutdent plugin
			//			- "formatblock":			action should be done after executing native formatblock
			var nodes = [];
			// Refine selection, needed for 'explicitdir' command (full selection)
			if(startNode === this.editor.editNode){
				if(!startNode.hasChildNodes()){
					return;
				}
				if(this._isInlineOrTextElement(startNode.firstChild)){
					this._rebuildBlock(startNode);
				}
				startNode = this._getClosestBlock(startNode.firstChild, "start", null);
			}
			if(endNode === this.editor.editNode){
				if(!endNode.hasChildNodes()){
					return;
				}
				if(this._isInlineOrTextElement(endNode.lastChild)){
					this._rebuildBlock(endNode);
				}
				endNode = this._getClosestBlock(endNode.lastChild, "end", null);
			}
			
			// Collect all selected block elements, which contain or can contain text.
			// Walk through DOM tree between start and end points of current selection.
			var origStartOffset = tempRange? tempRange.startOffset : 0,
				origEndOffset = tempRange? tempRange.endOffset : 0,
				origStartContainer = tempRange? tempRange.startContainer : null,
				origEndContainer = tempRange? tempRange.endContainer : null;
			var info = this._collectNodes(startNode, endNode, commonAncestor, tempRange, nodes, 
				origStartContainer, origStartOffset, origEndContainer, origEndOffset, cmd);
			var nodesInfo = {
				nodes: nodes,
				groups: info.groups,
				cells: info.cells
			};
			cmd = cmd.toString();
			// Execution of specific action for each element from collection
			switch(cmd){
				//change direction
				case "mirror":
				case "ltr":
				case "rtl":
				//change alignment
				case "left":
				case "right":
				case "center":
				//explicit direction setting
				case "explicitdir":
					this._execDirAndAlignment(nodesInfo, cmd, arg);
					break;
				//before executing 'insert list' native command
				case "preparelists":
					this._prepareLists(nodesInfo, cmd);
					break;
				//after executing 'insert list' native command
				case "insertorderedlist":
				case "insertunorderedlist":
					this._execInsertLists(nodesInfo);
					break;
				//before executing 'outdent' native command
				case "prepareoutdent":
					this._prepareOutdent(nodesInfo);
					break;
				//before executing 'indent' native command
				case "prepareindent":
					this._prepareIndent(nodesInfo);
					break;
				//after executing 'indent' native command
				case "indent":
					this._execIndent(nodesInfo);
					break;
				//after executing 'outdent' native command
				case "outdent":
					this._execOutdent(nodesInfo);
					break;
				//replace native 'indent' and 'outdent' commands
				case "normalizeindent":
					this._execNormalizedIndent(nodesInfo);
					break;
				case "normalizeoutdent":
					this._execNormalizedOutdent(nodesInfo);
					break;
				//before 'formatblock' native command
				case "prepareformat":
					this._prepareFormat(nodesInfo, arg);
					break;
				//after executing 'formatblock' native command
				case "formatblock":
					this._execFormatBlocks(nodesInfo, arg);
					break;
				default: console.error("Command " + cmd + " isn't handled");
			}
			// Refine selection after changes
			if(tempRange){
				tempRange.setStart(origStartContainer, origStartOffset);
				tempRange.setEnd(origEndContainer, origEndOffset);
				var sel = rangeapi.getSelection(this.editor.window, true);
				sel.removeAllRanges();
				sel.addRange(tempRange);
				this.editor.onDisplayChanged();
			}
			return nodesInfo;
		},

		_collectNodes: function(startNode, endNode, commonAncestor, tempRange, nodes, origStartContainer, origStartOffset, origEndContainer, origEndOffset, cmd){
			// summary:
			//		Collect all selected block elements, which contain or can contain text.
			//		Walk through DOM tree between start and end points of current selection.
			var node = startNode,
				nd,
				parent = node.parentNode,
				divs = [],
				firstSibling, lastSibling,
				groups = [],
				group = [],
				cells = [],
				curTD = this.editor.editNode;
			var saveNodesAndGroups = rias.hitch(this, function(x){
				nodes.push(x);
				var cell = this.editor.selection.getParentOfType(x,["TD"]);
				if(curTD !== cell || has("webkit") && (cmd === "prepareformat" || cmd === "preparelists")){
					if(group.length){
						groups.push(group);
					}
					group = [];
					if(curTD !== cell){
						curTD = cell;
						if(curTD){
							cells.push(curTD);
						}
					}
				}
				group.push(x);
			});
			this._rebuildBlock(parent);
			while(true){
				if(this._hasTagFrom(node,this._tableContainers)){
					if(node.firstChild){
						parent = node;
						node = node.firstChild;
						continue;
					}
				}else if(this._isBlockElement(node)){
					var supLI = rangeapi.getBlockAncestor(node, /li/i, this.editor.editNode).blockNode;
					if(supLI && supLI !== node){
						node = supLI;
						parent = node.parentNode;
						continue;
					}
					if(!this._hasTag(node,"LI")){
						if(node.firstChild){
							this._rebuildBlock(node);
							if(this._isBlockElement(node.firstChild) || this._hasTagFrom(node.firstChild,this._tableContainers)){
								parent = node;
								node = node.firstChild;
								continue;
							}
						}
					}
					if(this._hasTagFrom(node,this._lineTextArray)){
						saveNodesAndGroups(node);
					}
				}else if(this._isInlineOrTextElement(node) && !this._hasTagFrom(node.parentNode,this._tableContainers)){
					firstSibling = node;
					while(node){
						var nextSibling = node.nextSibling;
						if(this._isInlineOrTextElement(node)){
							lastSibling = node;
							if(this._hasTag(node,"BR")){
								if(!(this._isBlockElement(parent) && node === parent.lastChild)){
									divs = this._repackInlineElements(firstSibling, lastSibling, parent);
									node = divs[divs.length-1];
									for(nd = 0; nd < divs.length; nd++){
										saveNodesAndGroups(divs[nd]);
									}
									firstSibling = lastSibling = null;
									if(nextSibling && this._isInlineOrTextElement(nextSibling)){
										firstSibling = nextSibling;
									}
								}
							}
						}else if(this._isBlockElement(node)){
							break;
						}	
						node = nextSibling;
					}
					if(!firstSibling){
						continue;
					}
					divs = this._repackInlineElements(firstSibling, lastSibling, parent);
					node = divs[divs.length - 1];
					for(nd = 0; nd < divs.length; nd++){
						saveNodesAndGroups(divs[nd]);
					}
				}
				
				if(node === endNode){
					break;
				}
				if(node.nextSibling){
					node = node.nextSibling;
				}else if(parent !== commonAncestor){
					while(!parent.nextSibling){
						node = parent;
						parent = node.parentNode;
						if(parent === commonAncestor){
							break;
						}
					}
					if(parent !== commonAncestor && parent.nextSibling){
						node = parent.nextSibling;
						parent = parent.parentNode;
					}else{
						break;
					}
				}else{ 
					break;
				}
			}
			if(group.length){
				if(has("webkit") || curTD){
					groups.push(group);
				}else{
					groups.unshift(group);
				}
			}
			return {groups: groups, cells: cells};
		},

		_execDirAndAlignment: function(nodesInfo, cmd, arg){
			// summary:
			//		Change direction and/or alignment of each node from the given array.
			switch(cmd){
			//change direction
			case "mirror":
			case "ltr":
			case "rtl":
				rias.forEach(nodesInfo.nodes, function(x){
					var style = rias.dom.getComputedStyle(x),
						curDir = style.direction,
						oppositeDir = curDir === "ltr" ? "rtl" : "ltr",
						realDir = (cmd !== "mirror"? cmd : oppositeDir),
						curAlign = style.textAlign,
						marginLeft = isNaN(parseInt(style.marginLeft)) ? 0 : parseInt(style.marginLeft),
						marginRight = isNaN(parseInt(style.marginRight)) ? 0 : parseInt(style.marginRight);
					rias.dom.removeAttr(x, "dir");
					rias.dom.removeAttr(x, "align");
					rias.dom.setStyle(x, {direction: realDir, textAlign: ""});
					if(this._hasTag(x, "CENTER")){
						return;
					}
					if(curAlign.indexOf("center") >= 0){
						rias.dom.setStyle(x, "textAlign", "center");
					}
					if(this._hasTag(x, "LI")){
						this._refineLIMargins(x);
						var margin = curDir === "rtl" ? marginRight : marginLeft; 
						var level = 0, tNode = x.parentNode;
						if(curDir !== rias.dom.getStyle(tNode, "direction")){
							while(tNode !== this.editor.editNode){
								if(this._hasTagFrom(tNode, ["OL", "UL"])){
									level++;
								}
								tNode = tNode.parentNode;
							}
							margin -= this._getMargins(level);
						}
						var styleMargin = realDir === "rtl" ? "marginRight" : "marginLeft";
						var cMargin = rias.dom.getStyle(x, styleMargin);
						var cIndent = isNaN(cMargin) ? 0 : parseInt(cMargin);
						rias.dom.setStyle(x, styleMargin,"" + (cIndent + margin) + "px");
						if(has("webkit")){
							if(curAlign.indexOf("center") < 0){
								rias.dom.setStyle(x, "textAlign", (realDir === "rtl" ? "right" : "left"));
							}
						}else if(x.firstChild && x.firstChild.tagName){
							if(this._hasTagFrom(x.firstChild,this._lineStyledTextArray)){
								var align = this._refineAlignment(style.direction, style.textAlign);
								if(has("mozilla")){
									rias.dom.setStyle(x.firstChild, {textAlign: align});
								}else{
									rias.dom.setStyle(x.firstChild, {direction : realDir, textAlign: align});
								}
							}
						}
					}else{
						if(realDir === "rtl" && marginLeft !== 0){
							rias.dom.setStyle(x, {
								marginLeft: "",
								marginRight: "" + marginLeft + "px"
							});
						}else if(realDir === "ltr" && marginRight !== 0){
							rias.dom.setStyle(x, {
								marginRight: "",
								marginLeft: "" + marginRight + "px"
							});
						}
					}
				}, this);
				query("table",this.editor.editNode).forEach(function(table, idx, array){
					var dir = cmd;
					if(cmd === "mirror"){
						dir = rias.dom.getStyle(table, "direction") === "ltr" ? "rtl" : "ltr";
					}
					var listTD = query("td",table),
						first = false,
						last = false;
					for(var i = 0; i < nodesInfo.cells.length; i++){
						if(!first && listTD[0] === nodesInfo.cells[i]){
							first = true;
						}else if(listTD[listTD.length-1] === nodesInfo.cells[i]){
							last = true;
							break;
						}
					}
					if(first && last){
						rias.dom.setStyle(table,"direction",dir);
						for(i = 0; i < listTD.length; i++){
							rias.dom.setStyle(listTD[i], "direction", dir);
						}
					}
				}, this);
				break;
			//change alignment
			case "left":
			case "right":
			case "center":
				rias.forEach(nodesInfo.nodes, function(x){
					if(this._hasTag(x, "CENTER")){
						return;
					}
					rias.dom.removeAttr(x, "align");
					rias.dom.setStyle(x, "textAlign", cmd);
					if(this._hasTag(x, "LI")){
						if(x.firstChild && x.firstChild.tagName){
							if(this._hasTagFrom(x.firstChild,this._lineStyledTextArray)){
								var style = rias.dom.getComputedStyle(x),
									align = this._refineAlignment(style.direction, style.textAlign);
								rias.dom.setStyle(x.firstChild, "textAlign", align);
							}
						}										
					}					
				}, this);
				break;
			//explicit direction setting
			case "explicitdir":
				rias.forEach(nodesInfo.nodes, function(x){
					var style = rias.dom.getComputedStyle(x),
						curDir = style.direction;
					rias.dom.removeAttr(x, "dir");
					rias.dom.setStyle(x, {direction: curDir});
				}, this);
				break;
			}		
		},

		_prepareLists: function(nodesInfo, cmd){
			// summary:
			//		Perform changes before native insertorderedlist and 
			//		insertunorderedlist commands for each node from the given array.
			rias.forEach(nodesInfo.nodes, function(x, index, arr){
				if(has("mozilla") || has("webkit")){
					//Mozilla not always handles the only block inside cell
					if(has("mozilla")){
						var cell = this._getParentFrom(x, ["TD"]);
						if(cell && query("div[tempRole]", cell).length === 0){
							rias.dom.create("div",{innerHTML: "<span tempRole='true'>" + this.bogusHtmlContent + "</span", tempRole: "true"}, cell);
						}
					}
					var name = this._tag(x);
					var styledSpan;
					if(has("webkit") && this._hasTagFrom(x, this._lineStyledTextArray) ||
							(this._hasTag(x, "LI") && this._hasStyledTextLineTag(x.firstChild))){
						var savedName = this._hasTag(x, "LI") ? this._tag(x.firstChild) : name;
						if(this._hasTag(x, "LI")){
							while(x.firstChild.lastChild){
								rias.dom.place(x.firstChild.lastChild, x.firstChild, "after");
							}
							x.removeChild(x.firstChild);
						}
						styledSpan = rias.dom.create("span", {innerHTML: this.bogusHtmlContent, bogusFormat: savedName}, x, "first");
					}
					if(!has("webkit") && name !== "DIV" && name !== "P" && name !== "LI"){
						return;
					}
					// In some cases, when one of insertlists command is executed for list of another type, and selection
					// includes the last item of this list, webkit loses current selection after native call.
					// To avoid this we append the list with bogus item, which finally will be removed by "post" action. 
					if(has("webkit") && this._isListTypeChanged(x, cmd) && x === x.parentNode.lastChild){
						rias.dom.create("li", {tempRole: "true"}, x, "after");
					}
					if(name === "LI" && x.firstChild && x.firstChild.tagName){
						if(this._hasTagFrom(x.firstChild, this._lineStyledTextArray)){
							return;
						}
					}
					// When blocks are converted into list items, their attributes are lost.
					// We save attributes in some bogus inline element with the goal to restore 
					// them after execution the command. 						
					var style = rias.dom.getComputedStyle(x),
						curDir = style.direction,
						curAlign = style.textAlign;
					curAlign = this._refineAlignment(curDir, curAlign);
					var val = this._getLIIndent(x);
					var margin = val === 0? "" : "" + val + "px";
					if(has("webkit") && name === "LI"){
						rias.dom.setStyle(x, "textAlign", "");
					}
					var span = styledSpan ? x.firstChild : rias.dom.create("span", {
						innerHTML: this.bogusHtmlContent
					}, x, "first");
					rias.dom.setAttr(span, "bogusDir", curDir);
					if(curAlign !== ""){
						rias.dom.setAttr(span, "bogusAlign", curAlign);
					}
					if(margin){
						rias.dom.setAttr(span, "bogusMargin", margin);
					}
				}else if(has("ie")){
					// When IE executes insertlist command for list item, containing block,
					// it saves styles of list item in this block. We should then remove 
					// bogus margins, if list item is converted into the block.
					if(this._hasTag(x, "LI")){
						rias.dom.setStyle(x, "marginRight", "");
						rias.dom.setStyle(x, "marginLeft", "");
						if(this._getLILevel(x) === 1 && !this._isListTypeChanged(x, cmd)){
							if(x.firstChild && this._hasTagFrom(x.firstChild, ["P","PRE"])){
								rias.dom.create("span", {bogusIEFormat: this._tag(x.firstChild)}, x.firstChild, "first");
							}
							//IE fais, when try to handle list items, containing PRE 
							if(this._hasTag(x.firstChild, "PRE")){
								var p = rias.dom.create("p", null, x.firstChild, "after");
								while(x.firstChild.firstChild){
									rias.dom.place(x.firstChild.firstChild, p, "last");
								}
								p.style.cssText = x.style.cssText;
								x.removeChild(x.firstChild);
							}
						}
					}
				}
			}, this);
			// If selection includes some cells of table and some items of one-level list, which is the table's next sibling,
			// webkit doesn't complete the action. For example, having <table>...</table><ul><li>One</li><li>Two</li></ul>,
			// after executing "insertunorderedlist" command, we get <table>...</table><ul><li>One</li>Two.
			// To avoid this, we add after the table some bogus list, which will be deleted after executing "post native" action.
			if(has("webkit")){
				query("table", this.editor.editNode).forEach(function(x, ind, arr){
					var sibling = x.nextSibling;
					if(sibling && this._hasTagFrom(sibling, ["UL", "OL"])){
						rias.dom.create("UL", {tempRole: "true"}, x, "after");
					}
				}, this);
			}
		},
		
		_execInsertLists: function(nodesInfo){
			rias.forEach(nodesInfo.nodes, function(x, index){
				var style, align, dir;
				if(this._hasTag(x, "LI")){
					//If one of "styled" text blocks, like <h*> or <pre>, is converted
					//into list item, it actually is included into new list item, 
					//created without attributes. This causes problems in subsequent changes 
					//of orientation or alignment of this list item.	
					if(x.firstChild && x.firstChild.tagName){
						if(this._hasTagFrom(x.firstChild,this._lineStyledTextArray)){
							style = rias.dom.getComputedStyle(x.firstChild);
							align = this._refineAlignment(style.direction, style.textAlign);
							rias.dom.setStyle(x,{
								direction: style.direction,
								textAlign: align
							});
							var mLeft = this._getIntStyleValue(x, "marginLeft") + this._getIntStyleValue(x.firstChild, "marginLeft");
							var mRight = this._getIntStyleValue(x, "marginRight") + this._getIntStyleValue(x.firstChild, "marginRight");
							var leftMargin = mLeft ? "" + mLeft + "px" : "";
							var rightMargin = mRight ? "" + mRight + "px" : "";
							rias.dom.setStyle(x, {
								marginLeft: leftMargin,
								marginRight: rightMargin
							});
							rias.dom.setStyle(x.firstChild, {
								direction: "",
								textAlign: ""
							});
							if(!has("mozilla")){
								rias.dom.setStyle(x.firstChild, {
									marginLeft: "",
									marginRight: ""
								});
							}
						}
					}
					//Mozilla sometimes includes few empty text nodes (or text nodes, containing spaces)
					//to the end of newly created list item
					while(x.childNodes.length > 1){
						if(!(x.lastChild.nodeType === 3 && x.lastChild.previousSibling && x.lastChild.previousSibling.nodeType === 3 && rias.trim(x.lastChild.nodeValue) === "")){
							break;
						}	
						x.removeChild(x.lastChild);
					}
					if(has("safari")){
						if(this._hasTag(x.firstChild, "SPAN") && rias.dom.containsClass(x.firstChild, "Apple-style-span")){
							var child = x.firstChild;
							if(this._hasTag(child.firstChild, "SPAN") && rias.dom.hasAttr(child.firstChild, "bogusFormat")){
								while(child.lastChild){
									rias.dom.place(child.lastChild, child, "after");
								}
								x.removeChild(child);
							}
						}
					}
				}else if(this._hasTag(x, "DIV") && x.childNodes.length === 0){
					x.parentNode.removeChild(x);
					return;
				}
				if(has("ie")){
					// IE always converts list items to <P>
					if(this._hasTag(x, "P") && this.blockMode.toUpperCase() === "DIV"){
						if(this._hasTag(x.firstChild,"SPAN") && rias.dom.hasAttr(x.firstChild, "bogusIEFormat")){
							if(rias.dom.getAttr(x.firstChild, "bogusIEFormat").toUpperCase() === "PRE"){
								var pre = rias.dom.create("pre", {
									innerHTML: x.innerHTML
								}, x, "before");
								pre.style.cssText = x.style.cssText;
								pre.removeChild(pre.firstChild);
								x.parentNode.removeChild(x);
							}else{
								x.removeChild(x.firstChild);
							}
							return;
						}
						var nDiv = rias.dom.create("div");
						nDiv.style.cssText = x.style.cssText;
						x.parentNode.insertBefore(nDiv, x);
						while(x.firstChild){
							nDiv.appendChild(x.firstChild);
						}
						x.parentNode.removeChild(x);
					}	
					if(!this._hasTag(x, "LI")){
						return;
					}
					this._refineLIMargins(x);
					// Instead of converting regular block into list item, IE includes block into the newly created item
					var div = x.firstChild;
					if(!this._hasTag(div, "DIV")){
						return;
					}
					if(div !== x.lastChild){
						return;
					}
					style = rias.dom.getComputedStyle(div);
					dir = style.direction;
					align = style.textAlign;
					rias.dom.setStyle(x, "direction", dir);
					align = this._refineAlignment(dir, align);
					rias.dom.setStyle(x, "textAlign", align);
					while(div.firstChild){
						x.insertBefore(div.firstChild, div);
					}
					x.removeChild(div);
				}else if(!this._hasTag(x.firstChild, "SPAN")){
					if(this._hasTag(x,"LI")){
						this._refineLIMargins(x);
						if(has("mozilla") && this._hasStyledTextLineTag(x.firstChild)){
							this._recountLIMargins(x);
						}
					}
					return;
				}	
				// Restore attributes and remove bogus elments
				var hasBogusSpan = false;
				var indentWithMargin = false;
				var hasBogusAlign = false;
				var marginVal = 0; 
				if(rias.dom.hasAttr(x.firstChild, "bogusDir")){
					hasBogusSpan = true;
					dir = rias.dom.getAttr(x.firstChild, "bogusDir");
					rias.dom.setStyle(x, "direction", dir);
				}
				if(rias.dom.hasAttr(x.firstChild, "bogusAlign")){
					hasBogusSpan = true;
					hasBogusAlign = true;
					align = rias.dom.getAttr(x.firstChild, "bogusAlign");
					rias.dom.setStyle(x, "textAlign", align);
					var sibling = x.firstChild.nextSibling;
					if(this._hasTag(sibling, "SPAN") && rias.dom.getStyle(sibling, "textAlign") === align){
						rias.dom.setStyle(sibling, "textAlign", "");
						if(sibling.style.cssText === ""){
							while(sibling.lastChild){
								rias.dom.place(sibling.lastChild, sibling, "after");
							}
							x.removeChild(sibling);
						}
					}
				}
				if(rias.dom.hasAttr(x.firstChild, "bogusMargin")){
					hasBogusSpan = true;
					indentWithMargin = true;
					marginVal = parseInt(rias.dom.getAttr(x.firstChild, "bogusMargin"));
					if(!this._hasTag(x,"LI")){
						var mStyle = rias.dom.getStyle(x,"direction") === "rtl" ? "marginRight" : "marginLeft";
						var mVal = this._getIntStyleValue(x,mStyle) + marginVal;							
						rias.dom.setStyle(x,mStyle,(mVal === 0 ? "" : "" + mVal + "px"));
					}
				}
				if(rias.dom.hasAttr(x.firstChild, "bogusFormat")){
					hasBogusSpan = false;
					rias.dom.removeAttr(x.firstChild, "bogusDir");
					if(x.firstChild.nextSibling && this._hasTag(x.firstChild.nextSibling, "SPAN")){
						var bogusStyles = x.firstChild.style.cssText.trim().split(";");
						var savedStyles = x.firstChild.nextSibling.style.cssText.trim().split(";");
						for(var i = 0; i < bogusStyles.length; i++){
							if(bogusStyles[i]){
								for(var j = 0; j < savedStyles.length; j++){
									if(bogusStyles[i].trim() === savedStyles[j].trim()){
										style = bogusStyles[i].trim().split(":")[0];
										rias.dom.setStyle(x.firstChild.nextSibling, style, "");
										break;
									}
								}
							}
						}
						if(x.firstChild.nextSibling.style.cssText === ""){
							while(x.firstChild.nextSibling.firstChild){
								rias.dom.place(x.firstChild.nextSibling.firstChild, x.firstChild.nextSibling, "after");
							}
							x.removeChild(x.firstChild.nextSibling);
						}
					}
					var tag = rias.dom.getAttr(x.firstChild, "bogusFormat");
					var block = rias.dom.create(tag, null, x.firstChild, "after");
					while(block.nextSibling){
						rias.dom.place(block.nextSibling, block, "last");
					}
					x.removeChild(x.firstChild);
					if(has("webkit")){
						if(this._hasTag(x, "LI")){
							var parent = x.parentNode.parentNode;
							if(this._hasTag(parent, tag)){
								rias.dom.setAttr(parent, "tempRole", "true");
							}
						}
					}
					if(x.childNodes.length === 1 && !this._hasTag(x, "TD")){
						if(!has("mozilla") && !this._hasTag(x, "LI")){
							block.style.cssText = x.style.cssText;
							rias.dom.setAttr(x, "tempRole", "true");
						}else if(!this._hasTag(x, "LI")){
							block.style.cssText = x.style.cssText;
							rias.dom.place(block, x, "after");
							rias.dom.setAttr(x, "tempRole", "true");
						}
					}
				}
				if(hasBogusSpan){
					x.removeChild(x.firstChild);
				}
				if(this._hasTag(x, "LI")){
					// Chrome: if direction of list item is differ from default orientation, text alignment 
					// of this item should be set explicitly
					if(has("webkit") && !hasBogusAlign && rias.dom.getStyle(x, "textAlign") !== "center"){
						rias.dom.setStyle(x, "textAlign", (rias.dom.getStyle(x, "direction") === "rtl" ? "right" : "left"));
					}
					// Safari: when type of the list, having differently directed items, is changed, Safari inserts sometimes
					// into this list DIV with the contents of previous list item. 
					if(has("safari") && this._hasTag(x, "DIV")){
						x.innerHTML = x.nextSibling.innerHTML;
						x.parentNode.removeChild(x.nextSibling);
					}
					var pDiv = x.parentNode.parentNode;
					if(pDiv !== this.editor.editNode && this._hasTag(pDiv, "DIV")){
						if(pDiv.childNodes.length === 1){
							pDiv.parentNode.insertBefore(x.parentNode, pDiv);
							pDiv.parentNode.removeChild(pDiv);
						}
					}
					this._refineLIMargins(x);
					if(indentWithMargin){
						this._recountLIMargins(x, marginVal);
					}
				}
			}, this);
			if(has("mozilla")){
				query("*[tempRole]", this.editor.editNode).forEach(function(x, index, arr){
					if(this._hasTag(x, "SPAN")){
						if(rias.dom.getAttr(x.parentNode, "tempRole")){
							return;
						}else if(this._hasTag(x.parentNode, "LI")){
							x.parentNode.parentNode.removeChild(x.parentNode);
							return;
						}
					}
					x.parentNode.removeChild(x);
				}, this);
			}else if(has("webkit")){
				query("*[tempRole]", this.editor.editNode).forEach(function(x, index, arr){
					if(this._hasTag(x, "LI") || this._hasTag(x, "UL")){
						return;
					}
					while(x.lastChild){
						rias.dom.place(x.lastChild, x, "after");
					}
					x.parentNode.removeChild(x);
				}, this);
			}
		},
		
		_execNormalizedIndent: function(nodesInfo){
			rias.forEach(nodesInfo.nodes, function(x){
				var style = rias.dom.getStyle(x, "direction") === "rtl" ? "marginRight" : "marginLeft";
				var cMargin = rias.dom.getStyle(x, style);
				var cIndent = isNaN(cMargin) ? 0 : parseInt(cMargin);
				rias.dom.setStyle(x,style, "" + (cIndent + this._indentBy) + "px");
			},this);
		},

		_execNormalizedOutdent: function(nodesInfo){
			rias.forEach(nodesInfo.nodes, function(x){
				var style = rias.dom.getStyle(x, "direction") === "rtl" ? "marginRight" : "marginLeft";
				var cMargin = rias.dom.getStyle(x, style);
				var cIndent = isNaN(cMargin) ? 0 : parseInt(cMargin);
				var offs = 0;
				if(x.tagName.toUpperCase() === "LI"){
					var level = 0, tNode = x.parentNode;
					if(rias.dom.getStyle(x, "direction") !== rias.dom.getStyle(tNode, "direction")){
						while(tNode !== this.editor.editNode){
							if(this._hasTagFrom(tNode, ["OL","UL"])){
								level++;
							}
							tNode = tNode.parentNode;
						}
						offs = this._getMargins(level);
					}
				}
				if(cIndent >= this._indentBy + offs){
					rias.dom.setStyle(x, style, (cIndent === this._indentBy ? "" : "" + (cIndent - this._indentBy) + "px"));
				}
			},this);
		},

		_prepareIndent: function(nodesInfo){
			rias.forEach(nodesInfo.nodes, function(x){
				if(has("mozilla")){
					var cell = this._getParentFrom(x, ["TD"]);
					if(!!cell && (query("div[tempRole]", cell).length === 0)){
						rias.dom.create("div", {
							innerHTML: this.bogusHtmlContent,
							tempRole: "true"
						}, cell);
					}
					if(this._hasTag(x, "LI")){
						var indent = this._getLIIndent(x);
						rias.dom.setAttr(x, "tempIndent", indent);
					}
				}
				if(has("webkit") && this._hasTag(x, "LI") && this._hasStyledTextLineTag(x.firstChild)){
					var name = this._tag(x.firstChild);
					while(x.firstChild.lastChild){
						rias.dom.place(x.firstChild.lastChild, x.firstChild, "after");
					}
					x.removeChild(x.firstChild);
					rias.dom.create("span",{
						innerHTML: this.bogusHtmlContent,
						bogusFormat: name
					}, x, "first");
				}
			},this);
		},

		_prepareOutdent: function(nodesInfo){
			rias.forEach(nodesInfo.nodes, function(x){
				var indent;
				if(has("mozilla") || has("webkit")){
					if(has("mozilla")){
						var cell = this._getParentFrom(x, ["TD"]);
						if(!!cell && (query("div[tempRole]", cell).length === 0)){
							rias.dom.create("div", {
								innerHTML: this.bogusHtmlContent,
								tempRole: "true"
							}, cell);
						}
					}
					// FF: Outdent for the list items from first level's list converts them into sequence of 
					// text elements, separated by <BR>s. Attributes of list items are lost.
					// Webkit: Attributes of items, placed into blockquote, are lost after outdent.
					// We save attributes in some bogus inline element with the goal to restore 
					// them after execution the command. 					
					var name = this._tag(x);
					if(has("mozilla") && name !== "LI"){
						return;
					}
					var styledSpan = null;
					if(has("webkit")){
						if(this._hasTag(x, "LI") && this._hasStyledTextLineTag(x.firstChild)){
							name = this._tag(x.firstChild);
							var child = x.firstChild;
							while(child.lastChild){
								rias.dom.place(child.lastChild, child, "after");
							}
							x.removeChild(x.firstChild);
							styledSpan = rias.dom.create("span", {
								innerHTML: this.bogusHtmlContent,
								bogusFormat: name
							}, x, "first");
						}
					}
					if(x.firstChild && x.firstChild.tagName){     
						if(this._hasTagFrom(x.firstChild, this._lineStyledTextArray)){
							if(has("mozilla")){
								x.firstChild.style.cssText = x.style.cssText;
								var margin = rias.dom.getStyle(x, "direction") === "rtl" ? "marginRight" : "marginLeft";
								indent = this._getLIIndent(x);
								if(indent > 0){
									rias.dom.setStyle(x.firstChild, margin, "" + indent + "px");
								}
							}
							return;
						}
					}
					var style = rias.dom.getComputedStyle(x),
						curDir = style.direction,
						curAlign = style.textAlign;
					curAlign = this._refineAlignment(curDir, curAlign);
					if(has("webkit") && name === "LI"){
						rias.dom.setStyle(x, "textAlign", "");
					}
					var span = styledSpan ? x.firstChild : rias.dom.create("span", {innerHTML: this.bogusHtmlContent}, x, "first");
					rias.dom.setAttr(span, "bogusDir", curDir);
					if(curAlign !== ""){
						rias.dom.setAttr(span, "bogusAlign", curAlign);
					}
					if(has("mozilla")){
						indent = this._getLIIndent(x);
						rias.dom.setAttr(span, "bogusIndent", indent);
					}
				}
				if(has("ie")){
					if(x.tagName.toUpperCase() === "LI"){
						rias.dom.setStyle(x, "marginLeft", "");
						rias.dom.setStyle(x, "marginRight", "");
						if(this._getLILevel(x) === 1){
							if(x.firstChild && this._hasTagFrom(x.firstChild, ["P","PRE"])){
								rias.dom.create("span", {
									bogusIEFormat: this._tag(x.firstChild)
								}, x.firstChild, "first");
							}
							//IE fais, when try to handle first level list items, containing PRE 
							if(this._hasTag(x.firstChild, "PRE")){
								var p = rias.dom.create("p", null, x.firstChild, "after");
								while(x.firstChild.firstChild){
									rias.dom.place(x.firstChild.firstChild, p, "last");
								}
								p.style.cssText = x.style.cssText;
								x.removeChild(x.firstChild);
							}
						}
					}
				}
			},this);
		},

		_execIndent: function(nodesInfo){
			rias.forEach(nodesInfo.nodes, function(x){
				if(!has("mozilla")){
					rias.dom.setStyle(x, "margin", "");
				}
				if(this._hasTag(x, "LI")){
					var indent = 0;
					if(has("mozilla") && rias.dom.hasAttr(x, "tempIndent")){
						indent = parseInt(rias.dom.getAttr(x, "tempIndent"));
						rias.dom.removeAttr(x, "tempIndent");
					}
					this._refineLIMargins(x);
					if(has("mozilla")){
						this._recountLIMargins(x,indent);
					}
				}
				if(rias.dom.hasAttr(x.firstChild, "bogusFormat")){
					var tag = rias.dom.getAttr(x.firstChild, "bogusFormat");
					var block = rias.dom.create(tag, null, x.firstChild, "after");
					while(block.nextSibling){
						rias.dom.place(block.nextSibling, block, "last");
					}
					x.removeChild(x.firstChild);
				}
				if(has("ie") || has("webkit")){
					// Remove attribute dir from newly created blockquotes
					var supBq = x.parentNode;
					while(supBq !== this.editor.editNode){
						supBq = rangeapi.getBlockAncestor(supBq, /blockquote/i, this.editor.editNode).blockNode;
						if(!supBq){
							break;
						}
						if(rias.dom.hasAttr(supBq, "dir")){
							rias.dom.removeAttr(supBq, "dir");
						}
						rias.dom.setStyle(supBq, "marginLeft", "");
						rias.dom.setStyle(supBq, "marginRight", "");
						rias.dom.setStyle(supBq, "margin", "");
						supBq = supBq.parentNode;
					}
				}
			},this);
			if(has("mozilla")){
				query("div[tempRole]", this.editor.editNode).forEach(function(x, index, arr){
					x.parentNode.removeChild(x);
				});
				query("ul,ol", this.editor.editNode).forEach(function(x, index, arr){
					rias.dom.setStyle(x, "marginLeft", "");
					rias.dom.setStyle(x, "marginRight", "");
				});
			}
		},

		_execOutdent: function(nodesInfo){
			rias.forEach(nodesInfo.nodes, function(x){
				var hasBogusSpan = false;
				var isFormatted = false;
				var indent = 0;
				if(has("mozilla") || has("webkit")){
					if(!this._hasTag(x.firstChild,"SPAN")){
						if(this._hasTag(x,"LI")){
							this._refineLIMargins(x);
							if(has("mozilla") && this._hasStyledTextLineTag(x.firstChild)){
								this._recountLIMargins(x);
								x.firstChild.style.cssText = "";
							}
						}
						return;
					}
					// Restore attributes and remove bogus elments
					if(rias.dom.hasAttr(x.firstChild, "bogusDir")){
						hasBogusSpan = true;
						var dir = rias.dom.getAttr(x.firstChild, "bogusDir");
						rias.dom.setStyle(x,"direction",dir);
					}
					if(rias.dom.hasAttr(x.firstChild, "bogusAlign")){
						hasBogusSpan = true;
						var align = rias.dom.getAttr(x.firstChild, "bogusAlign");
						rias.dom.setStyle(x,"textAlign",align);
					}
					if(rias.dom.hasAttr(x.firstChild, "bogusIndent")){
						hasBogusSpan = true;
						indent = parseInt(rias.dom.getAttr(x.firstChild, "bogusIndent"));
						if(!this._hasTag(x, "LI")){
							var marginStyle = rias.dom.getStyle(x, "direction") === "rtl" ? "marginRight" : "marginLeft";
							var marginVal = "" + (this._getIntStyleValue(x, marginStyle) + indent) + "px";
							rias.dom.setStyle(x,marginStyle,marginVal);
						}
					}
					if(rias.dom.hasAttr(x.firstChild, "bogusFormat")){
						hasBogusSpan = true;
						var tag = rias.dom.getAttr(x.firstChild, "bogusFormat");
						var block = rias.dom.create(tag, null, x.firstChild, "after");
						while(block.nextSibling){
							rias.dom.place(block.nextSibling, block, "last");
						}
						if(!this._hasTag(x, "LI")){
							block.style.cssText = x.style.cssText;
							isFormatted = true;
						}
					}
					if(hasBogusSpan){
						x.removeChild(x.firstChild);
						if(isFormatted){
							while(x.lastChild){
								rias.dom.place(x.lastChild, x, "after");
							}
							rias.dom.setAttr(x, "tempRole", "true");
						}
					}
					if(has("webkit") && this._hasTag(x, "LI") && rias.dom.getStyle(x, "textAlign") !== "center"){
						rias.dom.setStyle(x, "textAlign", (rias.dom.getStyle(x,"direction") === "rtl" ? "right" : "left"));
					}
					if(has("mozilla") && this._hasTag(x, "LI")){
						var pDiv = x.parentNode.parentNode;
						if(pDiv !== this.editor.editNode && this._hasTag(pDiv, "DIV")){
							if(pDiv.childNodes.length === 1){
								pDiv.parentNode.insertBefore(x.parentNode, pDiv);
								pDiv.parentNode.removeChild(pDiv);
							}
						}
					}
				}
				if(has("ie")){
					// IE always converts list items to <P>
					if(this._hasTag(x, "P") && this.blockMode.toUpperCase() === "DIV"){
						if(this._hasTag(x.firstChild, "SPAN") && rias.dom.hasAttr(x.firstChild, "bogusIEFormat")){
							if(rias.dom.getAttr(x.firstChild, "bogusIEFormat").toUpperCase() === "PRE"){
								var pre = rias.dom.create("pre", {
									innerHTML: x.innerHTML
								}, x, "before");
								pre.style.cssText = x.style.cssText;
								pre.removeChild(pre.firstChild);
								x.parentNode.removeChild(x);
							}else{
								x.removeChild(x.firstChild);
							}
							return;
						}
						var nDiv = rias.dom.create("div");
						nDiv.style.cssText = x.style.cssText;
						x.parentNode.insertBefore(nDiv, x);
						while(x.firstChild){
							nDiv.appendChild(x.firstChild);
						}
						x.parentNode.removeChild(x);
					}	
				}
				if(this._hasTag(x, "LI")){
					this._refineLIMargins(x);
					if(has("mozilla")){
						this._recountLIMargins(x, indent);
					}
				}
			},this);
			if(has("mozilla") || has("webkit")){
				query("div[tempRole]",this.editor.editNode).forEach(function(x, index, arr){
					x.parentNode.removeChild(x);
				});
			}
		},

		_prepareFormat: function(nodesInfo, arg){
			rias.forEach(nodesInfo.nodes, function(x){
				// In some cases Mozill'a native 'formatblock' command mistakely merges contents of list items.
				// For example, for list with three items, containing some text like "one", "two", "three" and first two items selected, 
				// after changing their format from "None" to "Paragraph" we get from <li>one</li><li>two<li> something like 
				// <li><p>Onetwo</p></li><li><br></li>. Problem can be solved by 'manual' formatting, 
				// so with given example we create <li><p>...</p></li> for each list item.
				if(has("mozilla")){
					if(this._hasTag(x,"LI")){
						if(x.firstChild && !this._isBlockElement(x.firstChild)){
							var div = x.ownerDocument.createElement(arg), sibling = x.firstChild;
							x.insertBefore(div, x.firstChild);
							while(sibling){
								div.appendChild(sibling);
								sibling = sibling.nextSibling;
							}
						}
						var indent = this._getLIIndent(x);
						rias.dom.setAttr(x, "tempIndent", indent);
					}
				}
				if(has("webkit")){
					var styledSpan;
					// If "fomatblocks" command is executed for list items, which already contain some blocks,
					// webkit merges contents of items. For example, after calling "formatblocks" with argument "P"
					// for two items <ul><li><h3>Hello</h3></li><li><h3>World</h3></li></ul> we get one item 
					// <ul><li><p>Hello<br>World<p></li></ul>. To avoid this, we move contents of each block into 
					// its parent,delete empty blocks and save info about required format in some bogus spans with 
					// empty contents. Action, executed after native call, will recreate blocks in required format  
					// and remove bogus spans.
					if(this._hasTag(x,"LI")){
						var savedName = arg;
						if(this._hasStyledTextLineTag(x.firstChild)){
							while(x.firstChild.lastChild){
								rias.dom.place(x.firstChild.lastChild, x.firstChild, "after");
							}
							x.removeChild(x.firstChild);
						}
						styledSpan = rias.dom.create("span", {
							innerHTML: this.bogusHtmlContent,
							bogusFormat: savedName
						}, x, "first");
					}
 					// Webkit lose 'direction' and 'textAlign' styles of reformatted blocks. 
					// We save info about these styles in attributes of some bogus SPANs with empty contents.					
					// Action, executed after native call, will restore styles of these blocks and remove bogus spans. 
					var style = rias.dom.getComputedStyle(x),
						curDir = style.direction,
						curAlign = style.textAlign;
					curAlign = this._refineAlignment(curDir, curAlign);
					var span = styledSpan ? x.firstChild : rias.dom.create("span", {
						innerHTML: this.bogusHtmlContent
					}, x, "first");
					rias.dom.setAttr(span, "bogusDir", curDir);
					if(curAlign !== ""){
						rias.dom.setAttr(span, "bogusAlign", curAlign);
					}
				}
			},this);
		},
		
		_execFormatBlocks: function(nodesInfo, arg){
			rias.forEach(nodesInfo.nodes, function(x){
				var div, block, tag,
					style, align, indent;
				if(this._hasTagFrom(x, this._lineTextArray)){
					//FF adds empty text nodes or nodes, containing spaces, after last converted block
					if(this._hasTag(x.parentNode,"DIV") && x.parentNode !== this.editor.editNode){
						while(x.parentNode.lastChild){
							if(!(x.parentNode.lastChild.nodeType === 3 && rias.trim(x.parentNode.lastChild.nodeValue) === "" ||
									this._hasTag(x.parentNode.lastChild,"BR"))){
								break;
							}	
							x.parentNode.removeChild(x.parentNode.lastChild);
						}
					}
					if(this._hasTag(x.parentNode,"DIV") && x.parentNode !== this.editor.editNode && x.parentNode.childNodes.length === 1){
						div = x.parentNode;
						style = rias.dom.getComputedStyle(div);
						align = this._refineAlignment(style.direction, style.textAlign);
						rias.dom.setStyle(x, {direction: style.direction, textAlign: align});
						var margin = style.direction === "rtl"? "marginRight" : "marginLeft";
						var marginVal = parseInt(rias.dom.getStyle(div, margin));
						if(marginVal !== 0 && !isNaN(marginVal)){
							rias.dom.setStyle(x, margin, marginVal);
						}
						div.parentNode.insertBefore(x, div);
						div.parentNode.removeChild(div);
					}
				}
				if(this._hasTag(x,"LI")){
					indent = 0;
					if(rias.dom.hasAttr(x, "tempIndent")){
						indent = parseInt(rias.dom.getAttr(x, "tempIndent"));
						rias.dom.removeAttr(x, "tempIndent");
					}
					this._refineLIMargins(x);
					if(indent){
						this._recountLIMargins(x,indent);
					}
					while(x.childNodes.length > 1){
						if(!(x.lastChild.nodeType === 3 && rias.trim(x.lastChild.nodeValue) === "")){
							break;
						}	
						x.removeChild(x.lastChild);
					}
					if(this._hasTagFrom(x.firstChild, this._lineStyledTextArray)){
						style = rias.dom.getComputedStyle(x);
						align = this._refineAlignment(style.direction, style.textAlign);
						if(!has("mozilla") && !(has("ie") && this._hasTag(x, "LI"))){
							rias.dom.setStyle(x.firstChild, {direction : style.direction, textAlign: align});
						}
					}else if(this._hasTag(x.firstChild, "DIV")){
						div = x.firstChild;
						while(div.firstChild){
							x.insertBefore(div.firstChild, div);
						}
						x.removeChild(div);
					}
					// IE doesn't format list items with not formatted content into paragraphs 
					if(has("ie") && !this._hasTag(x.firstChild, "P") && arg === "<p>"){
						var p = rias.dom.create("p");
						block = this._hasTagFrom(p.nextSibling, this._lineStyledTextArray) ? p.nextSibling : x;
						while(block.firstChild){
							rias.dom.place(block.firstChild, p, "last");
						}
						rias.dom.place(p, x, "first");
						if(block !== x){
							x.removeChild(block);
						}
					}
				}
				if(has("webkit")){
					// When "formatblocks" with argument "div" is executed for list items, containing blocks like <h1>
					// or <pre>, Safari loads contents of these blocks into newly created DIVs, and places these DIVs 
					// into the same list as next siblings of source items. For example, if we have something like
					// <li><h3>Hello</h3></li>, we get <li><br></li><div>Hello</div>. So we move contents of these DIV's
					// into items and set special attributes for future deleting.
					if(this._hasTag(x, "DIV")){
						if(rias.dom.hasAttr(x, "tempRole")){
							return;
						}else if(this._hasTag(x.previousSibling, "LI")){
							while(x.firstChild){
								rias.dom.place(x.firstChild, x.previousSibling, "last");
							}
							rias.dom.setAttr(x, "tempRole", true);
							x = x.previousSibling;
						}
					}
					// Restore attributes and remove bogus elments
					var hasBogusSpan = false;
					if(rias.dom.hasAttr(x.firstChild, "bogusDir")){
						hasBogusSpan = true;
						var dir = rias.dom.getAttr(x.firstChild, "bogusDir");
						rias.dom.setStyle(x, "direction", dir);
					}
					if(rias.dom.hasAttr(x.firstChild, "bogusAlign")){
						hasBogusSpan = true;
						align = rias.dom.getAttr(x.firstChild, "bogusAlign");
						rias.dom.setStyle(x, "textAlign", align);
					}
					if(rias.dom.hasAttr(x.firstChild, "bogusFormat")){
						hasBogusSpan = true;
						tag = rias.dom.getAttr(x.firstChild, "bogusFormat");
						if(tag.toUpperCase() !== "DIV"){
							block = rias.dom.create(tag, null, x.firstChild, "after");
							while(block.nextSibling){
								rias.dom.place(block.nextSibling, block, "last");
							}
						}else{
							block = x;
						}
						if(has("safari") && this._hasTag(x.nextSibling, "DIV")){
							while(x.nextSibling.firstChild){
								rias.dom.place(x.nextSibling.firstChild, block, "last");
							}
							rias.dom.setAttr(x.nextSibling, "tempRole", "true");
						}
					}
					if(hasBogusSpan){
						x.removeChild(x.firstChild);
					}
					if(tag && this._hasTag(x, "LI")){
						var parent = x.parentNode.parentNode;
						if(this._hasTag(parent, tag)){
							rias.dom.setAttr(parent, "tempRole", "true");
						}
					}
				}
			}, this);
			// Safari in some cases put ito lists unnecessary divs. They already empty and marked with 'tempRole' attribute.  
			// Both Chrome and Safari create for each formatted list item its own list and place such lists 
			// into top-level block elements. In this method above, needed "styled" blocks are already recreated inside 
			// list items, so corresponding top-level elements become unnecessary. They already marked with 'tempRole' attribute.
			// Now all elements having 'tempRole' attribute should be removed.
			if(has("webkit")){
				query("*[tempRole]",this.editor.editNode).forEach(function(x, index, arr){
					while(x.lastChild){
						rias.dom.place(x.lastChild, x, "after");
					}
					x.parentNode.removeChild(x);
				}, this);
			}
		},
		
		_rebuildBlock: function(block){
			// summary:
			//		Finds a sequences of inline elements that are placed 
			//		within a top-level block element or have block siblings.
			//		Calls _repackInlneElements(), which moves this sequences 
			//		into newly created block.
			var node = block.firstChild, firstSibling, lastSibling;
			var hasOwnBlock = false;  
			while(node){
				if(this._isInlineOrTextElement(node) && !this._hasTagFrom(node,this._tableContainers)){
					hasOwnBlock = !this._hasTagFrom(block,this._lineTextArray);
					if(!firstSibling){
						firstSibling = node;
					}
					lastSibling = node;
				}else if(this._isBlockElement(node) || this._hasTagFrom(node,this._tableContainers)){
					if(firstSibling){
						this._repackInlineElements(firstSibling, lastSibling, block);
						firstSibling = null;
					}
					hasOwnBlock = true;
				}
				node = node.nextSibling;
			}
			if(hasOwnBlock && firstSibling){
				this._repackInlineElements(firstSibling, lastSibling, block);
			}
		},
		
		_repackInlineElements: function(firstSibling, lastSibling, parent){
			// summary:
			//		Moves sequences of inline elements into 
			//		newly created blocks
			// description:
			//		This method handles sequences of inline elements, which are recognized by the user as 
			// 		separate line(s) of the text, but are not placed into their own block element. Text direction
			//		or alignment can't be set for such lines.
			//		Possibles cases: 
			//			a) sequence directly belongs to editor's editNode;
			//			b) sequence has block-level siblings;
			//			c) sequence has BR in the start or in the middle of it.
			//		For all these cases we create new block and move elements from the sequence into it.
			//		We try to preserve explicitly defined styles, which have effect on this line. In case of
			//		sequences, which directly belong to editNode, it is only direction of the text.
			var divs = [], div = parent.ownerDocument.createElement(this.blockMode), newDiv;
			var cssTxt = firstSibling.previousSibling && firstSibling.previousSibling.nodeType === 1 ? firstSibling.previousSibling.style.cssText : parent.style.cssText;
			var isEditNode = parent === this.editor.editNode;
			divs.push(div);
			firstSibling = parent.replaceChild(div, firstSibling);
			rias.dom.place(firstSibling, div, "after");
			if(isEditNode){
				rias.dom.setStyle(div, 'direction', rias.dom.getStyle(this.editor.editNode, "direction"));
			}else{
				div.style.cssText = cssTxt;
			}
			for(var sibling = firstSibling; sibling;){
				var tSibling = sibling.nextSibling;
				if(this._isInlineOrTextElement(sibling)){
					if(this._hasTag(sibling, "BR") && sibling !== lastSibling){
						newDiv = parent.ownerDocument.createElement(this.blockMode);
						divs.push(newDiv);
						sibling = parent.replaceChild(newDiv, sibling);
						rias.dom.place(sibling, newDiv, "after");
						if(isEditNode){
							rias.dom.setStyle(newDiv, 'direction', rias.dom.getStyle(this.editor.editNode, "direction"));
						}else{
							newDiv.style.cssText = cssTxt;
						}
					}
					if((this._hasTag(sibling, "BR") || sibling.nodeType === 8) && !div.hasChildNodes()){
						div.innerHTML = this.bogusHtmlContent;
					}
					if(this._hasTag(sibling, "BR") && has("ie")){
						sibling.parentNode.removeChild(sibling);
					}else if(sibling.nodeType !== 8){
						div.appendChild(sibling);
					}else{
						sibling.parentNode.removeChild(sibling);
					}
					if(sibling.nodeType === 3 && sibling.previousSibling && sibling.previousSibling.nodeType === 3){
						sibling.previousSibling.nodeValue += sibling.nodeValue;
						sibling.parentNode.removeChild(sibling);
					}
					if(newDiv){
						div = newDiv;
						newDiv = null;
					}
				}
				if(sibling === lastSibling){
					break;
				}
				sibling = tSibling;
			}
			return divs;
		},

		_preFilterNewLines: function(html){
			var result = html.split(/(<\/?pre.*>)/i),
				inPre = false;
			for(var i = 0; i < result.length; i++){
				if(result[i].search(/<\/?pre/i) < 0 && !inPre){
					result[i] = result[i].replace(/\n/g,"").replace(/\t+/g,"\xA0").replace(/^\s+/,"\xA0").replace(/\xA0\xA0+$/,"");
				}else if(result[i].search(/<\/?pre/i) >= 0){
					inPre = !inPre;
				}
			}
			return result.join("");
		},
		
		_refineAlignment: function(dir, align){
			// summary:
			//		Refine the value, which should be used as textAlign style.
			// description:
			//		This method allows to keep textAlign styles only for cases,
			//		when it is defined explicitly.
			if(align.indexOf("left") >= 0 && dir === "rtl"){
				align = "left";
			}else if(align.indexOf("right") >= 0 && dir === "ltr"){
				align = "right";
			}else if(align.indexOf("center") >= 0){
				align = "center";
			}else{ 
				align = "";
			}
			return align;
		},

		_refineLIMargins: function(node){
			// summary:
			//		Line items, orientation of which is differ from their parents,
			//		arn't shown correctly by all browsers.
			//		Problem is solved by adding corresponding margins.
			var liDir = rias.dom.getStyle(node, "direction"),
				pDir = rias.dom.getStyle(node.parentNode, "direction"),
				level = 0, tNode = node.parentNode, style, offs, val;
			if(has("webkit")){
				pDir = rias.dom.getStyle(this.editor.editNode, "direction");
			}
			while(tNode !== this.editor.editNode){
				if(this._hasTagFrom(tNode,["OL", "UL"])){
					level++;
				}
				tNode = tNode.parentNode;
			}
			rias.dom.setStyle(node, "marginRight", "");
			rias.dom.setStyle(node, "marginLeft", "");
			style = liDir === "rtl" ? "marginRight" : "marginLeft";
			offs = this._getMargins(level);
			val = "" + offs + "px";
			if(liDir !== pDir){
				rias.dom.setStyle(node, style, val);
			}
		},
		
		_getMargins: function(level){
			if(level === 0){
				return 0;
			}
			var margin = 35;
			if(has("mozilla")){
				margin = 45;
			}else if(has("ie")){
				margin = 25;
			}
			return margin + (level - 1) * 40;
		},
		
		_recountLIMargins: function(node, addValue){
			var liDir = rias.dom.getStyle(node, "direction"),
				pDir = rias.dom.getStyle(node.parentNode, "direction");
			var margin = liDir === "rtl" ? "marginRight" : "marginLeft";
			var valPx = rias.dom.getStyle(node,margin);
			var val = (isNaN(parseInt(valPx)) ? 0 : parseInt(valPx)) + (addValue ? addValue : 0);
			if(node.firstChild && node.firstChild.nodeType === 1){
				valPx = rias.dom.getStyle(node.firstChild,margin);
				val += isNaN(parseInt(valPx)) ? 0 : parseInt(valPx);
				rias.dom.setStyle(node.firstChild, {marginLeft: "", marginRight: ""});
			}
			if(liDir !== pDir){
				val -= this._getMargins(this._getLILevel(node));
			}
			var parentMargin = this._getListMargins(node);
			if(parentMargin){
				for(var i = 0; i < parentMargin/40; i++){
					var newList = rias.dom.create(this._tag(node.parentNode), null, node, "before");
					rias.dom.place(node, newList, "last");
				}
			}
			if(liDir !== pDir){
				val += this._getMargins(this._getLILevel(node));
			}
			if(val){
				rias.dom.setStyle(node,margin, "" + (val) + "px");
			}
		},
		
		_getLILevel: function(node){
			var parent = node.parentNode;
			var level = 0;
			while(this._hasTagFrom(parent, ["UL","OL"])){
				level++;
				parent = parent.parentNode;
			}
			return level;
		},

		_getLIIndent: function(node){
			var parent = node.parentNode,
				liDir = rias.dom.getStyle(node, "direction"),
				pDir = rias.dom.getStyle(parent,"direction"),
				margin = liDir === "rtl" ? "marginRight" : "marginLeft";
			var marginVal = this._getIntStyleValue(node,margin);
			var liMargin = liDir === pDir ? 0 : this._getMargins(this._getLILevel(node));
			return marginVal - liMargin;
		},
		
		_getListMargins: function(node){
			var parent = node.parentNode;
			var margin, val = 0, valPx;
			while(this._hasTagFrom(parent, ["UL","OL"])){
				var pDir = rias.dom.getStyle(parent, "direction");
				margin = pDir === "rtl" ? "marginRight" : "marginLeft";
				valPx = rias.dom.getStyle(parent, margin);
				val += isNaN(parseInt(valPx)) ? 0 : parseInt(valPx);
				parent = parent.parentNode;
			}
			return val;
		},
		
		_tag: function(node){
			return node && node.tagName && node.tagName.toUpperCase();
		},
		
		_hasTag: function(node, tag){
			return (node && tag && node.tagName && node.tagName.toUpperCase() === tag.toUpperCase());
		},

		_hasStyledTextLineTag: function(node){
			return this._hasTagFrom(node, this._lineStyledTextArray);
		},
		
		_hasTagFrom: function(node, arr){
			return node && arr && node.tagName && rias.indexOf(arr, node.tagName.toUpperCase()) >= 0;
		},
		
		_getParentFrom: function(node, arr){
			if(!node || !arr || !arr.length){
				return null;
			}
			var x = node;
			while(x !== this.editor.editNode){
				if(this._hasTagFrom(x, arr)){
					return x;
				}
				x = x.parentNode;
			}
			return null;
		},

		_isSimpleInfo: function(info){
			// summary:
			// 	returns true, if all nodes, for which current action should be executed,
			//  may be handled in the same time (so, all nodes are in the same group)
			return !info || info.groups.length < 2;
		},
		
		_isListTypeChanged: function(node, cmd){
			// summary:
			//	Returns true, if command "insertorderedlist" executed for item from unordered list and 
			//	if command "insertunorderedlist" executed for item from ordered list
			if(!this._hasTag(node, "LI")){
				return false;
			}
			var parent = node.parentNode;
			return (this._hasTag(parent, "UL") && cmd === "insertorderedlist" || this._hasTag(parent, "OL") && cmd === "insertunorderedlist");
		},
		
		_getIntStyleValue: function(node, style){
			var val = parseInt(rias.dom.getStyle(node,style));
			return isNaN(val) ? 0 : val;
		},
		
		_mergeLists: function(){
			// summary:
			//	In some cases (like "formatblocks" for list items) lists of the the same type 
			//	are created as a siblings inside the same parent. These  lists should be merged.
			var sel = rangeapi.getSelection(this.editor.window),
				range,
				startContainer,
				startOffset,
				endContainer,
				endOffset;
			var reselect = sel && sel.rangeCount > 0;
			if(reselect){
				range = sel.getRangeAt(0).cloneRange();
				startContainer = range.startContainer;
				startOffset = range.startOffset;
				endContainer = range.endContainer;
				endOffset = range.endOffset;
			}
			var wasMerged = false;
			query("ul,ol", this.editor.editNode).forEach(function(x, ind, arr){
				if(rias.dom.hasAttr(x, "tempRole")){
					x.parentNode.removeChild(x);
					return;
				}
				var sibling = x.nextSibling;
				while(this._hasTag(sibling, this._tag(x))){
					while(sibling.firstChild){
						rias.dom.place(sibling.firstChild, x, "last");
						wasMerged = true;
					}
					rias.dom.setAttr(sibling, "tempRole", "true");
					sibling = sibling.nextSibling;
				}
			}, this);
			if(reselect && wasMerged){
				// Restore selection
				sel.removeAllRanges();
				try{
					range.setStart(startContainer, startOffset);
					range.setEnd(endContainer, endOffset);
					sel.addRange(range);
				}catch(e){
				}
			}
		},
		
		_cleanLists: function(){
			// summary:
			//	Removes remaining bogus elements, creating by the method _prepareLists()
			if(has("webkit")){
				query("table", this.editor.editNode).forEach(function(x, ind, arr){
					var sibling = x.nextSibling;
					if(this._hasTag(sibling,"UL") && rias.dom.getAttr(sibling, "tempRole") === "true"){
						sibling.parentNode.removeChild(sibling);
					}
				},this);
				query("li[tempRole]", this.editor.editNode).forEach(function(x, ind, arr){
					if(x.parentNode.childNodes.length === 1){
						x.parentNode.parentNode.removeChild(x.parentNode);
					}else{
						x.parentNode.removeChild(x);
					}
				});
			}
			var sel = rangeapi.getSelection(this.editor.window),
				range, startContainer, startOffset, endContainer, endOffset,
				reselect = sel && sel.rangeCount > 0;
			if(reselect){
				range = sel.getRangeAt(0).cloneRange();
				startContainer = range.startContainer;
				startOffset = range.startOffset;
				endContainer = range.endContainer;
				endOffset = range.endOffset;
			}
			var wasMoved = false;
			query("span[bogusDir]", this.editor.editNode).forEach(function(x, ind, arr){
				var node = x.firstChild, sibling = node;
				if(node.nodeType === 1){
					while(node){
						sibling = node.nextSibling;
						rias.dom.place(node, x, "after");
						wasMoved = true;
						node = sibling;
					}
				}
				x.parentNode.removeChild(x);
			}, this);
			if(reselect && wasMoved){
				// Restore selection
				sel.removeAllRanges();
				try{
					range.setStart(startContainer, startOffset);
					range.setEnd(endContainer, endOffset);
					sel.addRange(range);
				}catch(e){
				}
			}
		}
	});

	_Plugin.registry.bidiSupport = _Plugin.registry.bidisupport = function(args){
		return new BidiSupport(args);
	};
	return BidiSupport;
});
