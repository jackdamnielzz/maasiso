const axios = require('axios');

// Strapi configuratie
const STRAPI_URL = 'http://153.92.223.23:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '59bd88ea405da747f671dbfaf3af15c9058a57148e18d88fbccfd4542fa32dba1d7571df62e0a79865414487db95b12995edd81eb0c05e1e2038d40085f748781652b3ba279319cf2f437438b8cf86bc674faa38f7410921bb5b09863b967e8045c654b777ea8795f37252268ebd41ffee25d7d620fbbed0be476377ea816e2f';

// Categorieën met hun keywords voor matching
const CATEGORIES = {
  'iso-9001-kwaliteitsmanagement': {
    name: 'ISO 9001 Kwaliteitsmanagement',
    keywords: ['iso 9001', 'kwaliteitsmanagement', 'quality management', 'kwaliteitssysteem', 'pdca', 'procesverbetering', 'kwaliteitshandboek', 'directiebeoordeling', 'interne audit', 'kwaliteitsbeleid', 'continue verbetering', 'klantentevredenheid', 'procesbeheer', 'kwaliteitsdoelstellingen']
  },
  'iso-27001-informatiebeveiliging': {
    name: 'ISO 27001 Informatiebeveiliging',
    keywords: ['iso 27001', 'informatiebeveiliging', 'information security', 'cybersecurity', 'isms', 'risicoanalyse', 'beveiligingsbeleid', 'databeveiliging', 'privacy', 'security controls', 'incident management', 'toegangscontrole', 'encryptie']
  },
  'avg-gdpr-privacywetgeving': {
    name: 'AVG / GDPR Privacywetgeving',
    keywords: ['avg', 'gdpr', 'privacy', 'persoonsgegevens', 'verwerkersovereenkomst', 'dpia', 'privacyverklaring', 'toestemming', 'datalek', 'betrokkene', 'verwerkingsregister', 'bewaartermijn', 'rechtmatige grondslag']
  },
  'iso-14001-milieu': {
    name: 'ISO 14001 Milieu',
    keywords: ['iso 14001', 'milieu', 'environmental', 'duurzaamheid', 'milieumanagement', 'co2', 'emissie', 'afvalbeheer', 'energiebesparing', 'milieuaspecten', 'milieubeleid', 'milieuprestaties']
  },
  'iso-45001-arbomanagement': {
    name: 'ISO 45001 Arbomanagement',
    keywords: ['iso 45001', 'arbo', 'veiligheid', 'gezondheid', 'health safety', 'risico-inventarisatie', 'vgm', 'ongevallen', 'werkplekinspectie', 'arbeidsveiligheid', 'preventie', 'welzijn']
  },
  'iso-50001-energiebeheer': {
    name: 'ISO 50001 Energiebeheer',
    keywords: ['iso 50001', 'energie', 'energiebeheer', 'energieprestatie', 'energiebesparing', 'energieverbruik', 'energie-efficiency', 'energiebeleid', 'energiedoelstellingen']
  },
  'iso-16175-informatiebeheer': {
    name: 'ISO 16175 Informatiebeheer',
    keywords: ['iso 16175', 'informatiebeheer', 'documentbeheer', 'archivering', 'records management', 'documentatie', 'informatiebeveiliging', 'digitaal archief']
  },
  'control-risk-self-assessment': {
    name: 'Control and Risk Self-Assessment (CRSA)',
    keywords: ['crsa', 'control risk', 'self assessment', 'risicobeoordeling', 'risicoanalyse', 'interne controle', 'control framework']
  },
  'algemene-kwaliteitszorg-kam': {
    name: 'Algemene Kwaliteitszorg & KAM',
    keywords: ['kam', 'kwaliteit arbo milieu', 'integrated management', 'managementsysteem', 'kwaliteitszorg', 'compliance', 'certificering']
  },
  'consultancy-implementatie': {
    name: 'Consultancy & Implementatie',
    keywords: ['consultancy', 'implementatie', 'begeleiding', 'advies', 'projectmanagement', 'verandermanagement', 'training', 'workshop', 'implementatieplan']
  },
  'wet-regelgeving': {
    name: 'Wet- & Regelgeving',
    keywords: ['wetgeving', 'regelgeving', 'compliance', 'wettelijke eisen', 'normen', 'richtlijnen', 'verordening', 'wet', 'juridisch']
  },
  'cases-praktijkvoorbeelden': {
    name: 'Cases & Praktijkvoorbeelden',
    keywords: ['case study', 'praktijkvoorbeeld', 'ervaring', 'succesverhaal', 'klantcase', 'voorbeeld', 'best practice', 'lessons learned']
  },
  'tools-software': {
    name: 'Tools & Software',
    keywords: ['software', 'tool', 'applicatie', 'systeem', 'platform', 'digitaal', 'automatisering', 'workflow', 'dashboard']
  }
};

