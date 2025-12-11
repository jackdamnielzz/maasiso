const axios = require('axios');

// Strapi configuratie
const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

// Uitgebreide categorieën met meer specifieke keywords
const CATEGORIES = {
  'iso-9001-kwaliteitsmanagement': {
    name: 'ISO 9001 Kwaliteitsmanagement',
    keywords: ['iso 9001', 'kwaliteitsmanagement', 'quality management', 'kwaliteitssysteem', 'pdca', 'procesverbetering', 'kwaliteitshandboek', 'directiebeoordeling', 'interne audit', 'kwaliteitsbeleid', 'continue verbetering', 'klantentevredenheid', 'procesbeheer', 'kwaliteitsdoelstellingen', 'qms', 'kwaliteitsmanagementsysteem', 'normvereisten', 'certificering iso 9001', 'clause', 'management review', 'prestatie-indicatoren', 'kpi', 'corrective actions', 'preventive actions', 'non-conformiteit', 'afwijking'],
    priority: 10
  },
  'iso-27001-informatiebeveiliging': {
    name: 'ISO 27001 Informatiebeveiliging',
    keywords: ['iso 27001', 'informatiebeveiliging', 'information security', 'cybersecurity', 'isms', 'risicoanalyse', 'beveiligingsbeleid', 'databeveiliging', 'privacy', 'security controls', 'incident management', 'toegangscontrole', 'encryptie', 'penetratietest', 'vulnerability', 'threat', 'asset management', 'security awareness', 'business continuity', 'disaster recovery', 'confidentiality', 'integrity', 'availability', 'cia triad'],
    priority: 10
  },
  'avg-gdpr-privacywetgeving': {
    name: 'AVG / GDPR Privacywetgeving',
    keywords: ['avg', 'gdpr', 'privacy', 'persoonsgegevens', 'verwerkersovereenkomst', 'dpia', 'privacyverklaring', 'toestemming', 'datalek', 'betrokkene', 'verwerkingsregister', 'bewaartermijn', 'rechtmatige grondslag', 'gegevensbescherming', 'data protection', 'consent', 'legitimate interest', 'data breach', 'privacy by design', 'privacy by default', 'verwerkingsverantwoordelijke', 'verwerker', 'grondslag', 'beeldmateriaal', 'cookies'],
    priority: 9
  },
  'iso-14001-milieu': {
    name: 'ISO 14001 Milieu',
    keywords: ['iso 14001', 'milieu', 'environmental', 'duurzaamheid', 'milieumanagement', 'co2', 'emissie', 'afvalbeheer', 'energiebesparing', 'milieuaspecten', 'milieubeleid', 'milieuprestaties', 'carbon footprint', 'sustainability', 'klimaat', 'klimaatverandering', 'circular economy', 'recycling', 'environmental impact', 'groene energie'],
    priority: 8
  },
  'iso-45001-arbomanagement': {
    name: 'ISO 45001 Arbomanagement',
    keywords: ['iso 45001', 'arbo', 'veiligheid', 'gezondheid', 'health safety', 'risico-inventarisatie', 'vgm', 'ongevallen', 'werkplekinspectie', 'arbeidsveiligheid', 'preventie', 'welzijn', 'ri&e', 'taak risico analyse', 'tra', 'veiligheidsbeleid', 'incident onderzoek', 'gevaarlijke stoffen', 'persoonlijke beschermingsmiddelen', 'pbm', 'noodplan', 'bhv'],
    priority: 8
  },
  'iso-50001-energiebeheer': {
    name: 'ISO 50001 Energiebeheer',
    keywords: ['iso 50001', 'energie', 'energiebeheer', 'energieprestatie', 'energiebesparing', 'energieverbruik', 'energie-efficiency', 'energiebeleid', 'energiedoelstellingen', 'energy management', 'enpi', 'energiemonitoring', 'baseline', 'significant energy use'],
    priority: 7
  },
  'iso-16175-informatiebeheer': {
    name: 'ISO 16175 Informatiebeheer',
    keywords: ['iso 16175', 'informatiebeheer', 'documentbeheer', 'archivering', 'records management', 'documentatie', 'informatiebeveiliging', 'digitaal archief', 'document control', 'metadata', 'retention', 'disposition', 'elektronisch archief'],
    priority: 7
  },
  'control-risk-self-assessment': {
    name: 'Control and Risk Self-Assessment (CRSA)',
    keywords: ['crsa', 'control risk', 'self assessment', 'risicobeoordeling', 'risicoanalyse', 'interne controle', 'control framework', 'risk appetite', 'risk tolerance', 'control testing', 'control design'],
    priority: 6
  },
  'algemene-kwaliteitszorg-kam': {
    name: 'Algemene Kwaliteitszorg & KAM',
    keywords: ['kam', 'kwaliteit arbo milieu', 'integrated management', 'managementsysteem', 'kwaliteitszorg', 'compliance', 'certificering', 'geïntegreerd', 'hse', 'qhse', 'she', 'ehs'],
    priority: 5
  },
  'consultancy-implementatie': {
    name: 'Consultancy & Implementatie',
    keywords: ['consultancy', 'implementatie', 'begeleiding', 'advies', 'projectmanagement', 'verandermanagement', 'training', 'workshop', 'implementatieplan', 'roadmap', 'stappenplan', 'quick scan', 'gap analyse', 'coaching', 'ondersteuning'],
    priority: 4
  },
  'wet-regelgeving': {
    name: 'Wet- & Regelgeving',
    keywords: ['wetgeving', 'regelgeving', 'compliance', 'wettelijke eisen', 'normen', 'richtlijnen', 'verordening', 'wet', 'juridisch', 'legislation', 'regulation', 'legal requirements', 'statutory'],
    priority: 3
  },
  'cases-praktijkvoorbeelden': {
    name: 'Cases & Praktijkvoorbeelden',
    keywords: ['case study', 'praktijkvoorbeeld', 'ervaring', 'succesverhaal', 'klantcase', 'voorbeeld', 'best practice', 'lessons learned', 'praktijk', 'real-world', 'implementatie voorbeeld', 'referentie'],
    priority: 2
  },
  'tools-software': {
    name: 'Tools & Software',
    keywords: ['software', 'tool', 'applicatie', 'systeem', 'platform', 'digitaal', 'automatisering', 'workflow', 'dashboard', 'saas', 'cloud', 'app', 'digitalisering'],
    priority: 1
  }
};

