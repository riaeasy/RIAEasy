
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/riasw/hostDojo",

	"dojo/_base/fx",
	"dojo/fx",
	"dojo/fx/easing",
	"dojo/fx/Toggler",
	"dojox/fx/_base",
	"dojox/fx/split",
	"dojox/fx/flip",
	"dojox/fx/scroll"
], function(rias, fxbase, fx, fxEasing, fxToggler, fxbasex) {

///fx========================================================///
	rias.defaultDuration = dijit.defaultDuration;
	//rias.fx = fx;
	//rias.fxbase = fxbase;
	rias.extend(fxbase.Animation, {
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
						console.error("exception in animation handler for:", evt, rias.captureStackTrace(e));
					}
				}
			}
			return this; // Animation
		}
	});
	rias.fx = {
		easing: fxEasing,
		Toggler: fxToggler,
		Animation: fxbase.Animation,
		anim: fxbase.anim,
		animateProperty: fxbase.animateProperty,
		_Line: fxbase._Line,
		fadeTo: fxbase._fade,
		fadeIn: fxbase.fadeIn,
		fadeOut: fxbase.fadeOut,
		//	|		var anim = fx.combine([
		//	|			fx.fadeIn({ node: n, duration:700 }),
		//	|			fx.fadeOut({ node: otherNode, duration: 300 })
		//	|		]);
		//	|		aspect.after(anim, "onEnd", function(){
		//	|			// overall animation is done.
		//	|		}, true);
		//	|		anim.play(); // play the animation
		combine: fx.combine,
		//	|		fx.chain([
		//	|			fx.fadeIn({ node:node }),
		//	|			fx.fadeOut({ node:otherNode })
		//	|		]).play();
		chain: fx.chain,
		//	|	.slideTo({ node: node, left:"40", top:"50", units:"px" }).play()
		slideTo: fx.slideTo,
		//	|		fx.wipeIn({node:"someId"}).play()
		wipeIn: fx.wipeIn = function(/*Object*/ args){
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

			var node = args.node = rias.dom.byId(args.node),
				s = node.style, sh = s.height, so = s.overflow,
				fini = function(){
					//s.height = sh;
					s.height = "";
					s.overflow = so;
				};

			var anim = fxbase.animateProperty(rias.mixin({
				properties: {
					height: {
						// wrapped in functions so we wait till the last second to query (in case value has changed)
						start: function(){
							// start at current [computed] height, but use 1px rather than 0
							// because 0 causes IE to display the whole panel
							if(s.visibility == "hidden" || s.display == "none"){
								s.height = "1px";
								s.display = "";
								s.visibility = "";
								return 1;
							}else{
								var height = rias.dom.getStyle(node, "height");
								return Math.max(height, 1);
							}
						},
						end: function(){
							return node.scrollHeight;
						}
					}
				}
			}, args));

			rias.after(anim, "beforeBegin", function(){
				s = node.style;
				sh = s.height;
				so = s.overflow;
				s.overflow = "hidden";
			}, true);
			rias.before(anim, "onStop", fini, true);
			rias.before(anim, "onEnd", fini, true);

			return anim; // dojo/_base/fx.Animation
		},
		//	|		fx.wipeOut({ node:"someId" }).play()
		wipeOut: fx.wipeOut = function(/*Object*/ args){
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

			var node = args.node = rias.dom.byId(args.node),
				s = node.style, sh = s.height, so = s.overflow,
				fini = function(){
					s.overflow = so;
					//s.height = sh;
					s.height = "";
					s.display = "none";
				};

			var anim = fxbase.animateProperty(rias.mixin({
				properties: {
					height: {
						end: 1 // 0 causes IE to display the whole panel
					}
				}
			}, args));

			rias.after(anim, "beforeBegin", function(){
				s = node.style;
				sh = s.height;
				so = s.overflow;
				s.overflow = "hidden";
				s.display = "";
			}, true);
			rias.before(anim, "onStop", fini, true);
			rias.before(anim, "onEnd", fini, true);

			return anim; // dojo/_base/fx.Animation
		},
		//	|	dojo.fx.sizeTo({
		//	|		node:'myNode',
		//	|		duration: 1000,
		//	|		width: 400,
		//	|		height: 200,
		//	|		method: "combine"
		//	|	}).play();
		sizeTo: fxbasex.sizeTo = function(/* Object */args){///修改 两次 begin/end 问题
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

			var node = args.node = rias.dom.byId(args.node),
				abs = "absolute";

			var method = args.method || "chain";
			if(!args.duration){
				args.duration = 500;
			} // default duration needed
			if(method == "chain"){
				args.duration = Math.floor(args.duration / 2);
			}

			var top, newTop, left, newLeft, width, height = null;

			var init = (function(n){
				return function(){
					var cs = rias.dom.getComputedStyle(n),
						pos = cs.position,
						w = cs.width,
						h = cs.height
						;

					top = (pos == abs ? n.offsetTop : parseInt(cs.top) || 0);
					left = (pos == abs ? n.offsetLeft : parseInt(cs.left) || 0);
					width = (w == "auto" ? 0 : parseInt(w));
					height = (h == "auto" ? 0 : parseInt(h));

					newLeft = left - Math.floor((args.width - width) / 2);
					newTop = top - Math.floor((args.height - height) / 2);

					if(pos != abs && pos != 'relative'){
						var ret = rias.dom.position(n, true);///dojox/fx/_base 中为 domStyle.coords，估计有错
						top = ret.y;
						left = ret.x;
						n.style.position = abs;
						n.style.top = top + "px";
						n.style.left = left + "px";
					}
				}
			})(node);

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
			anim1.onEnd = undefined;
			anim1 = fxbase.animateProperty(anim1);
			var anim2 = rias.mixin({
				properties: {
					width: function(){
						return {
							start: width,
							end: args.width || 0
						}
					},
					left: function(){
						return {
							start: left,
							end: newLeft
						}
					}
				}
			}, args);
			anim2.beforeBegin = undefined;
			anim2.onBegin = undefined;
			anim2 = fxbase.animateProperty(anim2);

			var anim = rias.fx[(args.method == "combine" ? "combine" : "chain")]([anim1, anim2]);
			return anim; // dojo.Animation

		},
		//	|	dojox.fx.slideBy({
		//	|		node: domNode, duration:400,
		//	|		top: 50, left: -22
		//	|	}).play();
		slideBy: fxbasex.slideBy,
		crossFade: fxbasex.crossFade,
		//	|	dojox.fx.highlight({ node:"foo" }).play();
		highlight: fxbasex.highlight,
		//		|	dojox.fx.wipeTo({ node: "nodeId", height: 200 }).play();
		wipeTo: fxbasex.wipeTo,
		explode: fxbasex.explode,
		converge: fxbasex.converge,
		disintegrate: fxbasex.disintegrate,
		build: fxbasex.build,
		shear: fxbasex.shear,
		unShear: fxbasex.unShear,
		pinwheel: fxbasex.pinwheel,
		unPinwheel: fxbasex.unPinwheel,
		blockFadeOut: fxbasex.blockFadeOut,
		blockFadeIn: fxbasex.blockFadeIn,
		flip: fxbasex.flip,
		flipCube: fxbasex.flipCube,
		flipPage: fxbasex.flipPage,
		flipGrid: fxbasex.flipGrid,
		smoothScroll: fxbasex.smoothScroll
	};

	return rias;

});
