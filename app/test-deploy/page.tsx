import { ReactNode } from 'react';

export default function TestDeployPage(): ReactNode {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">Deployment Test Page</h1>
      <p className="text-lg">If you can see this page, the deployment was successful!</p>
      <div className="mt-8">
        <p>Server Info:</p>
        <ul className="list-disc pl-6">
          <li>Node.js Version: {process.version}</li>
          <li>Environment: {process.env.NODE_ENV}</li>
          <li>Timestamp: {new Date().toISOString()}</li>
        </ul>
      </div>
    </main>
  );
}