// Uitgebreide tag keywords met betere matching
const TAG_KEYWORDS = {
  // ISO Normen
  'iso-9001': ['iso 9001', 'iso9001', '9001:2015', 'kwaliteitsmanagement', 'quality management system', 'qms'],
  'iso-27001': ['iso 27001', 'iso27001', '27001:2022', 'informatiebeveiliging', 'information security', 'isms'],
  'iso-14001': ['iso 14001', 'iso14001', '14001:2015', 'milieu', 'environmental', 'milieumanagement'],
  'iso-45001': ['iso 45001', 'iso45001', '45001:2018', 'arbo', 'veiligheid', 'health safety', 'ohsas'],
  'iso-50001': ['iso 50001', 'iso50001', '50001:2018', 'energie', 'energiebeheer', 'energy management'],
  'iso-16175': ['iso 16175', 'iso16175', 'informatiebeheer', 'documentbeheer', 'records management'],
  
  // Privacy & Compliance
  'avg': ['avg', 'algemene verordening gegevensbescherming', 'privacywet'],
  'gdpr': ['gdpr', 'general data protection regulation', 'data protection'],
  'bio': ['bio', 'baseline informatiebeveiliging', 'overheid'],
  'nen-7510': ['nen 7510', 'nen7510', 'zorg', 'informatiebeveiliging zorg', 'medische gegevens'],
  
  // Certificering & Audit
  'certificering': ['certificering', 'certificaat', 'certificeren', 'gecertificeerd', 'certification'],
  'audit': ['audit', 'interne audit', 'externe audit', 'auditor', 'auditplan', 'auditrapport'],
  'accreditatie': ['accreditatie', 'accrediteren', 'raad voor accreditatie', 'rva'],
  
  // Management & Organisatie
  'risicomanagement': ['risico', 'risicoanalyse', 'risicobeheer', 'risk management', 'risicobeheersing'],
  'compliance': ['compliance', 'naleving', 'conformiteit', 'voldoen aan', 'compliant'],
  'kwaliteitshandboek': ['kwaliteitshandboek', 'handboek', 'quality manual', 'documentatie'],
  'procesverbetering': ['procesverbetering', 'continue verbetering', 'pdca', 'kaizen', 'lean'],
  'beleid': ['beleid', 'beleidsverklaring', 'policy', 'beleidsdocument'],
  'doelstellingen': ['doelstellingen', 'kpi', 'prestatie-indicatoren', 'objectives', 'targets'],
  'managementreview': ['managementreview', 'directiebeoordeling', 'management review', 'directieoverleg'],
  
  // Documentatie & Beheer
  'documentbeheer': ['documentbeheer', 'document control', 'versiebeheer', 'documentmanagement'],
  'procedure': ['procedure', 'werkwijze', 'proces', 'procesbeschrijving'],
  'instructie': ['instructie', 'werkinstructie', 'handleiding', 'work instruction'],
  'register': ['register', 'overzicht', 'lijst', 'registry'],
  'checklist': ['checklist', 'controlelijst', 'check list'],
  'template': ['template', 'sjabloon', 'format', 'model'],
  
  // Training & Competentie
  'training': ['training', 'opleiding', 'cursus', 'scholing', 'educatie'],
  'bewustwording': ['bewustwording', 'awareness', 'cultuur', 'bewustzijn'],
  'competentie': ['competentie', 'bekwaamheid', 'vaardigheid', 'competence'],
  
  // Specifieke onderwerpen
  'incident-management': ['incident', 'afwijking', 'non-conformiteit', 'correctieve actie'],
  'leveranciersbeoordeling': ['leverancier', 'inkoop', 'supplier', 'vendor', 'toeleverancier'],
  'klantentevredenheid': ['klantentevredenheid', 'klanttevredenheid', 'customer satisfaction', 'klantenservice'],
  'interne-communicatie': ['communicatie', 'overleg', 'rapportage', 'informatie-uitwisseling'],
  'verbetermaatregelen': ['verbetermaatregel', 'correctieve actie', 'preventieve actie', 'capa'],
  
  // Metrics & Monitoring
  'kpi': ['kpi', 'prestatie-indicator', 'meting', 'metric', 'key performance indicator'],
  'dashboard': ['dashboard', 'rapportage', 'monitoring', 'overzicht'],
  'prestatie-evaluatie': ['prestatie-evaluatie', 'beoordeling', 'evaluatie', 'performance evaluation'],
  
  // Veiligheid & Milieu
  'werkplekinspectie': ['werkplekinspectie', 'veiligheidsinspectie', 'rondje veiligheid', 'safety walk'],
  'noodplan': ['noodplan', 'calamiteit', 'emergency', 'bhv', 'evacuatie'],
  'milieuaspecten': ['milieuaspect', 'milieueffect', 'impact', 'environmental aspect'],
  'energieprestatie': ['energieprestatie', 'energieverbruik', 'energie-efficiency', 'energy performance'],
  'duurzaamheid': ['duurzaam', 'sustainability', 'mvo', 'maatschappelijk verantwoord'],
  
  // Stakeholders & Context
  'stakeholders': ['stakeholder', 'belanghebbende', 'betrokkene', 'interested party'],
  'context-organisatie': ['context', 'omgevingsanalyse', 'swot', 'context analyse'],
  'scope': ['scope', 'toepassingsgebied', 'reikwijdte', 'bereik'],
  'rollen-verantwoordelijkheden': ['rol', 'verantwoordelijkheid', 'functie', 'raci'],
  
  // Security & Privacy
  'datalek': ['datalek', 'beveiligingsincident', 'breach', 'data breach'],
  'bcm': ['bcm', 'business continuity', 'bedrijfscontinuïteit', 'continuity management'],
  'informatiebeveiliging': ['informatiebeveiliging', 'cybersecurity', 'security', 'information security'],
  'fysieke-beveiliging': ['fysieke beveiliging', 'toegangscontrole', 'physical security'],
  
  // Change & Project Management
  'change-management': ['change management', 'wijzigingsbeheer', 'verandering', 'verandermanagement'],
  'projectmanagement': ['projectmanagement', 'projectbeheer', 'planning', 'project management'],
  'implementatie': ['implementatie', 'invoering', 'uitrol', 'implementation'],
  
  // Methodieken
  'lean': ['lean', 'lean six sigma', 'procesoptimalisatie', '5s', 'waste reduction'],
  'agile': ['agile', 'scrum', 'sprint', 'iteratief'],
  'digitalisering': ['digitalisering', 'digitale transformatie', 'automatisering', 'digitization'],
  
  // Assessment & Analyse
  'gap-analyse': ['gap analyse', 'gap analysis', 'hiaat', 'kloof analyse'],
  'assessment': ['assessment', 'beoordeling', 'toetsing', 'evaluatie'],
  'benchmarking': ['benchmark', 'vergelijking', 'best practice', 'benchmarking'],
  
  // Tools & Technology
  'tooling': ['tool', 'software', 'applicatie', 'systeem'],
  'cloud': ['cloud', 'saas', 'hosting', 'cloud computing'],
  'ai': ['ai', 'artificial intelligence', 'machine learning', 'kunstmatige intelligentie'],
  
  // Contracten & Overeenkomsten
  'sla': ['sla', 'service level agreement', 'overeenkomst', 'contract'],
  'verwerkersovereenkomst': ['verwerkersovereenkomst', 'processor agreement', 'dpa'],
  
  // Overig
  'whitepaper': ['whitepaper', 'white paper', 'artikel', 'kennisartikel'],
  'case-study': ['case study', 'praktijkvoorbeeld', 'casus', 'use case'],
  'best-practice': ['best practice', 'beste werkwijze', 'good practice'],
  'lessons-learned': ['lessons learned', 'geleerde lessen', 'evaluatie'],
  'quick-scan': ['quick scan', 'scan', 'korte analyse', 'quickscan'],
  'roadmap': ['roadmap', 'stappenplan', 'planning', 'routekaart']
};

