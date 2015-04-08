define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/TermsTemplate.html'
], function($, _, Parse, BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		template: _.template(TermsTemplate),

		events: {
			"submit form" : "hostRegistration"
		},

		hostRegistration: function(){

			event.preventDefault();

			var self = this;

			var userSaveSuccess = function () {

				Parse.history.navigate('host-registration', true);

			};

			var userSaveError = function (error) {

				self._error(error);

			};

			if( !this._in('tos').is(':checked') ) {

				this._error("You must to agree with the terms and conditions to use the BoatDay Host WebApp");

			} else{

				Parse.User.current().save({ tos: true }).then(userSaveSuccess, userSaveError);

			}

		}
	});
	return TermsView;
});
