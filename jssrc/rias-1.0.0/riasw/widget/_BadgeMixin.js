define([
	"rias"
], function(rias){

	rias.theme.loadRiasCss([
		"widget/Badge.css"
	]);

	return rias.declare("rias.riasw.widget._BadgeMixin", null, {

		badgeClass: "riaswBadge",
		badgeStyle: "",
		badgeColor: "",//"blue","green","red"(default)
		badge: "",
		buildRendering: function(){
			this.inherited(arguments);

			this.badgeText = rias.dom.create("span", {
				"class": "riaswBadgeText riaswBadgeRed"
			});
			this.badgeNode.appendChild(this.badgeText);
		},
		postCreate: function(){
			this.inherited(arguments);
			this._initAttr(["badge"]);
		},
		destroy: function(){
			this.inherited(arguments);
			delete this.badgeText;
		},
		_getBadgeStyleAttr: function(){
			return this.badgeStyle;
		},
		_setBadgeStyleAttr: function(/*String*/value){
			var n = this.badgeNode;
			if(rias.isObject(value)){
				rias.dom.setStyle(n, value);
			}else{
				if(n.style.cssText){
					n.style.cssText += "; " + value;
				}else{
					n.style.cssText = value;
				}
			}
			this._set("badgeStyle", value);
		},
		_getBadgeColorAttr: function(){
			return this.badgeColor;
		},
		_setBadgeColorAttr: function(/*String*/value){
			var n = this.badgeText;
			if(rias.isString(value)){
				rias.dom.removeClass(n, "riaswBadgeRed");
				rias.dom.removeClass(n, "riaswBadgeBlue");
				rias.dom.removeClass(n, "riaswBadgeGreen");
				rias.dom.removeClass(n, "riaswBadgeYellow");
				switch(value.charAt(0)){
					case "b":
						rias.dom.addClass(n, "riaswBadgeBlue");
						this._set("badgeColor", "blue");
						break;
					case "g":
						rias.dom.addClass(n, "riaswBadgeGreen");
						this._set("badgeColor", "green");
						break;
					case "y":
						rias.dom.addClass(n, "riaswBadgeYellow");
						this._set("badgeColor", "yellow");
						break;
					default:
						rias.dom.addClass(n, "riaswBadgeRed");
						this._set("badgeColor", "red");
				}
			}else{
				rias.dom.addClass(n, "riaswBadgeRed");
				this._set("badgeColor", "red");
			}
		},
		_getBadgeAttr: function(){
			return this.badgeText ? this.badgeText.innerHTML : "";
		},
		//_setBadgeAttr: function(/*String*/value){
		//	this._set("badge", value);
		//},
		_onBadge: function(value, oldValue){
			var n = this.badgeNode.nextSibling;
			this.badgeText.innerHTML = value;
			rias.dom.toggleClass(this.badgeNode, "riaswBadgeVisible", !!value);
			if(n){
				rias.dom.toggleClass(n, "riaswButtonNodeBadgeStretch", !!value);
			}

		}

	});

});