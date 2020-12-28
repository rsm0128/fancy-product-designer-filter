<?php
/**
* Plugin Name: Fancy Product Filters
* Plugin URI: http://codeable.io/
* Description:  Add Filters to the Fancy Product Designer PlugIn and add filter support to additional objects
* Author: Chuck Mailen, Cris
* Version: 2.0
* Author URI: http://bravetimes.com/
* License: GPL2
*/

/* Change Log

= 1.3.3 =
* Changed timing on when images are added to canvas when sharing

= 1.3.2 =
* Unknown changes made by Jessie Mantaky
* Note from Jessie: made it so nothing pops up on FPD load (no modal)
* revised send quote/send email to load slower to prevent blank PDFs from being sent in Safari and Firefox

= 1.3.1 =
* Added hack to make sure dimensionLabel vanishes on the back view when non custom element selected
* Added stripslashes and replaced " with &quote; when saving settings 

= 1.3.0 =
* Going up one version for debugging

= 1.2.9 =
* Added one last field to the quote form: 'Project Title' 
* Placeholders in quote form can now be set in admin area
* Added custom message under quote form
* Created email template system so outgoing emails can be customized

= 1.2.8 =
* Made revisions to load and save process

= 1.2.7 =
* Adjusted the timing on the initial page load to help streamline the process.
* Made sure the 'Email Design' feature will not show on the share page and will open correctly if the 'load design' feature has been clicked.
* Removed 'This design was sent to you by a friend' from the send email feature.
* Added a feature that drops a random unique id to the beginning of all "uploaded" images. 
* The end result here is that you should now be able to reuse the exact same image file multiple times.
* Disabled the custom loading image that displays when clicking on a filter, using the built in 'loading' panel instead.

= 1.2.6 =
* Changed PDF font back to futura

= 1.2.5 =
* Adding ability to change sending quote request message text
* Reenabled quote received message
* Changed font on PDF to Arial with a black fill (#000000)

= 1.2.4 =
* Going up one version for debugging

= 1.2.3 =
* Increased aJax timeout when saving admin settings

= 1.2.2 =
* Added ability to change watrermark top and left position

= 1.2.1 =
* Added option to change pintrest description
* Moved quote message to appear under the need by date

= 1.2.0 =
* Added email design to a friend feature
* Attaches PDF to email

= 1.1.9 =
* Added additional fields to quote form
* Rebuilt Quote form aJax handling to handle new fields
* Attached PDF to quote email

= 1.1.8 =
* Changed share image upload from png to jpeg
* Added all views to share image so back will be included
* Changed attachment page name of shared images to setting that can be changed

= 1.1.7 =
* Share button now compresses image into jpeg that is 70% the size of the original
* the smaller size makes it less likely to encounter a 413 error

= 1.1.6 =
* "Printable Area" only shows when the logo is selected 
* PDF print adds Watermark
* Watermark URL, height, width & opacity have settings
* PDF Print adds Post Title / Custom Art / Art dimensions/ Filter / Color used

= 1.1.5 =
* Moved position of quote success message
* Adjusted modal position
* Added modal position options
* Changed 'dimension' font to futura
* Option to swap out loading graphic
* Option to swap original filter icon and text
* Option to set maximum scale value
* Added css to pin popup modal on top left


*/
function fpf_activate() {
	$fpf_textures = get_option('fpf_textures', array());
	if (count($fpf_textures) < 1) {
		$fpf_textures = fpf_default_textures();
		update_option('fpf_textures', $fpf_textures);
	}
}
register_activation_hook( __FILE__, 'fpf_activate' );

if (!is_admin()) {
	// Load scripts and styles for front end editor
	add_action( 'wp_enqueue_scripts', 'fpf_enqueue_scripts' );	
} else {
	// Load scripts and styles for admin and include admin file
	if (isset($_GET['page'])) {
		if ($_GET['page'] == 'fancy_product_filters_admin_page') {
			add_action( 'admin_enqueue_scripts', 'fpf_enqueue_scripts_admin' );
		} else if ($_GET['page'] == 'fpd_orders') {
			// Load scripts and styles for front end editor
			add_action( 'admin_enqueue_scripts', 'fpf_enqueue_scripts' );
		}
	}
	require_once('admin/fancy-product-filters-admin.php');
}

