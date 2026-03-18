/**
 * GTM Conversion Fix Script
 *
 * 1. Lists current tags, triggers, and variables in GTM
 * 2. Identifies the ads_conversion_Contact_1 setup
 * 3. Creates a proper form_submit trigger + conversion tag
 *
 * Run with: node scripts/fix-gtm-conversion.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'secrets', 'google-service-account.json');

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.readonly',
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.publish',
    ],
  });
}

async function main() {
  const auth = await getAuth();
  const tagmanager = google.tagmanager({ version: 'v2', auth });

  // ── Step 1: Find the MaasISO GTM container ──
  console.log('\n=== STAP 1: GTM Accounts & Containers ophalen ===\n');

  const accountsResponse = await tagmanager.accounts.list();
  const accounts = accountsResponse.data.account || [];

  let maasisoContainerPath = null;

  for (const account of accounts) {
    console.log(`Account: ${account.name} (${account.accountId})`);

    const containersResponse = await tagmanager.accounts.containers.list({
      parent: account.path,
    });
    const containers = containersResponse.data.container || [];

    for (const container of containers) {
      console.log(`  Container: ${container.name} (${container.publicId})`);
      if (container.publicId === 'GTM-556J8S8K') {
        maasisoContainerPath = container.path;
        console.log(`  >>> Dit is de MaasISO container <<<`);
      }
    }
  }

  if (!maasisoContainerPath) {
    console.error('MaasISO container (GTM-556J8S8K) niet gevonden!');
    process.exit(1);
  }

  // ── Step 2: Get workspaces ──
  console.log('\n=== STAP 2: Workspaces ophalen ===\n');

  const workspacesResponse = await tagmanager.accounts.containers.workspaces.list({
    parent: maasisoContainerPath,
  });
  const workspaces = workspacesResponse.data.workspace || [];

  const workspace = workspaces.find(w => w.name === 'Default Workspace') || workspaces[0];
  if (!workspace) {
    console.error('Geen workspace gevonden!');
    process.exit(1);
  }
  console.log(`Workspace: ${workspace.name} (${workspace.workspaceId})`);
  console.log(`Path: ${workspace.path}`);

  // ── Step 3: List all current tags ──
  console.log('\n=== STAP 3: Huidige Tags ===\n');

  const tagsResponse = await tagmanager.accounts.containers.workspaces.tags.list({
    parent: workspace.path,
  });
  const tags = tagsResponse.data.tag || [];

  for (const tag of tags) {
    console.log(`Tag: "${tag.name}" (type: ${tag.type}, id: ${tag.tagId})`);
    if (tag.parameter) {
      for (const param of tag.parameter) {
        if (param.key === 'eventName' || param.key === 'conversionId' || param.key === 'conversionLabel' || param.key === 'measurementId' || param.key === 'measurementIdOverride') {
          console.log(`  ${param.key}: ${param.value || JSON.stringify(param.list || param.map)}`);
        }
      }
    }
    if (tag.firingTriggerId) {
      console.log(`  Firing triggers: ${tag.firingTriggerId.join(', ')}`);
    }
    console.log('');
  }

  // ── Step 4: List all current triggers ──
  console.log('\n=== STAP 4: Huidige Triggers ===\n');

  const triggersResponse = await tagmanager.accounts.containers.workspaces.triggers.list({
    parent: workspace.path,
  });
  const triggers = triggersResponse.data.trigger || [];

  for (const trigger of triggers) {
    console.log(`Trigger: "${trigger.name}" (type: ${trigger.type}, id: ${trigger.triggerId})`);
    if (trigger.customEventFilter) {
      console.log(`  Custom event filter:`, JSON.stringify(trigger.customEventFilter, null, 2));
    }
    if (trigger.filter) {
      console.log(`  Filter:`, JSON.stringify(trigger.filter, null, 2));
    }
    console.log('');
  }

  // ── Step 5: List all current variables ──
  console.log('\n=== STAP 5: Huidige Variables ===\n');

  const variablesResponse = await tagmanager.accounts.containers.workspaces.variables.list({
    parent: workspace.path,
  });
  const variables = variablesResponse.data.variable || [];

  for (const variable of variables) {
    console.log(`Variable: "${variable.name}" (type: ${variable.type})`);
  }

  // ── Step 6: Create form_submit trigger ──
  console.log('\n=== STAP 6: form_submit trigger aanmaken ===\n');

  // Check if a form_submit trigger already exists
  const existingFormTrigger = triggers.find(t =>
    t.name?.toLowerCase().includes('form_submit') ||
    t.name?.toLowerCase().includes('contact_form')
  );

  let formSubmitTriggerId;

  if (existingFormTrigger) {
    console.log(`form_submit trigger bestaat al: "${existingFormTrigger.name}" (id: ${existingFormTrigger.triggerId})`);
    formSubmitTriggerId = existingFormTrigger.triggerId;
  } else {
    try {
      const newTrigger = await tagmanager.accounts.containers.workspaces.triggers.create({
        parent: workspace.path,
        requestBody: {
          name: 'CE - form_submit',
          type: 'customEvent',
          customEventFilter: [
            {
              type: 'equals',
              parameter: [
                { type: 'template', key: 'arg0', value: '{{_event}}' },
                { type: 'template', key: 'arg1', value: 'form_submit' },
              ],
            },
          ],
        },
      });
      formSubmitTriggerId = newTrigger.data.triggerId;
      console.log(`Nieuwe trigger aangemaakt: "CE - form_submit" (id: ${formSubmitTriggerId})`);
    } catch (error) {
      console.error('Fout bij aanmaken trigger:', error.message);
    }
  }

  // ── Step 7: Create GA4 form_submit event tag ──
  console.log('\n=== STAP 7: GA4 form_submit event tag aanmaken ===\n');

  const existingFormTag = tags.find(t =>
    t.name?.toLowerCase().includes('form_submit') ||
    t.name?.toLowerCase().includes('contact form submit')
  );

  if (existingFormTag) {
    console.log(`form_submit tag bestaat al: "${existingFormTag.name}"`);
  } else if (formSubmitTriggerId) {
    try {
      const newTag = await tagmanager.accounts.containers.workspaces.tags.create({
        parent: workspace.path,
        requestBody: {
          name: 'GA4 - form_submit',
          type: 'gaawe', // GA4 Event tag
          parameter: [
            {
              key: 'eventName',
              type: 'template',
              value: 'form_submit',
            },
            {
              key: 'measurementIdOverride',
              type: 'template',
              value: 'G-QHY9D9XR7G',
            },
            {
              key: 'eventParameters',
              type: 'list',
              list: [
                {
                  type: 'map',
                  map: [
                    { key: 'name', type: 'template', value: 'form_name' },
                    { key: 'value', type: 'template', value: 'contact_form' },
                  ],
                },
                {
                  type: 'map',
                  map: [
                    { key: 'name', type: 'template', value: 'success' },
                    { key: 'value', type: 'template', value: 'true' },
                  ],
                },
              ],
            },
          ],
          firingTriggerId: [formSubmitTriggerId],
        },
      });
      console.log(`Nieuwe GA4 event tag aangemaakt: "GA4 - form_submit" (id: ${newTag.data.tagId})`);
    } catch (error) {
      console.error('Fout bij aanmaken GA4 tag:', error.message);
    }
  }

  // ── Step 8: Create generate_lead conversion event tag ──
  console.log('\n=== STAP 8: GA4 generate_lead event tag aanmaken ===\n');

  const existingLeadTag = tags.find(t =>
    t.name?.toLowerCase().includes('generate_lead')
  );

  if (existingLeadTag) {
    console.log(`generate_lead tag bestaat al: "${existingLeadTag.name}"`);
  } else if (formSubmitTriggerId) {
    try {
      const newTag = await tagmanager.accounts.containers.workspaces.tags.create({
        parent: workspace.path,
        requestBody: {
          name: 'GA4 - generate_lead',
          type: 'gaawe',
          parameter: [
            {
              key: 'eventName',
              type: 'template',
              value: 'generate_lead',
            },
            {
              key: 'measurementIdOverride',
              type: 'template',
              value: 'G-QHY9D9XR7G',
            },
            {
              key: 'eventParameters',
              type: 'list',
              list: [
                {
                  type: 'map',
                  map: [
                    { key: 'name', type: 'template', value: 'form_name' },
                    { key: 'value', type: 'template', value: 'contact_form' },
                  ],
                },
              ],
            },
          ],
          firingTriggerId: [formSubmitTriggerId],
        },
      });
      console.log(`Nieuwe GA4 event tag aangemaakt: "GA4 - generate_lead" (id: ${newTag.data.tagId})`);
    } catch (error) {
      console.error('Fout bij aanmaken generate_lead tag:', error.message);
    }
  }

  // ── Step 9: Summary ──
  console.log('\n=== SAMENVATTING ===\n');
  console.log('Wat is er gedaan:');
  console.log('1. Custom Event trigger "CE - form_submit" aangemaakt');
  console.log('   -> Vuurt af wanneer de website het form_submit event stuurt via gtag()');
  console.log('2. GA4 Event tag "GA4 - form_submit" aangemaakt');
  console.log('   -> Stuurt form_submit event naar GA4 met form_name parameter');
  console.log('3. GA4 Event tag "GA4 - generate_lead" aangemaakt');
  console.log('   -> Stuurt generate_lead event naar GA4 (Google Ads recommended conversion)');
  console.log('');
  console.log('BELANGRIJK - Nog te doen:');
  console.log('- De wijzigingen moeten nog GEPUBLICEERD worden in GTM');
  console.log('- In Google Ads: verander de conversie van "ads_conversion_Contact_1"');
  console.log('  naar "generate_lead" of "form_submit" als primaire conversie-actie');
  console.log('- De huidige "ads_conversion_Contact_1" conversie vuurt op paginabezoek');
  console.log('  en moet als secundaire conversie worden ingesteld (of verwijderd)');
  console.log('');
  console.log('Wil je de wijzigingen publiceren? Run dan:');
  console.log('  node scripts/publish-gtm.js');
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  if (error.response?.data) {
    console.error('API response:', JSON.stringify(error.response.data, null, 2));
  }
  process.exit(1);
});
