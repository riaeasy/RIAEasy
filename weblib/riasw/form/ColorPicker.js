define([
	"riasw/riaswBase",
	"dojo/dnd/move",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin",
	"dojo/i18n!./nls/ColorPicker",
	"dojo/i18n!dojo/cldr/nls/number"
], function(rias, move, _WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin){

	var webSafeFromHex = function(hex){
		// stub, this is planned later:
		return hex;
	};

	//rias.theme.loadThemeCss([
	//	"riasw/form/ColorPicker.css"
	//]);

	var riaswType = "riasw.form.ColorPicker";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin], {
		// summary:
		//		a HSV color picker - similar to Photoshop picker
		// description:
		//		Provides an interactive HSV ColorPicker similar to
		//		PhotoShop's color selction tool. This is an enhanced
		//		version of the default riasw.form.ColorPalette, though provides
		//		no accessibility.
		// example:
		// |	var picker = new riasw.form.ColorPicker({
		// |		// a couple of example toggles:
		// |		animatePoint:false,
		// |		showHsv: false,
		// |		webSafe: false,
		// |		showRgb: false
		// |	});
		// example:
		// |	<!-- markup: -->
		// |	<div dojoType="riasw.form.ColorPicker"></div>

		// showRgb: Boolean
		//		show/update RGB input nodes
		showRgb: true,
		// showHsv: Boolean
		//		show/update HSV input nodes
		showHsv: true,
		// showHex: Boolean
		//		show/update Hex value field
		showHex: true,

		// webSafe: Boolean
		//		deprecated? or just use a toggle to show/hide that node, too?
		webSafe: true,
		// animatePoint: Boolean
		//		toggle to use slideTo (true) or just place the cursor (false) on click
		animatePoint: true,
		// slideDuration: Integer
		//		time in ms picker node will slide to next location (non-dragging) when animatePoint=true
		slideDuration: 250,
		// liveUpdate: Boolean
		//		Set to true to fire onChange in an indeterminate way
		liveUpdate: false,

		// PICKER_HUE_H: int
		//		Height of the hue picker, used to calculate popupPositions
		PICKER_HUE_H: 150,
		// PICKER_SAT_VAL_H: int
		//		Height of the 2d picker, used to calculate popupPositions
		PICKER_SAT_VAL_H: 150,
		// PICKER_SAT_VAL_W: int
		//		Width of the 2d picker, used to calculate popupPositions
		PICKER_SAT_VAL_W: 150,
		// PICKER_HUE_SELECTOR_H: int
		//		Height of the hue selector DOM node, used to calc offsets so that selection
		//		is center of the image node.
		PICKER_HUE_SELECTOR_H: 8,
		// PICKER_SAT_SELECTOR_H: int
		//		Height of the saturation selector DOM node, used to calc offsets so that selection
		//		is center of the image node.
		PICKER_SAT_SELECTOR_H: 10,
		// PICKER_SAT_SELECTOR_W: int
		//		Width of the saturation selector DOM node, used to calc offsets so that selection
		//		is center of the image node.
		PICKER_SAT_SELECTOR_W: 10,

		// value: String
		//		Default color for this component. Only hex values are accepted as incoming/returned values.
		value: "#ffffff",

		_underlay: rias.toUrl("riasw/form/ColorPicker/images/underlay.png"),
		_hueUnderlay: rias.toUrl("riasw/form/ColorPicker/images/hue.png"),
		_pickerPointer: rias.toUrl("riasw/form/ColorPicker/images/pickerPointer.png"),
		_huePickerPointer: rias.toUrl("riasw/form/ColorPicker/images/hueHandle.png"),
		_huePickerPointerAlly: rias.toUrl("riasw/form/ColorPicker/images/hueHandleA11y.png"),

		templateString:
			"<div role='region' class='dijitReset' data-dojo-attach-point='containerNode'>"+
				'<table class="riaswColorPickerTable" data-dojo-attach-event="onkeypress: _handleKey" cellpadding="0" cellspacing="0" role="presentation">' +
					'<tr>' +
						'<td valign="top" class="riaswColorPickerRightPad">' +
							'<div class="riaswColorPickerBox">' +
								//<!-- Forcing ABS in style attr due to dojo DND issue with not picking it up form the class. -->
								'<img title="${saturationPickerTitle}" alt="${saturationPickerTitle}" class="riaswColorPickerPoint" src="${_pickerPointer}" tabIndex="0" data-dojo-attach-point="cursorNode" style="position: absolute; top: 0px; left: 0px;">' +
								'<img role="presentation" alt="" data-dojo-attach-point="colorUnderlay" data-dojo-attach-event="onclick: _setPoint, onmousedown: _stopDrag" class="riaswColorPickerUnderlay" src="${_underlay}" ondragstart="return false">' +
							'</div>' +
						'</td>' +
						'<td valign="top" class="riaswColorPickerRightPad">' +
							'<div class="riaswHuePicker">' +
								//<!-- Forcing ABS in style attr due to dojo DND issue with not picking it up form the class. -->
								'<img data-dojo-attach-point="hueCursorNode" tabIndex="0" class="riaswHuePickerPoint" title="${huePickerTitle}" alt="${huePickerTitle}" src="${_huePickerPointer}" style="position: absolute; top: 0px; left: 0px;">' +
								'<div class="riaswHuePickerUnderlay" data-dojo-attach-point="hueNode">' +
									'<img role="presentation" alt="" data-dojo-attach-event="onclick: _setHuePoint, onmousedown: _stopDrag" src="${_hueUnderlay}">' +
								'</div>' +
							'</div>' +
						'</td>' +
						'<td valign="top">' +
							'<table cellpadding="0" cellspacing="0" role="presentation">' +
								'<tr>' +
									'<td valign="top" class="riaswColorPickerPreviewContainer">' +
										'<table cellpadding="0" cellspacing="0" role="presentation">' +
											'<tr>' +
												'<td valign="top" class="riaswColorPickerRightPad">' +
													'<div data-dojo-attach-point="previewNode" class="riaswColorPickerPreview"></div>' +
												'</td>' +
												'<td valign="top">' +
													'<div data-dojo-attach-point="safePreviewNode" class="riaswColorPickerWebSafePreview"></div>' +
												'</td>' +
											'</tr>' +
										'</table>' +
									'</td>' +
								'</tr>' +
								'<tr>' +
									'<td valign="bottom">' +
										'<table class="riaswColorPickerOptional" cellpadding="0" cellspacing="0" role="presentation">' +
											'<tr>' +
												'<td>' +
													'<div class="dijitInline riaswColorPickerRgb" data-dojo-attach-point="rgbNode">' +
														'<table cellpadding="1" cellspacing="1" role="presentation">' +
															'<tr><td><label for="${_uId}_r">${redLabel}</label></td><td><input id="${_uId}_r" data-dojo-attach-point="Rval" size="1" data-dojo-attach-event="onchange: _colorInputChange"></td></tr>' +
															'<tr><td><label for="${_uId}_g">${greenLabel}</label></td><td><input id="${_uId}_g" data-dojo-attach-point="Gval" size="1" data-dojo-attach-event="onchange: _colorInputChange"></td></tr>' +
															'<tr><td><label for="${_uId}_b">${blueLabel}</label></td><td><input id="${_uId}_b" data-dojo-attach-point="Bval" size="1" data-dojo-attach-event="onchange: _colorInputChange"></td></tr>' +
														'</table>' +
													'</div>' +
												'</td>' +
												'<td>' +
													'<div class="dijitInline riaswColorPickerHsv" data-dojo-attach-point="hsvNode">' +
														'<table cellpadding="1" cellspacing="1" role="presentation">' +
															'<tr><td><label for="${_uId}_h">${hueLabel}</label></td><td><input id="${_uId}_h" data-dojo-attach-point="Hval" size="1" data-dojo-attach-event="onchange: _colorInputChange"> ${degLabel}</td></tr>' +
															'<tr><td><label for="${_uId}_s">${saturationLabel}</label></td><td><input id="${_uId}_s" data-dojo-attach-point="Sval" size="1" data-dojo-attach-event="onchange: _colorInputChange"> ${percentSign}</td></tr>' +
															'<tr><td><label for="${_uId}_v">${valueLabel}</label></td><td><input id="${_uId}_v" data-dojo-attach-point="Vval" size="1" data-dojo-attach-event="onchange: _colorInputChange"> ${percentSign}</td></tr>' +
														'</table>' +
													'</div>' +
												'</td>' +
											'</tr>' +
											'<tr>' +
												'<td colspan="2">' +
													'<div class="riaswColorPickerHex" data-dojo-attach-point="hexNode" aria-live="polite">' +
														'<label for="${_uId}_hex">&nbsp;${hexLabel}&nbsp;</label><input id="${_uId}_hex" data-dojo-attach-point="hexCode, focusNode, valueNode" size="6" class="riaswColorPickerHexCode" data-dojo-attach-event="onchange: _colorInputChange">' +
													'</div>' +
												'</td>' +
											'</tr>' +
										'</table>' +
									'</td>' +
								'</tr>' +
							'</table>' +
						'</td>' +
					'</tr>' +
				'</table>' +
			'</div>',

		baseClass: "riaswColorPicker",

		postMixInProperties: function(){
			if(rias.dom.containsClass(rias.dom.docBody, "dijit_a11y")){
				// Use the pointer that will show up in high contrast.
				this._huePickerPointer = this._huePickerPointerAlly;
			}
			this._uId = rias.rt.getUniqueId(this.id);
			rias.mixin(this, rias.i18n.getLocalization("riasw.form", "ColorPicker"));
			rias.mixin(this, rias.i18n.getLocalization("dojo.cldr", "number"));
			this.inherited(arguments);
		},
		_calMetrics: function(){
			var box = rias.dom.getContentBox(this.hueNode);//150,
			this.PICKER_HUE_H = box.h;//150,
			box = rias.dom.getContentBox(this.colorUnderlay);
			this.PICKER_SAT_VAL_H = box.h;//150,
			this.PICKER_SAT_VAL_W = box.w;//150,
			box = rias.dom.getContentBox(this.hueCursorNode);
			this.PICKER_HUE_SELECTOR_H = box.h;//8,
			box = rias.dom.getContentBox(this.cursorNode);
			this.PICKER_SAT_SELECTOR_H = box.h;//10,
			this.PICKER_SAT_SELECTOR_W = box.w;//10,
		},
		postCreate: function(){
			// summary:
			//		As quickly as we can, set up ie6 alpha-filter support for our
			//		underlay.  we don't do image handles (done in css), just the 'core'
			//		of this widget: the underlay.
			this.inherited(arguments);
			this._calMetrics();
			if(rias.has("ie") < 7){
				this.colorUnderlay.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+this._underlay+"', sizingMethod='scale')";
				this.colorUnderlay.src = this._blankGif.toString();
			}
			// hide toggle-able nodes:
			if(!this.showRgb){
				this.rgbNode.style.visibility = "hidden";
			}
			if(!this.showHsv){
				this.hsvNode.style.visibility = "hidden";
			}
			if(!this.showHex){
				this.hexNode.style.visibility = "hidden";
			}
			if(!this.webSafe){
				this.safePreviewNode.style.visibility = "hidden";
			}
		},
		_onDestroy: function(){
			// summary:
			//		Over-ride to clean up subscriptions, etc.
			if(this._timer){
				clearInterval(this._timer);
				this._timer = null;
			}

			rias.forEach(this._subs, function(sub){
				sub.remove();
			});
			delete this._subs;
			if(this._mover){
				this._mover.destroy();
			}
			delete this._mover;
			if(this._hueMover){
				this._hueMover.destroy();
			}
			delete this._hueMover;

			this.inherited(arguments);
		},

		startup: function(){
			if(this._started){
				return;
			}
			this._started = true;
			this.set("value", this.value);
			this._mover = new move.boxConstrainedMoveable(this.cursorNode, {
				box: {
					t: -(this.PICKER_SAT_SELECTOR_H / 2),
					l: -(this.PICKER_SAT_SELECTOR_W / 2),
					w: this.PICKER_SAT_VAL_W,
					h: this.PICKER_SAT_VAL_H
				}
			});

			this._hueMover = new move.boxConstrainedMoveable(this.hueCursorNode, {
				box: {
					t: -(this.PICKER_HUE_SELECTOR_H / 2),
					l: 0,
					w: 0,
					h: this.PICKER_HUE_H
				}
			});

			this._subs = [];
			// no dnd/move/move published ... use a timer:
			this._subs.push(rias.subscribe("/dnd/move/stop", rias.hitch(this, "_clearTimer")));
			this._subs.push(rias.subscribe("/dnd/move/start", rias.hitch(this, "_setTimer")));

			// Bind to up, down, left and right  arrows on the hue and saturation nodes.
			this.own(
				rias.typematic.addKeyListener(this.hueCursorNode,{
					charOrCode: rias.keys.UP_ARROW,
					shiftKey: false,
					metaKey: false,
					ctrlKey: false,
					altKey: false
				}, this, rias.hitch(this, this._updateHueCursorNode), 25, 25),
				rias.typematic.addKeyListener(this.hueCursorNode,{
					charOrCode: rias.keys.DOWN_ARROW,
					shiftKey: false,
					metaKey: false,
					ctrlKey: false,
					altKey: false
				}, this, rias.hitch(this, this._updateHueCursorNode), 25, 25),
				rias.typematic.addKeyListener(this.cursorNode,{
					charOrCode: rias.keys.UP_ARROW,
					shiftKey: false,
					metaKey: false,
					ctrlKey: false,
					altKey: false
				}, this, rias.hitch(this, this._updateCursorNode), 25, 25),
				rias.typematic.addKeyListener(this.cursorNode,{
					charOrCode: rias.keys.DOWN_ARROW,
					shiftKey: false,
					metaKey: false,
					ctrlKey: false,
					altKey: false
				}, this, rias.hitch(this, this._updateCursorNode), 25, 25),
				rias.typematic.addKeyListener(this.cursorNode,{
					charOrCode: rias.keys.LEFT_ARROW,
					shiftKey: false,
					metaKey: false,
					ctrlKey: false,
					altKey: false
				}, this, rias.hitch(this, this._updateCursorNode), 25, 25),
				rias.typematic.addKeyListener(this.cursorNode,{
					charOrCode: rias.keys.RIGHT_ARROW,
					shiftKey: false,
					metaKey: false,
					ctrlKey: false,
					altKey: false
				}, this, rias.hitch(this, this._updateCursorNode), 25, 25)
			);
		},

		_setReadOnlyAttr: function(/*Boolean*/ value){
			function _do1(node){
				rias.dom.setAttr(node, "readOnly", value);
				if(value){
					node.removeAttribute("tabIndex");
				}else{
					node.setAttribute("tabIndex", 0);
				}
				node.style.backgroundColor = value ? "inherit" : "";
			}

			value = !!value;
			this.inherited(arguments);
			_do1(this.Rval);
			_do1(this.Gval);
			_do1(this.Bval);
			_do1(this.Hval);
			_do1(this.Sval);
			_do1(this.Vval);
			_do1(this.hexCode);
		},
		_setDisabledAttr: function(/*Boolean*/ value){
			function _do1(node){
				rias.dom.setAttr(node, "disabled", value);
				if(value){
					node.removeAttribute("tabIndex");
				}else{
					node.setAttribute("tabIndex", 0);
				}
				node.style.backgroundColor = value ? "inherit" : "";
			}

			value = !!value;
			this.inherited(arguments);
			_do1(this.Rval);
			_do1(this.Gval);
			_do1(this.Bval);
			_do1(this.Hval);
			_do1(this.Sval);
			_do1(this.Vval);
			_do1(this.hexCode);
		},
		_setValueAttr: function(value, fireOnChange){
			if(!this._started){
				return;
			}
			if(value == undefined){
				value = "#ffffff";
			}
			this.setColor(value, fireOnChange);
		},
		_updateValue: function(/* rias.Color */col, /* Boolean */fireChange){
			// summary:
			//		updates the value of the widget
			//		can cancel reverse onChange by specifying second param
			var hex = col.toHex();

			this.valueNode.value = hex;
			this._set("value", hex);///触发 on

			// anytime we muck with the color, fire onChange?
			if(fireChange && (!this._timer || this.liveUpdate)){
				this.onChange(hex);
			}
		},
		setColor: function(/* String */col, force){
			// summary:
			//		Set a color on a picker. Usually used to set
			//		initial color as an alternative to passing defaultColor option
			//		to the constructor.
			col = rias.Color.fromString(col);
			this._updatePickerLocations(col);
			this._updateColorInputs(col);
			this._updateValue(col, force);
		},
		_updateColor: function(fireChange){
			// summary:
			//		update the previewNode color, and input values [optional]

			var hueSelCenter = this.PICKER_HUE_SELECTOR_H/2,
				satSelCenterH = this.PICKER_SAT_SELECTOR_H/2,
				satSelCenterW = this.PICKER_SAT_SELECTOR_W/2;

			var _huetop = rias.dom.getStyle(this.hueCursorNode, "top") + hueSelCenter,
				_pickertop = rias.dom.getStyle(this.cursorNode, "top") + satSelCenterH,
				_pickerleft = rias.dom.getStyle(this.cursorNode, "left") + satSelCenterW,
				h = Math.round(360 - (_huetop / this.PICKER_HUE_H * 360)),
				col = rias.Color.fromHsv(h, _pickerleft / this.PICKER_SAT_VAL_W * 100, 100 - (_pickertop / this.PICKER_SAT_VAL_H * 100))
				;

			this._updateColorInputs(col);
			this._updateValue(col, fireChange);

			// update hue, not all the pickers
			if(h !== this._hue){
				this._setHue(h);
			}
		},
		_colorInputChange: function(e){
			// summary:
			//		updates picker position and inputs
			//		according to rgb, hex or hsv input changes
			var col,
				hasit = false;
			switch(e.target){
				//transform to hsv to pixels

				case this.hexCode:
					col = rias.Color.fromString(e.target.value);
					hasit = true;

					break;
				case this.Rval:
				case this.Gval:
				case this.Bval:
					col = rias.Color.fromArray([this.Rval.value, this.Gval.value, this.Bval.value]);
					hasit = true;
					break;
				case this.Hval:
				case this.Sval:
				case this.Vval:
					col = rias.Color.fromHsv(this.Hval.value, this.Sval.value, this.Vval.value);
					hasit = true;
					break;
			}

			if(hasit){
				this._updatePickerLocations(col);
				this._updateColorInputs(col);
				this._updateValue(col, true);
			}
		},

		_setTimer: function(/* dojo/dnd/Mover */mover){
			if(mover.node !== this.cursorNode && mover.node !== this.hueCursorNode){
				return;
			}
			// FIXME: should I assume this? focus on mouse down so on mouse up
			rias.dom.focus(mover.node);
			rias.dom.setSelectable(this.domNode,false);
			this._timer = setInterval(rias.hitch(this, "_updateColor"), 45);
		},
		_clearTimer: function(/* dojo/dnd/Mover */mover){
			if(!this._timer){
				return;
			}
			clearInterval(this._timer);
			this._timer = null;
			this.onChange(this.value);
			rias.dom.setSelectable(this.domNode,true);
		},

		_setHue: function(/* Float */h){
			// summary:
			//		Sets a natural color background for the
			//		underlay image against closest hue value (full saturation)
			// h:
			//		0..360
			rias.dom.setStyle(this.colorUnderlay, "backgroundColor", rias.Color.fromHsv(h, 100, 100).toHex());

		},
		_setHuePoint: function(/* Event */evt){
			// summary:
			//		set the hue picker handle on relative y coordinates

			if(this.disabled || this.readOnly || evt.altKey || evt.ctrlKey || evt.metaKey){
				return;
			}

			//#13268 Fix for IE and Edge, as they don't support evt.layerX/Y
			var selCenter = this.PICKER_HUE_SELECTOR_H / 2;
			var ypos = evt.layerY || (evt.y - evt.target.getBoundingClientRect().top);
			ypos -= selCenter;
			if(this.animatePoint){
				rias.fx.slideTo({
					node: this.hueCursorNode,
					duration:this.slideDuration,
					top: ypos,
					left: 0,
					onEnd: rias.hitch(this, function(){
						this._updateColor(true);
						rias.dom.focus(this.hueCursorNode);
					})
				}).play();
			}else{
				rias.dom.setStyle(this.hueCursorNode, "top", ypos + "px");
				this._updateColor(true);
			}
		},
		_setPoint: function(/* Event */evt){
			// summary:
			//		set our picker point based on relative x/y coordinates

			//	evt.preventDefault();
			if(this.disabled || this.readOnly || evt.altKey || evt.ctrlKey || evt.metaKey){
				return;
			}

			var satSelCenterH = this.PICKER_SAT_SELECTOR_H / 2;
			var satSelCenterW = this.PICKER_SAT_SELECTOR_W / 2;

			//#13268 Fix for IE and Edge, as they don't support evt.layerX/Y

			var newTop = evt.layerY || (evt.y - evt.target.getBoundingClientRect().top);
			newTop -= satSelCenterH;
			var newLeft = evt.layerX || (evt.x - evt.target.getBoundingClientRect().left);
			newLeft -= satSelCenterW;

			if(evt){
				rias.dom.focus(evt.target);
			}

			if(this.animatePoint){
				rias.fx.slideTo({
					node: this.cursorNode,
					duration: this.slideDuration,
					top: newTop,
					left: newLeft,
					onEnd: rias.hitch(this, function(){
						this._updateColor(true); rias.dom.focus(this.cursorNode);
					})
				}).play();
			}else{
				rias.dom.setStyle(this.cursorNode, {
					left: newLeft + "px",
					top: newTop + "px"
				});
				this._updateColor(true);
			}
		},
		_updateHueCursorNode: function(count, node, e){
			// summary:
			//		Function used by the typematic code to handle cursor position and update
			//		via keyboard.
			// count: Number
			//		-1 means stop, anything else is just how many times it was called.
			// node: DomNode
			//		The node generating the event.
			// e: Event
			//		The event.
			if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){
				return;
			}

			if(count !== -1){
				var y = rias.dom.getStyle(this.hueCursorNode, "top");
				var selCenter = this.PICKER_HUE_SELECTOR_H / 2;

				// Account for our offset
				y += selCenter;
				var update = false;
				if(e.charOrCode === rias.keys.UP_ARROW){
					if(y > 0){
						y -= 1;
						update = true;
					}
				}else if(e.charOrCode === rias.keys.DOWN_ARROW){
					if(y < this.PICKER_HUE_H){
						y += 1;
						update = true;
					}
				}
				y -= selCenter;
				if(update){
					rias.dom.setStyle(this.hueCursorNode, "top", y + "px");
				}
			}else{
				this._updateColor(true);
			}
		},
		_updateCursorNode: function(count, node, e){
			// summary:
			//		Function used by the typematic code to handle cursor position and update
			//		via keyboard.
			// count:
			//		-1 means stop, anything else is just how many times it was called.
			// node:
			//		The node generating the event.
			// e:
			//		The event.
			if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){
				return;
			}

			var selCenterH = this.PICKER_SAT_SELECTOR_H / 2;
			var selCenterW = this.PICKER_SAT_SELECTOR_W / 2;

			if(count !== -1){
				var y = rias.dom.getStyle(this.cursorNode, "top");
				var x = rias.dom.getStyle(this.cursorNode, "left");

				// Account for our offsets to center
				y += selCenterH;
				x += selCenterW;

				var update = false;
				if(e.charOrCode === rias.keys.UP_ARROW){
					if(y > 0){
						y -= 1;
						update = true;
					}
				}else if(e.charOrCode === rias.keys.DOWN_ARROW){
					if(y < this.PICKER_SAT_VAL_H){
						y += 1;
						update = true;
					}
				}else if(e.charOrCode === rias.keys.LEFT_ARROW){
					if(x > 0){
						x -= 1;
						update = true;
					}
				}else if(e.charOrCode === rias.keys.RIGHT_ARROW){
					if(x < this.PICKER_SAT_VAL_W){
						x += 1;
						update = true;
					}
				}
				if(update){
					// Account for our offsets to center
					y -= selCenterH;
					x -= selCenterW;
					rias.dom.setStyle(this.cursorNode, "top", y + "px");
					rias.dom.setStyle(this.cursorNode, "left", x + "px");
				}
			}else{
				this._updateColor(true);
			}
		},
		_updatePickerLocations: function(/* rias.Color */col){
			// summary:
			//		update handles on the pickers acording to color values

			var hueSelCenter = this.PICKER_HUE_SELECTOR_H/2,
				satSelCenterH = this.PICKER_SAT_SELECTOR_H/2,
				satSelCenterW = this.PICKER_SAT_SELECTOR_W/2;

			var hsv = col.toHsv(),
				ypos = Math.round(this.PICKER_HUE_H - hsv.h / 360 * this.PICKER_HUE_H) - hueSelCenter,
				newLeft = Math.round(hsv.s / 100 * this.PICKER_SAT_VAL_W) - satSelCenterW,
				newTop = Math.round(this.PICKER_SAT_VAL_H - hsv.v / 100 * this.PICKER_SAT_VAL_H) - satSelCenterH
				;

			if(this.animatePoint){
				rias.fx.slideTo({
					node: this.hueCursorNode,
					duration: this.slideDuration,
					top: ypos,
					left: 0
				}).play();

				rias.fx.slideTo({
					node: this.cursorNode,
					duration: this.slideDuration,
					top: newTop,
					left: newLeft
				}).play();

			}
			else {
				rias.dom.setStyle(this.hueCursorNode, "top", ypos + "px");
				rias.dom.setStyle(this.cursorNode, {
					left: newLeft + "px",
					top: newTop + "px"
				});
			}

			// limit hue calculations to only when it changes
			if(hsv.h !== this._hue){
				this._setHue(hsv.h);
			}

		},
		_updateColorInputs: function(/* rias.Color */ col){
			// summary:
			//		updates color inputs that were changed through other inputs
			//		or by clicking on the picker

			var hex = col.toHex();

			if(this.showRgb){
				this.Rval.value = col.r;
				this.Gval.value = col.g;
				this.Bval.value = col.b;
			}

			if(this.showHsv){
				var hsv = col.toHsv();
				this.Hval.value = Math.round((hsv.h)); // convert to 0..360
				this.Sval.value = Math.round(hsv.s);
				this.Vval.value = Math.round(hsv.v);
			}

			if(this.showHex){
				this.hexCode.value = hex;
			}

			this.previewNode.style.backgroundColor = hex;

			if(this.webSafe){
				this.safePreviewNode.style.backgroundColor = webSafeFromHex(hex);
			}
		},

		_handleKey: function(/* Event */e){
			// TODO: not implemented YET
			// var keys = d.keys;
			if(this.disabled || this.readOnly || e.altKey || e.ctrlKey || e.metaKey){
				return;
			}
		},

		/*focus: function(){
			// summary:
			//		Put focus on this widget, only if focus isn't set on it already.
			if(!this.isDestroyed(true)){
				if(!this.focused){
					rias.dom.focus(this.focusNode);
				}
			}
		},*/

		_stopDrag: function(e){
			// summary:
			//		Function to halt the mouse down default
			//		to disable dragging of images out of the color
			//		picker.
			rias.stopEvent(e);
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		resizable: "none",
		//allowedChild: "",
		"property": {
		}
	};

	return Widget;

});
