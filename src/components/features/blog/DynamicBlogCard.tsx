import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader } from '@/components/core/Card';
import { Typography } from '@/components/core/Typography';

// Dynamic import of BlogCard
const BlogCard = dynamic(() => import('./BlogCard'), {
  loading: () => (
    <Card hover="none" className="animate-pulse">
      <div className="h-48 w-full bg-gray-200" />
      <CardHeader>
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-6 w-3/4 bg-gray-200 rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
          <div className="h-4 w-4/6 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  ),
  ssr: false // Disable server-side rendering for blog cards
});

export default BlogCard;