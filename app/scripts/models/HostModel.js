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

		isEmailValid: function(email) {
			
			return true;

		},

		isRoutingNumberValid: function(n) {

			n = n ? n.match(/\d/g).join('') : 0;
			
			var c = 0, isValid = false;

			if (n && n.length == 9){//don't waste energy totalling if its not 9 digits
			
				for (var i = 0; i < n.length; i += 3) {
					c += parseInt(n.charAt(i), 10) * 3 +  parseInt(n.charAt(i + 1), 10) * 7 +  parseInt(n.charAt(i + 2), 10);
				}
			
				isValid = c != 0 && c % 10 == 0;
			
			}

			return isValid;
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