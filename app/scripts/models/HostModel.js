define([
'parse'
], function(Parse){
	var HostModel = Parse.Object.extend("Host", {

		defaults: {

			type: null,
			
			address: null,
			apartmentNumber: null, 
			country: null,
			phone: null,
			paymentMethod: null,
			accountHolder: null,
			accountNumber: null,
			accountRouting: null,
			paypalEmail: null,
			venmoEmail: null,
			venmoPhone: null,

			businessName: null,
			businessEin: null,
			businessContact: null,
			
			personalFirstname: null, 
			personalLastname: null, 
			personalBirthdate: null

		},

		validePhone: function(phone) {
			var phoneNumberPattern = /\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/;  
   			return phoneNumberPattern.test(phone); 
   			// (123) 456 7899
			// (123).456.7899
			// (123)-456-7899
			// 123-456-7899
			// 123 456 7899
			// 1234567899
		},

		validateBirthDate: function(personalBirthdate){

			var birthDatePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
			return birthDatePattern.test(personalBirthdate);

			//validates (MM/DD/YYYY), with a year between 1900 and 2099.
		},

		validate: function(attributes){

			if(attributes.type == "business") {

				if( !attributes.businessName ) {
					return "A businessName is required";
				}

				if( !attributes.businessEin ) {
					return "A businessEin number is	required";
				}

				if( !attributes.businessContact ) {
					return "A business contact is required";
				}

			} else {

				if( !attributes.personalFirstname ) {
					return "A first name is required";
				}
				 
				if( !attributes.personalLastname ) {
					return "A last name is	required";
				}

				if( !attributes.personalBirthdate ) {
					return "A date of birth is	required";
				}

				if( !this.validateBirthDate(attributes.personalBirthdate) ) {
					return "Date of birth must be in MM/DD/YYYY format";
				}
			}	

			if( !attributes.phone ) {
				return "A phone number is required";
			}

			
			if( !this.validePhone(attributes.phone) ) {
				return "Phone number is not valid";
			}	

			if( !attributes.address ) {
				return "A address is required";
			}


			if( attributes.paymentMethod == "deposit") {

				if( !attributes.accountHolder ) {
					return "A account holder´s name is required";
				}

				if( !attributes.accountNumber ) {
					return "A account number is required";
				}

				if( !attributes.accountRouting ) {
					return "A routing number is required";
				}

			} else if ( attributes.paymentMethod == "paypal") {

				if( !attributes.paypalEmail ) {
					return "A paypal email is required";
				}

			} else {

				if( !attributes.venmoEmail ) {
					return "A venmo email is required";
				}

				if( !attributes.venmoPhone ) {
					return "A venmo phone is required";
				}
			}

		}
 
	});
	return HostModel;
});