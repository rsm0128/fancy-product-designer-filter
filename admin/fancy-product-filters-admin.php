<?php
if (is_admin()) {
	add_action( 'admin_menu', 'fancy_product_filters_menu' );
}

function fancy_product_filters_menu() {
	add_submenu_page( 'fancy_product_designer', 'Fancy Product Filters', 'Fancy Product Filters', 'manage_options', 'fancy_product_filters_admin_page', 'fancy_product_filters_admin_page' );
}

function fancy_product_filters_admin_page() {
	$x = '<div class="wrap"><div id="icon-tools" class="icon32"></div>';
		$x .= '<h2>Fancy Product Filters</h2>';
		$x .= '<div id="tabs">';
			$x .= '<ul>';
				$x .= '<li><a href="#tabs-1">Add Textures</a></li>';
				$x .= '<li><a href="#tabs-2">Settings</a></li>';
				$x .= '<li><a href="#tabs-3">Email Templates</a></li>';
			$x .= '</ul>';
			$x .= '<div id="tabs-1">';
				$x .= fpf_style_control();
			// End Tab 1
			$x .= '</div>';
			$x .= '<div id="tabs-2">';
				$x .= fpf_settings_control();
			// End Tab 2
			$x .= '</div>';
			$x .= '<div id="tabs-3">';
				$x .= fpf_email_templates();
			// End Tab 3
			$x .= '</div>';
		// End Tabs
		$x .= '</div>';
	//End Wrap
	$x .= '</div>';
	echo $x;
}

function fpf_style_control() {
	$x = '<h3>Use this area to add textures that you can apply to your products</h3>';

	$x .= '<img src="'.WP_PLUGIN_URL.'/fancy-product-filters/images/icon.png" alt="Sample Icon" title="Sample Icon" class="fpf_sample_icon" />';

	$x .= '<input type="text" id="fpf_select_texture" name="fpf_select_texture" class="fpf_select_texture" />';
	$x .= '<input type="button" id="fpf_select_texture_btn" name="fpf_select_texture_btn" class="fpf_select_texture_btn" value="Select Texture" />';
	$x .= '<br />';

	$x .= '<input type="text" id="fpf_select_texture_icon" name="fpf_select_texture_icon" class="fpf_select_texture_icon" />';
	$x .= '<input type="button" id="fpf_select_texture_icon_btn" name="fpf_select_texture_icon_btn" class="fpf_select_texture_icon_btn" value="Select Icon" />';
	$x .= '<br />';

	$x .= '<small>';
		$x .= '<b>ATTENTION - You must add a taxture and an icon. You can use the icon to the right as a model for your icons.</b>';
	$x .= '</small>';
	$x .= '<div id="texture_preview" class="texture_preview">';
		$x .= '<div id="texture_preview_img" class="texture_preview_img">';
		$x .= '</div>';
		$x .= '<div class="fpf_clear"></div>';
		$x .= 'Texture Name';
		$x .= '<div class="fpf_clear"></div>';
		$x .= '<input type="text" id="fpf_texture_name" class="fpf_texture_name" />';
		$x .= '<small id="clear_texture">clear texture</small>';
		$x .= '<input type="button" id="fpf_add_texture_btn" name="fpf_add_texture_btn" class="fpf_add_texture_btn" value="Add Texture" />';
	$x .= '</div>';

	$fpf_textures = get_option('fpf_textures', array());
	$x .= fpf_get_current_textures($fpf_textures);
	return $x;
}

