import Head from 'next/head';
import RelatedPostsManager from '../../app/_admin/related-posts/page';

export default function RelatedPostsAdminPage() {
  return (
    <>
      <Head>
        <title>Admin | MaasISO</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <RelatedPostsManager />
    </>
  );
}

