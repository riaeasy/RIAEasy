define([
	"riasw/riaswBase",
	"dojo/io/script",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"../_Plugin",
	"./_SpellCheckParser",
	"riasw/form/TextBox",
	"riasw/form/Button",
	"riasw/form/DropDownButton",
	"riasw/form/MultiSelect",
	"riasw/sys/Dialog",
	"riasw/sys/Menu",
	"riasw/sys/MenuItem",
	"riasw/sys/MenuSeparator",
	"dojo/i18n!./nls/SpellCheck"
], function(rias, script, _WidgetBase, _TemplatedMixin, _Plugin, _SpellCheckParser,
            TextBox, Button, DropDownButton, MultiSelect, Dialog, Menu, MenuItem, MenuSeparator){

	//rias.experimental("dojox.editor.plugins.SpellCheck");
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var SpellCheckControl = rias.declare(pluginsName + "._spellCheckControl", [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		The widget that is used for the UI of the batch spelling check

		widgetsInTemplate: true,

		templateString:
			"<table role='presentation' class='riaswEditorSpellCheckTable'>" +
				"<tr>" +
					"<td colspan='3' class='alignBottom'>" +
						"<label for='${textId}' id='${textId}_label'>${unfound}</label>" +
						"<div class='riaswEditorSpellCheckBusyIcon' id='${id}_progressIcon'></div>" +
					"</td>" +
				"</tr><tr>" +
					"<td class='riaswEditorSpellCheckBox'>" +
						"<input dojoType='riasw.form.TextBox' required='false' intermediateChanges='true' class='riaswEditorSpellCheckBox' data-dojo-attach-point='unfoundTextBox' id='${textId}'/>" +
					"</td><td>" +
						"<button dojoType='riasw.form.Button' class='blockButton' data-dojo-attach-point='skipButton'>${skip}</button>" +
					"</td><td>" +
						"<button dojoType='riasw.form.Button' class='blockButton' data-dojo-attach-point='skipAllButton'>${skipAll}</button>" +
					"</td>" +
				"</tr><tr>" +
					"<td class='alignBottom'>" +
						"<label for='${selectId}'>${suggestions}</label>" +
					"</td><td colspan='2'>" +
						"<button dojoType='riasw.form.Button' class='blockButton' data-dojo-attach-point='toDicButton'>${toDic}</button>" +
					"</td>" +
				"</tr><tr>" +
					"<td>" +
						"<select dojoType='riasw.form.MultiSelect' id='${selectId}' class='riaswEditorSpellCheckBox listHeight' data-dojo-attach-point='suggestionSelect'></select>" +
					"</td><td colspan='2'>" +
						"<button dojoType='riasw.form.Button' class='blockButton' data-dojo-attach-point='replaceButton'>${replace}</button>" +
						"<div class='topMargin'>" +
							"<button dojoType='riasw.form.Button' class='blockButton' data-dojo-attach-point='replaceAllButton'>${replaceAll}</button>" +
						"<div>" +
					"</td>" +
				"</tr><tr>" +
					"<td>" +
						"<div class='topMargin'>" +
							"<button dojoType='riasw.form.Button' data-dojo-attach-point='cancelButton'>${cancel}</button>" +
						"</div>" +
					"</td><td>" +
					"</td><td>" +
					"</td>" +
				"</tr>" +
			"</table>",

		/*************************************************************************/
		/**                      Framework Methods                              **/
		/*************************************************************************/
		constructor: function(){
			// Indicate if the textbox ignores the text change event of the textbox
			this.ignoreChange = false;
			// Indicate if the text of the textbox is changed or not
			this.isChanged = false;
			// Indicate if the dialog is open or not
			this.isOpen = false;
			// Indicate if the dialog can be closed
			this.closable = true;
		},

		postMixInProperties: function(){
			this.id = rias.rt.getUniqueId(this.declaredClass.replace(/\./g,"_"));
			this.textId = this.id + "_textBox";
			this.selectId = this.id + "_select";
			this.inherited(arguments);
		},

		postCreate: function(){
			var select = this.suggestionSelect;

			// Customize multi-select to single select
			rias.dom.removeAttr(select.domNode, "multiple");
			select.addItems = function(/*Array*/ items){
				// summary:
				//		Add items to the select widget
				// items:
				//		An array of items be added to the select
				// tags:
				//		public
				var self = this;
				var o = null;
				if(items && items.length > 0){
					rias.forEach(items, function(item, i){
						o = rias.dom.create("option", {innerHTML: item, value: item}, self.domNode);
						if(i == 0){
							o.selected = true;
						}
					});
				}
			};
			select.removeItems = function(){
				// summary:
				//		Remove all the items within the select widget
				// tags:
				//		public
				rias.dom.empty(this.domNode);
			};

			select.deselectAll = function(){
				// summary:
				//		De-select all the selected items
				// tags:
				//		public
				this.containerNode.selectedIndex = -1;
			};

			// Connect up all the controls with their event handler
			this.after(this, "onKeyPress", "_cancel", true);
			this.after(this.unfoundTextBox, "onKeyPress", "_enter", true);
			this.after(this.unfoundTextBox, "onChange", "_unfoundTextBoxChange", true);
			this.after(this.suggestionSelect, "onKeyPress", "_enter", true);
			this.after(this.skipButton, "onClick", "onSkip", true);
			this.after(this.skipAllButton, "onClick", "onSkipAll", true);
			this.after(this.toDicButton, "onClick", "onAddToDic", true);
			this.after(this.replaceButton, "onClick", "onReplace", true);
			this.after(this.replaceAllButton, "onClick", "onReplaceAll", true);
			this.after(this.cancelButton, "onClick", "onCancel", true);
		},

		/*************************************************************************/
		/**                      Public Methods                                 **/
		/*************************************************************************/

		onSkip: function(){
			// Stub for the click event of the skip button.
		},

		onSkipAll: function(){
			// Stub for the click event of the skipAll button.
		},

		onAddToDic: function(){
			// Stub for the click event of the toDic button.
		},

		onReplace: function(){
			// Stub for the click event of the replace button.
		},

		onReplaceAll: function(){
			// Stub for the click event of the replaceAll button.
		},

		onCancel: function(){
			// Stub for the click event of the cancel button.
		},

		onEnter: function(){
			// Stub for the enter event of the unFound textbox.
		},

		focus: function(node, forceVisible){
			// summary:
			//		Set the focus of the control
			// tags:
			//		public
			if(!this.isDestroyed(true)){
				this.unfoundTextBox.focus(node, forceVisible);
			}
		},

		/*************************************************************************/
		/**                      Private Methods                                **/
		/*************************************************************************/

		_cancel: function(/*Event*/ evt){
			// summary:
			//		Handle the cancel event
			// evt:
			//		The event object
			// tags:
			//		private
			if(evt.keyCode == rias.keys.ESCAPE){
				this.onCancel();
				rias.stopEvent(evt);
			}
		},

		_enter: function(/*Event*/ evt){
			// summary:
			//		Handle the enter event
			// evt:
			//		The event object
			// tags:
			//		private
			if(evt.keyCode == rias.keys.ENTER){
				this.onEnter();
				rias.stopEvent(evt);
			}
		},

		_unfoundTextBoxChange: function(){
			// summary:
			//		Indicate that the Not Found textbox is changed or not
			// tags:
			//		private
			var id = this.textId + "_label";
			if(!this.ignoreChange){
				rias.dom.byId(id).innerHTML = this["replaceWith"];
				this.isChanged = true;
				this.suggestionSelect.deselectAll();
			}else{
				rias.dom.byId(id).innerHTML = this["unfound"];
			}
		},

		_setUnfoundWordAttr: function(/*String*/ value){
			// summary:
			//		Set the value of the Not Found textbox
			// value:
			//		The value of the Not Found textbox
			// tags:
			//		private
			value = value || "";
			this.unfoundTextBox.set("value", value);
		},

		_getUnfoundWordAttr: function(){
			// summary:
			//		Get the value of the Not Found textbox
			// tags:
			//		private
			return this.unfoundTextBox.get("value");
		},

		_setSuggestionListAttr: function(/*Array*/ values){
			// summary:
			//		Set the items of the suggestion list
			// values:
			//		The list of the suggestion items
			// tags:
			//		private
			var select = this.suggestionSelect;
			values = values || [];
			select.removeItems();
			select.addItems(values);
		},

		_getSelectedWordAttr: function(){
			// summary:
			//		Get the suggested word.
			//		If the select box is selected, the value is the selected item's value,
			//		else the value the the textbox's value
			// tags:
			//		private
			var selected = this.suggestionSelect.getSelected();
			if(selected && selected.length > 0){
				return selected[0].value;
			}else{
				return this.unfoundTextBox.get("value");
			}
		},

		_setDisabledAttr: function(/*Boolean*/ disabled){
			// summary:
			//		Enable/disable the control
			// tags:
			//		private
			this.skipButton.set("disabled", disabled);
			this.skipAllButton.set("disabled", disabled);
			this.toDicButton.set("disabled", disabled);
			this.replaceButton.set("disabled", disabled);
			this.replaceAllButton.set("disabled", disabled);
		},

		_setInProgressAttr: function(/*Boolean*/ show){
			// summary:
			//		Set the visibility of the progress icon
			// tags:
			//		private
			var id = this.id + "_progressIcon";
			rias.dom.toggleClass(id, "hidden", !show);
		}
	});

	var SpellCheckScriptMultiPart = rias.declare(pluginsName + "._SpellCheckScriptMultiPart", null, {
		// summary:
		//		It is a base network service component. It transfers text to a remote service port
		//		with cross domain ability enabled. It can split text into specified pieces and send
		//		them out one by one so that it can handle the case when the service has a limitation of
		//		the capability.
		//		The encoding is UTF-8.

		// ACTION [public const] String
		//		Actions for the server-side piece to take
		ACTION_QUERY: "query",
		ACTION_UPDATE: "update",

		// callbackHandle [public] String
		//		The callback name of JSONP
		callbackHandle: "callback",

		// maxBufferLength [public] Number
		//		The max number of characters that send to the service at one time.
		maxBufferLength: 100,

		// delimiter [public] String
		//		A token that is used to identify the end of a word (a complete unit). It prevents the service from
		//		cutting a single word into two parts. For example:
		// |		"Dojo toolkit is a ajax framework. It helps the developers buid their web applications."
		//		Without the delimiter, the sentence might be split into the follow pieces which is absolutely
		//		not the result we want.
		// |		"Dojo toolkit is a ajax fram", "ework It helps the developers bu", "id their web applications"
		//		Having " " as the delimiter, we get the following correct pieces.
		// |		"Dojo toolkit is a ajax framework", " It helps the developers buid", " their web applications"
		delimiter: " ",

		// label [public] String
		//		The leading label of the JSON response. The service will return the result like this:
		// |	{response: [
		// |		{
		// |			text: "teest",
		// |			suggestion: ["test","treat"]
		// |		}
		// |	]}
		label: "response",

		// _timeout: [private] Number
		//		Set JSONP timeout period
		_timeout: 30000,
		SEC: 1000,

		constructor: function(){
			// The URL of the target service
			this.serviceEndPoint = "";
			// The queue that holds all the xhr request
			this._queue = [];
			// Indicate if the component is still working. For example, waiting for collecting all
			// the responses from the service
			this.isWorking = false;
			// The extra command passed to the service
			this.exArgs = null;
			// The counter that indicate if all the responses are collected to
			// assemble the final result.
			this._counter = 0;
		},

		send: function(/*String*/ content, /*String?*/ action){
			// summary:
			//		Send the content to the service port with the specified action
			// content:
			//		The text to be sent
			// action:
			//		The action the service should take. Current support actions are
			//		ACTION_QUERY and ACTION_UPDATE
			// tags:
			//		public
			var self = this,
				dt = this.delimiter,
				mbl = this.maxBufferLength,
				label = this.label,
				serviceEndPoint = this.serviceEndPoint,
				callbackParamName = this.callbackHandle,
				comms = this.exArgs,
				timeout = this._timeout,
				l = 0, r = 0;

			// Temporary list that holds the result returns from the service, which will be
			// assembled into a completed one.
			if(!this._result) {
				this._result = [];
			}

			action = action || this.ACTION_QUERY;

			var batchSend = function(){
				var plan = [];
				var plannedSize = 0;
				if(content && content.length > 0){
					self.isWorking = true;
					var len = content.length;
					do{
						l = r + 1;
						if((r += mbl) > len){
							r = len;
						}else{
							// If there is no delimiter (emplty string), leave the right boundary where it is.
							// Else extend the right boundary to the first occurrence of the delimiter if
							// it doesn't meet the end of the content.
							while(dt && content.charAt(r) != dt && r <= len){
								r++;
							}
						}
						// Record the information of the text slices
						plan.push({l: l, r: r});
						plannedSize++;
					}while(r < len);

					rias.forEach(plan, function(item, index){
						var jsonpArgs = {
							url: serviceEndPoint,
							action: action,
							timeout: timeout,
							callbackParamName: callbackParamName,
							handle: function(response, ioArgs){
								if(++self._counter <= this.size && !(response instanceof Error) &&
									response[label] && rias.isArray(response[label])){
									// Collect the results
									var offset = this.offset;
									rias.forEach(response[label], function(item){
										item.offset += offset;
									});
									// Put the packages in order
									self._result[this.number]= response[label];
								}
								if(self._counter == this.size){
									self._finalizeCollection(this.action);
									self.isWorking = false;
									if(self._queue.length > 0){
										// Call the next request waiting in queue
										(self._queue.shift())();
									}
								}
							}
						};
						jsonpArgs.content = comms ? rias.mixin(comms, {action: action, content: content.substring(item.l - 1, item.r)}):
						{action: action, content: content.substring(item.l - 1, item.r)};
						jsonpArgs.size = plannedSize;
						jsonpArgs.number = index; // The index of the current package
						jsonpArgs.offset = item.l - 1;
						dojo.io.script.get(jsonpArgs);
					});
				}
			};

			if(!self.isWorking){
				batchSend();
			}else{
				self._queue.push(batchSend);
			}
		},

		_finalizeCollection: function(action){
			// summary:
			//		Assemble the responses into one result.
			// action:
			//		The action token
			// tags:
			//		private
			var result = this._result,
				len = result.length;
			// Turn the result into a one-dimensional array
			for(var i = 0; i < len; i++){
				var temp = result.shift();
				result = result.concat(temp);
			}
			if(action == this.ACTION_QUERY){
				this.onLoad(result);
			}
			this._counter = 0;
			this._result = [];
		},

		onLoad: function(/*String*/ data){
			// Stub method for a successful call
		},

		setWaitingTime: function(/*Number*/ seconds){
			this._timeout = seconds * this.SEC;
		}
	});

	var SpellCheck = rias.declare(pluginsName + ".SpellCheck", [_Plugin], {
		// summary:
		//		This plugin provides a spelling check capability for the editor.

		// url: [public] String
		//		The url of the spelling check service
		url: "",

		// bufferLength: [public] Number
		//		The max length of each XHR request. It is used to divide the large
		//		text into pieces so that the server-side piece can hold.
		bufferLength: 100,

		// interactive: [public] Boolean
		//		Indicate if the interactive spelling check is enabled
		interactive: false,

		// timeout: [public] Number
		//		The minutes to waiting for the response. The default value is 30 seconds.
		timeout: 30,

		// button: [protected] riasw/form/DropDownButton
		//		The button displayed on the editor's toolbar
		button: null,

		// _editor: [private] Editor
		//		The reference to the editor the plug-in belongs to.
		_editor: null,

		// exArgs: [private] Object
		//		The object that holds all the parametes passed into the constructor
		exArgs: null,

		// _cursorSpan: [private] String
		//		The span that holds the current position of the cursor
		_cursorSpan:
			"<span class=\"cursorPlaceHolder\"></span>",

		// _cursorSelector: [private] String
		//		The CSS selector of the cursor span
		_cursorSelector:
			"cursorPlaceHolder",

		// _incorrectWordsSpan: [private] String
		//		The wrapper that marks the incorrect words
		_incorrectWordsSpan:
			"<span class='incorrectWordPlaceHolder'>${text}</span>",

		// _ignoredIncorrectStyle: [private] Object
		//		The style of the ignored incorrect words
		_ignoredIncorrectStyle:
		{"cursor": "inherit", "borderBottom": "none", "backgroundColor": "transparent"},

		// _normalIncorrectStyle: [private] Object
		//		The style of the marked incorrect words.
		_normalIncorrectStyle:
		{"cursor": "pointer", "borderBottom": "1px dotted red", "backgroundColor": "yellow"},

		// _highlightedIncorrectStyle: [private] Object
		//		The style of the highlighted incorrect words
		_highlightedIncorrectStyle:
		{"borderBottom": "1px dotted red", "backgroundColor": "#b3b3ff"},

		// _selector: [private] String
		//		An empty CSS class that identifies the incorrect words
		_selector: "incorrectWordPlaceHolder",

		// _maxItemNumber: [private] Number
		//		The max number of the suggestion list items
		_maxItemNumber: 3,

		/*************************************************************************/
		/**                      Framework Methods                              **/
		/*************************************************************************/

		constructor: function(){
			// A list that holds all the spans that contains the incorrect words
			// It is used to select/replace the specified word.
			this._spanList = [];
			// The cache that stores all the words. It looks like the following
			// {
			//	 "word": [],
			//	 "wrd": ["word", "world"]
			// }
			this._cache = {};
			// Indicate if this plugin is enabled or not
			this._enabled = true;
			// The index of the _spanList
			this._iterator = 0;
		},

		setEditor: function(/*Editor*/ editor){
			this._editor = editor;
			this._initButton();
			this._setNetwork();
			this._connectUp();
		},

		/*************************************************************************/
		/**                      Private Methods                                **/
		/*************************************************************************/

		_initButton: function(){
			// summary:
			//		Initialize the button displayed on the editor's toolbar
			// tags:
			//		private

			var self = this,
				strings = (this._strings = rias.i18n.getLocalization(pluginsName, "SpellCheck"));

			this._dialogContent = new SpellCheckControl({
				unfound: strings["unfound"],
				skip: strings["skip"],
				skipAll: strings["skipAll"],
				toDic: strings["toDic"],
				suggestions: strings["suggestions"],
				replaceWith: strings["replaceWith"],
				replace: strings["replace"],
				replaceAll: strings["replaceAll"],
				cancel: strings["cancel"]
			});
			var dialogPane = (this._dialog = new Dialog({
				ownerRiasw: this,
				//parent: rias.desktop,
				content: this._dialogContent
			}));

			this.button = new DropDownButton({
				ownerRiasw: this,
				disabled: this.get("disabled"),
				readOnly: this.get("readOnly"),
				label: strings["widgetLabel"],
				showLabel: false,
				tooltip: strings["widgetLabel"],
				iconClass: "riaswEditorSpellCheckIcon",
				dropDown: dialogPane,
				id: rias.rt.getUniqueId(this.declaredClass.replace(/\./g,"_")) + "_dialogPane",
				closeDropDown: function(focus){
					// Determine if the dialog can be closed
					if(self._dialogContent.closable){
						self._dialogContent.isOpen = false;
						if(rias.has("ie")){
							var pos = self._iterator,
								list = self._spanList;
							if(pos < list.length && pos >=0 ){
								rias.dom.setStyle(list[pos], self._normalIncorrectStyle);
							}
						}
						if(this.isOpened()){
							rias.popupManager.hide(this.dropDown);
							if(focus){ this.focus(); }
							this._opened = false;
							this.state = "";
						}
					}
				}
			});
			self._dialogContent.isOpen = false;

			dialogPane.domNode.setAttribute("aria-label", this._strings["widgetLabel"]);
		},

		_setNetwork: function(){
			// summary:
			//		Set up the underlying network service
			// tags:
			//		private
			var comms = this.exArgs;

			if(!this._service){
				var service = (this._service = new SpellCheckScriptMultiPart());
				service.serviceEndPoint = this.url;
				service.maxBufferLength = this.bufferLength;
				service.setWaitingTime(this.timeout);
				// Pass the other arguments directly to the service
				if(comms){
					delete comms.name;
					delete comms.url;
					delete comms.interactive;
					delete comms.timeout;
					service.exArgs = comms;
				}
			}
		},

		_connectUp: function(){
			// summary:
			//		Connect up all the events with their event handlers
			// tags:
			//		private
			var editor = this._editor,
				cont = this._dialogContent;

			this.after(this.button, "set", "_disabled", true);
			this.after(this._service, "onLoad", "_loadData", true);
			this.after(this._dialog, "_onShow", "_openDialog", true);
			this.after(editor, "onKeyPress", "_keyPress", true);
			this.after(editor, "onLoad", "_submitContent", true);
			this.after(cont, "onSkip", "_skip", true);
			this.after(cont, "onSkipAll", "_skipAll", true);
			this.after(cont, "onAddToDic", "_add", true);
			this.after(cont, "onReplace", "_replace", true);
			this.after(cont, "onReplaceAll", "_replaceAll", true);
			this.after(cont, "onCancel", "_cancel", true);
			this.after(cont, "onEnter", "_enter", true);

			editor.contentPostFilters.push(this._spellCheckFilter); // Register the filter

			//rias.publish(pluginsName + ".SpellCheck.getParser", [this]); // Get the language parser
			this.parser = new _SpellCheckParser();
			if(!this.parser){
				console.error("Can not get the word parser!");
			}
		},

		/*************************************************************************/
		/**                      Event Handlers                                 **/
		/*************************************************************************/

		_disabled: function(name, disabled){
			// summary:
			//		When the plugin is disabled (the button is disabled), reset all to their initial status.
			//		If the interactive mode is on, check the content once it is enabled.
			// name:
			//		Command name
			// disabled:
			//		Command argument
			// tags:
			//		private
			if(name == "disabled"){
				if(disabled){
					this._iterator = 0;
					this._spanList = [];
				}else if(this.interactive && !disabled && this._service){
					this._submitContent(true);
				}
				this._enabled = !disabled;
			}
		},

		_keyPress: function(evt){
			// summary:
			//		The handler of the onKeyPress event of the editor
			// tags:
			//		private
			if(this.interactive){
				var v = 118, V = 86,
					cc = evt.charCode;
				if(!evt.altKey && cc == rias.keys.SPACE){
					this._submitContent();
				}else if((evt.ctrlKey && (cc == v || cc == V)) || (!evt.ctrlKey && evt.charCode)){
					this._submitContent(true);
				}
			}
		},

		_loadData: function(/*Array*/ data){
			// summary:
			//		Apply the query result to the content
			// data:
			//		The result of the query
			// tags:
			//		private
			var cache = this._cache,
				html = this._editor.get("value"),
				cont = this._dialogContent;

			this._iterator = 0;

			// Update the local cache
			rias.forEach(data, function(d){
				cache[d.text] = d.suggestion;
				cache[d.text].correct = false;
			});

			if(this._enabled){
				// Mark incorrect words
				cont.closable = false;
				this._markIncorrectWords(html, cache);
				cont.closable = true;

				if(this._dialogContent.isOpen){
					this._iterator = -1;
					this._skip();
				}
			}
		},

		_openDialog: function(){
			// summary:
			//		The handler of the onOpen event
			var cont = this._dialogContent;

			// Clear dialog content and disable it first
			cont.ignoreChange = true;
			cont.set("unfoundWord", "");
			cont.set("suggestionList", null);
			cont.set("disabled", true);
			cont.set("inProgress", true);

			cont.isOpen = true; // Indicate that the dialog is open
			cont.closable = false;

			this._submitContent();

			cont.closable = true;
		},

		_skip: function(/*Event?*/ evt, /*Boolean?*/ noUpdate){
			// summary:
			//		Ignore this word and move to the next unignored one.
			// evt:
			//		The event object
			// noUpdate:
			//		Indicate whether to update the status of the span list or not
			// tags:
			//		private
			var cont = this._dialogContent,
				list = this._spanList || [],
				len = list.length,
				iter = this._iterator;

			cont.closable = false;
			cont.isChanged = false;
			cont.ignoreChange = true;

			// Skip the current word
			if(!noUpdate && iter >= 0 && iter < len){
				this._skipWord(iter);
			}

			// Move to the next
			while(++iter < len && list[iter].edited == true){ /* do nothing */}
			if(iter < len){
				this._iterator = iter;
				this._populateDialog(iter);
				this._selectWord(iter);
			}else{
				// Reaches the end of the list
				this._iterator = -1;
				cont.set("unfoundWord", this._strings["msg"]);
				cont.set("suggestionList", null);
				cont.set("disabled", true);
				cont.set("inProgress", false);
			}

			setTimeout(function(){
				// When moving the focus out of the iframe in WebKit browsers, we
				// need to focus something else first. So the textbox
				// can be focused correctly.
				if(rias.has("webkit")) {
					cont.skipButton.focus();
				}
				cont.focus();
				cont.ignoreChange = false;
				cont.closable = true;
			}, 0);
		},

		_skipAll: function(){
			// summary:
			//		Ignore all the same words
			// tags:
			//		private
			this._dialogContent.closable = false;
			this._skipWordAll(this._iterator);
			this._skip();
		},

		_add: function(){
			// summary:
			//		Add the unrecognized word into the dictionary
			// tags:
			//		private
			var cont = this._dialogContent;

			cont.closable = false;
			cont.isOpen = true;
			this._addWord(this._iterator, cont.get("unfoundWord"));
			this._skip();
		},

		_replace: function(){
			// summary:
			//		Replace the incorrect word with the selected one,
			//		or the one the user types in the textbox
			// tags:
			//		private
			var cont = this._dialogContent,
				iter = this._iterator,
				targetWord = cont.get("selectedWord");

			cont.closable = false;
			this._replaceWord(iter, targetWord);
			this._skip(null, true);
		},

		_replaceAll: function(){
			// summary:
			//		Replace all the words with the same text
			// tags:
			//		private
			var cont = this._dialogContent,
				list = this._spanList,
				len = list.length,
				word = list[this._iterator].innerHTML.toLowerCase(),
				targetWord = cont.get("selectedWord");

			cont.closable = false;
			for(var iter = 0; iter < len; iter++){
				// If this word is not ignored and is the same as the source word,
				// replace it.
				if(list[iter].innerHTML.toLowerCase() == word){
					this._replaceWord(iter, targetWord);
				}
			}

			this._skip(null, true);
		},

		_cancel: function(){
			// summary:
			//		Cancel this check action
			// tags:
			//		private
			this._dialogContent.closable = true;
			this._editor.focus();
		},

		_enter: function(){
			// summary:
			//		Handle the ENTER event
			// tags:
			//		private
			if(this._dialogContent.isChanged){
				this._replace();
			}else{
				this._skip();
			}
		},

		/*************************************************************************/
		/**                              Utils                                  **/
		/*************************************************************************/

		_query: function(/*String*/ html){
			// summary:
			//		Send the query text to the service. The query text is a string of words
			//		separated by space.
			// html:
			//		The html value of the editor
			// tags:
			//		private
			var service = this._service,
				cache = this._cache,
				words = this.parser.parseIntoWords(this._html2Text(html)) || [];
			var content = [];
			rias.forEach(words, function(word){
				word = word.toLowerCase();
				if(!cache[word]){
					// New word that need to be send to the server side for check
					cache[word] = [];
					cache[word].correct = true;
					content.push(word);
				}
			});
			if(content.length > 0){
				service.send(content.join(" "));
			}else if(!service.isWorking){
				this._loadData([]);
			}
		},

		_html2Text: function(html){
			// summary:
			//		Substitute the tag with white charactors so that the server
			//		can easily process the text. For example:
			// |	"<a src="sample.html">Hello, world!</a>" ==>
			// |	"                     Hello, world!    "
			// html:
			//		The html code
			// tags:
			//		private
			var text = [],
				isTag = false,
				len = html ? html.length : 0;

			for(var i = 0; i < len; i++){
				if(html.charAt(i) == "<"){ isTag = true; }
				if(isTag == true){
					text.push(" ");
				}else{
					text.push(html.charAt(i));
				}
				if(html.charAt(i) == ">"){ isTag = false; }

			}
			return text.join("");
		},

		_getBookmark: function(/*String*/ eValue){
			// summary:
			//		Get the cursor position. It is the index of the characters
			//		where the cursor is.
			// eValue:
			//		The html value of the editor
			// tags:
			//		private
			var ed = this._editor,
				cp = this._cursorSpan;
			ed.execCommand("inserthtml", cp);
			var nv = ed.get("value"),
				index = nv.indexOf(cp),
				i = -1;
			while(++i < index && eValue.charAt(i) == nv.charAt(i)){ /* do nothing */}
			return i;
		},

		_moveToBookmark: function(){
			// summary:
			//		Move to the position when the cursor was.
			// tags:
			//		private
			var ed = this._editor,
				cps = rias.dom.query("." + this._cursorSelector, ed.document),
				cursorSpan = cps && cps[0];
			// Find the cursor place holder
			if(cursorSpan){
				ed._sCall("selectElement", [cursorSpan]);
				ed._sCall("collapse", [true]);
				var parent = cursorSpan.parentNode;
				if(parent){ parent.removeChild(cursorSpan); }
			}
		},

		_submitContent: function(/*Boolean?*/ delay){
			// summary:
			//		Functions to submit the content of the editor
			// delay:
			//		Indicate if the action is taken immediately or not
			// tags:
			//		private
			if(delay){
				var self = this,
					interval = 3000;
				if(this._delayHandler){
					clearTimeout(this._delayHandler);
					this._delayHandler = null;
				}
				setTimeout(function(){ self._query(self._editor.get("value")); }, interval);
			}else{
				this._query(this._editor.get("value"));
			}
		},

		_populateDialog: function(index){
			// summary:
			//		Populate the content of the dailog
			// index:
			//		The idex of the span list
			// tags:
			//		private
			var list = this._spanList,
				cache = this._cache,
				cont = this._dialogContent;

			cont.set("disabled", false);
			if(index < list.length && list.length > 0){
				var word = list[index].innerHTML;
				cont.set("unfoundWord", word);
				cont.set("suggestionList", cache[word.toLowerCase()]);
				cont.set("inProgress", false);
			}
		},

		_markIncorrectWords: function(/*String*/ html, /*Object*/ cache){
			// summary:
			//		Mark the incorrect words and set up menus if available
			// html:
			//		The html value of the editor
			// cache:
			//		The local word cache
			// tags:
			//		private
			var self = this,
				parser = this.parser,
				editor = this._editor,
				spanString = this._incorrectWordsSpan,
				nstyle = this._normalIncorrectStyle,
				selector = this._selector,
				words = parser.parseIntoWords(this._html2Text(html).toLowerCase()),
				indices = parser.getIndices(),
				bookmark = this._cursorSpan,
				bmpos = this._getBookmark(html),
				spanOffset = "<span class='incorrectWordPlaceHolder'>".length,
				bmMarked = false,
				cArray = html.split(""),
				spanList = null;

			// Mark the incorrect words and cursor position
			for(var i = words.length - 1; i >= 0; i--){
				var word = words[i];
				if(cache[word] && !cache[word].correct){
					var offset = indices[i],
						len = words[i].length,
						end = offset + len;
					if(end <= bmpos && !bmMarked){
						cArray.splice(bmpos, 0, bookmark);
						bmMarked = true;
					}
					cArray.splice(offset, len, rias.substitute(spanString, {text: html.substring(offset, end)}));
					if(offset < bmpos && bmpos < end && !bmMarked){
						var tmp = cArray[offset].split("");
						tmp.splice(spanOffset + bmpos - offset, 0, bookmark);
						cArray[offset] = tmp.join("");
						bmMarked = true;
					}
				}
			}
			if(!bmMarked){
				cArray.splice(bmpos, 0, bookmark);
				bmMarked = true;
			}

			editor.set("value", cArray.join(""));
			editor._cursorToStart = false; // HACK! But really necessary here.

			this._moveToBookmark();

			// Get the incorrect words <span>
			spanList = this._spanList = rias.dom.query("." + this._selector, editor.document);
			spanList.forEach(function(span, i){ span.id = selector + i; });

			// Set them to the incorrect word style
			if(!this.interactive){ delete nstyle.cursor; }
			spanList.style(nstyle);

			if(this.interactive){
				// Build the context menu
				if(self._contextMenu){
					self._contextMenu.uninitialize();
					self._contextMenu = null;
				}
				self._contextMenu = new Menu({
					targetNodeIds: [editor.iframe],

					bindDomNode: function(/*String|DomNode*/ node){
						// summary:
						//		Attach menu to given node
						node = rias.dom.byId(node);

						var cn;	// Connect node

						// Support context menus on iframes.   Rather than binding to the iframe itself we need
						// to bind to the <body> node inside the iframe.
						var iframe, win;
						if(node.tagName.toLowerCase() == "iframe"){
							iframe = node;
							win = this._iframeContentWindow(iframe);
							cn = rias.dom.body(editor.document)
						}else{

							// To capture these events at the top level, attach to <html>, not <body>.
							// Otherwise right-click context menu just doesn't work.
							cn = (node == rias.dom.body() ? rias.dom.doc.documentElement : node);
						}


						// "binding" is the object to track our connection to the node (ie, the parameter to bindDomNode())
						var binding = {
							node: node,
							iframe: iframe
						};

						// Save info about binding in _bindings[], and make node itself record index(+1) into
						// _bindings[] array.   Prefix w/_riaswMenu to avoid setting an attribute that may
						// start with a number, which fails on FF/safari.
						rias.dom.setAttr(node, "_riaswMenu" + this.id, this._bindings.push(binding));

						// Setup the connections to monitor click etc., unless we are connecting to an iframe which hasn't finished
						// loading yet, in which case we need to wait for the onload event first, and then connect
						// On linux Shift-F10 produces the oncontextmenu event, but on Windows it doesn't, so
						// we need to monitor keyboard events in addition to the oncontextmenu event.
						var doConnects = rias.hitch(this, function(cn){
							return [
								// TODO: when leftClickToOpen is true then shouldn't space/enter key trigger the menu,
								// rather than shift-F10?
								this.on(cn, this.leftClickToOpen ? "onclick" : "oncontextmenu", function(evt){
									var target = evt.target,
										strings = self._strings;
									// Schedule context menu to be opened unless it's already been scheduled from onkeydown handler
									if(rias.dom.hasClass(target, selector) && !target.edited){ // Click on the incorrect word
										rias.stopEvent(evt);

										// Build the on-demand menu items
										var maxNumber = self._maxItemNumber,
											id = target.id,
											index = id.substring(selector.length),
											suggestions = cache[target.innerHTML.toLowerCase()],
											slen = suggestions.length;

										// Add the suggested words menu items
										this.destroyDescendants();
										if(slen == 0){
											this.addChild(new MenuItem({
												label: strings["iMsg"],
												disabled: true
											}));
										}else{
											for(var i = 0 ; i < maxNumber && i < slen; i++){
												this.addChild(new MenuItem({
													label: suggestions[i],
													onClick: (function(){
														var idx = index, txt = suggestions[i];
														return function(){
															self._replaceWord(idx, txt);
															editor.focus();
														};
													})()
												}));
											}
										}

										//Add the other action menu items
										this.addChild(new MenuSeparator());
										this.addChild(new MenuItem({
											label: strings["iSkip"],
											onClick: function(){
												self._skipWord(index);
												editor.focus();
											}
										}));
										this.addChild(new MenuItem({
											label: strings["iSkipAll"],
											onClick: function(){
												self._skipWordAll(index);
												editor.focus();
											}
										}));
										this.addChild(new MenuSeparator());
										this.addChild(new MenuItem({
											label: strings["toDic"],
											onClick: function(){
												self._addWord(index);
												editor.focus();
											}
										}));

										this._scheduleOpen(target, iframe, {x: evt.pageX, y: evt.pageY});
									}
								}),
								this.on(cn, "onkeydown", function(evt){
									if(evt.shiftKey && evt.keyCode == rias.keys.F10){
										rias.stopEvent(evt);
										this._scheduleOpen(evt.target, iframe);	// no coords - open near target node
									}
								})
							];
						});
						binding.connects = cn ? doConnects(cn) : [];

						if(iframe){
							// Setup handler to [re]bind to the iframe when the contents are initially loaded,
							// and every time the contents change.
							// Need to do this b/c we are actually binding to the iframe's <body> node.
							// Note: can't use dojo.connect(), see #9609.

							binding.onloadHandler = rias.hitch(this, function(){
								// want to remove old connections, but IE throws exceptions when trying to
								// access the <body> node because it's already gone, or at least in a state of limbo

								var win = this._iframeContentWindow(iframe),
									cn = rias.dom.body(editor.document);
								binding.connects = doConnects(cn);
							});
							if(iframe.addEventListener){
								iframe.addEventListener("load", binding.onloadHandler, false);
							}else{
								iframe.attachEvent("onload", binding.onloadHandler);
							}
						}
					}
				});
			}
		},

		_selectWord: function(index){
			// summary:
			//		Select the incorrect word. Move to it and highlight it
			// index:
			//		The index of the span list
			// tags:
			//		private
			var ed = this._editor,
				list = this._spanList;

			if(index < list.length && list.length > 0){
				ed._sCall("selectElement", [list[index]]);
				ed._sCall("collapse", [true]);
				this._findText(list[index].innerHTML, false, false);
				if(rias.has("ie")){
					// Because the selection in the iframe will be lost when the outer window get the
					// focus, we need to mimic the highlight ourselves.
					rias.dom.setStyle(list[index], this._highlightedIncorrectStyle);
				}
			}
		},

		_replaceWord: function(index, text){
			// summary:
			//		Replace the word at the given index with the text
			// index:
			//		The index of the span list
			// text:
			//		The text to be replaced with
			// tags:
			//		private
			var list = this._spanList;

			list[index].innerHTML = text;
			rias.dom.setStyle(list[index], this._ignoredIncorrectStyle);
			list[index].edited = true;
		},

		_skipWord: function(index){
			// summary:
			//		Skip the word at the index
			// index:
			//		The index of the span list
			// tags:
			//		private
			var list = this._spanList;

			rias.dom.setStyle(list[index], this._ignoredIncorrectStyle);
			this._cache[list[index].innerHTML.toLowerCase()].correct = true;
			list[index].edited = true;
		},

		_skipWordAll: function(index, /*String?*/word){
			// summary:
			//		Skip the all the word that have the same text as the word at the index
			//		or the given word
			// index:
			//		The index of the span list
			// word:
			//		If this argument is given, skip all the words that have the same text
			//		as the word
			// tags:
			//		private
			var list = this._spanList,
				len = list.length;
			word = word || list[index].innerHTML.toLowerCase();

			for(var i = 0; i < len; i++){
				if(!list[i].edited && list[i].innerHTML.toLowerCase() == word){
					this._skipWord(i);
				}
			}
		},

		_addWord: function(index, /*String?*/word){
			// summary:
			//		Add the word at the index to the dictionary
			// index:
			//		The index of the span list
			// word:
			//		If this argument is given, add the word to the dictionary and
			//		skip all the words like it
			// tags:
			//		private
			var service = this._service;
			service.send(word || this._spanList[index].innerHTML.toLowerCase(), service.ACTION_UPDATE);
			this._skipWordAll(index, word);
		},

		_findText: function(/*String*/ txt, /*Boolean*/ caseSensitive, /*Boolean*/ backwards){
			// summary:
			//		This function invokes a find with specific options
			// txt: String
			//		The text to locate in the document.
			// caseSensitive: Boolean
			//		Whether or ot to search case-sensitively.
			// backwards: Boolean
			//		Whether or not to search backwards in the document.
			// tags:
			//		private.
			// returns:
			//		Boolean indicating if the content was found or not.
			var ed = this._editor,
				win = ed.window,
				found = false;
			if(txt){
				if(win.find){
					found = win.find(txt, caseSensitive, backwards, false, false, false, false);
				}else{
					var doc = ed.document;
					if(doc.selection){
						/* IE */
						// Focus to restore position/selection,
						// then shift to search from current position.
						this._editor.focus();
						var txtRg = doc.body.createTextRange();
						var curPos = doc.selection?doc.selection.createRange():null;
						if(curPos){
							if(backwards){
								txtRg.setEndPoint("EndToStart", curPos);
							}else{
								txtRg.setEndPoint("StartToEnd", curPos);
							}
						}
						var flags = caseSensitive?4:0;
						if(backwards){
							flags = flags | 1;
						}
						//flags = flags |
						found = txtRg.findText(txt,txtRg.text.length,flags);
						if(found){
							txtRg.select();
						}
					}
				}
			}
			return found;
		},

		_spellCheckFilter: function(/*String*/ value){
			// summary:
			//		Filter out the incorrect word style so that the value of the edtior
			//		won't include the spans that wrap around the incorrect words
			// value:
			//		The html value of the editor
			// tags:
			//		private
			var regText = /<span class=["']incorrectWordPlaceHolder["'].*?>(.*?)<\/span>/g;
			return value.replace(regText, "$1");
		}
	});

// For monkey patching
	SpellCheck._SpellCheckControl = SpellCheckControl;
	SpellCheck._SpellCheckScriptMultiPart = SpellCheckScriptMultiPart;

// Register this plugin.
	_Plugin.registry["spellCheck"] = _Plugin.registry["spellcheck"] = function(args){
		return new SpellCheck(rias.mixin({
			exArgs: args
		}, args));
	};

	return SpellCheck;

});
