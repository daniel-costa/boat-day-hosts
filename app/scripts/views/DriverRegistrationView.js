define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'models/ProfileModel',
'text!templates/DriverRegistrationTemplate.html'
], function($, _, Parse, BaseView, ProfileModel, DriverRegistrationTemplate){
	var DriverregistrationView = BaseView.extend({

		className: "view-driver-registration",

		template: _.template(DriverRegistrationTemplate),

		events: {

			"submit form" : "registerDriver"

		},

		render: function() {

			BaseView.prototype.render.call(this);

			for(var i = 1900; i < new Date().getFullYear() - 21; i++) {
				this.$el.find('[name="driverBirthdateYear"]').append($('<option value="'+i+'">'+i+'</option>'));
			}

			return this;
		},

		registerDriver: function() {

			event.preventDefault();

			var self = this;
			var baseStatus = this.model.get("status");
			var data = {
				status: "complete",
				firstname: this._in('firstname').val(),
				lastname: this._in('lastname').val(),
				birthdate: this._in('driverBirthdateMonth').val() + "/" + this._in('driverBirthdateDay').val() + "/" + this._in('driverBirthdateYear').val(),	
				phone: this._in('phone').val(),
				ssn: this._in('ssn').val(),
				street: this._in('street').val(),
				apartmentNumber: this._in('apartmentNumber').val(),
				city: this._in('city').val(),
				zipCode: this._in('zipCode').val(),
				state: this._in('state').val()
			};

			var userSuccess = function() {

				Parse.history.loadUrl( Parse.history.fragment );

			};

			var DriverSuccess = function(driver) {

				if( Parse.User.current().get("profile") ) {
					
					console.log("profile exist");
					Parse.history.navigate('dashboard', true);

				} else {

					var profileData = {
						displayName: data.firstname + " " + data.lastname.charAt(0) + "."
					};

					Parse.User.current().save({ profile: new ProfileModel(profileData) }).then(userSuccess, saveError);

				}

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(DriverSuccess, saveError);

		}

	});
	return DriverregistrationView;
});