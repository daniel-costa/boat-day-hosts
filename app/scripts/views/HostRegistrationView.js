define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'models/HostModel',
'models/ProfileModel',
'text!templates/HostRegistrationTemplate.html'
], function($, _, Parse, BaseView, HostModel, ProfileModel, HostRegistrationTemplate){
	var HostRegistrationView = BaseView.extend({

		className: "view-host-registration",

		template: _.template(HostRegistrationTemplate),

		events: {
			"submit form" : "registerHost", 
			'change [name="paymentMethod"]' : "refreshPaymentMethod"
		},

		initialize: function(){

		},

		render: function() {

			BaseView.prototype.render.call(this);

			this.refreshPaymentMethod();

			return this;
		},

		refreshPaymentMethod: function(){


			var paymentMethod = this._in('paymentMethod').val();			
			this.$el.find('.paymentMethodContainer').hide();
			this.$el.find(".paymentMethodContainer." + paymentMethod).show();

		},

		registerHost: function() {

			event.preventDefault();

			var self = this;

			var data = {
				street: this._in('street').val(),
				city: this._in('city').val(),
				zipCode: this._in('zipCode').val(),
				apartmentNumber: this._in('apartmentNumber').val(), 
				country: this._in('country').val(), 
				phone: this._in('phone').val(), 
				paymentMethod: this._in('paymentMethod').val(), 
			};

			if( this._in('paymentMethod').val() == 'deposit' ) {

				data.accountHolder = this._in('accountHolder').val(); 
				data.accountNumber = this._in('accountNumber').val(); 
				data.accountRouting = this._in('accountRouting').val(); 

			} else if( this._in('paymentMethod').val() == 'paypal' ) {

				data.paypalEmail = this._in('paypalEmail').val();

			} else {

				data.venmoEmail = this._in('venmoEmail').val();
				data.venmoPhone = this._in('venmoPhone').val();

			}

			if(this.model.get("type") == "personal") {

				data.personalFirstname = this._in('personalFirstname').val();
				data.personalLastname = this._in('personalLastname').val();
				data.personalBirthdate = this._in('personalBirthdate').val();
				data.personalSSN = this._in('personalSSN').val();

			} else {

				data.businessName = this._in('businessName').val();
				data.businessEin = this._in('businessEin').val();
				data.businessContact = this._in('businessContact').val();

			}

			var userStatusUpdateSuccess = function() {

				Parse.history.navigate('profile', true);

			};

			var hostRegistrationSuccess = function() {
				
				Parse.User.current().save({ profile: new ProfileModel() }).then(userStatusUpdateSuccess, saveError);

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(hostRegistrationSuccess, saveError);
		}

	});
	return HostRegistrationView;
});