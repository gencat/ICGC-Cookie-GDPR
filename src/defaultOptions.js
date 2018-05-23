module.exports = {
	enabled: true,
	type: 'opt-in',
	cookie: {
		domain: 'localhost',
		expiryDays: 365
	},
	position: 'bottom',
	compliance: {
	  'info': '<div class="cc-compliance">{{dismiss}}</div>',
	  'opt-in': '<div class="cc-compliance cc-highlight">{{deny}}{{allow}}</div>',
	  'opt-out': '<div class="cc-compliance cc-highlight">{{deny}}{{dismiss}}</div>',
	},
	palette:{
	  popup: {background: "#222222"},
	  button: {background: "#00b050"}
	},
	revokable:true,
	revokeBtn: '<div class="cc-revoke {{classes}}">Revocar</div>',
	content: {
	  message: "Per tal de fer el seguiment de visites al nostre lloc web, utilitzem galetes. En cap cas emmagatzemem la vostra informació personal",
	  allow: "Acceptar",
	  dismiss: "Entiendo",
	  deny: "Decline",
	  link: "política de galetes",
	  href: 'http://www.icgc.cat/L-ICGC/Sobre-l-ICGC/Politiques/Politica-de-proteccio-de-dades-personals/Politica-de-galetes-cookies',
	},
	showLink: true,
	dismissOnScroll: false,
	law: {
		countryCode: "ES",
		regionalLaw: true
	}
};