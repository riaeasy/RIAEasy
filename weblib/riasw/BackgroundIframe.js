define([
	"riasw/hostDojo"
], function(rias){

	// module:
	//		riasw/BackgroundIFrame

	// Flag for whether to create background iframe behind popups like Menus and Dialog.
	// A background iframe is useful to prevent problems with popups appearing behind applets/pdf files,
	// and is also useful on older versions of IE (IE6 and IE7) to prevent the "bleed through select" problem.
	// By default, it's enabled for IE6-11, excluding Windows Phone 8,
	// TODO: For 2.0, make this false by default.  Also, possibly move definition to has.js so that this module can be
	// conditionally required via  dojo/has!bgIfame?riasw/BackgroundIframe

	var has = rias.has;

	has.add("config-bgIframe",
		(has("ie") || has("trident")) && !/IEMobile\/10\.0/.test(navigator.userAgent)); // No iframe on WP8, to match 1.9 behavior

	var _frames = new function(){
		// summary:
		//		cache of iframes

		var queue = [];

		this.pop = function(){
			var iframe;
			if(queue.length){
				iframe = queue.pop();
				iframe.style.display="";
			}else{
				// transparency needed for DialogUnderlay and for tooltips on IE (to see screen near connector)
				if(has("ie") < 9){
					var burl = rias.config.dojoBlankHtmlUrl || rias.toUrl("dojo/resources/blank.html") || "javascript:\"\"";
					var html="<iframe src='" + burl + "' role='presentation'"
						+ " style='position: absolute; left: 0px; top: 0px;"
						+ "z-index: -1; filter:Alpha(Opacity=\"0\");'>";
					iframe = document.createElement(html);
				}else{
					iframe = rias.dom.create("iframe");
					iframe.src = 'javascript:""';
					iframe.className = "riaswBackgroundIframe";
					iframe.setAttribute("role", "presentation");
					rias.dom.setStyle(iframe, "opacity", 0.1);
				}
				iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didn't work.
			}
			return iframe;
		};

		this.push = function(iframe){
			iframe.style.display="none";
			queue.push(iframe);
		};
	}();


	var BackgroundIframe = function(/*DomNode*/ node){
		// summary:
		//		For IE/FF z-index shenanigans. id attribute is required.
		//
		// description:
		//		new riasw.BackgroundIframe(node).
		//
		//		Makes a background iframe as a child of node, that fills
		//		area (and position) of node

		if(!node.id){
			throw new Error("no id");
		}
		if(has("config-bgIframe")){
			var iframe = (this.iframe = _frames.pop());
			node.appendChild(iframe);
			if(has("ie") < 7 || has("quirks")){
				this.resize(node);
				this._conn = rias.on(node, 'resize', rias.hitch(this, "resize", node));
			}else{
				rias.dom.setStyle(iframe, {
					width: '100%',
					height: '100%'
				});
			}
		}
	};

	rias.prototypeExtend(BackgroundIframe, {
		resize: function(node){
			// summary:
			//		Resize the iframe so it's the same size as node.
			//		Needed on IE6 and IE/quirks because height:100% doesn't work right.
			if(this.iframe){
				rias.dom.setStyle(this.iframe, {
					width: node.offsetWidth + 'px',
					height: node.offsetHeight + 'px'
				});
			}
		},
		destroy: function(){
			///注意：没有继承自 Destroyable
			// summary:
			//		destroy the iframe
			if(this._conn){
				this._conn.remove();
				this._conn = null;
			}
			if(this.iframe){
				this.iframe.parentNode.removeChild(this.iframe);
				_frames.push(this.iframe);
				delete this.iframe;
			}
		}
	});

	return BackgroundIframe;
});
