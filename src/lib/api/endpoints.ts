import { Page, PageData, StrapiCollectionResponse } from './types';
import { fetchFromStrapi } from './core';
import { mapPage } from './mappers/page';

export async function getPage(slug: string): Promise<Page | null> {
  try {
    console.log(`[getPage] Starting getPage for slug: ${slug} at ${new Date().toISOString()}`);
    
    // Use simple populate query that matches our component structure
    const query = `filters[slug][$eq]=${slug}&populate=*`;
    
    try {
      console.log(`[getPage] Making direct Strapi request for ${slug} with query: ${query}`);
      const data = await fetchFromStrapi<StrapiCollectionResponse<PageData>>(`pages?${query}`);
      
      console.log(`[getPage] Retrieved data for ${slug}:`, {
        dataExists: !!data,
        hasData: !!data?.data,
        dataCount: data?.data?.length || 0,
        meta: data?.meta,
        firstItemId: data?.data?.[0]?.id || 'none',
        hasLayout: Array.isArray(data?.data?.[0]?.attributes?.layout),
        layoutCount: Array.isArray(data?.data?.[0]?.attributes?.layout) ? data.data[0].attributes.layout.length : 0
      });
      
      if (!data.data || data.data.length === 0) {
        console.log(`[getPage] No data found for slug: ${slug}`);
        return null;
      }

      // Extract the attributes and combine with id
      const pageData: PageData = {
        ...data.data[0].attributes,
        id: data.data[0].id
      };

      const mappedPage = mapPage(pageData);
      console.log(`[getPage] Page mapped successfully:`, {
        id: mappedPage?.id,
        hasLayout: Array.isArray(mappedPage?.layout),
        layoutCount: mappedPage?.layout?.length || 0
      });

      return mappedPage;
    } catch (error) {
      console.error(`[getPage] Error fetching page:`, error);
      return null;
    }
  } catch (error) {
    console.error('Error in getPage:', error);
    return null;
  }
}