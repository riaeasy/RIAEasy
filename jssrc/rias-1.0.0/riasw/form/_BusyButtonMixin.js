define([
	"rias"
], function(rias){

	var _BusyButtonMixin = rias.declare("rias.riasw.form._BusyButtonMixin", null, {

		canBusy: true,
		// isBusy: Boolean
		isBusy: false,

		// busyLabel: String
		//		text while button is busy
		busyLabel: "",
		useBusyLabel: false,

		timeout: 200, // timeout, should be controlled by xhr call

		// useIcon: Boolean
		//		use a busy icon
		useIcon: true,

		postMixInProperties: function(){
			this.inherited(arguments);
			if(!this.busyLabel){
				this.busyLabel = rias.i18n.message.loading;
			}
		},
		postCreate: function(){
			// summary:
			//		stores initial label and timeout for reference
			this.inherited(arguments);
			this._label = this.containerNode.innerHTML;
			this._initTimeout = this.timeout;
			//FIXME:zensst.动态改变 label 还有些问题，暂时屏蔽
			//this.__busyImg = new Image();
			//this.__busyImg.style.visibility = "hidden";
			//this.__busyImg.src = this._blankGif;
			//rias.dom.setAttr(this.__busyImg, "id", this.id+"_icon");
			//rias.dom.addClass(this.__busyImg, "riasBusyButtonIcon");
			//this.containerNode.appendChild(this.__busyImg);

			// for initial busy buttons
			if(this.isBusy){
				this._makeBusy(1);
			}
		},
		destroy: function(){
			if(this._timeout){
				clearTimeout(this._timeout);
			}
			if(this.__busyImg){
				this.containerNode.removeChild(this.__busyImg);
				delete this.__busyImg;
			}
			this.inherited(arguments);
		},

		_makeBusy: function(value){
			// summary:
			//		sets state from idle to busy
			if(this.isBusy != value){
				if(value){
					this.isBusy = true;
					this.__disabled0 = this.get("disabled");
					this.set("disabled", true);
					this._setLabel(this.busyLabel, this.timeout);
				}else{
					this.set("disabled", this.__disabled0 ? this.__disabled0 : false);
					this.isBusy = false;
					this._setLabel(this._label);
					if(this._timeout){
						clearTimeout(this._timeout);
					}
					this.timeout = this._initTimeout;
				}
			}
		},

		resetTimeout: function(/*Int*/ timeout){
			// summary:
			//		to reset existing timeout and setting a new timeout
			var self = this;
			if(self._timeout){
				clearTimeout(self._timeout);
			}

			// new timeout
			if(timeout){
				self._timeout = setTimeout(function(){
					self._makeBusy(0);
				}, timeout);
			}else if(timeout == undefined || timeout === 0){
				self._makeBusy(0);
			}
		},

		_setLabel: function(/*String*/ content, /*Int*/ timeout){
			// summary:
			//		setting a label and optional timeout of the labels state

			// this.inherited(arguments); FIXME: throws an Unknown runtime error

			if(this.useBusyLabel){
				this.label = content;
				// Begin IE hack
				// remove children
				/*while(this.containerNode.firstChild){
					this.containerNode.removeChild(this.containerNode.firstChild);
				}
				this.containerNode.innerHTML = this.label;

				if(this.tooltip){
					this.titleNode.title = "";
				}else{
					if(!this.showLabel && !rias.dom.getAttr(this.domNode, "title")){
						this.titleNode.title = rias.trim(this.containerNode.innerText || this.containerNode.textContent || "");
					}
					if(this.titleNode.title && rias.isFunction(this.applyTextDir)){
						this.applyTextDir(this.titleNode, this.titleNode.title);
					}
				}*/
				// End IE hack
			}

			// setting timeout
			if(timeout){
				this.resetTimeout(timeout);
			}else{
				this.timeout = null;
			}

			//动态改变 label 还有些问题，暂时屏蔽
			//if(this.__busyImg){
			//	if(this.useIcon && this.isBusy){
			//		this.__busyImg.style.visibility = "visible";
			//	}else{
			//		this.__busyImg.style.visibility = "hidden";
			//	}
			//}
		},

		_onClick: function(e){
			// summary:
			//		on button click the button state gets changed

			// only do something if button is not busy
			if(!this.isBusy){
				this.inherited(arguments);	// calls onClick()
				if(this.canBusy){
					this._makeBusy(1);
				}
			}
		}
	});

	return _BusyButtonMixin;
});
