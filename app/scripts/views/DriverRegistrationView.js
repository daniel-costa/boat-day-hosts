define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'models/DriverModel',
'text!templates/DriverRegistrationTemplate.html'
], function($, _, Parse, BaseView, DriverModel, DriverRegistrationTemplate){
	var DriverregistrationView = BaseView.extend({

		className: "view-driver-registration",

		template: _.template(DriverRegistrationTemplate),

		events: {
			"submit form" : "registerDriver", 
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

		registerDriver: function() {

			event.preventDefault();

			var self = this;

			var data = {
				address: this._in('street').val(),
				apartmentNumber: this._in('apartmentNumber').val(), 
				country: this._in('country').val(), 
				phone: this._in('phone').val(), 
				paymentMethod: this._in('paymentMethod').val(), 
				accountHolder: this._in('accountHolder').val(), 
				accountNumber: this._in('accountNumber').val(), 
				accountRouting: this._in('accountRouting').val(), 
				paypalEmail: this._in('paypalEmail').val(), 
				venmoEmail: this._in('venmoEmail').val(), 
				venmoPhone: this._in('venmoPhone').val()
			};

			if(this.model.get("type") == "personal") {

				data.personalFirstname = this._in('personalFirstname').val();
				data.personalLastname = this._in('personalLastname').val();
				data.personalBirthdate = this._in('personalBirthdate').val();	

			} else {

				data.businessName = this._in('businessName').val();
				data.businessEin = this._in('businessEin').val();
				data.businessContact = this._in('businessContact').val();

			}

			var userStatusUpdateSuccess = function() {

				Parse.history.navigate('dashboard', true);

			};

			var DriverRegistrationSuccess = function() {
				
				Parse.User.current().save({ status: 'complete' }).then(userStatusUpdateSuccess, saveError);

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(DriverRegistrationSuccess, saveError);
		}

	});
	return DriverregistrationView;
});