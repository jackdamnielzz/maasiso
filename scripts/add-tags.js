const tags = [
  { "name": "iso 9001 audit", "slug": "iso-9001-audit" },
  { "name": "iso 9001 certificering", "slug": "iso-9001-certificering" },
  { "name": "kwaliteitsmanagement systeem", "slug": "kwaliteitsmanagement-systeem" },
  { "name": "continue verbetering", "slug": "continue-verbetering" },
  { "name": "procesoptimalisatie", "slug": "procesoptimalisatie" },
  { "name": "interne audit", "slug": "interne-audit" },
  { "name": "klanttevredenheid", "slug": "klanttevredenheid" },
  { "name": "kwaliteitsbeleid", "slug": "kwaliteitsbeleid" },
  { "name": "kwaliteitsdoelstellingen", "slug": "kwaliteitsdoelstellingen" },
  { "name": "management review", "slug": "management-review" },
  { "name": "documentbeheer", "slug": "documentbeheer" },

  { "name": "iso 27001 implementatie", "slug": "iso-27001-implementatie" },
  { "name": "informatiebeveiligingsbeleid", "slug": "informatiebeveiligingsbeleid" },
  { "name": "risicobeoordeling", "slug": "risicobeoordeling" },
  { "name": "beveiligingsincident", "slug": "beveiligingsincident" },
  { "name": "toegangbeheer", "slug": "toegangbeheer" },
  { "name": "encryptie", "slug": "encryptie" },
  { "name": "audit informatiebeveiliging", "slug": "audit-informatiebeveiliging" },
  { "name": "awareness training", "slug": "awareness-training" },
  { "name": "business continuity", "slug": "business-continuity" },
  { "name": "isms", "slug": "isms" },

  { "name": "bio norm", "slug": "bio-norm" },
  { "name": "overheid beveiliging", "slug": "overheid-beveiliging" },
  { "name": "baseline informatiebeveiliging", "slug": "baseline-informatiebeveiliging" },
  { "name": "overheidsomgeving iso 27001", "slug": "overheidsomgeving-iso-27001" },
  { "name": "security baseline overheid", "slug": "security-baseline-overheid" },
  { "name": "overheid compliance", "slug": "overheid-compliance" },
  { "name": "technische maatregelen overheid", "slug": "technische-maatregelen-overheid" },
  { "name": "privacy overheid", "slug": "privacy-overheid" },
  { "name": "ketenbeveiliging", "slug": "ketenbeveiliging" },
  { "name": "audits bio", "slug": "audits-bio" },

  { "name": "avg compliancy", "slug": "avg-compliancy" },
  { "name": "gegevensbescherming", "slug": "gegevensbescherming" },
  { "name": "functionaris gegevensbescherming", "slug": "functionaris-gegevensbescherming" },
  { "name": "data protection impact assessment", "slug": "data-protection-impact-assessment" },
  { "name": "privacybeleid", "slug": "privacybeleid" },
  { "name": "verwerkersovereenkomst", "slug": "verwerkersovereenkomst" },
  { "name": "persoonsgegevens", "slug": "persoonsgegevens" },
  { "name": "privacy by design", "slug": "privacy-by-design" },
  { "name": "datalek", "slug": "datalek" },
  { "name": "rechten betrokkene", "slug": "rechten-betrokkene" },

  { "name": "milieumanagement", "slug": "milieumanagement" },
  { "name": "iso 14001 compliance", "slug": "iso-14001-compliance" },
  { "name": "duurzame ontwikkeling", "slug": "duurzame-ontwikkeling" },
  { "name": "milieudoelstellingen", "slug": "milieudoelstellingen" },
  { "name": "milieubeleid", "slug": "milieubeleid" },
  { "name": "milieu audit", "slug": "milieu-audit" },
  { "name": "co2 reductie", "slug": "co2-reductie" },
  { "name": "circulaire economie", "slug": "circulaire-economie" },
  { "name": "emissiebeheer", "slug": "emissiebeheer" },

  { "name": "iso 45001 implementatie", "slug": "iso-45001-implementatie" },
  { "name": "arbo beleid", "slug": "arbo-beleid" },
  { "name": "risico inventarisatie en evaluatie", "slug": "risico-inventarisatie-en-evaluatie" },
  { "name": "veilig werken", "slug": "veilig-werken" },
  { "name": "arbeidsongeval", "slug": "arbeidsongeval" },
  { "name": "preventiemaatregelen", "slug": "preventiemaatregelen" },
  { "name": "veilige werkplek", "slug": "veilige-werkplek" },
  { "name": "welzijn op werk", "slug": "welzijn-op-werk" },

  { "name": "energiebeheer", "slug": "energiebeheer" },
  { "name": "iso 50001 certificering", "slug": "iso-50001-certificering" },
  { "name": "energiebesparing", "slug": "energiebesparing" },
  { "name": "energieaudit", "slug": "energieaudit" },
  { "name": "energiemanagementsysteem", "slug": "energiemanagementsysteem" },
  { "name": "duurzame energie", "slug": "duurzame-energie" },
  { "name": "energiedoelstellingen", "slug": "energiedoelstellingen" },

  { "name": "iso 16175", "slug": "iso-16175" },
  { "name": "documentbeheer", "slug": "documentbeheer" },
  { "name": "archiefbeheer", "slug": "archiefbeheer" },
  { "name": "digitaal informatiebeheer", "slug": "digitaal-informatiebeheer" },
  { "name": "record management", "slug": "record-management" },
  { "name": "informatieclassificatie", "slug": "informatieclassificatie" },
  { "name": "informatiebeveiliging documentatie", "slug": "informatiebeveiliging-documentatie" },

  { "name": "control self-assessment", "slug": "control-self-assessment" },
  { "name": "risicobeoordeling", "slug": "risicobeoordeling" },
  { "name": "interne controle", "slug": "interne-controle" },
  { "name": "zelfevaluatie risico", "slug": "zelfevaluatie-risico" },
  { "name": "risicomanagementmethodiek", "slug": "risicomanagementmethodiek" },
  { "name": "crsa matrix", "slug": "crsa-matrix" },
  { "name": "compliance assessment", "slug": "compliance-assessment" },

  { "name": "kwaliteitszorg", "slug": "kwaliteitszorg" },
  { "name": "arbomanagement", "slug": "arbomanagement" },
  { "name": "milieuzorg", "slug": "milieuzorg" },
  { "name": "kam systeem", "slug": "kam-systeem" },
  { "name": "managementsysteem integratie", "slug": "managementsysteem-integratie" },
  { "name": "beleidsontwikkeling", "slug": "beleidsontwikkeling" },
  { "name": "continue verbetering", "slug": "continue-verbetering" },

  { "name": "consultancy tips", "slug": "consultancy-tips" },
  { "name": "implementatiebegeleiding", "slug": "implementatiebegeleiding" },
  { "name": "verandermanagement", "slug": "verandermanagement" },
  { "name": "business process management", "slug": "business-process-management" },
  { "name": "projectmanagement", "slug": "projectmanagement" },
  { "name": "stakeholder engagement", "slug": "stakeholder-engagement" },

  { "name": "wetgeving iso", "slug": "wetgeving-iso" },
  { "name": "regelgeving compliance", "slug": "regelgeving-compliance" },
  { "name": "normupdates", "slug": "normupdates" },
  { "name": "auditvereisten", "slug": "auditvereisten" },
  { "name": "certificeringseisen", "slug": "certificeringseisen" },

  { "name": "project case study", "slug": "project-case-study" },
  { "name": "best practices", "slug": "best-practices" },
  { "name": "lessons learned", "slug": "lessons-learned" },
  { "name": "succesverhalen", "slug": "succesverhalen" },
  { "name": "klantervaring", "slug": "klantervaring" },

  { "name": "auditsoftware", "slug": "auditsoftware" },
  { "name": "kms software", "slug": "kms-software" },
  { "name": "risicomanagement tools", "slug": "risicomanagement-tools" },
  { "name": "compliance tools", "slug": "compliance-tools" },
  { "name": "data protection tools", "slug": "data-protection-tools" },
  { "name": "software review", "slug": "software-review" }
];

// Strapi configuratie
const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

async function createTag(tag) {
  try {
    const response = await fetch(`${STRAPI_URL}/api/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        data: {
          name: tag.name,
          slug: tag.slug
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`❌ Fout bij tag "${tag.name}":`, response.status, errorData);
      return false;
    }

    const result = await response.json();
    console.log(`✅ Tag toegevoegd: "${tag.name}" (ID: ${result.data.id})`);
    return true;
  } catch (error) {
    console.error(`❌ Fout bij tag "${tag.name}":`, error.message);
    return false;
  }
}

async function addAllTags() {
  console.log(`🚀 Start met toevoegen van ${tags.length} tags...\n`);
  
  let successCount = 0;
  let errorCount = 0;

  for (const tag of tags) {
    const success = await createTag(tag);
    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
    
    // Kleine delay om de API niet te overbelasten
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n📊 Resultaat:');
  console.log(`✅ Succesvol toegevoegd: ${successCount}`);
  console.log(`❌ Fouten: ${errorCount}`);
  console.log(`📝 Totaal verwerkt: ${tags.length}`);
}

// Voer het script uit
addAllTags().catch(console.error); 