// Functie om de beste categorie te bepalen met verbeterde scoring
function determineCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  let scores = {};

  for (const [slug, category] of Object.entries(CATEGORIES)) {
    let score = 0;
    
    // Check keywords met gewogen scoring
    for (const keyword of category.keywords) {
      const keywordLower = keyword.toLowerCase();
      // Tel hoe vaak het keyword voorkomt
      const matches = (text.match(new RegExp(keywordLower, 'g')) || []).length;
      // Geef meer gewicht aan keywords in de titel
      const titleMatches = (title.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
      
      score += matches * keyword.split(' ').length; // Meer woorden = hogere score
      score += titleMatches * keyword.split(' ').length * 3; // 3x gewicht voor titel matches
    }
    
    // Pas prioriteit toe
    score = score * category.priority;
    
    scores[slug] = score;
  }

  // Sorteer op score en neem de hoogste
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  // Als de hoogste score 0 is, gebruik de default categorie
  if (sorted[0][1] === 0) {
    return 'algemene-kwaliteitszorg-kam';
  }
  
  return sorted[0][0];
}

// Functie om relevante tags te bepalen met betere matching
function determineTags(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  const tagScores = {};

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    let score = 0;
    
    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();
      // Tel voorkomens
      const matches = (text.match(new RegExp(keywordLower, 'g')) || []).length;
      const titleMatches = (title.toLowerCase().match(new RegExp(keywordLower, 'g')) || []).length;
      
      if (matches > 0) {
        score += matches;
        score += titleMatches * 2; // Dubbel gewicht voor titel
      }
    }
    
    if (score > 0) {
      tagScores[tag] = score;
    }
  }

  // Sorteer tags op score en neem de top 15
  const sortedTags = Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag]) => tag);

  return sortedTags;
}

