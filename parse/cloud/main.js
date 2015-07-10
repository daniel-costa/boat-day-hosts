
Parse.Cloud.define("createAdminCmsRole", function(request, response) {
	
	var cbBasicSuccess = function() {
		response.success();	
	};

	var cbBasicError = function(error) {
		response.error(error.message);
	}

	var roleACL = new Parse.ACL();
	roleACL.setPublicReadAccess(true);
	var role = new Parse.Role("admin-cms", roleACL);
	role.save().then(cbBasicSuccess, cbBasicError);

});

Parse.Cloud.define("emailOldGuests", function(request, response) {
	
	var Mailgun = require('mailgun');
	var _ = require('underscore');
	var fs = require('fs');


	// var list = ["abbym77@gmail.com", "wpcchapman@yahoo.com", "aliceh1971@bellsouth.net", "sadiebabbage@gmail.com", "ninalorenstudio@gmail.com", "chele_n_cj@yahoo.com", "jay@jayhalpernlaw.com", "aaron.d.millman@gmail.com", "irving220@hotmail.com", "jacquibe@gmail.com", "daniel-costa.im@vixinet.ch", "ascottcg@yahoo.com", "ericcharlesmorales@gmail.com", "goldbergryan@ymail.com", "gradinaru@gmail.com", "wjshull@gmail.com", "parkerwoodroof@gmail.com", "mjp82733@gmail.com", "maggie-schabel@utulsa.edu", "alinn@gardner-webb.edu", "pmike84@hotmail.com", "flyflyerson2@gmail.com", "nbalderuu@yahoo.com", "brady.m.kroeker@gmail.com", "amanda.aldecoa@gmail.com", "dwade725@yahoo.com", "aldecoa.jorge@gmail.com", "aldeandrea@aol.com", "crod330@hotmail.com", "rvrlpolo@aol.com", "rothwphd@aol.com", "alex.trench@gmail.com", "zabalawork@hotmail.com", "philhobie@yahoo.co.uk", "ian.d.pinkert@vanderbilt.edu", "sak5566@aol.com", "mjfilogamo@gmail.com", "brian.e.hoffman@gmail.com", "bachmandan123@gmail.com", "adambrookland@gmail.com", "milanmarkovbata@gmail.com", "am1799@nova.edu", "scottpastis@gmail.com", "pepi32970@aol.com", "patrick.kerwin@gmail.com", "jmdhsmiami@me.com", "milexisperez@hotmail.com", "mnecuze@comcast.net", "kincaid504@gmail.com", "walers@gmail.com", "aruaix314@gmail.com", "katjohnston523@gmail.com", "titatots@aol.com", "natisrios@gmail.com", "jensener11@uww.edu", "hotjufer@yahoo.com", "juniorides@live.com", "sergiotorres02@yahoo.com", "alexandroskorres@gmail.com", "mwcoughlin@gmail.com", "jakcarambola@yahoo.com", "perezg@umich.edu", "dcpoole31@hotmail.com", "paulo.gozzi@gmail.com", "giocomandante@gmail.com", "eddieboy81uk@hotmail.com", "cfrancog@aol.com", "tamaravanheel@gmail.com", "kristye.price@gmail.com", "jerrykapride@hotmail.com", "accupro@aol.com", "a.miller18@umiami.edu", "kiki891@gmail.com", "mec1212@att.net", "gerritkaye@aol.com", "mels0328@hotmail.com", "steven.eisenband@gmail.com", "raxente@gmail.com", "dmy1026@gmail.com", "jchang1027@gmail.com", "jason.korres@gmail.com", "ssanc012@fiu.edu", "jose1003@bellsouth.net", "kevinwhisenant18@gmail.com", "floridaemerald@gmail.com", "brian.m.snelling@gmail.com", "marisnicdelgado@yahoo.com", "sobenitelife@gmail.com", "elboy514@gmail.com", "amdjs11@gmail.com", "peterzaid@mac.com", "bobby@i-grocers.com", "delao724@yahoo.com", "tparada04@yahoo.com", "dudley_salt@yahoo.com", "mitchell.halpern@gmail.com", "m.scagnegatti@umiami.edu", "diogocamposnunes@hotmail.com", "mark.gilbert@cushwake.com", "bluas490@yahoo.com", "whj05@fsu.edu", "aplasencia03@gmail.com", "isasmalls@gmail.com", "adam@levinefamily.biz", "melh716@aol.com", "cmitchellllecu@gmail.com", "mattalbani@gmail.com", "meg.flatt@gmail.com", "william.wolfe06@me.com", "caallen@mail.usf.edu", "sao07c@fsu.edu", "m.byrne@umiami.edu", "driver77@comcast.net", "dws@dwsinger.com", "stephenmontalto1@gmail.com", "bhavikgpatel@gmail.com", "cerebralassassin305@gmail.com", "andres_marin07@hotmail.com", "jlbaker3@memphis.edu", "jwright44@gmail.com", "jenn.schmukler@gmail.com", "nanat@hotmail.com", "cingo2000@aol.com", "rothhome@bellsouth.net", "rdevold@hotmail.com", "melissaeakle@gmail.com", "kglrsn@gmail.com", "lenner_obando@yahoo.com", "rottwiler93@aol.com", "atomic.isa@gmail.com", "carlos.d.hoyos@hotmail.com", "lilylindz@aol.com", "xx_miichellex3@hotmail.fr", "vivandy@gmail.com", "josemg3@garcialorenzo.com", "eric.alexander@colorado.edu", "hova19812002@yahoo.com", "jackiehalpern1@gmail.com", "mclaughlin.gareth@gmail.com", "grace.demoya@gmail.com", "dav9731@gmail.com", "lizzie.padro@floridamoves.com", "glambarspa@gmail.com", "abreumania24@yahoo.com", "anabellamky@yahoo.com", "annamarakig@yahoo.gr", "katia@pobox.com", "jwhitefall@gmail.com", "samuelellin@yahoo.com", "lucascarus@hotmail.com", "mikeguo63@yahoo.com", "brian.svaldi001@mymdc.net", "mpich005@gmail.com", "sashusha_17@yahoo.com", "epainter@whitecase.com", "mpetrie20@gmail.com", "jennifer.gillespie5@gmail.com", "adamhcohen@gmail.com", "dustin.alamo@gmail.com", "chana.cannon@gmail.com", "priscyzl@yahoo.com", "musica876@gmail.com", "boatdayapp@gmail.com", "kk1013@comcast.net", "jules2723@yahoo.com", "graemejcox@hotmail.com", "Rene.m.badia.jr@gmail.com", "jovonvest@yahoo.com", "faststang589@yahoo.com", "ramonalcover@hotmail.com", "felipefuentes@ymail.com", "daixuedong@gmail.com", "amandamichiko@gmail.com", "taftsibley@gmail.com", "bairoala25@yahoo.com", "andonixxx@hotmail.com", "m.brewer15@ymail.com", "tcs11030@yahoo.com", "coppenheim7@gmail.com", "smm953@yahoo.com", "m.owens3@umiami.edu", "levycamille@hotmail.com", "cougars16@aol.com", "bschmelkin@yahoo.com", "gordo21111@hotmail.com", "gracenbrown@sbcglobal.net", "smcdonnell1@gmail.com", "elwoodroof@yahoo.com", "bergofg@gmail.com", "devinmoss@gmail.com", "captnmarc@aol.com", "scott42208@aol.com", "gonzalo.brown@outlook.com", "marcgraibe815@gmail.com", "jcohen@senetech.net", "hank@toddsantoro.com", "clindenmayer@gmail.com", "qmanning@gmail.com", "armando_3052007@hotmail.com", "alex@bwtavern.com", "brjm19752@yahoo.com", "v.thrower79@gmail.com", "jeff.buettin@gmail.com", "isielidolo@me.com", "mr.diego.mesa@gmail.com", "winterhk@gmail.com", "liljfuray@aol.com", "mrosa033@fiu.edu", "yesibabes20@gmail.com", "burgess21@hotmail.com", "chuck_m_binkley@fpl.com", "j.alex.motes@gmail.com", "conrad_vanl@convandesign.com", "captinshawn@gmail.com", "jscottdennis@gmail.com", "j.meyerson@umiami.edu", "justinroy911@gmail.com", "robcarrfb@gmail.com", "loureiro97@gmail.com", "eyalsharon@aol.com", "traphaely7@yahoo.com", "jeffreybell1975@gmail.com", "gdiazgrupodc@hotmail.com", "s.gomez0205@gmail.com", "tryanjordan@gmail.com", "amshapiro@uchicago.edu", "mastermechanicalac@gmail.com", "huloma@yahoo.com", "ryan@matzner.com", "ayoung@students.law.miami.edu", "michaelschlabig@gmail.com", "jordanhmartin@gmail.com", "mgsobrado@gmail.com", "argeri.lagos@gmail.com", "jessewozniak@yahoo.com", "carrie.white1@yahoo.com", "emaircraftmaint@gmail.com", "erikt2457@gmail.com", "crazykate894@aol.com", "ghartlaub@gmail.com", "kkokarev@gmail.com", "boneafidecharters@gmail.com", "carlos33432@yahoo.com", "dwatford@email.unc.edu", "allanflores8860@gmail.com", "rmcranie@gmail.com", "szamora54@gmail.com", "dougseamlessgutters@rocketmail.com", "cperkins8536@yahoo.com", "christalhirsch@gmail.com", "biketech1@live.com", "sarah.n.press@gmail.com", "rodgers_44@yahoo.com", "rfagun@gmail.com", "luisrivadeneiralr@hotmail.com", "ryandeitrich@yahoo.com", "tampakodiak@gmail.com", "ktuerff@enviromedia.com", "facebook@davesnipe360.com", "snoopydude@hotmail.it", "amber_nina18@hotmail.com", "angeltgonzalez@gmail.com", "rickyhamilton89@gmail.com", "kimonk111@aol.com", "tiago@toptal.com", "willverine72@yahoo.com", "victoria1991_7@hotmail.com", "ernestojsmith@hotmail.com", "tbreuer77@gmail.com", "vgomez827@yahoo.com", "omarhatab56@gmail.com", "jmartinez9904@gmail.com", "chiplusko@gmail.com", "ivorhumphrey@gmail.com", "khillow@gmail.com", "tracole25@yahoo.com", "omizing@yahoo.com", "quincybeneche@yahoo.com", "adiaphoto@gmail.com", "jayson9241988@yahoo.com", "omarq002@fiu.edu", "delphineortega@hotmail.com", "aroundmiami@gmail.com", "yachtbabe118@yahoo.com", "marc@mytoga.net", "vurtjie@yahoo.com", "isasof.benitez@gmail.com", "drew6701@aol.com", "carmensfamous@gmail.com", "arroyo.elliot@yahoo.com", "espcolusa1@yahoo.com", "hartwelltravis@yahoo.com", "fgdukov@yahoo.com", "denis.pugliese1@gmail.com", "azra.choudhary@icloud.com", "keithshoem@aim.com", "mlacay04@hotmail.com", "angelajaramillo17@hotmail.com", "stratuscrew@gmail.com", "stephenjuelle@gmail.com", "fgranger@bellsouth.net", "choosejuicy02@yahoo.com", "sean.nabors@yahoo.com", "perlaferla@gmail.com", "fastimenow@gmail.com", "lexyandrea@hotmail.com", "aimadi@yahoo.com", "izabellaachcar@hotmail.com", "saleh.alassaf001@gmail.com", "ramcpikachu@yahoo.com", "trocdolo@gmail.com", "bighambone360@gmail.com", "desireereyesroche@gmail.com", "rodparisi@yahoo.com", "drozumny@gmail.com", "matthew@jones-adams.com", "sniperhk@live.com", "stevensira3040@gmail.com", "agalante@gmyachts.com", "veronicaemma@hotmail.com", "monica@levyad.com", "swilkers@me.com", "yannygonzalez@yahoo.com", "susygrande@hotmail.com", "dapeez@aol.com", "sdiazzz31@gmail.com", "fairell@aol.com", "cortega777@aol.com", "danny.rico@hotmail.com", "lilyeney@yahoo.com", "na.14@live.com", "cfelini@hotmail.com", "imc281@live.com", "ferrellmedia@yahoo.com", "jorge.mendoza@equiflor.com", "jmiranda11@aol.com", "crissig@bellsouth.net", "carodecohen@hotmail.com", "erickmendieta@hotmail.com", "erwisxray47@aol.com", "dianacomas1@yahoo.com", "quadkini721@aol.com", "darniebal4@hotmail.com", "ginamariestoney@gmail.com", "supertecmike@gmail.com", "ryanesco27@aol.com", "aquinom1983@gmail.com", "gm25pou@yahoo.com", "pinkgem2005@yahoo.com", "karelbosch@yahoo.com", "magicmirrordetailing1@gmail.com", "davidancona@me.com", "alysonroque@yahoo.com", "kpayne100@hotmail.com", "gsteiner@q-station.com", "gsteiner@q-station.com", "lucy16950@hotmail.com", "belkys033070@yahoo.com", "mom2be34@gmail.com", "mdff3@yahoo.com", "lenere.colson@icloud.com", "eferg001@fiu.edu", "ray.willig@gmail.com", "egbaker286@gmail.com", "jovanaradmanovic@yahoo.com", "newsforce@aol.com", "ernestobetances@hotmail.com", "etf@minorisa.es", "relik24@aol.com", "rdlove@mdpd.com", "jaredduke69@gmail.com", "gschwanzl@gmail.com", "bernardoparedes0@hotmail.com", "kmcclure@columbus.rr.com", "ffjrobinson@gmail.com", "josidp@yahoo.com.br", "crissygonthenet@hotmail.com", "aerminy92@gmail.com", "matthewswanson99@gmail.com", "brendan.cruickshank@gmail.com", "adamtwebster@gmail.com", "brodar1996@gmail.com", "donkey289@yahoo.com", "mrasumoff@hotmail.com", "crioknight@gmail.com", "herndondana@gmail.com", "jeffbloom77@ymail.com", "lai.pinel@gmail.com", "sasinc4@msn.com", "trushad@icloud.com", "explosivedesigns@bellsouth.net", "aqcmar@aol.com", "mkieltsch@me.com", "nigel.250@hotmail.com", "a_teregulov@mail.ru", "adec@q-station.com", "yerlav@gmail.com", "richiept@msn.com", "andy@pelicansinks.com", "dominick.venturi@gmail.com", "pbagley@gmail.com", "turbodog23@aol.com", "ctvtravel@yahoo.com", "penzer@msn.com"];
	// var list = [
	// {
	// 	"email":"abbym77@gmail.com",
	// 	"name":"Abby Meyers",
	// 	"fname":"Abby",
	// 	"lname":"Meyers"
	// },
	// {
	// 	"email":"wpcchapman@yahoo.com",
	// 	"name":"Will Chapman",
	// 	"fname":"Will",
	// 	"lname":"Chapman"
	// },
	// {
	// 	"email":"aliceh1971@bellsouth.net",
	// 	"name":"Alice Hendrickson",
	// 	"fname":"Alice",
	// 	"lname":"Hendrickson"
	// },
	// {
	// 	"email":"sadiebabbage@gmail.com",
	// 	"name":"Sadie Dexter",
	// 	"fname":"Sadie",
	// 	"lname":"Dexter"
	// },
	// {
	// 	"email":"ninalorenstudio@gmail.com",
	// 	"name":"Nina Cortes",
	// 	"fname":"Nina",
	// 	"lname":"Cortes"
	// },
	// {
	// 	"email":"chele_n_cj@yahoo.com",
	// 	"name":"Heather Stephens",
	// 	"fname":"Heather",
	// 	"lname":"Stephens"
	// },
	// {
	// 	"email":"jay@jayhalpernlaw.com",
	// 	"name":"Jay Halpern",
	// 	"fname":"Jay",
	// 	"lname":"Halpern"
	// },
	// {
	// 	"email":"aaron.d.millman@gmail.com",
	// 	"name":"Aaron Millman",
	// 	"fname":"Aaron",
	// 	"lname":"Millman"
	// },
	// {
	// 	"email":"irving220@hotmail.com",
	// 	"name":"Irving Shechtman",
	// 	"fname":"Irving",
	// 	"lname":"Shechtman"
	// },
	// {
	// 	"email":"jacquibe@gmail.com",
	// 	"name":"Jacqueline Berenson",
	// 	"fname":"Jacqueline",
	// 	"lname":"Berenson"
	// },
	// {
	// 	"email":"daniel-costa.im@vixinet.ch",
	// 	"name":"Daniel Costa",
	// 	"fname":"Daniel",
	// 	"lname":"Costa"
	// },
	// {
	// 	"email":"ascottcg@yahoo.com",
	// 	"phone":"305-538-9349",
	// 	"name":"Anna Scott",
	// 	"fname":"Anna",
	// 	"lname":"Scott"
	// },
	// {
	// 	"email":"ericcharlesmorales@gmail.com",
	// 	"phone":"305-793-5252",
	// 	"name":"Eric Morales",
	// 	"fname":"Eric",
	// 	"lname":"Morales"
	// },
	// {
	// 	"email":"goldbergryan@ymail.com",
	// 	"name":"Greg Boozler",
	// 	"fname":"Greg",
	// 	"lname":"Boozler"
	// },
	// {
	// 	"email":"gradinaru@gmail.com",
	// 	"name":"Adrian Gradinaru",
	// 	"fname":"Adrian",
	// 	"lname":"Gradinaru"
	// },
	// {
	// 	"email":"wjshull@gmail.com",
	// 	"name":"Joe Shull",
	// 	"fname":"Joe",
	// 	"lname":"Shull"
	// },
	// {
	// 	"email":"parkerwoodroof@gmail.com",
	// 	"name":"Parker Woodroof",
	// 	"fname":"Parker",
	// 	"lname":"Woodroof"
	// },
	// {
	// 	"email":"mjp82733@gmail.com",
	// 	"name":"Matthew Pottorff",
	// 	"fname":"Matthew",
	// 	"lname":"Pottorff"
	// },
	// {
	// 	"email":"maggie-schabel@utulsa.edu",
	// 	"name":"Maggie Kroeker",
	// 	"fname":"Maggie",
	// 	"lname":"Kroeker"
	// },
	// {
	// 	"email":"alinn@gardner-webb.edu",
	// 	"name":"Aaron Linn",
	// 	"fname":"Aaron",
	// 	"lname":"Linn"
	// },
	// {
	// 	"email":"pmike84@hotmail.com",
	// 	"name":"Michael Price",
	// 	"fname":"Michael",
	// 	"lname":"Price"
	// },
	// {
	// 	"email":"flyflyerson2@gmail.com",
	// 	"name":"Francis Smith",
	// 	"fname":"Francis",
	// 	"lname":"Smith"
	// },
	// {
	// 	"email":"nbalderuu@yahoo.com",
	// 	"name":"Nathaniel Balder",
	// 	"fname":"Nathaniel",
	// 	"lname":"Balder"
	// },
	// {
	// 	"email":"brady.m.kroeker@gmail.com",
	// 	"name":"Brady Kroeker",
	// 	"fname":"Brady",
	// 	"lname":"Kroeker"
	// },
	// {
	// 	"email":"amanda.aldecoa@gmail.com",
	// 	"name":"Amanda Aldecoa",
	// 	"fname":"Amanda",
	// 	"lname":"Aldecoa"
	// },
	// {
	// 	"email":"dwade725@yahoo.com",
	// 	"name":"Matthew Teper",
	// 	"fname":"Matthew",
	// 	"lname":"Teper"
	// },
	// {
	// 	"email":"aldecoa.jorge@gmail.com",
	// 	"name":"Jorge Aldecoa",
	// 	"fname":"Jorge",
	// 	"lname":"Aldecoa"
	// },
	// {
	// 	"email":"aldeandrea@aol.com",
	// 	"name":"Andrea Messina Aldecoa",
	// 	"fname":"Andrea",
	// 	"lname":"Aldecoa"
	// },
	// {
	// 	"email":"crod330@hotmail.com",
	// 	"name":"Courtney Rodriguez",
	// 	"fname":"Courtney",
	// 	"lname":"Rodriguez"
	// },
	// {
	// 	"email":"rvrlpolo@aol.com",
	// 	"name":"Raul Valdez",
	// 	"fname":"Raul",
	// 	"lname":"Valdez"
	// },
	// {
	// 	"email":"rothwphd@aol.com",
	// 	"name":"Wendy Roth",
	// 	"fname":"Wendy",
	// 	"lname":"Roth"
	// },
	// {
	// 	"email":"alex.trench@gmail.com",
	// 	"name":"Alexander Trench",
	// 	"fname":"Alexander",
	// 	"lname":"Trench"
	// },
	// {
	// 	"email":"zabalawork@hotmail.com",
	// 	"name":"Jessica Perez-Zabala",
	// 	"fname":"Jessica",
	// 	"lname":"Perez-Zabala"
	// },
	// {
	// 	"email":"philhobie@yahoo.co.uk",
	// 	"name":"Philip Du Toit",
	// 	"fname":"Philip",
	// 	"lname":"Toit"
	// },
	// {
	// 	"email":"ian.d.pinkert@vanderbilt.edu",
	// 	"name":"Ian Pinkert",
	// 	"fname":"Ian",
	// 	"lname":"Pinkert"
	// },
	// {
	// 	"email":"sak5566@aol.com",
	// 	"name":"Steve Kellogg",
	// 	"fname":"Steve",
	// 	"lname":"Kellogg"
	// },
	// {
	// 	"email":"mjfilogamo@gmail.com",
	// 	"name":"Marty Filogamo",
	// 	"fname":"Marty",
	// 	"lname":"Filogamo"
	// },
	// {
	// 	"email":"brian.e.hoffman@gmail.com",
	// 	"name":"Brian Hoffman",
	// 	"fname":"Brian",
	// 	"lname":"Hoffman"
	// },
	// {
	// 	"email":"bachmandan123@gmail.com",
	// 	"name":"Daniel Milhouse Nixon",
	// 	"fname":"Daniel",
	// 	"lname":"Nixon"
	// },
	// {
	// 	"email":"adambrookland@gmail.com",
	// 	"name":"Adam Brookland",
	// 	"fname":"Adam",
	// 	"lname":"Brookland"
	// },
	// {
	// 	"email":"milanmarkovbata@gmail.com",
	// 	"name":"Milan Milan",
	// 	"fname":"Milan",
	// 	"lname":"Milan"
	// },
	// {
	// 	"email":"am1799@nova.edu",
	// 	"name":"Ashley Miller",
	// 	"fname":"Ashley",
	// 	"lname":"Miller"
	// },
	// {
	// 	"email":"scottpastis@gmail.com",
	// 	"name":"Scott Price",
	// 	"fname":"Scott",
	// 	"lname":"Price"
	// },
	// {
	// 	"email":"pepi32970@aol.com",
	// 	"name":"Jose M Castillo",
	// 	"fname":"Jose",
	// 	"lname":"Castillo"
	// },
	// {
	// 	"email":"patrick.kerwin@gmail.com",
	// 	"name":"Patrick Kerwin",
	// 	"fname":"Patrick",
	// 	"lname":"Kerwin"
	// },
	// {
	// 	"email":"jmdhsmiami@me.com",
	// 	"name":"Jean Marc De Silva",
	// 	"fname":"Jean",
	// 	"lname":"Silva"
	// },
	// {
	// 	"email":"milexisperez@hotmail.com",
	// 	"name":"Milly Perez",
	// 	"fname":"Milly",
	// 	"lname":"Perez"
	// },
	// {
	// 	"email":"mnecuze@comcast.net",
	// 	"name":"Miriam Necuze",
	// 	"fname":"Miriam",
	// 	"lname":"Necuze"
	// },
	// {
	// 	"email":"kincaid504@gmail.com",
	// 	"name":"Elizabeth Kincaid",
	// 	"fname":"Elizabeth",
	// 	"lname":"Kincaid"
	// },
	// {
	// 	"email":"walers@gmail.com",
	// 	"name":"Willie Alers",
	// 	"fname":"Willie",
	// 	"lname":"Alers"
	// },
	// {
	// 	"email":"aruaix314@gmail.com",
	// 	"name":"Anthony Lulu",
	// 	"fname":"Anthony",
	// 	"lname":"Lulu"
	// },
	// {
	// 	"email":"katjohnston523@gmail.com",
	// 	"name":"Kaitlyn Korres",
	// 	"fname":"Kaitlyn",
	// 	"lname":"Korres"
	// },
	// {
	// 	"email":"titatots@aol.com",
	// 	"name":"Cristina Glaria",
	// 	"fname":"Cristina",
	// 	"lname":"Glaria"
	// },
	// {
	// 	"email":"natisrios@gmail.com",
	// 	"name":"Natalia Rios",
	// 	"fname":"Natalia",
	// 	"lname":"Rios"
	// },
	// {
	// 	"email":"jensener11@uww.edu",
	// 	"name":"Eric Jensen",
	// 	"fname":"Eric",
	// 	"lname":"Jensen"
	// },
	// {
	// 	"email":"hotjufer@yahoo.com",
	// 	"name":"Julio Ferrer",
	// 	"fname":"Julio",
	// 	"lname":"Ferrer"
	// },
	// {
	// 	"email":"juniorides@live.com",
	// 	"name":"Miguel Jr Bryon",
	// 	"fname":"Miguel",
	// 	"lname":"Bryon"
	// },
	// {
	// 	"email":"sergiotorres02@yahoo.com",
	// 	"phone":"305-546-4879",
	// 	"name":"Sergio Torres",
	// 	"fname":"Sergio",
	// 	"lname":"Torres"
	// },
	// {
	// 	"email":"alexandroskorres@gmail.com",
	// 	"name":"Aleko Korres",
	// 	"fname":"Aleko",
	// 	"lname":"Korres"
	// },
	// {
	// 	"email":"mwcoughlin@gmail.com",
	// 	"name":"Martin Coughlin",
	// 	"fname":"Martin",
	// 	"lname":"Coughlin"
	// },
	// {
	// 	"email":"jakcarambola@yahoo.com",
	// 	"name":"Jack Carambola",
	// 	"fname":"Jack",
	// 	"lname":"Carambola"
	// },
	// {
	// 	"email":"perezg@umich.edu",
	// 	"name":"Giancarlo Perez",
	// 	"fname":"Giancarlo",
	// 	"lname":"Perez"
	// },
	// {
	// 	"email":"dcpoole31@hotmail.com",
	// 	"name":"David Christopher Poole",
	// 	"fname":"David",
	// 	"lname":"Poole"
	// },
	// {
	// 	"email":"paulo.gozzi@gmail.com",
	// 	"name":"Paulo Roberto Gozzi",
	// 	"fname":"Paulo",
	// 	"lname":"Gozzi"
	// },
	// {
	// 	"email":"giocomandante@gmail.com",
	// 	"name":"Iakovos Korres",
	// 	"fname":"Iakovos",
	// 	"lname":"Korres"
	// },
	// {
	// 	"email":"eddieboy81uk@hotmail.com",
	// 	"name":"Ed Child",
	// 	"fname":"Ed",
	// 	"lname":"Child"
	// },
	// {
	// 	"email":"cfrancog@aol.com",
	// 	"name":"Cristina Franco Guerini",
	// 	"fname":"Cristina",
	// 	"lname":"Guerini"
	// },
	// {
	// 	"email":"tamaravanheel@gmail.com",
	// 	"name":"Tamara Van Heel",
	// 	"fname":"Tamara",
	// 	"lname":"Heel"
	// },
	// {
	// 	"email":"kristye.price@gmail.com",
	// 	"name":"Kristy Price",
	// 	"fname":"Kristy",
	// 	"lname":"Price"
	// },
	// {
	// 	"email":"jerrykapride@hotmail.com",
	// 	"name":"Jerryka Pride Anerine",
	// 	"fname":"Jerryka",
	// 	"lname":"Anerine"
	// },
	// {
	// 	"email":"accupro@aol.com",
	// 	"name":"Luisa Solana",
	// 	"fname":"Luisa",
	// 	"lname":"Solana"
	// },
	// {
	// 	"email":"a.miller18@umiami.edu",
	// 	"name":"Autumn Miller",
	// 	"fname":"Autumn",
	// 	"lname":"Miller"
	// },
	// {
	// 	"email":"kiki891@gmail.com",
	// 	"name":"Kristen Vargas Vila",
	// 	"fname":"Kristen",
	// 	"lname":"Vila"
	// },
	// {
	// 	"email":"mec1212@att.net",
	// 	"name":"Mark Economou",
	// 	"fname":"Mark",
	// 	"lname":"Economou"
	// },
	// {
	// 	"email":"gerritkaye@aol.com",
	// 	"name":"Gerrit Kaye",
	// 	"fname":"Gerrit",
	// 	"lname":"Kaye"
	// },
	// {
	// 	"email":"mels0328@hotmail.com",
	// 	"name":"Melissa Molteni Baker",
	// 	"fname":"Melissa",
	// 	"lname":"Baker"
	// },
	// {
	// 	"email":"steven.eisenband@gmail.com",
	// 	"name":"Steve Eisenband",
	// 	"fname":"Steve",
	// 	"lname":"Eisenband"
	// },
	// {
	// 	"email":"raxente@gmail.com",
	// 	"name":"Razvan Axente",
	// 	"fname":"Razvan",
	// 	"lname":"Axente"
	// },
	// {
	// 	"email":"dmy1026@gmail.com",
	// 	"name":"Daphne Yuanidis",
	// 	"fname":"Daphne",
	// 	"lname":"Yuanidis"
	// },
	// {
	// 	"email":"jchang1027@gmail.com",
	// 	"name":"Jean Bean",
	// 	"fname":"Jean",
	// 	"lname":"Bean"
	// },
	// {
	// 	"email":"jason.korres@gmail.com",
	// 	"name":"Jason Korres",
	// 	"fname":"Jason",
	// 	"lname":"Korres"
	// },
	// {
	// 	"email":"ssanc012@fiu.edu",
	// 	"name":"Stephen Sanchez",
	// 	"fname":"Stephen",
	// 	"lname":"Sanchez"
	// },
	// {
	// 	"email":"jose1003@bellsouth.net",
	// 	"name":"Jose CasteIlanos",
	// 	"fname":"Jose",
	// 	"lname":"CasteIlanos"
	// },
	// {
	// 	"email":"kevinwhisenant18@gmail.com",
	// 	"name":"Kevin Whisenant",
	// 	"fname":"Kevin",
	// 	"lname":"Whisenant"
	// },
	// {
	// 	"email":"floridaemerald@gmail.com",
	// 	"phone":"239-322-7380",
	// 	"name":"Damon Lamont",
	// 	"fname":"Damon",
	// 	"lname":"Lamont"
	// },
	// {
	// 	"email":"brian.m.snelling@gmail.com",
	// 	"name":"Brian Snelling",
	// 	"fname":"Brian",
	// 	"lname":"Snelling"
	// },
	// {
	// 	"email":"marisnicdelgado@yahoo.com",
	// 	"name":"Maris Delgado",
	// 	"fname":"Maris",
	// 	"lname":"Delgado"
	// },
	// {
	// 	"email":"sobenitelife@gmail.com",
	// 	"name":"Seth Andrew",
	// 	"fname":"Seth",
	// 	"lname":"Andrew"
	// },
	// {
	// 	"email":"elboy514@gmail.com",
	// 	"name":"Jess Moore",
	// 	"fname":"Jess",
	// 	"lname":"Moore"
	// },
	// {
	// 	"email":"amdjs11@gmail.com",
	// 	"phone":"786-205-9089",
	// 	"name":"Edwin Carrion",
	// 	"fname":"Edwin",
	// 	"lname":"Carrion"
	// },
	// {
	// 	"email":"peterzaid@mac.com",
	// 	"name":"Peter Diaz",
	// 	"fname":"Peter",
	// 	"lname":"Diaz"
	// },
	// {
	// 	"email":"bobby@i-grocers.com",
	// 	"name":"Robert Bobby Kramer",
	// 	"fname":"Robert",
	// 	"lname":"Kramer"
	// },
	// {
	// 	"email":"delao724@yahoo.com",
	// 	"name":"Daniel de la O",
	// 	"fname":"Daniel",
	// 	"lname":"O"
	// },
	// {
	// 	"email":"tparada04@yahoo.com",
	// 	"name":"Tony Parada",
	// 	"fname":"Tony",
	// 	"lname":"Parada"
	// },
	// {
	// 	"email":"dudley_salt@yahoo.com",
	// 	"name":"Dudley Salt",
	// 	"fname":"Dudley",
	// 	"lname":"Salt"
	// },
	// {
	// 	"email":"mitchell.halpern@gmail.com",
	// 	"name":"Mitchell Halpern",
	// 	"fname":"Mitchell",
	// 	"lname":"Halpern"
	// },
	// {
	// 	"email":"m.scagnegatti@umiami.edu",
	// 	"name":"Melissa Scagnegatti",
	// 	"fname":"Melissa",
	// 	"lname":"Scagnegatti"
	// },
	// {
	// 	"email":"diogocamposnunes@hotmail.com",
	// 	"name":"Diogo Nunes",
	// 	"fname":"Diogo",
	// 	"lname":"Nunes"
	// },
	// {
	// 	"email":"mark.gilbert@cushwake.com",
	// 	"name":"Mark Gilbert",
	// 	"fname":"Mark",
	// 	"lname":"Gilbert"
	// },
	// {
	// 	"email":"bluas490@yahoo.com",
	// 	"name":"Bryan Saul",
	// 	"fname":"Bryan",
	// 	"lname":"Saul"
	// },
	// {
	// 	"email":"whj05@fsu.edu",
	// 	"name":"W. H. Johnson IV",
	// 	"fname":"W.",
	// 	"lname":"IV"
	// },
	// {
	// 	"email":"aplasencia03@gmail.com",
	// 	"name":"Ashley Plasencia",
	// 	"fname":"Ashley",
	// 	"lname":"Plasencia"
	// },
	// {
	// 	"email":"isasmalls@gmail.com",
	// 	"name":"Isabella Cisneros",
	// 	"fname":"Isabella",
	// 	"lname":"Cisneros"
	// },
	// {
	// 	"email":"adam@levinefamily.biz",
	// 	"name":"Adam Levine",
	// 	"fname":"Adam",
	// 	"lname":"Levine"
	// },
	// {
	// 	"email":"melh716@aol.com",
	// 	"name":"Melanie Haschek",
	// 	"fname":"Melanie",
	// 	"lname":"Haschek"
	// },
	// {
	// 	"email":"cmitchellllecu@gmail.com",
	// 	"name":"Chaffin Mitchell",
	// 	"fname":"Chaffin",
	// 	"lname":"Mitchell"
	// },
	// {
	// 	"email":"mattalbani@gmail.com",
	// 	"name":"Matthew Albani",
	// 	"fname":"Matthew",
	// 	"lname":"Albani"
	// },
	// {
	// 	"email":"meg.flatt@gmail.com",
	// 	"name":"Megan Flatt",
	// 	"fname":"Megan",
	// 	"lname":"Flatt"
	// },
	// {
	// 	"email":"william.wolfe06@me.com",
	// 	"name":"Will Wolfe",
	// 	"fname":"Will",
	// 	"lname":"Wolfe"
	// },
	// {
	// 	"email":"caallen@mail.usf.edu",
	// 	"name":"Cari Allen",
	// 	"fname":"Cari",
	// 	"lname":"Allen"
	// },
	// {
	// 	"email":"sao07c@fsu.edu",
	// 	"name":"Scott Offutt",
	// 	"fname":"Scott",
	// 	"lname":"Offutt"
	// },
	// {
	// 	"email":"m.byrne@umiami.edu",
	// 	"name":"Jake Byrne",
	// 	"fname":"Jake",
	// 	"lname":"Byrne"
	// },
	// {
	// 	"email":"driver77@comcast.net",
	// 	"name":"Christopher Farach",
	// 	"fname":"Christopher",
	// 	"lname":"Farach"
	// },
	// {
	// 	"email":"dws@dwsinger.com",
	// 	"name":"Daniel Singer",
	// 	"fname":"Daniel",
	// 	"lname":"Singer"
	// },
	// {
	// 	"email":"stephenmontalto1@gmail.com",
	// 	"name":"Stephen Montalto",
	// 	"fname":"Stephen",
	// 	"lname":"Montalto"
	// },
	// {
	// 	"email":"bhavikgpatel@gmail.com",
	// 	"name":"Bhavik Patel",
	// 	"fname":"Bhavik",
	// 	"lname":"Patel"
	// },
	// {
	// 	"email":"cerebralassassin305@gmail.com",
	// 	"name":"Alexander Pena",
	// 	"fname":"Alexander",
	// 	"lname":"Pena"
	// },
	// {
	// 	"email":"andres_marin07@hotmail.com",
	// 	"name":"Andres Marin",
	// 	"fname":"Andres",
	// 	"lname":"Marin"
	// },
	// {
	// 	"email":"jlbaker3@memphis.edu",
	// 	"name":"Joshua Lee Baker",
	// 	"fname":"Joshua",
	// 	"lname":"Baker"
	// },
	// {
	// 	"email":"jwright44@gmail.com",
	// 	"name":"Jon Wright",
	// 	"fname":"Jon",
	// 	"lname":"Wright"
	// },
	// {
	// 	"email":"jenn.schmukler@gmail.com",
	// 	"name":"Jenn Schmukler",
	// 	"fname":"Jenn",
	// 	"lname":"Schmukler"
	// },
	// {
	// 	"email":"nanat@hotmail.com",
	// 	"name":"Diana Trujillo",
	// 	"fname":"Diana",
	// 	"lname":"Trujillo"
	// },
	// {
	// 	"email":"cingo2000@aol.com",
	// 	"name":"Cindy Goldberg",
	// 	"fname":"Cindy",
	// 	"lname":"Goldberg"
	// },
	// {
	// 	"email":"rothhome@bellsouth.net",
	// 	"name":"Craig Roth",
	// 	"fname":"Craig",
	// 	"lname":"Roth"
	// },
	// {
	// 	"email":"rdevold@hotmail.com",
	// 	"name":"Ronda DeVold",
	// 	"fname":"Ronda",
	// 	"lname":"DeVold"
	// },
	// {
	// 	"email":"melissaeakle@gmail.com",
	// 	"name":"Melissa Siflinger Eakle",
	// 	"fname":"Melissa",
	// 	"lname":"Eakle"
	// },
	// {
	// 	"email":"kglrsn@gmail.com",
	// 	"name":"Kyle Larsen",
	// 	"fname":"Kyle",
	// 	"lname":"Larsen"
	// },
	// {
	// 	"email":"lenner_obando@yahoo.com",
	// 	"name":"Lenner Obando",
	// 	"fname":"Lenner",
	// 	"lname":"Obando"
	// },
	// {
	// 	"email":"rottwiler93@aol.com",
	// 	"name":"Michael D. Rettor",
	// 	"fname":"Michael",
	// 	"lname":"Rettor"
	// },
	// {
	// 	"email":"atomic.isa@gmail.com",
	// 	"name":"Isabel Godoy Gonzalez",
	// 	"fname":"Isabel",
	// 	"lname":"Gonzalez"
	// },
	// {
	// 	"email":"carlos.d.hoyos@hotmail.com",
	// 	"name":"Carlos Hoyos",
	// 	"fname":"Carlos",
	// 	"lname":"Hoyos"
	// },
	// {
	// 	"email":"lilylindz@aol.com",
	// 	"name":"Lindsay Conner",
	// 	"fname":"Lindsay",
	// 	"lname":"Conner"
	// },
	// {
	// 	"email":"xx_miichellex3@hotmail.fr",
	// 	"name":"Michelle Richard",
	// 	"fname":"Michelle",
	// 	"lname":"Richard"
	// },
	// {
	// 	"email":"vivandy@gmail.com",
	// 	"name":"Vanessa Vandy",
	// 	"fname":"Vanessa",
	// 	"lname":"Vandy"
	// },
	// {
	// 	"email":"josemg3@garcialorenzo.com",
	// 	"name":"Jose Miguel Garcia III",
	// 	"fname":"Jose",
	// 	"lname":"III"
	// },
	// {
	// 	"email":"eric.alexander@colorado.edu",
	// 	"name":"Eric Alexander",
	// 	"fname":"Eric",
	// 	"lname":"Alexander"
	// },
	// {
	// 	"email":"hova19812002@yahoo.com",
	// 	"name":"Manuel Castro",
	// 	"fname":"Manuel",
	// 	"lname":"Castro"
	// },
	// {
	// 	"email":"jackiehalpern1@gmail.com",
	// 	"name":"Jax Halps",
	// 	"fname":"Jax",
	// 	"lname":"Halps"
	// },
	// {
	// 	"email":"mclaughlin.gareth@gmail.com",
	// 	"name":"Gareth McLaughlin",
	// 	"fname":"Gareth",
	// 	"lname":"McLaughlin"
	// },
	// {
	// 	"email":"grace.demoya@gmail.com",
	// 	"name":"Grace de Moya",
	// 	"fname":"Grace",
	// 	"lname":"Moya"
	// },
	// {
	// 	"email":"dav9731@gmail.com",
	// 	"phone":"305-299-1000",
	// 	"name":"David Alexander Villarreal",
	// 	"fname":"David",
	// 	"lname":"Villarreal"
	// },
	// {
	// 	"email":"lizzie.padro@floridamoves.com",
	// 	"name":"Lizzie Padro",
	// 	"fname":"Lizzie",
	// 	"lname":"Padro"
	// },
	// {
	// 	"email":"glambarspa@gmail.com",
	// 	"name":"Gina Ramirez de Arellano",
	// 	"fname":"Gina",
	// 	"lname":"Arellano"
	// },
	// {
	// 	"email":"abreumania24@yahoo.com",
	// 	"name":"Rafael Abreu",
	// 	"fname":"Rafael",
	// 	"lname":"Abreu"
	// },
	// {
	// 	"email":"anabellamky@yahoo.com",
	// 	"name":"Anabella Aguilar",
	// 	"fname":"Anabella",
	// 	"lname":"Aguilar"
	// },
	// {
	// 	"email":"annamarakig@yahoo.gr",
	// 	"name":"Anna-Maria Gs",
	// 	"fname":"Anna-Maria",
	// 	"lname":"Gs"
	// },
	// {
	// 	"email":"katia@pobox.com",
	// 	"name":"Katia Pirozzi",
	// 	"fname":"Katia",
	// 	"lname":"Pirozzi"
	// },
	// {
	// 	"email":"jwhitefall@gmail.com",
	// 	"name":"Joe Whitefall",
	// 	"fname":"Joe",
	// 	"lname":"Whitefall"
	// },
	// {
	// 	"email":"samuelellin@yahoo.com",
	// 	"name":"Sam Ellin",
	// 	"fname":"Sam",
	// 	"lname":"Ellin"
	// },
	// {
	// 	"email":"lucascarus@hotmail.com",
	// 	"name":"Lucas Carus",
	// 	"fname":"Lucas",
	// 	"lname":"Carus"
	// },
	// {
	// 	"email":"mikeguo63@yahoo.com",
	// 	"name":"Mike Guo",
	// 	"fname":"Mike",
	// 	"lname":"Guo"
	// },
	// {
	// 	"email":"brian.svaldi001@mymdc.net",
	// 	"name":"Brian Svaldi",
	// 	"fname":"Brian",
	// 	"lname":"Svaldi"
	// },
	// {
	// 	"email":"mpich005@gmail.com",
	// 	"name":"Michelle Jinette Pichardo",
	// 	"fname":"Michelle",
	// 	"lname":"Pichardo"
	// },
	// {
	// 	"email":"sashusha_17@yahoo.com",
	// 	"name":"Sasha Bizyaeva",
	// 	"fname":"Sasha",
	// 	"lname":"Bizyaeva"
	// },
	// {
	// 	"email":"epainter@whitecase.com",
	// 	"name":"Elizabeth Painter",
	// 	"fname":"Elizabeth",
	// 	"lname":"Painter"
	// },
	// {
	// 	"email":"mpetrie20@gmail.com",
	// 	"name":"Matt Petrie",
	// 	"fname":"Matt",
	// 	"lname":"Petrie"
	// },
	// {
	// 	"email":"jennifer.gillespie5@gmail.com",
	// 	"name":"Jenn Gillespie",
	// 	"fname":"Jenn",
	// 	"lname":"Gillespie"
	// },
	// {
	// 	"email":"adamhcohen@gmail.com",
	// 	"name":"Adam H. Cohen",
	// 	"fname":"Adam",
	// 	"lname":"Cohen"
	// },
	// {
	// 	"email":"dustin.alamo@gmail.com",
	// 	"name":"Dustin Alamo",
	// 	"fname":"Dustin",
	// 	"lname":"Alamo"
	// },
	// {
	// 	"email":"chana.cannon@gmail.com",
	// 	"name":"Chana Cannon",
	// 	"fname":"Chana",
	// 	"lname":"Cannon"
	// },
	// {
	// 	"email":"priscyzl@yahoo.com",
	// 	"name":"Priscylla ZuÃ±iga LorÃ­a",
	// 	"fname":"Priscylla",
	// 	"lname":"LorÃ­a"
	// },
	// {
	// 	"email":"musica876@gmail.com",
	// 	"name":"Andrea Bianchi",
	// 	"fname":"Andrea",
	// 	"lname":"Bianchi"
	// },
	// {
	// 	"email":"boatdayapp@gmail.com",
	// 	"phone":"305-804-5307",
	// 	"name":"BoatDay App ",
	// 	"fname":"BoatDay",
	// 	"lname":"App "
	// },
	// {
	// 	"email":"kk1013@comcast.net",
	// 	"name":"Katie Wyant",
	// 	"fname":"Katie",
	// 	"lname":"Wyant"
	// },
	// {
	// 	"email":"jules2723@yahoo.com",
	// 	"name":"Julie Folkers",
	// 	"fname":"Julie",
	// 	"lname":"Folkers"
	// },
	// {
	// 	"email":"graemejcox@hotmail.com",
	// 	"name":"Graeme Cox",
	// 	"fname":"Graeme",
	// 	"lname":"Cox"
	// },
	// {
	// 	"email":"Rene.m.badia.jr@gmail.com",
	// 	"phone":"305-904-1709",
	// 	"name":"Rene M. Badia Jr.",
	// 	"fname":"Rene",
	// 	"lname":"Badia"
	// },
	// {
	// 	"email":"jovonvest@yahoo.com",
	// 	"name":"Jovon Vest",
	// 	"fname":"Jovon",
	// 	"lname":"Vest"
	// },
	// {
	// 	"email":"faststang589@yahoo.com",
	// 	"name":"Chris Delgado",
	// 	"fname":"Chris",
	// 	"lname":"Delgado"
	// },
	// {
	// 	"email":"ramonalcover@hotmail.com",
	// 	"name":"Ramon Alberto Alcover Casasnovas",
	// 	"fname":"Ramon",
	// 	"lname":"Casasnovas"
	// },
	// {
	// 	"email":"felipefuentes@ymail.com",
	// 	"name":"Felipe Fuentes",
	// 	"fname":"Felipe",
	// 	"lname":"Fuentes"
	// },
	// {
	// 	"email":"daixuedong@gmail.com",
	// 	"name":"Xuedong Dai",
	// 	"fname":"Xuedong",
	// 	"lname":"Dai"
	// },
	// {
	// 	"email":"amandamichiko@gmail.com",
	// 	"name":"Amanda Kay",
	// 	"fname":"Amanda",
	// 	"lname":"Kay"
	// },
	// {
	// 	"email":"taftsibley@gmail.com",
	// 	"name":"Taft Sibley",
	// 	"fname":"Taft",
	// 	"lname":"Sibley"
	// },
	// {
	// 	"email":"bairoala25@yahoo.com",
	// 	"name":"Rafael Berrios",
	// 	"fname":"Rafael",
	// 	"lname":"Berrios"
	// },
	// {
	// 	"email":"andonixxx@hotmail.com",
	// 	"name":"Andoni Ciarreta Rocco",
	// 	"fname":"Andoni",
	// 	"lname":"Rocco"
	// },
	// {
	// 	"email":"m.brewer15@ymail.com",
	// 	"name":"Megan Brewer",
	// 	"fname":"Megan",
	// 	"lname":"Brewer"
	// },
	// {
	// 	"email":"tcs11030@yahoo.com",
	// 	"name":"Tyler Stewart",
	// 	"fname":"Tyler",
	// 	"lname":"Stewart"
	// },
	// {
	// 	"email":"coppenheim7@gmail.com",
	// 	"name":"Chelsea Oppenheim",
	// 	"fname":"Chelsea",
	// 	"lname":"Oppenheim"
	// },
	// {
	// 	"email":"smm953@yahoo.com",
	// 	"name":"Steph Mas",
	// 	"fname":"Steph",
	// 	"lname":"Mas"
	// },
	// {
	// 	"email":"m.owens3@umiami.edu",
	// 	"name":"Micaela Owens",
	// 	"fname":"Micaela",
	// 	"lname":"Owens"
	// },
	// {
	// 	"email":"levycamille@hotmail.com",
	// 	"name":"Camille Levy",
	// 	"fname":"Camille",
	// 	"lname":"Levy"
	// },
	// {
	// 	"email":"cougars16@aol.com",
	// 	"name":"Drew Cretcher Loschke",
	// 	"fname":"Drew",
	// 	"lname":"Loschke"
	// },
	// {
	// 	"email":"bschmelkin@yahoo.com",
	// 	"name":"Brian Schmelkin",
	// 	"fname":"Brian",
	// 	"lname":"Schmelkin"
	// },
	// {
	// 	"email":"gordo21111@hotmail.com",
	// 	"name":"Jesus Hernandez",
	// 	"fname":"Jesus",
	// 	"lname":"Hernandez"
	// },
	// {
	// 	"email":"gracenbrown@sbcglobal.net",
	// 	"name":"Grace Brown",
	// 	"fname":"Grace",
	// 	"lname":"Brown"
	// },
	// {
	// 	"email":"smcdonnell1@gmail.com",
	// 	"name":"Sean McDonnell",
	// 	"fname":"Sean",
	// 	"lname":"McDonnell"
	// },
	// {
	// 	"email":"elwoodroof@yahoo.com",
	// 	"name":"Elizabeth Woodroof",
	// 	"fname":"Elizabeth",
	// 	"lname":"Woodroof"
	// },
	// {
	// 	"email":"bergofg@gmail.com",
	// 	"phone":"305-815-6553",
	// 	"name":"Ryan Scott",
	// 	"fname":"Ryan",
	// 	"lname":"Scott"
	// },
	// {
	// 	"email":"devinmoss@gmail.com",
	// 	"name":"Devin Moss",
	// 	"fname":"Devin",
	// 	"lname":"Moss"
	// },
	// {
	// 	"email":"captnmarc@aol.com",
	// 	"name":"Marc Strauss",
	// 	"fname":"Marc",
	// 	"lname":"Strauss"
	// },
	// {
	// 	"email":"scott42208@aol.com",
	// 	"name":"Scott Thompson",
	// 	"fname":"Scott",
	// 	"lname":"Thompson"
	// },
	// {
	// 	"email":"gonzalo.brown@outlook.com",
	// 	"name":"Chalo Brown",
	// 	"fname":"Chalo",
	// 	"lname":"Brown"
	// },
	// {
	// 	"email":"marcgraibe815@gmail.com",
	// 	"name":"Marc Graibe",
	// 	"fname":"Marc",
	// 	"lname":"Graibe"
	// },
	// {
	// 	"email":"jcohen@senetech.net",
	// 	"name":"Jody Cohen",
	// 	"fname":"Jody",
	// 	"lname":"Cohen"
	// },
	// {
	// 	"email":"hank@toddsantoro.com",
	// 	"name":"Hank Santoro",
	// 	"fname":"Hank",
	// 	"lname":"Santoro"
	// },
	// {
	// 	"email":"clindenmayer@gmail.com",
	// 	"name":"Chris Lindenmayer",
	// 	"fname":"Chris",
	// 	"lname":"Lindenmayer"
	// },
	// {
	// 	"email":"qmanning@gmail.com",
	// 	"name":"Q Manning Manning",
	// 	"fname":"Q",
	// 	"lname":"Manning"
	// },
	// {
	// 	"email":"armando_3052007@hotmail.com",
	// 	"name":"Armando Galguera",
	// 	"fname":"Armando",
	// 	"lname":"Galguera"
	// },
	// {
	// 	"email":"alex@bwtavern.com",
	// 	"phone":"678-274-8193",
	// 	"name":"Alex King",
	// 	"fname":"Alex",
	// 	"lname":"King"
	// },
	// {
	// 	"email":"brjm19752@yahoo.com",
	// 	"name":"Joshua McClellan",
	// 	"fname":"Joshua",
	// 	"lname":"McClellan"
	// },
	// {
	// 	"email":"v.thrower79@gmail.com",
	// 	"name":"Vicente Thrower",
	// 	"fname":"Vicente",
	// 	"lname":"Thrower"
	// },
	// {
	// 	"email":"jeff.buettin@gmail.com",
	// 	"name":"Jeff Buettin",
	// 	"fname":"Jeff",
	// 	"lname":"Buettin"
	// },
	// {
	// 	"email":"isielidolo@me.com",
	// 	"name":"Isi Chocron",
	// 	"fname":"Isi",
	// 	"lname":"Chocron"
	// },
	// {
	// 	"email":"mr.diego.mesa@gmail.com",
	// 	"name":"Diego Mesa",
	// 	"fname":"Diego",
	// 	"lname":"Mesa"
	// },
	// {
	// 	"email":"winterhk@gmail.com",
	// 	"name":"Brian Jackson",
	// 	"fname":"Brian",
	// 	"lname":"Jackson"
	// },
	// {
	// 	"email":"liljfuray@aol.com",
	// 	"name":"Jacqueline Olivia",
	// 	"fname":"Jacqueline",
	// 	"lname":"Olivia"
	// },
	// {
	// 	"email":"mrosa033@fiu.edu",
	// 	"name":"Mauricio Rosas",
	// 	"fname":"Mauricio",
	// 	"lname":"Rosas"
	// },
	// {
	// 	"email":"yesibabes20@gmail.com",
	// 	"name":"Yesi Delgadillo",
	// 	"fname":"Yesi",
	// 	"lname":"Delgadillo"
	// },
	// {
	// 	"email":"burgess21@hotmail.com",
	// 	"name":"Daniel Burgess",
	// 	"fname":"Daniel",
	// 	"lname":"Burgess"
	// },
	// {
	// 	"email":"chuck_m_binkley@fpl.com",
	// 	"name":"Chuck Binkley",
	// 	"fname":"Chuck",
	// 	"lname":"Binkley"
	// },
	// {
	// 	"email":"j.alex.motes@gmail.com",
	// 	"name":"Alex Motes",
	// 	"fname":"Alex",
	// 	"lname":"Motes"
	// },
	// {
	// 	"email":"conrad_vanl@convandesign.com",
	// 	"name":"Conrad Vanlandingham",
	// 	"fname":"Conrad",
	// 	"lname":"Vanlandingham"
	// },
	// {
	// 	"email":"captinshawn@gmail.com",
	// 	"name":"Shawn Catra",
	// 	"fname":"Shawn",
	// 	"lname":"Catra"
	// },
	// {
	// 	"email":"jscottdennis@gmail.com",
	// 	"name":"Scott Dennis",
	// 	"fname":"Scott",
	// 	"lname":"Dennis"
	// },
	// {
	// 	"email":"j.meyerson@umiami.edu",
	// 	"name":"Jared Meyerson",
	// 	"fname":"Jared",
	// 	"lname":"Meyerson"
	// },
	// {
	// 	"email":"justinroy911@gmail.com",
	// 	"name":"Justin Roy",
	// 	"fname":"Justin",
	// 	"lname":"Roy"
	// },
	// {
	// 	"email":"robcarrfb@gmail.com",
	// 	"name":"Robbie Carr",
	// 	"fname":"Robbie",
	// 	"lname":"Carr"
	// },
	// {
	// 	"email":"loureiro97@gmail.com",
	// 	"name":"Daniel Loureiro",
	// 	"fname":"Daniel",
	// 	"lname":"Loureiro"
	// },
	// {
	// 	"email":"eyalsharon@aol.com",
	// 	"name":"Eyal Sharon",
	// 	"fname":"Eyal",
	// 	"lname":"Sharon"
	// },
	// {
	// 	"email":"traphaely7@yahoo.com",
	// 	"name":"Tali Raphaely",
	// 	"fname":"Tali",
	// 	"lname":"Raphaely"
	// },
	// {
	// 	"email":"jeffreybell1975@gmail.com",
	// 	"phone":"305-896-5900",
	// 	"name":"Jeffrey Bell ",
	// 	"fname":"Jeffrey",
	// 	"lname":"Bell "
	// },
	// {
	// 	"email":"gdiazgrupodc@hotmail.com",
	// 	"name":"Guillermo Diaz",
	// 	"fname":"Guillermo",
	// 	"lname":"Diaz"
	// },
	// {
	// 	"email":"s.gomez0205@gmail.com",
	// 	"name":"Sergio Gomez",
	// 	"fname":"Sergio",
	// 	"lname":"Gomez"
	// },
	// {
	// 	"email":"tryanjordan@gmail.com",
	// 	"name":"Ryan Jordan",
	// 	"fname":"Ryan",
	// 	"lname":"Jordan"
	// },
	// {
	// 	"email":"amshapiro@uchicago.edu",
	// 	"name":"Andrew Shapiro",
	// 	"fname":"Andrew",
	// 	"lname":"Shapiro"
	// },
	// {
	// 	"email":"mastermechanicalac@gmail.com",
	// 	"name":"Shane Smith",
	// 	"fname":"Shane",
	// 	"lname":"Smith"
	// },
	// {
	// 	"email":"huloma@yahoo.com",
	// 	"name":"Humberto Lopez-Mata",
	// 	"fname":"Humberto",
	// 	"lname":"Lopez-Mata"
	// },
	// {
	// 	"email":"ryan@matzner.com",
	// 	"name":"Ryan D. Matzner",
	// 	"fname":"Ryan",
	// 	"lname":"Matzner"
	// },
	// {
	// 	"email":"ayoung@students.law.miami.edu",
	// 	"name":"Austin Young",
	// 	"fname":"Austin",
	// 	"lname":"Young"
	// },
	// {
	// 	"email":"michaelschlabig@gmail.com",
	// 	"name":"Michael Schlabig",
	// 	"fname":"Michael",
	// 	"lname":"Schlabig"
	// },
	// {
	// 	"email":"jordanhmartin@gmail.com",
	// 	"name":"Jordan Martin",
	// 	"fname":"Jordan",
	// 	"lname":"Martin"
	// },
	// {
	// 	"email":"mgsobrado@gmail.com",
	// 	"name":"Maria Gabriela",
	// 	"fname":"Maria",
	// 	"lname":"Gabriela"
	// },
	// {
	// 	"email":"argeri.lagos@gmail.com",
	// 	"name":"Argeri Lagos",
	// 	"fname":"Argeri",
	// 	"lname":"Lagos"
	// },
	// {
	// 	"email":"jessewozniak@yahoo.com",
	// 	"phone":"619-729-3886",
	// 	"name":"Jesse Wozniak",
	// 	"fname":"Jesse",
	// 	"lname":"Wozniak"
	// },
	// {
	// 	"email":"carrie.white1@yahoo.com",
	// 	"name":"Carrie White",
	// 	"fname":"Carrie",
	// 	"lname":"White"
	// },
	// {
	// 	"email":"emaircraftmaint@gmail.com",
	// 	"name":"Eric Martinez",
	// 	"fname":"Eric",
	// 	"lname":"Martinez"
	// },
	// {
	// 	"email":"erikt2457@gmail.com",
	// 	"name":"Erik Torres",
	// 	"fname":"Erik",
	// 	"lname":"Torres"
	// },
	// {
	// 	"email":"crazykate894@aol.com",
	// 	"name":"Katie Palmeri",
	// 	"fname":"Katie",
	// 	"lname":"Palmeri"
	// },
	// {
	// 	"email":"ghartlaub@gmail.com",
	// 	"name":"Gregory Hartlaub",
	// 	"fname":"Gregory",
	// 	"lname":"Hartlaub"
	// },
	// {
	// 	"email":"kkokarev@gmail.com",
	// 	"phone":"786-612-5555",
	// 	"name":"Kirill Kokarev",
	// 	"fname":"Kirill",
	// 	"lname":"Kokarev"
	// },
	// {
	// 	"email":"boneafidecharters@gmail.com",
	// 	"name":"JT Gabriel",
	// 	"fname":"JT",
	// 	"lname":"Gabriel"
	// },
	// {
	// 	"email":"carlos33432@yahoo.com",
	// 	"name":"Carlos Masso",
	// 	"fname":"Carlos",
	// 	"lname":"Masso"
	// },
	// {
	// 	"email":"dwatford@email.unc.edu",
	// 	"name":"Daniel Watford",
	// 	"fname":"Daniel",
	// 	"lname":"Watford"
	// },
	// {
	// 	"email":"allanflores8860@gmail.com",
	// 	"name":"Benny Benni",
	// 	"fname":"Benny",
	// 	"lname":"Benni"
	// },
	// {
	// 	"email":"rmcranie@gmail.com",
	// 	"name":"Robert Mcranie",
	// 	"fname":"Robert",
	// 	"lname":"Mcranie"
	// },
	// {
	// 	"email":"szamora54@gmail.com",
	// 	"name":"Sean Zamora",
	// 	"fname":"Sean",
	// 	"lname":"Zamora"
	// },
	// {
	// 	"email":"dougseamlessgutters@rocketmail.com",
	// 	"name":"Doug Helm",
	// 	"fname":"Doug",
	// 	"lname":"Helm"
	// },
	// {
	// 	"email":"cperkins8536@yahoo.com",
	// 	"name":"Cody Perkins",
	// 	"fname":"Cody",
	// 	"lname":"Perkins"
	// },
	// {
	// 	"email":"christalhirsch@gmail.com",
	// 	"name":"Christal Hirsch",
	// 	"fname":"Christal",
	// 	"lname":"Hirsch"
	// },
	// {
	// 	"email":"biketech1@live.com",
	// 	"name":"Jeff Kulberg",
	// 	"fname":"Jeff",
	// 	"lname":"Kulberg"
	// },
	// {
	// 	"email":"sarah.n.press@gmail.com",
	// 	"name":"Sarah Press",
	// 	"fname":"Sarah",
	// 	"lname":"Press"
	// },
	// {
	// 	"email":"rodgers_44@yahoo.com",
	// 	"name":"Wendy Rodgers",
	// 	"fname":"Wendy",
	// 	"lname":"Rodgers"
	// },
	// {
	// 	"email":"rfagun@gmail.com",
	// 	"name":"Ricardo Fagundo",
	// 	"fname":"Ricardo",
	// 	"lname":"Fagundo"
	// },
	// {
	// 	"email":"luisrivadeneiralr@hotmail.com",
	// 	"name":"Luis Rivadeneira",
	// 	"fname":"Luis",
	// 	"lname":"Rivadeneira"
	// },
	// {
	// 	"email":"ryandeitrich@yahoo.com",
	// 	"name":"Ryan Deitrich",
	// 	"fname":"Ryan",
	// 	"lname":"Deitrich"
	// },
	// {
	// 	"email":"tampakodiak@gmail.com",
	// 	"name":"John Trigger",
	// 	"fname":"John",
	// 	"lname":"Trigger"
	// },
	// {
	// 	"email":"ktuerff@enviromedia.com",
	// 	"name":"Kevin Tuerff",
	// 	"fname":"Kevin",
	// 	"lname":"Tuerff"
	// },
	// {
	// 	"email":"facebook@davesnipe360.com",
	// 	"name":"David Krauss",
	// 	"fname":"David",
	// 	"lname":"Krauss"
	// },
	// {
	// 	"email":"snoopydude@hotmail.it",
	// 	"name":"Alexander Blower",
	// 	"fname":"Alexander",
	// 	"lname":"Blower"
	// },
	// {
	// 	"email":"amber_nina18@hotmail.com",
	// 	"name":"Ambar Rodriguez",
	// 	"fname":"Ambar",
	// 	"lname":"Rodriguez"
	// },
	// {
	// 	"email":"angeltgonzalez@gmail.com",
	// 	"name":"Angel Tomas Gonzalez",
	// 	"fname":"Angel",
	// 	"lname":"Gonzalez"
	// },
	// {
	// 	"email":"rickyhamilton89@gmail.com",
	// 	"name":"Ricky Hamilton",
	// 	"fname":"Ricky",
	// 	"lname":"Hamilton"
	// },
	// {
	// 	"email":"kimonk111@aol.com",
	// 	"phone":"305-804-5307",
	// 	"name":"Kimon Korres",
	// 	"fname":"Kimon",
	// 	"lname":"Korres"
	// },
	// {
	// 	"email":"tiago@toptal.com",
	// 	"name":"Hive Solutions",
	// 	"fname":"Hive",
	// 	"lname":"Solutions"
	// },
	// {
	// 	"email":"willverine72@yahoo.com",
	// 	"name":"Willie Mejias",
	// 	"fname":"Willie",
	// 	"lname":"Mejias"
	// },
	// {
	// 	"email":"victoria1991_7@hotmail.com",
	// 	"name":"Vicky Bengoa",
	// 	"fname":"Vicky",
	// 	"lname":"Bengoa"
	// },
	// {
	// 	"email":"ernestojsmith@hotmail.com",
	// 	"name":"Ernesto Smith",
	// 	"fname":"Ernesto",
	// 	"lname":"Smith"
	// },
	// {
	// 	"email":"tbreuer77@gmail.com",
	// 	"name":"Tyler John",
	// 	"fname":"Tyler",
	// 	"lname":"John"
	// },
	// {
	// 	"email":"vgomez827@yahoo.com",
	// 	"name":"Victor Gomez",
	// 	"fname":"Victor",
	// 	"lname":"Gomez"
	// },
	// {
	// 	"email":"omarhatab56@gmail.com",
	// 	"name":"Omar Hatab",
	// 	"fname":"Omar",
	// 	"lname":"Hatab"
	// },
	// {
	// 	"email":"jmartinez9904@gmail.com",
	// 	"name":"Jese Martinez",
	// 	"fname":"Jese",
	// 	"lname":"Martinez"
	// },
	// {
	// 	"email":"chiplusko@gmail.com",
	// 	"name":"Chip Lusko",
	// 	"fname":"Chip",
	// 	"lname":"Lusko"
	// },
	// {
	// 	"email":"ivorhumphrey@gmail.com",
	// 	"name":"Ivor Survivor Intl Humphrey",
	// 	"fname":"Ivor",
	// 	"lname":"Humphrey"
	// },
	// {
	// 	"email":"khillow@gmail.com",
	// 	"name":"Kevin Christopher",
	// 	"fname":"Kevin",
	// 	"lname":"Christopher"
	// },
	// {
	// 	"email":"tracole25@yahoo.com",
	// 	"name":"Nicole Starchild Jones",
	// 	"fname":"Nicole",
	// 	"lname":"Jones"
	// },
	// {
	// 	"email":"omizing@yahoo.com",
	// 	"name":"Romado Stephens",
	// 	"fname":"Romado",
	// 	"lname":"Stephens"
	// },
	// {
	// 	"email":"quincybeneche@yahoo.com",
	// 	"name":"Quincy Beneche",
	// 	"fname":"Quincy",
	// 	"lname":"Beneche"
	// },
	// {
	// 	"email":"adiaphoto@gmail.com",
	// 	"name":"Adi Adinayev",
	// 	"fname":"Adi",
	// 	"lname":"Adinayev"
	// },
	// {
	// 	"email":"jayson9241988@yahoo.com",
	// 	"name":"Jayson Reyes",
	// 	"fname":"Jayson",
	// 	"lname":"Reyes"
	// },
	// {
	// 	"email":"omarq002@fiu.edu",
	// 	"name":"Om Marquez",
	// 	"fname":"Om",
	// 	"lname":"Marquez"
	// },
	// {
	// 	"email":"delphineortega@hotmail.com",
	// 	"name":"Delphine Sacco",
	// 	"fname":"Delphine",
	// 	"lname":"Sacco"
	// },
	// {
	// 	"email":"aroundmiami@gmail.com",
	// 	"name":"Bryan Garcia",
	// 	"fname":"Bryan",
	// 	"lname":"Garcia"
	// },
	// {
	// 	"email":"yachtbabe118@yahoo.com",
	// 	"name":"Melissa Martinez",
	// 	"fname":"Melissa",
	// 	"lname":"Martinez"
	// },
	// {
	// 	"email":"marc@mytoga.net",
	// 	"name":"Marcelo M. Garcia",
	// 	"fname":"Marcelo",
	// 	"lname":"Garcia"
	// },
	// {
	// 	"email":"vurtjie@yahoo.com",
	// 	"name":"Leon Van Rooyen",
	// 	"fname":"Leon",
	// 	"lname":"Rooyen"
	// },
	// {
	// 	"email":"isasof.benitez@gmail.com",
	// 	"name":"Henry Benitez",
	// 	"fname":"Henry",
	// 	"lname":"Benitez"
	// },
	// {
	// 	"email":"drew6701@aol.com",
	// 	"name":"Andrew Christopher Pollock",
	// 	"fname":"Andrew",
	// 	"lname":"Pollock"
	// },
	// {
	// 	"email":"carmensfamous@gmail.com",
	// 	"name":"Carmen Marie",
	// 	"fname":"Carmen",
	// 	"lname":"Marie"
	// },
	// {
	// 	"email":"arroyo.elliot@yahoo.com",
	// 	"name":"Elliot Arroyo",
	// 	"fname":"Elliot",
	// 	"lname":"Arroyo"
	// },
	// {
	// 	"email":"espcolusa1@yahoo.com",
	// 	"name":"Mauricio Sanchez Falla",
	// 	"fname":"Mauricio",
	// 	"lname":"Falla"
	// },
	// {
	// 	"email":"hartwelltravis@yahoo.com",
	// 	"name":"Travis Hartwell",
	// 	"fname":"Travis",
	// 	"lname":"Hartwell"
	// },
	// {
	// 	"email":"fgdukov@yahoo.com",
	// 	"name":"Frank N Vanessa",
	// 	"fname":"Frank",
	// 	"lname":"Vanessa"
	// },
	// {
	// 	"email":"denis.pugliese1@gmail.com",
	// 	"name":"Denis Pugliese",
	// 	"fname":"Denis",
	// 	"lname":"Pugliese"
	// },
	// {
	// 	"email":"azra.choudhary@icloud.com",
	// 	"name":"AJ Calero",
	// 	"fname":"AJ",
	// 	"lname":"Calero"
	// },
	// {
	// 	"email":"keithshoem@aim.com",
	// 	"name":"Keith Shoemaker",
	// 	"fname":"Keith",
	// 	"lname":"Shoemaker"
	// },
	// {
	// 	"email":"mlacay04@hotmail.com",
	// 	"name":"Milton Lacayo",
	// 	"fname":"Milton",
	// 	"lname":"Lacayo"
	// },
	// {
	// 	"email":"angelajaramillo17@hotmail.com",
	// 	"name":"Angela Jaramillo",
	// 	"fname":"Angela",
	// 	"lname":"Jaramillo"
	// },
	// {
	// 	"email":"stratuscrew@gmail.com",
	// 	"name":"Cristian Jimenez",
	// 	"fname":"Cristian",
	// 	"lname":"Jimenez"
	// },
	// {
	// 	"email":"stephenjuelle@gmail.com",
	// 	"name":"Stephen Menendez",
	// 	"fname":"Stephen",
	// 	"lname":"Menendez"
	// },
	// {
	// 	"email":"fgranger@bellsouth.net",
	// 	"name":"Fred Grainger",
	// 	"fname":"Fred",
	// 	"lname":"Grainger"
	// },
	// {
	// 	"email":"choosejuicy02@yahoo.com",
	// 	"phone":"786-537-4792",
	// 	"name":"Samantha Poorman",
	// 	"fname":"Samantha",
	// 	"lname":"Poorman"
	// },
	// {
	// 	"email":"sean.nabors@yahoo.com",
	// 	"name":"Sean Nabors",
	// 	"fname":"Sean",
	// 	"lname":"Nabors"
	// },
	// {
	// 	"email":"perlaferla@gmail.com",
	// 	"name":"Perla Bianca",
	// 	"fname":"Perla",
	// 	"lname":"Bianca"
	// },
	// {
	// 	"email":"fastimenow@gmail.com",
	// 	"name":"Jam Hall",
	// 	"fname":"Jam",
	// 	"lname":"Hall"
	// },
	// {
	// 	"email":"lexyandrea@hotmail.com",
	// 	"name":"Leximay Osorio",
	// 	"fname":"Leximay",
	// 	"lname":"Osorio"
	// },
	// {
	// 	"email":"aimadi@yahoo.com",
	// 	"name":"Idamia Moreland",
	// 	"fname":"Idamia",
	// 	"lname":"Moreland"
	// },
	// {
	// 	"email":"izabellaachcar@hotmail.com",
	// 	"name":"Izabella Achcar-Rodrigues",
	// 	"fname":"Izabella",
	// 	"lname":"Achcar-Rodrigues"
	// },
	// {
	// 	"email":"saleh.alassaf001@gmail.com",
	// 	"name":"Saleh Alassaf",
	// 	"fname":"Saleh",
	// 	"lname":"Alassaf"
	// },
	// {
	// 	"email":"ramcpikachu@yahoo.com",
	// 	"name":"Henry Ford",
	// 	"fname":"Henry",
	// 	"lname":"Ford"
	// },
	// {
	// 	"email":"trocdolo@gmail.com",
	// 	"name":"Anthony Troc Benitez",
	// 	"fname":"Anthony",
	// 	"lname":"Benitez"
	// },
	// {
	// 	"email":"bighambone360@gmail.com",
	// 	"name":"Abraham Torres",
	// 	"fname":"Abraham",
	// 	"lname":"Torres"
	// },
	// {
	// 	"email":"desireereyesroche@gmail.com",
	// 	"name":"Desiree Reyes",
	// 	"fname":"Desiree",
	// 	"lname":"Reyes"
	// },
	// {
	// 	"email":"rodparisi@yahoo.com",
	// 	"name":"Rodrigo Parisi",
	// 	"fname":"Rodrigo",
	// 	"lname":"Parisi"
	// },
	// {
	// 	"email":"drozumny@gmail.com",
	// 	"name":"Dustin Rozumny",
	// 	"fname":"Dustin",
	// 	"lname":"Rozumny"
	// },
	// {
	// 	"email":"matthew@jones-adams.com",
	// 	"name":"Matthew L Jones",
	// 	"fname":"Matthew",
	// 	"lname":"Jones"
	// },
	// {
	// 	"email":"sniperhk@live.com",
	// 	"name":"Carla E Gerald",
	// 	"fname":"Carla",
	// 	"lname":"Gerald"
	// },
	// {
	// 	"email":"stevensira3040@gmail.com",
	// 	"name":"Michelle Stevens",
	// 	"fname":"Michelle",
	// 	"lname":"Stevens"
	// },
	// {
	// 	"email":"agalante@gmyachts.com",
	// 	"name":"G Marine Yachts",
	// 	"fname":"G",
	// 	"lname":"Yachts"
	// },
	// {
	// 	"email":"veronicaemma@hotmail.com",
	// 	"name":"Veronica Januzzi",
	// 	"fname":"Veronica",
	// 	"lname":"Januzzi"
	// },
	// {
	// 	"email":"monica@levyad.com",
	// 	"name":"Monica Rios",
	// 	"fname":"Monica",
	// 	"lname":"Rios"
	// },
	// {
	// 	"email":"swilkers@me.com",
	// 	"name":"Steve Wilkerson",
	// 	"fname":"Steve",
	// 	"lname":"Wilkerson"
	// },
	// {
	// 	"email":"yannygonzalez@yahoo.com",
	// 	"name":"Yanny Gonzalez",
	// 	"fname":"Yanny",
	// 	"lname":"Gonzalez"
	// },
	// {
	// 	"email":"susygrande@hotmail.com",
	// 	"name":"Susy Grande",
	// 	"fname":"Susy",
	// 	"lname":"Grande"
	// },
	// {
	// 	"email":"dapeez@aol.com",
	// 	"name":"David Pearce",
	// 	"fname":"David",
	// 	"lname":"Pearce"
	// },
	// {
	// 	"email":"sdiazzz31@gmail.com",
	// 	"name":"Steven Diaz",
	// 	"fname":"Steven",
	// 	"lname":"Diaz"
	// },
	// {
	// 	"email":"fairell@aol.com",
	// 	"name":"George Fairell",
	// 	"fname":"George",
	// 	"lname":"Fairell"
	// },
	// {
	// 	"email":"cortega777@aol.com",
	// 	"name":"Carlos Ortega",
	// 	"fname":"Carlos",
	// 	"lname":"Ortega"
	// },
	// {
	// 	"email":"danny.rico@hotmail.com",
	// 	"name":"Danny Rico",
	// 	"fname":"Danny",
	// 	"lname":"Rico"
	// },
	// {
	// 	"email":"lilyeney@yahoo.com",
	// 	"name":"Yenesis Leon",
	// 	"fname":"Yenesis",
	// 	"lname":"Leon"
	// },
	// {
	// 	"email":"na.14@live.com",
	// 	"name":"Nara Mattevi",
	// 	"fname":"Nara",
	// 	"lname":"Mattevi"
	// },
	// {
	// 	"email":"cfelini@hotmail.com",
	// 	"name":"Carla Felini",
	// 	"fname":"Carla",
	// 	"lname":"Felini"
	// },
	// {
	// 	"email":"imc281@live.com",
	// 	"name":"Ingrid Magali",
	// 	"fname":"Ingrid",
	// 	"lname":"Magali"
	// },
	// {
	// 	"email":"ferrellmedia@yahoo.com",
	// 	"name":"Jim Ferrell",
	// 	"fname":"Jim",
	// 	"lname":"Ferrell"
	// },
	// {
	// 	"email":"jorge.mendoza@equiflor.com",
	// 	"name":"Jorge Mendoza",
	// 	"fname":"Jorge",
	// 	"lname":"Mendoza"
	// },
	// {
	// 	"email":"jmiranda11@aol.com",
	// 	"name":"Jessika Miranda",
	// 	"fname":"Jessika",
	// 	"lname":"Miranda"
	// },
	// {
	// 	"email":"crissig@bellsouth.net",
	// 	"name":"Cris Signorelli",
	// 	"fname":"Cris",
	// 	"lname":"Signorelli"
	// },
	// {
	// 	"email":"carodecohen@hotmail.com",
	// 	"name":"Carolina G. Cohen",
	// 	"fname":"Carolina",
	// 	"lname":"Cohen"
	// },
	// {
	// 	"email":"erickmendieta@hotmail.com",
	// 	"name":"Erick Mendieta",
	// 	"fname":"Erick",
	// 	"lname":"Mendieta"
	// },
	// {
	// 	"email":"erwisxray47@aol.com",
	// 	"name":"Erwis Rivero",
	// 	"fname":"Erwis",
	// 	"lname":"Rivero"
	// },
	// {
	// 	"email":"dianacomas1@yahoo.com",
	// 	"name":"Diana Comas",
	// 	"fname":"Diana",
	// 	"lname":"Comas"
	// },
	// {
	// 	"email":"quadkini721@aol.com",
	// 	"name":"Denise Granato",
	// 	"fname":"Denise",
	// 	"lname":"Granato"
	// },
	// {
	// 	"email":"darniebal4@hotmail.com",
	// 	"name":"Dionne Favored",
	// 	"fname":"Dionne",
	// 	"lname":"Favored"
	// },
	// {
	// 	"email":"ginamariestoney@gmail.com",
	// 	"name":"Gina Marie",
	// 	"fname":"Gina",
	// 	"lname":"Marie"
	// },
	// {
	// 	"email":"supertecmike@gmail.com",
	// 	"name":"Mike Calvet",
	// 	"fname":"Mike",
	// 	"lname":"Calvet"
	// },
	// {
	// 	"email":"ryanesco27@aol.com",
	// 	"name":"Ryan Escobar",
	// 	"fname":"Ryan",
	// 	"lname":"Escobar"
	// },
	// {
	// 	"email":"aquinom1983@gmail.com",
	// 	"name":"Segura Segurisima",
	// 	"fname":"Segura",
	// 	"lname":"Segurisima"
	// },
	// {
	// 	"email":"gm25pou@yahoo.com",
	// 	"name":"Gloria M. Pou",
	// 	"fname":"Gloria",
	// 	"lname":"Pou"
	// },
	// {
	// 	"email":"pinkgem2005@yahoo.com",
	// 	"name":"christopher Pink1",
	// 	"fname":"christopher",
	// 	"lname":"Pink1"
	// },
	// {
	// 	"email":"karelbosch@yahoo.com",
	// 	"name":"Karel Bosch",
	// 	"fname":"Karel",
	// 	"lname":"Bosch"
	// },
	// {
	// 	"email":"magicmirrordetailing1@gmail.com",
	// 	"name":"Danny Lowery",
	// 	"fname":"Danny",
	// 	"lname":"Lowery"
	// },
	// {
	// 	"email":"davidancona@me.com",
	// 	"name":"David Eduardo Ancona",
	// 	"fname":"David",
	// 	"lname":"Ancona"
	// },
	// {
	// 	"email":"alysonroque@yahoo.com",
	// 	"name":"Alyson Marie Roque",
	// 	"fname":"Alyson",
	// 	"lname":"Roque"
	// },
	// {
	// 	"email":"kpayne100@hotmail.com",
	// 	"name":"Karl Payne",
	// 	"fname":"Karl",
	// 	"lname":"Payne"
	// },
	// {
	// 	"email":"gsteiner@q-station.com",
	// 	"phone":"954-647-4466",
	// 	"name":"Greg Steiner",
	// 	"fname":"Greg",
	// 	"lname":"Steiner"
	// },
	// {
	// 	"email":"lucy16950@hotmail.com",
	// 	"name":"Lucy Castillo",
	// 	"fname":"Lucy",
	// 	"lname":"Castillo"
	// },
	// {
	// 	"email":"belkys033070@yahoo.com",
	// 	"name":"Belkys M Alvarez",
	// 	"fname":"Belkys",
	// 	"lname":"Alvarez"
	// },
	// {
	// 	"email":"mom2be34@gmail.com",
	// 	"name":"Maria Marin-Acevedo",
	// 	"fname":"Maria",
	// 	"lname":"Marin-Acevedo"
	// },
	// {
	// 	"email":"mdff3@yahoo.com",
	// 	"name":"Tony Infantolino",
	// 	"fname":"Tony",
	// 	"lname":"Infantolino"
	// },
	// {
	// 	"email":"lenere.colson@icloud.com",
	// 	"name":"Alexx Jay",
	// 	"fname":"Alexx",
	// 	"lname":"Jay"
	// },
	// {
	// 	"email":"eferg001@fiu.edu",
	// 	"name":"Edward Ferguson",
	// 	"fname":"Edward",
	// 	"lname":"Ferguson"
	// },
	// {
	// 	"email":"ray.willig@gmail.com",
	// 	"name":"Ray Willig",
	// 	"fname":"Ray",
	// 	"lname":"Willig"
	// },
	// {
	// 	"email":"egbaker286@gmail.com",
	// 	"name":"Eddy Baker",
	// 	"fname":"Eddy",
	// 	"lname":"Baker"
	// },
	// {
	// 	"email":"jovanaradmanovic@yahoo.com",
	// 	"name":"Jovana Radmanovic",
	// 	"fname":"Jovana",
	// 	"lname":"Radmanovic"
	// },
	// {
	// 	"email":"newsforce@aol.com",
	// 	"name":"Alex DiPrato",
	// 	"fname":"Alex",
	// 	"lname":"DiPrato"
	// },
	// {
	// 	"email":"ernestobetances@hotmail.com",
	// 	"name":"Ernesto Betances",
	// 	"fname":"Ernesto",
	// 	"lname":"Betances"
	// },
	// {
	// 	"email":"etf@minorisa.es",
	// 	"name":"Enric Torres Fumanal",
	// 	"fname":"Enric",
	// 	"lname":"Fumanal"
	// },
	// {
	// 	"email":"relik24@aol.com",
	// 	"name":"Ivan Novo",
	// 	"fname":"Ivan",
	// 	"lname":"Novo"
	// },
	// {
	// 	"email":"rdlove@mdpd.com",
	// 	"name":"Robert Love",
	// 	"fname":"Robert",
	// 	"lname":"Love"
	// },
	// {
	// 	"email":"jaredduke69@gmail.com",
	// 	"name":"Jared Duke",
	// 	"fname":"Jared",
	// 	"lname":"Duke"
	// },
	// {
	// 	"email":"gschwanzl@gmail.com",
	// 	"name":"Greg Schwanzl",
	// 	"fname":"Greg",
	// 	"lname":"Schwanzl"
	// },
	// {
	// 	"email":"bernardoparedes0@hotmail.com",
	// 	"name":"Bernardo Paredes",
	// 	"fname":"Bernardo",
	// 	"lname":"Paredes"
	// },
	// {
	// 	"email":"kmcclure@columbus.rr.com",
	// 	"name":"Kerry McClure",
	// 	"fname":"Kerry",
	// 	"lname":"McClure"
	// },
	// {
	// 	"email":"ffjrobinson@gmail.com",
	// 	"name":"Jason Robinson",
	// 	"fname":"Jason",
	// 	"lname":"Robinson"
	// },
	// {
	// 	"email":"josidp@yahoo.com.br",
	// 	"name":"Josi Paula",
	// 	"fname":"Josi",
	// 	"lname":"Paula"
	// },
	// {
	// 	"email":"crissygonthenet@hotmail.com",
	// 	"name":"Cristi Pady",
	// 	"fname":"Cristi",
	// 	"lname":"Pady"
	// },
	// {
	// 	"email":"aerminy92@gmail.com",
	// 	"name":"Alejandro Erminy",
	// 	"fname":"Alejandro",
	// 	"lname":"Erminy"
	// },
	// {
	// 	"email":"matthewswanson99@gmail.com",
	// 	"name":"M S",
	// 	"fname":"M",
	// 	"lname":"S"
	// },
	// {
	// 	"email":"brendan.cruickshank@gmail.com",
	// 	"name":"Brendan Cruickshank",
	// 	"fname":"Brendan",
	// 	"lname":"Cruickshank"
	// },
	// {
	// 	"email":"adamtwebster@gmail.com",
	// 	"name":"Adam Webster",
	// 	"fname":"Adam",
	// 	"lname":"Webster"
	// },
	// {
	// 	"email":"brodar1996@gmail.com",
	// 	"name":"Bynar Rodriguez",
	// 	"fname":"Bynar",
	// 	"lname":"Rodriguez"
	// },
	// {
	// 	"email":"donkey289@yahoo.com",
	// 	"name":"Carlos Rios",
	// 	"fname":"Carlos",
	// 	"lname":"Rios"
	// },
	// {
	// 	"email":"mrasumoff@hotmail.com",
	// 	"name":"Michael Rasumoff",
	// 	"fname":"Michael",
	// 	"lname":"Rasumoff"
	// },
	// {
	// 	"email":"crioknight@gmail.com",
	// 	"name":"Abe Zarran",
	// 	"fname":"Abe",
	// 	"lname":"Zarran"
	// },
	// {
	// 	"email":"herndondana@gmail.com",
	// 	"name":"Dana Herndon",
	// 	"fname":"Dana",
	// 	"lname":"Herndon"
	// },
	// {
	// 	"email":"jeffbloom77@ymail.com",
	// 	"name":"Jeff Bloom",
	// 	"fname":"Jeff",
	// 	"lname":"Bloom"
	// },
	// {
	// 	"email":"lai.pinel@gmail.com",
	// 	"name":"Lai Pinel",
	// 	"fname":"Lai",
	// 	"lname":"Pinel"
	// },
	// {
	// 	"email":"sasinc4@msn.com",
	// 	"name":"Ian G Anderson",
	// 	"fname":"Ian",
	// 	"lname":"Anderson"
	// },
	// {
	// 	"email":"trushad@icloud.com",
	// 	"name":"Shad Santiago",
	// 	"fname":"Shad",
	// 	"lname":"Santiago"
	// },
	// {
	// 	"email":"explosivedesigns@bellsouth.net",
	// 	"name":"Mike Syrakis",
	// 	"fname":"Mike",
	// 	"lname":"Syrakis"
	// },
	// {
	// 	"email":"aqcmar@aol.com",
	// 	"name":"Adam QC",
	// 	"fname":"Adam",
	// 	"lname":"QC"
	// },
	// {
	// 	"email":"mkieltsch@me.com",
	// 	"name":"Michael Kieltsch",
	// 	"fname":"Michael",
	// 	"lname":"Kieltsch"
	// },
	// {
	// 	"email":"nigel.250@hotmail.com",
	// 	"name":"Nima Hashemi",
	// 	"fname":"Nima",
	// 	"lname":"Hashemi"
	// },
	// {
	// 	"email":"a_teregulov@mail.ru",
	// 	"name":"Ploveshnik Tashkentskiy",
	// 	"fname":"Ploveshnik",
	// 	"lname":"Tashkentskiy"
	// },
	// {
	// 	"email":"adec@q-station.com",
	// 	"name":"Autumn Dec",
	// 	"fname":"Autumn",
	// 	"lname":"Dec"
	// },
	// {
	// 	"email":"yerlav@gmail.com",
	// 	"name":"Yeri Lavin",
	// 	"fname":"Yeri",
	// 	"lname":"Lavin"
	// },
	// {
	// 	"email":"richiept@msn.com",
	// 	"name":"Rich Federico",
	// 	"fname":"Rich",
	// 	"lname":"Federico"
	// },
	// {
	// 	"email":"andy@pelicansinks.com",
	// 	"name":"Andy Badaro",
	// 	"fname":"Andy",
	// 	"lname":"Badaro"
	// },
	// {
	// 	"email":"dominick.venturi@gmail.com",
	// 	"name":"Dominick Venturi",
	// 	"fname":"Dominick",
	// 	"lname":"Venturi"
	// },
	// {
	// 	"email":"pbagley@gmail.com",
	// 	"name":"Paul Bagley",
	// 	"fname":"Paul",
	// 	"lname":"Bagley"
	// },
	// {
	// 	"email":"turbodog23@aol.com",
	// 	"name":"George Perez",
	// 	"fname":"George",
	// 	"lname":"Perez"
	// },
	// {
	// 	"email":"ctvtravel@yahoo.com",
	// 	"name":"Chuck Kahlo",
	// 	"fname":"Chuck",
	// 	"lname":"Kahlo"
	// },
	// {
	// 	"email":"penzer@msn.com",
	// 	"name":"Gil Gordon",
	// 	"fname":"Gil",
	// 	"lname":"Gordon"
	// }];

	var list = [
	{
		"email":"costa@vixinet.ch",
		"name":"Paul Bagley",
		"fname":"Paul",
		"lname":"Bagley"
	},
	{
		"email":"Kimon@boatdayapp.com",
		"name":"Chuck Kahlo",
		"fname":"Chuck",
		"lname":"Kahlo"
	}];

	Parse.Config.get().then(function(config) {

		Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
		
		var _response = [];
		var promises = [];

		var tpl = _.template(fs.readFileSync('cloud/templates/email-canvas-01.html.js','utf8'));

		_.each(list, function(user) {

			promises.push((function(user) {
				
				var promise = new Parse.Promise();
				
				var _tpl = tpl({
					date: 'JUNE 10, 2015',
					more: 'https://itunes.apple.com/us/app/boatday/id953574487?ls=1&mt=8',
					moreText: 'Update now',
					title: 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet',
					text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
				});

				Mailgun.sendEmail({
					to: user.email,
					from: "Kimon@boatdayapp.com",
					subject: "BoatDay is coming with a new version!",
					// text: "blabla"
					html: _tpl
				}).then(function(httpResponse) {
					_response.push([user.email, 'success']);
					promise.resolve();
				}, function(error) {
					_response.push([user.email, 'error', error]);
					promise.resolve();
				});

				return promise;
			})(user));

		});


		Parse.Promise.when(promises).then(function() {
			response.success(_response);
		});
	});
	

});

