// JavaScript Document

jQuery.migrateMute = 1;
jQuery( document ).ready(function($) {
	var printableArea
	var masks = {};

	var fpf_loaded = false;

	let fpd_container = $('.fpd-product-designer-wrapper > .fpd-container');
	fpd_container.on('ready', function(evt) {
		fpf_init_note();
		fpf_init_custom_filter(); // Defines custom fabric filter
		fpf_init_quote_form();
		fpf_init_watermark_hack();

		// Disable GL filter
		fabric.enableGLFiltering = false;
	});

	function fpf_init_watermark_hack() {
		fabric.StaticCanvas.prototype.centerObject = function(object) {
			var center = {
				top: object.height / 2 + 30,
				left: this.width - object.width / 2 - 30
			};
		    return this._centerObject(object, new fabric.Point(center.left, center.top));
		}
	}

	// Helper function to get current stage of designer
	function getCurrentStage() {
		return fancyProductDesigner.currentViewInstance.stage;
	}

	function fpf_init_note() {

		if (fpfCommonParams.show_messages == true) {
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
			scaleHTML = '<div class="fpf-upload-scale">' + scaleHTML + '</div>';
			// Append our scaling message right under the Upload HTML
			$('.fpd-upload-form').before(scaleHTML);

			// Add text to helper buttons
			$('.fpd-center-horizontal').css('display', 'block');
			$('.fpd-center-horizontal').append('<div class="fpf-helper-btn-label">' + fpfCommonParams.helperCenterHorizontal + '</div>');
			$('.fpd-center-vertical').css('display', 'block');
			$('.fpd-center-vertical').append('<div class="fpf-helper-btn-label">' + fpfCommonParams.helperCenterVertical + '</div>');
			$('.fpd-flip-horizontal').css('display', 'block');
			$('.fpd-flip-horizontal').append('<div class="fpf-helper-btn-label">' + fpfCommonParams.helperFlipHorizontal + '</div>');
			$('.fpd-flip-vertical').css('display', 'block');
			$('.fpd-flip-vertical').append('<div class="fpf-helper-btn-label">' + fpfCommonParams.helperFlipVertical + '</div>');
			$('.fpd-reset-element').css('display', 'block');
			$('.fpd-reset-element').append('<div class="fpf-helper-btn-label">' + fpfCommonParams.helperResetElement + '</div>');

			var action_label = fpfCommonParams.action_label;
			$('.fpd-right .fpd-icon-more').after('<span class="fpf_action_label">' + action_label + '</span>');

		}
	}

	function fpf_init_custom_filter() {
		// Defind custom fabric mask filter
		fabric.Image.filters.Mask = fabric.util.createClass(fabric.Image.filters.BaseFilter, {
			type: 'Mask',
			initialize: function(options) {
				this.mask = options.mask || null;
				this.channel = [ 0, 1, 2, 3 ].indexOf( options.channel ) > -1 ? options.channel : 0;
		  	},
			applyTo2d: function(options) {
				if(!this.mask) return;
				let maskImage = this.mask._originalElement;
				let maskCanvas = fabric.util.createCanvasElement();
				let channel = this.channel;
				let userImageData = options.imageData;

				// Init mask image and canvas size
				maskCanvas.width = maskImage.width = userImageData.width;
				maskCanvas.height = maskImage.height = userImageData.height;
				// maskImage.crossOrigin = "Anonymous"

				maskCanvas.getContext('2d').drawImage(maskImage, 0, 0, maskImage.width, maskImage.height);
				let maskImageData = maskCanvas.getContext('2d').getImageData(0, 0, maskImage.width, maskImage.height);
				maskImageData.crossOrigin = "Anonymous";

				let maskData = maskImageData.data;
				let data = userImageData.data;
				let iLen = data.length;
				for ( let i = 0; i < iLen * 4; i += 4 ) {
					if (data[ i + 3 ] == 0) {
						data[ i + 3 ] = 0;
					} else {
						mask_alpha = maskData[ i + 3 ];
						mask_alpha = 255-mask_alpha;
						data[ i + 3 ] = mask_alpha;
					}
				}
			},
			fromObject: function(object) {
				return new fabric.Image.filters.Mask(object);
			}
		});

		// Override default getFilter function to inject custom filter

		// Get our textures
		var textures_obj = $.parseJSON(fpfCommonParams.textures);
		let orgGetFilter = FPDUtil.getFilter;
		FPDUtil.getFilter = function (type, opts) {
			// Apply the default getFilter function
			let filter = orgGetFilter.apply(null, [type, opts]);

			// Adds custom filter if matched
			if (null === filter && (type in textures_obj)) {
				filter = new fabric.Image.filters.Mask({ mask: masks[type] });
			}
			return filter;
		}

		// Adds Filter when clicking advanced editing
		$(document).on('click', '.fpd-tool-advanced-editing', function() {

			if (!$('.fpf-filters').length) {

				// Hide original filters
				$('.fpd-content-filters > div').css('display', 'none');

				// Add button to reset element to original
				var newFilterBtns = '<label>'+fpfCommonParams.texture_message+'</label>';
				newFilterBtns = newFilterBtns + '<div class="fpd-filter-fpf0 fpf-item fpf-filters fpf-filters-btn active" data-filter="fpf0" data-executing="no">';
					newFilterBtns = newFilterBtns + '<img class="fpf-filter-icon" src="'+fpfCommonParams.original_icon+'" title="'+fpfCommonParams.original_text+'" alt="'+fpfCommonParams.original_text+'" />';
					// newFilterBtns = newFilterBtns + '<div class="fpf-clear"></div>';
					newFilterBtns = newFilterBtns + '<div class="fpf-filter-icon-title">';
						newFilterBtns = newFilterBtns + fpfCommonParams.original_text;
					newFilterBtns = newFilterBtns + '</div>';
				newFilterBtns = newFilterBtns + '</div>';

				var btn_count = 1;

				// Create our custom button html for each texture
				$.each(textures_obj, function(texture_name, texture_values) {
					newFilterBtns = newFilterBtns + '<div class="fpd-filter-fpf'+btn_count+' fpf-item fpf-filters fpf-filters-btn" data-type="'+ texture_name + '" data-filter-title="'+ texture_name + '" data-filter="fpf'+btn_count+'" data-executing="no">';
						newFilterBtns = newFilterBtns + '<img class="fpf-filter-icon" src="'+texture_values['icon']+'" title="'+texture_name+'" alt="'+texture_name+'" />';
						// newFilterBtns = newFilterBtns + '<div class="fpf-clear"></div>';
						newFilterBtns = newFilterBtns + '<div class="fpf-filter-icon-title">';
							newFilterBtns = newFilterBtns + texture_name;
						newFilterBtns = newFilterBtns + '</div>';
					newFilterBtns = newFilterBtns + '</div>';
					++btn_count;

					// Prepare mask
					new fabric.Image.fromURL( texture_values['texture'] , function( img ){
						masks[texture_name] = img;
					}, { crossOrigin: 'Anonymous'} );
				});

				// Append our custom button HTML to the grid with the other filters
				$('.fpd-content-filters').append(newFilterBtns);

				// Adds custom css block to head
				// Change the canvas background color of image editor
				let color = fancyProductDesigner.currentViewInstance.getElementByTitle('Garment Color').fill;
				if ($('.filter-style').length == 0) {
					$('head').append('<style type="text/css" class="filter-style"></style>');
				}
				$('.filter-style').html(".fpd-image-editor-main:before {background: " + color + ";}");

			}
		});

		$(document).on('click', '.fpd-content-filters > div', function() {
			$(this).siblings().removeClass('active');
			$(this).addClass('active');
		});
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
			// fpf_add_watermark();
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
				var viewsDataURL = fancyProductDesigner.getViewsDataURL(),
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
										fancyProductDesigner.removeElement('PDF Label');
										fancyProductDesigner.removeElement('PDF Label Back');
										fancyProductDesigner.removeElement('Watermark');
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
				$('input.fpd-blue-btn').remove();
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

	// Function to list Javascript object methods
	// Example use: console.log(getMethods(fancyProductDesigner));
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
