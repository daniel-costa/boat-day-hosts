define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/SignUpAccountTemplate.html'
], function($, _, Parse, BaseView, SignUpAccountTemplate){
	var SignUpAccountView = BaseView.extend({

		template: _.template(SignUpAccountTemplate),

		initialize: function() {
			var Dick = Parse.Object.extend("Dick");

			var x = new Dick();
			x.set('size', 'big');
			x.set('big', true);
			x.set('test', 1);
			x.set('test2', 1.2);

			x.save();

		}

	});
	return SignUpAccountView;
});
