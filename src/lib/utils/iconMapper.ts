/**
 * Maps feature titles to appropriate icons based on content/topic
 * This utility helps ensure consistent icon usage across feature grids
 */

/**
 * Get the appropriate icon URL for a feature based on its title
 * @param title The feature title
 * @returns The icon URL
 */
export function getIconForFeature(title: string): string {
  // Convert title to lowercase for case-insensitive matching
  const lowerTitle = title.toLowerCase();

  // Specific service matching for MaasISO
  if (lowerTitle.includes('iso 27001') || lowerTitle.includes('informatiebeveiliging')) {
    return '/icons/shield.svg';
  }
  
  if (lowerTitle.includes('iso 9001') || lowerTitle.includes('kwaliteitsmanagement')) {
    return '/icons/quality.svg';
  }
  
  if (lowerTitle.includes('iso 14001') || lowerTitle.includes('16175')) {
    return '/icons/certificate.svg';
  }
  
  if (lowerTitle.includes('avg') || lowerTitle.includes('gdpr') || lowerTitle.includes('privacy')) {
    return '/icons/privacy.svg';
  }
  
  if (lowerTitle.includes('bio') || lowerTitle.includes('overheid') || lowerTitle.includes('standaard')) {
    return '/icons/compliance.svg';
  }
  
  if (lowerTitle.includes('integratie') || lowerTitle.includes('managementsystemen')) {
    return '/icons/consulting.svg';
  }

  // Specific advantages matching for Onze Voordelen page
  if (lowerTitle.includes('expertise') || lowerTitle.includes('ervaring')) {
    return '/icons/training.svg';
  }
  
  if (lowerTitle.includes('maatwerk') || lowerTitle.includes('oplossingen')) {
    return '/icons/consulting.svg';
  }
  
  if (lowerTitle.includes('praktische') || lowerTitle.includes('aanpak')) {
    return '/icons/quality.svg';
  }
  
  if (lowerTitle.includes('continu') || lowerTitle.includes('verbeteren')) {
    return '/icons/quality.svg';
  }
  
  if (lowerTitle.includes('transparante') || lowerTitle.includes('communicatie')) {
    return '/icons/consulting.svg';
  }
  
  if (lowerTitle.includes('resultaat') || lowerTitle.includes('gericht')) {
    return '/icons/risk.svg';
  }
  
  // ISO certification related
  if (
    lowerTitle.includes('iso') || 
    lowerTitle.includes('certificering') || 
    lowerTitle.includes('certificaat') ||
    lowerTitle.includes('standaard') ||
    lowerTitle.includes('norm')
  ) {
    return '/icons/certificate.svg';
  }
  
  // Information security related
  if (
    lowerTitle.includes('beveiliging') || 
    lowerTitle.includes('security') || 
    lowerTitle.includes('bescherming') ||
    lowerTitle.includes('veiligheid')
  ) {
    return '/icons/shield.svg';
  }
  
  // Privacy/GDPR related
  if (
    lowerTitle.includes('privacy') || 
    lowerTitle.includes('avg') || 
    lowerTitle.includes('gdpr') ||
    lowerTitle.includes('gegevens') ||
    lowerTitle.includes('data')
  ) {
    return '/icons/privacy.svg';
  }
  
  // Consulting/Advisory related
  if (
    lowerTitle.includes('advies') || 
    lowerTitle.includes('consulting') || 
    lowerTitle.includes('consultancy') ||
    lowerTitle.includes('begeleiding')
  ) {
    return '/icons/consulting.svg';
  }
  
  // Training/Education related
  if (
    lowerTitle.includes('training') || 
    lowerTitle.includes('opleiding') || 
    lowerTitle.includes('cursus') ||
    lowerTitle.includes('workshop')
  ) {
    return '/icons/training.svg';
  }
  
  // Compliance related
  if (
    lowerTitle.includes('compliance') || 
    lowerTitle.includes('naleving') || 
    lowerTitle.includes('regelgeving') ||
    lowerTitle.includes('wetgeving')
  ) {
    return '/icons/compliance.svg';
  }
  
  // Risk Management related
  if (
    lowerTitle.includes('risico') || 
    lowerTitle.includes('risk') || 
    lowerTitle.includes('assessment') ||
    lowerTitle.includes('analyse')
  ) {
    return '/icons/risk.svg';
  }
  
  // Quality Management related
  if (
    lowerTitle.includes('kwaliteit') || 
    lowerTitle.includes('quality') || 
    lowerTitle.includes('verbetering') ||
    lowerTitle.includes('management')
  ) {
    return '/icons/quality.svg';
  }
  
  // Default icon for other cases
  // Alternate between different icons for variety
  const hash = title.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const icons = [
    '/icons/certificate.svg',
    '/icons/shield.svg',
    '/icons/consulting.svg',
    '/icons/quality.svg'
  ];
  
  return icons[hash % icons.length];
}