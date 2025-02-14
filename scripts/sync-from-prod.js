#!/usr/bin/env node

import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to PowerShell script
const PS_SCRIPT = resolve(__dirname, 'sync.ps1');

// Execute PowerShell script
console.log('🚀 Starting sync from production...');
exec(`powershell -ExecutionPolicy Bypass -File "${PS_SCRIPT}"`, 
    { maxBuffer: 1024 * 1024 * 10 }, 
    (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        if (error) {
            console.error('❌ Sync failed:', error);
            process.exit(1);
        }
    }
);