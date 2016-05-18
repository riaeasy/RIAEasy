
///修改了 orion/defaults.pref
///修改了 orion/editor/FindUI.js行18：	'orion/util'。去掉末尾的","

define([
	"rias",
	"dojo/_base/declare",
	"dojo/sniff",
	"dojo/topic",
	"dojo/Deferred",
	"dijit/_Widget",
	"dijit/_CssStateMixin",

	"orion/editor/config", //$NON-NLS-0$
	"orion/editor/shim", //$NON-NLS-0$

	"orion/editor/textView", //$NON-NLS-0$
	"orion/editor/textModel", //$NON-NLS-0$
	"orion/editor/textTheme", //$NON-NLS-0$
	"orion/editor/projectionTextModel", //$NON-NLS-0$
	"orion/editor/eventTarget", //$NON-NLS-0$
	"orion/keyBinding", //$NON-NLS-0$
	"orion/editor/rulers", //$NON-NLS-0$
	"orion/editor/annotations", //$NON-NLS-0$
	"orion/editor/tooltip", //$NON-NLS-0$
	"orion/editor/undoStack", //$NON-NLS-0$
	"orion/editor/textDND", //$NON-NLS-0$

	"orion/editor/editor", //$NON-NLS-0$
	"orion/editor/editorFeatures", //$NON-NLS-0$

	"orion/editor/contentAssist", //$NON-NLS-0$
	"webtools/cssContentAssist", //$NON-NLS-0$
	"webtools/htmlContentAssist", //$NON-NLS-0$

	"orion/editor/AsyncStyler", //$NON-NLS-0$
	"orion/editor/mirror", //$NON-NLS-0$
	"orion/editor/textMateStyler", //$NON-NLS-0$
	"orion/editor/htmlGrammar", //$NON-NLS-0$
	"orion/editor/textStyler", //$NON-NLS-0$
	"orion/editor/stylers/application_javascript/syntax", //$NON-NLS-0$
	"orion/editor/stylers/text_css/syntax", //$NON-NLS-0$
	"orion/editor/stylers/text_html/syntax"//, //$NON-NLS-0$
	//orion需要用requirejs包中的i18n.js
], function(rias, declare, has, topic, Deferred, _Widget, _CssStateMixin,
			config, shim, mTextView, mTextModel, mTextTheme, mProjModel, mEventTarget, mKeyBinding, mRulers, mAnnotations,
			mTooltip, mUndoStack, mTextDND, mEditor, mEditorFeatures, mContentAssist, mCSSContentAssist, mHtmlContentAssist,
			mAsyncStyler, mMirror, mTextMateStyler, mHtmlGrammar, mTextStyler, mJS, mCSS, mHTML) {

	rias.theme.loadRiasCss([
		"widget/OrionEditor.css"
	]);

	/**	@private */
	function getHeight(node) {
		return node.clientHeight;
	}
	/**	@private */
	function getDisplay(window, document, element) {
		var display;
		var temp = element;
		while (temp && temp !== document && display !== "none") { //$NON-NLS-0$
			if (window.getComputedStyle) {
				var style = window.getComputedStyle(temp, null);
				display = style.getPropertyValue("display"); //$NON-NLS-0$
			} else {
				display = temp.currentStyle.display;
			}
			temp = temp.parentNode;
		}
		if (!temp || !display) {
			return "none"; //$NON-NLS-0$
		}
		return display;
	}

	/**	@private */
	function getTextFromElement(element) {
		var firstChild = element.firstChild;
		if (firstChild && firstChild.tagName === "TEXTAREA") { //$NON-NLS-0$
			return firstChild.value;
		}
		var document = element.ownerDocument;
		var window = document.defaultView || document.parentWindow;
		if (!window.getSelection ||
			(element.childNodes.length === 1 && firstChild.nodeType === Node.TEXT_NODE) ||
			getDisplay(window, document, element) === "none") //$NON-NLS-0$
		{
			return element.innerText || element.textContent;
		}
		var newRange = document.createRange();
		newRange.selectNode(element);
		var selection = window.getSelection();
		var oldRanges = [], i;
		for (i = 0; i < selection.rangeCount; i++) {
			oldRanges.push(selection.getRangeAt(i));
		}
		selection.removeAllRanges();
		selection.addRange(newRange);
		var text = selection.toString();
		selection.removeAllRanges();
		for (i = 0; i < oldRanges.length; i++) {
			selection.addRange(oldRanges[i]);
		}
		return text;
	}

	var riasType = "rias.riasw.widget.OrionEditor";
	var Widget =  declare(riasType, [_Widget, _CssStateMixin], {

		constructor: function (params, srcNodeRef) {
			//this.params = params;
		},

		baseClass: "riaswOrionEditor",
		//cssStateNodes: {
		//	containerNode: "riaswOrionEditor"
		//},

		// name: String?
		//		Specifies the name of a (hidden) `<textarea>` node on the page that's used to save
		//		the editor content on page leave.   Used to restore editor contents after navigating
		//		to a new page and then hitting the back button.
		//name: "",
		filename: "",

		minHeight: "1em",

		//templateString: "<div data-dojo-attach-point='focusNode' autocomplete='off'></div>",
		templateString: "<div autocomplete='off'></div>",
		tabIndex: 0,
		//_setTabIndexAttr: ["domNode"],

		// disabled: Boolean
		//		The editor is disabled; the text cannot be changed.
		disabled: false,
		readOnly: false,

		defaultContent: "",

		_setDisabledAttr: function(/*Boolean*/ value){
			var //w = this.editor,
				t = this.textView;// (w ? w._textView : undefined);
			value = !!value;
			//if(this.disabled != value){
			this._set("disabled", value);
			if(value){
				rias.dom.query("._textviewDOMReady", this.domNode).style("backgroundColor", "inherit");
			}else{
				rias.dom.query("._textviewDOMReady", this.domNode).style("backgroundColor", "");
			}
			///必须针对 textView 进行设置
			if(!t){
				this._needDisabled = true;
			}else{
				this._needDisabled = undefined;
				t._setReadOnly(value);
			}
		},
		_setReadOnlyAttr: function(value){
			var //w = this.editor,
				t = this.textView;// (w ? w._textView : undefined);
			value = !!value;
			this._set("readOnly", value);
			//if(w && w._textView){
			if(t){
				this._needReadOnly = undefined;
				this.domNode.tabIndex = value ? "-1" : this.tabIndex;
				t._setReadOnly(value);
				var preventIEfocus = rias.has("ie");// && (this.isLoaded || !this.focusOnLoad);
				if(preventIEfocus){
					t._clientDiv.unselectable = "on";
				}
				t._clientDiv.contentEditable = !value;
				t._clientDiv.tabIndex = value ? "-1" : this.tabIndex;
				if(preventIEfocus){
					this.defer(function(){
						if(t && t._clientDiv){        // guard in case widget destroyed before timeout
							t._clientDiv.unselectable = "off";
						}
					});
				}
				//if(has("mozilla") && !value && this._mozSettingProps){
				//	var ps = this._mozSettingProps;
				//	var n;
				//	for(n in ps){
				//		if(ps.hasOwnProperty(n)){
				//			try{
				//				this.document.execCommand(n, false, ps[n]);
				//			}catch(e2){
				//			}
				//		}
				//	}
				//}
				//}
			}else{
				this._needReadOnly = true;
			}
		},
		_setValueAttr: function(value){
			var w = this.editor;
			this._set("value", value);
			if(this.editor){
				this.editor.setText(value);
				//if(reset){
				//	this.editor.markClean();
				//}
			}
		},
		_getValueAttr: function(){
			return this.getText();
		},

		buildRendering: function(){
			this.inherited(arguments);
			if (!this.editor) {
				this._createEditor();
			}
			this.containerNode = this.textView._rootDiv;// this.editor._textView._rootDiv;
			rias.dom.addClass(this.containerNode, "riaswTextBoxContainer");
			///没有 template 时，显式设置 focusNode。
			if(!this.focusNode){
				this.focusNode = this.textView._clientDiv;
			}
			//rias.dom.setAttr(this.domNode, 0);
			//this.watch("readonly", rias.hitch(this, "_setStateClass"));
		},
		postCreate: function(){
			this.inherited(arguments);
			/*if(this.params.value && dojo.isString(this.params.value)){
				this.setText(this.params.value);
			}
			if(this.params.filename && dojo.isString(this.params.filename)){
				this.setContent(this.params.filename);
			}*/
			topic.publish(rias._scopeName + "/riasw/widget/OrionEditor::init", this);
		},
		startup: function(){
			if(this._started){
				return;
			}
			this.inherited(arguments);
			this.set("readOnly", this.readOnly);///延迟设置 readOnly。
			this.set("disabled", this.disabled);///延迟设置 disabled。
			this.setText(this.getDefaultContent());
		},

		getDefaultContent: function() {
			return this.defaultContent;
		},
		getText: function(){
			if(this.editor){
				return this.editor.getText(0);
			}
			return this.getDefaultContent();
		},
		setText: function(text, reset){
			if(this.editor){
				this.editor.setText(text);
				if(reset){
					this.editor.markClean();
				}
			}
		},
		getCaretOffset: function() {
			return this.editor ? this.editor.getCaretOffset() : -1;
		},
		setCaretOffset: function(caretOffset, show, callback) {
			if(this.editor){
				this.editor.setCaretOffset(caretOffset, show, callback);
			}
		},

		isDirty: function(){
			return this.editor && this.editor.isDirty();
		},
		markClean: function(){
			if(this.editor){
				this.editor.markClean();
			}
		},

		getClientArea: function(){
			if(this.textView){
				/*{
					x: scroll.x,
					y: scroll.y,
					width: this._getClientWidth(),
					height: this._getClientHeight()
				};*/
				return this.textView.getClientArea();
			}else{
				return;
			}
		},
		scrollView: function(pixelX, pixelY, callback){
			if(this.textView){
				if(callback){
					if(rias.isFunction(callback)){
						this.textView._scrollViewAnimated(pixelX, pixelY, callback);
					}else{
						this.textView._scrollViewAnimated(pixelX, pixelY);
					}
				}else{
					this.textView._scrollView(pixelX, pixelY);
				}
			}
		},

		destroy: function () {
			///orion.Editor 未释放 _contentAssist._mode.widget.parentNode
			var w = rias.getObject("_contentAssist._mode.widget.parentNode", false, this.editor);
			if(rias.isDomNode(w)){
				w.parentNode.removeChild(w);
			}
			this.inherited(arguments);
		},

		loadFile: function(filename, preventCache){
			var d = new Deferred(),
				self = this;
			if(filename && dojo.isString(filename)){
				self.filename = filename || self.filename || "";
				this.setContentType(rias.lastString(filename, "."));
				rias.xhrGet({
					url: self.filename,
					//timeout: 30000,
					handleAs: "text"
				}, {}, function(content){
					self.setText(content);
					self.markClean();
					d.resolve(content);
				}, function(error) {
					console.warn(rias.substitute(rias.i18n.message.notfound, [self.filename]), error.message);
					d.reject(error);
				}, preventCache);
			}else{
				this.setContentType("");
				self.setText(self.getDefaultContent());
				self.markClean();
				d.resolve(self.getDefaultContent());
			}
			return d.promise;
		},

		/* Gets called before browser page is unloaded to give
		 * editor a chance to warn the user they may lose data if
		 * they continue. Should return a message to display to the user
		 * if a warning is needed or null if there is no need to warn the
		 * user of anything. In browsers such as FF 4, the message shown
		 * will be the browser default rather than the returned value.
		 *
		 * NOTE: With auto-save, _not_ typically needed by most editors.
		 */
		getOnUnloadWarningMessage: function() {
			return null;
		},

		contentType: "application/javascript",
		_styler: null,
		setContentType: function(newType){
			if (newType === "css") { //$NON-NLS-0$
				newType = "text/css"; //$NON-NLS-0$
			} else if (newType === "html") { //$NON-NLS-0$
				newType = "text/html"; //$NON-NLS-0$
			} else if (newType === "java") { //$NON-NLS-0$
				newType = "text/x-java-source"; //$NON-NLS-0$
			}else{
				newType = "application/javascript"; //$NON-NLS-0$
			}
			this.contentType = newType;
			if (this._styler && this._styler.destroy) {
				this._styler.destroyRecursive();
			}
			this._styler = null;
			var textView = (this.editor ? this.editor.getTextView() : undefined);
			var annotationModel = (this.editor ? this.editor.getAnnotationModel(): undefined);
			newType = this.contentType.replace(/[*|:/".<>?+]/g, '_');
			rias.require(["orion/editor/stylers/" + newType + "/syntax"], //$NON-NLS-1$ //$NON-NLS-0$
				function(grammar) {
					var stylerAdapter = new mTextStyler.createPatternBasedAdapter(grammar.grammars, grammar.id);
					this._styler = new mTextStyler.TextStyler(textView, annotationModel, stylerAdapter);
				},
				function(error) {
					/*
					 * A grammar file was not found for the specified contentType, so syntax styling will
					 * not be shown (the editor will still work fine otherwise).  requireJS has already
					 * written an error message to the console regarding the missing grammar file.
					 */
				}
			);
			//if (this._contentType === "text/css") { //$NON-NLS-0$
			//	editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
			//}

		},

		onChange: function(evt){
		},
		onScroll: function(evt){
		},
		onSelection: function(evt){
		},

		_createEditor: function (options) {
			var self = this;
			if(self.editor){
				return;
			}
			options = options || {};
			var doc = options.document || document;
			var parent = self.domNode;//options.parent || self.domNode;

			if (typeof options.theme === "string") { //$NON-NLS-0$
				var theme = mTextTheme.TextTheme.getTheme(options.theme);
				var index = options.theme.lastIndexOf("/"); //$NON-NLS-0$
				var themeClass = options.theme;
				if (index !== -1) {
					themeClass = themeClass.substring(index + 1);
				}
				var extension = ".css"; //$NON-NLS-0$
				if (themeClass.substring(themeClass.length - extension.length) === extension) {
					themeClass = themeClass.substring(0, themeClass.length - extension.length);
				}
				theme.setThemeClass(themeClass, {href: options.theme});
				options.theme = theme;
			}
			var textViewFactory = function() {
				var tv = new mTextView.TextView({
					parent: parent,
					model: new mProjModel.ProjectionTextModel(options.model ? options.model : new mTextModel.TextModel("")),
					tabSize: options.tabSize ? options.tabSize : 4,
					readonly: options.readOnly,///注意大小写
					fullSelection: options.fullSelection,
					tabMode: options.tabMode,
					expandTab: options.expandTab,
					singleMode: options.singleMode,
					themeClass: options.themeClass,
					theme: options.theme,
					wrapMode: options.wrapMode,
					wrappable: options.wrappable
				});
				///增加对 空格 的判断，避免使用 dojo.touch 造成 空格 失效的问题。
				///dijit/a11yclick 的 on(document, "keydown", function(e)
				self.own(rias.after(tv, "_handleKeyDown", function(e){
					if(e.keyCode === 32){
						if (e.preventDefault) {
							e.preventDefault();
							e.stopPropagation();
						} else {
							e.cancelBubble = true;
							e.returnValue = false;
							e.keyCode = 0;
						}
						this._doContent(" ");
						return false;
					}
				}, true));
				return tv;
			};

			var contentAssist, contentAssistFactory;
			//if (!options.readOnly) {
				contentAssistFactory = {
					createContentAssistMode: function(editor) {
						contentAssist = new mContentAssist.ContentAssist(editor.getTextView());
						var contentAssistWidget = new mContentAssist.ContentAssistWidget(contentAssist);
						var result = new mContentAssist.ContentAssistMode(contentAssist, contentAssistWidget);
						contentAssist.setMode(result);
						return result;
					}
				};
			//}

			var editor = self.editor = new mEditor.Editor({
				statusReporter: function(message, isError) {
					//var method = isError ? "error" : "log";
					//console[method]("orion.editor: " + message);
					if(self.statusReporter){
						self.statusReporter.apply(self, arguments);
					}else if ( isError ) {
						console.error("orion.editor: " + message);
					}
				},
				textViewFactory: textViewFactory,
				undoStackFactory: new mEditorFeatures.UndoFactory(),
				annotationFactory: new mEditorFeatures.AnnotationFactory(),
				lineNumberRulerFactory: new mEditorFeatures.LineNumberRulerFactory(),
				foldingRulerFactory: new mEditorFeatures.FoldingRulerFactory(),
				textDNDFactory: new mEditorFeatures.TextDNDFactory(),
				contentAssistFactory: contentAssistFactory,
				keyBindingFactory: new mEditorFeatures.KeyBindingsFactory(),
				domNode: parent
			});

			editor.addEventListener("TextViewInstalled", function() { //$NON-NLS-0$
				var ruler = editor.getLineNumberRuler();
				if (ruler && options.firstLineIndex !== undefined) {
					ruler.setFirstLine(options.firstLineIndex);
				}
				var sourceCodeActions = editor.getSourceCodeActions();
				if (sourceCodeActions) {
					sourceCodeActions.setAutoPairParentheses(options.autoPairParentheses);
					sourceCodeActions.setAutoPairBraces(options.autoPairBraces);
					sourceCodeActions.setAutoPairSquareBrackets(options.autoPairSquareBrackets);
					sourceCodeActions.setAutoPairAngleBrackets(options.autoPairAngleBrackets);
					sourceCodeActions.setAutoPairQuotations(options.autoPairQuotations);
					sourceCodeActions.setAutoCompleteComments(options.autoCompleteComments);
					sourceCodeActions.setSmartIndentation(options.smartIndentation);
				}
			});

			var contents = options.contents;
			if (contents === undefined) {
				contents = getTextFromElement(parent);
			}
			if (!contents) { contents=""; }

			editor.installTextView();
			var textView = this.textView = editor.getTextView();
			if(this._needDisabled){
				this.set("disabled", this.get("disabled"));
			}
			if(this._needReadOnly){
				this.set("readOnly", this.get("readOnly"));
			}
			if(this._needResize){
				this.resize();
			}
			editor._listener = {
				onModelChanged: function(e) {
					editor.checkDirty();
					self.onChange(e);
				},
				onMouseOver: function(e) {
					editor._listener.onMouseMove(e);
				},
				onMouseMove: function(e) {
					var tooltip = mTooltip.Tooltip.getTooltip(textView);
					if (!tooltip) { return; }
					if (editor._listener.lastMouseX === e.event.clientX && editor._listener.lastMouseY === e.event.clientY) {
						return;
					}
					editor._listener.lastMouseX = e.event.clientX;
					editor._listener.lastMouseY = e.event.clientY;
					tooltip.setTarget({
						x: e.x,
						y: e.y,
						getTooltipInfo: function() {
							return editor._getTooltipInfo(this.x, this.y);
						}
					});
					self.onMouseMove(e);
				},
				onMouseOut: function(e) {
					var tooltip = mTooltip.Tooltip.getTooltip(textView);
					if (!tooltip) { return; }
					if (editor._listener.lastMouseX === e.event.clientX && editor._listener.lastMouseY === e.event.clientY) {
						return;
					}
					editor._listener.lastMouseX = e.event.clientX;
					editor._listener.lastMouseY = e.event.clientY;
					tooltip.setTarget(null);
					self.onMouseOut(e);
				},
				onScroll: function(e) {
					var tooltip = mTooltip.Tooltip.getTooltip(textView);
					if (!tooltip) { return; }
					tooltip.setTarget(null, 0, 0);
					self.onScroll(e);
				},
				onSelection: function(e) {
					editor._updateCursorStatus();
					editor._highlightCurrentLine(e.newValue, e.oldValue);
					self.onSelection(e);
				}
			};
			textView.addEventListener("ModelChanged", editor._listener.onModelChanged); //$NON-NLS-0$
			textView.addEventListener("Selection", editor._listener.onSelection); //$NON-NLS-0$
			textView.addEventListener("MouseOver", editor._listener.onMouseOver); //$NON-NLS-0$
			textView.addEventListener("MouseOut", editor._listener.onMouseOut); //$NON-NLS-0$
			textView.addEventListener("MouseMove", editor._listener.onMouseMove); //$NON-NLS-0$
			textView.addEventListener("Scroll", editor._listener.onScroll); //$NON-NLS-0$

			editor.setLineNumberRulerVisible(options.showLinesRuler === undefined || options.showLinesRuler);
			editor.setAnnotationRulerVisible(options.showAnnotationRuler === undefined || options.showFoldingRuler);
			editor.setOverviewRulerVisible(options.showOverviewRuler === undefined || options.showOverviewRuler);
			editor.setZoomRulerVisible(options.showZoomRuler === undefined || options.showZoomRuler);
			editor.setFoldingRulerVisible(options.showFoldingRuler === undefined || options.showFoldingRuler);
			editor.setInput(options.title, null, contents, false, options.noFocus);

			//syntaxHighlighter.highlight(options.contentType || options.lang || this.defaultLang, this.editor);
			self.setContentType(options.contentType || options.lang)
			if (contentAssist) {
				var cssContentAssistProvider = new mCSSContentAssist.CssContentAssistProvider();
				var htmlContentAssistProvider = new mHtmlContentAssist.HTMLContentAssistProvider();
				contentAssist.addEventListener("Activating", function() { //$NON-NLS-0$
					if (/css$/.test(this.contentType)) {
						contentAssist.setProviders([cssContentAssistProvider]);
					} else if (/html$/.test(this.contentType)) {
						contentAssist.setProviders([htmlContentAssistProvider]);
					}
				});
			}

			/*
			 * The minimum height of the editor is 50px. Do not compute size if the editor is not
			 * attached to the DOM or it is display=none.
			 */
			var window = doc.defaultView || doc.parentWindow;
			if (!options.noComputeSize && getDisplay(window, doc, parent) !== "none" && getHeight(parent) <= 50) { //$NON-NLS-0$
				var height = editor.getTextView().computeSize().height;
				parent.style.height = height + "px"; //$NON-NLS-0$
			}

			editor.getTextView().focus();

		},

		resize: function(box){
			//var w = this.editor;
			rias.dom.setMarginBox(this.domNode, box);
			box = rias.dom.marginBox2contentBox(this.domNode, box);
			rias.dom.setMarginBox(this.containerNode, box);
			//if(w && w._textView){
			if(this.textView){
				this._needResize = undefined;
				this.textView.resize();
			}else{
				this._needResize = true;
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "OrionEditorIcon",
		iconClass16: "OrionEditorIcon16",
		defaultParams: {
			//content: "<div></div>",
			name: "",
			filename: "",
			disabled: false
		}
	};

	return Widget;

});
