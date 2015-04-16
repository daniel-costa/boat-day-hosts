define([
'parse'
], function(Parse){
	var DriverModel = Parse.Object.extend("Driver", {

		defaults: {

			firstname: null, 
			lastname: null, 
			birthdate: null,

			street: null,
			apartmentNumber: null, 
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
			console.log("validation processes");

			if( !attributes.firstname ) {
				return "A first name is required";
			}

			if( !attributes.lastname ) {
				return "A last name is required";
			}

			if( !attributes.phone ) {
				return "A phone number is required";
			}

			if( !this.isPhoneValid(attributes.phone) ) {
				return "Phone number is not valid";
			}

			if( !/^\d{4}$/.test(attributes.ssn) ) {
				return "The last 4 digits of your social security number are required";
			}

			if( !attributes.city ) {
				return "A city is required";
			}

			if( !attributes.zipCode ) {
				return "A zip code is required";
			}

			if( !/^\d{5}$/.test(attributes.zipCode) ) {
				return"A zip code is not correct";
			}
		}
 
	});
	return DriverModel;
});