import { useEffect, useState } from 'react';
import os from 'os';

interface SystemInfo {
  uptime: number;
  memory: {
    total: number;
    free: number;
    usage: string;
  };
  nodeVersion: string;
  environment: string;
  timestamp: string;
}

export default function Home() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  useEffect(() => {
    const getSystemInfo = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setSystemInfo(data);
      } catch (error) {
        console.error('Failed to fetch system info:', error);
      }
    };

    getSystemInfo();
    const interval = setInterval(getSystemInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Deployment Test Page</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Information</h2>
          
          {systemInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="font-medium">Node.js Version:</div>
                <div>{systemInfo.nodeVersion}</div>
                
                <div className="font-medium">Environment:</div>
                <div>{systemInfo.environment}</div>
                
                <div className="font-medium">Uptime:</div>
                <div>{Math.floor(systemInfo.uptime / 3600)} hours, {Math.floor((systemInfo.uptime % 3600) / 60)} minutes</div>
                
                <div className="font-medium">Memory Usage:</div>
                <div>{systemInfo.memory.usage}</div>
                
                <div className="font-medium">Last Updated:</div>
                <div>{new Date(systemInfo.timestamp).toLocaleString()}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Loading system information...</div>
          )}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          This page automatically updates every 5 seconds
        </div>
      </div>
    </main>
  );
}
