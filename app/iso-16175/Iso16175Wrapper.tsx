'use client';

import Iso16175Client from './Iso16175Client';
import RelatedServices from '@/components/ui/RelatedServices';
import { getRelatedServices } from '@/lib/utils/serviceRelations';
import { Block } from './Iso16175Client';

interface Props {
  layout: Block[];
}

export default function Iso16175Wrapper({ layout }: Props) {
  const relatedServices = getRelatedServices('iso-16175');

  return (
    <>
      <Iso16175Client layout={layout} />
      <RelatedServices services={relatedServices} />
    </>
  );
}