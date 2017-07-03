define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/form/Uploader" //FIXME: deprecated.  Use Uploader instead
], function(rias, _Plugin, Uploader) {

	//rias.experimental("dojox.editor.plugins.UploadImage");
	var pluginsName = "riasw.editor.htmleditor.plugins";

	var UploadImage = rias.declare(pluginsName + ".UploadImage", _Plugin, {
		// summary:
		// 		Adds an icon to the Editor toolbar that when clicked, opens a system dialog
		//		Although the toolbar icon is a tiny "image" the uploader could be used for
		//		any file type
		
		tempImageUrl: "",
		iconClassPrefix: "editorIcon",
		useDefaultCommand: false,
		uploadUrl: "",
		button:null,
		label:"Upload",
		
		setToolbar: function(toolbar){
			this.button.destroy();
			this.createFileInput();
			toolbar.addChild(this.button);
		},
		_initButton: function(){
			this.command = "uploadImage";
			this.editor.commands[this.command] = "Upload Image";
			this.inherited("_initButton", arguments);
			delete this.command;
		},
		
		updateState: function(){
			// summary:
			//		Over-ride for button state control for disabled to work.
			this.button.set("disabled", this.get("disabled"));
		},
		
		createFileInput: function(){
			var node = rias.dom.create('span', {innerHTML:"."}, document.body);
			rias.dom.setStyle(node, {
				width:"40px",
				height:"20px",
				paddingLeft:"8px",
				paddingRight:"8px"
			});
			this.button = new Uploader({
				showProgress: true,
				isDebug: true,
				//force: "html",
				uploadUrl: this.uploadUrl,
				uploadOnChange: true,
				selectMultipleFiles: false,
				baseClass: "dojoxEditorUploadNorm",
				hoverClass: "dojoxEditorUploadHover",
				activeClass: "dojoxEditorUploadActive",
				disabledClass: "dojoxEditorUploadDisabled"
			}, node);
			this.after(this.button, "onChange", "insertTempImage", true);
			this.after(this.button, "onComplete", "onComplete", true);
		},
		
		onComplete: function(data,ioArgs,widgetRef){
			data = data[0];
			// Image is ready to insert
			var tmpImgNode = rias.dom.byId(this.currentImageId, this.editor.document);
			var file;
			// download path is mainly used so we can access a PHP script
			// not relative to this file. The server *should* return a qualified path.
			if(this.downloadPath){
				file = this.downloadPath + data.name;
			}else{
				file = data.file;
			}
			
			tmpImgNode.src = file;
			rias.dom.setAttr(tmpImgNode, '_djrealurl', file);

			if(data.width){
				tmpImgNode.width = data.width;
				tmpImgNode.height = data.height;
			}
		},
		
		insertTempImage: function(){
			// summary:
			//		inserting a "busy" image to show something is hapening
			//		during upload and download of the image.
			this.currentImageId = "img_" + (new Date().getTime());
			var iTxt = '<img id="'+this.currentImageId+'" src="' + this.tempImageUrl + '" width="32" height="32"/>';
			this.editor.execCommand('inserthtml', iTxt);
		}
	});

	_Plugin.registry.uploadImage = _Plugin.registry.uploadimage = function(args){
		return new UploadImage(args);
	};

	return UploadImage;
});