Parse.Cloud.define("getHostsCreationStatus", function(request, response) {
	
	var _ = require('underscore');

	var query = new Parse.Query(Parse.Object.extend('_User'));
	query.matchesQuery('host', innerQuery);
	query.limit(1000);
	query.find().then(function(users) {

		var data = [];

		_.each(users, function(user) {
			data.push(user.get('email'));
		})

		response.success(data);
	})

});

Parse.Cloud.define("attachPictureToBoat", function(request, response) {
	
	var a = [];
	var _ = require('underscore');

	new Parse.Query(Parse.Object.extend('Boat')).get(request.params.boat).then(function(boat) {
		new Parse.Query(Parse.Object.extend('FileHolder')).get(request.params.fileHolder).then(function(fh) {
			boat.relation('boatPictures').add(fh);
			boat.save().then(function() {
				response.success("done");
			}, function(error) {
				console.log(error);
				response.error("error");
			});
		});
	});

});

Parse.Cloud.define("attachProfileToUser", function(request, response) {
	
	var a = [];
	var _ = require('underscore');

	new Parse.Query(Parse.Object.extend('_User')).find().then(function(users) {
		_.each(users, function(user) {
			new Parse.Query(Parse.Object.extend('Profile')).get(user.get('profile').id).then(function(profile) {
				console.log(profile.id);
				console.log(user.id);
				profile.save({ user: user });
			});
		});
	});

});

