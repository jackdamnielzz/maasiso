import fs from 'fs';
import path from 'path';

export function getPrivacyPolicyContent() {
  const filePath = path.join(process.cwd(), 'app/privacy-policy/content.md');
  const content = fs.readFileSync(filePath, 'utf8');
  return content;
}