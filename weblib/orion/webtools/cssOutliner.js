/*******************************************************************************
 * @license
 * Copyright (c) 2014, 2015 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/
define("webtools/cssOutliner", [
	'csslint/csslint',
	'orion/objects'
], function(csslint, Objects) {

	/**
	 * @description Creates a new validator
	 * @constructor
	 * @public
	 * @since 6.0
	 */
	function CssOutliner() {
		csslint.addRule(CssOutliner.prototype._outlineRule);
	}

	Objects.mixin(CssOutliner.prototype, /** @lends webtools.CssOutliner.prototype*/ {
		
		/**
		 * @descripton API callback to compute the outline
		 * @callback
		 */
		getOutline: function(contents, title) {
			csslint.verify(contents);
			return this._outlineRule.outline;
		},
		
		/**
		 * @description The CSS linting rule for creating the outline
		 * @private
		 */
		_outlineRule: {
			id: "css-outline", //$NON-NLS-0$
			name: "CSS outline", //$NON-NLS-0$
			desc: "CSS outline helper rule", //$NON-NLS-0$
			browsers: "All", //$NON-NLS-0$
			outline: [],
			/**
			 * @description API callback to start verifying
			 * @callback
			 */
			init: function(parser, reporter) {
				this.outline = [];
				// Pushes selector info into the outline
				var that = this;
				parser.addListener("startrule", function(event) { //$NON-NLS-0$
					var selectors = event.selectors;
					if (selectors && selectors.length) {
						var selectorText = [], line = null, col = null, length = null;
						for (var i=0; i < selectors.length; i++) {
							var sel = selectors[i];
							if (sel.parts && sel.parts.length > 0){
								var part = sel.parts[0]; // We want to check instanceof SelectorPart, but it is not API
								if (line === null) { line = part.line; }
								if (col === null) { col = part.col-1; }
								if (length === null){
									length = part.text.length;
								}
							}
							// If no valid parts found, just use the entire selector text
							if (line === null) { line = sel.line; }
							if (col === null) { col = sel.col-1; }
							if (length === null) {
								length = sel.text.length;
							}
							selectorText.push(sel.text);
						}
						that.outline.push({
							label: selectorText.join(", "), //$NON-NLS-0$
							line: line,
							offset: col,
							length: length
						});
					}
				});
			}
		}
	});
	
	return {
		CssOutliner : CssOutliner
	};
});