function fpf_enqueue_scripts() {
	$settings = fpf_get_settings();
	$post = get_post();
	$post_id = get_the_ID();
	$term = $settings['premium_term'];
	$taxonomy = $settings['premium_taxonomy'];
	$title = get_the_title($post_id);
	get_the_terms( $post_id, $taxonomy);
	if (has_term( $term, $taxonomy, $post )) {
		$premiumProduct = true;
	} else {
		$premiumProduct = false;
	}
	$fpf_textures = get_option('fpf_textures', array());
	$fpf_textures_json = json_encode($fpf_textures);
	//check if this is admin
	$is_admin = false;
	if (isset($_GET['page'])) {
		if ($_GET['page'] == 'fpd_orders') {
			$is_admin = true;
		}
	}
	wp_register_script("fpf-js", plugins_url().'/fancy-product-filters/js/fancy-product-filters.js', array('jquery'), '1.3.0', true );
	if (strpos($settings['modal_top'], 'px') !== false) {
		$pixel_or_percent = 'px';
		$color_adjust_top = 153;
		$color_adjust_left = 156;
	} else if (strpos($settings['modal_top'], '%') !== false) {
		$pixel_or_percent = '%';
		$color_adjust_top = 18;
		$color_adjust_left = 14;
	} else {
		$pixel_or_percent = 'px';
		$color_adjust_top = 153;
		$color_adjust_left = 156;
	}
	$color_top = str_replace($pixel_or_percent, '', $settings['modal_top']);
	$color_top = intval($color_top);
	$color_top = ($color_top+$color_adjust_top).$pixel_or_percent;
	$color_left = str_replace('px', '', $settings['modal_left']);
	$color_left = intval($color_left);
	$color_left = ($color_left+$color_adjust_left).$pixel_or_percent;

	wp_localize_script( 'fpf-js', 'fpfCommonParams', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'plugin_path' => plugins_url().'/fancy-product-filters/',
		'spinner' => plugins_url().'/fancy-product-filters/images/wpspin_light-2x.gif',
		'sending' => plugins_url().'/fancy-product-filters/images/sending.gif',
		'sending_solid_back' => plugins_url().'/fancy-product-filters/images/sending_solid_back.gif',
		'textures' => $fpf_textures_json,
		'texture_message' => $settings['texture_message'],
		'scale_message' => $settings['scale_message'],
		'upload_message' => $settings['upload_message'],
		'show_messages' => $settings['show_messages'],
		'dpi' => $settings['dpi'],
		'dimensionLabelWidth' => $settings['dimensionLabelWidth'],
		'fontSize' => $settings['fontSize'],
		'colorLayerTitle' => $settings['colorLayerTitle'],
		'helperCenterHorizontal' => $settings['helperCenterHorizontal'],
		'helperCenterVertical' => $settings['helperCenterVertical'],
		'helperFlipHorizontal' => $settings['helperFlipHorizontal'],
		'helperFlipVertical' => $settings['helperFlipVertical'],
		'helperResetElement' => $settings['helperResetElement'],
		'colorPickerLabel' => $settings['colorPickerLabel'],
		'premiumProduct' => $premiumProduct,
		'choose_button' => $settings['choose_button'],
		'choose_button_font_size' => $settings['choose_button_font_size'],
		/*'loading_pic' => $settings['loading_pic'],*/
		'max_scale' => $settings['max_scale'],
		'original_icon' => $settings['original_icon'],
		'original_text' => $settings['original_text'],
		'social_share' => $settings['social_share'],
		'action_label' => $settings['action_label'],
		'adjust_modal' => $settings['adjust_modal'],
		'modal_top' => $settings['modal_top'],
		'modal_left' => $settings['modal_left'],
		'watermark_url' => $settings['watermark_url'],
		'watermark_width' => $settings['watermark_width'],
		'watermark_height' => $settings['watermark_height'],
		'watermark_opacity' => $settings['watermark_opacity'],
		'under_quote_message' => stripslashes($settings['under_quote_message']),
		'sending_quote_request_message' => stripslashes($settings['sending_quote_request_message']),
		'quote_sent_message' => stripslashes($settings['quote_sent_message']),
		'water_mark_top' => $settings['water_mark_top'],
		'water_mark_left' => $settings['water_mark_left'],
		'project_title_placeholder' => $settings['project_title_placeholder'],
		'name_placeholder' => $settings['name_placeholder'],
		'email_placeholder' => $settings['email_placeholder'],
		'quantity_placeholder' => $settings['quantity_placeholder'],
		'date_needed_by_placeholder' => $settings['date_needed_by_placeholder'],
		'comments_placeholder' => $settings['comments_placeholder'],
		'bottom_quote_message' => stripslashes($settings['bottom_quote_message']),
		'color_top' => $color_top,
		'color_left' => $color_left,
		'is_admin' => $is_admin,
		'title' => $title
	));
	wp_enqueue_script( 'fpf-js' );
	wp_register_script("fpf-calendar-js", plugins_url().'/fancy-product-filters/js/CalendarPopup.js' );
	wp_localize_script( 'fpf-calendar-js', 'cdCalendarParams', array(
		'jan' => __('January', 'car-demon'),
		'feb' => __('February', 'car-demon'),
		'mar' => __('March', 'car-demon'),
		'apr' => __('April', 'car-demon'),
		'may' => __('May', 'car-demon'),
		'jun' => __('June', 'car-demon'),
		'jul' => __('July', 'car-demon'),
		'aug' => __('August', 'car-demon'),
		'sep' => __('September', 'car-demon'),
		'oct' => __('October', 'car-demon'),
		'nov' => __('November', 'car-demon'),
		'dec' => __('December', 'car-demon'),
		'clear' => __('Clear', 'car-demon'), 
		'close_it' => __('Close', 'car-demon')
	));
	wp_enqueue_script( 'fpf-calendar-js' );
	wp_enqueue_style('fpf-css', plugins_url().'/fancy-product-filters/css/fancy-product-filters.css');
	wp_enqueue_style('fpf-calendar-css', plugins_url().'/fancy-product-filters/css/CalendarControl.css');
	// Adjust modal position if true
	if ($settings['adjust_modal'] == 'true') {
		echo '<style>';
			echo '
				.fpd-context-dialog.sticky {
					position: fixed !important;
					top: '.$settings['modal_top'].' !important;
					left: '.$settings['modal_left'].' !important;
				}
				.sp-container.sticky {
					position: fixed !important;
					top: '.$color_top.' !important;
					left: '.$color_left.' !important;
				}
			';
		echo '</style>';
	}
}

