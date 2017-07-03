//RIAStudio client runtime widget - TextArea(SimpleTextarea)

define([
	"riasw/riaswBase",
	"riasw/form/TextBox"
], function(rias, TextBox){

	var riaswType = "riasw.form.TextArea";
	return rias.declare(riaswType, TextBox, {
		//templateString: "<textarea class='riaswTextBoxContainer' data-dojo-attach-point='focusNode,containerNode,textbox' autocomplete='off' ${!nameAttrSetting}></textarea>",
		templateString:
			'<div class="dijitReset" id="widget_${id}" role="presentation">'+
				//'<div class="riaswTextBoxLabel" data-dojo-attach-point="labelNode" id="${id}_label" tabIndex="-1" readonly="readonly" role="presentation"></div>'+
				'<div class="riaswTextBoxContainer" data-dojo-attach-point="containerNode">'+
					'<textarea class="riaswInputInner" data-dojo-attach-point="focusNode,textbox" aria-labelledby="${id}_label" autocomplete="off" wrap="off" ${!nameAttrSetting}></textarea>'+
				'</div>'+
			'</div>',

		baseClass: "riaswTextBox riaswTextArea",

		showLabel: false,

		enterAsTab: false,

		// rows: Number
		//		The number of rows of text.
		rows: "3",
		// cols: Number
		//		The number of characters per line.
		cols: "255",

		_setWhiteSpaceAttr: function(value){
			rias.dom.setStyle(this.textbox, "white-space", value);
		},
		_setWordWrapAttr: function(value){
			rias.dom.setStyle(this.textbox, "word-wrap", value);
		},

		postMixInProperties: function(){
			// Copy value from srcNodeRef, unless user specified a value explicitly (or there is no srcNodeRef)
			// TODO: parser will handle this in 2.0
			if(!this.value && this.srcNodeRef){
				this.value = this.srcNodeRef.value;
			}
			this.inherited(arguments);
		},

		buildRendering: function(){
			this.inherited(arguments);
			if(rias.has("ie") && this.cols){ // attribute selectors is not supported in IE6
				rias.dom.addClass(this.textbox, "riaswTextAreaCols");
			}
		},

		//filter: function(/*String*/ value){
		//	// Override TextBox.filter to deal with newlines... specifically (IIRC) this is for IE which writes newlines
		//	// as \r\n instead of just \n
		//	if(value){
		//		value = value.replace(/\r/g, "");
		//	}
		//	return this.inherited(arguments);
		//},
		format: function(value /*=====, constraints =====*/){
			return value == null /* or undefined */ ? "" : value.replace(/\n/g, "\r\n");
		},
		parse: function(value /*=====, constraints =====*/){
			if(value){
				value = value.replace(/\r/g, "");
			}
			return this.inherited(arguments);
		},

		_onInput: function(/*Event?*/ e){
			// Override TextBox._onInput() to enforce maxLength restriction
			if(this.maxLength){
				var maxLength = parseInt(this.maxLength);
				var value = this.textbox.value.replace(/\r/g, '');
				var overflow = value.length - maxLength;
				if(overflow > 0){
					var textarea = this.textbox;
					if(textarea.selectionStart){
						var pos = textarea.selectionStart;
						var cr = 0;
						if(rias.has("opera")){
							cr = (this.textbox.value.substring(0, pos).match(/\r/g) || []).length;
						}
						this.textbox.value = value.substring(0, pos - overflow - cr) + value.substring(pos - cr);
						textarea.setSelectionRange(pos - overflow, pos - overflow);
					}else if(this.ownerDocument.selection){ //IE
						textarea.focus();
						var range = this.ownerDocument.selection.createRange();
						// delete overflow characters
						range.moveStart("character", -overflow);
						range.text = '';
						// show cursor
						range.select();
					}
				}
			}
			this.inherited(arguments);
		/*},
		_getDisplayedValueAttr: function(){
			// TODO: maybe we should update this.displayedValue on every keystroke so that we don't need
			// this method
			// TODO: this isn't really the displayed value when the user is typing
			return this.filter(this.textbox.value);
		},
		_setDisplayedValueAttr: function(value){
			if(value == null){ /// or undefined
				value = "";
			}else if(typeof value !== "string"){
				value = String(value);
			}

			this.textbox.value = this.filter(value).replace(/\n/g, "\r\n");

			// sets the serialized value to something corresponding to specified displayedValue
			// (if possible), and also updates the textbox.value, for example converting "123"
			// to "123.00"
			this.set("value", this.get('value'), undefined);

			this._set("displayedValue", this.get('displayedValue'));
		*/}

	});
});
