define([
'parse'
], function(Parse){
	var HostModel = Parse.Object.extend("Host", {

		defaults: {

			type: null,
			street: null,
			apartmentNumber: null, 
			city: null,
			zipCode: null,
			state: null,
			country: "USA",
			businessName: null,
			businessEin: null,
			businessContact: null,
			personalFirstname: null, 
			personalLastname: null, 
			personalBirthdate: null,
			phone: null,
			paymentMethod: null,
			accountHolder: null,
			accountNumber: null,
			accountRouting: null,
			paypalEmail: null,
			venmoEmail: null,
			venmoPhone: null,

		},

		isPhoneValid: function(phone) {
			
			var phoneNumberPattern = /^\(?([0-9]{3})\)?([ .-]?)([0-9]{3})([ .-]?)([0-9]{4})$/;
   			return phoneNumberPattern.test(phone);

		},

		isBirthdateValid: function(personalBirthdate){

			//validates (MM/DD/YYYY), with a year between 1900 and 2099.

			var birthDatePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
			return birthDatePattern.test(personalBirthdate);

		},

		isEmailValid: function(email) {
			
			return true;

		},

		validate: function(attributes){

			var isBusiness = attributes.type == "business";
			var isDeposit = attributes.paymentMethod == "deposit";
			var isVenmo = attributes.paymentMethod == "venmo";
			var isPaypal = attributes.paymentMethod == "paypal";

			if( !isBusiness && !attributes.personalFirstname ) {
				return "A first name is required";
			}
			 
			if( !isBusiness && !attributes.personalLastname ) {
				return "A last name is	required";
			}

			if( isBusiness && !attributes.businessName ) {
				return "A businessName is required";
			}

			if( isBusiness && !attributes.businessEin ) {
				return "A businessEin number is	required";
			}

			if( isBusiness && !attributes.businessContact ) {
				return "A business contact is required";
			}
			
			if( !attributes.phone ) {
				return "A phone number is required";
			}
			
			if( !this.isPhoneValid(attributes.phone) ) {
				return "Phone number is not valid";
			}	

			if( !isBusiness && !attributes.personalSSN ) {
				return "A SSN number is required";
			}

			if( !attributes.street ) {
				return "A street is required";
			}

			if( !attributes.city ) {
				return "A city is required";
			}

			if( !attributes.zipCode ) {
				return "A zip code is required";
			}

			if( !attributes.street ) {
				return "A street is required";
			}


			if( !isBusiness && !attributes.personalBirthdate ) {
				return "A date of birth is	required";
			}

			if( !isBusiness && !this.isBirthdateValid(attributes.personalBirthdate) ) {
				return "Date of birth must be in MM/DD/YYYY format";
			}

			if( isDeposit && !attributes.accountHolder ) {
				return "A account holder´s name is required";
			}

			if( isDeposit && !attributes.accountNumber ) {
				return "A account number is required";
			}

			if( isDeposit && !attributes.accountRouting ) {
				return "A routing number is required";
			}


			if( isPaypal ) {

				if( !attributes.paypalEmail ) {
					
					return "A email for paypal is required";

				} 

				if( !this.isEmailValid(attributes.paypalEmail) ) {

					return "The Paypal email is invalid";

				}

			}

			if( isVenmo ) {
				
				if( !attributes.venmoEmail  && !attributes.venmoPhone ) {
				
					return "A venmo email or phone number is required";
				
				} else if( attributes.venmoEmail && !this.isEmailValid(attributes.venmoEmail) ) {

					return "The Venmo email is invalid";

				} else if( attributes.venmoPhone && !this.isPhoneValid(attributes.venmoPhone) ) {

					return "The Venmo phone number is invalid";

				}

			}

		}
 
	});
	return HostModel;
});