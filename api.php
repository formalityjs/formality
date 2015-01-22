<?php

	/* JSON RPC CONTROLLER MOCKUP */

	$sleep = 2000000; //microseconds to sleep
	$error = false;  //set if you want to be returned an error
	
	$error = isset($_GET['error']) ? $_GET['error'] : $error;
	$sleep = isset($_GET['sleep']) ? $_GET['sleep'] : $sleep;

	$response = null;
	$request = null;
	
	if ( $_SERVER['REQUEST_METHOD'] !== 'POST' || substr( $_SERVER['CONTENT_TYPE'], 0, 16 ) !== 'application/json' ) {
			$response = array(
				"jsonrpc" => "2.0",
				"error"    => array(
					"code"    => -32600,
					"message" => "Invalid Request",
					"data"	 => "Request method must be POST, Content-Type must be application/json"
				)
			);
			return false;
		}

		// loads the request
		try
		{
			$request = json_decode( file_get_contents( 'php://input' ) );
		}
		// if request is not loaded
		catch ( Exception $e )
		{
			$response = array(
				"jsonrpc" => "2.0",
				"error"    => array(
					"code"    => -32700,
					"message" => "Parse error"
				)
			);
		}
		
		if (!isset($response)) {
			if (!$error) {
				$response = array(
					"jsonrpc" => "2.0",
					"id" => $request->id,
					"result"=> $request
				);
			} else {
				$response = array(
					"jsonrpc" => "2.0",
					"id" => $request->id,
					"error"=> array(
						"code"    => -32000,
						"message" => "Server error",
						"data" => $request
					)
				);
			}
		}
		
		usleep($sleep);
		
		header( 'content-type: application/json' );
		echo json_encode($response);
?>