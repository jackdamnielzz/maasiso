# 🔧 API Capabilities - Gedetailleerd Overzicht

Dit document beschrijft in detail wat we kunnen doen met de Google APIs.

---

## Google Tag Manager API v2

### Accounts

```javascript
// Lijst alle accounts waartoe we toegang hebben
tagmanager.accounts.list()

// Haal specifiek account op
tagmanager.accounts.get({ path: 'accounts/6303356117' })
```

**MaasISO Account:**
- Path: `accounts/6303356117`
- Naam: MaasISO

---

### Containers

```javascript
// Lijst containers in account
tagmanager.accounts.containers.list({ parent: 'accounts/6303356117' })

// Haal specifieke container op
tagmanager.accounts.containers.get({ 
  path: 'accounts/6303356117/containers/224608008' 
})

// Maak nieuwe container (indien nodig)
tagmanager.accounts.containers.create({
  parent: 'accounts/6303356117',
  requestBody: {
    name: 'Nieuwe Container',
    usageContext: ['web']
  }
})
```

**MaasISO Container:**
- Path: `accounts/6303356117/containers/224608008`
- Public ID: GTM-556J8S8K
- Naam: www.maasiso.nl

---

### Workspaces

Workspaces zijn waar je wijzigingen maakt voordat je publiceert.

```javascript
// Lijst workspaces
tagmanager.accounts.containers.workspaces.list({
  parent: 'accounts/6303356117/containers/224608008'
})

// Maak nieuwe workspace
tagmanager.accounts.containers.workspaces.create({
  parent: 'accounts/6303356117/containers/224608008',
  requestBody: {
    name: 'Mijn Workspace',
    description: 'Workspace voor nieuwe features'
  }
})

// Sync workspace met live versie
tagmanager.accounts.containers.workspaces.sync({
  path: 'accounts/6303356117/containers/224608008/workspaces/123'
})
```

---

### Tags

#### Lezen

```javascript
// Lijst alle tags in workspace
tagmanager.accounts.containers.workspaces.tags.list({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2'
})

// Haal specifieke tag op
tagmanager.accounts.containers.workspaces.tags.get({
  path: 'accounts/6303356117/containers/224608008/workspaces/2/tags/123'
})
```

#### Aanmaken

```javascript
// GA4 Event Tag aanmaken
tagmanager.accounts.containers.workspaces.tags.create({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2',
  requestBody: {
    name: 'GA4 - Contact Form Submit',
    type: 'gaawe', // GA4 Event
    parameter: [
      {
        key: 'eventName',
        type: 'template',
        value: 'form_submit'
      },
      {
        key: 'measurementIdOverride',
        type: 'template',
        value: 'G-QHY9D9XR7G'
      },
      {
        key: 'eventParameters',
        type: 'list',
        list: [
          {
            type: 'map',
            map: [
              { key: 'name', type: 'template', value: 'form_name' },
              { key: 'value', type: 'template', value: '{{Form Name}}' }
            ]
          }
        ]
      }
    ],
    firingTriggerId: ['123'] // Trigger ID
  }
})
```

#### Bewerken

```javascript
// Tag bewerken
tagmanager.accounts.containers.workspaces.tags.update({
  path: 'accounts/6303356117/containers/224608008/workspaces/2/tags/123',
  requestBody: {
    name: 'GA4 - Contact Form Submit (Updated)',
    // ... andere properties
  }
})
```

#### Verwijderen

```javascript
// Tag verwijderen
tagmanager.accounts.containers.workspaces.tags.delete({
  path: 'accounts/6303356117/containers/224608008/workspaces/2/tags/123'
})
```

---

### Triggers

#### Lezen

```javascript
// Lijst alle triggers
tagmanager.accounts.containers.workspaces.triggers.list({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2'
})
```

#### Aanmaken