Parse.Cloud.define("grantCmsAdmin", function(request, response) {  
	
	if( !request.params.userId ) {
		response.error("please, give a userId in POST param");
	}

	var cbBasicSuccess = function() {
		response.success();	
	};

	var cbBasicError = function(error) {
		response.error(error.message);
	}

	var roleSuccess = function(role) {

		var gotUser = function(user) {
			Parse.Cloud.useMasterKey();
			role.getUsers().add(user);
			role.save().then(cbBasicSuccess, cbBasicError);
		}

		new Parse.Query(Parse.User).get(request.params.userId).then(gotUser, cbBasicError);
	};

	var query = new Parse.Query(Parse.Role); 
	query.equalTo("name", "admin-cms");
	query.first().then(roleSuccess, cbBasicError);

});

Parse.Cloud.define("sendDriverEmail", function(request, response) {

	/**
	  * Params :
	  * - captainRequest
	  **/

	var Mailgun = require('mailgun');

	var captainRequest = request.params.captainRequest;
	var config = null;

	var cbError = function(error) {
		console.log(error);
		response.error("error in 'sendDriverEmail' check logs for more informations [captainRequest="+captainRequest+"].");
	};

	var gotCaptainRequest = function(request) {
		
		var hostlname = request.get('fromHost').get('lastname');
		var hostfname = request.get('fromHost').get('firstname'); 
		var boatname = request.get('boat').get('name');

		var data = {
			to: request.get("email"),
			from: config.get("CAPTAIN_EMAIL_FROM"),
			subject: hostfname+" "+hostlname+" has invited you to join BoatDay",
			text: 	"Hi,\n\n"+hostfname+" "+hostlname+" has invited you to become a Captain for his boat "+boatname+".\nClick the link below to register as a Captain and begin hosting great BoatDays aboard "+boatname+".\n\nhttps://www.boatdayhosts.com\n\nThanks,\nThe BoatDay Team"
		};

		Mailgun.sendEmail(data).then(function(httpResponse) {
			response.success('Email sent');
		}, cbError);
	};

	Parse.Config.get().then(function(c) {

		config = c;

		Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
		
		var query = new Parse.Query(Parse.Object.extend('CaptainRequest'));
		query.include('boat');
		query.include('fromHost');
		query.get(captainRequest).then(gotCaptainRequest, cbError);

	});

});