function fpf_get_current_textures($fpf_textures) {
	$fpf_textures_count = count($fpf_textures);
	$x = '<div id="current_textures">';
	if ($fpf_textures_count > 0) {
		$x .= '<h4>Current Textures</h4>';
		foreach ($fpf_textures as $fpf_texture_name=>$fpf_texture) {
			$fpf_texture_name_slug = str_replace(' ', '_', $fpf_texture_name);
			$x .= '<div class="fpf_texture_box" data-texture-id="'.$fpf_texture_name_slug.'" id="texture_'.$fpf_texture_name_slug.'">';
				$x .= '<input class="remove_texture_btn" onclick="remove_texture(\''.$fpf_texture_name.'\');" type="button" data-texture-id="'.$fpf_texture_name_slug.'" value="X" />';
				$x .= '<img class="fpf_textures" data-texture-id="'.$fpf_texture_name_slug.'" src="'.$fpf_texture['texture'] .'" alt="'.$fpf_texture_name.'" title="'.$fpf_texture_name.'" />';
				$x .= '<div class="fpf_clear"></div>';
				$x .= '<img class="fpf_textures" data-texture-id="'.$fpf_texture_name_slug.'" src="'.$fpf_texture['icon'] .'" alt="'.$fpf_texture_name.'" title="'.$fpf_texture_name.'" />';
				$x .= '<div class="fpf_clear"></div>';
				$x .= $fpf_texture_name;
				$x .= '<div class="fpf_clear"></div>';
			$x .= '</div>';
		}
		$x .= '<div class="fpf_clear"></div>';
	} else {
		$x .= '<h4>You do not currently have any textures.</h4>';
		$x .= '<input type="button" id="fpf_default_textures_btn" class="fpf_default_textures_btn" value="Load Default Textures" onclick="load_default_textures();" />';
	}
	$x .= '</div>';
	return $x;
}

// ===============================================
// ajax handlers
// ===============================================

add_action( 'wp_ajax_fpf_add_texture', 'fpf_add_texture' );
add_action( 'wp_ajax_fpf_remove_texture', 'fpf_remove_texture' );
add_action( 'wp_ajax_fpf_load_default_textures', 'fpf_load_default_textures' );
add_action( 'wp_ajax_fpf_update_settings', 'fpf_update_settings' );
add_action( 'wp_ajax_fpf_update_template_settings', 'fpf_update_template_settings' );

function fpf_add_texture() {
	$x = '';
	if (isset($_POST['texture']) && isset($_POST['icon']) && isset($_POST['texture_name'])) {
		$fpf_textures = get_option('fpf_textures', array());
		$texture_name = sanitize_text_field($_POST['texture_name']);
		$fpf_textures[$texture_name]['texture'] = sanitize_text_field($_POST['texture']);
		$fpf_textures[$texture_name]['icon'] = sanitize_text_field($_POST['icon']);
		update_option('fpf_textures', $fpf_textures);
		$x .= fpf_get_current_textures($fpf_textures);
	}
	echo $x;
	exit();	
}

function fpf_remove_texture() {
	$x = '';
	if (isset($_POST['key'])) {
		$fpf_textures = get_option('fpf_textures', array());
		$key = sanitize_text_field($_POST['key']);
		unset($fpf_textures[$key]);
		update_option('fpf_textures', $fpf_textures);
		$x .= fpf_get_current_textures($fpf_textures);
	}
	echo $x;
	exit();			
}

function fpf_load_default_textures() {
	$fpf_textures = fpf_default_textures();
	update_option('fpf_textures', $fpf_textures);
	$x = fpf_get_current_textures($fpf_textures);
	echo $x;
	exit();	
}

// = Start Settings Control
function fpf_settings_control() {
	$x = '<h2>Adjust general settings here</h2>';
	$x .= '<p><small>';
		$x .= 'Your settings will update when you change the value of each field.';
	$x .= '</small></p>';
	$settings = fpf_get_settings();
	foreach($settings as $setting_key=>$setting_value) {
		$setting_value = $setting_value;
		$x .= '<div class="fpf_setting">';
			$x .= '<label>';
				$setting_name = str_replace('_', ' ', $setting_key);
				$setting_name = ucwords($setting_name);
				$x .= $setting_name;
			$x .= '</label>';
			$x .= '<div class="fpf_setting_span">';
				if ($setting_key == 'show_messages') {
					if ($setting_value != 'false') {
						$checked = ' checked';
					} else {
						$checked = '';
					}
					$x .= '<input class="fpf_setting_value" type="checkbox" name="'.$setting_key.'" id="'.$setting_key.'" data-key="'.$setting_key.'" value="true"'.$checked.' />';
				} else {
					$x .= '<input class="fpf_setting_value" type="text" name="'.$setting_key.'" id="'.$setting_key.'" data-key="'.$setting_key.'" value="'.$setting_value.'" />';
				}
			$x .= '</div>';
		$x .= '</div>';
	}
	
	return $x;	
}

