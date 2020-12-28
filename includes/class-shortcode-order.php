<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

if(!class_exists('FPF_Shortcode_Order')) {

	class FPF_Shortcode_Order {

		public static function create( $customer_name, $customer_mail, $views ) {

			if( empty($views) ) {
				return false;
			}

			global $wpdb, $charset_collate;

			//create views table if necessary
			if( !fpd_table_exists(FPD_ORDERS_TABLE) ) {

				require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

				//create products table
				$sql_string = "ID BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
				              customer_name VARCHAR(300) COLLATE utf8_general_ci NOT NULL,
				              customer_mail VARCHAR(100) COLLATE utf8_general_ci NOT NULL,
				              views LONGTEXT COLLATE utf8_general_ci NOT NULL,
							  PRIMARY KEY (ID)";

				$sql = "CREATE TABLE ".FPD_ORDERS_TABLE." ($sql_string) $charset_collate;";
				dbDelta($sql);

			}

			$inserted = $wpdb->insert(
				FPD_ORDERS_TABLE,
				array(
					'customer_name' => $customer_name,
					'customer_mail' => $customer_mail,
					'views' => $views
				),
				array( '%s', '%s', '%s' )
			);

			if( $inserted ) {
				return $wpdb->insert_id;

			}
			else {
				return false;
			}

		}

		public static function get_orders( $limit=5, $offset=0 ) {

			if( fpd_table_exists(FPD_ORDERS_TABLE) ) {

				global $wpdb;

				return $wpdb->get_results("SELECT * FROM ".FPD_ORDERS_TABLE." ORDER BY ID DESC LIMIT $limit OFFSET $offset");

			}

			return false;

		}

		public static function delete( $id ) {

			global $wpdb;

			try {
				$wpdb->query( $wpdb->prepare("DELETE FROM ".FPD_ORDERS_TABLE." WHERE ID=%d", $id) );
				return 1;
			}
			catch(Exception $e) {
				return 0;
			}

		}

	}

}

?>