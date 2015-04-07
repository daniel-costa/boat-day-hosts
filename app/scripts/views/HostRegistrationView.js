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
			"submit form" : "registerHost"
		},

		registerHost: function(e) {

			e.preventDefault();

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

			var success = function() {
				console.log("success");
			};

			var error = function(error) {
				console.log(error);
			};

			this.model.save(data).then(success, error);
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