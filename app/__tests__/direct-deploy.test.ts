import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

jest.mock('child_process');

describe('direct-deploy.ps1 script', () => {
  const mockedExec = exec as jest.MockedFunction<typeof exec>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should preserve the existing .env file on the server during deployment', () => {
    // Read the deployment bash script embedded in the PowerShell script
    const psScriptPath = path.resolve(__dirname, '../../direct-deploy.ps1');
    const psScriptContent = fs.readFileSync(psScriptPath, 'utf-8');

    // Extract the bash deploy script block
    const deployScriptMatch = psScriptContent.match(/\$deployScript = @'([\s\S]*?)'@/);
    expect(deployScriptMatch).not.toBeNull();

    const deployScript = deployScriptMatch ? deployScriptMatch[1] : '';

    // Check that the deploy script does NOT overwrite .env file on server
    expect(deployScript).toMatch(/# Do not overwrite the existing \.env file on the server/);
    expect(deployScript).not.toMatch(/cp .*\.env/);
  });

  it('should not run npm install on the server after copying files', () => {
    // The PowerShell script runs npm install only locally in tempDir, not on server
    // Check that the deploy script does not contain npm install commands
    const psScriptPath = path.resolve(__dirname, '../../direct-deploy.ps1');
    const psScriptContent = fs.readFileSync(psScriptPath, 'utf-8');
    const deployScriptMatch = psScriptContent.match(/\$deployScript = @'([\s\S]*?)'@/);
    expect(deployScriptMatch).not.toBeNull();

    const deployScript = deployScriptMatch ? deployScriptMatch[1] : '';

    // The deploy script comment states npm install is removed, but the script does not contain npm install command
    // The test should confirm npm install is NOT present in the deploy script
    // However, the deploy script is the bash script run on server, npm install is run locally in PowerShell script
    // So we only check the deploy script for npm install commands

    // Check deploy script does not contain npm install
    expect(deployScript).not.toMatch(/npm install/);
  });

  it('should correctly utilize the new script parameters for URLs in .env.production', () => {
    // Check that the .env.production content includes the parameters
    const psScriptPath = path.resolve(__dirname, '../../direct-deploy.ps1');
    const psScriptContent = fs.readFileSync(psScriptPath, 'utf-8');

    // Check that the .env.production content includes the parameters placeholders
    expect(psScriptContent).toMatch(/NEXT_PUBLIC_API_URL=\$NextPublicApiUrl/);
    expect(psScriptContent).toMatch(/NEXT_PUBLIC_BACKEND_URL=\$NextPublicBackendUrl/);
    expect(psScriptContent).toMatch(/NEXT_PUBLIC_SITE_URL=\$NextPublicSiteUrl/);
  });
});