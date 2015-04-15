define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/TermsTemplate.html'
], function($, _, Parse, BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		className: "view-terms",

		template: _.template(TermsTemplate),

		events: {
			"submit form" : "acceptTerms"
		},

		acceptTerms: function(){

			event.preventDefault();

			var self = this;

			if( !this._in('tos').is(':checked') ) {

				this._error("You must to agree with the terms and conditions to use the BoatDay Host WebApp");

			} else{

				var userSaveSuccess = function () {

					if( Parse.User.current().get('host') ) {
						
						Parse.history.navigate('host-registration', true);	

					} else {
						
						Parse.history.navigate('driver-registration', true);

					}

				};

				var userSaveError = function (error) {

					console.log(error);
					
					self._error(error);

				};

				Parse.User.current().save({ tos: true }).then(userSaveSuccess, userSaveError);

			}

		}
	});
	return TermsView;
});
