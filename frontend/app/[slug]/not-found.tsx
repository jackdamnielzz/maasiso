import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 px-4 text-center">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
      <p className="text-lg text-gray-600">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
      >
        Return Home
      </Link>
    </div>
  );
}
