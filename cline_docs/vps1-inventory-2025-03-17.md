# VPS1 Server Inventory (153.92.223.23)
Date: March 17, 2025

## Server Overview

VPS1 is hosting a Strapi CMS installation and a Next.js frontend application. The server has a total disk usage of approximately 12GB.

## Disk Usage Summary

```
12G     /                   # Total disk usage
4.2G    /root               # Root user home directory
3.5G    /var                # Variable data files
3.2G    /usr                # User programs
995M    /snap               # Snap packages
109M    /boot               # Boot files
12M     /etc                # Configuration files
1.7M    /tmp                # Temporary files
1.2M    /run                # Runtime data
456K    /backups            # Backup files
72K     /home               # User home directories
28K     /dev                # Device files
16K     /lost+found         # Lost and found files
4.0K    /srv                # Service data
4.0K    /opt                # Optional software
4.0K    /mnt                # Mount point
4.0K    /media              # Media mount point
0       /sys                # System files
0       /proc               # Process information
```

## Detailed Directory Structure

### /root (4.2GB)
```
4.2G    /root
3.3G    /root/.pm2          # PM2 process manager files
979M    /root/.npm          # NPM cache
36K     /root/.cache        # Cache files
32K     /root/.config       # Configuration files
12K     /root/.ssh          # SSH keys
12K     /root/.local        # Local files
4.0K    /root/strapi-dev    # Strapi development files
```

#### /root/.pm2 (3.3GB)
```
3.3G    /root/.pm2
2.5G    /root/.pm2/logs     # PM2 log files
732M    /root/.pm2/pm2.log  # PM2 main log file
8.0K    /root/.pm2/pids     # PM2 process IDs
4.0K    /root/.pm2/modules  # PM2 modules
```

##### /root/.pm2/logs (2.5GB)
```
2.5G    /root/.pm2/logs
2.0G    maasiso-error.log   # MaasISO error logs
559M    maasiso-out.log     # MaasISO output logs
18M     strapi-out.log      # Strapi output logs
2.0M    strapi-error.log    # Strapi error logs
14K     strapi-dev-error.log # Strapi development error logs
9.7K    frontend-error.log  # Frontend error logs
2.8K    frontend-out.log    # Frontend output logs
1.9K    strapi-dev-out.log  # Strapi development output logs
```

### /var (3.5GB)
```
3.5G    /var
2.1G    /var/www            # Web server files
702M    /var/lib            # Library files
405M    /var/log            # Log files
240M    /var/cache          # Cache files
8.2M    /var/spool          # Spool files
3.6M    /var/backups        # Backup files
116K    /var/crash          # Crash reports
92K     /var/mail           # Mail files
64K     /var/snap           # Snap files
32K     /var/tmp            # Temporary files
4.0K    /var/opt            # Optional files
4.0K    /var/local          # Local files
```

#### /var/www (2.1GB)
```
2.1G    /var/www
1.3G    /var/www/strapi     # Strapi CMS installation
904M    /var/www/html       # Web server root directory
```

##### /var/www/strapi (1.3GB)
```
1.3G    /var/www/strapi
1.2G    /var/www/strapi/node_modules  # Node.js modules
14M     /var/www/strapi/dist          # Distribution files
1.4M    /var/www/strapi/public        # Public files
1020K   /var/www/strapi/src           # Source files
748K    /var/www/strapi/.git          # Git repository
84K     /var/www/strapi/config.bak    # Backup configuration
72K     /var/www/strapi/types         # TypeScript types
24K     /var/www/strapi/.strapi       # Strapi files
20K     /var/www/strapi/config        # Configuration files
8.0K    /var/www/strapi/database      # Database files
4.0K    /var/www/strapi/backup_config # Backup configuration
```

