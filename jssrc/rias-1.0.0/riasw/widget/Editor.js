//RIAStudio client runtime widget - Editor(RichTextEditor)

define([
	"rias",
	"dijit/Editor",
	"rias/riasw/widget/RichText",///修改 style 不是字符串时的问题。
	"dijit/Toolbar",
	"dijit/_editor/plugins/AlwaysShowToolbar",
	"dijit/_editor/plugins/FullScreen",
	"dijit/_editor/plugins/NewPage",
	"dijit/_editor/plugins/Print",
	"dijit/_editor/plugins/ViewSource",
	"dijit/_editor/plugins/FontChoice",
	"dijit/_editor/plugins/EnterKeyHandling",
	"dijit/_editor/plugins/ToggleDir",
	"dijit/_editor/plugins/LinkDialog",
	"dijit/_editor/plugins/TabIndent",
	"dojox/html/entities",
	"dojox/editor/plugins/ResizeTableColumn",
	"dojox/editor/plugins/AutoSave",
	"dojox/editor/plugins/AutoUrlLink",
	"dojox/editor/plugins/BidiSupport",
	"dojox/editor/plugins/Blockquote",
	"dojox/editor/plugins/Breadcrumb",
	"dojox/editor/plugins/CollapsibleToolbar",
	"dojox/editor/plugins/EntityPalette",
	"dojox/editor/plugins/FindReplace",
	"dojox/editor/plugins/InsertAnchor",
	"dojox/editor/plugins/InsertEntity",
	"dojox/editor/plugins/LocalImage",
	"dojox/editor/plugins/NormalizeIndentOutdent",
	"dojox/editor/plugins/NormalizeStyle",
	"dojox/editor/plugins/PageBreak",
	"dojox/editor/plugins/PasteFromWord",
	"dojox/editor/plugins/PrettyPrint",
	"dojox/editor/plugins/Preview",
	"dojox/editor/plugins/SafePaste",
	"dojox/editor/plugins/Save",
	"dojox/editor/plugins/ShowBlockNodes",
	"dojox/editor/plugins/Smiley",
	//"dojox/editor/plugins/SpellCheck",
	"dojox/editor/plugins/StatusBar",
	"dojox/editor/plugins/TablePlugins",
	"dojox/editor/plugins/TextColor",
	"dojox/editor/plugins/ToolbarLineBreak",
	"dojox/editor/plugins/UploadImage",
	"rias/riasw/form/ValidationTextBox",///extend()
	"rias/riasw/form/ComboBox"///extend()
], function(rias, _Widget, _RichText, Toolbar, AlwaysShowToolbar, FullScreen, NewPage, Print, ViewSource, FontChoice,
			EnterKeyHandling, ToggleDir, LinkDialog, tabIndent, entities,
			ResizeTableColumn) {

	rias.theme.loadRiasCss([
		"widget/Editor.css",
		"widget/editorIcons.css",
		"widget/editor/editorPlugins.css"
	]);

	var pluginsDefault = [
			"undo", "redo", "cut", "copy", "paste",
			"insertOrderedList", "insertUnorderedList",
			"indent", "outdent",
			"justifyCenter", "justifyFull", "justifyLeft", "justifyRight",
			"delete", "selectAll", "removeFormat", "unlink", "insertHorizontalRule",
			"bold", "italic", "underline", "strikethrough", "subscript", "superscript", "|"
		],
		pluginsAll = ["collapsibletoolbar", "newPage", "autosave", {name: "viewSource", stripScripts: true, stripComments: true}, "showBlockNodes", "|",
			{name: "fullscreen", zIndex: 900}, "preview", "print", "|",
			"selectAll", "cut", "copy", "findreplace", "paste","pastefromword", "delete", "undo", "redo", "|",
			"pageBreak", "insertHorizontalRule", "insertOrderedList", "insertUnorderedList", "indent", "outdent", "blockquote", "|",
			"justifyLeft", "justifyRight", "justifyCenter", "justifyFull", "toggleDir", "|",
			"bold", "italic", "underline", "strikethrough", "superscript", "subscript",  "foreColor", "hiliteColor", "removeFormat", "||",
			"fontName", "fontSize", "formatBlock", "||",
			"insertEntity", "smiley", "createLink", "unlink", "insertanchor", "insertImage",
			//{name: "localImage", uploadable: true, uploadUrl: "../../form/tests/UploadFile.php", baseImageUrl: "../../form/tests/"},
			{name: "insertTable", command: "insertTable", title: "插入表格", alwaysAvailable: true},
			{name: "modifyTable", command: "modifyTable", title: "修改"},
			{name: "insertTableRowBefore", command: "InsertTableRowBefore", title: "插入行"},
			{name: "insertTableRowAfter", command: "InsertTableRowAfter", title: "追加行"},
			{name: "insertTableColumnBefore", command: "insertTableColumnBefore", title: "插入列"},
			{name: "insertTableColumnAfter", command: "insertTableColumnAfter", title: "追加列"},
			{name: "deleteTableRow", command: "deleteTableRow", title: "删除行"},
			{name: "deleteTableColumn", command: "deleteTableColumn", title: "删除列"},
			{name: "colorTableCell", command: "colorTableCell", title: "单元格颜色"},
			{name: "tableContextMenu", command: "tableContextMenu", title: "表格菜单"},
			{name: "ResizeTableColumn", command: "resizeTableColumn", title: "改变列宽"},
			{name: "prettyprint", indentBy: "3", entityMap: entities.html.concat(entities.latin)},
			{name: "dijit._editor.plugins.EnterKeyHandling", blockNodeForEnter: "P"},
			//"autoUrlLink",///TODO:zensst.该插件的 169行有错，需要判断 node 是否 undefined，以后修改
			"normalizeindentoutdent", "breadcrumb", {name: "normalizestyle", mode: "css"}, {name: "statusbar", resizer: false}, "safepaste"
		];

	_Widget.extend({
		startup: function(){
			///避免二次 startup()，以致显示不正确。
			if(this._started){
				return;
			}
			this.inherited(arguments);

			if(!this.toolbar){
				// if we haven't been assigned a toolbar, create one
				this.toolbar = new Toolbar({
					ownerDocument: this.ownerDocument,
					dir: this.dir,
					lang: this.lang,
					"aria-label": this.id,
					"class": "dijitEditorToolbar"
				});
				this.header.appendChild(this.toolbar.domNode);
			}

			rias.forEach(this.plugins, this.addPlugin, this);

			// Okay, denote the value can now be set.
			this.setValueDeferred.resolve(true);

			rias.dom.addClass(this.iframe.parentNode, "dijitEditorIFrameContainer");
			rias.dom.addClass(this.iframe, "dijitEditorIFrame");
			rias.dom.setAttr(this.iframe, "allowTransparency", true);

			this.toolbar.startup();
			this.onNormalizedDisplayChanged(); //update toolbar button status
		},
		destroy: function(){
			rias.forEach(this._plugins, function(p){
				if(p && p.destroy){
					p.destroy();
				}
			});
			this._plugins = [];
			if(this.toolbar){
				this.toolbar.destroyRecursive();
				this.toolbar = undefined;
			}
			this.inherited(arguments);
		}
	});

	//必须修改原型，而不是委托出来的
	////还是直接改原始文件好些，一共有3个：LinkDialog, InsertAnchor, TextColor
	//rias.i18n.getLocalization("dijit._editor", "LinkDialog", "zh");//需要先加载
	//rias.i18n.cache["dijit/_editor/nls/LinkDialog/zh"].set = "确定";
	/*dijit._editor.plugins.LinkDialog.prototype._loadDropDown = function(callback){
		// Called the first time the button is pressed.  Initialize TooltipDialog.
		rias.require([
			"dojo/i18n", // i18n.getLocalization
			"dijit/TooltipDialog",
			"dijit/registry", // registry.byId, registry.getUniqueId
			"dijit/form/Button", // used by template
			"dijit/form/Select", // used by template
			"dijit/form/ValidationTextBox", // used by template
			"dojo/i18n!dijit/nls/common",
			"dojo/i18n!dijit/_editor/nls/LinkDialog"
		], rias.hitch(this, function(i18n, TooltipDialog, registry){
			var _this = this;
			this.tag = this.command == 'insertImage' ? 'img' : 'a';
			var messages = rias.delegate(i18n.getLocalization("dijit", "common", this.lang),
				i18n.getLocalization("dijit._editor", "LinkDialog", this.lang));
			var dropDown = (this.dropDown = this.button.dropDown = new TooltipDialog({
				title: messages[this.command + "Title"],
				ownerDocument: this.editor.ownerDocument,
				dir: this.editor.dir,
				execute: rias.hitch(this, "setValue"),
				onOpen: function(){
					_this._onOpenDialog();
					TooltipDialog.prototype.onOpen.apply(this, arguments);
				},
				onCancel: function(){
					setTimeout(rias.hitch(_this, "_onCloseDialog"), 0);
				}
			}));
			if(rias.i18n.cache["dijit/_editor/nls/LinkDialog/zh"]){
				rias.i18n.cache["dijit/_editor/nls/LinkDialog/zh"].set = "确定";
				messages.set = "确定";
			}
			if(rias.i18n.cache["dijit/_editor/nls/LinkDialog/zh-cn"]){
				rias.i18n.cache["dijit/_editor/nls/LinkDialog/zh-cn"].set = "确定";
				messages.set = "确定";
			}
			messages.urlRegExp = this.urlRegExp;
			messages.id = rias.registry.getUniqueId(this.editor.id);
			this._uniqueId = messages.id;
			this._setContent(dropDown.title +
				"<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>" +
				rias.substitute(this.linkDialogTemplate, messages));
			dropDown.startup();
			this._urlInput = rias.registry.byId(this._uniqueId + "_urlInput");
			this._textInput = rias.registry.byId(this._uniqueId + "_textInput");
			this._setButton = rias.registry.byId(this._uniqueId + "_setButton");
			this.own(rias.registry.byId(this._uniqueId + "_cancelButton").on("click", rias.hitch(this.dropDown, "onCancel")));
			if(this._urlInput){
				this.own(this._urlInput.on("change", rias.hitch(this, "_checkAndFixInput")));
			}
			if(this._textInput){
				this.own(this._textInput.on("change", rias.hitch(this, "_checkAndFixInput")));
			}

			// Build up the dual check for http/https/file:, and mailto formats.
			this._urlRegExp = new RegExp("^" + this.urlRegExp + "$", "i");
			this._emailRegExp = new RegExp("^" + this.emailRegExp + "$", "i");
			this._urlInput.isValid = rias.hitch(this, function(){
				// Function over-ride of isValid to test if the input matches a url or a mailto style link.
				var value = this._urlInput.get("value");
				return this._urlRegExp.test(value) || this._emailRegExp.test(value);
			});

			// Listen for enter and execute if valid.
			this.own(rias.on(dropDown.domNode, "keydown", rias.hitch(this, rias.hitch(this, function(e){
				if(e && e.keyCode == rias.keys.ENTER && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey){
					if(!this._setButton.get("disabled")){
						dropDown.onExecute();
						dropDown.execute(dropDown.get('value'));
					}
				}
			}))));

			callback();
		}));
	};*/

	///修改了 ${uId}_rte 的 style，加入背景色。
	dojox.editor.plugins.PasteFromWord.extend({
		_template:
			["<div class='dijitPasteFromWordEmbeddedRTE'>",
				"<div style='width: ${width}; padding-top: 5px; padding-bottom: 5px;'>${instructions}</div>",
				"<div id='${uId}_rte' style='width: ${width}; height: ${height}; border: 1px #b1badf solid; background-color: white'></div>",
				"<table style='width: ${width}' tabindex='-1'>",
					"<tbody>",
						"<tr>",
							"<td align='center'>",
								"<button type='button' dojoType='dijit.form.Button' id='${uId}_paste'>${paste}</button>",
								"&nbsp;",
								"<button type='button' dojoType='dijit.form.Button' id='${uId}_cancel'>${buttonCancel}</button>",
							"</td>",
						"</tr>",
					"</tbody>",
				"</table>",
			"</div>"].join("")
	});

	var riasType = "rias.riasw.widget.Editor";
	var Widget = rias.declare(riasType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswEditorIcon",
		iconClass16: "riaswEditorIcon16",
		defaultParams: function(params){
			var p = params.plugins;
			if(rias.isArray(p)){
				if(p.length === 0){
					p = pluginsDefault;
				}
			}else if(rias.isString(p)){
				if(p.toLowerCase() === "all"){
					p = pluginsAll;
				}else{
					p = pluginsDefault;
				}
			}else{
				p = pluginsDefault;
			}
			delete params.plugins;
			params = rias.mixinDeep({}, {
				//value: "RichText",
				plugins: pluginsAll,//p,
				extraPlugins: []
			}, params);
			return params;
		},
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