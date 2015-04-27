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

		debug: true,

		render: function() {

			BaseView.prototype.render.call(this);

			var driverBirthdateYear = this.model.get('birthdate') ? this.model.get('birthdate').substring(6) : 1990;

			for(var i = 1940; i < new Date().getFullYear() - 21; i++) {
				
				var opt = $('<option>').val(i).text(i);
				
				if( driverBirthdateYear == i ) {
					opt.attr('selected', 1);
				}

				this.$el.find('[name="driverBirthdateYear"]').append(opt);
			}

			return this;
		},

		debugAutofillFields: function() {

			this._in('firstname').val('Bibash');
			this._in('lastname').val('Shah');
			this._in('phone').val('123 123 1234');
			this._in('ssn').val('1234');
			this._in('street').val('9861 SW 117th CT');
			this._in('city').val('Miami');
			this._in('zipCode').val('12345');

		},

		registerDriver: function(event) {

			event.preventDefault();

			var self = this;
			var baseStatus = this.model.get("status");

			self.buttonLoader('Saving');
			self.cleanForm();

			var data = {
				status: "complete",
				firstname: this._in('firstname').val(),
				lastname: this._in('lastname').val(),
				birthdate: this._in('driverBirthdateMonth').val() + "/" + this._in('driverBirthdateDay').val() + "/" + this._in('driverBirthdateYear').val(),	
				phone: this._in('phone').val(),
				ssn: this._in('ssn').val(),
				street: this._in('street').val(),
				city: this._in('city').val(),
				zipCode: this._in('zipCode').val(),
				state: this._in('state').val()
			};

			var userSuccess = function() {

				Parse.history.loadUrl( Parse.history.fragment );

			};

			var DriverSuccess = function(driver) {

				if( Parse.User.current().get("profile") ) {
					
					Parse.history.navigate('dashboard', true);

				} else {

					var profile = new ProfileModel({ displayName: data.firstname + " " + data.lastname.charAt(0) + "." })
					Parse.User.current().save({ profile: profile }).then(userSuccess, saveError);

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

			this.model.save(data).then(DriverSuccess, saveError);

		}

	});
	return DriverregistrationView;
});