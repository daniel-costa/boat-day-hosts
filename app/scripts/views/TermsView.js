define([
'views/BaseView',
'text!templates/TermsTemplate.html'
], function(BaseView, TermsTemplate){
	var TermsView = BaseView.extend({

		className: "view-terms",

		template: _.template(TermsTemplate),

		events: {
			"submit form" : "acceptTerms"
		},

		theme: "account",

		render: function(event) {
			
			BaseView.prototype.render.call(this);

			var self = this;
			
			$.ajax({
				type: 'GET',
				url: 'app-tos.html',
        		crossDomain: true,
				success: function(data) {
					self.$el.find('.tos').html(data);
				}
			});

			return this;
		},

		acceptTerms: function(event){

			event.preventDefault();

			var self = this;
			self.buttonLoader('Saving');

			if( !this._in('tos').is(':checked') ) {

				self.buttonLoader();
				this._error("You must accept the BoatDay Terms and Conditions to become a BoatDay Host.");

			} else{

				var userSaveSuccess = function () {

					Parse.history.loadUrl( Parse.history.fragment );

				};

				var userSaveError = function (error) {

					console.log(error);
					self.buttonLoader();
					self._error(error);

				};

				Parse.User.current().save({ tos: true }).then(userSaveSuccess, userSaveError);

			}

		}
	});
	return TermsView;
});
