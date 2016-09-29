
//RIAStudio client runtime widget - Uploader

define([
	"rias",
	"rias/riasw/xhr",
	"rias/riasw/form/Button",
	"rias/riasw/form/UploaderMixin",
	"dijit/_WidgetsInTemplateMixin"
],function(rias, riasXhr, Button, UploaderMixin, _WidgetsInTemplateMixin){

	var HTML5 = rias.declare("rias.riasw.form.uploader.HTML5", [], {
		errMsg: "Error uploading files. Try checking permissions",
		uploadType: "html5",

		postMixInProperties: function(){
			this.inherited(arguments);
			if(this.uploadType === "html5"){ }
		},

		postCreate: function(){
			this.connectForm();
			this.inherited(arguments);
			if(this.uploadOnSelect){
				this.connect(this, "onChange", function(data){
					this.upload(data[0]);
				});
			}
		},

		_drop: function(e){
			rias.event.stopEvent(e);
			var dt = e.dataTransfer;
			this._files = dt.files;
			this.onChange(this.getFileList());
		},

		upload: function(/*Object ? */ formData){
			// summary:
			//		See: dojox.form.Uploader.upload

			this.onBegin(this.getFileList());
			this.uploadWithFormData(formData);
		},

		addDropTarget: function(node, /*Boolean?*/ onlyConnectDrop){
			// summary:
			//		Add a dom node which will act as the drop target area so user
			//		can drop files to this node.
			// description:
			//		If onlyConnectDrop is true, dragenter/dragover/dragleave events
			//		won't be connected to dojo.stopEvent, and they need to be
			//		canceled by user code to allow DnD files to happen.
			//		This API is only available in HTML5 plugin (only HTML5 allows
			//		DnD files).
			if(!onlyConnectDrop){
				this.connect(node, 'dragenter', rias.event.stopEvent);
				this.connect(node, 'dragover', rias.event.stopEvent);
				this.connect(node, 'dragleave', rias.event.stopEvent);
			}
			this.connect(node, 'drop', '_drop');
		},

		uploadWithFormData: function(/*Object*/ data){
			// summary:
			//		Used with WebKit and Firefox 4+
			//		Upload files using the much friendlier FormData browser object.
			// tags:
			//		private

			if(!this.getUrl()){
				console.error("No upload url found.", this);
				return;
			}
			var fd = new FormData(),
				fieldName = this._getFileFieldName();
			rias.forEach(this._files, function(f, i){
				fd.append(fieldName, f);
			}, this);

			if(data){
				data.uploadType = this.uploadType;
				for(var nm in data){
					fd.append(nm, data[nm]);
				}
			}

			var xhr = this.createXhr();
			xhr.send(fd);
		},

		_xhrProgress: function(evt){
			if(evt.lengthComputable){
				var o = {
					bytesLoaded: evt.loaded,
					bytesTotal: evt.total,
					type: evt.type,
					timeStamp: evt.timeStamp
				};
				if(evt.type == "load"){
					// 100%
					o.percent = "100%";
					o.decimal = 1;
				}else{
					o.decimal = evt.loaded / evt.total;
					o.percent = Math.ceil((evt.loaded / evt.total) * 100) + "%";
				}
				this.onProgress(o);
			}
		},

		createXhr: function(){
			var xhr = new XMLHttpRequest();
			var timer;
			xhr.upload.addEventListener("progress", rias.hitch(this, "_xhrProgress"), false);
			xhr.addEventListener("load", rias.hitch(this, "_xhrProgress"), false);
			xhr.addEventListener("error", rias.hitch(this, function(evt){
				this.onError(evt);
				clearInterval(timer);
			}), false);
			xhr.addEventListener("abort", rias.hitch(this, function(evt){
				this.onAbort(evt);
				clearInterval(timer);
			}), false);
			xhr.onreadystatechange = rias.hitch(this, function(){
				if(xhr.readyState === 4){
					//console.info("Uploader COMPLETE")
					clearInterval(timer);
					try{
						if(rias.xhr.checkStatus(xhr.status)){
							this.onComplete(JSON.parse(xhr.responseText.replace(/^\{\}&&/,'')));
						}else{
							rias.xhr.error(xhr, {});
							this.onError(xhr.responseText);
						}
					}catch(e){
						var msg = "Error parsing server result:";
						console.error(msg, e);
						console.error(xhr.responseText);
						this.onError(msg, e);
					}
				}
			});
			xhr.open("POST", this.getUrl());
			xhr.setRequestHeader("Accept","application/json");

			timer = setInterval(rias.hitch(this, function(){
				try{
					if(typeof(xhr.statusText)){} // accessing this error throws an error. Awesomeness.
				}catch(e){
					//this.onError("Error uploading file."); // not always an error.
					clearInterval(timer);
				}
			}),250);

			return xhr;
		}

	});

	var IFrame = rias.declare("rias.riasw.form.uploader.IFrame", [], {
		postMixInProperties: function(){
			this.inherited(arguments);
			if(this.uploadType === "iframe"){
				this.uploadType = "iframe";
				this.upload = this.uploadIFrame;
			}
		},

		uploadIFrame: function(data){
			// summary:
			//		Internal. You could use this, but you should use upload() or submit();
			//		which can also handle the post data.

			var formObject = {},
				sendForm,
				form = this.getForm(),
				url = this.getUrl(),
				self = this;
			data = data || {};
			data.uploadType = this.uploadType;

			// create a temp form for which to send data
			//enctype can't be changed once a form element is created
			sendForm = rias.dom.place('<form enctype="multipart/form-data" method="post"></form>', this.domNode);
			rias.forEach(this._inputs, function(n, i){
				// don't send blank inputs
				if(n.value !== ''){
					sendForm.appendChild(n);
					formObject[n.name] = n.value;
				}
			}, this);

			// add any extra data as form inputs
			if(data){
				//formObject = rias.dom.form.toObject(form);
				for(var nm in data){
					if(formObject[nm] === undefined){
						rias.dom.create('input', {name:nm, value:data[nm], type:'hidden'}, sendForm);
					}
				}
			}

			rias.xhr.post(url, {
				form: sendForm,
				handleAs: "json",
				content: data
			}).then(function(result){
					rias.dom.destroy(sendForm);
					if(result["ERROR"] || result["error"]){
						self.onError(result);
					}else{
						self.onComplete(result);
					}
				}, function(err){
					console.error('error parsing server result', err);
					rias.dom.destroy(sendForm);
					self.onError(err);
				});
		}
	});

	//rias.loadThemeCss(["dojox/form/resources/FileInput.css"]);

	var riaswType = "rias.riasw.form.Uploader";
	var Widget = rias.declare(riaswType, [Button, UploaderMixin, _WidgetsInTemplateMixin, HTML5, IFrame], {
		// summary:
		//		A widget that creates a stylable file-input button, with optional multi-file selection,
		//		using only HTML elements. Non-HTML5 browsers have fallback options of an iframe.
		//
		// description:
		//		A bare-bones, stylable file-input button, with optional multi-file selection. The list
		//		of files is not displayed, that is for you to handle by connecting to the onChange
		//		event, or use the dojox.form.uploader.FileList.
		//
		//		Uploader without plugins does not have any ability to upload - it is for use in forms
		//		where you handle the upload either by a standard POST or with Ajax using an iFrame. This
		//		class is for convenience of multiple files only. No progress events are available.
		//
		//		If the browser supports a file-input with the "multiple" attribute, that will be used.
		//		If the browser does not support "multiple" (ergo, IE) multiple inputs are used,
		//		one for each selection.
		//
		//		Version: 1.6
	
	
		// uploadOnSelect: Boolean
		//		If true, uploads immediately after a file has been selected. If false,
		//		waits for upload() to be called.
		uploadOnSelect: false,
	
		// tabIndex: Number|String
		//		The tab order in the DOM.
		tabIndex: 0,
	
		// multiple: Boolean
		//		If true and flash mode, multiple files may be selected from the dialog.
		multiple: false,
	
		// label: String
		//		The text used in the button that when clicked, opens a system Browse Dialog.
		label: rias.i18n.action.select,
	
		// url: String
		//		The url targeted for upload. An absolute URL is preferred. Relative URLs are
		//		changed to absolute.
		url: "",
	
		// name: String
		//		The name attribute needs to end with square brackets: [] as this is the standard way
		//		of handling an attribute "array". This requires a slightly different technique on the
		//		server.
		name: "uploadedfile",
		accept: "",
	
		//	force: String
		//		options: form, html5, iframe
		//		Empty string defaults to html5 if available, and iframe if not.
		//		Use "iframe" to always use an iframe, and never html5. Sometimes preferred
		//		for consistent results.
		//		Use "form" to not use ajax and post to a page.
		force: "",
	
		// uploadType: String [readonly]
		//		The type of uploader being used. As an alternative to determining the upload type on the
		//		server based on the fieldName, this property could be sent to the server to help
		//		determine what type of parsing should be used.
		//		This is set based on the force property and what features are available in the browser.
		uploadType: "",
	
		// showInput: String [const]
		//		Position to show an input which shows selected filename(s). Possible
		//		values are "before", "after", which specifies where the input should
		//		be placed with reference to the containerNode which contains the
		//		label). By default, this is empty string (no such input will be
		//		shown). Specify showInput="before" to mimic the look&feel of a
		//		native file input element.
		showInput: "",
		
		//	focusedClass: String
		//		The class applied to the button when it is focused (via TAB key)
		focusedClass: "riaswButtonHover",
	
		_nameIndex: 0,
	
		templateString:
			'<span role="button" data-dojo-attach-point="focusNode,buttonNode" class="dijitReset dijitInline" data-dojo-attach-event="ondijitclick:_onClick" aria-labelledby="${id}_label">' +
				'<span data-dojo-attach-point="badgeNode" class="${badgeClass}"></span>'+
				'<span class="dijitInline dijitIcon riaswButtonIconNode" data-dojo-attach-point="iconNode"></span>' +
				//'<span class="riaswToggleButtonIconChar">&#x25CF;</span>' +
				'<span class="dijitInline riaswButtonText" id="${id}_label" data-dojo-attach-point="containerNode,titleNode,labelNode"></span>' +
				'<input data-dojo-attach-point="valueNode" class="dijitOffScreen" tabIndex="-1" ${!nameAttrSetting} type="${type}" value="${value}"/>' +
			 '</span>',

		//baseClass: 'riaswUploader ' + Button.prototype.baseClass,
	
		postMixInProperties: function(){
			this._inputs = [];
			this._cons = [];
			this.force = this.force.toLowerCase();
			if(this.supports("multiple")){
				this.uploadType = this.force === 'form' ? 'form' : 'html5';
			}else{
				this.uploadType = 'iframe';
			}
			
			this.inherited(arguments);
		},
		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.setStyle(this.domNode, {
				overflow: "hidden",
				position: "relative"
			});
			this._buildDisplay();
			//change the button node not occupy tabIndex: the real file input
			//will have tabIndex set
			rias.dom.setAttr(this.focusNode, 'tabIndex', -1);
		},
		_buildDisplay: function(){
			if(this.showInput){
				this.displayInput = rias.dom.create('input', {
						'class': 'dijitUploadDisplayInput',
						'tabIndex': -1,
						'autocomplete':'off',
						'role': 'presentation'
					},
					this.labelNode, this.showInput);
				//schedule the attachpoint to be cleaned up on destroy
				this._attachPoints.push('displayInput');
				this.connect(this,'onChange', function(files){
					var i = 0,
						l = files.length,
						f, r = [];
					while((f = files[i++])){
						if(f && f.name){
							r.push(f.name);
						}
					}
					this.displayInput.value = r.join(', ');
				});
				this.connect(this,'reset', function(){
					this.displayInput.value = '';
				});
			}
		},
	
		startup: function(){
			if(this._buildInitialized){
				return;
			}
			this._buildInitialized = true;
			this._getButtonStyle(this.domNode);
			this._setButtonStyle();
			this.inherited(arguments);
		},
	
		/* Public Events */

		onChange: function(/*Array*/ fileArray){
			// summary:
			//		stub to connect
			//		Fires when files are selected
			//		Event is an array of last files selected
		},
	
		onBegin: function(/*Array*/ dataArray){
			// summary:
			//		Fires when upload begins
		},
	
		onProgress: function(/*Object*/ customEvent){
			// summary:
			//		Stub to connect
			//		Fires on upload progress. Event is a normalized object of common properties
			//		from HTML5 uploaders. Will not fire for IFrame.
			// customEvent:
			//		- bytesLoaded: Number:
			//			Amount of bytes uploaded so far of entire payload (all files)
			//		- bytesTotal: Number:
			//			Amount of bytes of entire payload (all files)
			//		- type: String:
			//			Type of event (progress or load)
			//		- timeStamp: Number:
			//			Timestamp of when event occurred
		},
	
		onComplete: function(/*Object*/ customEvent){
			// summary:
			//		stub to connect
			//		Fires when all files have uploaded
			//		Event is an array of all files
			this.reset();
		},
	
		onCancel: function(){
			// summary:
			//		Stub to connect
			//		Fires when dialog box has been closed
			//		without a file selection
		},
	
		onAbort: function(){
			// summary:
			//		Stub to connect
			//		Fires when upload in progress was canceled
		},

		onError: function(/*Object or String*/ evtObject){
			// summary:
			//		Fires on errors

			// FIXME: Unsure of a standard form of error events
		},

		/* Public Methods */
	
		upload: function(/*Object?*/ formData){				
			// summary:
			//		When called, begins file upload. Only supported with plugins.
			formData = formData || {};
			formData.uploadType = this.uploadType;
			this.inherited(arguments);
		},
	
		submit: function(/*form Node?*/ form){
			// summary:
			//		If Uploader is in a form, and other data should be sent along with the files, use
			//		this instead of form submit.
			form = !!form ? form.tagName ? form : this.getForm() : this.getForm();
			var data = rias.dom.form.toObject(form);
			data.uploadType = this.uploadType;
			this.upload(data);
		},
	
		reset: function(){
			// summary:
			//		Resets entire input, clearing all files.
			//		NOTE:
			//		Removing individual files is not yet supported, because the HTML5 uploaders can't
			//		be edited.
			//		TODO:
			//		Add this ability by effectively, not uploading them
			//
			delete this._files;
			this._disconnectButton();
			rias.forEach(this._inputs, rias.dom.destroy);
			this._inputs = [];
			this._nameIndex = 0;
			this._createInput();
		},
	
		getFileList: function(){
			// summary:
			//		Returns a list of selected files.
	
			var fileArray = [];
			if(this.supports("multiple")){
				rias.forEach(this._files, function(f, i){
					fileArray.push({
						index: i,
						name: f.name,
						size: f.size,
						type: f.type
					});
				}, this);
			}else{
				rias.forEach(this._inputs, function(n, i){
					if(n.value){
						fileArray.push({
							index: i,
							name: n.value.substring(n.value.lastIndexOf("\\") + 1),
							size: 0,
							type: n.value.substring(n.value.lastIndexOf(".") + 1)
						});
					}
				}, this);
	
			}
			return fileArray; // Array
		},
	
		/*  Private Property. Get off my lawn. */
	
		_getValueAttr: function(){
			// summary:
			//		Internal. To get disabled use: uploader.get("disabled");
			return this.getFileList();
		},
	
		_setValueAttr: function(disabled){
			console.error("Uploader value is read only");
		},
	
		_setDisabledAttr: function(disabled){
			// summary:
			//		Internal. To set disabled use: uploader.set("disabled", true);
			if(this.disabled == disabled || !this.inputNode){
				return;
			}
			this.inherited(arguments);
			rias.dom.setStyle(this.inputNode, "display", disabled ? "none" : "");
		},
	
		_getButtonStyle: function(node){
			this.btnSize = {
				w: rias.dom.getStyle(node, 'width'),
				h: rias.dom.getStyle(node, 'height')
			};
		},
	
		_setButtonStyle: function(){
			this.inputNodeFontSize = Math.max(2, Math.max(Math.ceil(this.btnSize.w / 60), Math.ceil(this.btnSize.h / 15)));
			this._createInput();
		},
	
		_getFileFieldName: function(){
			var name;
			if(this.supports("multiple") && this.multiple){
				name = this.name+"s[]";
			}else{
				// <=IE8
				name = this.name + (this.multiple ? this._nameIndex : "");
			}
			return name;
		},
	
		_createInput: function(){
			if(this._inputs.length){
				rias.dom.setStyle(this.inputNode, {
					top:"500px"
				});
				this._disconnectButton();
				this._nameIndex++;
			}
			var name = this._getFileFieldName();
			// reset focusNode to the inputNode, so when the button is clicked,
			// the focus is properly moved to the input element
			this.focusNode = this.inputNode = rias.dom.create("input", {
				type:"file",
				name:name,
				"aria-labelledby": this.id + "_label"
			}, this.domNode, "first");
			if(this.supports("multiple") && this.multiple){
				rias.dom.setAttr(this.inputNode, "multiple", true);
			}
			if(this.accept){
				rias.dom.setAttr(this.inputNode, "accept", this.accept);
			}
			this._inputs.push(this.inputNode);

			rias.dom.setStyle(this.inputNode, {
				position: "absolute",
				fontSize: this.inputNodeFontSize + "em",
				top: "-3px",
				right: "-3px",
				opacity: 0
			});
			this._connectButton();
		},
	
		_connectButton: function(){
			var self = this;
			this._cons.push(rias.on(this.inputNode, "change", function(evt){
				self._files = self.inputNode.files;
				self.onChange(self.getFileList(evt));
				if(!self.supports("multiple") && self.multiple){
					self._createInput();
				}
			}));
	
			if(this.tabIndex > -1){
				this.inputNode.tabIndex = this.tabIndex;
	
				this._cons.push(rias.on(this.inputNode, "focus", function(){
					rias.dom.addClass(self.domNode, self.focusedClass);
				}));
				this._cons.push(rias.on(this.inputNode, "blur", function(){
					rias.dom.removeClass(self.domNode, self.focusedClass);
				}));
			}
		},
	
		_disconnectButton: function(){
			rias.forEach(this._cons, function(handle){
				handle.remove();
			});
			this._cons.splice(0, this._cons.length);
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswUploaderIcon",
		iconClass16: "riaswUploaderIcon16",
		defaultParams: {
			//content: "<input></input>",
			type: "text",
			label: rias.i18n.action.select,
			cancelText: rias.i18n.action.cancel
		},
		initialSize: {},
		resizable: "width",
		//allowedChild: "",
		"property": {
			"name": {
				"datatype": "string",
				"defaultValue": "uploadFiles",
				"title": "Name"
			},
			"value": {
				"datatype": "string",
				"title": "Value"
			},
			"disabled": {
				"datatype": "boolean",
				"title": "Disabled"
			},
			"readOnly": {
				"datatype": "boolean",
				"hidden": true
			},
			"label": {
				"datatype": "string",
				"defaultValue": "Select...",
				"title": "Label"
			},
			"cancelText": {
				"datatype": "string",
				"defaultValue": "Cancel",
				"title": "Cancel Text"
			}
		}
	};

	return Widget;

});
