import type { TimelineItem } from '@/data/timeline';
import { getSignedFileUrl } from '@/lib/r2';

export interface EnhancedTimelineItem extends TimelineItem {
  logo?: string;
}

/**
 * Enhances timeline items with signed R2 URLs for company/institution logos.
 * Mirrors the enhanceProjects() pattern in lib/projects.ts.
 */
export async function enhanceTimeline(
  items: TimelineItem[],
): Promise<EnhancedTimelineItem[]> {
  return Promise.all(
    items.map(async (item): Promise<EnhancedTimelineItem> => ({
      ...item,
      logo: item.logo ? await getSignedFileUrl(item.logo) : undefined,
    })),
  );
}
