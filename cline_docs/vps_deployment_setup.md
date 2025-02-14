# VPS Deployment Setup

Dit document beschrijft de stappen voor het opzetten van automatische deployments naar de VPS.

## Vereisten op de VPS

1. Node.js en npm
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. PM2 voor process management
```bash
sudo npm install -g pm2
```

3. Git
```bash
sudo apt-get update
sudo apt-get install git
```

## SSH Setup

1. Genereer een SSH key pair op de VPS:
```bash
ssh-keygen -t ed25519 -C "vps@maasiso.nl"
```

2. Voeg de public key toe aan GitHub als deploy key:
- Kopieer de inhoud van `~/.ssh/id_ed25519.pub`
- Ga naar GitHub repository settings -> Deploy keys
- Klik op "Add deploy key"
- Plak de public key en geef deze een naam
- Vink "Allow write access" aan

## Repository Setup op VPS

1. Clone de repository:
```bash
git clone git@github.com:jackdamnielzz/maasiso.git
cd maasiso
```

2. Installeer dependencies:
```bash
npm install
```

3. Maak het deployment script uitvoerbaar:
```bash
chmod +x scripts/deploy-to-vps.sh
```

## Deployment Process

1. Wanneer er nieuwe code wordt gepusht naar GitHub:
```bash
./scripts/deploy-to-vps.sh
```

Dit script zal:
- De laatste code pullen van GitHub
- Dependencies updaten
- De applicatie builden
- De server herstarten via PM2

## Automatische Deployments

Voor automatische deployments na elke push naar main:

1. Maak een GitHub Actions workflow:
```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to VPS
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USERNAME }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /path/to/maasiso
          ./scripts/deploy-to-vps.sh
```

2. Voeg de volgende secrets toe aan de GitHub repository:
- VPS_HOST: Het IP-adres of hostname van de VPS
- VPS_USERNAME: De gebruikersnaam op de VPS
- VPS_SSH_KEY: De private SSH key voor toegang tot de VPS

## Monitoring

Monitor de applicatie status met PM2:
```bash
pm2 status
pm2 logs
```

## Rollback Procedure

In geval van problemen, rol terug naar de vorige versie:
```bash
git reset --hard HEAD^
./scripts/deploy-to-vps.sh