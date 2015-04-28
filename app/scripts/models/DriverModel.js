define([
'parse'
], function(Parse){
	var DriverModel = Parse.Object.extend("Driver", {

		defaults: {

			status: 'creation',
			firstname: null, 
			lastname: null, 
			birthdate: null,

			street: null,
			city: null,
			zipCode: null,
			state: null,
			country: "USA",

			phone: null,
			ssn: null
		},

		isPhoneValid: function(phone) {
			
			var phoneNumberPattern = /^\(?([0-9]{3})\)?([ .-]?)([0-9]{3})([ .-]?)([0-9]{4})$/;
   			return phoneNumberPattern.test(phone);

		},

		validate: function(attributes){

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( !attributes.firstname ) {
				_return.fields.firstname = 'Oops, you missed one!';
			}

			if( !attributes.lastname ) {
				_return.fields.lastname = 'Oops, you missed one!';
			}

			if( !this.isPhoneValid(attributes.phone) ) {
				_return.fields.phone = 'A valid 10 digit phone number is required';
			}

			if( !/^\d{4}$/.test(attributes.ssn) ) {
				_return.fields.ssn = 'Soc. Sec. # (last 4 digits) is required';
			}

			if( !attributes.street ) {
				_return.fields.street = 'Oops, you missed one!';
			}

			if( !attributes.city ) {
				_return.fields.city = 'Oops, you missed one!';
			}

			if( !/^\d{5}$/.test(attributes.zipCode) ) {
				_return.fields.zipCode = 'Oops, you missed one! Please  enter a 5 digit zip code.';
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		}
 
	});
	return DriverModel;
});