# Deployment Scripts

## Fast Deploy (Aanbevolen)
`fast-deploy.ps1` is het aanbevolen script voor deployments. Dit script gebruikt een Git-achtige aanpak voor snelle en efficiënte deployments.

### Gebruik

```powershell
# Normale deployment (alleen gewijzigde bestanden)
./fast-deploy.ps1

# Force deployment (alle bestanden)
./fast-deploy.ps1 -force
```

Voor volledige documentatie, zie: `cline_docs/manuals/deployment_workflow.md`

## Legacy Scripts

- `deploy.ps1` - Oud deployment script (niet aanbevolen)
- `deploy.js` - Node.js wrapper voor deploy.ps1
- `sync.ps1` - Script voor het synchroniseren van bestanden

⚠️ Deze legacy scripts worden behouden voor backward compatibility maar worden niet meer actief onderhouden.

  - D:\Programmeren\MaasISONEW\New without errors\maasiso - Copy - Copy - Copy\src\__tests__\utils\test-utils.ts

📤 Preparing files for deployment...

❌ Deployment failed: The filename, directory name, or volume label syntax is incorrect. : 'C:\Users\niels\AppData\Local\Temp\deploy-2040208835\D:\Programmeren\MaasISONEW\New without errors'.
PS D:\Programmeren\MaasISONEW\New without errors\maasiso - Copy - Copy - Copy> ssh root@147.93.62.188 "cat /var/www/maasiso/app/.env"