Parse.Cloud.afterSave("CaptainRequest", function(request) {

	Parse.Cloud.run('sendDriverEmail', {captainRequest: request.object.id });
		
});

Parse.Cloud.afterSave("Notification", function(request) {

	var notification = request.object;

	if( notification.get('sendEmail') ) {

		var Mailgun = require('mailgun');

		Parse.Config.get().then(function(config) {
			
			var queryNotification = new Parse.Query(Parse.Object.extend('Notification'));
			queryNotification.include('to');
			queryNotification.include('to.user');
			queryNotification.get(notification.id).then(function(notification) {

				var name = notification.get('to').get('displayName');
				
				Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

				Mailgun.sendEmail({
					to: notification.get('to').get('user').get("email"),
					from: config.get("CAPTAIN_EMAIL_FROM"),
					subject: "You have a new notification",
					text: 	"Hi "+name+",\n\nYou have a new message in your BoatDay inbox, access the BoatDay Host Center - https://www.boatdayhosts.com - to read your messages.\n\nWelcome aboard,\nThe BoatDay Team"
				});

			});

		});

	}
		
});


Parse.Cloud.afterSave("Host", function(request) {

	var host = request.object;

	if( host.get('status') == 'complete' && !host.get('notificationSent') ) {

		var Notification = Parse.Object.extend('Notification');
		
		var data = {
			action: 'bd-message',
			fromTeam: true,
			message: 'Welcome to BoatDay! We are currently reviewing your Host application. In the meantime, you can register a boat and start creating BoatDays.',
			to: host.get('profile'),
			sendEmail: false
		};
		
		new Notification().save(data).then(function() {
			host.save({ notificationSent: true }).then(function() {
				console.log('Notification sent / Host updated');
			});
		});

		var Mailgun = require('mailgun');

		Parse.Config.get().then(function(config) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

			Mailgun.sendEmail({
				to: "registration@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: "New BoatDay Host",
				text: "go to the CMS motherfucker"
			});

		});
	}
		
});

