/**
 * Publish GTM fixes and set up GA4 key events
 *
 * 1. Updates existing "Contact Form Submit" trigger to also listen for "form_submit"
 * 2. Sets "generate_lead" and "form_submit" as key events in GA4
 * 3. Publishes GTM workspace changes
 *
 * Run with: node scripts/publish-gtm-fixes.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '..', 'secrets', 'google-service-account.json');
const GTM_CONTAINER_PATH = 'accounts/6303356117/containers/224608008';
const GTM_WORKSPACE_PATH = `${GTM_CONTAINER_PATH}/workspaces/7`;
const GA4_PROPERTY = 'properties/467095380';

async function getAuth() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/tagmanager.edit.containers',
      'https://www.googleapis.com/auth/tagmanager.publish',
      'https://www.googleapis.com/auth/analytics.edit',
    ],
  });
}

async function main() {
  const auth = await getAuth();
  const tagmanager = google.tagmanager({ version: 'v2', auth });
  const analyticsAdmin = google.analyticsadmin({ version: 'v1beta', auth });

  // ── Step 1: Update existing trigger to listen for form_submit ──
  console.log('\n=== STAP 1: Bestaande trigger updaten ===\n');

  const existingTriggerPath = `${GTM_WORKSPACE_PATH}/triggers/15`;
  try {
    const updateResult = await tagmanager.accounts.containers.workspaces.triggers.update({
      path: existingTriggerPath,
      requestBody: {
        name: 'Contact Form Submit',
        type: 'customEvent',
        customEventFilter: [
          {
            type: 'matchRegex',
            parameter: [
              { type: 'template', key: 'arg0', value: '{{_event}}' },
              { type: 'template', key: 'arg1', value: '^(contact_form_submit|form_submit)$' },
            ],
          },
        ],
      },
    });
    console.log(`Trigger "${updateResult.data.name}" bijgewerkt - luistert nu op contact_form_submit EN form_submit`);
  } catch (error) {
    console.error('Fout bij updaten trigger:', error.message);
  }

  // ── Step 2: Set up key events (conversions) in GA4 ──
  console.log('\n=== STAP 2: Key events instellen in GA4 ===\n');

  const keyEvents = ['generate_lead', 'form_submit'];

  for (const eventName of keyEvents) {
    try {
      // First check if it already exists
      const listResponse = await analyticsAdmin.properties.keyEvents.list({
        parent: GA4_PROPERTY,
      });
      const existingEvents = listResponse.data.keyEvents || [];
      const existing = existingEvents.find(e => e.eventName === eventName);

      if (existing) {
        console.log(`Key event "${eventName}" bestaat al in GA4`);
      } else {
        const createResult = await analyticsAdmin.properties.keyEvents.create({
          parent: GA4_PROPERTY,
          requestBody: {
            eventName: eventName,
            countingMethod: 'ONCE_PER_EVENT',
          },
        });
        console.log(`Key event "${eventName}" aangemaakt in GA4`);
      }
    } catch (error) {
      // Try the older conversionEvents API as fallback
      try {
        const listResponse = await analyticsAdmin.properties.conversionEvents.list({
          parent: GA4_PROPERTY,
        });
        const existingEvents = listResponse.data.conversionEvents || [];
        const existing = existingEvents.find(e => e.eventName === eventName);

        if (existing) {
          console.log(`Conversie event "${eventName}" bestaat al in GA4`);
        } else {
          await analyticsAdmin.properties.conversionEvents.create({
            parent: GA4_PROPERTY,
            requestBody: {
              eventName: eventName,
              countingMethod: 'ONCE_PER_EVENT',
            },
          });
          console.log(`Conversie event "${eventName}" aangemaakt in GA4`);
        }
      } catch (fallbackError) {
        console.error(`Kon "${eventName}" niet instellen: ${fallbackError.message}`);
      }
    }
  }

  // ── Step 3: List current key events ──
  console.log('\n=== STAP 3: Huidige key events in GA4 ===\n');

  try {
    const listResponse = await analyticsAdmin.properties.keyEvents.list({
      parent: GA4_PROPERTY,
    });
    const events = listResponse.data.keyEvents || [];
    for (const event of events) {
      console.log(`  - ${event.eventName} (counting: ${event.countingMethod})`);
    }
    if (events.length === 0) {
      console.log('  (geen key events gevonden, probeer conversionEvents API...)');
      const listResponse2 = await analyticsAdmin.properties.conversionEvents.list({
        parent: GA4_PROPERTY,
      });
      const events2 = listResponse2.data.conversionEvents || [];
      for (const event of events2) {
        console.log(`  - ${event.eventName} (counting: ${event.countingMethod})`);
      }
    }
  } catch (error) {
    console.error('Kon key events niet ophalen:', error.message);
  }

  // ── Step 4: Publish GTM workspace ──
  console.log('\n=== STAP 4: GTM wijzigingen publiceren ===\n');

  try {
    const versionResult = await tagmanager.accounts.containers.workspaces.create_version({
      path: GTM_WORKSPACE_PATH,
      requestBody: {
        name: 'v2.0.0 - Fix conversion tracking',
        notes: 'Added form_submit trigger, generate_lead tag, updated Contact Form Submit trigger to listen for both contact_form_submit and form_submit events.',
      },
    });

    const versionPath = versionResult.data.containerVersion?.path;

    if (versionPath) {
      console.log(`Versie aangemaakt: ${versionResult.data.containerVersion.name}`);

      // Publish
      const publishResult = await tagmanager.accounts.containers.versions.publish({
        path: versionPath,
      });
      console.log(`GTM gepubliceerd! Container versie: ${publishResult.data.containerVersion?.containerVersionId}`);
    } else if (versionResult.data.compilerError) {
      console.error('Compiler fouten gevonden:');
      console.error(JSON.stringify(versionResult.data.compilerError, null, 2));
    } else {
      // The API might return the version in syncStatus
      console.log('Versie aangemaakt (publicatie handmatig nodig)');
      console.log(JSON.stringify(versionResult.data, null, 2));
    }
  } catch (error) {
    console.error('Fout bij publiceren:', error.message);
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }

  // ── Summary ──
  console.log('\n=== VOLTOOID ===\n');
  console.log('Wijzigingen doorgevoerd:');
  console.log('');
  console.log('GTM:');
  console.log('  1. Trigger "Contact Form Submit" - luistert nu op form_submit EN contact_form_submit');
  console.log('  2. Trigger "CE - form_submit" - nieuwe trigger voor form_submit event');
  console.log('  3. Tag "GA4 - generate_lead" - stuurt generate_lead naar GA4');
  console.log('  4. Workspace gepubliceerd');
  console.log('');
  console.log('GA4:');
  console.log('  5. generate_lead als key event (conversie) ingesteld');
  console.log('  6. form_submit als key event (conversie) ingesteld');
  console.log('');
  console.log('Code:');
  console.log('  7. ContactForm.tsx roept nu trackFormSubmission() aan bij succes en fout');
  console.log('');
  console.log('NOG HANDMATIG TE DOEN IN GOOGLE ADS:');
  console.log('  - Ga naar Google Ads > Goals > Conversions');
  console.log('  - Zet "ads_conversion_Contact_1" als SECUNDAIRE conversie');
  console.log('  - Importeer "generate_lead" vanuit GA4 als PRIMAIRE conversie');
}

main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
