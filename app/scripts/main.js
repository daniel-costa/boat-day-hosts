
// Require.js allows us to configure shortcut alias

require.config({
	
	// By pass RequireJS Cache
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery:     'vendor/jquery/dist/jquery.min',
		underscore: 'vendor/underscore/underscore-min',
		// backbone:   'vendor/backbone/backbone',
		parse:      'vendor/parse/parse.min',
		text:       'vendor/requirejs-text/text',
		bootstrap:  'vendor/bootstrap/dist/js/bootstrap',
		datepicker: 'vendor/bootstrap-datepicker/dist/js/bootstrap-datepicker',
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
        }
	}
});

require(['parse', 'router', 'views/AppView', 'bootstrap', 'datepicker'], function(Parse, AppRouter, AppView) {
	
	Parse.initialize("8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv", "FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp");
	
	var cb = function() {
		new AppRouter();
		Parse.history.start();
	}

	new AppView(cb);

});