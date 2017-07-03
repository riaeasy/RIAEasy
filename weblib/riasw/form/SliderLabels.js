//RIAStudio client runtime widget - SliderLabels

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/form/HSlider"
], function(rias, _WidgetBase, _TemplatedMixin, HSlider) {

	var riaswType = "riasw.form.SliderLabels";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		Labels for `riasw/form/HSlider(VSlider)`

		templateString: '<div class="riaswRuleContainer riaswRuleLabelsContainer"></div>',

		// values: String[]?
		//		Array of text label to render - evenly spaced from left-to-right or bottom-to-top.
		//		Alternately, minimum and maximum can be specified, to get numeric label.
		values: null,
		steps: -1,///slider.steps
		start: -1,///slider.minimum
		count: -1,///slider.maximum
		sliderPosition: "top",///"top"、"bottom"
		// constraints: Object
		//		pattern, places, lang, et al (see dojo.number) for generated numeric label when values[] are not specified
		constraints: {pattern: "#"},
		// labelStyle: String
		//		CSS style to apply to individual text labels
		labelStyle: "",

		_onDestroy: function(){
			this.inherited(arguments);
			delete this.slider;
		},

		_calcPosition: function(pos){
			// summary:
			//		Returns the value to be used in HTML for the label as part of the left: attribute
			// tags:
			//		protected extension
			return (!this.isVertical ? pos : 100 - pos);
		},
		_genDirectionHTML: function(label){
			// extension point for bidi code
			return "";
		},
		_genHTML: function(pos, label, style){
			return '<div class="riaswRuleLabelContainer" style="' + (!this.isVertical ? "left:" : "top:") + this._calcPosition(pos) + "%;" + this.labelStyle +
				this._genDirectionHTML(label) + '"><div class="riaswRuleLabel"' + (style ? ' style="' + style + '"' : '') + '>' + label + '</div></div>';
		},
		setHTMLs: function(){
			var innerHTML = "",
				values = this.values,
				slider = this.slider,
				start = slider && this.start < 0 ? slider.minimum : this.start,
				count = slider && this.count <= 1 ? slider.maximum - slider.minimum : this.count,
				steps, i, interval, step, v;
			if(start == undefined){
				start = 0;
			}
			if(count == undefined || count <= 1){
				count = 2;
			}
			if(values && values.length){
				for(i = 0; i < values.length; i++){
					v = values[i];
					if(rias.isObject(v)){
						innerHTML += this._genHTML((v.value - start) / count * 100, v.label, rias.dom.styleToString(v.style));
					}else{
						innerHTML += this._genHTML((v - start) / count * 100, v);
					}
				}
			}else{
				steps = slider && this.steps < 1 ? slider.steps : this.steps;
				if(steps == undefined || steps > count){
					steps = count;
				}
				if(steps <= 1){
					steps = 2;
				}
				interval = 100 / steps;
				step = count / steps;
				steps++;///数量需要 +1。
				/// 100 / steps * 100 不一定是 100，所以，最后一个单独处理。
				if(this.isVertical || this.isLeftToRight()){
					for(i = 0; i < steps - 1; i++){
						innerHTML += this._genHTML(interval * i, rias.number.format(start + step * i, this.constraints));
					}
					innerHTML += this._genHTML(100, rias.number.format(start + count, this.constraints));
				}else{
					for(i = 0; i < steps - 1; i++){
						innerHTML += this._genHTML(100 - interval * i, rias.number.format(start + step * i, this.constraints));
					}
					innerHTML += this._genHTML(0, rias.number.format(start, this.constraints));
				}
			}
			this.domNode.innerHTML = innerHTML;
		},

		_onContainerChanged: function(container){
			this.inherited(arguments);
			var slider = rias.is(container, HSlider) ? container : undefined;
			this.slider = slider;
			if(slider){
				this.isVertical = slider._isVertical;
				if(this.sliderPosition === "bottom" || this.sliderPosition === "right"){
					if(slider.bottomDecoration !== this.domNode.parentNode){
						slider.bottomDecoration.appendChild(this.domNode);
					}
				}else if(slider.topDecoration !== this.domNode.parentNode){
					slider.topDecoration.appendChild(this.domNode);
				}
				this.setHTMLs();
			}
		}
	});
	if(rias.has("riasw-bidi")){
		Widget.extend({
			_onSetTextDir: function(textDir){
				this.inherited(arguments);
				rias.query(".riaswRuleLabelContainer", this.domNode).forEach(
					rias.hitch(this, function(labelNode){
						labelNode.style.direction = this.getTextDir(labelNode.innerText || labelNode.textContent || "");
					})
				);
			},
			_genDirectionHTML: function(label){
				return (this.textDir ? ("direction:" + this.getTextDir(label) + ";") : "");
			}
		});
	}


	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//resizable: "none",
		allowedChild: "none",
		allowedParent: "riasw.form.HSlider, riasw.form.HSlider",
		style: "min-width:1em; min-height:1em; width:3em;",
		property: {
			"labelStyle": {
				"datatype": "string",
				"title": "Label Style",
				"description": "CSS style to apply to individual text labels"
			}
		}
	};

	return Widget;

});