function fpf_enqueue_scripts_admin() {

	$templates_arr = fpf_get_default_templates();
	$templates = get_option('fpf_templates', $templates_arr);

	if (!isset($templates['admin_quote_email']['body'])) {
		$templates['admin_quote_email']['body'] = $templates_arr['admin_quote_email']['body'];
		$templates['admin_quote_email']['subject'] = $templates_arr['admin_quote_email']['subject'];
	}
	if (!isset($templates['user_quote_email']['body'])) {
		$templates['user_quote_email']['body'] = $templates_arr['user_quote_email']['body'];
		$templates['user_quote_email']['subject'] = $templates_arr['user_quote_email']['subject'];
	}
	if (!isset($templates['email_design']['body'])) {
		$templates['email_design']['body'] = $templates_arr['email_design']['body'];
		$templates['email_design']['subject'] = $templates_arr['email_design']['subject'];
	}

	$templates['admin_quote_email']['body'] = str_replace('&quot;', '"', $templates['admin_quote_email']['body']);
	$templates['user_quote_email']['body'] = str_replace('&quot;', '"', $templates['user_quote_email']['body']);
	$templates['email_design']['body'] = str_replace('&quot;', '"', $templates['email_design']['body']);

	$templates = json_encode($templates);
	// load the editor - not currently used
	//	fpf_ShowTinyMCE();
	// load other scripts
	wp_register_script("fpf-admin-js", WP_PLUGIN_URL.'/fancy-product-filters/js/fancy-product-filters-admin.js', array('jquery', 'jquery-ui-core', 'jquery-ui-tabs'), false, true );
	wp_localize_script( 'fpf-admin-js', 'fpfAdminCommonParams', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'spinner' => plugins_url().'/fancy-product-filters/images/wpspin_light-2x.gif',
		'plugin_path' => plugins_url().'/fancy-product-filters/',
		'templates' => $templates
	));
	wp_enqueue_script('media-upload');
	wp_enqueue_script('thickbox');
	wp_enqueue_script('fpf-admin-js');
	wp_enqueue_script('fabric-admin', plugins_url().'/fancy-product-filters/js/fabric.js');
	wp_enqueue_style('thickbox');
	wp_enqueue_style('fpf-admin-css', plugins_url().'/fancy-product-filters/css/fancy-product-filters-admin.css');
	wp_enqueue_style('fpf-admin-ui-css', 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.21/themes/smoothness/jquery-ui.css');
}

function fpf_default_textures() {
	$x = array();
	$plugin_folder_filters = plugins_url().'/fancy-product-filters/filters/';
	$plugin_folder_images = plugins_url().'/fancy-product-filters/images/';
	$x['Destroyed']['texture'] = $plugin_folder_filters.'Destroyed_sm.png';
	$x['Destroyed']['icon'] = $plugin_folder_images.'icon Destroyed.png';
	$x['Fadeout']['texture'] = $plugin_folder_filters.'Fadeout_sm.png';
	$x['Fadeout']['icon'] = $plugin_folder_images.'icon Fadeout.png';
	$x['Classic Distress']['texture'] = $plugin_folder_filters.'Golden Classic Distress_sm.png';
	$x['Classic Distress']['icon'] = $plugin_folder_images.'icon Golden Classic Distress.png';
	$x['Dark Distress']['texture'] = $plugin_folder_filters.'Golden Dark Distress_sm.png';
	$x['Dark Distress']['icon'] = $plugin_folder_images.'icon Golden Dark Distress.png';
	$x['Old Newsprint']['texture'] = $plugin_folder_filters.'Old Newsprint_sm.png';
	$x['Old Newsprint']['icon'] = $plugin_folder_images.'icon Old Newsprint.png';
	$x['Rollerpad Print']['texture'] = $plugin_folder_filters.'Rollerpad Print_sm.png';
	$x['Rollerpad Print']['icon'] = $plugin_folder_images.'icon Rollerpad Print.png';
	return $x;
}

