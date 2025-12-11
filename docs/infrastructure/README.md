# Infrastructure Documentation

This folder contains comprehensive documentation about the MaasISO VPS infrastructure.

## Documents

| Document | Description | Last Updated |
|----------|-------------|--------------|
| [VPS-ARCHITECTURE-OVERVIEW.md](VPS-ARCHITECTURE-OVERVIEW.md) | Complete architecture overview of both VPS servers | 2025-12-10 |

## Quick Reference

### SSH Access
```bash
# Frontend (maasiso.nl)
ssh root@maasiso.nl

# Backend (Strapi CMS)
ssh root@153.92.223.23
```

### Server Summary

| Server | IP | Role | Expires |
|--------|-----|------|---------|
| Frontend | 147.93.62.188 | Next.js website | 2026-01-07 |
| Backend | 153.92.223.23 | Strapi CMS + PostgreSQL | ⚠️ 2025-12-17 |

## Related Documentation

- [Server Access Guide](../SERVER-ACCESS-GUIDE.md) - SSH access instructions
- [Security Scripts](../../scripts/security/) - Security hardening scripts
- [Active Context](../../memory-bank/activeContext.md) - Current work status