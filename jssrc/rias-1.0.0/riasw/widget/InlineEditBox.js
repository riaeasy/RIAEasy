define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"rias/riasw/form/Button",
	"dijit/form/_TextBoxMixin",
	"rias/riasw/form/TextBox"
], function(rias, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Button, _TextBoxMixin, TextBox){

	// module:
	//		rias/riasw/widget/InlineEditBox

	var InlineEditor = rias.declare("rias.riasw.widget._InlineEditor", [_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
		// summary:
		//		Internal widget used by InlineEditBox, displayed when in editing mode
		//		to display the editor and maybe save/cancel buttons.  Calling code should
		//		connect to save/cancel methods to detect when editing is finished
		//
		//		Has mainly the same parameters as InlineEditBox, plus these values:
		//
		// style: Object
		//		Set of CSS attributes of display node, to replicate in editor
		//
		// value: String
		//		Value as an HTML string or plain text string, depending on renderAsHTML flag

		templateString:
			'<span data-dojo-attach-point="editNode" role="presentation" class="dijitReset dijitInline dijitOffScreen">' +
				'<span data-dojo-attach-point="editorPlaceholder"></span>' +
				'<span data-dojo-attach-point="buttonContainer">' +
					'<button data-dojo-type="rias/riasw/form/Button" data-dojo-props="label:\'${buttonSave}\',\'class\':\'saveButton\'" data-dojo-attach-point="saveButton" data-dojo-attach-event="onClick:save"></button>' +
					'<button data-dojo-type="rias/riasw/form/Button" data-dojo-props="label:\'${buttonCancel}\',\'class\':\'cancelButton\'" data-dojo-attach-point="cancelButton" data-dojo-attach-event="onClick:cancel"></button>' +
				'</span>' +
			'</span>',

		contextRequire: rias.require,

		postMixInProperties: function(){
			this.inherited(arguments);
			if(!this.buttonSave){
				this.buttonSave = rias.i18n.action.save;
			}
			if(!this.buttonCancel){
				this.buttonCancel = rias.i18n.action.cancel;
			}
		},

		buildRendering: function(){
			this.inherited(arguments);

			// Create edit widget in place in the template
			// TODO: remove getObject() for 2.0
			var Cls = typeof this.editor == "string" ? (rias.getObject(this.editor) || rias.require(this.editor)) : this.editor;

			// Copy the style from the source
			// Don't copy ALL properties though, just the necessary/applicable ones.
			// wrapperStyle/destStyle code is to workaround IE bug where getComputedStyle().fontSize
			// is a relative value like 200%, rather than an absolute value like 24px, and
			// the 200% can refer *either* to a setting on the node or it's ancestor (see #11175)
			var srcStyle = this.sourceStyle,
				editStyle = "line-height:" + srcStyle.lineHeight + ";",
				destStyle = rias.dom.getComputedStyle(this.domNode);
			rias.forEach(["Weight", "Family", "Size", "Style"], function(prop){
				var textStyle = srcStyle["font" + prop],
					wrapperStyle = destStyle["font" + prop];
				if(wrapperStyle != textStyle){
					editStyle += "font-" + prop + ":" + srcStyle["font" + prop] + ";";
				}
			}, this);
			rias.forEach(["marginTop", "marginBottom", "marginLeft", "marginRight", "position", "left", "top", "right", "bottom", "float", "clear", "display"], function(prop){
				this.domNode.style[prop] = srcStyle[prop];
			}, this);
			var width = this.inlineEditBox.width;
			if(width == "100%"){
				// block mode
				editStyle += "width:100%;";
				this.domNode.style.display = "block";
			}else{
				// inline-block mode
				editStyle += "width:" + (width + (Number(width) == width ? "px" : "")) + ";";
			}
			var editorParams = rias.delegate(this.inlineEditBox.editorParams, {
				style: editStyle,
				dir: this.dir,
				lang: this.lang,
				textDir: this.textDir
			});
			// set the value in onLoadDeferred instead so the widget has time to finish initializing
			//editorParams[("displayedValue" in Cls.prototype || "_setDisplayedValueAttr" in Cls.prototype) ? "displayedValue" : "value"] = this.value;
			this.editWidget = new Cls(editorParams, this.editorPlaceholder);

			if(this.inlineEditBox.autoSave){
				// Remove the save/cancel buttons since saving is done by simply tabbing away or
				// selecting a value from the drop down list
				this.saveButton.destroy();
				this.cancelButton.destroy();
				this.saveButton = this.cancelButton = null;
				rias.dom.destroy(this.buttonContainer);
			}
		},

		postCreate: function(){
			this.inherited(arguments);

			var ew = this.editWidget;

			if(this.inlineEditBox.autoSave){
				this.own(
					// Selecting a value from a drop down list causes an onChange event and then we save
					rias.after(ew, "onChange", rias.hitch(this, "_onChange"), true),

					// ESC and TAB should cancel and save.
					rias.on(ew, "keydown", rias.hitch(this, "_onKeyDown"))
				);
			}else{
				// If possible, enable/disable save button based on whether the user has changed the value
				if("intermediateChanges" in ew){
					ew.set("intermediateChanges", true);
					this.own(rias.after(ew, "onChange", rias.hitch(this, "_onIntermediateChange"), true));
					this.saveButton.set("disabled", true);
				}
			}
		},

		startup: function(){
			this.editWidget.startup();
			this.inherited(arguments);
		},

		_onIntermediateChange: function(/*===== val =====*/){
			// summary:
			//		Called for editor widgets that support the intermediateChanges=true flag as a way
			//		to detect when to enable/disabled the save button
			this.saveButton.set("disabled", (this.get("value") == this._resetValue) || !this.enableSave());
		},

		destroy: function(){
			this.editWidget.destroy(true); // let the parent wrapper widget clean up the DOM
			this.inherited(arguments);
		},

		_getValueAttr: function(){
			// summary:
			//		Return the [display] value of the edit widget
			var ew = this.editWidget;
			return String(ew.get(("displayedValue" in ew || "_getDisplayedValueAttr" in ew) ? "displayedValue" : "value"));
		},

		_onKeyDown: function(e){
			// summary:
			//		Handler for keydown in the edit box in autoSave mode.
			// description:
			//		For autoSave widgets, if Esc/Enter, call cancel/save.
			// tags:
			//		private

			if(this.inlineEditBox.autoSave && this.inlineEditBox.editing){
				if(e.altKey || e.ctrlKey){
					return;
				}
				// If Enter/Esc pressed, treat as save/cancel.
				if(e.keyCode == rias.keys.ESCAPE){
					e.stopPropagation();
					e.preventDefault();
					this.cancel(true); // sets editing=false which short-circuits _onBlur processing
				}else if(e.keyCode == rias.keys.ENTER && e.target.tagName == "INPUT"){
					e.stopPropagation();
					e.preventDefault();
					this._onChange(); // fire _onBlur and then save
				}

				// _onBlur will handle TAB automatically by allowing
				// the TAB to change focus before we mess with the DOM: #6227
				// Expounding by request:
				//	The current focus is on the edit widget input field.
				//	save() will hide and destroy this widget.
				//	We want the focus to jump from the currently hidden
				//	displayNode, but since it's hidden, it's impossible to
				//	unhide it, focus it, and then have the browser focus
				//	away from it to the next focusable element since each
				//	of these events is asynchronous and the focus-to-next-element
				//	is already queued.
				//	So we allow the browser time to unqueue the move-focus event
				//	before we do all the hide/show stuff.
			}
		},

		_onBlur: function(){
			// summary:
			//		Called when focus moves outside the editor
			// tags:
			//		private

			this.inherited(arguments);
			if(this.inlineEditBox.autoSave && this.inlineEditBox.editing){
				if(this.get("value") == this._resetValue){
					this.cancel(false);
				}else if(this.enableSave()){
					this.save(false);
				}
			}
		},

		_onChange: function(){
			// summary:
			//		Called when the underlying widget fires an onChange event,
			//		such as when the user selects a value from the drop down list of a ComboBox,
			//		which means that the user has finished entering the value and we should save.
			// tags:
			//		private

			if(this.inlineEditBox.autoSave && this.inlineEditBox.editing && this.enableSave()){
				rias.dom.focus(this.inlineEditBox.displayNode); // fires _onBlur which will save the formatted value
			}
		},

		enableSave: function(){
			// summary:
			//		User overridable function returning a Boolean to indicate
			//		if the Save button should be enabled or not - usually due to invalid conditions
			// tags:
			//		extension
			return this.editWidget.isValid ? this.editWidget.isValid() : true;
		},

		focus: function(){
			// summary:
			//		Focus the edit widget.
			// tags:
			//		protected

			this.editWidget.focus();

			if(this.editWidget.focusNode){
				// IE can take 30ms to report the focus event, but focus manager needs to know before a 0ms timeout.
				rias.dom.focusManager._onFocusNode(this.editWidget.focusNode);

				if(this.editWidget.focusNode.tagName == "INPUT"){
					this.defer(function(){
						_TextBoxMixin.selectInputText(this.editWidget.focusNode);
					});
				}
			}
		}
	});


	var InlineEditBox = rias.declare("rias.riasw.widget.InlineEditBox", _Widget, {
		// summary:
		//		An element with in-line edit capabilities
		//
		// description:
		//		Behavior for an existing node (`<p>`, `<div>`, `<span>`, etc.) so that
		//		when you click it, an editor shows up in place of the original
		//		text.  Optionally, Save and Cancel button are displayed below the edit widget.
		//		When Save is clicked, the text is pulled from the edit
		//		widget and redisplayed and the edit widget is again hidden.
		//		By default a plain Textarea widget is used as the editor (or for
		//		inline values a TextBox), but you can specify an editor such as
		//		dijit.Editor (for editing HTML) or a Slider (for adjusting a number).
		//		An edit widget must support the following API to be used:
		//
		//		- displayedValue or value as initialization parameter,
		//			and available through set('displayedValue') / set('value')
		//		- void focus()
		//		- DOM-node focusNode = node containing editable text

		// editing: [readonly] Boolean
		//		Is the node currently in edit mode?
		editing: false,

		// autoSave: [const] Boolean
		//		Changing the value automatically saves it; don't have to push save button
		//		(and save button isn't even displayed)
		autoSave: true,

		// buttonSave: String
		//		Save button label
		buttonSave: "",

		// buttonCancel: String
		//		Cancel button label
		buttonCancel: "",

		// renderAsHtml: Boolean
		//		Set this to true if the specified Editor's value should be interpreted as HTML
		//		rather than plain text (ex: `dijit.Editor`)
		renderAsHtml: false,

		// editor: String|Function
		//		MID (ex: "dijit/form/TextBox") or constructor for editor widget
		editor: TextBox,

		// editorWrapper: String|Function
		//		Class name (or reference to the Class) for widget that wraps the editor widget, displaying save/cancel
		//		buttons.
		editorWrapper: InlineEditor,

		// editorParams: Object
		//		Set of parameters for editor, like {required: true}
		editorParams: {},

		// disabled: Boolean
		//		If true, clicking the InlineEditBox to edit it will have no effect.
		disabled: false,

		onChange: function(/*===== value =====*/){
			// summary:
			//		Set this handler to be notified of changes to value.
			// tags:
			//		callback
		},

		onCancel: function(){
			// summary:
			//		Set this handler to be notified when editing is cancelled.
			// tags:
			//		callback
		},

		// width: String
		//		Width of editor.  By default it's width=100% (ie, block mode).
		width: "100%",

		// value: String
		//		The display value of the widget in read-only mode
		value: "",

		// noValueIndicator: [const] String
		//		The text that gets displayed when there is no value (so that the user has a place to click to edit)
		noValueIndicator: rias.has("ie") <= 6 ? // font-family needed on IE6 but it messes up IE8
			"<span style='font-family: wingdings; text-decoration: underline;'>&#160;&#160;&#160;&#160;&#x270d;&#160;&#160;&#160;&#160;</span>" :
			"<span style='text-decoration: underline;'>&#160;&#160;&#160;&#160;&#x270d;&#160;&#160;&#160;&#160;</span>", // &#160; == &nbsp;

		constructor: function(/*===== params, srcNodeRef =====*/){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String?
			//		If a srcNodeRef (DOM node) is specified:
			//
			//		- use srcNodeRef.innerHTML as my value
			//		- replace srcNodeRef with my generated DOM tree

			this.editorParams = {};
		},

		postMixInProperties: function(){
			this.inherited(arguments);

			// save pointer to original source node, since Widget nulls-out srcNodeRef
			this.displayNode = this.srcNodeRef;

			// connect handlers to the display node
			this.own(
				rias.on(this.displayNode, rias.a11yclick, rias.hitch(this, "_onClick")),
				rias.on(this.displayNode, "mouseover, focus", rias.hitch(this, "_onMouseOver")),
				rias.on(this.displayNode, "mouseout, blur", rias.hitch(this, "_onMouseOut"))
			);

			this.displayNode.setAttribute("role", "button");
			if(!this.displayNode.getAttribute("tabIndex")){
				this.displayNode.setAttribute("tabIndex", 0);
			}

			if(!this.value && !("value" in this.params)){ // "" is a good value if specified directly so check params){
				this.value = rias.trim(this.renderAsHtml ? this.displayNode.innerHTML :
					(this.displayNode.innerText || this.displayNode.textContent || ""));
			}
			if(!this.value){
				this.displayNode.innerHTML = this.noValueIndicator;
			}

			rias.dom.addClass(this.displayNode, 'dijitInlineEditBoxDisplayMode');
		},

		/*setDisabled: function(disabled){
			// summary:
			//		Deprecated.   Use set('disabled', ...) instead.
			// tags:
			//		deprecated
			rias.deprecated("dijit.InlineEditBox.setDisabled() is deprecated.  Use set('disabled', bool) instead.", "", "2.0");
			this.set('disabled', disabled);
		},*/

		_setDisabledAttr: function(/*Boolean*/ disabled){
			// summary:
			//		Hook to make set("disabled", ...) work.
			//		Set disabled state of widget.
			this.domNode.setAttribute("aria-disabled", disabled ? "true" : "false");
			if(disabled){
				this.displayNode.removeAttribute("tabIndex");
			}else{
				this.displayNode.setAttribute("tabIndex", 0);
			}
			rias.dom.toggleClass(this.displayNode, "dijitInlineEditBoxDisplayModeDisabled", disabled);
			this._set("disabled", disabled);
		},

		_onMouseOver: function(){
			// summary:
			//		Handler for onmouseover and onfocus event.
			// tags:
			//		private
			if(!this.disabled){
				rias.dom.addClass(this.displayNode, "dijitInlineEditBoxDisplayModeHover");
			}
		},

		_onMouseOut: function(){
			// summary:
			//		Handler for onmouseout and onblur event.
			// tags:
			//		private
			rias.dom.removeClass(this.displayNode, "dijitInlineEditBoxDisplayModeHover");
		},

		_onClick: function(/*Event*/ e){
			// summary:
			//		Handler for onclick event.
			// tags:
			//		private
			if(this.disabled){
				return;
			}
			if(e){
				e.stopPropagation();
				e.preventDefault();
			}
			this._onMouseOut();

			// Since FF gets upset if you move a node while in an event handler for that node...
			this.defer("edit");
		},

		edit: function(){
			// summary:
			//		Display the editor widget in place of the original (read only) markup.
			// tags:
			//		private

			if(this.disabled || this.editing){
				return;
			}
			this._set('editing', true);

			// save some display node values that can be restored later
			this._savedTabIndex = rias.dom.getAttr(this.displayNode, "tabIndex") || "0";

			if(!this.wrapperWidget){
				// Placeholder for edit widget
				// Put place holder (and eventually editWidget) before the display node so that it's positioned correctly
				// when Calendar dropdown appears, which happens automatically on focus.
				var placeholder = rias.dom.create("span", null, this.domNode, "before");

				// Create the editor wrapper (the thing that holds the editor widget and the save/cancel buttons)
				var Ewc = typeof this.editorWrapper == "string" ? rias.getObject(this.editorWrapper) : this.editorWrapper;
				this.wrapperWidget = new Ewc({
					value: this.value,
					buttonSave: this.buttonSave,
					buttonCancel: this.buttonCancel,
					dir: this.dir,
					lang: this.lang,
					tabIndex: this._savedTabIndex,
					editor: this.editor,
					inlineEditBox: this,
					sourceStyle: rias.dom.getComputedStyle(this.displayNode),
					save: rias.hitch(this, "save"),
					cancel: rias.hitch(this, "cancel"),
					textDir: this.textDir
				}, placeholder);
				if(!this.wrapperWidget._started){
					this.wrapperWidget.startup();
				}
				if(!this._started){
					this.startup();
				}
			}
			var ww = this.wrapperWidget;

			// to avoid screen jitter, we first create the editor with position: absolute, visibility: hidden,
			// and then when it's finished rendering, we switch from display mode to editor
			// position: absolute releases screen space allocated to the display node
			// opacity:0 is the same as visibility: hidden but is still focusable
			// visibility: hidden removes focus outline

			rias.dom.addClass(this.displayNode, "dijitOffScreen");
			rias.dom.removeClass(ww.domNode, "dijitOffScreen");
			rias.dom.setStyle(ww.domNode, { visibility: "visible" });
			rias.dom.setAttr(this.displayNode, "tabIndex", "-1"); // needed by WebKit for TAB from editor to skip displayNode

			// After edit widget has finished initializing (in particular need to wait for dijit.Editor),
			// or immediately if there is no onLoadDeferred Deferred,
			// replace the display widget with edit widget, leaving them both displayed for a brief time so that
			// focus can be shifted without incident.
			var ew = ww.editWidget;
			var self = this;
			rias.when(ew.onLoadDeferred, rias.hitch(ww, function(){
				// set value again in case the edit widget's value is just now valid
				ew.set(("displayedValue" in ew || "_setDisplayedValueAttr" in ew) ? "displayedValue" : "value", self.value);
				this.defer(function(){ // defer needed so that the change of focus doesn't happen on mousedown which also sets focus
					// the saveButton should start out disabled in most cases but the above set could have fired onChange
					if(ww.saveButton){
						ww.saveButton.set("disabled", "intermediateChanges" in ew);
					}
					this.focus(); // both nodes are showing, so we can switch focus safely
					this._resetValue = this.get("value");
				});
			}));
		},

		_onBlur: function(){
			// summary:
			//		Called when focus moves outside the InlineEditBox.
			//		Performs garbage collection.
			// tags:
			//		private

			this.inherited(arguments);
			if(!this.editing){
				/* causes IE focus problems, see TooltipDialog_a11y.html...
				 this.defer(function(){
				 if(this.wrapperWidget){
				 this.wrapperWidget.destroy();
				 delete this.wrapperWidget;
				 }
				 });
				 */
			}
		},

		destroy: function(){
			if(this.wrapperWidget && !this.wrapperWidget._destroyed){
				this.wrapperWidget.destroy();
				delete this.wrapperWidget;
			}
			this.inherited(arguments);
		},

		_showText: function(/*Boolean*/ focus){
			// summary:
			//		Revert to display mode, and optionally focus on display node
			// tags:
			//		private

			var ww = this.wrapperWidget;
			rias.dom.setStyle(ww.domNode, { visibility: "hidden" }); // hide the editor from mouse/keyboard events
			rias.dom.addClass(ww.domNode, "dijitOffScreen");
			rias.dom.removeClass(this.displayNode, "dijitOffScreen");
			rias.dom.setAttr(this.displayNode, "tabIndex", this._savedTabIndex);
			if(focus){
				rias.dom.focus(this.displayNode);
			}
		},

		save: function(/*Boolean*/ focus){
			// summary:
			//		Save the contents of the editor and revert to display mode.
			// focus: Boolean
			//		Focus on the display mode text
			// tags:
			//		private

			if(this.disabled || !this.editing){
				return;
			}
			this._set('editing', false);

			var ww = this.wrapperWidget;
			var value = ww.get("value");
			this.set('value', value); // display changed, formatted value

			this._showText(focus); // set focus as needed
		},

		//修改
		_setValueAttr: function(/*String*/ val){
			// summary:
			//		Hook to make set("value", ...) work.
			//		Inserts specified HTML value into this node, or an "input needed" character if node is blank.

			val = rias.trim(val);
			var renderVal = this.renderAsHtml ? val : val.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;").replace(/\n/g, "<br>");
			this.displayNode.innerHTML = renderVal || this.noValueIndicator;
			this._set("value", val);

			if(this._started){
				// tell the world that we have changed
				this.defer(function(){
					this.onChange(val);
				}); // defer prevents browser freeze for long-running event handlers
			}

			if(rias.has("dojo-bidi")){
				this.applyTextDir(this.displayNode);
			}
		},

		cancel: function(/*Boolean*/ focus){
			// summary:
			//		Revert to display mode, discarding any changes made in the editor
			// tags:
			//		private

			if(this.disabled || !this.editing){
				return;
			}
			this._set('editing', false);

			// tell the world that we have no changes
			this.defer("onCancel"); // defer prevents browser freeze for long-running event handlers

			this._showText(focus);
		}
	});

	InlineEditBox._InlineEditor = InlineEditor;	// for monkey patching

	return InlineEditBox;
});
