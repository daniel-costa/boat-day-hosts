define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'models/DriverModel',
'models/ProfileModel',
'text!templates/DriverRegistrationTemplate.html'
], function($, _, Parse, BaseView, DriverModel, ProfileModel, DriverRegistrationTemplate){
	var DriverregistrationView = BaseView.extend({

		className: "view-driver-registration",

		template: _.template(DriverRegistrationTemplate),

		events: {

			"submit form" : "registerDriver"

		},

		initialize: function(){

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

			var data = {

				firstname : this._in('firstname').val(),
				lastname : this._in('lastname').val(),
				birthdate : this._in('driverBirthdateMonth').val() + "/" + this._in('driverBirthdateDay').val() + "/" + this._in('driverBirthdateYear').val(),	
				phone : this._in('phone').val(),
				ssn : this._in('ssn').val(),
				street: this._in('street').val(),
				city: this._in('city').val(),
				zipCode: this._in('zipCode').val(),
				apartmentNumber: this._in('apartmentNumber').val(),
				state: this._in('state').val(), 
			};

			var userStatusUpdateSuccess = function() {

				Parse.history.navigate('profile', true);

			};

			var DriverRegistrationSuccess = function() {
				//Parse.User.current().save({ status: 'complete' }).then(userStatusUpdateSuccess, saveError);
				Parse.User.current().save({ profile: new ProfileModel() }).then(userStatusUpdateSuccess, saveError);

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(DriverRegistrationSuccess, saveError);
		}

	});
	return DriverregistrationView;
});