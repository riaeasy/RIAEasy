
define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin"
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin){

	var riaswType = "riasw.sys.Logo";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin],{

		templateString:
			"<span class='dijitReset' data-dojo-attach-point='focusNode,buttonNode' role='presentation'>"+
				"<div data-dojo-attach-point='logoNode' class='riaswLogoNode'>" +
					"<span data-dojo-attach-point='logo1' class='riaswLogoPart riaswLogoPart1'></span>"+
					"<span data-dojo-attach-point='logo2' class='riaswLogoPart riaswLogoPart2'></span>"+
					"<span data-dojo-attach-point='logo3' class='riaswLogoPart riaswLogoPart3'></span>"+
					"<span data-dojo-attach-point='logo4' class='riaswLogoPart riaswLogoPart4'></span>"+
					"<span data-dojo-attach-point='logo5' class='riaswLogoPart riaswLogoPart5'></span>"+
				"</div>"+
				//"<span data-dojo-attach-point='labelNode' class='riaswLogoLabel' role='presentation'></span>"+
			"</span>",
		baseClass: "riaswLogo",

		layoutVertical: false,
		iconLayoutTop: false,
		label: "RIAEasy 2017",
		showLabel: true,
		_minFontSize: 13,

		buildRendering:function () {
			this.inherited(arguments);
		},

		isFocusable: function(){
			return false;
		},

		_setIconLayoutTopAttr: function(value){
			value = !!value;
			if(value){
				rias.dom.toggleClass(this.buttonNode, "riaswIconLayoutTop", !!value);
			}
			this._set("iconLayoutTop", value);
		},
		_setLayoutVerticalAttr: function(value){
			value = !!value;
			///注意：riaswDisplayVertical 和 riaswTextVertical 不要跨 Widget，即不要加到 Container.domNode 或 Container.containerNode
			rias.dom.toggleClass(this.domNode, "riaswDisplayVertical", value);
			rias.forEach(this.splitBaseClass(), function(cls){
				rias.dom.toggleClass(this.domNode, cls + "Vertical", value);
			}, this);
			if(this.labelNode){
				rias.dom.toggleClass(this.labelNode, "riaswTextVertical", value);
				this.set("label", this.label);
			}
			this._set("layoutVertical", value);
		},

		_setShowLabelAttr: function(value){
			value = !!value;
			this._set("showLabel", value);
			if(value){
				if(!this.labelNode){
					this.labelNode = rias.dom.place("<span data-dojo-attach-point='labelNode' class='riaswLogoLabel' id='" + this.id + "_label' role='presentation'></span>", this.logoNode, "after");
					this.set("label", this.label);
					this.set("layoutVertical", this.layoutVertical);
				}
			}else{
				if(this.labelNode && this.labelNode !== this._labelNode0){
					rias.dom.destroy(this.labelNode);
					delete this.labelNode;
				}
			}
			if(this.labelNode){
				rias.dom.toggleClass(this.labelNode, "riaswHidden", !value);
			}
		},
		_setLabelAttr: function(value){
			this._set("label", value);
			if(this.labelNode){
				this.labelNode.innerHTML = value;
				//if(this.applyTextDir){
				//	this.applyTextDir(this.labelNode);
				//}
			}
		},

		_resize: function(changeSize){
			var h;
			if(changeSize){
				rias.dom.setMarginBox(this.domNode, changeSize);
				changeSize = rias.dom.getMarginBox(this.domNode);
				h = rias.dom.marginBox2contentBox(this.domNode, changeSize).h;
				rias.dom.setMarginBox(this.logoNode, {
					h: h,
					w: h
				});
				h = rias.max(h * 0.5, this._minFontSize);
				if(this.labelNode){
					this.labelNode.style.fontSize = h + "px";
					this.labelNode.style.lineHeight = h + "px";
				}
			}
			return changeSize;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
			showLabel: {
				datatype: "boolean",
				title: "showLabel"
			}
		}
	};

	return Widget;
});