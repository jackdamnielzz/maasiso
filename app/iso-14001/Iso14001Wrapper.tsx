'use client';

import Iso14001Client from './Iso14001Client';
import RelatedServices from '@/components/ui/RelatedServices';
import { getRelatedServices } from '@/lib/utils/serviceRelations';
import { Block } from './Iso14001Client';

interface Props {
  layout: Block[];
}

export default function Iso14001Wrapper({ layout }: Props) {
  const relatedServices = getRelatedServices('iso-14001');

  return (
    <>
      <Iso14001Client layout={layout} />
      <RelatedServices services={relatedServices} />
    </>
  );
}