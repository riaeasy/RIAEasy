
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/riasw/hostDojo",

	"dojo/_base/fx",
	"dojo/fx",
	"dojo/fx/easing",
	"dojo/fx/Toggler",
	"dojox/fx/_base"
], function(rias, fxbase, fx, fxEasing, fxToggler, fxbasex) {

///fx========================================================///
	rias.defaultDuration = dijit.defaultDuration * 1.5;
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
						console.error("exception in animation handler for:", evt, rias.getStackTrace(e));
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
		wipeIn: fx.wipeIn,
		//	|		fx.wipeOut({ node:"someId" }).play()
		wipeOut: fx.wipeOut,
		//	|	dojo.fx.sizeTo({
		//	|		node:'myNode',
		//	|		duration: 1000,
		//	|		width: 400,
		//	|		height: 200,
		//	|		method: "combine"
		//	|	}).play();
		sizeTo: fxbasex.sizeTo,
		//	|	dojox.fx.slideBy({
		//	|		node: domNode, duration:400,
		//	|		top: 50, left: -22
		//	|	}).play();
		slideBy: fxbasex.slideBy,
		crossFade: fxbasex.crossFade,
		//	|	dojox.fx.highlight({ node:"foo" }).play();
		highlight: fxbasex.highlight,
		//		|	dojox.fx.wipeTo({ node: "nodeId", height: 200 }).play();
		wipeTo: fxbasex.wipeTo
	};

	return rias;

});