// Tag keywords voor matching
const TAG_KEYWORDS = {
  'iso-9001': ['iso 9001', 'kwaliteitsmanagement', 'quality management'],
  'iso-27001': ['iso 27001', 'informatiebeveiliging', 'information security'],
  'iso-14001': ['iso 14001', 'milieu', 'environmental'],
  'iso-45001': ['iso 45001', 'arbo', 'veiligheid', 'health safety'],
  'iso-50001': ['iso 50001', 'energie', 'energiebeheer'],
  'iso-16175': ['iso 16175', 'informatiebeheer', 'documentbeheer'],
  'avg': ['avg', 'gdpr', 'privacy', 'persoonsgegevens'],
  'gdpr': ['gdpr', 'avg', 'privacy', 'data protection'],
  'bio': ['bio', 'baseline informatiebeveiliging'],
  'nen-7510': ['nen 7510', 'zorg', 'informatiebeveiliging zorg'],
  'certificering': ['certificering', 'certificaat', 'audit'],
  'audit': ['audit', 'interne audit', 'externe audit'],
  'risicomanagement': ['risico', 'risicoanalyse', 'risicobeheer'],
  'compliance': ['compliance', 'naleving', 'conformiteit'],
  'kwaliteitshandboek': ['kwaliteitshandboek', 'handboek', 'documentatie'],
  'procesverbetering': ['procesverbetering', 'continue verbetering', 'pdca'],
  'beleid': ['beleid', 'beleidsverklaring', 'policy'],
  'doelstellingen': ['doelstellingen', 'kpi', 'prestatie-indicatoren'],
  'managementreview': ['managementreview', 'directiebeoordeling', 'management review'],
  'documentbeheer': ['documentbeheer', 'document control', 'versiebeheer'],
  'training': ['training', 'opleiding', 'bewustwording'],
  'incident-management': ['incident', 'afwijking', 'non-conformiteit'],
  'leveranciersbeoordeling': ['leverancier', 'inkoop', 'supplier'],
  'klantentevredenheid': ['klantentevredenheid', 'klanttevredenheid', 'customer satisfaction'],
  'interne-communicatie': ['communicatie', 'overleg', 'rapportage'],
  'verbetermaatregelen': ['verbetermaatregel', 'correctieve actie', 'preventieve actie'],
  'kpi': ['kpi', 'prestatie-indicator', 'meting'],
  'dashboard': ['dashboard', 'rapportage', 'monitoring'],
  'werkplekinspectie': ['werkplekinspectie', 'veiligheidsinspectie', 'rondje veiligheid'],
  'noodplan': ['noodplan', 'calamiteit', 'emergency'],
  'milieuaspecten': ['milieuaspect', 'milieueffect', 'impact'],
  'energieprestatie': ['energieprestatie', 'energieverbruik', 'energie-efficiency'],
  'duurzaamheid': ['duurzaam', 'sustainability', 'mvo'],
  'stakeholders': ['stakeholder', 'belanghebbende', 'betrokkene'],
  'context-organisatie': ['context', 'omgevingsanalyse', 'swot'],
  'scope': ['scope', 'toepassingsgebied', 'reikwijdte'],
  'rollen-verantwoordelijkheden': ['rol', 'verantwoordelijkheid', 'functie'],
  'bewustwording': ['bewustwording', 'awareness', 'cultuur'],
  'competentie': ['competentie', 'bekwaamheid', 'vaardigheid'],
  'prestatie-evaluatie': ['prestatie-evaluatie', 'beoordeling', 'evaluatie'],
  'datalek': ['datalek', 'beveiligingsincident', 'breach'],
  'bcm': ['bcm', 'business continuity', 'bedrijfscontinuïteit'],
  'change-management': ['change management', 'wijzigingsbeheer', 'verandering'],
  'projectmanagement': ['projectmanagement', 'projectbeheer', 'planning'],
  'lean': ['lean', 'lean six sigma', 'procesoptimalisatie'],
  'digitalisering': ['digitalisering', 'digitale transformatie', 'automatisering'],
  'integratie': ['integratie', 'geïntegreerd', 'integrated'],
  'benchmarking': ['benchmark', 'vergelijking', 'best practice'],
  'innovatie': ['innovatie', 'vernieuwing', 'ontwikkeling'],
  'crisismanagement': ['crisis', 'crisismanagement', 'calamiteit'],
  'informatiebeveiliging': ['informatiebeveiliging', 'cybersecurity', 'security'],
  'fysieke-beveiliging': ['fysieke beveiliging', 'toegangscontrole', 'physical security'],
  'business-case': ['business case', 'roi', 'kosten-baten'],
  'gap-analyse': ['gap analyse', 'gap analysis', 'hiaat'],
  'tooling': ['tool', 'software', 'applicatie'],
  'cloud': ['cloud', 'saas', 'hosting'],
  'remote-audit': ['remote audit', 'online audit', 'digitale audit'],
  'supply-chain': ['supply chain', 'keten', 'toeleverancier'],
  'outsourcing': ['outsourcing', 'uitbesteding', 'externe partij'],
  'sla': ['sla', 'service level agreement', 'overeenkomst'],
  'kri': ['kri', 'key risk indicator', 'risico-indicator'],
  'maturity': ['maturity', 'volwassenheid', 'maturity model'],
  'framework': ['framework', 'raamwerk', 'model'],
  'standaard': ['standaard', 'norm', 'standard'],
  'whitepaper': ['whitepaper', 'white paper', 'artikel'],
  'checklist': ['checklist', 'controlelijst', 'lijst'],
  'template': ['template', 'sjabloon', 'format'],
  'procedure': ['procedure', 'werkwijze', 'proces'],
  'instructie': ['instructie', 'werkinstructie', 'handleiding'],
  'register': ['register', 'overzicht', 'lijst'],
  'matrix': ['matrix', 'tabel', 'overzicht'],
  'rapportage': ['rapportage', 'rapport', 'verslag'],
  'analyse': ['analyse', 'onderzoek', 'evaluatie'],
  'assessment': ['assessment', 'beoordeling', 'toetsing'],
  'certificaat': ['certificaat', 'certificate', 'bewijs'],
  'accreditatie': ['accreditatie', 'erkenning', 'accreditation'],
  'norm-update': ['norm update', 'nieuwe versie', 'wijziging norm'],
  'transitie': ['transitie', 'overgang', 'migratie'],
  'implementatie': ['implementatie', 'invoering', 'uitrol'],
  'onderhoud': ['onderhoud', 'maintenance', 'beheer'],
  'monitoring': ['monitoring', 'bewaking', 'toezicht'],
  'review': ['review', 'beoordeling', 'evaluatie'],
  'verbetering': ['verbetering', 'improvement', 'optimalisatie'],
  'efficiëntie': ['efficiëntie', 'efficiency', 'effectiviteit'],
  'transparantie': ['transparantie', 'openheid', 'transparency'],
  'verantwoording': ['verantwoording', 'accountability', 'rekenschap'],
  'governance': ['governance', 'bestuur', 'toezicht'],
  'ethiek': ['ethiek', 'integriteit', 'ethics'],
  'cultuur': ['cultuur', 'organisatiecultuur', 'culture'],
  'leiderschap': ['leiderschap', 'leadership', 'management'],
  'betrokkenheid': ['betrokkenheid', 'engagement', 'commitment'],
  'samenwerking': ['samenwerking', 'collaboration', 'teamwork'],
  'kennis': ['kennis', 'kennismanagement', 'knowledge'],
  'ervaring': ['ervaring', 'experience', 'praktijk'],
  'opleiding': ['opleiding', 'training', 'cursus'],
  'workshop': ['workshop', 'sessie', 'bijeenkomst'],
  'advies': ['advies', 'consultancy', 'begeleiding'],
  'ondersteuning': ['ondersteuning', 'support', 'hulp'],
  'begeleiding': ['begeleiding', 'coaching', 'mentoring'],
  'quick-scan': ['quick scan', 'scan', 'korte analyse'],
  'roadmap': ['roadmap', 'stappenplan', 'planning'],
  'milestone': ['milestone', 'mijlpaal', 'resultaat'],
  'deliverable': ['deliverable', 'oplevering', 'product'],
  'scope-creep': ['scope creep', 'scopevergroting', 'uitbreiding'],
  'lessons-learned': ['lessons learned', 'geleerde lessen', 'evaluatie'],
  'best-practice': ['best practice', 'beste werkwijze', 'good practice'],
  'case-study': ['case study', 'praktijkvoorbeeld', 'casus'],
  'referentie': ['referentie', 'reference', 'verwijzing'],
  'testimonial': ['testimonial', 'aanbeveling', 'getuigenis'],
  'roi': ['roi', 'return on investment', 'rendement'],
  'tco': ['tco', 'total cost of ownership', 'totale kosten'],
  'budget': ['budget', 'begroting', 'kosten'],
  'investering': ['investering', 'investment', 'uitgave'],
  'besparing': ['besparing', 'kostenbesparing', 'saving'],
  'waarde': ['waarde', 'value', 'meerwaarde'],
  'voordeel': ['voordeel', 'benefit', 'pluspunt'],
  'risico': ['risico', 'risk', 'gevaar'],
  'kans': ['kans', 'opportunity', 'mogelijkheid'],
  'bedreiging': ['bedreiging', 'threat', 'gevaar'],
  'zwakte': ['zwakte', 'weakness', 'verbeterpunt'],
  'sterkte': ['sterkte', 'strength', 'kracht'],
  'strategie': ['strategie', 'strategy', 'aanpak'],
  'tactiek': ['tactiek', 'tactics', 'werkwijze'],
  'operationeel': ['operationeel', 'operational', 'uitvoerend'],
  'strategisch': ['strategisch', 'strategic', 'lange termijn'],
  'tactisch': ['tactisch', 'tactical', 'middellange termijn']
};

