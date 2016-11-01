define([
	"rias",
	"../_Plugin",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"rias/riasw/form/Button",
	"rias/riasw/form/ToggleButton",
	"rias/riasw/form/CheckButton",
	"rias/riasw/form/TextBox",
	"rias/riasw/widget/Toolbar",
	"rias/riasw/widget/ToolbarLineBreak",
	"dojo/i18n!./nls/FindReplace"
], function(rias, _Plugin, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Button, ToggleButton, CheckButton, TextBox, Toolbar, ToolbarLineBreak) {

	//rias.experimental("dojox.editor.plugins.FindReplace");
	var pluginsName = "rias.riasw.editor.htmleditor.plugins",
		has = rias.has;

	/*var FindReplaceCloseBox = rias.declare(pluginsName + "._FindReplaceCloseBox", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
			// summary:
			//		Base class for widgets that contains a button labeled X
			//		to close the tool bar.

			btnId: "",
			widget: null,
			widgetsInTemplate: true,

			templateString:
				"<span style='float: right' class='dijitInline' tabindex='-1'>" +
					"<button class='dijit dijitReset dijitInline' id='${btnId}' dojoAttachPoint='button' dojoType='rias.riasw.form.Button' tabindex='-1' iconClass='dijitEditorIconsFindReplaceClose' showLabel='false'>X</button>" +
				"</span>",

			postMixInProperties: function(){
				// Set some substitution variables used in the template
				this.id = rias.getUniqueId(this.declaredClass.replace(/\./g,"_"));
				this.btnId = this.id + "_close";
				this.inherited(arguments);
			},
			startup: function(){
				this.connect(this.button, "onClick", "onClick");
			},
			onClick: function(){
			}
		});*/


	/*var FindReplaceTextBox = rias.declare(pluginsName + "._FindReplaceTextBox", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
			// summary:
			//		Base class for widgets that contains a label (like "Font:")
			//		and a TextBox to pick a value.
			//		Used as Toolbar entry.

			// textId: [public] String
			//		The id of the enhanced textbox
			textId: "",

			// label: [public] String
			//		The label of the enhanced textbox
			label: "",

			// tooltip: [public] String
			//		The tooltip of the enhanced textbox when the mouse is hovering on it
			toolTip: "",
			widget: null,
			widgetsInTemplate: true,

			templateString:
				"<span style='white-space: nowrap' class='dijit dijitReset dijitInline dijitEditorFindReplaceTextBox' title='${tooltip}' tabindex='-1'>" +
					"<label class='dijitLeft dijitInline' for='${textId}' tabindex='-1'>${label}</label>" +
					"<input dojoType='rias.riasw.form.TextBox' intermediateChanges='true' class='focusTextBox' tabIndex='0' id='${textId}' dojoAttachPoint='textBox, focusNode' value='' dojoAttachEvent='onKeyPress: _onKeyPress'/>" +
				"</span>",

			postMixInProperties: function(){
				// Set some substitution variables used in the template
				this.id = rias.getUniqueId(this.declaredClass.replace(/\./g,"_"));
				this.textId = this.id + "_text";

				this.inherited(arguments);
			},

			postCreate: function(){
				this.textBox.set("value", "");
				this.disabled =  this.textBox.get("disabled");
				this.connect(this.textBox, "onChange", "onChange");
				rias.dom.setAttr(this.textBox.textbox, "formnovalidate", "true");
			},

			_setValueAttr: function(value){
				//If the value is not a permitted value, just set empty string to prevent showing the warning icon
				this.value = value;
				this.textBox.set("value", value);
			},

			focus: function(){
				this.textBox.focus();
			},

			_setDisabledAttr: function(value){
				// summary:
				//		Over-ride for the textbox's 'disabled' attribute so that it can be
				//		disabled programmatically.
				// value:
				//		The boolean value to indicate if the textbox should be disabled or not
				// tags:
				//		private
				this.disabled = value;
				this.textBox.set("disabled", value);
			},

			onChange: function(val){
				// summary:
				//		Stub function for change events on the box.
				// tags:
				//		public
				this.value= val;
			},

			_onKeyPress: function(evt){
				// summary:
				//		Handle the arrow key events
				// evt:
				//		Event object passed to this handler
				// tags:
				//		private
				var start = 0;
				var end = 0;

				// If CTRL, ALT or SHIFT is not held on
				if(evt.target && !evt.ctrlKey && !evt.altKey && !evt.shiftKey){
					if(evt.keyCode == rias.keys.LEFT_ARROW){
						start = evt.target.selectionStart;
						end = evt.target.selectionEnd;
						if(start < end){
							rias.dom.selectInputText(evt.target, start, start);
							rias.event.stopEvent(evt);
						}
					}else if(evt.keyCode == rias.keys.RIGHT_ARROW){
						start = evt.target.selectionStart;
						end = evt.target.selectionEnd;
						if(start < end){
							rias.dom.selectInputText(evt.target, end, end);
							rias.event.stopEvent(evt);
						}
					}
				}
			}
		});*/


	/*var FindReplaceCheckBox = rias.declare(pluginsName + "._FindReplaceCheckBox", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin],{
			// summary:
			//		Base class for widgets that contains a label (like "Match case: ")
			//		and a checkbox to indicate if it is checked or not.
			//		Used as Toolbar entry.

			// checkId: [public] String
			//		The id of the enhanced checkbox
			checkId: "",

			// label: [public] String
			//		The label of the enhanced checkbox
			label: "",

			// tooltip: [public] String
			//		The tooltip of the enhanced checkbox when the mouse is hovering it
			tooltip: "",

			widget: null,
			widgetsInTemplate: true,

			templateString:
				"<span style='white-space: nowrap' tabindex='-1' class='dijit dijitReset dijitInline dijitEditorFindReplaceCheckBox' title='${tooltip}' >" +
					"<input dojoType='rias.riasw.form.CheckBox' tabIndex='0' id='${checkId}' dojoAttachPoint='checkBox, focusNode' value=''/>" +
					"<label tabindex='-1' class='dijitLeft dijitInline' for='${checkId}'>${label}</label>" +
				"</span>",

			postMixInProperties: function(){
				// Set some substitution variables used in the template
				this.id = rias.getUniqueId(this.declaredClass.replace(/\./g,"_"));
				this.checkId = this.id + "_check";
				this.inherited(arguments);
			},

			postCreate: function(){
				this.checkBox.set("checked", false);
				this.disabled =  this.checkBox.get("disabled");
				this.checkBox.isFocusable = function(){ return false; };
			},

			_setValueAttr: function(value){
				// summary:
				//		Passthrough for checkbox.
				// tags:
				//		private
				this.checkBox.set('value', value);
			},

			_getValueAttr: function(){
				// summary:
				//		Passthrough for checkbox.
				// tags:
				//		private
				return this.checkBox.get('value');
			},

			focus: function(){
				// summary:
				//		Handle the focus event when this widget gets focused
				// tags:
				//		private
				this.checkBox.focus();
			},

			_setDisabledAttr: function( value){
				// summary:
				//		Over-ride for the button's 'disabled' attribute so that it can be
				//		disabled programmatically.
				// value:
				//		The flag that indicates if the checkbox is disabled or not.
				// tags:
				//		private
				this.disabled = value;
				this.checkBox.set("disabled", value);
			}
		});*/


	var FindReplaceToolbar = rias.declare(pluginsName + "._FindReplaceToolbar", Toolbar, {
		// summary:
		//		A toolbar that derived from dijit.Toolbar, which
		//		eliminates some unnecessary event response such as LEFT_ARROW pressing
		//		and click bubbling.

		postCreate: function(){
			this.connectKeyNavHandlers([], []); // Prevent arrow key navigation
			this.connect(this.containerNode, "onclick", "_onToolbarEvent");
			this.connect(this.containerNode, "onkeydown", "_onToolbarEvent");
			rias.dom.addClass(this.domNode, "dijitToolbar");
		},

		/*addChild: function(widget, insertIndex){
			// summary:
			//		Add a child to our _Container and prevent the default
			//		arrow key navigation function. This function may bring in
			//		side effect
			dijit._KeyNavContainer.superclass.addChild.apply(this, arguments);
		},*/

		_onToolbarEvent: function(/*Event*/ evt){
			// Editor may have special treatment to some events, so stop the bubbling.
			// evt:
			//		The Event object
			// tages:
			//		private
			evt.stopPropagation();
		}
	});

	var FindReplace = rias.declare(pluginsName + ".FindReplace", [_Plugin], {
		// summary:
		//		This plugin provides a Find/Replace capability for the editor.
		//		Note that this plugin is NOT supported on Opera currently, as opera
		//		does not implement a window.find or equiv function.

		// iconClassPrefix: [const] String
		//		The CSS class name for the button node is formed from `iconClassPrefix` and `command`
		iconClassPrefix: "dijitEditorIconsFindReplace",

		// editor: [protected]
		//		The editor this plugin belongs to
		editor: null,

		// button: [protected]
		//		The toggle button
		button: null,

		// _frToolbar: [private]
		//		The toolbar that contain all the entries and buttons
		_frToolbar: null,

		// _closeBox: [private]
		//		The close button of the F/R toolbar
		_closeBox: null,

		// _findField: [private]
		//		The Find field of the F/R toolbar
		_findField: null,

		// _replaceField: [private]
		//		The Replace field of the F/R toolbar
		_replaceField: null,

		// _findButton: [private]
		//		The Find button of the F/R toolbar
		_findButton: null,

		// _replaceButton: [private]
		//		The Replace button of the F/R toolbar
		_replaceButton: null,

		// _replaceAllButton: [private]
		//		The ReplaceAll button of the F/R toolbar
		_replaceAllButton: null,

		// _caseSensitive: [private]
		//		The case sensitive checkbox
		_caseSensitive: null,

		// _backwards: [private]
		//		The backwards checkbox
		_backwards: null,

		// _strings: [private]
		//		The array that contains globalized strings
		_strings: null,

		_bookmark: null,

		_initButton: function(){
			// summary:
			//		Over-ride for creation of the resize button.
			this._strings = rias.i18n.getLocalization(pluginsName, "FindReplace");
			this.button = new ToggleButton({
				ownerRiasw: this,
				label: this._strings["findReplace"],
				tooltip: this._strings["findReplace"],
				showLabel: false,
				iconClass: this.iconClassPrefix + " dijitEditorIconFindString",
				tabIndex: "-1",
				onChange: rias.hitch(this, "_toggleFindReplace")
			});
			if(has("opera")){
				// Not currently supported on Opera!
				this.button.set("disabled", true);
			}
			//Link up so that if the toggle is disabled, then the view of Find/Replace is closed.
			this.connect(this.button, "set", rias.hitch(this, function(attr, val){
				if(attr === "disabled"){
					this._toggleFindReplace((!val && this._displayed), true, true);
				}
			}));
		},

		setEditor: function(editor){
			// summary:
			//		This is a callback handler that set a reference to the editor this plugin
			//		hosts in
			this.editor = editor;
			this._initButton();
		},

		toggle: function(){
			// summary:
			//		Function to allow programmatic toggling of the find toolbar.
			// tags:
			//		public
			this.button.set("checked", !this.button.get("checked"));
		},

		_toggleFindReplace: function(/*Boolean*/ show, /*Boolean?*/ ignoreState, /*Boolean?*/ buttonDisabled){
			// summary:
			//		Function to toggle whether or not find/replace is displayed.
			// show:
			//		Indicate if the toolbar is shown or not
			// ignoreState:
			//		Indicate if the status should be ignored or not
			// blurEditor:
			//		Indicate if the focus should be removed from the editor or not
			// tags:
			//		private
			var size = rias.dom.getMarginBox(this.editor.domNode);
			if(show && !has("opera")){
				rias.dom.setStyle(this._frToolbar.domNode, "display", "block");
				// Auto populate the Find field
				this._populateFindField();
				if(!ignoreState){
					this._displayed = true;
				}
			}else{
				rias.dom.setStyle(this._frToolbar.domNode, "display", "none");
				if(!ignoreState){
					this._displayed = false;
				}

				// If the toggle button is disabled, it is most likely that
				// another plugin such as ViewSource disables it.
				// So we do not need to focus the text area of the editor to
				// prevent the editor from an invalid status.
				// Please refer to dijit._editor.plugins.ViewSource for more details.
				if(!buttonDisabled){
					this.editor.focus();
				}
			}

			// Resize the editor.
			this.editor.resize({
				h: size.h
			});
		},

		_populateFindField: function(){
			// summary:
			//		Populate the Find field with selected text when dialog initially displayed.
			//		Auto-select text in Find field after it is populated.
			//		If nothing selected, restore previous entry from the same session.
			// tags:
			//		private
			var ed = this.editor;
			var win = ed.window;
			var selectedTxt = ed._sCall("getSelectedText", [null]);
			if(this._findField && this._findField.textBox){
				if(selectedTxt){
					this._findField.textBox.set("value", selectedTxt);
				}
				this._findField.textBox.focus();
				rias.dom.selectInputText(this._findField.textBox.focusNode);
			}
		},

		setToolbar: function(/*dijit.Toolbar*/ toolbar){
			// summary:
			//		Over-ride so that find/replace toolbar is appended after the current toolbar.
			// toolbar:
			//		The current toolbar of the editor
			// tags:
			//		public
			var self = this;
			this.inherited(arguments);
			if(!has("opera")){
				var tb = (this._frToolbar = new FindReplaceToolbar({
					ownerRiasw: this
				}));
				rias.dom.setStyle(tb.domNode, "display", "none");
				//rias.dom.place(tb.domNode, toolbar.domNode, "after");
				//tb.startup();
				toolbar.addChild(tb);

				// IE6 will put the close box in a new line when its style is "float: right".
				// So place the close box ahead of the other fields, which makes it align with
				// the other components.
				//this._closeBox = new FindReplaceCloseBox({
				//	ownerRiasw: this
				//});
				//tb.addChild(this._closeBox);

				// Define the search/replace fields.
				/*this._findField = new FindReplaceTextBox({
					ownerRiasw: this,
					label: this._strings["findLabel"],
					tooltip: this._strings["findTooltip"]
				});*/
				this._findField = new TextBox({
					ownerRiasw: this,
					showLabel: true,
					label: this._strings["findLabel"],
					tooltip: this._strings["findTooltip"],
					intermediateChanges: true,
					style: {
						width: "12em"
					},
					onChange: function(evt){
						self._checkButtons();
					},
					onKeyDown: function(evt){
						self._onFindKeyDown(evt);
					}
				});
				tb.addChild(this._findField);

				this._replaceField = new TextBox({
					ownerRiasw: this,
					showLabel: true,
					label: this._strings["replaceLabel"],
					tooltip: this._strings["replaceTooltip"],
					intermediateChanges: true,
					style: {
						width: "12em"
					},
					onKeyDown: function(evt){
						self._onReplaceKeyDown(evt);
					}
				});
				tb.addChild(this._replaceField);

				// Define the Find/Replace/ReplaceAll buttons.
				//tb.addChild(new ToolbarLineBreak({
				//	ownerRiasw: this
				//}));

				this._findButton = new Button({
					ownerRiasw: this,
					label: this._strings["findButton"],
					showLabel: true,
					tooltip: this._strings["findButtonTooltip"],
					iconClass: this.iconClassPrefix + " dijitEditorIconFind",
					disabled: true,
					onClick: function(evt){
						self._find(true);
					}
				});
				tb.addChild(this._findButton);

				this._replaceButton = new Button({
					ownerRiasw: this,
					label: this._strings["replaceButton"],
					showLabel: true,
					tooltip: this._strings["replaceButtonTooltip"],
					iconClass: this.iconClassPrefix + " dijitEditorIconReplace",
					disabled: true,
					onClick: function(evt){
						self._replace(true);
					}
				});
				tb.addChild(this._replaceButton);

				this._replaceAllButton = new Button({
					ownerRiasw: this,
					label: this._strings["replaceAllButton"],
					showLabel: true,
					tooltip: this._strings["replaceAllButtonTooltip"],
					iconClass: this.iconClassPrefix + " dijitEditorIconReplaceAll",
					disabled: true,
					onClick: function(evt){
						self._replaceAll(true);
					}
				});
				tb.addChild(this._replaceAllButton);

				// Define the option checkboxes.
				/*this._caseSensitive = new FindReplaceCheckBox({
					ownerRiasw: this,
					label: this._strings["matchCase"],
					tooltip: this._strings["matchCaseTooltip"]
				});*/
				this._caseSensitive = new CheckButton({
					ownerRiasw: this,
					showLabel: true,
					label: this._strings["matchCase"],
					tooltip: this._strings["matchCaseTooltip"]
				});
				tb.addChild(this._caseSensitive);

				this._backwards = new CheckButton({
					ownerRiasw: this,
					showLabel: true,
					label: this._strings["backwards"],
					tooltip: this._strings["backwardsTooltip"]
				});
				tb.addChild(this._backwards);

				// Set initial states, buttons should be disabled unless content is
				// present in the fields.
				//this._findButton.set("disabled", true);
				//this._replaceButton.set("disabled", true);
				//this._replaceAllButton.set("disabled", true);

				// Connect the event to the status of the items
				//this.connect(this._findField, "onChange", "_checkButtons");
				//this.connect(this._findField, "onKeyDown", "_onFindKeyDown");
				//this.connect(this._replaceField, "onKeyDown", "_onReplaceKeyDown");

				// Connect up the actual search events.
				//this.connect(this._findButton, "onClick", "_find");
				//this.connect(this._replaceButton, "onClick", "_replace");
				//this.connect(this._replaceAllButton, "onClick", "_replaceAll");

				// Connect up the close event
				//this.connect(this._closeBox, "onClick", "toggle");

			}
		},

		_checkButtons: function(){
			// summary:
			//		Ensure that all the buttons are in a correct status
			//		when certain events are fired.
			var fText = this._findField.get("value");

			if(fText){
				// Only enable if find text is not empty or just blank/spaces.
				this._findButton.set("disabled", false);
				this._replaceButton.set("disabled", false);
				this._replaceAllButton.set("disabled", false);
			}else{
				this._findButton.set("disabled", true);
				this._replaceButton.set("disabled", true);
				this._replaceAllButton.set("disabled", true);
			}
		},

		_onFindKeyDown: function(evt){
			if(evt.keyCode == rias.keys.ENTER){
				// Perform the default search action
				this._find();
				rias.event.stopEvent(evt);
			}
		},

		_onReplaceKeyDown: function(evt){
			if(evt.keyCode == rias.keys.ENTER){
				// Perform the default replace action
				if(!this._replace()) this._replace();
				rias.event.stopEvent(evt);
			}
		},

		_find: function(/*Boolean?*/ showMessage){
			// summary:
			//		This function invokes a find on the editor document with the noted options for
			//		find.
			// showMessage:
			//		Indicated whether the tooltip is shown or not when the search reaches the end
			// tags:
			//		private.
			// returns:
			//		Boolean indicating if the content was found or not.
			var txt = this._findField.get("value") || "";
			if(txt){
				var caseSensitive = this._caseSensitive.get("value");
				var backwards = this._backwards.get("value");
				var isFound = this._findText(txt, caseSensitive, backwards);
				if(!isFound && showMessage){
					rias.message({
						dialogType: "tip",
						around: this._findButton,
						content: rias.substitute(this._strings["eofDialogText"], {
							"0": this._strings["eofDialogTextFind"]
						}),
						//caption: "",
						showCaption: false,
						closeDelay: 2000
					});
				}
				return isFound;
			}

			return false;
		},

		_replace: function(/*Boolean?*/ showMessage){
			// summary:
			//		This function invokes a replace on the editor document with the noted options for replace
			// showMessage:
			//		Indicate if the prompt message is shown or not when the replacement
			//		reaches the end
			// tags:
			//		private
			// returns:
			//		Boolean indicating if the content was replaced or not.
			var isReplaced = false;
			var ed = this.editor;
			ed.focus();
			var txt = this._findField.get("value") || "";
			var repTxt = this._replaceField.get("value") || "";

			if(txt){
				var caseSensitive = this._caseSensitive.get("value");
				// Check if it is forced to be forwards or backwards
				var backwards = this._backwards.get("value");

				//Replace the current selected text if it matches the pattern
				var selected = ed._sCall("getSelectedText", [null]);
				// Handle checking/replacing current selection.  For some reason on Moz
				// leading whitespace is trimmed, so we have to trim it down on this check
				// or we don't always replace.  Moz bug!
				if(has("mozilla")){
					txt = rias.trim(txt);
					selected = rias.trim(selected);
				}

				var regExp = this._filterRegexp(txt, !caseSensitive);
				if(selected && regExp.test(selected)){
					ed.execCommand("inserthtml", repTxt);
					isReplaced = true;

					if(backwards){
						// Move to the beginning of the replaced text
						// to avoid the infinite recursive replace
						this._findText(repTxt, caseSensitive, backwards);
						ed._sCall("collapse", [true]);
					}
				}

				if(!this._find(false) && showMessage){	// Find the next
					rias.message({
						dialogType: "tip",
						around: this._replaceButton,
						content: rias.substitute(this._strings["eofDialogText"], {
							"0": this._strings["eofDialogTextReplace"]
						}),
						//caption: "",
						showCaption: false,
						closeDelay: 2000
					});
				}
				return isReplaced;
			}
			return null;
		},

		_replaceAll: function(/*Boolean?*/ showMessage){
			// summary:
			//		This function replaces all the matched content on the editor document
			//		with the noted options for replace
			// showMessage:
			//		Indicate if the prompt message is shown or not when the action is done.
			// tags:
			//		private
			var replaced = 0;
			var backwards = this._backwards.get("value");

			if(backwards){
				this.editor.placeCursorAtEnd();
			}else{
				this.editor.placeCursorAtStart();
			}

			// The _replace will return false if the current selection deos not match
			// the searched text. So try the first attempt so that the selection
			// is always the searched text if there is one that matches
			if(this._replace(false)) { replaced++; }
			// Do the replace via timeouts to avoid locking the browser up for a lot of replaces.
			var loopBody = rias.hitch(this, function(){
				if(this._replace(false)){
					replaced++;
					setTimeout(loopBody, 10);
				}else{
					if(showMessage){
						rias.message({
							dialogType: "tip",
							around: this._replaceAllButton,
							content: rias.substitute(this._strings["replaceDialogText"], {
								"0": "" + replaced
							}),
							//caption: "",
							showCaption: false,
							closeDelay: 2000
						});
					}
				}
			});
			loopBody();
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
			var ed = this.editor;
			var win = ed.window;
			var found = false;
			if(txt){
				if(win.find){
					found = win.find(txt, caseSensitive, backwards, false, false, false, false);
				}else{
					var doc = ed.document;
					if(doc.selection || win.getSelection){
						/* IE */
						// Focus to restore position/selection,
						// then shift to search from current position.
						this.editor.focus();
						var txtRg = doc.body.createTextRange();
						var txtRg2 = txtRg.duplicate();
						var sel1 = win.getSelection();
						var sRange = sel1.getRangeAt(0);
						var curPos = doc.selection?doc.selection.createRange():null;
						if(curPos){
							if(backwards){
								txtRg.setEndPoint("EndToStart", curPos);
							}else{
								txtRg.setEndPoint("StartToEnd", curPos);
							}
						}else if(this._bookmark){
							var currentText = win.getSelection().toString();
							txtRg.moveToBookmark(this._bookmark);
							//if selection is different to previous bookmark, need to search from that position
							if ( txtRg.text != currentText ) {
								txtRg = txtRg2.duplicate();
								this._bookmark = null;
							}else if(backwards){
								txtRg2.setEndPoint("EndToStart", txtRg);
								txtRg = txtRg2.duplicate();
							}else{
								txtRg2.setEndPoint("StartToEnd", txtRg);
								txtRg = txtRg2.duplicate();
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
							this._bookmark = txtRg.getBookmark();
						}
					}
				}
			}
			return found;
		},

		_filterRegexp: function(/*String*/ pattern, /*Boolean*/ ignoreCase){
			// summary:
			//		Helper function to convert a simple pattern to a regular expression for matching.
			// description:
			//		Returns a regular expression object that conforms to the defined conversion rules.
			//		For example:
			//
			//		- ca*   -> /^ca.*$/
			//		- *ca*  -> /^.*ca.*$/
			//		- *c\*a*  -> /^.*c\*a.*$/
			//		- *c\*a?*  -> /^.*c\*a..*$/
			//
			//		and so on.
			// pattern: string
			//		A simple matching pattern to convert that follows basic rules:
			//
			//		- * Means match anything, so ca* means match anything starting with ca
			//		- ? Means match single character.  So, b?b will match to bob and bab, and so on.
			//		- \ is an escape character.  So for example, \* means do not treat * as a match, but literal character *.
			//		  To use a \ as a character in the string, it must be escaped.  So in the pattern it should be
			//		  represented by \\ to be treated as an ordinary \ character instead of an escape.
			// ignoreCase:
			//		An optional flag to indicate if the pattern matching should be treated as case-sensitive or not when comparing
			//		By default, it is assumed case sensitive.
			// tags:
			//		private

			var rxp = "";
			var c = null;
			for(var i = 0; i < pattern.length; i++){
				c = pattern.charAt(i);
				switch(c){
					case '\\':
						rxp += c;
						i++;
						rxp += pattern.charAt(i);
						break;
					case '$':
					case '^':
					case '/':
					case '+':
					case '.':
					case '|':
					case '(':
					case ')':
					case '{':
					case '}':
					case '[':
					case ']':
						rxp += "\\"; //fallthrough
					default:
						rxp += c;
				}
			}
			rxp = "^" + rxp + "$";
			if(ignoreCase){
				return new RegExp(rxp,"mi"); //RegExp
			}else{
				return new RegExp(rxp,"m"); //RegExp
			}

		},

		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},

		destroy: function(){
			// summary:
			//		Cleanup of our custom toolbar.
			this.inherited(arguments);
			if(this._frToolbar){
				this._frToolbar.destroyRecursive();
				this._frToolbar = null;
			}
		}
	});

	// For monkey patching
	//FindReplace._FindReplaceCloseBox = FindReplaceCloseBox;
	//FindReplace._FindReplaceTextBox = FindReplaceTextBox;
	//FindReplace._FindReplaceCheckBox = FindReplaceCheckBox;
	FindReplace._FindReplaceToolbar = FindReplaceToolbar;

	// Register this plugin.
	_Plugin.registry["findReplace"] = _Plugin.registry["findreplace"] = function(args){
		return new FindReplace(args);
	};

	return FindReplace;

});
