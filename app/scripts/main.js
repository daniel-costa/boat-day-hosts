
// Require.js allows us to configure shortcut alias

require.config({
	
	// By pass RequireJS Cache
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery: 	'vendor/jquery/dist/jquery.min',
		underscore: 'vendor/underscore/underscore-min',
		parse: 		'vendor/parse/parse.min',
		text: 		'vendor/requirejs-text/text',
		bootstrap: 	'vendor/bootstrap/dist/js/bootstrap.min',
		datepicker: 'vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker.min',
		slider: 	'vendor/seiyria-bootstrap-slider/dist/bootstrap-slider.min',
		async:		'vendor/requirejs-plugins/src/async',
		facebook: 	'//connect.facebook.net/en_US/all',
		twitter: 	'//platform.twitter.com/widgets',
		gapi: 		'//apis.google.com/js/platform',
	},
	shim: {
		jquery: {
			exports: 'jquery'
		},
		underscore: {
			exports: '_'
		},
		parse: {
			deps: ["jquery", "underscore"],
			exports: "Parse"
		},
		bootstrap: {
			deps: ["jquery"]
		},
		datepicker: {
			deps: ["jquery", "bootstrap"],
			exports: 'datepicker'
		},
		slider: {
			deps: ["jquery", "bootstrap"],
			exports: 'slider'
		},
		facebook : {
			exports: 'FB'
		},
		twitter: {
			exports: 'twttr'
		},
		gapi: {
			exports: 'gapi'
		}
	},
	googlemaps: {
		params: {
			key: 'AIzaSyDWM2B3u-5wW4sqLtd__BqjHNPSNsUpzYg'
		}
	}
});

require(['parse', 'router', 'views/AppView', 'bootstrap', 'datepicker', 'slider', 'fb', 'twitter', 'gapi'], function(Parse, AppRouter, AppView) {
	
	Parse.initialize("LCn0EYL8lHOZOtAksGSdXMiHI08jHqgNOC5J0tmU", "kXeZHxlhpWhnRdtg7F0Cdc6kvuGHVtDlnSZjfxpU"); // QA LCn0E...
	// Parse.initialize("8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv", "FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp"); //HP

	var cb = function() {
		new AppRouter();
		Parse.history.start();
	}

	new AppView(cb);

});