##### /var/www/html (904MB)
```
904M    /var/www/html
793M    /var/www/html/node_modules    # Node.js modules
107M    /var/www/html/.next           # Next.js build files
2.5M    /var/www/html/src             # Source files
1.1M    /var/www/html/.git            # Git repository
420K    /var/www/html/app             # Next.js app directory
44K     /var/www/html/public          # Public files
```

#### /var/lib (702MB)
```
702M    /var/lib
352M    /var/lib/snapd      # Snap daemon files
219M    /var/lib/apt        # APT package manager files
76M     /var/lib/postgresql # PostgreSQL database files
44M     /var/lib/dpkg       # Debian package manager files
5.6M    /var/lib/ubuntu-advantage # Ubuntu Advantage files
3.4M    /var/lib/command-not-found # Command not found files
1.9M    /var/lib/cloud      # Cloud-init files
912K    /var/lib/systemd    # Systemd files
708K    /var/lib/usbutils   # USB utilities files
```

##### /var/lib/postgresql (76MB)
```
76M     /var/lib/postgresql
76M     /var/lib/postgresql/14/main   # PostgreSQL 14 database files
20K     /var/lib/postgresql/.ssh      # SSH keys
```

#### /var/log (405MB)
```
405M    /var/log
97M     /var/log/journal/bd6361e8dbadf471214db874c0dc85eb/system@714081b3aece45b792fb0192e029d9ba-0000000000016336-0006300c26cf3e60.journal
57M     /var/log/journal/bd6361e8dbadf471214db874c0dc85eb/system@000630755772f0d2-4c5d530a9bdcfbdf.journal~
57M     /var/log/journal/bd6361e8dbadf471214db874c0dc85eb/system.journal
```

### /usr (3.2GB)
```
3.2G    /usr
2.1G    /usr/lib            # Library files
402M    /usr/src            # Source files
360M    /usr/share          # Shared files
225M    /usr/bin            # Binary files
65M     /usr/include        # Include files
32M     /usr/sbin           # System binary files
2.2M    /usr/libexec        # Executable libraries
64K     /usr/local          # Local files
4.0K    /usr/libx32         # 32-bit libraries
4.0K    /usr/lib64          # 64-bit libraries
4.0K    /usr/lib32          # 32-bit libraries
4.0K    /usr/games          # Games
```

#### /usr/lib (2.1GB)
```
2.1G    /usr/lib
105M    /usr/lib/x86_64-linux-gnu/libLLVM-14.so.1  # LLVM library
```

#### /usr/bin (225MB)
```
225M    /usr/bin
94M     /usr/bin/node       # Node.js executable
```

### /snap (995MB)
```
995M    /snap
418M    /snap/core20        # Core20 snap package
305M    /snap/lxd           # LXD snap package
272M    /snap/snapd         # Snapd snap package
```

#### /snap/core20 (418MB)
```
418M    /snap/core20
64M     /snap/core20/2496.snap  # Core20 snap version 2496
64M     /snap/core20/2434.snap  # Core20 snap version 2434
```

#### /snap/lxd (305MB)
```
305M    /snap/lxd
90M     /snap/lxd/31333.snap    # LXD snap version 31333
```

## Largest Individual Files

```
2.0G    /root/.pm2/logs/maasiso-error.log
732M    /root/.pm2/pm2.log
559M    /root/.pm2/logs/maasiso-out.log
163M    /var/www/html/node_modules/@next/swc-linux-x64-musl/next-swc.linux-x64-musl.node
136M    /var/www/html/node_modules/@next/swc-linux-x64-gnu/next-swc.linux-x64-gnu.node
105M    /usr/lib/x86_64-linux-gnu/libLLVM-14.so.1
97M     /var/log/journal/bd6361e8dbadf471214db874c0dc85eb/system@714081b3aece45b792fb0192e029d9ba-0000000000016336-0006300c26cf3e60.journal
94M     /usr/bin/node
90M     /var/lib/snapd/snaps/lxd_31333.snap
90M     /var/lib/snapd/seed/snaps/lxd_31333.snap
64M     /var/lib/snapd/snaps/core20_2496.snap
64M     /var/lib/snapd/snaps/core20_2434.snap
64M     /var/lib/snapd/seed/snaps/core20_2434.snap
62M     /var/lib/apt/lists/nl.archive.ubuntu.com_ubuntu_dists_jammy_universe_binary-amd64_Packages
59M     /var/www/strapi/node_modules/@swc/core-linux-x64-musl/swc.linux-x64-musl.node
59M     /var/www/html/node_modules/@swc/core-linux-x64-musl/swc.linux-x64-musl.node
57M     /var/log/journal/bd6361e8dbadf471214db874c0dc85eb/system@000630755772f0d2-4c5d530a9bdcfbdf.journal~
57M     /var/log/journal/bd6361e8dbadf471214db874c0dc85eb/system.journal
54M     /var/cache/apt/srcpkgcache.bin
```

