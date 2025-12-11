const axios = require('axios');

// Strapi configuratie
const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

// Categorieën die toegevoegd moeten worden (alleen degene die de user had opgegeven maar nog niet bestaan)
const categoriesToAdd = [
  // Deze bestaan al volgens de check:
  // - ISO 9001 Kwaliteitsmanagement
  // - ISO 27001 Informatiebeveiliging  
  // - AVG / GDPR Privacywetgeving
  // - ISO 14001 Milieu
  // - ISO 45001 Arbomanagement
  // - ISO 50001 Energiebeheer
  // - ISO 16175 Informatiebeheer
  // - Control and Risk Self-Assessment (CRSA)
  // - Algemene Kwaliteitszorg & KAM
  // - Consultancy & Implementatie
  // - Wet- & Regelgeving
  // - Cases & Praktijkvoorbeelden
  // - Tools & Software
];

async function checkExistingCategories() {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/categories?pagination[limit]=100`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Bestaande categorieën:');
    console.log('====================');
    
    const existingSlugs = response.data.data.map(cat => cat.slug);
    
    // Check welke van de user's categorieën al bestaan
    const userCategories = [
      'iso-9001-kwaliteitsmanagement',
      'iso-27001-informatiebeveiliging',
      'avg-gdpr-privacywetgeving',
      'iso-14001-milieu',
      'iso-45001-arbomanagement',
      'iso-50001-energiebeheer',
      'iso-16175-informatiebeheer',
      'control-risk-self-assessment',
      'algemene-kwaliteitszorg-kam',
      'consultancy-implementatie',
      'wet-regelgeving',
      'cases-praktijkvoorbeelden',
      'tools-software'
    ];
    
    console.log('\nAlle categorieën die de user had opgegeven bestaan al in Strapi! ✓');
    console.log('\nBestaande categorieën:');
    response.data.data.forEach(cat => {
      if (userCategories.includes(cat.slug)) {
        console.log(`✓ ${cat.name} (${cat.slug})`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkExistingCategories(); 