function fpf_get_settings() {
	$default_settings = fpf_default_settings();
	$settings = get_option('fpf_settings', $default_settings);	
	foreach($default_settings as $key=>$value) {
		if (!isset($settings[$key])){
			$settings[$key] = urldecode($value);
		}
		if (isset($settings[$key])) {
			if (empty($settings[$key]) || $settings[$key] == '') {
				$settings[$key] = urldecode($value);
			}
		}
	}
	return $settings;
}

function fpf_default_settings() {
	$default_settings = array();
	$default_settings['texture_message'] = 'Distress your image';
	$default_settings['scale_message'] = 'Please note that image sizes are an estimate. Your dimensions will be finalized in your next proof.';
	$default_settings['upload_message'] = 'Accepted file types; .jpeg .png .bmp';
	$default_settings['show_messages'] = true;
	$default_settings['dpi'] = 72;
	$default_settings['dimensionLabelWidth'] = 191;
	$default_settings['fontSize'] = 40;
	$default_settings['colorLayerTitle'] = 'Shirt Color';
	$default_settings['helperCenterHorizontal'] = 'Center Horizontal';
	$default_settings['helperCenterVertical'] = 'Center Vertical';
	$default_settings['helperFlipHorizontal'] = 'Flip Horizontal';
	$default_settings['helperFlipVertical'] = 'Flip Vertical';
	$default_settings['helperResetElement'] = 'Reset Element';
	$default_settings['colorPickerLabel'] = 'Open the color wheel';
	$default_settings['premium_term'] = 'premium-collection';
	$default_settings['premium_taxonomy'] = 'collection';
	$default_settings['choose_button'] = 'Select';
	$default_settings['choose_button_font_size'] = '12px';
	$default_settings['max_scale'] = 3;
	$default_settings['original_icon'] = plugins_url().'/fancy-product-filters/images/icon.png';
	$default_settings['original_text'] = 'Original';
	/*$default_settings['loading_pic'] = plugins_url().'/fancy-product-filters/images/loading.png';*/
	$default_settings['action_label'] = 'Actions';
	$default_settings['social_share'] = 'true';
	$default_settings['adjust_modal'] = 'true';
	$default_settings['modal_top'] = '10px';
	$default_settings['modal_left'] = '10px';
	$default_settings['watermark_url'] = plugins_url().'/fancy-product-filters/images/water_mark.png';
	$default_settings['watermark_width'] = 200;
	$default_settings['watermark_height'] = 106;
	$default_settings['water_mark_top'] = 0;
	$default_settings['water_mark_left'] = 0;
	$default_settings['watermark_opacity'] = 1;
	$default_settings['share_page_title'] = 'Product Preview';
	$default_settings['pintrest_description'] = 'Look at this custom product I designed.';
	$default_settings['under_quote_message'] = '';
	$default_settings['quote_sent_message'] = 'Your quote has been sent! {image}';
	$default_settings['sending_quote_request_message'] = 'Sending Quote Request';
	$default_settings['email_sent_message'] = 'Your email has been sent!';

	//	$default_settings['email_header'] = '';
	//	$default_settings['email_footer'] = '';

	$default_settings['send_quote_to'] = get_option( 'admin_email' );
	
	$default_settings['project_title_placeholder'] = 'Project Title';
	$default_settings['name_placeholder'] = 'Enter your name here';
	$default_settings['email_placeholder'] = 'Enter your email here';
	$default_settings['quantity_placeholder'] = 'Enter your quantity here';
	$default_settings['date_needed_by_placeholder'] = 'Enter the date needed by';
	$default_settings['comments_placeholder'] = 'Comments?';
	$default_settings['bottom_quote_message'] = 'We will respond within 24 hours.';
	
	return $default_settings;
}

