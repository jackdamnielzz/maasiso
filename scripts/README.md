# Deployment Scripts (Archived)

**IMPORTANT: These deployment scripts are no longer in use as of February 2025.**

We have transitioned to an SFTP-based deployment process using VS Code's SFTP extension. The following scripts are kept for historical reference but should not be used:

- cleanup-vps.sh
- deploy-to-vps.sh
- deploy.js
- deploy.ps1
- fast-deploy.ps1
- prepare-vps.sh
- quick-deploy.sh
- sync-from-prod.js
- sync.ps1

## New Deployment Process

For the current deployment process, please refer to:
1. `cline_docs/vps_deployment_setup.md` - Main SFTP deployment documentation
2. `cline_docs/manuals/deployment_workflow.md` - Detailed deployment workflows

The new SFTP-based deployment process offers:
- Direct file synchronization through VS Code
- Simpler deployment workflow
- No Git dependencies
- Real-time file updates
- Visual deployment interface

## Historical Note

These scripts were part of our previous Git-based deployment system that used GitHub Actions and automated scripts for deployment. We switched to SFTP deployment after resetting VPS2 to simplify our deployment process and reduce complexity.

For any questions about the new deployment process, consult the documentation mentioned above.