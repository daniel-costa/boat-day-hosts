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

		debug: true,

		events: {
			"submit form" : "registerHost", 
			'change [name="paymentMethod"]' : "refreshPaymentMethod"
		},

		initialize: function(){

		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var personalBirthdateYear = this.model.get('personalBirthdate') ? this.model.get('personalBirthdate').substring(6) : 1993;

			for(var i = 1940; i < new Date().getFullYear() - 21; i++) {
				
				var opt = $('<option>').val(i).text(i);
				
				if( personalBirthdateYear == i ) {
					opt.attr('selected', 1);
				}

				this.$el.find('[name="personalBirthdateYear"]').append(opt);
			}

			this.refreshPaymentMethod();
			return this;
		},

		debugAutofillFields: function() {
			
			this._in('personalFirstname').val('Daniel');
			this._in('personalLastname').val('Costa');
			this._in('personalSSN').val('9861');

			this._in('businessName').val('Peer-to-Pier Technologies LLC');
			this._in('businessEin').val('46-4074689');
			this._in('businessContact').val('Daniel Costa');

			this._in('phone').val('123-123-1234');
			this._in('street').val('9861 SW 117th Ct');
			this._in('city').val('Miami');
			this._in('zipCode').val('98613');

			this._in('accountHolder').val('Daniel Costa');
			this._in('accountNumber').val('1039531801');
			this._in('accountRouting').val('324377516');
			this._in('paypalEmail').val('paypal@boatdayapp.com');
			this._in('venmoEmail').val('venmo@boatdayapp.com');
			this._in('venmoPhone').val('912-123-1234');

		},

		refreshPaymentMethod: function() {

			var paymentMethod = this._in('paymentMethod').val();
			this.$el.find('.paymentMethodContainer').hide();
			this.$el.find(".paymentMethodContainer." + paymentMethod).show();

		},

		registerHost: function(event) {

			event.preventDefault();

			var self = this;
			self.buttonLoader('Saving');
			self.cleanForm();


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
					} else {
						profileData.displayName = data.businessName;
					}

					Parse.User.current().save({ profile: new ProfileModel(profileData) }).then(userStatusUpdateSuccess, saveError);

				}

			};

			var saveError = function(error) {
				
				self.buttonLoader();

				if( error.type && error.type == 'model-validation' ) {

					_.map(error.fields, function(message, field) { 
						self.fieldError(field, message);
					});

				} else {

					console.log(error);
					self._error(error);

				}

			};

			this.model.save(data).then(hostRegistrationSuccess, saveError);
		}

	});
	return HostRegistrationView;
});