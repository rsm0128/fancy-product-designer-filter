// JavaScript Document

jQuery.migrateMute = 1;
jQuery( document ).ready(function($) {
	var masks = {};

	var fpf_loaded = false;
	let fpf_current_element;
	let customFilters;

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

	// Function to add notes to image upload form
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

		// Store current element to local variable
		$('.fpd-container').on('elementSelect', function(evt, object) {
			if (null != object) {
				fpf_current_element = object;
			}
		});

		// Image advanced editing handler. Adds filters and ...
		$(document).on('click', '.fpd-tool-advanced-editing', function() {
			// Init filter data
			if (typeof(fpf_current_element.customFilters) == 'undefined') {
				fpf_current_element.customFilters = [];
			}

			let customFilters = [...fpf_current_element.customFilters];
			let newFilter = '';

			// Adds Filter when clicking advanced editing
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

			// Filter click action handler. Addes active class to active filter
			$('.fpd-image-editor-container').on('click', '.fpd-content-filters > div', function() {
				$(this).siblings().removeClass('active');
				$(this).addClass('active');
				newFilter = $(this).data('type');
			});

			// Save filter handler
			// save the data to customFilter value
			$('.fpd-image-editor-container').on('click', '.fpd-action-save', function(){
				if (newFilter) {
					customFilters.push(newFilter);
				}
				fpf_current_element.customFilters = customFilters;
			});

			// Restore original handler
			// reset the custom filter value to original
			$('.fpd-image-editor-container').on('click', '.fpd-action-restore', function(){
				customFilters = [];
			});

		});

	}

	// fpf_add_product_details()
	function fpf_add_product_details() {
		let fileTextFront = '';
		let fileTextBack = '';
		let objColors = {}; // Color title and value pair object.

		// Get all the objects
		let colorTitleArray = [fpfCommonParams.colorLayerTitle, 'Body Color', 'Liner Color', 'Cord Color', 'Zipper Color', 'Sleeve Color']; // All color titles used in goldengoodsusa.com

		// Get the color and custom filter attributes
		// Mutate objColors, fileTextFront, fileTextBack
		let object_dpi = fpfCommonParams.dpi;
		let viCount = fancyProductDesigner.viewInstances.length; // View Instance count
		for (let viIndex = 0; viIndex < viCount; viIndex++) {
			let viTitle = fancyProductDesigner.viewInstances[viIndex].title; // Title of i-th View Instance. Front or Back
			let viObjArray = fancyProductDesigner.getElements(viIndex); // All objects in i-th View Instance.
			for ( obj of viObjArray ) {
				// If it's a color object adds a color title&value pair
				if (colorTitleArray.includes(obj.title)) {
					objColors[obj.title] = obj.fill;
				}

				// If custom object
				if (obj.isCustom == true) {
					let real_width = (obj.width * obj.scale)/object_dpi;
					let real_height = (obj.height * obj.scale)/object_dpi;

					let filterText = ' \n ';
					filterText = filterText + ' File: ' + obj.title + ' \n ';
					filterText = filterText + ' Dimensions: ' + ' Height: ' + real_height.toPrecision(2) + '" Width: ' + real_width.toPrecision(2) + '" \n ';
					filterText = filterText + ' Filter: ' + ((obj.customFilters) ? obj.customFilters.join(',') : '') + ' \n ';

					if (viIndex == 0) {
						fileTextFront += filterText;
					} else {
						fileTextBack += filterText;
					}
				}

			}
		}

		// Prepare colorText
		let colorText = '';
		for (colorTitle of colorTitleArray) {
			if (objColors[colorTitle]) {
				colorText += colorTitle + ': ' + objColors[colorTitle] + ' \n';
			}
		}

		let title = fpfCommonParams.title;
		let font_size = fpfCommonParams.fontSize - 4;
		
		let PdfTextFront = ' ' + title + ' \n ';
		PdfTextFront += colorText;
		PdfTextFront += fileTextFront + ' \n ';

		// Build label parameters
		let x = 5;
		let y = 5;
		let PDFLabelFront = new fabric.Text(PdfTextFront, {
			id: String(new Date().getTime()),
			text: PdfTextFront,
			textBackgroundColor: 'rgb(255,255,255)',
			fill: '#000000', //a78f60
			fontFamily: 'Futura',
			fontSize: font_size,
			top: y,
			left: x,
			scale: 1,
			scaleX: 1,
			scaleY: 1,
			selectable: false,
			title: 'PDF Label',
			visible: true,
			viewIndex: 0,
		});
		// Add the PDF text label
		let my_stage = fancyProductDesigner.viewInstances[0].stage;
		my_stage.add(PDFLabelFront);
		// PDFLabelFront.setTop(y);
		// PDFLabelFront.setLeft(x);
		
		if ( fancyProductDesigner.viewInstances.length >= 2 ) {
			// Build Back Label
			let PdfTextBack = ' ' + title + ' \n ';
			PdfTextBack += colorText;
			PdfTextBack += fileTextBack + ' \n ';

			var PDFLabelBack = new fabric.Text(PdfTextBack, {
				id: String(new Date().getTime()),
				text: PdfTextBack,
				textBackgroundColor: 'rgb(255,255,255)',
				fill: '#000000', //a78f60
				fontFamily: 'Futura',
				fontSize: font_size,
				top: y,
				left: x,
				scale: 1,
				scaleX: 1,
				scaleY: 1,
				selectable: false,
				title: 'PDF Label Back',
				visible: true,
				viewIndex: 1,
			});
			// Add the PDF text label
			my_stage = fancyProductDesigner.viewInstances[1].stage
			my_stage.add(PDFLabelBack);
			// PDFLabelBack.setTop(backParams['y']);
			// PDFLabelBack.setLeft(backParams['x']);
		}
			
		// Render Changes
		my_stage.renderAll();
		my_stage.calcOffset();
	}

	function fpf_add_watermark() {
		let my_stage = fancyProductDesigner.viewInstances[0].stage;
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

		for (let vi of fancyProductDesigner.viewInstances) {
			vi.addElement('image', watermark, 'Watermark', waterParams, 0);
		}
	}

	// fpf_send_quote()
	function fpf_send_quote() {
		var quote_form = $('[name="fpd_shortcode_form"]');
		var flds = {}; // form data object
		var validate = 0;
		$('[name="fpd_shortcode_form"] [name]').each(function(index, element) {
			if (typeof($(element).attr('name')) != 'undefined') {
				//data = data + ',' + $(element).attr('name') + ':' + $(element).val();
				let fld_name = $(element).attr('name');
				let fld_value = $(element).val();

				// Empty fields except name, email and title
				if (fld_name != 'fpd_shortcode_form_name' && fld_name != 'fpd_shortcode_form_email' && fld_name !='project_title') {
					$(element).val('');
				}

				// Quantity value validator
				if(fld_name == 'quantity_field'){
					if(fld_value > 149){
						validate = validate + 1;
					} else{
						$(element).val('');
						$(element).addClass('incomplete');
						var errorMSG = 'Please enter a number of 150 or greater in the quantity field';
					}
				}

				// Required check
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

		// If all fields are valid
		if (validate == 4) {
			$('.fpd-full-loader').addClass('fpf_show');
			$('[name="fpd_shortcode_form"]').slideUp();
			quote_form.before('<div class="sending_quote"><div class="sending_quote_title">'+fpfCommonParams.sending_quote_request_message+'</div><img alt="Sending" src="'+fpfCommonParams.sending+'" /></div>');
			var product = fancyProductDesigner.getProduct();
			flds.product = JSON.stringify(product);
			flds.action = 'fpf_send_quote';
			fpf_add_watermark();
			fpf_add_product_details();

			setTimeout(function(){ 
				// Create temp canvas, add image as jpeg, reduce size and send to server
				var img = document.createElement("img");
				var canvas = document.createElement("canvas");
				canvas.width = 800;
				canvas.height = 2398;
				var ctx = canvas.getContext("2d");

				// Get a list of current views
				var viewsDataURL;
				fancyProductDesigner.getViewsDataURL(function(dataURLs){
					viewsDataURL = dataURLs;
				});
				var images = new Array(),
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
										if ( fancyProductDesigner.viewInstances[0] ) {
											fancyProductDesigner.viewInstances[0].removeElement('PDF Label');
											fancyProductDesigner.viewInstances[0].removeElement('Watermark');
										}
										if ( fancyProductDesigner.viewInstances[1] ) {
											fancyProductDesigner.viewInstances[1].removeElement('PDF Label Back');
											fancyProductDesigner.viewInstances[1].removeElement('Watermark');
										}

										$('.sending_quote').html('<div class="quote_received">'+fpfCommonParams.quote_sent_message+'</div>'); // Show the success message
										$('.fpd-full-loader').removeClass('fpf_show'); // Remove the loader

										setTimeout(function(){
											$('.quote-modal-close').click(); // Close the modal
											$('.sending_quote').remove(); // Remove the success message
											$('[name="fpd_shortcode_form"]').slideDown(); // Show form again
										}, 1000);
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

	function fpf_init_quote_form() {
		// Add graphic print size guide
		if ($('.fpd-content').length) {
			$('.fpd-content').append($('.print-parameters'));
			$('.print-parameters h5').click(function(){
				$(this).closest('.print-parameters').toggleClass('active');
			});
		}

		// Add step4 request quote button
		$('.fpd-navigation').append('<span class="request-quote"><span class="fpd-nav-icon fpd-icon-share-mail"></span><span class="fpd-label">Step 4: Request a Quote</span></span>');

		// Request quote button click handler
		$('.fpd-product-designer-wrapper').on('click', '.request-quote', function(){
			// Show the quote modal
			$('.quote-modal-overlay').addClass('active');
		});

		// Add shortcode form to quote modal
		$('.quote-modal-body').append($('form[name="fpd_shortcode_form"]'));

		// Add title field before name field
		$('[name="fpd_shortcode_form_name"]').before('<label>'+fpfCommonParams.project_title_placeholder+'</label><input type="text" name="project_title" class="fpd-shortcode-form-text-input project_title" />');

		// Add label to name field and hide placeholder
		$('[name="fpd_shortcode_form_name"]').before('<label>'+fpfCommonParams.name_placeholder+'<span class="required">*</span></label>');
		$('[name="fpd_shortcode_form_name"]').attr("placeholder", "");

		// Add label to email field and hide placeholder
		$('[name="fpd_shortcode_form_email"]').before('<label>'+fpfCommonParams.email_placeholder+'<span class="required">*</span></label>');
		$('[name="fpd_shortcode_form_email"]').attr("placeholder", "");

		// Add quantity, promo_code, date, message and comment field
		let fieldGroup = '<label>'+fpfCommonParams.quantity_placeholder+'<span class="required">*</span></label><input type="text" name="quantity_field" class="fpd-shortcode-form-text-input quantity_field" />';
		fieldGroup += '<label>Promo code (optional)</label><input type="text" name="code_field" class="fpd-shortcode-form-text-input code_field" />';
		fieldGroup += '<label>'+fpfCommonParams.date_needed_by_placeholder+'<span class="required">*</span></label><input type="date" name="date_need_by" class="fpd-shortcode-form-text-input date_need_by"" />';
		fieldGroup += '<span class="under_quote_message">'+fpfCommonParams.under_quote_message+'</span>';
		fieldGroup += '<label>'+fpfCommonParams.comments_placeholder+'</label><textarea name="comment_field" class="fpd-shortcode-form-text-input comment_field" />';
		fieldGroup += '<input type="button" value="Submit" class="fpf-submit-btn button">';
		fieldGroup += '<div class="bottom_quote_message">' + fpfCommonParams.bottom_quote_message + '<br><br><p>Need help? email us at <a href="mailto:info@goldengoodsusa.com">info@goldengoodsusa.com</a></p></div>';
		$('[name="fpd_shortcode_form_email"]').after(fieldGroup);

		// Get rid of the original submit button
		$('input.fpd-blue-btn').remove();

		// Hide the quote form if overlay clicked
		$('.quote-modal-overlay').click(function(e){
			if(e.target != this) return;
			$(this).removeClass('active');
		});

		// Quote form close button handler
		$('.quote-modal-close').click(function(){
			$('.quote-modal-overlay').removeClass('active');
		});

		// Send quote button click handler
		$('.fpf-submit-btn').on('click', function() {
			fpf_send_quote();
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