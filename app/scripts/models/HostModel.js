define([
'parse'
], function(Parse){
	var HostModel = Parse.Object.extend("Host", {

		defaults: {

			type: null,
			phone: null,
			paymentMethod: null,
			accountHolder: null,
			accountNumber: null,
			accountRouting: null,
			paypalEmail: null,
			venmoEmail: null,
			venmoPhone: null,

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
			personalSSN: null

		},

		isPhoneValid: function(phone) {
			
			var phoneNumberPattern = /^\(?([0-9]{3})\)?([ .-]?)([0-9]{3})([ .-]?)([0-9]{4})$/;
   			return phoneNumberPattern.test(phone);

		},

		isEmailValid: function(email) {

			var emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    		return emailPattern.test(email);

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

		isBusinessEIN: function(ein) {

			var einPattern = /^[0-9]\d?-\d{7}$/;
			return einPattern.test(ein);
		},

		validate: function(attributes){

			var isBusiness = attributes.type == "business";
			var isDeposit = attributes.paymentMethod == "deposit";
			var isVenmo = attributes.paymentMethod == "venmo";
			var isPaypal = attributes.paymentMethod == "paypal";

			if( !isBusiness && !attributes.personalFirstname ) {
				return 'firdaskljdlksajd';
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

			if( isBusiness && !this.isBusinessEIN(attributes.businessEin) ) {
				return "Business ein is not valid";
			}
			
			if( !attributes.phone ) {
				return "A phone number is required";
			}
			
			if( !this.isPhoneValid(attributes.phone) ) {
				return "Phone number is not valid";
			}	

			if( !isBusiness && !/^\d{4}$/.test(attributes.personalSSN) ) {
				return "The last 4 digits of your social security number are required";
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

			if( !/^\d{5}$/.test(attributes.zipCode) ) {
				return"A zip code is not correct";
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

			if( isDeposit && !this.isRoutingNumberValid(attributes.accountRouting) ) {
				return "A routing number is not valid";
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