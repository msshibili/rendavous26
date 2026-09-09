export interface Poster {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'Results' | 'Events' | 'Competitions' | 'Programs' | 'Announcements' | 'Highlights' | 'Other' | string;
  eventName: string;
  tags: string[];
  posterUrl: string;
  storagePath: string;
  thumbnailUrl: string;
  uploadedAt: string; // ISO string
  updatedAt: string;
  eventDate: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  downloadCount: number;
  shareCount: number;
}

export interface PosterFilterOptions {
  searchQuery?: string;
  category?: string;
  eventName?: string;
  isFeatured?: boolean;
  isPublished?: boolean; // For admin mode
  sortBy?: 'latest' | 'oldest' | 'downloads' | 'featured';
}

export interface PosterStats {
  totalPosters: number;
  publishedCount: number;
  draftCount: number;
  featuredCount: number;
  totalDownloads: number;
  totalShares: number;
}
