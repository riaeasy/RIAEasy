define([
	"riasw/riaswBase",
	"../_Plugin",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/form/_PaletteMixin",
	"dojo/i18n!./nls/latinEntities"
], function(rias, _Plugin, _WidgetBase, _TemplatedMixin, _PaletteMixin) {

	var pluginsName = "riasw.editor.htmleditor.plugins";

	var EntityPalette = rias.declare(pluginsName + ".EntityPalette", [_WidgetBase, _TemplatedMixin, _PaletteMixin], {
		// summary:
		//		A keyboard accessible HTML entity-picking widget (for inserting symbol characters)
		// description:
		//		Grid showing various entities, so the user can pick a certain entity.
		//		Can be used standalone, or as a popup.

		// templateString: [protected] String
		//		The basic template used to render the palette.
		//		Should generally be over-ridden to define different classes.
		templateString:
			'<div class="riaswEditorEntityPalette">\n' +
				'<table>\n' +
					'<tbody>\n' +
						'<tr>\n' +
							'<td>\n' +
								'<table class="riaswPaletteTable">\n' +
									'<tbody data-dojo-attach-point="gridNode"></tbody>\n' +
								'</table>\n' +
							'</td>\n' +
						'</tr>\n' +
						'<tr>\n' +
							'<td>\n'+
								'<table data-dojo-attach-point="previewPane" class="riaswEditorEntityPalettePreviewTable">\n' +
									'<tbody>\n' +
										'<tr>\n' +
											'<th class="riaswEditorEntityPalettePreviewHeader">Preview</th>\n' +
											'<th class="riaswEditorEntityPalettePreviewHeader" data-dojo-attach-point="codeHeader">Code</th>\n' +
											'<th class="riaswEditorEntityPalettePreviewHeader" data-dojo-attach-point="entityHeader">Name</th>\n' +
											'<th class="riaswEditorEntityPalettePreviewHeader">Description</th>\n' +
										'</tr>\n' +
										'<tr>\n' +
											'<td class="riaswEditorEntityPalettePreviewDetailEntity" data-dojo-attach-point="previewNode"></td>\n' +
											'<td class="riaswEditorEntityPalettePreviewDetail" data-dojo-attach-point="codeNode"></td>\n' +
											'<td class="riaswEditorEntityPalettePreviewDetail" data-dojo-attach-point="entityNode"></td>\n' +
											'<td class="riaswEditorEntityPalettePreviewDetail" data-dojo-attach-point="descNode"></td>\n' +
										'</tr>\n' +
									'</tbody>\n' +
								'</table>\n' +
							'</td>\n' +
						'</tr>\n' +
					'</tbody>\n' +
				'</table>\n' +
			'</div>',


		baseClass: "riaswEditorEntityPalette",

		// showPreview: [public] Boolean
		//	  Whether the preview pane will be displayed, to show details about the selected entity.
		showPreview: true,

		// showCode: [public] Boolean
		//		Show the character code for the entity.
		showCode: false,

		// showEntityName: [public] Boolean
		//		Show the entity name for the entity.
		showEntityName: false,

		// palette: [public] String
		//		The symbol pallete to display.  The only current one is 'latin'.
		palette: "latin",

		dyeClass: pluginsName + ".LatinEntity",

		// domNodeClass [protected] String
		paletteClass: 'editorLatinEntityPalette',

		cellClass: "riaswEditorEntityPaletteCell",

		postMixInProperties: function(){
			// summary:
			//		Convert hash of entities into two-dimensional rows/columns table (array of arrays)
			var choices = rias.i18n.getLocalization(pluginsName, "latinEntities"),
				numChoices = 0,
				entityKey;
			for(entityKey in choices){
				numChoices++;
			}
			var numRows = Math.floor(Math.sqrt(numChoices)),
				currChoiceIdx = 0,
				rows = [],
				row = [];
			for(entityKey in choices){
				currChoiceIdx++;
				row.push(entityKey);
				if(currChoiceIdx % numRows === 0){
					rows.push(row);
					row = [];
				}
			}
			if(row.length > 0){
				rows.push(row);
			}
			this._palette = rows;
			this.inherited(arguments);
		},

		buildRendering: function(){
			// summary:
			//		Instantiate the template, which makes a skeleton table which we'll insert the entities
			this.inherited(arguments);

			var i18n = rias.i18n.getLocalization(pluginsName, "latinEntities");

			this._preparePalette(
				this._palette,
				i18n
			);

			var cells = rias.dom.query(".riaswEditorEntityPaletteCell", this.gridNode);
			rias.forEach(cells, function(cellNode){
				this.on(cellNode, "mouseenter", "_onCellMouseEnter");
			}, this);
		},

		_onCellMouseEnter: function(e){
			// summary:
			//		Simple function to handle updating the display at the bottom of
			//		the palette.
			// e:
			//		The event.
			// tags:
			//		private
			this._displayDetails(e.target);
		},

		postCreate: function(){
			this.inherited(arguments);

			// Show the code and entity name (if enabled to do so.)
			rias.dom.setStyle(this.codeHeader, "display", this.showCode ? "" : "none");
			rias.dom.setStyle(this.codeNode, "display", this.showCode ? "" : "none");
			rias.dom.setStyle(this.entityHeader, "display", this.showEntityName ? "" : "none");
			rias.dom.setStyle(this.entityNode, "display", this.showEntityName ? "" : "none");

			if(!this.showPreview){
				rias.dom.setStyle(this.previewNode, "display", "none");
			}
		},

		_setCurrent: function(/*DOMNode*/ node){
			// summary:
			//		Called when a entity is hovered or focused.
			// description:
			//		Removes highlight of the old entity, and highlights
			//		the new entity.
			// tags:
			//		protected
			this.inherited(arguments);
			if(this.showPreview){
				this._displayDetails(node);
			}
		},

		_displayDetails: function(/*DOMNode*/ cell){
			// summary:
			//	  Display the details of the currently focused entity in the preview pane
			var dye = this._getDye(cell);
			if(dye){
				var ehtml = dye.getValue();
				var ename = dye._alias;
				this.previewNode.innerHTML=ehtml;
				this.codeNode.innerHTML="&amp;#"+parseInt(ehtml.charCodeAt(0), 10)+";";
				this.entityNode.innerHTML="&amp;"+ename+";";
				var i18n = rias.i18n.getLocalization(pluginsName, "latinEntities");
				this.descNode.innerHTML=i18n[ename].replace("\n", "<br>");

			}else{
				this.previewNode.innerHTML="";
				this.codeNode.innerHTML="";
				this.entityNode.innerHTML="";
				this.descNode.innerHTML="";
			}
		}
	});

	EntityPalette.LatinEntity = rias.declare(pluginsName + ".LatinEntity", null, {
		// summary:
		//		Represents a character.
		//		Initialized using an alias for the character (like cent) rather
		//		than with the character itself.

		constructor: function(/*String*/ alias){
			// summary:
			//	 Construct JS object representing an entity (associated w/a cell
			//		in the palette)
			// value: String
			//		alias name: 'cent', 'pound' ..

			this._alias = alias;
		},

		getValue: function(){
			// summary:
			//		Returns HTML representing the character, like &amp;
			return "&" + this._alias + ";";
		},

		fillCell: function(/*DOMNode*/ cell){
			// Deal with entities that have keys which are reserved words.
			cell.innerHTML = this.getValue();
		}
	});

	return EntityPalette;

});
