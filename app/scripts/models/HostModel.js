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

    validate: function(attributes){
      if(attributes.type == "business"){
        if(!attributes.businessName){return "A businessName is required";}
        if(!attributes.businessEin){return "A businessEin number is  required";} 
        if(!attributes.address){return "A address is  required";} 
        if(!attributes.apartmentNumber){return "A apartment number is required";} 
        if(!attributes.businessContact){return "A business contact is required";}
        if(!attributes.phone){return "A phone number is required";}
        if(!attributes.accountHolder){return "A account holder´s name is required";}
        if(!attributes.accountNumber){return "A account number is required";}
        if(!attributes.accountRouting){return "A routing number is required";}
        if(!attributes.paypalEmail){return "A paypal email is required";} 
        if(!attributes.venmoEmail){return "A venmo email is required";} 
        if(!attributes.venmoPhone){return "A venmo phone is required";}
      } else{
        console.log("error messages for business fields");
        if(!attributes.personalFirstname){return "A first name is required";}
        if(!attributes.businessEin){return "A last name is  required";}
        if(!attributes.phone){return "A phone number is required";}
        if(!attributes.address){return "A address is  required";} 
        if(!attributes.apartmentNumber){return "A apartment number is required";} 
        if(!attributes.personalBirthdate){return "A date of birth is  required";}
        if(!attributes.accountHolder){return "A account holder´s name is required";}
        if(!attributes.accountNumber){return "A account number is required";}
        if(!attributes.accountRouting){return "A routing number is required";}
        if(!attributes.paypalEmail){return "A paypal email is required";} 
        if(!attributes.venmoEmail){return "A venmo email is required";} 
        if(!attributes.venmoPhone){return "A venmo phone is required";}

      }

    },

    initialize: function(){
      this.bind("error", function(model, error){
      console.log(error);

      });
    }
 
	});
	return HostModel;
});
