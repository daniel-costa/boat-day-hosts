
// Require.js allows us to configure shortcut alias

require.config({
	
	// By pass RequireJS Cache
	urlArgs: "bust=" + (new Date()).getTime(),

	paths: {
		jquery:     'vendor/jquery/dist/jquery.min',
		underscore: 'vendor/underscore/underscore-min',
		backbone:   'vendor/backbone/backbone',
		parse:      'vendor/parse/parse.min',
		text:       'vendor/requirejs-text/text'
	},
	shim: {
		"parse": {
			deps: ["jquery", "underscore"],
			exports: "Parse"
		}
	}
});

require(['jquery', 'parse', 'views/app'], function($, Parse, AppView) {
	
	Parse.$ = $;
	
	Parse.initialize("8YpQsh2LwXpCgkmTIIncFSFALHmeaotGVDTBqyUv", "FaULY8BIForvAYZwVwqX4IAmfsyxckikiZ2NFuEp");
	
	new AppView;

});