add_action( 'wp_ajax_fpf_share_image', 'fpf_share_image' );
add_action( 'wp_ajax_nopriv_fpf_share_image', 'fpf_share_image' );
function fpf_share_image() {
	// there is no png being uploaded - png references are for the file (jpeg) sent from browser
	if (isset($_POST['share_image'])) {
		$share_image = $_POST['share_image'];
		$share_image_array = explode(',',$share_image);
		$share_image = $share_image_array[1];
		if ($share_image_array[0] == 'data:image/jpeg;base64') {
			$share_image_decoded=base64_decode($share_image);
			$time = time();
			$upload_dir = wp_upload_dir();
			if (!file_exists($upload_dir['basedir'].'/user_share')) {
				mkdir($upload_dir['basedir'].'/user_share', 0777, true);
			}
			$png_path = $upload_dir['basedir'].'/user_share/'.$time.'.jpg';
			$jpg_path = $upload_dir['basedir'].'/user_share/preview_'.$time.'.jpg';
			//create jpeg
			$fp = fopen( $png_path, 'wb' );
			fwrite( $fp, $share_image_decoded);
			fclose( $fp );
			// rebuild jpg
			$image = imagecreatefromjpeg($png_path);
			$bg = imagecreatetruecolor(imagesx($image), imagesy($image));
			imagefill($bg, 0, 0, imagecolorallocate($bg, 255, 255, 255));
			imagealphablending($bg, TRUE);
			imagecopy($bg, $image, 0, 0, 0, 0, imagesx($image), imagesy($image));
			imagedestroy($image);
			$quality = 70; // 0 = worst / smaller file, 100 = better / bigger file 
			imagejpeg($bg, $jpg_path, $quality);
			//destroy original
			imagedestroy($bg);
			// remove original jpeg
			unlink($png_path);
			// add jpeg to media library and echo share link
			echo fpf_insert_media($jpg_path);
		}
	}
	exit();	
}

function fpf_insert_media($filename) {
	// Get settings
	$settings = fpf_get_settings();
	if (isset($settings['share_page_title'])) {
		$share_page_title = $settings['share_page_title'];
	} else {
		$share_page_title = 'Product Preview';
	}

	// Temporarily remove all thumbnail sizes
	add_filter('intermediate_image_sizes_advanced', 'fpf_filter_image_sizes');
	
	// The ID of the post this attachment is for.
	$parent_post_id = 0;
	
	// Check the type of file. We'll use this as the 'post_mime_type'.
	$filetype = wp_check_filetype( basename( $filename ), null );
	
	// Get the path to the upload directory.
	$wp_upload_dir = wp_upload_dir();
	
	// Prepare an array of post data for the attachment.
	$attachment = array(
		'guid'           => $filename, 
		'post_mime_type' => $filetype['type'],
		'post_title'     => $share_page_title,
		'post_content'   => '',
		'post_status'    => 'inherit'
	);
	
	// Insert the attachment.
	$attach_id = wp_insert_attachment( $attachment, $filename, $parent_post_id );
	$base_filename = preg_replace( '/\.[^.]+$/', '', basename( $filename ) );
	update_post_meta($attach_id, '_shared_image', $base_filename);
	
	// Make sure that this file is included, as wp_generate_attachment_metadata() depends on it.
	require_once( ABSPATH . 'wp-admin/includes/image.php' );
	
	// Generate the metadata for the attachment, and update the database record.
	$attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
	wp_update_attachment_metadata( $attach_id, $attach_data );

	// Create sharing links	
	$share_path = get_site_url().'/share_product/'.$attach_id.'/';
	$share_to = '';
	if (isset($_POST['share_to'])) {
		$share_to = sanitize_text_field($_POST['share_to']);
	}
	if ($share_to == 'facebook') {
		$facebook = 'https://www.facebook.com/sharer/sharer.php?u=';
		$share_path = $facebook . $share_path;
	} else if ($share_to == 'twitter') {
		$share_path = 'https://twitter.com/home?status='.$share_path;
	} else if ($share_to == 'pintrest') {
		$source = wp_get_attachment_image_src($attach_id, 'full');
		$share_path = 'https://pinterest.com/pin/create/button/?url='.$share_path.'&media='.$source[0].'&description='.$settings['pintrest_description'];
	}

	return $share_path;
}

function fpf_filter_image_sizes($sizes) {
	foreach($sizes as $size=>$values) {
		unset($sizes[$size]);
	}
	return $sizes;
}