Parse.Cloud.afterSave("HelpCenter", function(request) {

	var Mailgun = require('mailgun');

	var feedback = request.object;

	Parse.Config.get().then(function(config) {

		var query = new Parse.Query(Parse.User);
		query.include('profile');
		query.get(feedback.get('user').id).then(function(user) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

			Mailgun.sendEmail({
				to: "support@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: 'HelpCenter from ' + user.get('profile').get('displayName') + ' <'+user.get('email')+'> : ' + feedback.get('category'),
				text: feedback.get('feedback')
			});

		});

	});

});

Parse.Cloud.beforeSave("FileHolder", function(request, response) {
	
	var fh = request.object;

	if( !fh.get('order') ) {
		var query = new Parse.Query(Parse.Object.extend('FileHolder'));
		query.equalTo("host", fh.get('host'));
		query.descending('order');
		query.count().then(function(t) {
			if( t > 0 ) {
				query.first().then(function(_fh) {
					fh.set('order', _fh.get('order') + 1);
					response.success();
				});
			} else {
				fh.set('order', 1);
				response.success();	
			}
		});
	} else {
		response.success();	
	}

});

Parse.Cloud.afterSave("SeatRequest", function(request) {
	
	var seatRequest = request.object;
	var Notification = Parse.Object.extend('Notification');

	new Parse.Query(Parse.Object.extend('BoatDay')).get(seatRequest.get('boatday').id).then(function(boatday) {
		
		var data = {};

		if( seatRequest.get('addToBoatDay') ) {
			
			if( boatday.get('bookingPolicy') == 'automatically' && seatRequest.get('status') == 'pending' ) {
			
				data.status = 'approved';
				
				boatday.increment('bookedSeats');

				var Notification = Parse.Object.extend('Notification');
					
				new Notification().save({
					action: 'request-approved',
					fromTeam: false,
					message: null,
					to: seatRequest.get('profile'),
					from:  boatday.get('captain'),
					boatday: boatday,
					sendEmail: false,
					request: seatRequest
				});
			}

			data.addToBoatDay = false;

			boatday.relation('seatRequests').add(seatRequest);
			boatday.save().then(function() {

				new Parse.Query(Parse.Object.extend('Host')).get(boatday.get('host').id).then(function(host) {
					
					console.log({
						action: 'boatday-request',
						fromTeam: false,
						message: null,
						to: host.get('profile'),
						from: seatRequest.get('profile'),
						boatday: boatday,
						sendEmail: true,
						request: seatRequest
					});
					
					new Notification().save({
						action: 'boatday-request',
						fromTeam: false,
						message: null,
						to: host.get('profile'),
						from: seatRequest.get('profile'),
						boatday: boatday,
						sendEmail: true,
						request: seatRequest
					}).then(function() {
						console.log("######## DONE #######");
					}, function(error) { 
						console.log('ÇÇÇÇÇÇÇÇÇÇERROR#############'); console.log(error)
					});
				});

			});

			console.log(data);
			seatRequest.save(data);

		} 


	});

});