// Functie om de beste categorie te bepalen
function determineCategory(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  for (const [slug, category] of Object.entries(CATEGORIES)) {
    let score = 0;
    
    // Check keywords
    for (const keyword of category.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // Meer woorden = hogere score
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = slug;
    }
  }

  // Default naar algemene categorie als geen match
  return bestMatch || 'algemene-kwaliteitszorg-kam';
}

// Functie om relevante tags te bepalen
function determineTags(title, content) {
  const text = `${title} ${content}`.toLowerCase();
  const matchedTags = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchedTags.push(tag);
        break; // Voorkom dubbele tags
      }
    }
  }

  // Beperk tot maximaal 10 meest relevante tags
  return matchedTags.slice(0, 10);
}

// Functie om alle categorieën op te halen
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
      // Gebruik documentId in plaats van id
      categories[cat.slug] = cat.documentId;
    });
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    return {};
  }
}

// Functie om alle tags op te halen
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
      // Maak slug van de naam als deze niet bestaat
      const slug = tag.slug || tag.name.toLowerCase().replace(/\s+/g, '-');
      // Gebruik documentId in plaats van id
      tags[slug] = tag.documentId;
    });
    
    return tags;
  } catch (error) {
    console.error('Error fetching tags:', error.response?.data || error.message);
    return {};
  }
}

