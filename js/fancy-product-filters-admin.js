// JavaScript Document
var current_editor;
var selected_texture;
var activeSetting;
// Get the template from options
var fpf_templates = JSON.parse(fpfAdminCommonParams.templates);

jQuery( document ).ready(function($) {
	$( "#tabs" ).tabs();

	$('#fpf_select_texture').on('change', function () {
		if ($('#fpf_select_texture').val() != '') {
			$('#fpf_add_texture_btn').css('display', 'inline');
		} else {
			$('#fpf_add_texture_btn').css('display', 'none');
		}
	});
	
	// Select Textures
	$('#fpf_select_texture').click(function() {
		current_editor = 'texture';
		formfield = $('#fpf_select_texture').attr('name');
		tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
		sendto = 'fpf_select_texture';
		return false;
	});

	$('#fpf_select_texture_btn').click(function() {
		current_editor = 'texture';
		formfield = $('#fpf_select_texture').attr('name');
		tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
		sendto = 'fpf_select_texture';
		return false;
	});

	// Select Icons
	$('#fpf_select_texture_icon').click(function() {
		current_editor = 'texture_icon';
		formfield = $('#fpf_select_texture_icon').attr('name');
		tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
		sendto = 'fpf_select_texture_icon';
		return false;
	});

	$('#fpf_select_texture_icon_btn').click(function() {
		current_editor = 'texture_icon';
		formfield = $('#fpf_select_texture_icon').attr('name');
		tb_show('', 'media-upload.php?type=image&amp;TB_iframe=true');
		sendto = 'fpf_select_texture_icon';
		return false;
	});

	window.send_to_editor = function(html) {
		//imgurl = $('img',html).attr('src');
		var tmp = document.createElement('div');
		tmp.innerHTML = html;
		imgurl = $('img',tmp).attr('src');
		$('#'+sendto).val(imgurl);
		if ($('#fpf_select_'+current_editor).val() != '') {
			$('#fpf_add_'+current_editor+'_btn').css('display', 'inline');
		} else {
			$('#fpf_add_'+current_editor+'_btn').css('display', 'none');
		}
		var preview_img = '<h4>Preview</h4><img src="'+ imgurl +'" />';
		$('#'+current_editor+'_preview_img').html(preview_img);
		$('#'+current_editor+'_preview').css('display', 'block');
		tb_remove();
	}

	$('#clear_texture').click(function() {
		$('#fpf_select_texture').val('');
		$('.texture_preview').slideUp( "400" );
	});

	$('#fpf_add_texture_btn').on('click', function () {
		if ($('#fpf_select_texture').val() == '' || $('#fpf_select_texture_icon').val() == '' || $('#fpf_texture_name').val() == '') {
			alert('You must enter a texture name, texture and an icon before submitting.');
		} else {
			$('#current_textures').html('<img src="'+ fpfAdminCommonParams.spinner +'" />');
			var texture = $('#fpf_select_texture').val();
			var icon = $('#fpf_select_texture_icon').val();
			var texture_name = $('#fpf_texture_name').val();
			$.ajax({
				type: 'POST',
				url: fpfAdminCommonParams.ajaxurl,
				data: {
				  'action': 'fpf_add_texture',
				  'texture': texture,
				  'texture_name': texture_name,
				  'icon': icon
				},
				success: function(data) {
					$('#current_textures').html(data);
					$('#fpf_select_texture').val('');
					$('#fpf_select_texture_icon').val('');
					$('#fpf_texture_name').val('');
					$('.texture_preview').slideUp( "400" );
				},
				error: function(error) {
					console.log(error);
				}
			});
		}
	});

	$('.fpf_setting_value').on('change', function() {
		activeSetting = $(this);
		var setting = activeSetting.data('key');
		if (setting == 'show_messages') {
			if ($(this).prop('checked') == false) {
				var value = false;
			} else {
				var value = '1';
			}
		} else {
			var value = activeSetting.val();
		}
		activeSetting.css('background', '#ccc');
		activeSetting.css('background-repeat', 'no-repeat');
		activeSetting.css('background-position', 'right center');
		activeSetting.css('background-size', '20px 20px');
		activeSetting.css('background-image', 'url("'+fpfAdminCommonParams.spinner+'")');
		$.ajax({
			type: 'POST',
			url: fpfAdminCommonParams.ajaxurl,
			data: {
			  'action': 'fpf_update_settings',
			  'setting': setting,
			  'value': value,
			},
			success: function(data) {
				activeSetting.css('background-image', '');
				activeSetting.css('background', '#0f0');
				setTimeout(function(){
					activeSetting.css('background', '#fff');
				}, 1000);
			},
			error: function(error) {
				console.log(error);
			}, timeout: 8000
		});
	});

	$('.fpf_select_template').on('change', function() {
		var selected_template = $(this).val();
		if (selected_template == '') {
			$('.fpf_template_editor').slideUp();
			$('.fpf_template_filter_title').css('display', 'none');
			$('.fpf_quote_fields').css('display', 'none');
			$('.fpf_email_fields').css('display', 'none');
		} else {
			if (typeof(fpf_templates[selected_template]) != 'undefined') {
				var template_html = fpf_decodeEntities(fpf_templates[selected_template]['body']);
				var subject = fpf_decodeEntities(fpf_templates[selected_template]['subject']);

				$('.fpf_template_editor_field').val(template_html);
				$('.fpf_template_subject').val(subject);
				$('.fpf_template_editor h3').html($('.fpf_select_template option:selected').text());
				$('.fpf_template_filter_title').css('display', 'block');
				if (selected_template == 'admin_quote_email') {
					$('.fpf_quote_fields').css('display', 'block');
					$('.fpf_email_fields').css('display', 'none');
				}
				if (selected_template == 'user_quote_email') {
					$('.fpf_quote_fields').css('display', 'block');
					$('.fpf_email_fields').css('display', 'none');
				}
				if (selected_template == 'email_design') {
					$('.fpf_quote_fields').css('display', 'none');
					$('.fpf_email_fields').css('display', 'block');
				}
			}
			$('.fpf_template_editor').slideDown();
		}
	});

	$('.fpf_update_template').on('click', function() {
		var content = $('.fpf_template_editor_field').val();
		content = fpf_encodeEntities(content);
		$('.fpf_template_editor_field').css('background-color', '#EFDB76');
		var subject = $('.fpf_template_subject').val();
		$.ajax({
			type: 'POST',
			url: fpfAdminCommonParams.ajaxurl,
			data: {
			  'action': 'fpf_update_template_settings',
			  'template': $('.fpf_select_template').val(),
			  'subject': subject,
			  'content': content,
			},
			success: function(data) {
				var content = $('.fpf_template_editor_field').val();
				content = fpf_encodeEntities(content);
				var subject = $('.fpf_template_subject').val();
				$('.fpf_template_editor_field').css('background-color', '#00FF00');
				fpf_templates[$('.fpf_select_template').val()]['body'] = content;
				fpf_templates[$('.fpf_select_template').val()]['subject'] = subject;
				setTimeout(function(){
					$('.fpf_template_editor_field').css('background-color', '#FFFFFF');
				}, 1000);
			},
			error: function(error) {
				console.log(error);
				$('.fpf_template_editor_field').css('background-color', '#FF0000');
				setTimeout(function(){
					$('.fpf_template_editor_field').css('background-color', '#FFFFFF');
				}, 1000);
			}, timeout: 8000
		});
		
	});

});

function remove_texture(key) {
	var $ = jQuery;
	$('#current_textures').html('<img src="'+ fpfAdminCommonParams.spinner +'" />');
	$.ajax({
		type: 'POST',
		url: fpfAdminCommonParams.ajaxurl,
		data: {
		  'action': 'fpf_remove_texture',
		  'key': key
		},
		success: function(data) {
			$('#current_textures').html(data);
		},
		error: function(error) {
			console.log(error);
		}
	});
}

function load_default_textures() {
	var $ = jQuery;
	$('#current_textures').html('<img src="'+ fpfAdminCommonParams.spinner +'" />');
	$.ajax({
		type: 'POST',
		url: fpfAdminCommonParams.ajaxurl,
		data: {
		  'action': 'fpf_load_default_textures',
		},
		success: function(data) {
			$('#current_textures').html(data);
		},
		error: function(error) {
			console.log(error);
		}
	});	
}

function fpf_decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}

function fpf_encodeEntities(decodedString) {
	var encodedStr = decodedString.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
	   return '&#'+i.charCodeAt(0)+';';
	});

	return encodedStr;
}