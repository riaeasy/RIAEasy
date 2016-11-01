/*******************************************************************************
 * @license
 * Copyright (c) 2014 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials are made 
 * available under the terms of the Eclipse Public License v1.0 
 * (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse Distribution 
 * License v1.0 (http://www.eclipse.org/org/documents/edl-v10.html). 
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
/*eslint-env browser, amd*/

define ([
	'marked/marked'
], function(Markdown) {

	function Hover(editor, hoverFactory) {
		this.editor = editor;
		this.hoverFactory = hoverFactory;
		this.inputManager = hoverFactory.inputManager;
		this.serviceRegistry = hoverFactory.serviceRegistry;
		this.commandRegistry = hoverFactory.commandRegistry;
		
		this._qfToolbars = [];
	}
	
	Hover.prototype = {
		computeHoverInfo: function (context) {
			var hoverInfo = [];
			this.hoverFactory._applicableProviders.forEach(function(provider) {
				var providerImpl = this.serviceRegistry.getService(provider);
				if (providerImpl && providerImpl.computeHoverInfo) {
					var editorContext = this.editor.getEditorContext();
					hoverInfo.push(providerImpl.computeHoverInfo(editorContext, context));
				}
			}.bind(this));

			return hoverInfo;
		},
		
		renderMarkDown: function(markDown) {
			return Markdown(markDown, {
				sanitize: true
			});
		},
		
		clearQuickFixes: function() {
			this._qfToolbars.forEach(function(qfTB) {
				qfTB.destroy();
			});
			this._qfToolbars = [];
		},
		
		// TODO The allAnnotations iterator was collected using editor API, currently unused as we instead just get the annotation model from the annotation itself (not official API)
		renderQuickFixes: function(annotation, allAnnotations, parentDiv) {
			if  (!annotation || !parentDiv){
				return;
			}
			
			var actionsDiv = document.createElement("div");
			actionsDiv.classList.add("commandList"); //$NON-NLS-0$ 
			parentDiv.appendChild(actionsDiv);
			
			var nodeList = [];
			var metadata = this.inputManager.getFileMetadata();
			if (metadata){
				metadata.annotation = annotation;
				this.commandRegistry.renderCommands("orion.edit.quickfix", actionsDiv, metadata, this.editor, 'quickfix', annotation, nodeList); //$NON-NLS-1$ //$NON-NLS-2$
				delete metadata.annotation;
			}
		}

	};

	function HoverFactory(serviceRegistry, inputManager, commandRegistry) {
		this.serviceRegistry = serviceRegistry;
		this.inputManager = inputManager;
		this.commandRegistry = commandRegistry;
		
		// Filter the plugins based on contentType...
		this.filterHoverPlugins();

		// Track changes to the input type and re-filter
		this.inputManager.addEventListener("InputChanged", function() {
			this.filterHoverPlugins();
		}.bind(this));
	}
	HoverFactory.prototype = {
		createHover: function(editor) {
			return new Hover(editor, this);
		},
	
		filterHoverPlugins: function () {
			this._applicableProviders = [];
			var infoProviders = this.serviceRegistry.getServiceReferences("orion.edit.hover"); //$NON-NLS-0$
			for (var i = 0; i < infoProviders.length; i++) {
				var providerRef = infoProviders[i];
				var contentType = this.inputManager.getContentType();
				if (contentType) {
					var validTypes = providerRef.getProperty('contentType'); //$NON-NLS-0$
					if (validTypes && validTypes.indexOf(contentType.id) !== -1) {
						this._applicableProviders.push(providerRef);
					}
				}
			}
		}
	};

	return {HoverFactory: HoverFactory}; 
});