// Functie om alle blog posts op te halen
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

// Functie om een blog post te updaten
async function updateBlogPost(documentId, categoryId, tagIds) {
  try {
    const updateData = {
      data: {
        categories: [categoryId], // Enkele categorie
        tags: tagIds // Meerdere tags
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

// Hoofdfunctie
async function categorizeBlogPosts() {
  console.log('Starting blog post categorization...\n');

  // Haal alle categorieën en tags op
  console.log('Fetching categories and tags from Strapi...');
  const categoryMap = await fetchAllCategories();
  const tagMap = await fetchAllTags();
  
  console.log(`Found ${Object.keys(categoryMap).length} categories`);
  console.log(`Found ${Object.keys(tagMap).length} tags\n`);

  // Haal alle blog posts op
  console.log('Fetching all blog posts...');
  const posts = await fetchAllBlogPosts();
  console.log(`Found ${posts.length} blog posts to process\n`);

  const results = {
    success: 0,
    failed: 0,
    errors: []
  };

  // Verwerk elke post
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const attributes = post.attributes || post;
    const title = attributes.title || 'Untitled';
    const content = attributes.content || attributes.Content || '';
    
    console.log(`\n[${i + 1}/${posts.length}] Processing: "${title}"`);

    // Bepaal categorie en tags
    const categorySlug = determineCategory(title, content);
    const tagSlugs = determineTags(title, content);

    const categoryId = categoryMap[categorySlug];
    const tagIds = tagSlugs.map(slug => tagMap[slug]).filter(id => id);

    console.log(`  Category: ${CATEGORIES[categorySlug]?.name || categorySlug}`);
    console.log(`  Tags: ${tagSlugs.join(', ') || 'none'}`);

    // Update de post
    const documentId = post.documentId || post.id;
    const result = await updateBlogPost(documentId, categoryId, tagIds);
    
    if (result.success) {
      results.success++;
      console.log('  ✓ Updated successfully');
    } else {
      results.failed++;
      results.errors.push({
        post: attributes.title,
        error: result.error
      });
      console.log('  ✗ Failed to update');
    }

    // Kleine delay om de API niet te overbelasten
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Rapport
  console.log('\n' + '='.repeat(50));
  console.log('CATEGORIZATION COMPLETE');
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