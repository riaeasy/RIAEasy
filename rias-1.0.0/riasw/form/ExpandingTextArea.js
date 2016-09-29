//RIAStudio client runtime widget - ExpandingTextArea

define([
	"rias",
	"rias/riasw/form/TextArea",///extend(templateString)
	"dijit/form/_ExpandingTextAreaMixin"
], function(rias, TextArea, _ExpandingTextAreaMixin) {

	var riaswType = "rias.riasw.form.ExpandingTextArea";
	var Widget = rias.declare(riaswType, [TextArea, _ExpandingTextAreaMixin], {
		// TODO: for 2.0, rename this to ExpandingTextArea, and rename SimpleTextarea to TextArea

		baseClass: "riaswTextBox riaswTextArea riaswExpandingTextArea",

		// Override SimpleTextArea.cols to default to width:100%, for backward compatibility
		cols: "",

		buildRendering: function(){
			this.inherited(arguments);

			// tweak textarea style to reduce browser differences
			rias.dom.setStyle(this.textbox, { overflowY: 'hidden', overflowX: 'auto', boxSizing: 'border-box', MsBoxSizing: 'border-box', WebkitBoxSizing: 'border-box', MozBoxSizing: 'border-box' });
		},
		resize: function(changeSize, resultSize){
			this.inherited(arguments);
			var textarea = this.textbox;

			function textareaScrollHeight(){
				var empty = false;
				if(textarea.value === ''){
					textarea.value = ' ';
					empty = true;
				}
				var sh = textarea.scrollHeight;
				if(empty){
					textarea.value = '';
				}
				return sh;
			}

			if(textarea.style.overflowY == "hidden"){
				textarea.scrollTop = 0;
			}
			if(this.busyResizing){
				return;
			}
			this.busyResizing = true;
			if(textareaScrollHeight() || textarea.offsetHeight){
				var newH = textareaScrollHeight() + rias.max(textarea.offsetHeight - textarea.clientHeight, 0);
				var newHpx = newH + "px";
				if(newHpx != textarea.style.height){
					textarea.style.height = newHpx;
					textarea.rows = 1; // rows can act like a minHeight if not cleared
				}
				if(rias.has("textarea-needs-help-shrinking")){
					var	origScrollHeight = textareaScrollHeight(),
						newScrollHeight = origScrollHeight,
						origMinHeight = textarea.style.minHeight,
						decrement = 4, // not too fast, not too slow
						thisScrollHeight,
						origScrollTop = textarea.scrollTop;
					textarea.style.minHeight = newHpx; // maintain current height
					textarea.style.height = "auto"; // allow scrollHeight to change
					while(newH > 0){
						textarea.style.minHeight = rias.max(newH - decrement, 4) + "px";
						thisScrollHeight = textareaScrollHeight();
						var change = newScrollHeight - thisScrollHeight;
						newH -= change;
						if(change < decrement){
							break; // scrollHeight didn't shrink
						}
						newScrollHeight = thisScrollHeight;
						decrement <<= 1;
					}
					textarea.style.height = newH + "px";
					textarea.style.minHeight = origMinHeight;
					textarea.scrollTop = origScrollTop;
				}
				textarea.style.overflowY = textareaScrollHeight() > textarea.clientHeight ? "auto" : "hidden";
				if(textarea.style.overflowY == "hidden"){
					textarea.scrollTop = 0;
				}
			}else{
				// hidden content of unknown size
				this._estimateHeight();
			}
			this.busyResizing = false;
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswExpandingTextAreaIcon",
		iconClass16: "riaswExpandingTextAreaIcon16",
		defaultParams: {
			//content: "<textarea type='text'></textarea>",
			width: "200px",
			height: "auto"
		},
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"name": {
				"datatype": "string",
				"title": "Name"
			},
			"maxLength": {
				"datatype": "string",
				"title": "MaxLength"
			},
			"alt": {
				"datatype": "string",
				"hidden": true
			},
			"_children": {
				"datatype": "string",
				"title": "Text"
			},
			"tabIndex": {
				"datatype": "string",
				"defaultValue": "0",
				"title": "Tab Index"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"title": "Read Only"
			},
			"intermediateChanges": {
				"datatype": "boolean",
				"title": "Intermediate Changes"
			},
			"cols": {
				"datatype": "string",
				"hidden": false
			},
			"rows": {
				"datatype": "number",
				"description": "The number of characters per line.",
				"hidden": false
			},
			"trim": {
				"datatype": "boolean",
				"description": "Removes leading and trailing whitespace if true.  Default is false.",
				"hidden": false
			},
			"uppercase": {
				"datatype": "boolean",
				"description": "Converts all characters to uppercase if true.  Default is false.",
				"hidden": false
			},
			"lowercase": {
				"datatype": "boolean",
				"description": "Converts all characters to lowercase if true.  Default is false.",
				"hidden": false
			},
			"propercase": {
				"datatype": "boolean",
				"description": "Converts the first character of each word to uppercase if true.",
				"hidden": false
			},
			"scrollOnFocus": {
				"datatype": "boolean",
				"description": "On focus, should this widget scroll into view?",
				"hidden": false,
				"defaultValue": true
			}
		}
	};

	return Widget;

});