// Rest van het script blijft hetzelfde...
async function fetchAllCategories() {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/categories?pagination[limit]=100`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const categories = {};
    response.data.data.forEach(cat => {
      categories[cat.slug] = cat.documentId;
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    return {};
  }
}

async function fetchAllTags() {
  try {
    const response = await axios.get(`${STRAPI_URL}/api/tags?pagination[limit]=200`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const tags = {};
    response.data.data.forEach(tag => {
      const slug = tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-');
      tags[slug] = tag.documentId;
    });
    
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error.response?.data || error.message);
    return {};
  }
}

async function fetchAllBlogPosts() {
  const allPosts = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await axios.get(`${STRAPI_URL}/api/blog-posts`, {
        params: {
          'pagination[page]': page,
          'pagination[pageSize]': 25,
          'populate': '*'
        },
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const posts = response.data.data;
      allPosts.push(...posts);

      const pagination = response.data.meta.pagination;
      hasMore = page < pagination.pageCount;
      page++;

      console.log(`Fetched page ${page - 1} of ${pagination.pageCount} (${posts.length} posts)`);
    } catch (error) {
      console.error('Error fetching blog posts:', error.response?.data || error.message);
      hasMore = false;
    }
  }

  return allPosts;
}

async function updateBlogPost(documentId, categoryId, tagIds) {
  try {
    const updateData = {
      data: {
        categories: [categoryId],
        tags: tagIds
      }
    };

    const response = await axios.put(
      `${STRAPI_URL}/api/blog-posts/${documentId}`,
      updateData,
      {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.error(`Error updating post ${documentId}:`, error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function categorizeBlogPosts() {
  console.log('Starting improved blog post categorization...\n');

  console.log('Fetching categories and tags from Strapi...');
  const categoryMap = await fetchAllCategories();
  const tagMap = await fetchAllTags();
  
  console.log(`Found ${Object.keys(categoryMap).length} categories`);
  console.log(`Found ${Object.keys(tagMap).length} tags\n`);

  console.log('Fetching all blog posts...');
  const posts = await fetchAllBlogPosts();
  console.log(`Found ${posts.length} blog posts to process\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const attributes = post.attributes || post;
    const title = attributes.title || 'Untitled';
    const content = attributes.content || attributes.Content || '';
    
    console.log(`\n[${i + 1}/${posts.length}] Processing: "${title}"`);

    const categorySlug = determineCategory(title, content);
    const tagSlugs = determineTags(title, content);

    const categoryId = categoryMap[categorySlug];
    const tagIds = tagSlugs.map(slug => tagMap[slug]).filter(id => id);

    console.log(`  Category: ${CATEGORIES[categorySlug]?.name || categorySlug}`);
    console.log(`  Tags (${tagIds.length}): ${tagSlugs.slice(0, 10).join(', ')}${tagSlugs.length > 10 ? '...' : ''}`);

    const documentId = post.documentId || post.id;
    const result = await updateBlogPost(documentId, categoryId, tagIds);
    
    if (result.success) {
      results.success++;
      console.log('  ✓ Updated successfully');
    } else {
      results.failed++;
      results.errors.push({
        post: title,
        error: result.error
      });
      console.log('  ✗ Failed to update');
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('IMPROVED CATEGORIZATION COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total posts processed: ${posts.length}`);
  console.log(`Successfully updated: ${results.success}`);
  console.log(`Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\nErrors:');
    results.errors.forEach(err => {
      console.log(`- ${err.post}: ${JSON.stringify(err.error)}`);
    });
  }

  console.log('\nDone!');
}

// Start het script
categorizeBlogPosts().catch(console.error); 