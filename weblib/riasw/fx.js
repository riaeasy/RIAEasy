
//RIAStudio Client fx.
///TODO:zensst. 加入 dojox/css3/fx 和 dojox/css3/transit

define([
	"riasw/hostDojo",

	"dojo/_base/fx",
	"dojo/fx",
	"dojo/fx/easing",
	"dojo/fx/Toggler"
], function(rias, basefx, dojoFx, fxEasing, fxToggler) {

	var fx = rias.getObject("fx", true, rias),
		_dom = rias.dom;

	basefx._Line = function(start, end){
		this.start = start;
		this.end = end;

		var isArray = rias.isArray(start),
			d = (isArray ? [] : end - start);

		if(isArray){
			// multi-dimensional branch
			rias.forEach(this.start, function(s, i){
				d[i] = this.end[i] - s;
			}, this);

			this.getValue = function(/*float*/ n){
				var res = [];
				rias.forEach(this.start, function(s, i){
					res[i] = (d[i] * n) + s;
				}, this);
				return res; // Array
			};
		}else{
			// single value branch, document here for both branches:
			this.getValue = function(/*float*/ n){
				// summary:
				//		Returns the point on the line, or an array of points
				// n:
				//		a floating point number greater than 0 and less than 1
				// returns: Mixed
				return (d * n) + this.start; // Decimal
			};
		}
	};
	basefx.animateProperty = function(/*__AnimArgs*/ args){
		var node = args.node = _dom.byId(args.node),
			box = {
				top: node.offsetTop,
				left: node.offsetLeft,
				height: node.offsetHeight,
				width: node.offsetWidth
			},
			v;
		if(!args.easing){
			args.easing = basefx._defaultEasing;
		}

		var anim = new basefx.Animation(args),
			_hBegin = rias.after(anim, "beforeBegin", function(){
				var pm = {},
					p, prop,
					cs = _dom.getComputedStyle(node),
					isColor;
				function _getStyle(p){
					// domStyle.get(node, "height") can return "auto" or "" on IE; this is more reliable:
					if(p === "right" || p === "bottom"){
						return node.parentNode.clientWidth - box.left - box.width;
					}
					v = cs[p];
					if(p === "width" || p === "height" || p === "top" || p === "left"){
						if(v === "" || v === "auto"){
							v = {
								top: node.offsetTop,
								left: node.offsetLeft,
								height: node.offsetHeight,
								width: node.offsetWidth
							}[p];
						}else{
							v = rias.dom.toPixelValue(node, v);
						}
						return v;
					}
					return (p === "opacity") ? +v : (isColor ? v : rias.dom.toPixelValue(node, v));
				}
				function getProp(pn, sn){
					var s = {};
					s[sn] = prop[pn];
					rias.theme.testElement(prop[pn].indexOf("%") >= 0 ? node.parentNode : node, s, function(el){
						prop[pn] = rias.dom.toPixelValue(el, _dom.getComputedStyle(el)[sn]);
					});
				}
				for(p in anim.properties){
					if(anim.properties.hasOwnProperty(p)){
						prop = anim.properties[p];
						if(prop == undefined){
							continue;
						}
						if(rias.isFunction(prop)){
							prop = prop(node);
						}
						prop = pm[p] = rias.mixinDeep({}, (rias.isObject(prop) ? prop: {
							end: prop
						}));
						if(rias.isFunction(prop.start)){
							prop.start = prop.start(node);
						}
						if(rias.isFunction(prop.end)){
							prop.end = prop.end(node);
						}
						if(prop.end == undefined){
							prop.end = _getStyle(p);
						}
						if(prop.start == undefined){
							prop.start = _getStyle(p);
						}

						if(p === "width" || p === "height" || p === "top" || p === "left" || p === "right" || p === "bottom"){
							if(node.display !== "block"){
								node.display = "block";
							}
							if(rias.isString(prop.start) && prop.start !== "" && prop.start !== "auto"){
								getProp("start", p);
							}
							if(rias.isString(prop.end) && prop.end !== "" && prop.end !== "auto"){
								getProp("end", p);
							}
						}

						isColor = (p.toLowerCase().indexOf("color") >= 0);
						if(isColor){
							prop.start = new rias.Color(prop.start);
							prop.end = new rias.Color(prop.end);
						}else{
							prop.start = (p === "opacity") ? +prop.start : rias.dom.toPixelValue(node, prop.start);
							prop.end = (p === "opacity") ? +prop.end : rias.dom.toPixelValue(node, prop.end);
						}
					}
				}
				anim.curve = new basefx.PropLine(pm);

				_hBegin.remove();
				//_hBegin = undefined;

			}, true),
			_hAnimate = rias.after(anim, "onAnimate", function(value){
				//console.debug(value);
				_dom.setStyle(node, value);
			}, true),
			_hStop = rias.after(anim, "onStop", function(){
				_hAnimate.remove();
				//_hAnimate = undefined;
				_hStop.remove();
				//_hStop = undefined;
				_hEnd.remove();
				//_hEnd = undefined;
			}, true),
			_hEnd = rias.after(anim, "onEnd", function(){
				_hAnimate.remove();
				//_hAnimate = undefined;
				_hStop.remove();
				//_hStop = undefined;
				_hEnd.remove();
				//_hEnd = undefined;
			}, true);

		return anim; // Animation
	};
	basefx.PropLine = function(properties){
		// PropLine is an internal class which is used to model the values of
		// an a group of CSS properties across an animation lifecycle. In
		// particular, the "getValue" function handles getting interpolated
		// values between start and end for a particular CSS value.
		var p, prop;
		this._properties = properties;
		for(p in properties){
			if(properties.hasOwnProperty(p)){
				prop = properties[p];
				if(prop.start instanceof rias.Color){
					// create a reusable temp color object to keep intermediate results
					prop.tempColor = new rias.Color();
				}
			}
		}
	};
	basefx.PropLine.prototype.getValue = function(r){
		var p, prop, start,
			ret = {};
		for(p in this._properties){
			if(this._properties.hasOwnProperty(p)){
				prop = this._properties[p];
				start = prop.start;
				if(start instanceof rias.Color){
					ret[p] = rias.Color.blendColors(start, prop.end, r, prop.tempColor).toCss();
				}else if(!rias.isArray(start)){
					ret[p] = ((prop.end - start) * r) + start + (p !== "opacity" ? prop.units || "px" : 0);
				}
			}
		}
		return ret;
	};

	// the local timer, stubbed into all Animation instances
	var ctr = 0,
		timer = null,
		runner = {
			run: function(){}
		};
	rias.prototypeExtend(basefx.Animation, {
		// rate: Integer?
		//		the time in milliseconds to wait before advancing to next frame
		//		(used as a fps timer: 1000/rate = fps)
		rate: 50 /* 20 fps */,
		_startTimer: function(){
			var self = this;
			if(!this._timer){
				this._timer = rias.after(runner, "run", function(){
					self._cycle();
				}, true);
				ctr++;
			}
			if(!timer){
				timer = setInterval(function(){
					runner.run();
				}, this.rate);
			}
		},

		_stopTimer: function(){
			if(this._timer){
				this._timer.remove();
				this._timer = null;
				ctr--;
			}
			if(ctr <= 0){
				clearInterval(timer);
				timer = null;
				ctr = 0;
			}
		},

		_fire: function(/*Event*/ evt, /*Array?*/ args){
			// summary:
			//		Convenience function.  Fire event "evt" and pass it the
			//		arguments specified in "args".
			// description:
			//		Convenience function.  Fire event "evt" and pass it the
			//		arguments specified in "args".
			//		Fires the callback in the scope of this Animation
			//		instance.
			// evt:
			//		The event to fire.
			// args:
			//		The arguments to pass to the event.
			var a = args || [];
			if(this[evt]){
				if(rias.config.debugAtAllCosts){
					this[evt].apply(this, a);
				}else{
					try{
						this[evt].apply(this, a);
					}catch(e){
						// squelch and log because we shouldn't allow exceptions in
						// synthetic event handlers to cause the internal timer to run
						// amuck, potentially pegging the CPU. I'm not a fan of this
						// squelch, but hopefully logging will make it clear what's
						// going on
						console.error("exception in animation handler for: ", evt, e);
					}
				}
			}
			return this; // Animation
		},
		play: function(/*int?*/ delay, /*Boolean?*/ gotoStart){
			// summary:
			//		Start the animation.
			// delay:
			//		How many milliseconds to delay before starting.
			// gotoStart:
			//		If true, starts the animation from the beginning; otherwise,
			//		starts it from its current position.
			// returns: Animation
			//		The instance to allow chaining.

			var _t = this;
			if(rias.debugStackTrace){
				_t.stack = rias.getStackTrace();
			}
			if(_t._delayTimer){
				_t._clearTimer();
			}
			if(gotoStart){
				_t._stopTimer();
				_t._active = _t._paused = false;
				_t._percent = 0;
			}else if(_t._active && !_t._paused){
				return _t;
			}

			_t._fire("beforeBegin", [_t.node]);

			var de = delay || _t.delay;

			if(de > 0){
				_t._delayTimer = setTimeout(function(){
					_t._play(gotoStart);
				}, de);
				return _t;
			}
			_t._play(gotoStart);
			return _t;	// Animation
		},
		stop: function(/*boolean?*/ gotoEnd){
			// summary:
			//		Stops a running animation.
			// gotoEnd:
			//		If true, the animation will end.
			var _t = this;
			if(_t._delayTimer){
				_t._clearTimer();
			}
			if(!_t._timer){
				return _t; /* Animation */
			}
			_t._stopTimer();
			if(gotoEnd){
				_t._percent = 1;
				//触发 onEnd
				_t._fire("onAnimate", [_t.curve.getValue(_t._getStep())]);
				_t._fire("onEnd", [_t.node]);
			}
			_t._fire("onStop", [_t.curve.getValue(_t._getStep())]);
			_t._active = _t._paused = false;
			return _t; // Animation
		}
	});
	rias.mixin(fx, {
		easing: fxEasing,
		Toggler: fxToggler,
		Animation: basefx.Animation,
		anim: basefx.anim,
		animateProperty: basefx.animateProperty,
		_Line: basefx._Line,
		fadeTo: basefx._fade,
		fadeIn: basefx.fadeIn,
		fadeOut: basefx.fadeOut,
		//	|		var anim = dojoFx.combine([
		//	|			dojoFx.fadeIn({ node: n, duration:700 }),
		//	|			dojoFx.fadeOut({ node: otherNode, duration: 300 })
		//	|		]);
		//	|		aspect.after(anim, "onEnd", function(){
		//	|			// overall animation is done.
		//	|		}, true);
		//	|		anim.play(); // play the animation
		combine: dojoFx.combine,
		//	|		dojoFx.chain([
		//	|			dojoFx.fadeIn({ node:node }),
		//	|			dojoFx.fadeOut({ node:otherNode })
		//	|		]).play();
		chain: dojoFx.chain,
		//chain: function(/*dojo/_base/fx.Animation[]*/ animations){
		//	var a = dojoFx.chain(animations);
		//	a._onAnimate = function(){
		//		this._fire("onAnimate", arguments || []);
		//	};
		//	return a;
		//},
		//	|	.slideTo({ node: node, left:"40", top:"50", units:"px" }).play()
		slideTo: dojoFx.slideTo,
		//blurIn:
		//blurOut:
		//	|		dojoFx.wipeIn({node:"someId"}).play()
		wipeIn: (dojoFx.wipeIn = function(/*Object*/ args){
			// summary:
			//		Expand a node to it's natural height.
			//
			// description:
			//		Returns an animation that will expand the
			//		node defined in 'args' object from it's current height to
			//		it's natural height (with no scrollbar).
			//		Node must have no margin/border/padding.
			//
			// args: Object
			//		A hash-map of standard `dojo/_base/fx.Animation` constructor properties
			//		(such as easing: node: duration: and so on)
			//
			// example:
			//	|	require(["dojo/fx"], function(fx){
			//	|		fx.wipeIn({
			//	|			node:"someId"
			//	|		}).play()
			//	|	});

			var node = args.node = _dom.byId(args.node),
				pn = node.parentNode,///需要缓存，避免 fini 时 node.parentNode 已经变更，比如 TreeNode.collapse
				so, pso,
				fini = function(){
					node.style.height = "";
					node.style.overflow = so;
					pn.style.overflow = pso;
				};

			var anim = basefx.animateProperty(rias.mixin({
				properties: {
					height: {
						// wrapped in functions so we wait till the last second to query (in case value has changed)
						start: function(){
							// start at current [computed] height, but use 1px rather than 0
							// because 0 causes IE to display the whole panel
							if(node.style.visibility === "hidden" || node.style.display === "none"){
								node.style.height = "1px";
								node.style.display = "";
								node.style.visibility = "";
								return 1;
							}else{
								var height = _dom.getStyle(node, "height");
								return Math.max(height, 1);
							}
						},
						end: function(){
							return node.scrollHeight;
						}
					}
				}
			}, args));

			var _hBegin = rias.after(anim, "beforeBegin", function(){
					so = node.style.overflow;
					pso = pn.style.overflow;
					node.style.overflow = "hidden";
					pn.style.overflow = "hidden";
					_hBegin.remove();
					//_hBegin = undefined;
				}, true),
				_hStop = rias.before(anim, "onStop", function(){
					fini();
					_hStop.remove();
					//_hStop = undefined;
				}, true),
				_hEnd = rias.before(anim, "onEnd", function(){
					fini();
					_hEnd.remove();
					//_hEnd = undefined;
				}, true);

			return anim; // dojo/_base/fx.Animation
		}),
		//	|		dojoFx.wipeOut({ node:"someId" }).play()
		wipeOut: (dojoFx.wipeOut = function(/*Object*/ args){
			// summary:
			//		Shrink a node to nothing and hide it.
			//
			// description:
			//		Returns an animation that will shrink node defined in "args"
			//		from it's current height to 1px, and then hide it.
			//
			// args: Object
			//		A hash-map of standard `dojo/_base/fx.Animation` constructor properties
			//		(such as easing: node: duration: and so on)
			//
			// example:
			//	|	require(["dojo/fx"], function(fx){
			//	|		fx.wipeOut({ node:"someId" }).play()
			//	|	});

			var node = args.node = _dom.byId(args.node),
				pn = node.parentNode,///需要缓存，避免 fini 时 node.parentNode 已经变更，比如 TreeNode.collapse
				so, pso,
				fini = function(){
					node.style.display = "none";
					node.style.height = "";
					node.style.overflow = so;
					pn.style.overflow = pso;
				};

			var anim = basefx.animateProperty(rias.mixin({
				properties: {
					height: {
						end: 1 // 0 causes IE to display the whole panel
					}
				}
			}, args));

			var _hBegin = rias.after(anim, "beforeBegin", function(){
					so = node.style.overflow;
					pso = pn.style.overflow;
					node.style.overflow = "hidden";
					pn.style.overflow = "hidden";
					_hBegin.remove();
					//_hBegin = undefined;
				}, true),
				_hStop = rias.before(anim, "onStop", function(){
					fini();
					_hStop.remove();
					//_hStop = undefined;
				}, true),
				_hEnd = rias.before(anim, "onEnd", function(){
					fini();
					_hEnd.remove();
					//_hEnd = undefined;
				}, true);

			return anim; // dojo/_base/fx.Animation
		})//,
		//	|	dojo.fx.sizeTo({
		//	|		node:'myNode',
		//	|		duration: 1000,
		//	|		width: 400,
		//	|		height: 200,
		//	|		method: "combine"
		//	|	}).play();
		//sizeTo: (fxExt.sizeTo = ),
		//	|	dojox.fx.slideBy({
		//	|		node: domNode, duration:400,
		//	|		top: 50, left: -22
		//	|	}).play();
		//slideBy: fxExt.slideBy,
		//crossFade: fxExt.crossFade,
		//	|	dojox.fx.highlight({ node:"foo" }).play();
		//highlight: fxExt.highlight,
		//		|	dojox.fx.wipeTo({ node: "nodeId", height: 200 }).play();
		//wipeTo: fxExt.wipeTo,
		//explode: fxExt.explode,
		//converge: fxExt.converge,
		//disintegrate: fxExt.disintegrate,
		//build: fxExt.build,
		//shear: fxExt.shear,
		//unShear: fxExt.unShear,
		//pinwheel: fxExt.pinwheel,
		//unPinwheel: fxExt.unPinwheel,
		//blockFadeOut: fxExt.blockFadeOut,
		//blockFadeIn: fxExt.blockFadeIn,
		//flip: fxExt.flip,
		//flipCube: fxExt.flipCube,
		//flipPage: fxExt.flipPage,
		//flipGrid: fxExt.flipGrid,
		//smoothScroll: fxExt.smoothScroll
	});
	fx.sizeTo = function(/* Object */args){///修改 两次 begin/end 问题
		// summary:
		//		Creates an animation that will size a node
		//
		// description:
		//		Returns an animation that will size the target node
		//		defined in args Object about it's center to
		//		a width and height defined by (args.width, args.height),
		//		supporting an optional method: chain||combine mixin
		//		(defaults to chain).
		//
		//	- works best on absolutely or relatively positioned elements
		//
		// example:
		//	|	// size #myNode to 400px x 200px over 1 second
		//	|	dojo.fx.sizeTo({
		//	|		node:'myNode',
		//	|		duration: 1000,
		//	|		width: 400,
		//	|		height: 200,
		//	|		method: "combine"
		//	|	}).play();
		//

		var node = args.node = _dom.byId(args.node),
			pn = node.parentNode,///需要缓存，避免 fini 时 node.parentNode 已经变更，比如 TreeNode.collapse
			so, pso,
			fini = function(){
				node.style.overflow = so;
				pn.style.overflow = pso;
			};

		var method = args.method || "chain";
		if(!args.duration){
			args.duration = rias.defaultDuration;
		} // default duration needed
		if(method === "chain"){
			args.duration = Math.floor(args.duration / 2);
		}

		var top, newTop, left, newLeft, width, height = null;

		var init = (function(n){
			return function(){
				var cs = _dom.getComputedStyle(n),
					pos = cs.position,
					w = cs.width,
					h = cs.height;

				top = (pos === "absolute" ? n.offsetTop : parseInt(cs.top) || 0);
				left = (pos === "absolute" ? n.offsetLeft : parseInt(cs.left) || 0);
				width = (w === "auto" ? 0 : parseInt(w));
				height = (h === "auto" ? 0 : parseInt(h));

				newLeft = left - Math.floor((args.width - width) / 2);
				newTop = top - Math.floor((args.height - height) / 2);

				if(pos !== "absolute" && pos !== 'relative'){
					var ret = _dom.getPosition(n, true);///dojox/fx/_base 中为 domStyle.coords，已经废弃
					top = ret.y;
					left = ret.x;
					n.style.position = "absolute";
					n.style.top = top + "px";
					n.style.left = left + "px";
				}
			};
		})(node);
		function _each(a, props){
			rias.forEach(["beforeBegin", "onBegin", "onPlay", "onAnimate", "onPause", "onStop", "onEnd"], function(n){
				a[n] = props[n];
			});
		}

		var anim1 = rias.mixin({
			properties: {
				height: function(){
					init();
					return {
						end: args.height || 0,
						start: height
					};
				},
				top: function(){
					return {
						start: top,
						end: newTop
					};
				}
			}
		}, args);
		_each(anim1, {});
		anim1 = basefx.animateProperty(anim1);
		var anim2 = rias.mixin({
			properties: {
				width: function(){
					return {
						start: width,
						end: args.width || 0
					};
				},
				left: function(){
					return {
						start: left,
						end: newLeft
					};
				}
			}
		}, args);
		_each(anim2, {});
		anim2 = basefx.animateProperty(anim2);

		var anim = fx[(args.method === "combine" ? "combine" : "chain")]([anim1, anim2]);
		_each(anim, args);

		var _hBegin = rias.after(anim, "beforeBegin", function(){
				so = node.style.overflow;
				pso = pn.style.overflow;
				node.style.overflow = "hidden";
				pn.style.overflow = "hidden";
				_hBegin.remove();
				//_hBegin = undefined;
			}, true),
			_hStop = rias.before(anim, "onStop", function(){
				fini();
				_hStop.remove();
				//_hStop = undefined;
			}, true),
			_hEnd = rias.before(anim, "onEnd", function(){
				fini();
				_hEnd.remove();
				//_hEnd = undefined;
			}, true);

		return anim; // dojo.Animation
	};
	fx.slideBy = function(/* Object */args){
		// summary:
		//		Returns an animation to slide a node by a defined offset.
		//
		// description:
		//		Returns an animation that will slide a node (args.node) from it's
		//		current position to it's current posision plus the numbers defined
		//		in args.top and args.left. standard dojo.fx mixin's apply.
		//
		// example:
		//	|	// slide domNode 50px down, and 22px left
		//	|	dojox.fx.slideBy({
		//	|		node: domNode, duration:400,
		//	|		top: 50, left: -22
		//	|	}).play();

		var node = args.node = _dom.byId(args.node),
			top, left;

		var init = (function(n){
			return function(){
				var cs = _dom.getComputedStyle(n);
				var pos = cs.position;
				top = (pos === 'absolute' ? n.offsetTop : parseInt(cs.top) || 0);
				left = (pos === 'absolute' ? n.offsetLeft : parseInt(cs.left) || 0);
				if(pos !== 'absolute' && pos !== 'relative'){
					//var ret = domGeom.coords(n, true);
					var ret = _dom.getPosition(n, true);///dojox/fx/_base 中为 domStyle.coords，已经废弃
					top = ret.y;
					left = ret.x;
					n.style.position = "absolute";
					n.style.top = top + "px";
					n.style.left = left + "px";
				}
			};
		})(node);
		init();

		var _anim = basefx.animateProperty(rias.mixin({
				properties: {
					// FIXME: is there a way to update the _Line after creation?
					// null start values allow chaining to work, animateProperty will
					// determine them for us (except in ie6? -- ugh)
					top: top + (args.top || 0),
					left: left + (args.left || 0)
				}
			}, args)),
			_hBegin = rias.after(_anim, "beforeBegin", function(){
				init();
				_hBegin.remove();
				//_hBegin = undefined;
			}, true);

		return _anim; // dojo.Animation
	};
	fx.crossFade = function(/* Object */args){
		// summary:
		//		Returns an animation cross fading two element simultaneously
		// args:
		//		- args.nodes: Array - two element array of domNodes, or id's
		//
		//		all other standard animation args mixins apply. args.node ignored.

		// simple check for which node is visible, maybe too simple?
		var node1 = args.nodes[0] = _dom.byId(args.nodes[0]),
			op1 = _dom.getStyle(node1, "opacity"),
			node2 = args.nodes[1] = _dom.byId(args.nodes[1]),
			op2 = _dom.getStyle(node2, "opacity");

		return fx.combine([
			basefx[(op1 === 0 ? "fadeIn" : "fadeOut")](rias.mixin({
				node: node1
			}, args)),
			basefx[(op2 === 0 ? "fadeOut" : "fadeIn")](rias.mixin({
				node: node2
			}, args))
		]); // dojo.Animation
	};
	fx.highlight = function(/*Object*/ args){
		// summary:
		//		Highlight a node
		//
		// description:
		//		Returns an animation that sets the node background to args.color
		//		then gradually fades back the original node background color
		//
		// example:
		//	|	dojox.fx.highlight({ node:"foo" }).play();

		var node = args.node = _dom.byId(args.node);

		args.duration = args.duration || rias.defaultDuration;

		// Assign default color light yellow
		var startColor = args.color || '#ffff99',
			endColor = _dom.getStyle(node, "backgroundColor");

		// safari "fix"
		// safari reports rgba(0, 0, 0, 0) (black) as transparent color, while
		// other browsers return "transparent", rendered as white by default by
		// dojo.Color; now dojo.Color maps "transparent" to
		// djConfig.transparentColor ([r, g, b]), if present; so we can use
		// the color behind the effect node
		if(endColor === "rgba(0, 0, 0, 0)"){
			endColor = "transparent";
		}

		var anim = basefx.animateProperty(rias.mixin({
			properties: {
				backgroundColor: {
					start: startColor,
					end: endColor
				}
			}
		}, args));

		if(endColor === "transparent"){
			var _hEnd = rias.after(anim, "onEnd", function(){
				node.style.backgroundColor = endColor;
				_hEnd.remove();
				//_hEnd = undefined;
			}, true);
		}

		return anim; // dojo.Animation
	};
	fx.wipeTo = function(/*Object*/ args){
		// summary:
		//		Animate a node wiping to a specific width or height
		//
		// description:
		//		Returns an animation that will expand the
		//		node defined in 'args' object from it's current to
		//		the height or width value given by the args object.
		//
		//		default to height:, so leave height null and specify width:
		//		to wipeTo a width. note: this may be deprecated by a
		//
		//		Note that the final value should not include
		//		units and should be an integer.  Thus a valid args object
		//		would look something like this:
		//
		//		|	dojox.fx.wipeTo({ node: "nodeId", height: 200 }).play();
		//
		//		Node must have no margin/border/padding, so put another
		//		node inside your target node for additional styling.

		args.node = _dom.byId(args.node);
		var node = args.node,
			s = node.style;

		var dir = (args.width ? "width" : "height"),
			endVal = args[dir],
			props = {};

		props[dir] = {
			// wrapped in functions so we wait till the last second to query (in case value has changed)
			start: function(){
				// start at current [computed] height, but use 1px rather than 0
				// because 0 causes IE to display the whole panel
				s.overflow = "hidden";
				if(s.visibility === "hidden" || s.display === "none"){
					s[dir] = "1px";
					s.display = "";
					s.visibility = "";
					return 1;
				}else{
					var now = _dom.getStyle(node, dir);
					return Math.max(now, 1);
				}
			},
			end: endVal
		};

		var anim = basefx.animateProperty(rias.mixin({
			properties: props
		}, args));

		return anim; // dojo.Animation
	};

	return fx;

});