add_action('generate_rewrite_rules', 'fpf_attachment_rewrite_rule');
function fpf_attachment_rewrite_rule($wp_rewrite){
  $new_rules = array();
  $new_rules['share_product/(\d*)$'] = 'index.php?attachment_id=$matches[1]';
  $wp_rewrite->rules = $new_rules + $wp_rewrite->rules;
}
//=============================
// Custom Quote Functions
//=============================
add_action( 'wp_ajax_fpf_send_quote', 'fpf_send_quote' );
add_action( 'wp_ajax_nopriv_fpf_send_quote', 'fpf_send_quote' );
function fpf_send_quote() {
	$settings = fpf_get_settings();
	$unique_id = time();
	$project_title = sanitize_text_field($_POST['project_title']);
	$name = sanitize_text_field($_POST['fpd_shortcode_form_name']);
	$email = sanitize_text_field($_POST['fpd_shortcode_form_email']);
	$qty = sanitize_text_field($_POST['quantity_field']);
	$date_needed_by = sanitize_text_field($_POST['date_need_by']);
	if (isset($_POST['comment_field'])) {
		$comments = sanitize_text_field($_POST['comment_field']);
                //$comments = "testytest1";
	} else {
		$comments = '';
                //$comments = "testytest2";
	}
        
	if (isset($_POST['code_field'])) {
		$codes = sanitize_text_field($_POST['code_field']);
	} else {
		$codes = '';
	}
	$product = $_POST['product'];
	$product_image = $_POST['product_image'];

	//	Insert order into FPD
	require_once('includes/class-shortcode-order.php');
	$quote_id = FPF_Shortcode_Order::create( $name, $email, $product);

	// Build PDF attachment
	require_once('fpdf/fpdf.php');
	$wp_upload_dir = wp_upload_dir();
	$tmp_upload_dir = $wp_upload_dir['path'];
	$tmp_img = trailingslashit($tmp_upload_dir).'quote_img_'.$unique_id.'.jpeg';
	$tmp_pdf = trailingslashit($tmp_upload_dir).'quote_pdf_'.$unique_id.'.pdf';
	
	$dataPieces = explode(',',$product_image);
	$encodedImg = $dataPieces[1];
	$decodedImg = base64_decode($encodedImg);
	
	//  Check if image was properly decoded
	if( $decodedImg!==false ) {
		//  Save image to a temporary location
		if( file_put_contents($tmp_img,$decodedImg)!==false ) {
			//  Open new PDF document and print image
			$pdf = new FPDF();
			$pdf->Image($tmp_img);
			$pdf->AddPage();
			$pdf->Image($tmp_img, 0, -318);
			$pdf->Output($tmp_pdf);
	
			//  Delete image from server
			unlink($tmp_img);
		}
	}

	$settings = fpf_get_settings();
	$to = $settings['send_quote_to'];
	$blog_title = get_bloginfo('name');
	
	// Build email
	$from = get_bloginfo('admin_email');
    $headers  = 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
    $headers .= 'From: ' . $blog_title . ' ' . $from . '' . "\r\n";

	$templates_arr = fpf_get_default_templates();
	$templates = get_option('fpf_templates', $templates_arr);
	$templates = str_replace('&quot;', '"', $templates);

	$msg = $templates['admin_quote_email']['body'];
	$msg = html_entity_decode($msg);

	// Filter the message
	$msg = str_replace('{quote_id}', $quote_id, $msg);
	$msg = str_replace('{project_title}', $project_title, $msg);
	$msg = str_replace('{name}', $name, $msg);
	$msg = str_replace('{email}', $email, $msg);
	$msg = str_replace('{qty}', $qty, $msg);
	$msg = str_replace('{date_needed_by}', $date_needed_by, $msg);
	$msg = str_replace('{promo}', $codes, $msg);
	$msg = str_replace('{comments}', $comments, $msg);
	//$msg = str_replace('{comment}', $comment, $msg);
	
	$msg = str_replace("\'", "'", $msg);

	$subject = $templates['admin_quote_email']['subject'];

	$subject = str_replace('{quote_id}', $quote_id, $subject);
	$subject = str_replace('{project_title}', $project_title, $subject);
	$subject = str_replace('{name}', $name, $subject);
	$subject = str_replace('{email}', $email, $subject);
	$subject = str_replace('{qty}', $qty, $subject);
	$subject = str_replace('{date_needed_by}', $date_needed_by, $subject);
	$msg = str_replace('{promo}', $codes, $msg);
	$subject = str_replace('{comments}', $comments, $subject);
	//$subject = str_replace('{comment}', $comment, $subject);

	$mail_attachment = array($tmp_pdf);
	$sent = wp_mail($to, $subject, $msg, $headers,$mail_attachment);

	// Send user a confirmation
	$msg = sanitize_text_field($templates['user_quote_email']['body']);
	$msg = html_entity_decode($msg);

	// Filter the message
	$msg = str_replace('{quote_id}', $quote_id, $msg);
	$msg = str_replace('{project_title}', $project_title, $msg);
	$msg = str_replace('{name}', $name, $msg);
	$msg = str_replace('{email}', $email, $msg);
	$msg = str_replace('{qty}', $qty, $msg);
	$msg = str_replace('{date_needed_by}', $date_needed_by, $msg);
	$msg = str_replace('{promo}', $codes, $msg);
	$msg = str_replace('{comments}', $comments, $msg);
	//$msg = str_replace('{comment}', $comment, $msg);

	$msg = str_replace("\'", "'", $msg);

	$subject = $templates['user_quote_email']['subject'];

	$subject = str_replace('{quote_id}', $quote_id, $subject);
	$subject = str_replace('{project_title}', $project_title, $subject);
	$subject = str_replace('{name}', $name, $subject);
	$subject = str_replace('{email}', $email, $subject);
	$subject = str_replace('{qty}', $qty, $subject);
	$subject = str_replace('{date_needed_by}', $date_needed_by, $subject);
	$msg = str_replace('{promo}', $codes, $msg);
	$subject = str_replace('{comments}', $comments, $subject);
	//$subject = str_replace('{comment}', $comment, $subject);

	$mail_attachment = array($tmp_pdf);
	$sent = wp_mail($email, $subject, $msg, $headers,$mail_attachment);

	unlink($tmp_pdf);

	if ($sent === true) {
		$quote_sent_message = $settings['quote_sent_message'];
		$quote_sent_message = str_replace('{image}', '<img src="'.$product_image.'" />', $quote_sent_message);
		$x = $quote_sent_message;
	} else {
		$x = 'An error occurred, your quote was not sent.';
	}
	echo $x;
	exit();
}