```javascript
// Page View trigger
tagmanager.accounts.containers.workspaces.triggers.create({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2',
  requestBody: {
    name: 'All Pages',
    type: 'pageview'
  }
})

// Custom Event trigger
tagmanager.accounts.containers.workspaces.triggers.create({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2',
  requestBody: {
    name: 'Contact Form Submit',
    type: 'customEvent',
    customEventFilter: [
      {
        type: 'equals',
        parameter: [
          { type: 'template', key: 'arg0', value: '{{_event}}' },
          { type: 'template', key: 'arg1', value: 'contact_form_submit' }
        ]
      }
    ]
  }
})

// Click trigger
tagmanager.accounts.containers.workspaces.triggers.create({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2',
  requestBody: {
    name: 'Download Button Click',
    type: 'linkClick',
    filter: [
      {
        type: 'contains',
        parameter: [
          { type: 'template', key: 'arg0', value: '{{Click URL}}' },
          { type: 'template', key: 'arg1', value: '.pdf' }
        ]
      }
    ],
    waitForTags: { value: 'true' },
    checkValidation: { value: 'true' }
  }
})
```

---

### Variables

#### Built-in Variables

```javascript
// Enable built-in variables
tagmanager.accounts.containers.workspaces.built_in_variables.create({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2',
  type: ['pageUrl', 'pageHostname', 'pagePath', 'clickElement', 'clickUrl']
})
```

#### Custom Variables

```javascript
// Data Layer Variable
tagmanager.accounts.containers.workspaces.variables.create({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2',
  requestBody: {
    name: 'DLV - User ID',
    type: 'v', // Data Layer Variable
    parameter: [
      { key: 'name', type: 'template', value: 'userId' },
      { key: 'dataLayerVersion', type: 'integer', value: '2' }
    ]
  }
})

// Constant Variable
tagmanager.accounts.containers.workspaces.variables.create({
  parent: 'accounts/6303356117/containers/224608008/workspaces/2',
  requestBody: {
    name: 'GA4 Measurement ID',
    type: 'c', // Constant
    parameter: [
      { key: 'value', type: 'template', value: 'G-QHY9D9XR7G' }
    ]
  }
})
```

---

### Versies Publiceren

```javascript
// Maak versie en publiceer
tagmanager.accounts.containers.workspaces.create_version({
  path: 'accounts/6303356117/containers/224608008/workspaces/2',
  requestBody: {
    name: 'v1.2.0 - Added contact form tracking',
    notes: 'Added GA4 event tag for contact form submissions'
  }
})

// Publiceer bestaande versie
tagmanager.accounts.containers.versions.publish({
  path: 'accounts/6303356117/containers/224608008/versions/5'
})

// Versie terugdraaien (set as latest)
tagmanager.accounts.containers.versions.set_latest({
  path: 'accounts/6303356117/containers/224608008/versions/4'
})
```

---

## Google Analytics Admin API v1beta

### Accounts

```javascript
// Lijst alle accounts
analyticsAdmin.accounts.list()
```

**MaasISO Account:**
- Name: `accounts/336392538`
- Display Name: MaasISO

---

### Properties

```javascript
// Lijst properties in account
analyticsAdmin.properties.list({
  filter: 'parent:accounts/336392538'
})

// Haal property details op
analyticsAdmin.properties.get({
  name: 'properties/467095380'
})

// Update property
analyticsAdmin.properties.patch({
  name: 'properties/467095380',
  updateMask: 'displayName,industryCategory',
  requestBody: {
    displayName: 'MaasISO Website',
    industryCategory: 'BUSINESS_AND_INDUSTRIAL_MARKETS'
  }
})
```

**MaasISO Property:**
- Name: `properties/467095380`
- Display Name: MaasISO
- Measurement ID: G-QHY9D9XR7G

---

### Data Streams

```javascript
// Lijst data streams
analyticsAdmin.properties.dataStreams.list({
  parent: 'properties/467095380'
})

// Update web stream
analyticsAdmin.properties.dataStreams.patch({
  name: 'properties/467095380/dataStreams/123',
  updateMask: 'displayName',
  requestBody: {
    displayName: 'MaasISO Production'
  }
})
```

---

### Conversies

```javascript
// Lijst conversies
analyticsAdmin.properties.conversionEvents.list({
  parent: 'properties/467095380'
})

// Maak conversie aan
analyticsAdmin.properties.conversionEvents.create({
  parent: 'properties/467095380',
  requestBody: {
    eventName: 'contact_form_submit',
    countingMethod: 'ONCE_PER_EVENT'
  }
})
```

---

### Custom Dimensions

