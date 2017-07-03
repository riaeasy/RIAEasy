//RIAStudio client runtime widget - ExpandingTextArea

define([
	"riasw/riaswBase",
	"riasw/form/TextArea"
], function(rias, TextArea) {

	///TODO:zensst.未做测试，有问题。放弃不用。
	// feature detection, true for mozilla and webkit
	rias.has.add("textarea-needs-help-shrinking", function(){
		var body = rias.dom.body(),	// note: if multiple documents exist, doesn't matter which one we use
			te = rias.dom.create('textarea', {
				rows:"5",
				cols:"20",
				value: ' ',
				style: {zoom:1, fontSize:"1em", height:"96px", overflow:'hidden', visibility:'hidden', position:'absolute', border:"5px solid white", margin:"0", padding:"0", boxSizing: 'border-box', MsBoxSizing: 'border-box', WebkitBoxSizing: 'border-box', MozBoxSizing: 'border-box' }
			}, body, "last");
		var needsHelpShrinking = te.scrollHeight >= te.clientHeight;
		body.removeChild(te);
		return needsHelpShrinking;
	});

	var riaswType = "riasw.form.ExpandingTextArea";
	var Widget = rias.declare(riaswType, [TextArea], {

		baseClass: "riaswTextBox riaswTextArea riaswExpandingTextArea",

		// Override SimpleTextArea.cols to default to width:100%, for backward compatibility
		cols: "",
		width: "200px",

		_setValueAttr: function(){
			this.inherited(arguments);
			this.resize();
		},

		buildRendering: function(){
			this.inherited(arguments);

			// tweak textarea style to reduce browser differences
			rias.dom.setStyle(this.textbox, { overflowY: 'hidden', overflowX: 'auto', boxSizing: 'border-box', MsBoxSizing: 'border-box', WebkitBoxSizing: 'border-box', MozBoxSizing: 'border-box' });
		},
		postCreate: function(){
			this.inherited(arguments);
			var textarea = this.textbox;
			textarea.style.overflowY = "hidden";
			this.own(rias.on(textarea, "focus, resize", rias.hitch(this, "_resizeLater")));
		},

		startup: function(){
			this.inherited(arguments);
			//this.own(Viewport.on("resize", rias.hitch(this, "_resizeLater")));
			/*if(rias.desktop){
				rias.desktop.addResizeWidget(this);
			}else{
				rias.dom.Viewport.on("resize", function(){
					this.own(rias._debounce(this.id + "_onViewportResize", function(){
						if(!this._canDoDom()){
							return;
						}
						this._containerLayout();
					}, this, this._onViewportResizeDelay, function(){
					})());
				});
			}
			this._resizeLater();*/
		},

		_onInput: function(e){
			this.inherited(arguments);
			this.resize();
		},

		_estimateHeight: function(){
			// summary:
			//		Approximate the height when the textarea is invisible with the number of lines in the text.
			//		Fails when someone calls setValue with a long wrapping line, but the layout fixes itself when the user clicks inside so . . .
			//		In IE, the resize event is supposed to fire when the textarea becomes visible again and that will correct the size automatically.
			//
			var textarea = this.textbox;
			// #rows = #newlines+1
			textarea.rows = (textarea.value.match(/\n/g) || []).length + 1;
		},

		_resizeLater: function(){
			this.defer("_resize");
		},

		_resize: function(box){
			box = this.inherited(arguments);
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

			if(textarea.style.overflowY === "hidden"){
				textarea.scrollTop = 0;
			}
			if(this.busyResizing){
				return box;
			}
			this.busyResizing = true;
			if(textareaScrollHeight() || textarea.offsetHeight){
				var newH = textareaScrollHeight() + rias.max(textarea.offsetHeight - textarea.clientHeight, 0);
				var newHpx = newH + "px";
				if(newHpx !== textarea.style.height){
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
				if(textarea.style.overflowY === "hidden"){
					textarea.scrollTop = 0;
				}
			}else{
				// hidden content of unknown size
				this._estimateHeight();
			}
			this.busyResizing = false;
			return box;
		}
	});

	Widget._riasdMeta = {
		visual: true,
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
			}
		}
	};

	return Widget;

});