// ======================
// Email Design
// ======================
add_action( 'wp_ajax_fpf_send_email', 'fpf_send_email' );
add_action( 'wp_ajax_nopriv_fpf_send_email', 'fpf_send_email' );
function fpf_send_email() {
	$settings = fpf_get_settings();
	$unique_id = time();
	$your_name = sanitize_text_field($_POST['your_name']);
	$your_email = sanitize_text_field($_POST['your_email']);
	$send_to = sanitize_text_field($_POST['send_to_email']);
	if (isset($_POST['msg'])) {
		$comment = sanitize_text_field($_POST['msg']);
	} else {
		$comment = 'No message was added.';
	}
	$product_image = $_POST['product_image'];

	// Build PDF attachment
	require_once('fpdf/fpdf.php');
	$wp_upload_dir = wp_upload_dir();
	$tmp_upload_dir = $wp_upload_dir['path'];
	$tmp_img = trailingslashit($tmp_upload_dir).'email_img_'.$unique_id.'.jpeg';
	$tmp_pdf = trailingslashit($tmp_upload_dir).'email_pdf_'.$unique_id.'.pdf';
	
	$dataPieces = explode(',',$product_image);
	$encodedImg = $dataPieces[1];
	$decodedImg = base64_decode($encodedImg);
	
	//  Check if image was properly decoded
	if( $decodedImg!==false ) {
		//  Save image to a temporary location
		if( file_put_contents($tmp_img,$decodedImg)!==false ) {
			//  Open new PDF document and print image
			$pdf = new FPDF();
			$pdf->Image($tmp_img);
			$pdf->AddPage();
			$pdf->Image($tmp_img, 0, -318);
			$pdf->Output($tmp_pdf);
	
			//  Delete image from server
			unlink($tmp_img);
		}
	}

	$settings = fpf_get_settings();

	$to = $send_to;

	$blog_title = get_bloginfo('name');
	// Build email
	$from = get_bloginfo('admin_email');
    $headers  = 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";
    $headers .= 'From: ' . $blog_title . ' ' . $from . '' . "\r\n";

	$templates_arr = fpf_get_default_templates();
	$templates = get_option('fpf_templates', $templates_arr);
	$templates = str_replace('&quot;', '"', $templates);

	$msg = $templates['email_design']['body'];
	$msg = html_entity_decode($msg);

	// Filter fields
	$msg = str_replace('{your_name}', $your_name, $msg);
	$msg = str_replace('{your_email}', $your_email, $msg);
	$msg = str_replace('{comments}', $comments, $msg);
	$msg = str_replace('{comment}', $comment, $msg);
	$msg = str_replace('{promo}', $codes, $msg);
	
	$msg = str_replace("\'", "'", $msg);
	
	$subject = $templates['email_design']['subject'];
	$subject = str_replace('{your_name}', $your_name, $subject);
	$subject = str_replace('{your_email}', $your_email, $subject);
	$msg = str_replace('{promo}', $codes, $msg);
	$subject = str_replace('{comments}', $comments, $subject);
	$subject = str_replace('{comment}', $comment, $subject);
	
	$mail_attachment = array($tmp_pdf);
	$sent = wp_mail($to, $subject, $msg, $headers,$mail_attachment);
	unlink($tmp_pdf);

	if ($sent === true) {
		$email_sent_message = $settings['email_sent_message'];
		$email_sent_message = str_replace('{image}', '<img src="'.$product_image.'" />', $email_sent_message);
		$x = $email_sent_message;
	} else {
		$x = 'An error occurred, your quote was not sent.';
	}
	echo $x;
	exit();	
}

add_filter('wp_mail_from','fpf_wp_mail_from');
function fpf_wp_mail_from($content_type) {
  return get_bloginfo('admin_email');
}
add_filter('wp_mail_from_name','fpf_wp_mail_from_name');
function fpf_wp_mail_from_name($name) {
  return get_bloginfo('name');
}

