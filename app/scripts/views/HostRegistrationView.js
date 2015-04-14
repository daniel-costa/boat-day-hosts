define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'models/HostModel',
'text!templates/HostRegistrationTemplate.html'
], function($, _, Parse, BaseView, HostModel, HostregistrationTemplate){
	var HostregistrationView = BaseView.extend({

		template: _.template(HostregistrationTemplate),

		events: {
			"submit form" : "registerHost", 
			'change [name ="paymentMethod"]' : "switchView"
		},

		switchView: function(){

			var selected = $('#payment_method option:selected').val();

			if(selected == "deposit"){
				console.log("Deposit selected");
				$(".payment_method_1").show();
				$(".payment_method_2").hide();
				$(".payment_method_3").hide();
			} else if(selected == "paypal"){
				console.log("paypal selected");
				$(".payment_method_2").show();
				$(".payment_method_1").hide();
				$(".payment_method_3").hide();
			} else{
				console.log("venmo selected");
				$(".payment_method_3").show();
				$(".payment_method_1").hide();
				$(".payment_method_2").hide();
			}
		},

		registerHost: function() {

			event.preventDefault();

			var self = this;

			var data = {
				address: this._in('address').val(),
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

			var hostRegistrationSuccess = function() {
				
				Parse.User.current().save({ status: 'complete' }).then(userStatusUpdateSuccess, saveError);

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(hostRegistrationSuccess, saveError);
		}, 

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		initialize: function(){

		}

	});
	return HostregistrationView;
});