```javascript
// Lijst custom dimensions
analyticsAdmin.properties.customDimensions.list({
  parent: 'properties/467095380'
})

// Maak custom dimension
analyticsAdmin.properties.customDimensions.create({
  parent: 'properties/467095380',
  requestBody: {
    parameterName: 'user_type',
    displayName: 'User Type',
    description: 'Type of user (visitor, lead, customer)',
    scope: 'USER'
  }
})
```

---

### Custom Metrics

```javascript
// Maak custom metric
analyticsAdmin.properties.customMetrics.create({
  parent: 'properties/467095380',
  requestBody: {
    parameterName: 'engagement_score',
    displayName: 'Engagement Score',
    description: 'Custom engagement score based on interactions',
    measurementUnit: 'STANDARD',
    scope: 'EVENT'
  }
})
```

---

### Audiences

```javascript
// Lijst audiences
analyticsAdmin.properties.audiences.list({
  parent: 'properties/467095380'
})

// Maak audience
analyticsAdmin.properties.audiences.create({
  parent: 'properties/467095380',
  requestBody: {
    displayName: 'Engaged Users',
    description: 'Users who spent more than 2 minutes on site',
    membershipDurationDays: 30,
    filterClauses: [
      {
        clauseType: 'INCLUDE',
        simpleFilter: {
          scope: 'AUDIENCE_FILTER_SCOPE_WITHIN_SAME_SESSION',
          filterExpression: {
            andGroup: {
              filterExpressions: [
                {
                  orGroup: {
                    filterExpressions: [
                      {
                        dimensionOrMetricFilter: {
                          fieldName: 'engagementTimeMsec',
                          numericFilter: {
                            operation: 'GREATER_THAN',
                            value: { int64Value: '120000' }
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
})
```

---

## Google Analytics Data API v1beta

### Rapportages Opvragen

```javascript
const analyticsData = google.analyticsdata({ version: 'v1beta', auth });

// Basis rapport
analyticsData.properties.runReport({
  property: 'properties/467095380',
  requestBody: {
    dateRanges: [
      { startDate: '7daysAgo', endDate: 'today' }
    ],
    dimensions: [
      { name: 'pagePath' }
    ],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'engagementRate' }
    ],
    orderBys: [
      { metric: { metricName: 'screenPageViews' }, desc: true }
    ],
    limit: 10
  }
})
```

### Real-time Data

```javascript
analyticsData.properties.runRealtimeReport({
  property: 'properties/467095380',
  requestBody: {
    dimensions: [
      { name: 'unifiedScreenName' }
    ],
    metrics: [
      { name: 'activeUsers' }
    ]
  }
})
```

### Beschikbare Dimensies

| Dimension | Beschrijving |
|-----------|--------------|
| pagePath | URL path van de pagina |
| pageTitle | Titel van de pagina |
| deviceCategory | desktop, mobile, tablet |
| country | Land van bezoeker |
| city | Stad van bezoeker |
| source | Traffic bron |
| medium | Traffic medium |
| sessionDefaultChannelGroup | Kanaal groep |
| eventName | Naam van event |
| date | Datum |

### Beschikbare Metrics

| Metric | Beschrijving |
|--------|--------------|
| screenPageViews | Page views |
| sessions | Aantal sessies |
| totalUsers | Totaal unieke gebruikers |
| newUsers | Nieuwe gebruikers |
| engagementRate | Engagement percentage |
| averageSessionDuration | Gemiddelde sessie duur |
| bounceRate | Bounce percentage |
| eventCount | Aantal events |
| conversions | Aantal conversies |

---

## Rate Limits

### GTM API
- 1,000 requests per 100 seconds per user
- 10,000 requests per 100 seconds total

### GA Admin API
- 600 requests per minute

### GA Data API
- 10,000 requests per day
- 10 concurrent requests

---

## Error Handling

```javascript
try {
  const result = await tagmanager.accounts.list();
} catch (error) {
  if (error.code === 401) {
    console.log('Authentication failed - check credentials');
  } else if (error.code === 403) {
    console.log('Permission denied - check service account access');
  } else if (error.code === 429) {
    console.log('Rate limited - slow down requests');
  } else {
    console.log('Error:', error.message);
  }
}
```

---

*Documentversie: 1.0*
*Laatste update: 30 Januari 2026*
