// JavaScript Document

jQuery.migrateMute = 1;
jQuery( document ).ready(function($) {
	var elemType, dimensionLabel, activeElement, modal_top, modal_left, printableArea

	var fpe_loaded = 0;
	var fpf_loaded = 0;

	let fpd_container = $('.fpd-product-designer-wrapper > .fpd-container');
	fpd_container.on('ready', function(evt) {
		fpf_init_modal_position(); // Init modal position
		fpf_init_modal_actions(); // Init modal actions

		fpf_init_designer(); // Init main design wrapper
		// fpf_extend_prototype_add_element(); // Extends FancyProductDesigner.addElement

		fpf_add_filters(); // Adds filters to the image edit panel
		// fpf_init_stage();
		fpf_init_quote_form();

		fpf_init_toolbar();
		fpf_init_pdf_download_feature();
		fpf_init_email_feature();
		fpf_init_share_feature();
		fpf_init_custom_filter(); // Defines custom fabric filter

		hide_dimension_label();
	});

	// Helper function to get current stage of designer
	function getCurrentStage() {
		return fancyProductDesigner.currentViewInstance.stage;
	}

	function fpf_add_filters() {
		// Adds Filter when clicking advanced editing
		$(document).on('click', '.fpd-tool-advanced-editing', function() {
			// Checks if previously added
			if (!$('.fpf-filters').length) {

				// Hide original filters
				$('.fpd-content-filters > div').css('display', 'none');

				// Add button to reset element to original
				var newFilterBtns = '<label>'+fpfCommonParams.texture_message+'</label>';
				newFilterBtns = newFilterBtns + '<div class="fpd-filter-fpf0 fpf-item fpf-filters fpf-filters-btn" data-filter="fpf0" data-executing="no">';
					newFilterBtns = newFilterBtns + '<img class="fpf-filter-icon" src="'+fpfCommonParams.original_icon+'" title="'+fpfCommonParams.original_text+'" alt="'+fpfCommonParams.original_text+'" />';
					// newFilterBtns = newFilterBtns + '<div class="fpf-clear"></div>';
					newFilterBtns = newFilterBtns + '<div class="fpf-filter-icon-title">';
						newFilterBtns = newFilterBtns + fpfCommonParams.original_text;
					newFilterBtns = newFilterBtns + '</div>';
				newFilterBtns = newFilterBtns + '</div>';

				// Get our textures
				var textures = fpfCommonParams.textures;
				var textures_obj  = $.parseJSON( textures );
				var btn_count = 1;

				// Create our custom button html for each texture
				$.each(textures_obj, function(texture_name, texture_values) {
					newFilterBtns = newFilterBtns + '<div class="fpd-filter-fpf'+btn_count+' fpf-item fpf-filters fpf-filters-btn" data-filter-title="'+ texture_name +'" data-filter="fpf'+btn_count+'" data-executing="no">';
						newFilterBtns = newFilterBtns + '<img class="fpf-filter-icon" src="'+texture_values['icon']+'" title="'+texture_name+'" alt="'+texture_name+'" />';
						// newFilterBtns = newFilterBtns + '<div class="fpf-clear"></div>';
						newFilterBtns = newFilterBtns + '<div class="fpf-filter-icon-title">';
							newFilterBtns = newFilterBtns + texture_name;
						newFilterBtns = newFilterBtns + '</div>';
					newFilterBtns = newFilterBtns + '</div>';
					++btn_count;
				});

				// Append our custom button HTML to the grid with the other filters
				$('.fpd-content-filters').append(newFilterBtns);
				
				if(fpfCommonParams.show_messages == true) {
					// Create HTML for message under Scale tool
					var scaleHTML = '<div class="fpf-transform-options fpd-transform-options fpd-list-row fpd-sub-option">';
						scaleHTML = scaleHTML + '<div class="fpf-cell-wide">';
							scaleHTML = scaleHTML + fpfCommonParams.scale_message;
						scaleHTML = scaleHTML + '</div>';
					scaleHTML = scaleHTML + '</div>';
					
					// Append our custom Scale HTML right before the helper buttons - this should be below the scale tool
					$('.fpd-helper-btns').before(scaleHTML);

					// Create HTML for message under Scale tool
					var uploadHTML = '<div class="fpf-upload-options">';
						uploadHTML = uploadHTML + '<div class="fpf-cell-wide">';
							uploadHTML = uploadHTML + fpfCommonParams.upload_message;
						uploadHTML = uploadHTML + '</div>';
					uploadHTML = uploadHTML + '</div>';
					
					// Append our custom Upload HTML right before the upload form - this should be below all upload options
					$('.fpd-upload-form').before(uploadHTML);
					// Put our ScaleHTML in a new div so it has the right padding for the upload form
					scaleHTML = '<div class="fpf-upload-scale">'+scaleHTML+'</div>';
					// Append our scaling message right under the Upload HTML
					$('.fpd-upload-form').before(scaleHTML);

					// Add text to helper buttons
					$('.fpd-center-horizontal').css('display', 'block');
					$('.fpd-center-horizontal').append('<div class="fpf-helper-btn-label">'+fpfCommonParams.helperCenterHorizontal+'</div>');
					$('.fpd-center-vertical').css('display', 'block');
					$('.fpd-center-vertical').append('<div class="fpf-helper-btn-label">'+fpfCommonParams.helperCenterVertical+'</div>');
					$('.fpd-flip-horizontal').css('display', 'block');
					$('.fpd-flip-horizontal').append('<div class="fpf-helper-btn-label">'+fpfCommonParams.helperFlipHorizontal+'</div>');
					$('.fpd-flip-vertical').css('display', 'block');
					$('.fpd-flip-vertical').append('<div class="fpf-helper-btn-label">'+fpfCommonParams.helperFlipVertical+'</div>');
					$('.fpd-reset-element').css('display', 'block');
					$('.fpd-reset-element').append('<div class="fpf-helper-btn-label">'+fpfCommonParams.helperResetElement+'</div>');

					var action_label = fpfCommonParams.action_label;
					$('.fpd-right .fpd-icon-more').after('<span class="fpf_action_label">'+action_label+'</span>');

				}
			}
		});

		// Filter click action
		$(document).on('click', '.fpf-filters-btn', function() {
			// if executing then return
			if ($('body').data('executing')) {
				// do nothing because we're already doing something
			} else {
				// add executing data to all filters
				$('body').data('executing', true)
				$('.fpf-item').css('color', '#888');
				$(this).css('color', '#a78f60');
				clickCustomFilter(activeElement, this);
			}
		});
	}

	function fpf_init_stage() {
		// Make sure my_stage is defined
		var my_stage = getCurrentStage();

		// Object scaling and adjusting dimension box
		my_stage.on({'object:scaling': function(opts) {
			managedDimensionLabel(opts.target, 'scale', 0);
			adjust_modal();
		}});
		$('.fpd-scale-slider').on('slide', function(evt, ui) {
			managedDimensionLabel(activeElement, 'scale', 0);
			adjust_modal();
		});

		$('.fpd-opacity-slider').on('slide', function(evt, ui) {
			adjust_modal();
		});

		// Object moving
		my_stage.on({'object:moving': function(opts) {
			managedDimensionLabel(opts.target, 'moving', 0);
			adjust_modal();
		}});

		// Object rotating
		my_stage.on({'object:rotating': function(opts) {
			managedDimensionLabel(opts.target, 'rotating', 0);
			adjust_modal();
		}});
	}

	function fpf_init_designer() {

		// When element is added make sure modal stays in place
		// fpd_container.on('elementAdd', function(evt, object) {
		// 	adjust_modal();
		// });

		// When element is added check if it's the base layer, if it is then hide it for right now
		/*fpd_container.on('elementAdd', function(evt, object) {
			if (!object) {
				return
			}

			if (object.title == 'Base') {
				printableArea = object;
				printableArea.visible = false;
			}
			if (FPDUtil.getType(object.type) == 'image' && object.isCustom) {
				// if this is the first time it has been added then give it a unique name
				if (typeof(object.originParams.source) == 'undefined') {
					if (typeof(object.title_id) == 'undefined') {
						object.title_id = Math.floor((Math.random() * 9999) + 1001)
						// add the random title_id to the begining of the title so the same file can be used multiple times
						object.title = object.title_id + '_' + object.title;
					}
				}
				if (typeof(printableArea) != 'undefined') {
					printableArea.visible = true;
				}
			}
		});*/

		// When element is removed check if it's a custom layer, if it is then hide printableArea
		/*fpd_container.on('elementRemove', function(evt, object) {
			if (object == null) {
				return
			}

			console.log(object);

			if (FPDUtil.getType(object.type) == 'image' && object.isCustom) {
				if (typeof(printableArea) != 'undefined') {
					printableArea.visible = false;
				}
			}

			managedDimensionLabel(object, 'remove', 0);
			adjust_modal();
		});*/

		// Hook the Fancy Product Designer API on the elementSelect event
		fpd_container.on('elementSelect', function(evt, object) {
			if (object == null) {
				return
			}
			console.log('teest');

			// = make sure modal box isn't off top of screen
			adjust_modal();
			
			// = hide social share
			// $('.fpd-content-share').addClass('fpd-hidden');
			activeElement = object;
			var my_stage = getCurrentStage();
			// ========================================
			// Manage dimensions box
			// ========================================
			// Loop objects and see if Dimension box exists, if it does remove it
			var currentObjects = getCurrentStage().getObjects();

			var showDimensionsBox
			var currentViewIndex = currentObjects.length;

			/*for(var i=0; i < currentObjects.length; ++i) {
				if (currentObjects[i]['title'] == 'Show Dimensions') {
					showDimensionsBox = currentObjects[i];
					my_stage.remove(showDimensionsBox);
					my_stage.renderAll();
					my_stage.calcOffset();
				}
			} // end objects loop*/

			// Check if this is a custom object, if it is then add a dimension box & show printable area (base)
			if (object != null && object.hasOwnProperty('params') && object.params['isCustom'] == true) {
				managedDimensionLabel(object, 'add', currentViewIndex);
				printableArea.visible = true;
				my_stage.renderAll();
			} else {
				my_stage.remove(dimensionLabel);
				my_stage.renderAll();
				if (typeof(printableArea) != 'undefined') {
					printableArea.visible = false;
				}
			} // end if isCustom = true
			// ========================================
			// end manage dimensions box
			// ========================================

			// ========================================
			// Add color selector if this is 'premium product' and the selected element is the 'color layer'
			// ========================================
			if (object != null && (object['title'] == fpfCommonParams.colorLayerTitle || object['title']== 'Sleeve Color')) {
				if (fpfCommonParams.premiumProduct == true) {
					// change what the choose button says
					var elemParams = object['params'];
					$('.fpd-color-picker').append('<input type="text" value="'+(elemParams.currentColor ? elemParams.currentColor : elemParams.colors[0])+'" />');
					$('.fpd-color-picker').find('input').spectrum("destroy").spectrum({
						preferredFormat: "hex",
						showInput: true,
						change: function(color) {
							FancyProductDesigner.prototype.setElementParameters(object, {currentColor: color.toHexString()});
							// change color picker label color
							var rgb = color.toRgbString();
							var colors = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
							var brightness = 1;
							var r = colors[1];
							var g = colors[2];
							var b = colors[3];
							var colorAvg = ((parseInt(r) + parseInt(g) + parseInt(b))/3);
							if (colorAvg < 122) {
								$('.fpf-color-picker-label').css('color', '#fff');
							} else {
								$('.fpf-color-picker-label').css('color', '#000');
							}
							// end change color picker label color
							my_stage.renderAll();
						}
					});
					$('.sp-preview-inner').html('<div class="fpf-color-picker-label">'+fpfCommonParams.colorPickerLabel+'</div>');
					$('.sp-choose').html(fpfCommonParams.choose_button);
				}
			}
			// ========================================
			// end premium product color selector
			// ========================================

			var customElements = fancyProductDesigner.getCustomElements();
			$.each(customElements, function(key, value) {
				var customItemTitle = value['element']['title'];
				if (object['title'] == customItemTitle) {
					if (typeof(object['_element']) == 'undefined') {
						elemType = 'text';
						// Hide old filter buttons
						$('.fpd-filter-options .fpd-filter-no').addClass('fpd-hidden');
						$('.fpd-filter-options .fpd-filter-grayscale').addClass('fpd-hidden');
						$('.fpd-filter-options .fpd-filter-sepia').addClass('fpd-hidden');
						$('.fpd-filter-options .fpd-filter-sepia2').addClass('fpd-hidden');
						// Hide our filter buttons
						$('.fpd-filter-options').addClass('fpd-hidden');
						// Show our scale HTML
						$('.fpf-transform-options').removeClass('fpd-hidden');
					} else {
						elemType = 'image';
						// Hide old filter buttons
						$('.fpd-filter-options .fpd-filter-no').removeClass('fpd-hidden');
						$('.fpd-filter-options .fpd-filter-grayscale').removeClass('fpd-hidden');
						$('.fpd-filter-options .fpd-filter-sepia').removeClass('fpd-hidden');
						$('.fpd-filter-options .fpd-filter-sepia2').removeClass('fpd-hidden');
						$('.fpd-filter-options').removeClass('fpd-hidden');
						$('.fpd-filter-options .fpf-filters-btn').removeClass('fpd-hidden');
						$('.fpd-filter-options .fpf-filters-btn').removeClass('fpd-hidden');
						// Show our scale HTML
						$('.fpf-transform-options').removeClass('fpd-hidden');
						// Turn off previous .on('click') events added from last time an element was selected
						$('body .fpf-filters-btn').off('click');
						/*// Run this when our filter button is clicked
						$('body .fpf-filters-btn').on('click', function() {
							// if executing then return
							if ($('body').data('executing')) {
								// do nothing because we're already doing something
							} else {
								// add executing data to all filters
								$('body').data('executing', true)
								$('.fpf-item').css('color', '#888');
								$(this).css('color', '#a78f60');
								clickCustomFilter(object, this);
							}
						});*/
					}
				}
			}); // end customElements.each
			// Limit the scale slider
			/*$( ".fpd-scale-slider" ).slider({
			  max: fpfCommonParams.max_scale
			});*/
			$('.fpd-item').on('click', function () {
				adjust_modal();
			});
			$('.sp-choose').on('click', function() {
				adjust_modal();
			});
			return true;
		});

	}

	function fpf_init_modal_position() {
		// Adjust modal positino if true
		if (fpfCommonParams.adjust_modal == 'true') {
			$('.fpd-draggable-dialog').css('top', fpfCommonParams.modal_top);
			$('.fpd-draggable-dialog').css('left', fpfCommonParams.modal_left);
			$('.sp-container').css('top', (fpfCommonParams.color_top));
			$('.sp-container').css('left', (fpfCommonParams.color_left));
		}
	}

	function fpf_init_modal_actions() {
		// remove sticky from modal if clicked
		$('.fpd-draggable-dialog').on('mousedown', function() {
			if (
				fpfCommonParams.adjust_modal == 'true'
				&& $('.fpd-draggable-dialog').hasClass('sticky')
			){
				fpf_init_modal_position();
				$('.fpd-draggable-dialog').removeClass('sticky');
				$('.sp-container').removeClass('sticky');
			}
		}); // end remove sticky

		// update variables when modal is moved
		$( ".fpd-draggable-dialog" ).mousemove(function( event ) {
			modal_top = $('.fpd-draggable-dialog').css('top');
			modal_left = $('.fpd-draggable-dialog').css('left');
		}); // end update variables
	}

	// Adds Download PDF button and defines download pdf feature
	function fpf_init_pdf_download_feature() {
		// Adds 2nd Download PDF button to toolbar
		if ( 1==1 ) {
			var btn6 = '<span class="fpf-save-pdf fpd-btn">';	
				btn6 = btn6 + 'Download PDF';
			btn6 = btn6 + '</span>';
			$('.fpd-save-pdf').after(btn6);
		}

		// Print PDF with Watermark
		//check if jsPDF is included
		if(window.jsPDF) {
			$('.fpf-save-pdf').on('mouseup touchend', function(evt) {
				var my_stage = getCurrentStage();
				evt.preventDefault();
				var stage_width = my_stage.width;
				var stage_height = my_stage.height;
				FancyProductDesigner.prototype.deselectElement();
				
				if (typeof(printableArea) != 'undefined') {
					printableArea.opacity = 0;
					printableArea.visible = false;
				}
				
				// Define watermark
				fpf_add_watermark();
				
				// Define additional items to add to PDF
				fpf_add_product_details();
				
				// Prepare to build PDF after 1 sec delay to give new objects time to load
				setTimeout(function(){
					var orientation = my_stage.getWidth() > my_stage.getHeight() ? 'l' : 'p';
					var doc = new jsPDF(orientation, 'mm', [stage_width * 0.26, stage_height * 0.26]),
						viewsDataURL = FancyProductDesigner.prototype.getViewsDataURL('jpeg', 'white');
	
					for(var i=0; i < viewsDataURL.length; ++i) {
						doc.addImage(viewsDataURL[i], 'JPEG', 0, 0);
						if(i < viewsDataURL.length-1) {
							doc.addPage();
						}
					}
					if (typeof(printableArea) != 'undefined') {
						printableArea.opacity = 1;
						printableArea.visible = false;
						my_stage.renderAll();
						my_stage.calcOffset();
					}
					doc.save('Product.pdf');
					// Remove elements we just added
					FancyProductDesigner.prototype.removeElement('PDF Label');
					FancyProductDesigner.prototype.removeElement('PDF Label Back');
					FancyProductDesigner.prototype.removeElement('Watermark');
				}, 1000);
			}).css('display', 'block');
		} // end print pdf
	}

	// Adds Email button to toolbar and add email form to modal
	function fpf_init_email_feature() {
		// Adds Email button to toolbar
		if ( 1==1 ) {
			var btn7 = '<span class="fpf-email-design fpd-btn">';	
				btn7 = btn7 + 'Email Design';
			btn7 = btn7 + '</span>';
			$('.fpf-save-pdf').after(btn7);
		}

		// Adds Send Email Form to the Modal
		if ( 1==1 ) {
			var btn8 = '<div class="fpf-email-design-form fpd-list-row">';
				btn8 = btn8 + '<div class="fpd-cell-full fpf-email-title">';
					btn8 = btn8 + '&nbsp;';
				btn8 = btn8 + '</div>';
			btn8 = btn8 + '</div>';
			btn8 = btn8 + '<div class="fpf-email-design-form fpd-list-row">';
				btn8 = btn8 + '<div class="fpd-cell-full">';
					btn8 = btn8 + '<input class="fpf-ed-your-name" placeholder="Your name" type="text" />';
				btn8 = btn8 + '</div>';
			btn8 = btn8 + '</div>';
			btn8 = btn8 + '<div class="fpf-email-design-form fpd-list-row">';
				btn8 = btn8 + '<div class="fpd-cell-full">';
					btn8 = btn8 + '<input class="fpf-ed-your-email" placeholder="Your email" type="text" />';
				btn8 = btn8 + '</div>';
			btn8 = btn8 + '</div>';
			btn8 = btn8 + '<div class="fpf-email-design-form fpd-list-row">';
				btn8 = btn8 + '<div class="fpd-cell-full">';
					btn8 = btn8 + '<input class="fpf-ed-send-to-email" placeholder="Send to email address" type="text" />';
				btn8 = btn8 + '</div>';
			btn8 = btn8 + '</div>';
			btn8 = btn8 + '<div class="fpf-email-design-form fpd-list-row">';
				btn8 = btn8 + '<div class="fpd-cell-full">';
					btn8 = btn8 + '<input class="fpf-ed-your-message" placeholder="Add a message" type="text" />';
				btn8 = btn8 + '</div>';
			btn8 = btn8 + '</div>';
			btn8 = btn8 + '<div class="fpf-email-design-form fpd-list-row">';
				btn8 = btn8 + '<div class="fpd-cell-full">';
					btn8 = btn8 + '<input class="fpf-ed-submit" value="Send Now" type="button" />';
				btn8 = btn8 + '</div>';
			btn8 = btn8 + '</div>';

			$('.fpd-list').append(btn8);
		}


		// open email design button clicked
		$('.fpf-email-design').on('click', function() {
			var currentObjects = getCurrentStage().getObjects();
			var my_stage = getCurrentStage();
			my_stage.setActiveObject(currentObjects[0]);
			FancyProductDesigner.prototype.callDialogContent('email-design', 'EMAIL YOUR DESIGN', null, true);
			$('.fpd-fill-options').addClass('fpd-hidden');
			$('.fpd-text-options').addClass('fpd-hidden');
			$('.fpf-transform-options').addClass('fpd-hidden');
			$('.fpd-transform-options').addClass('fpd-hidden');
			$('.fpd-helper-btns').addClass('fpd-hidden');
			$('.fpd-filter-options').addClass('fpd-hidden');
			$('.fpd-content-share').addClass('fpd-hidden');
			$('.fpf-email-design-form').removeClass('fpd-hidden');
		});

		// email design button clicked
		$('.fpf-ed-submit').on('click', function() {
			// validate form
			var validate = 0;
			var your_name = $('.fpf-ed-your-name').val();
			if (your_name == '') {
				validate = 1;
				$('.fpf-ed-your-name').css('background-color', '#EFACAD');
				setTimeout(function(){
					$('.fpf-ed-your-name').css('background-color', '#FFFFFF');
				}, 3000);
			}
			var your_email = $('.fpf-ed-your-email').val();
			if (your_email == '') {
				validate = 1;
				$('.fpf-ed-your-email').css('background-color', '#EFACAD');
				setTimeout(function(){
					$('.fpf-ed-your-email').css('background-color', '#FFFFFF');
				}, 3000);
			}
			var send_to_email = $('.fpf-ed-send-to-email').val();
			if (send_to_email == '') {
				validate = 1;
				$('.fpf-ed-send-to-email').css('background-color', '#EFACAD');
				setTimeout(function(){
					$('.fpf-ed-send-to-email').css('background-color', '#FFFFFF');
				}, 3000);
			}
			var msg = $('.fpf-ed-your-message').val();
			if (validate == 1) {
				alert('You did not fill out all the required fields');
			} else {
				$('.fpd-full-loader').addClass('fpf_show');
				$('.fpf-email-design-form').slideUp();
				$('.fpd-content-share').after('<div class="sending_email"><div class="sending_quote_title">Sending Email</div><img alt="Sending" src="'+fpfCommonParams.sending_solid_back+'" /></div>');
				var flds = {};
				flds.your_name = your_name;
				flds.your_email= your_email;
				flds.send_to_email = send_to_email;
				flds.msg = msg;
				flds.action = 'fpf_send_email';
				fpf_add_watermark();
				fpf_add_product_details();
				FancyProductDesigner.prototype.callDialogContent('email-design', 'EMAIL YOUR DESIGN', null, true);
				if (typeof(printableArea) != 'undefined') {
					printableArea.opacity = 0;
				}
				setTimeout(function(){ 
					// Create temp canvas, add image as jpeg, reduce size and send to server
					var canvas = document.createElement("canvas");

					canvas.width = 800;
					canvas.height = 2398;
					var ctx = canvas.getContext("2d");
	
					// Get a list of current views
					var viewsDataURL = FancyProductDesigner.prototype.getViewsDataURL(),
						images = new Array(),
						imageLoop = 0;

						// load the front image
						var img = new Image();
						img.crossOrigin = "Anonymous";
						img.src = viewsDataURL[0];
						img.onload = function() {
							// add front image to temporary canvas
							ctx.drawImage(img, 0, -1);
							
							// keep dialog box open
							FancyProductDesigner.prototype.callDialogContent('email-design', 'EMAIL YOUR DESIGN', null, true);
	
							// load the back image
							var img2 = new Image();
							img2.crossOrigin = "Anonymous";
							img2.src = viewsDataURL[1];
							img2.onload = function() {
								// add back image to temporary canvas
								ctx.drawImage(img2, 0, 1198);
						
								// convert tempoary canvas to jpeg
								var product_image = canvas.toDataURL("image/jpeg");
								flds.product_image = product_image;
								FancyProductDesigner.prototype.callDialogContent('email-design', 'EMAIL YOUR DESIGN', null, true);
								setTimeout(function(){ 
									$.ajax({
										type: 'POST',
										url: fpfCommonParams.ajaxurl,
										data: flds,
										success: function(response) {
											// remove our extra details
											FancyProductDesigner.prototype.removeElement('PDF Label');
											FancyProductDesigner.prototype.removeElement('PDF Label Back');
											FancyProductDesigner.prototype.removeElement('Watermark');
											FancyProductDesigner.prototype.callDialogContent('email-design', 'EMAIL YOUR DESIGN', null, true);
											// reset printArea
											if (typeof(printableArea) != 'undefined') {
												printableArea.opacity = 1;
											}
											$('.sending_email').html('<div class="email_received">'+response+'</div>');
											$('.fpd-full-loader').removeClass('fpf_show');
											$('.fpf-ed-send-to-email').val('');
											$('.fpf-ed-your-message').val('');
											setTimeout(function(){
												$('.sending_email').remove();
												$('.fpf-email-design-form').removeClass('fpd-hidden');
												$('.fpf-email-design-form').slideDown();
											}, 5000);
										},
										error: function(error) {
											FancyProductDesigner.prototype.callDialogContent('email-design', 'EMAIL YOUR DESIGN', null, true);
											$('.sending_email').html('<div class="email_received">'+error+'</div>');
											$('.fpd-full-loader').removeClass('fpf_show');
											$('.fpf-email-design-form').slideDown();
											setTimeout(function(){
												$('.sending_email').remove();
											}, 5000);
										}
									});
								}, 1200);
							}
						
						}


				}, 1000);

			}
		});
	}

	function fpf_init_share_feature() {
		// share options
		if (fpfCommonParams.social_share == 'true') {
			// Adds Share button to toolbar
			var btn4 = '<span class="fpf-share fpd-btn" style="display: block;">Share</span>';
			$('.fpd-save-pdf').after(btn4);
			
			// handle click for share button
			$('.fpf-share').on('click', function() {
				var currentObjects = getCurrentStage().getObjects();
				var my_stage = getCurrentStage();
				my_stage.setActiveObject(currentObjects[0]);
				FancyProductDesigner.prototype.callDialogContent('edit', 'SHARE YOUR DESIGN', null, false);
				$('.fpd-fill-options').addClass('fpd-hidden');
				$('.fpd-text-options').addClass('fpd-hidden');
				$('.fpf-transform-options').addClass('fpd-hidden');
				$('.fpd-transform-options').addClass('fpd-hidden');
				$('.fpd-helper-btns').addClass('fpd-hidden');
				$('.fpd-filter-options').addClass('fpd-hidden');
				$('.fpf-email-design-form').addClass('fpd-hidden');
				$('.fpd-content-share').removeClass('fpd-hidden');
			});

			// Create share buttons
			var btn5 = '<div class="fpd-content-share">';
				btn5 = btn5 + '<div class="fpd-content-share-spin"></div>';
				btn5 = btn5 + '<div data-share="facebook" class="fpf-share-btn fpd-add-image fpd-btn-raised fpd-secondary-bg-color fpd-secondary-text-color">';
					btn5 = btn5 + '<i class="fpf-facebook"><img src="'+fpfCommonParams.plugin_path +'/images/icon-facebook.png" /></i><div class="fpf-share-text"> Share on Facebook</div><div style="clear:both;"></div>';
				btn5 = btn5 + '</div>';
				btn5 = btn5 + '<div data-share="twitter" class="fpf-share-btn fpd-add-image fpd-btn-raised fpd-secondary-bg-color fpd-secondary-text-color">';
					btn5 = btn5 + '<i class="fpf-twitter"><img src="'+fpfCommonParams.plugin_path +'/images/icon-twitter.png" /></i><div class="fpf-share-text"> Share on Twitter</div><div style="clear:both;"></div>';
				btn5 = btn5 + '</div>';
				btn5 = btn5 + '<div data-share="pintrest" class="fpf-share-btn fpd-add-image fpd-btn-raised fpd-secondary-bg-color fpd-secondary-text-color">';
					btn5 = btn5 + '<i class="fpf-pintrest"><img src="'+fpfCommonParams.plugin_path +'/images/icon-pintrest.png" /></i><div class="fpf-share-text"> Share on Pintrest</div><div style="clear:both;"></div>';
				btn5 = btn5 + '</div>';
			btn5 = btn5 + '</div>';
			$('.fpd-list').append(btn5);
			$('.fpf-share-btn').on('click', function () {
				var shareElem = this;
				$('.fpf-share-btn').css('opacity', '0.5');
				$('.fpf-share-btn').css('cursor', 'none');
				var spinner = '<img src="'+fpfCommonParams.spinner+'" /> Loading - Please Wait';
				$('.fpd-content-share-spin').html(spinner);
				// hide printableArea
				printableArea.opacity = 0;
				// add watermark to image
				fpf_add_watermark();
				// reopen the dialogue box because adding the watermark closed it
				FancyProductDesigner.prototype.callDialogContent('edit', 'SHARE YOUR DESIGN', null, false);
				setTimeout(function(){ 
					// Create temp canvas, add image as jpeg, reduce size and send to server
					var img = document.createElement("img");
					var canvas = document.createElement("canvas");
					canvas.width = 800;
					canvas.height = 2398;
					var ctx = canvas.getContext("2d");
					img.crossOrigin = "Anonymous";

					// Get a list of current views
					var viewsDataURL = FancyProductDesigner.prototype.getViewsDataURL(),
					images = new Array(),
					imageLoop = 0;

					// load the front image
					var img = new Image();
					img.crossOrigin = "Anonymous";
					img.src = viewsDataURL[0];
					img.onload = function() {
						img.crossOrigin = "Anonymous";
						// Keep dialogue box open
						FancyProductDesigner.prototype.callDialogContent('edit', 'SHARE YOUR DESIGN', null, false);

						// add front image to temporary canvas
						ctx.drawImage(img, 0, -1);

						// load the back image
						var img2 = new Image();
						img2.crossOrigin = "Anonymous";
						img2.src = viewsDataURL[1];
						img2.onload = function() {
							img2.crossOrigin = "Anonymous";
							// Keep dialogue box open
							FancyProductDesigner.prototype.callDialogContent('edit', 'SHARE YOUR DESIGN', null, false);

							// add back image to temporary canvas
							ctx.drawImage(img2, 0, 1198);

							// Keep dialogue box open
							FancyProductDesigner.prototype.callDialogContent('edit', 'SHARE YOUR DESIGN', null, false);

							setTimeout(function(){ 
								// Keep dialogue box open
								FancyProductDesigner.prototype.callDialogContent('edit', 'SHARE YOUR DESIGN', null, false);
								var share_image = canvas.toDataURL("image/jpeg");
								var share_to = $(shareElem).data('share');
								$.ajax({
									type: 'POST',
									url: fpfCommonParams.ajaxurl,
									data: {
									  'action': 'fpf_share_image',
									  'share_image': share_image,
									  'share_to': share_to
									},
									success: function(data) {
										window.open(data);
										// remove watermark
										printableArea.opacity = 1;
										printableArea.visible = false;
										FancyProductDesigner.prototype.removeElement('Watermark');

										// Keep dialogue box open
										FancyProductDesigner.prototype.callDialogContent('edit', 'SHARE YOUR DESIGN', null, false);

										$('.fpd-content-share-spin').html('');
										$('.fpf-share-btn').css('opacity', '1');
										$('.fpf-share-btn').css('cursor', 'pointer');
									},
									error: function(error) {
										//console.log(error);
									}
								}); // end ajax
							}, 1000); // end ajax timeout wrap
						}; // end img 2
					}; // end img 1
				}, 1000);
			});
		} // end fpfCommonParams.share == 1
	}

	// Init designer toolbar actions
	function fpf_init_toolbar() {

		var start_dropdown = function() {
			// Make sure the dimensions label has been removed
			FancyProductDesigner.prototype.deselectElement();
			var currentObjects = getCurrentStage().getObjects();
			var showDimensionsBox
			var currentViewIndex = currentObjects.length;
			var my_stage = getCurrentStage();
			for(var i=0; i < currentObjects.length; ++i) {
				if (currentObjects[i]['title'] == 'Show Dimensions') {
					showDimensionsBox = currentObjects[i];
					my_stage.remove(showDimensionsBox);
					my_stage.renderAll();
					my_stage.calcOffset();
				}
			} // end objects loop
			// Hide the print area
			if (typeof(printableArea) != 'undefined') {
				printableArea.visible = false;
			}
		};

		// When drop down action menu is clicked take the following actions
		$('.fpf_action_label').prev().on('click', function() {
			start_dropdown();
		});
		$('.fpf_action_label').on('click', function() {
			start_dropdown();
		});

		$('.fpd-dropdown').on('click', function() {
			// Make sure the dimensions label has been removed
		});

		// When loading a saved design make sure to set our is it loaded variable
		$('.fpd-load-saved-products').on('click', function() {
			fpf_loaded = 2;
		});
	}

	// Define custom fabric mask filter
	function fpf_init_custom_filter() {
		fabric.Image.filters.MaskFilter = fabric.util.createClass({
			type: 'MaskFilter',
			initialize: function(options) {
				this.mask = options.mask || null;
				this.channel = [ 0, 1, 2, 3 ].indexOf( options.channel ) > -1 ? options.channel : 0;
			},
			applyTo: function(canvasEl) {
				if(!this.mask) return;
				var context = canvasEl.getContext('2d'),
					imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height),
					data = imageData.data,
					maskEl = this.mask._originalElement,
					maskCanvasEl = fabric.util.createCanvasElement(),
					channel = this.channel,
					i;
				maskCanvasEl.width = imageData.width;
				maskCanvasEl.height = imageData.height;
				maskEl.width = imageData.width;
				maskEl.height = imageData.height;
	
				maskCanvasEl.getContext('2d').drawImage(maskEl, 0, 0, maskEl.width, maskEl.height);
				var maskImageData = maskCanvasEl.getContext('2d').getImageData(0, 0, maskEl.width, maskEl.height),
					
					maskData = maskImageData.data;
					maskImageData.crossOrigin = "Anonymous";
					
				for ( i = 0; i < imageData.width * imageData.height * 4; i += 4 ) {
					if (data[ i + 3 ] == 0) {
						data[ i + 3 ] = 0;
					} else {
						mask_alpha = maskData[ i + 3 ];
						mask_alpha = 255-mask_alpha;
						data[ i + 3 ] = mask_alpha;
					}
				}
				context.putImageData( imageData, 0, 0 );
			}
		});
	}

	// Extends FancyProductDesigner.addElement
	function fpf_extend_prototype_add_element() {
		// Save the original function to override it
		var fpf_addElement = FancyProductDesigner.prototype.addElement;
		// Hook Fancy Product Designer API when an element is added to the stage
		console.log(FancyProductDesigner);
		FancyProductDesigner.prototype.addElement = function(type, source, title, params, viewIndex) {
			console.log('addElement');
			var returnValue = fpf_addElement.apply(this, arguments);
			var my_stage = getCurrentStage();
			my_stage.renderAll();
			return returnValue;
		};
	}

	// Adjust position of modal
	function adjust_modal() {
		if (fpfCommonParams.adjust_modal == 'true') {
			var new_modal_top = $('.fpd-draggable-dialog').css('top');
			new_modal_top = new_modal_top.replace('px', '');

			if (modal_top == '' && new_modal_top < 10) {
				modal_top = '10px';
			}

			$('.fpd-draggable-dialog').css('top', modal_top);
			$('.fpd-draggable-dialog').css('left', modal_left);
		}
	}

	// managedDimensionLabel()
	function managedDimensionLabel(object, action, currentViewIndex) {
		if (fpfCommonParams.is_admin == true) {
			return false;
		}
		var my_stage = getCurrentStage();
		if (action == 'moving' || action == 'rotating') {
			action = 'scale';
			//action = 'hide';
		}
		if (action == 'hide') {
			dimensionLabel.set({
				visible: false,
			});
			return true;	
		} else if (action == 'remove') {
			my_stage.remove(dimensionLabel);
			my_stage.renderAll();
			my_stage.calcOffset();
			return true;
		}
		var height = object.params['y'];
		var width = object.params['x'];
		var scale = object.params['scale'];
		var dpi = fpfCommonParams.dpi;
		var top = object['top'];
		var scaled_height = height*scale;
		var newParams = [];
		newParams['title'] = 'Show Dimensions';
		var dimensionLabelWidth = fpfCommonParams.dimensionLabelWidth;
		dimensionLabelWidth = dimensionLabelWidth*scale;
		if (dimensionLabelWidth < 95.6) {
			dimensionLabelWidth = 95.5
		} else if (dimensionLabelWidth > fpfCommonParams.dimensionLabelWidth) {
			dimensionLabelWidth	= fpfCommonParams.dimensionLabelWidth;
		}
		newParams['x'] = object.params['x'] - ((dimensionLabelWidth));
		newParams['y'] = ((height) + ((object['height']*object['scaleY'])/2));
		if (typeof(object.clippingRect) != 'undefined') {
			var maxHeight = object.clippingRect['top'] + object.clippingRect['height']
		} else {
			var maxHeight = 0;
		}
		if (newParams['y'] > maxHeight) {
			newParams['y'] = maxHeight;
		}
		if (typeof(object.clippingRect) != 'undefined') {
			if (typeof(object.clippingRect['top']) != 'undefined') {
				if (newParams['y'] < object.clippingRect['top']) {
					newParams['y'] = object.clippingRect['top'];
				}
			}
		}
		newParams['isCustom'] = false;
		newParams['selectable'] = false;
		newParams['filter'] = false;
		newParams['scale'] = 1;
		var new_height = (object.height*scale)/dpi;
		var new_width = (object.width*scale)/dpi;
		var text = ' Height: ' + new_height.toPrecision(2) + '" Width: ' + new_width.toPrecision(2) + '" ';
		var font_size = fpfCommonParams.fontSize * scale;
		if(font_size < 21) {
			font_size = 20;
		} else if (font_size > fpfCommonParams.fontSize) {
			font_size = fpfCommonParams.fontSize;
		}
	
		if (action == 'add') {
			var newDimensionLabel = new fabric.Text(text, {
				id: String(new Date().getTime()),
				textBackgroundColor: 'rgb(106,90,59)',
				fill: '#fff',
				fontFamily: 'Futura',
				fontSize: font_size,
				top: newParams['y'],
				left: newParams['x'],
				scale: 1,
				scaleX: 1,
				scaleY: 1,
				selectable: newParams['selectable'],
				title: 'Show Dimensions',
				visible: true,
				viewIndex: currentViewIndex+1,
				params: newParams
			});
			dimensionLabel = newDimensionLabel;
			my_stage.add(dimensionLabel);
		} else if (action == 'scale') {
			dimensionLabel.set({
				text: ' Height: '+ new_height.toPrecision(2) + '" Width: ' + new_width.toPrecision(2) + '" ',
				visible: true,
				params: newParams,
				scale: 1,
				scaleX: 1,
				scaleY: 1,
				fontSize: font_size
			});
			dimensionLabel.setTop(newParams['y']);
			dimensionLabel.setLeft(newParams['x']);
			dimensionLabel.setCoords();		
		}
		return true;
	}

	// clickCustomFilter()
	function clickCustomFilter(activeObject, btn) {
		var my_stage = getCurrentStage();
		var customFilter = $(btn).data('filter');
		var customFilterTitle = $(btn).data('filter-title');
		// Get our textures
		var textures = fpfCommonParams.textures;
		var textures_obj  = $.parseJSON( textures );
		var btn_count = 1;

		// Create our custom code for each texture
		$.each(textures_obj, function(texture_name, texture_values) {
			if (customFilter == 'fpf'+btn_count) {
				overlay = activeObject.source;
				var texture = texture_name;
				mask_img = texture_values['texture'];
			}
			++btn_count;
		});

		if (elemType == 'text') {
			if (customFilter == 'fpf0') {
				currentColor = activeObject.params['currentColor'];
				newParams = activeObject.params;
				newParams['pattern'] = '';
				FancyProductDesigner.prototype.setElementParameters(activeObject, newParams);
			} else {
				fabric.Image.fromURL(mask_img, function(img) {
					var fill_scale = activeObject.params['scale'];

					img.width = activeObject.params['x'];
					img.height = activeObject.params['y'];
					
					img.scaleToWidth(100/fill_scale);

					var patternSourceCanvas = new fabric.StaticCanvas();
					patternSourceCanvas.add(img);
					var pattern = new fabric.Pattern({
					  source: function() {
						patternSourceCanvas.setDimensions({
						  width: img.getWidth(),
						  height: img.getHeight()
						});
						return patternSourceCanvas.getElement();
					  },
					  repeat: 'repeat'
					});
					activeObject.fill = pattern;
					my_stage.renderAll();
					$('#select2-enka-container').trigger('change');
				});
			}
			// remove executing data from filter buttons
			$('body').data('executing', false);
			// End elemType - text
		} else if (elemType == 'image') {
			// remove any previous mask filter
			var originalSource = activeObject.params['originalSrc'];
			if (customFilter != 'fpf0') {
				// original FPF loading image has been disabled
				/*
				var loadingParams = [];
				loadingParams['scaleX'] = 1;
				loadingParams['scaleY'] = 1;
				loadingParams['scale'] = 1;
				loadingParams['degree'] = 0;
				loadingParams['autoCenter'] = true;
				loadingParams['zChangeable'] = false;
				loadingParams['boundingBox'] = "Base";
				loadingParams['boundingBoxClipping'] = 1;
				var loading = fpfCommonParams.loading_pic;
				FancyProductDesigner.prototype.addElement('image', loading, 'Load Mask Filter', loadingParams);
				*/
				// use built in FPD loading screen
				$('.fpd-full-loader').addClass('fpf_show');
				new fabric.Image.fromURL( overlay , function( img ){});
			}
			if (originalSource) {
				var newParams = activeObject.params;
				var newTitle = activeObject.title;
				var newViewIndex = activeObject.viewIndex;
				FancyProductDesigner.prototype.removeElement(newTitle);
				var tmp = activeObject;
				if (customFilter != 'fpf0') {
					newParams['originalScaleX'] = newParams['scaleX'];
					newParams['originalScaleY'] = newParams['scaleY'];
					newParams['originalScale'] = newParams['scale'];
					newParams['scaleX'] = 0.001;
					newParams['scaleY'] = 0.001;
					newParams['scale'] = 0.001;
				}
				FancyProductDesigner.prototype.addElement('image', originalSource, newTitle, newParams, newViewIndex);
				FancyProductDesigner.prototype.callDialogContent('edit', 'EDIT THIS GARMENT', null, false);
				if (customFilter == 'fpf0') {
					// reopen dialog box - set delay to give element time to be added
					setTimeout(function(){ 
						var stageObjects = my_stage.getObjects();
						$.each(stageObjects, function(i, v) {
							if(stageObjects[i].title == newTitle) {
								thisElem = stageObjects[i];
							}
						});
						my_stage.setActiveObject(thisElem);
						// remove executing data from filter buttons
						$('body').data('executing', false);
					}, 1000);
				}
				$('.fpd-filter-options').removeClass('fpd-hidden');
				$('.fpd-transform-options').removeClass('fpd-hidden');
				$('.fpd-helper-btns').removeClass('fpd-hidden');
			} // end remove previous mask filter
			// load overlay
			if (customFilter != 'fpf0') {
				if (typeof(activeObject.originParams.source) == 'undefined') {
					var original = overlay;
				} else {
					var original = activeObject.originParams.source;
				}
				new fabric.Image.fromURL( original , function( img ){
					image = img;
					// load mask inside overlay
					new fabric.Image.fromURL( mask_img , function( img ){
						mask1 = img;
			
						// push mask filter
						image.filters.push( new fabric.Image.filters.MaskFilter( { 'mask': mask1 } ) );
						
						// apply mask filter
						image.applyFilters( function() {
							var newParams = activeObject.params;
							if (typeof(newParams['originalSrc']) == 'undefined') {
								newParams['originalSrc'] = activeObject.source;
							}
							if (typeof(newParams['originalScale']) != 'undefined') {
								newParams['scaleX'] = newParams['originalScaleX'];
								newParams['scaleY'] = newParams['originalScaleY'];
								newParams['scale'] = newParams['originalScale'];
							}
							newParams['customFilterTitle'] = customFilterTitle;
							var newTitle = activeObject.title;
							var newViewIndex = activeObject.viewIndex;
							FancyProductDesigner.prototype.removeElement(newTitle);
							// remove loading image
							$('.fpd-full-loader').removeClass('fpf_show');
							// original FPF loading image has been disabled
							//FancyProductDesigner.prototype.removeElement('Load Mask Filter');
							FancyProductDesigner.prototype.addElement('image', image._element.src, newTitle, newParams, newViewIndex);
							FancyProductDesigner.prototype.callDialogContent('edit', 'EDIT YOUR DESIGN', null, false);
							// reopen dialog box - set delay to give element time to be added
							setTimeout(function(){ 
								var stageObjects = my_stage.getObjects();
								$.each(stageObjects, function(i, v) {
									if(stageObjects[i].title == newTitle) {
										thisElem = stageObjects[i];
									}
								});
								my_stage.setActiveObject(thisElem);
								// remove executing data from filter buttons
								$('body').data('executing', false);
							}, 1000);
							// FancyProductDesigner.prototype.callDialogContent('edit', 'EDIT YOUR DESIGN', null, false);
							$('.fpd-filter-options').removeClass('fpd-hidden');
							$('.fpd-transform-options').removeClass('fpd-hidden');
							$('.fpd-helper-btns').removeClass('fpd-hidden');
						}); // end apply filter
					} ); // end new fabric image mask
				} ); // end new fabric image overlay
			} // end if not customFilter fpf0
		} // end elemType - image
	}


	// fpf_add_watermark()
	function fpf_add_watermark() {
		var my_stage = getCurrentStage();
		// Define watermark
		var watermark = fpfCommonParams.watermark_url;
		// Add Watermark
		var waterParams = [];
		waterParams['title'] = 'Watermark';
		waterParams['isCustom'] = false;
		waterParams['selectable'] = false;
		waterParams['filter'] = false;
		waterParams['scale'] = 1;
		var h = fpfCommonParams.watermark_height;
		var w = fpfCommonParams.watermark_width;
		waterParams['x'] = my_stage.width-parseInt(w)+parseInt(fpfCommonParams.water_mark_left);
		waterParams['y'] = 0+parseInt(h)+parseInt(fpfCommonParams.water_mark_top);
		waterParams['opacity'] = fpfCommonParams.watermark_opacity
		FancyProductDesigner.prototype.addElement('image', watermark, 'Watermark', waterParams, 0);
	}

	// fpf_add_product_details()
	function fpf_add_product_details() {
		var my_stage = getCurrentStage();
		var title = fpfCommonParams.title;
		var obj_width, obj_height, color_obj, color_obj2, color_obj3, color_obj4, color_obj5, color_obj6, file, dimensions, color, color2, color3, color4, color5, color6, filterTitle, object_scale, object_new_height, object_new_width;
		var fileText = '';
		var fileTextBack = '';
		var object_dpi = fpfCommonParams.dpi;
		var customItems = [];

		// Loop stage objects and get info on each custom item and the color layer
		var stageObjects = my_stage.getObjects();
		$.each(stageObjects, function(i, v) {
			// Get the Dimensions obj
			if (stageObjects[i].title == fpfCommonParams.colorLayerTitle ) {
				color_obj = stageObjects[i];
			}
			if (stageObjects[i].title == 'Body Color' ) {
				color_obj2 = stageObjects[i];
			}
			if (stageObjects[i].title == 'Liner Color' ) {
				color_obj3 = stageObjects[i];
			}
			if (stageObjects[i].title == 'Cord Color' ) {
				color_obj4 = stageObjects[i];
			}
			if (stageObjects[i].title == 'Zipper Color' ) {
				color_obj5 = stageObjects[i];
			}
			if (stageObjects[i].title == 'Sleeve Color' ) {
				color_obj6 = stageObjects[i];
			}
			if (stageObjects[i].params['isCustom'] == true) {
				if (typeof(customItems[stageObjects[i].title]) == 'undefined') {
					customItems[stageObjects[i].title] = [];
				}
				if (typeof(stageObjects[i].params.customFilterTitle) != 'undefined') {
					customItems[stageObjects[i].title]['filter'] = stageObjects[i].params.customFilterTitle;
				} else {
					customItems[stageObjects[i].title]['filter'] = 'No Filter added';
				}
				object_height = stageObjects[i].params['y'];
				object_width = stageObjects[i].params['x'];
				object_scale = stageObjects[i].params['scale'];
				object_new_height = (stageObjects[i].height*object_scale)/object_dpi;
				object_new_width = (stageObjects[i].width*object_scale)/object_dpi;
				customItems[stageObjects[i].title]['dimensions'] = ' Height: ' + object_new_height.toPrecision(2) + '" Width: ' + object_new_width.toPrecision(2) + '" ';
				if (stageObjects[i].viewIndex == 0) {
					fileText = fileText + ' \n ';
					fileText = fileText + ' File: ' + stageObjects[i].title + ' \n ';
					fileText = fileText + ' Dimensions: ' + customItems[stageObjects[i].title]['dimensions'] + ' \n ';
					fileText = fileText + ' Filter: ' + customItems[stageObjects[i].title]['filter'] + ' \n ';
				} else {
					fileTextBack = fileTextBack + ' \n ';
					fileTextBack = fileTextBack + ' File: ' + stageObjects[i].title + ' \n ';
					fileTextBack = fileTextBack + ' Dimensions: ' + customItems[stageObjects[i].title]['dimensions'] + ' \n ';
					fileTextBack = fileTextBack + ' Filter: ' + customItems[stageObjects[i].title]['filter'] + ' \n ';
				}
			}
		});
		
		if (undefined !=color_obj) {
			color = 'Garment Color: ' + color_obj.params.currentColor;
		} else {
			color = '';
		}
		if (undefined !=color_obj2) {
			//console.log('we have a body color');
			color2 = 'Body Color: ' + color_obj2.params.currentColor;
		} else {
			color2 = '';
		}
		if (undefined !=color_obj3) {
			color3 = 'Liner Color: ' + color_obj3.params.currentColor;
		} else {
			color3 = '';
		}
		if (undefined !=color_obj4) {
			color4 = 'Cord Color: ' + color_obj4.params.currentColor;
		} else {
			color4 = '';
		}
		if (undefined !=color_obj5) {
			color5 = 'Zipper Color: ' + color_obj5.params.currentColor;
		} else {
			color5 = '';
		}
		if (undefined !=color_obj6) {
			//console.log('we have a sleeve color');
			color6 = 'Sleeve Color: ' + color_obj6.params.currentColor;
		} else {
			color6 = '';
		}
		
		
		
		var PDFtext = ' ' + title + ' \n ';
		PDFtext = PDFtext + color + ' \n ';
		if (color2){PDFtext = PDFtext + color2 + ' \n ';}
		if (color3){PDFtext = PDFtext + color3 + ' \n ';}
		if (color4){PDFtext = PDFtext + color4 + ' \n ';}
		if (color5){PDFtext = PDFtext + color5 + ' \n ';}
		if (color6){PDFtext = PDFtext + color6 + ' \n ';}
		PDFtext = PDFtext + fileText + ' \n ';
		// Build label parameters
		var font_size = fpfCommonParams.fontSize;
		var newParams = [];
		newParams['title'] = 'PDF Label';
		newParams['x'] = 5;
		newParams['y'] = 5;
		newParams['isCustom'] = false;
		newParams['selectable'] = false;
		newParams['filter'] = false;
		newParams['scale'] = 1;
		var PDFLabel = new fabric.Text(PDFtext, {
			id: String(new Date().getTime()),
			text: PDFtext,
			textBackgroundColor: 'rgb(255,255,255)',
			fill: '#000000', //a78f60
			fontFamily: 'Futura',
			fontSize: (font_size-4),
			top: newParams['y'],
			left: newParams['x'],
			scale: 1,
			scaleX: 1,
			scaleY: 1,
			selectable: newParams['selectable'],
			title: newParams['title'],
			visible: true,
			viewIndex: 0,
			params: newParams
		});
		// Add the PDF text label
		my_stage.add(PDFLabel);
		PDFLabel.setTop(newParams['y']);
		PDFLabel.setLeft(newParams['x']);
		
		// Build Back Label
		var PDFtextBack = ' ' + title + ' \n ';
		PDFtextBack = PDFtextBack + color + ' \n ';
		if (color2){PDFtext = PDFtext + color2 + ' \n ';}
		if (color3){PDFtext = PDFtext + color3 + ' \n ';}
		if (color4){PDFtext = PDFtext + color4 + ' \n ';}
		if (color5){PDFtext = PDFtext + color5 + ' \n ';}
		if (color6){PDFtext = PDFtext + color6 + ' \n ';}
		PDFtextBack = PDFtextBack + fileTextBack + ' \n ';
		// Build label parameters
		var font_size = fpfCommonParams.fontSize;
		var backParams = [];
		backParams['title'] = 'PDF Label Back';
		backParams['x'] = 5;
		backParams['y'] = 5;
		backParams['isCustom'] = false;
		backParams['selectable'] = false;
		backParams['filter'] = false;
		backParams['scale'] = 1;
		var PDFLabel = new fabric.Text(PDFtextBack, {
			id: String(new Date().getTime()),
			text: PDFtextBack,
			textBackgroundColor: 'rgb(255,255,255)',
			fill: '#000000', //a78f60
			fontFamily: 'Futura',
			fontSize: (font_size-4),
			top: backParams['y'],
			left: backParams['x'],
			scale: 1,
			scaleX: 1,
			scaleY: 1,
			selectable: backParams['selectable'],
			title: backParams['title'],
			visible: true,
			viewIndex: 1,
			params: backParams
		});
		// Add the PDF text label
		my_stage.add(PDFLabel);
		PDFLabel.setTop(backParams['y']);
		PDFLabel.setLeft(backParams['x']);
		
		// Render Changes
		my_stage.renderAll();
		my_stage.calcOffset();
	}

	// fpf_send_quote()
	function fpf_send_quote() {
		var quote_form = $('[name="fpd_shortcode_form"]');
		var fld_name = '';
		var flds = {};
		var validate = 0;
		$('[name="fpd_shortcode_form"] [name]').each(function(index, element) {
			if (typeof($(element).attr('name')) != 'undefined') {
				//data = data + ',' + $(element).attr('name') + ':' + $(element).val();
				fld_name = $(element).attr('name');
				fld_value = $(element).val();
				if (fld_name != 'fpd_shortcode_form_name' && fld_name != 'fpd_shortcode_form_email' && fld_name !='project_title') {
					$(element).val('');
				}
				if(fld_name == 'quantity_field'){
					if(fld_value > 149){
						validate = validate + 1;
					} else{
						$(element).val('');
						$(element).addClass('incomplete');
						var errorMSG = 'Please enter a number of 150 or greater in the quantity field';
					}
				}
				if (fld_name == 'fpd_shortcode_form_name' || fld_name == 'fpd_shortcode_form_email' || fld_name == 'date_need_by') {
					if (fld_value != '') {
						validate = validate + 1;
					} else {
						$(element).addClass('incomplete');
					}
				}
				flds[fld_name] = fld_value; 
			}
		});
		if (validate == 4) {
			$('.fpd-full-loader').addClass('fpf_show');
			$('[name="fpd_shortcode_form"]').slideUp();
			quote_form.before('<div class="sending_quote"><div class="sending_quote_title">'+fpfCommonParams.sending_quote_request_message+'</div><img alt="Sending" src="'+fpfCommonParams.sending+'" /></div>');
			var product = fancyProductDesigner.getProduct();
			flds.product = JSON.stringify(product);
			flds.action = 'fpf_send_quote';
			fpf_add_watermark();
			fpf_add_product_details();
			if (typeof(printableArea) != 'undefined') {
				printableArea.opacity = 0;
			}
			setTimeout(function(){ 
				// Create temp canvas, add image as jpeg, reduce size and send to server
				var img = document.createElement("img");
				var canvas = document.createElement("canvas");
				canvas.width = 800;
				canvas.height = 2398;
				var ctx = canvas.getContext("2d");

				// Get a list of current views
				var viewsDataURL = FancyProductDesigner.prototype.getViewsDataURL(),
					images = new Array(),
					imageLoop = 0;

					// load the front image
					var img = new Image();
					img.crossOrigin = "Anonymous";
					img.src = viewsDataURL[0];
					img.onload = function() {
						// add front image to temporary canvas
						ctx.drawImage(img, 0, -1);
						img.crossOrigin = "Anonymous";
						// load the back image
						var img2 = new Image();
						img2.crossOrigin = "Anonymous";
						img2.crossOrigin = "Anonymous";
						img2.src = viewsDataURL[1];
						img2.onload = function() {
							// add back image to temporary canvas
							ctx.drawImage(img2, 0, 1198);
					
							// convert tempoary canvas to jpeg
							var product_image = canvas.toDataURL("image/jpeg");
							flds.product_image = product_image;

							setTimeout(function(){ 
								$.ajax({
									type: 'POST',
									url: fpfCommonParams.ajaxurl,
									data: flds,
									success: function(response) {
										// remove our extra details
										FancyProductDesigner.prototype.removeElement('PDF Label');
										FancyProductDesigner.prototype.removeElement('PDF Label Back');
										FancyProductDesigner.prototype.removeElement('Watermark');
										// reset printArea
										if (typeof(printableArea) != 'undefined') {
											printableArea.opacity = 1;
										}
										$('.sending_quote').html('<div class="quote_received">'+fpfCommonParams.quote_sent_message+'</div>');
										$('.fpd-full-loader').removeClass('fpf_show');
										setTimeout(function(){
											$('.sending_quote').remove();
											$('[name="fpd_shortcode_form"]').slideDown();
										}, 5000);
									},
									error: function(error) {
										$('.sending_quote').html('<div class="quote_received">An error occurred - your quote was not sent.</div>');
										$('.fpd-full-loader').removeClass('fpf_show');
										$('[name="fpd_shortcode_form"]').slideDown();
										setTimeout(function(){
											$('.sending_quote').remove();
										}, 5000);
									}
								});
							}, 1200);								
						};
					};
			}, 1000);
		} else {
			alert('You did not fill out all the required information, or some information is incorrect.');
		}
	}

	// Init price quote form
	function fpf_init_quote_form() {
		// Is there a quote form on the page?
		if (typeof($('form[name="fpd_shortcode_form"]')) != 'undefined') {
			if ($('form[name="fpd_shortcode_form"]').attr('name') == 'fpd_shortcode_form') {
				// Create new fields to add to form
				if (acf_product_stylenumber && acf_product_title) {
					var page_title = '<p class="h2 text-gold style-num margin-bottom-0">'+acf_product_stylenumber+'</p><h1 class="h2 normalcase product-name">'+acf_product_title+'</h1>'
				}
				else {
					var page_title = fpfCommonParams.title;
				}
				
				$('form[name="fpd_shortcode_form"]').prepend('<div class="fpf_quote_title">'+page_title+'</div><p style="text-align:center;">want to see a different item?<br><a class="button small" href="/our-products/">See More Bodystyles</a></p><div class="fpf_step_three">Step 4: Request a Quote</div>');
				var form_input = $('.fpd-shortcode-form-text-input:nth-of-type(2)');
				
				var project_title = '<label>'+fpfCommonParams.project_title_placeholder+'</label><input type="text" name="project_title" class="fpd-shortcode-form-text-input project_title" />';
				$('.fpf_step_three').after(project_title);
				var quantity_field = '<label>'+fpfCommonParams.quantity_placeholder+'<span class="required">*</span></label><input type="text" name="quantity_field" class="fpd-shortcode-form-text-input quantity_field" />';
				var date_need_by = '<label>'+fpfCommonParams.date_needed_by_placeholder+'<span class="required">*</span></label><input type="text" name="date_need_by" class="fpd-shortcode-form-text-input date_need_by" onfocus="showCalendarControl(this);" />';
				var comment_field = '<label>'+fpfCommonParams.comments_placeholder+'</label><textarea name="comment_field" class="fpd-shortcode-form-text-input comment_field" />';
				var code_field = '<label>Promo code (optional)</label><input type="text" name="code_field" class="fpd-shortcode-form-text-input code_field" />';

				var new_btn = '<input type="button" value="Submit" class="fpf-submit-btn button">';
				var under_quote_message = fpfCommonParams.under_quote_message;
				// Get rid of the original submit button
				$('.fpd-blue-btn').remove();
				// Replace submit button with regular button
				form_input.after(new_btn);
				// Add our additional fields
				form_input.after(comment_field);
				// Add under quote message
				form_input.after('<span class="under_quote_message">'+under_quote_message+'</span>');

				form_input.after(date_need_by);
				form_input.after(code_field);
				form_input.after(quantity_field);

				// add labels and remove placeholders for the two original fields; name & email
				var your_name = $('[name="fpd_shortcode_form_name"]');
				$(your_name).before('<label>'+fpfCommonParams.name_placeholder+'<span class="required">*</span></label>');
				$(your_name).attr("placeholder", "");
				
				var your_email = $('[name="fpd_shortcode_form_email"]');
				$(your_email).before('<label>'+fpfCommonParams.email_placeholder+'<span class="required">*</span></label>');
				$(your_email).attr("placeholder", "");

				// Add bottom quote message
				var bottom_quote_message = fpfCommonParams.bottom_quote_message;
				$('input[type="button"].button').after('<div class="bottom_quote_message">'+bottom_quote_message+'<br><br><p>Need help? email us at <a href="mailto:info@goldengoodsusa.com">info@goldengoodsusa.com</a></p></div><div class="print-parameters"><table cellpadding="4" style="text-align:center; text-transform:uppercase;"><th>Graphic Print Size Guide</th><tr><td><h3>Standard Size</h3><h4>16" Wide X 18" Tall</h4></td></tr><tr><td><h3>Jumbo Size</h3><h4>19" Wide X 24" Tall</h4></td></tr><tr><td><h3>All Over Size</h3><h4>44" Wide X 36" Tall</h4></td></tr><tr><td><h3>Youth Size</h3><h4>12" Wide X 18" Tall</h4></td></tr><tr><td><h3>Infant Size</h3><h4>8" Wide X 10" Tall</h4></td></tr><tr><td><h3>Short Sleeve</h3><h4>4" Wide X 5" Tall</h4></td></tr><tr><td><h3>Long Sleeve</h3><h4>4" Wide X 15" Tall</h4></td></tr></table></div>');

			}
		} // end if there is a quote form

		// Quote button clicked
		$('.fpf-submit-btn').on('click', function() {
			fpf_send_quote();
		});

		// Make sure dimension box is gone when quote is submitted
		$('.fpd-shortcode-form-text-input').on('change', function () {
			var my_stage = getCurrentStage();
			var currentObjects = getCurrentStage().getObjects();
			var showDimensionsBox
			var currentViewIndex = currentObjects.length;
			for(var i=0; i < currentObjects.length; ++i) {
				if (currentObjects[i]['title'] == 'Show Dimensions') {
					showDimensionsBox = currentObjects[i];
					my_stage.remove(showDimensionsBox);
					my_stage.renderAll();
					my_stage.calcOffset();
				}
			} // end objects loop
			my_stage.renderAll();
		});
	}
	
	
	// hack to make sure dimension label on back view hides when custom element is not selected
	function hide_dimension_label() {
		setTimeout(function() {
			if ($('.fpd-draggable-dialog').css('display') == 'none') {
				if (typeof(dimensionLabel) != 'undefined') {
					var my_stage = getCurrentStage();
					my_stage.remove(dimensionLabel);
				}
			}
			hide_dimension_label();
		}, 500);
	}

	// Function to list Javascript object methods
	// Example use: console.log(getMethods(FancyProductDesigner.prototype));
	// Fancy Product Designer methods and events are described in detail at;
	// http://jsdoc.fancyproductdesigner.com/FancyProductDesigner.html
	function getMethods(obj) {
		var res = [];
		for(var m in obj) {
			if(typeof obj[m] == "function") {
				res.push(m)
			}
		}
		return res;
	}
	
});