function fpf_get_default_templates() {
	$admin_quote_msg = '<h3>Quote Received #:{quote_id}</h3>';
	$admin_quote_msg .= '<h4>{project_title}</h4>';
	$admin_quote_msg .= '<div>';
		$admin_quote_msg .= '<label>';
			$admin_quote_msg .= 'Name: ';	
		$admin_quote_msg .= '</label>';
		$admin_quote_msg .= '{name}';
	$admin_quote_msg .= '</div>';
	$admin_quote_msg .= '<div>';
		$admin_quote_msg .= '<label>';
			$admin_quote_msg .= 'Email: ';	
		$admin_quote_msg .= '</label>';
		$admin_quote_msg .= '{email}';
	$admin_quote_msg .= '</div>';
	$admin_quote_msg .= '<div>';
		$admin_quote_msg .= '<label>';
			$admin_quote_msg .= 'Qty: ';	
		$admin_quote_msg .= '</label>';
		$admin_quote_msg .= '{qty}';
	$admin_quote_msg .= '</div>';
	$admin_quote_msg .= '<div>';
		$admin_quote_msg .= '<label>';
			$admin_quote_msg .= 'Date needed by: ';	
		$admin_quote_msg .= '</label>';
		$admin_quote_msg .= '{date_needed_by}';
	$admin_quote_msg .= '</div>';
	$admin_quote_msg .= '<div>';
		$admin_quote_msg .= '<label>';
			$admin_quote_msg .= 'Promo Code: ';	
		$admin_quote_msg .= '</label>';
		$admin_quote_msg .= '{promo}';
	$admin_quote_msg .= '</div>';
	$admin_quote_msg .= '<div>';
		$admin_quote_msg .= '<label>';
			$admin_quote_msg .= 'Comments: ';	
		$admin_quote_msg .= '</label>';
		$admin_quote_msg .= '{comments}';
	$admin_quote_msg .= '</div>';
	$admin_quote_msg .= sprintf( __('View Quote: %s', 'radykal'), esc_url_raw( admin_url('admin.php?page=fpd_orders') ) )."\n";
	
	$quote_msg = '<h3>Quote #:{quote_id}</h3>';
	$quote_msg .= '<h4>{project_title}</h4>';
	$quote_msg .= '<div>';
		$quote_msg .= '<label>';
			$quote_msg .= 'Name: ';	
		$quote_msg .= '</label>';
		$quote_msg .= '{name}';
	$quote_msg .= '</div>';
	$quote_msg .= '<div>';
		$quote_msg .= '<label>';
			$quote_msg .= 'Email: ';	
		$quote_msg .= '</label>';
		$quote_msg .= '{email}';
	$quote_msg .= '</div>';
	$quote_msg .= '<div>';
		$quote_msg .= '<label>';
			$quote_msg .= 'Qty: ';	
		$quote_msg .= '</label>';
		$quote_msg .= '{qty}';
	$quote_msg .= '</div>';
	$quote_msg .= '<div>';
		$quote_msg .= '<label>';
			$quote_msg .= 'Date needed by: ';	
		$quote_msg .= '</label>';
		$quote_msg .= '{date_needed_by}';
	$quote_msg .= '</div>';
	$admin_quote_msg .= '<div>';
		$admin_quote_msg .= '<label>';
			$admin_quote_msg .= 'Promo Code: ';	
		$admin_quote_msg .= '</label>';
		$admin_quote_msg .= '{promo}';
	$admin_quote_msg .= '</div>';
	$quote_msg .= '<div>';
		$quote_msg .= '<label>';
			$quote_msg .= 'Comments: ';	
		$quote_msg .= '</label>';
		$quote_msg .= '{comments}';
	$quote_msg .= '</div>';
	
	$msg = '<div>';
		$msg .= '<label>';
			$msg .= 'Sent By: ';	
		$msg .= '</label>';
		$msg .= '{your_name}';
	$msg .= '</div>';
	$msg .= '<div>';
		$msg .= '<label>';
			$msg .= 'Email: ';	
		$msg .= '</label>';
		$msg .= '{your_email}';
	$msg .= '</div>';
	$msg .= '<div>';
		$msg .= '<label>';
			$msg .= 'Message: ';	
		$msg .= '</label>';
		$msg .= '{comment}';
	$msg .= '</div>';
	
	$templates = array(
		'admin_quote_email' => array(
			'subject' => 'A new quote request has been sent #{quote_id}',
			'body' => $admin_quote_msg
			),
		'user_quote_email' => array(
			'subject' => 'You quote request has been received #{quote_id}',
			'body' => $quote_msg
			),
		'email_design' => array(
			'subject' => '{your_name} has sent you a design to look at',
			'body' => $msg
			)
	);

	return $templates;
}
?>