## Complete Disk Usage Breakdown

Here's a more complete breakdown of the 12GB total disk usage:

1. **PM2 and NPM in /root (4.2GB)**
   - PM2 logs and main log file (3.3GB)
   - NPM cache (979MB)

2. **Web and Application Files in /var (3.5GB)**
   - Strapi CMS with node_modules (1.3GB)
   - Next.js application with node_modules (904MB)
   - System logs (405MB)
   - Library files including snapd, apt, and PostgreSQL (702MB)
   - Cache and other files (240MB)

3. **System Libraries and Binaries in /usr (3.2GB)**
   - Library files including LLVM (2.1GB)
   - Source files (402MB)
   - Shared files (360MB)
   - Binary files including Node.js (225MB)
   - Include files and other system files (100MB)

4. **Snap Packages (995MB)**
   - Core20 snap package (418MB)
   - LXD snap package (305MB)
   - Snapd snap package (272MB)

5. **Boot Files (109MB)**
   - Linux kernel and boot loader files

6. **Other System Files (100MB)**
   - Configuration files in /etc (12MB)
   - Temporary files, runtime data, and other small directories

This accounts for the full 12GB of disk usage on the server.

## Key Findings

1. **PM2 Logs**: The largest single consumer of disk space is the PM2 logs directory at 2.5GB, with maasiso-error.log (2.0GB) and maasiso-out.log (559MB) being the largest files. The PM2 main log file (pm2.log) is also quite large at 732MB.

2. **Node Modules**: Both the Strapi installation (/var/www/strapi/node_modules at 1.2GB) and the Next.js application (/var/www/html/node_modules at 793MB) have large node_modules directories, which is typical for Node.js applications.

3. **NPM Cache**: The NPM cache in /root/.npm is quite large at 979MB and could potentially be cleaned up.

4. **System Logs**: The system logs in /var/log are taking up 405MB, with several large journal files.

5. **Snap Packages**: The snap packages are taking up 995MB, with Core20, LXD, and Snapd being the largest.

6. **Database Size**: The PostgreSQL database is relatively small at 76MB, indicating that the Strapi CMS doesn't have a large amount of content stored.

7. **Application Structure**:
   - Strapi CMS is installed in /var/www/strapi
   - A Next.js application is installed in /var/www/html
   - Both applications are managed by PM2

## Recommendations

1. **Log Rotation**: Implement log rotation for PM2 logs to prevent them from consuming excessive disk space.

2. **Clean NPM Cache**: Consider cleaning the NPM cache to free up space.

3. **Monitor Database Growth**: While the PostgreSQL database is currently small, it should be monitored for growth as more content is added to the Strapi CMS.

4. **Backup Strategy**: Ensure regular backups of the PostgreSQL database and Strapi configuration files.

5. **Dependency Management**: Consider using techniques like dependency pruning or using production-only dependencies to reduce the size of node_modules directories.

6. **System Log Management**: Implement log rotation for system logs to prevent them from growing too large.

7. **Snap Package Management**: Review the installed snap packages and remove any that are not needed.