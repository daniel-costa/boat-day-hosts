
// Require.js allows us to configure shortcut alias

require.config({
	
	// By pass RequireJS Cache
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery:     'vendor/jquery/dist/jquery.min',
		underscore: 'vendor/underscore/underscore-min',
		backbone:   'vendor/backbone/backbone',
		parse:      'vendor/parse/parse.min',
		text:       'vendor/requirejs-text/text',
		bootstrap:  'vendor/bootstrap/dist/js/bootstrap'
	},
	shim: {
		"parse": {
			deps: ["jquery", "underscore"],
			exports: "Parse"
		},
		"bootstrap": {
			deps: ["jquery"]
		}
	}
});

require(['parse', 'router', 'views/AppView', 'bootstrap'], function(Parse, AppRouter, AppView) {
	
	Parse.initialize("8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv", "FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp");
	
	var cb = function() {
		new AppRouter();
		Parse.history.start();
	}

	new AppView(cb);

});