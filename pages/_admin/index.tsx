import type { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/_admin/related-posts',
    permanent: true,
  },
});

export default function AdminIndex() {
  return null;
}