function fpf_update_settings() {
	$key = sanitize_text_field($_POST['setting']);
	if ($key == 'email_header' || $key == 'email_footer') {
		$value = urlencode($_POST['value']);
	} else {
		$value = $_POST['value'];
	}
	$settings = fpf_get_settings();
	$settings[$key] = $value;
	update_option('fpf_settings', $settings);
	exit();	
}

function fpf_email_templates() {
	$x = '<div class="fpf_email_templates">';
		$x .= '<h3>Select a template to edit</h3>';
		$x .= '<select class="fpf_select_template">';
			$x .= '<option></option>';
			$x .= '<option value="admin_quote_email">Admin email when quote is sent</option>';
			$x .= '<option value="user_quote_email">User email when quote is sent</option>';
			$x .= '<option value="email_design">Email Design Template</option>';
		$x .= '</select>';
		$x .= '<div class="fpf_template_editor">';
			$x .= '<h3>User email when quote is sent</h3>';
			$x .= '<h4>Subject Line</h4>';
			$x .= '<input type="text" class="fpf_template_subject">';
			$x .= '<h4>Email Body</h4>';
			$x .= '<textarea class="fpf_template_editor_field"></textarea>';
			/* we could use tinyMCE, but that poses it's own set of problems
			ob_start();
			the_editor($content);
			$x .= ob_get_contents();
			ob_end_clean();
			*/
			$x .= '<input type="button" value="Update Template" class="fpf_update_template" />';
		$x .= '</div>';
		$x .= '<div class="fpf_template_filter_title">';
			$x .= 'You can use the following fields to auto populate data in this template:';
		$x .= '</div>';
		$x .= '<div class="fpf_quote_fields">';
			$x .= '
				{quote_id}<br />
				{project_title}<br />
				{name}<br />
				{email}<br />
				{qty}<br />
				{date_needed_by}<br />
				{comments}<br />
				';
		$x .= '</div>';
		$x .= '<div class="fpf_email_fields">';
			$x .= '
				{your_name}<br />
				{your_email}<br />
				{comment}<br />
				';
		$x .= '</div>';
		$x .= '<div class="fpf_clear"></div>';
	$x .= '</div>';
	return $x;
}

function fpf_ShowTinyMCE() {
	// conditions here
	wp_enqueue_script( 'common' );
	wp_enqueue_script( 'jquery-color' );
	wp_print_scripts('editor');
	if (function_exists('add_thickbox')) add_thickbox();
	wp_print_scripts('media-upload');
	if (function_exists('wp_tiny_mce')) wp_tiny_mce();
	wp_admin_css();
	wp_enqueue_script('utils');
	do_action("admin_print_styles-post-php");
	do_action('admin_print_styles');
}

function fpf_update_template_settings() {
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

	if (isset($_POST['template']) && isset($_POST['content']) && isset($_POST['subject'])) {
		$template = sanitize_text_field($_POST['template']);
		$content = sanitize_text_field($_POST['content']);
		$subject = sanitize_text_field($_POST['subject']);
		$content = str_replace('\"', '&quot;', $content);
		$content = str_replace('"', '&quot;', $content);
		$templates[$template]['subject'] = $subject;
		$templates[$template]['body'] = $content;
		print_r($templates);
		update_option('fpf_templates', $templates);
	}

	exit();	
}
?>