Parse.Cloud.afterSave("ChatMessage", function(request) {
	
	var message = request.object;
	var Notification = Parse.Object.extend('Notification');
	var _ = require('underscore');

	if( message.get('addToBoatDay') ) {

		message.save({ addToBoatDay: false });

		new Parse.Query(Parse.Object.extend('BoatDay')).get(message.get('boatday').id).then(function(boatday) {

			boatday.relation('chatMessages').add(message);
			boatday.save().then(function() {

				// Notify host				
				new Parse.Query(Parse.Object.extend('Host')).get(boatday.get('host').id).then(function(host) {
					if( message.get('profile').id != host.get('profile').id ) {
						console.log('** Notify Host ***');
						new Notification().save({
							action: 'boatday-message',
							fromTeam: false,
							message: null,
							to: host.get('profile'),
							from: message.get('profile'),
							boatday: boatday,
							sendEmail: false
						});
					}
					
					// Notify Captain
					if( message.get('profile').id != boatday.get('captain').id && boatday.get('captain').id != host.get('profile').id ) {
						console.log('** Notify Captain ***');
						new Notification().save({
							action: 'boatday-message',
							fromTeam: false,
							message: null,
							to: boatday.get('captain'),
							from: message.get('profile'),
							boatday: boatday,
							sendEmail: false
						});
					}
				});


				// Notify Users approved
				var query = boatday.relation('seatRequests').query();
				query.equalTo('status', 'approved');
				query.notEqualTo('profile', message.get('profile').id);
				query.find().then(function(requests) {
					_.each(requests, function(request) {
						console.log('** Notify User ***');
						new Notification().save({
							action: 'boatday-message',
							fromTeam: false,
							message: null,
							to: request.get('profile'),
							from: message.get('profile'),
							boatday: boatday,
							sendEmail: false
						});
					});
				});

			}, function(error) {
				console.log(error);
			});

		});

	}

});
