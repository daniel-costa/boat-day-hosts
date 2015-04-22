define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'models/ProfileModel',
'text!templates/HostRegistrationTemplate.html'
], function($, _, Parse, BaseView, ProfileModel, HostRegistrationTemplate){
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


			var personalBirthdateYear = this.model.get('personalBirthdate') ? this.model.get('personalBirthdate').substring(6) : 1900;

			for(var i = 1900; i < new Date().getFullYear() - 21; i++) {
				
				var opt = $('<option>').val(i).text(i);
				
				if( personalBirthdateYear == i ) {
					opt.attr('selected', 1);
				}

				this.$el.find('[name="personalBirthdateYear"]').append(opt);
			}

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
			var isPersonal = this.model.get("type") == "personal";

			var data = {
				phone: this._in('phone').val(),
				street: this._in('street').val(),
				apartmentNumber: this._in('apartmentNumber').val(),
				city: this._in('city').val(),
				zipCode: this._in('zipCode').val(),
				state: this._in('state').val(), 
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

			if( isPersonal ) {

				data.personalFirstname = this._in('personalFirstname').val();
				data.personalLastname = this._in('personalLastname').val();
				data.personalBirthdate = this._in('personalBirthdateMonth').val() + "/" + this._in('personalBirthdateDay').val() + "/" + this._in('personalBirthdateYear').val();
				data.personalSSN = this._in('personalSSN').val();

			} else {

				data.businessName = this._in('businessName').val();
				data.businessEin = this._in('businessEin').val();
				data.businessContact = this._in('businessContact').val();

			}

			var userStatusUpdateSuccess = function() {

				Parse.history.loadUrl( Parse.history.fragment );

			};

			var hostRegistrationSuccess = function() {

				if(Parse.User.current().get("profile") ) {

					Parse.history.navigate("dashboard", true);

				} else {

					var profileData = {};

					if( isPersonal ) {
						profileData.displayName = data.personalFirstname + " " + data.personalLastname.charAt(0) + "."
					}

					Parse.User.current().save({ profile: new ProfileModel(profileData) }).then(userStatusUpdateSuccess, saveError);

				}

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(hostRegistrationSuccess, saveError);
		}

	});
	return HostRegistrationView;
});