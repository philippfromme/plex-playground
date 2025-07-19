export type PlexClient = {
  query: (path: string) => Promise<any>;
};

export type Directory = {
  count: number;
  key: string;
  title: string;
};

export type Playlist = {
  ratingKey: string;
  key: string;
  guid: string;
  type: "playlist";
  title: string;
  summary: string;
  smart: boolean;
  playlistType: "audio" | "video";
  composite?: string;
  viewCount?: number;
  lastViewedAt?: number;
  duration?: number;
  leafCount?: number;
  addedAt?: number;
  updatedAt?: number;
};

export type Track = {
  ratingKey: string;
  key: string;
  guid: string;
  parentRatingKey: string;
  grandparentRatingKey: string;
  parentGuid: string;
  grandparentGuid: string;
  parentStudio: string;
  type: "track";
  title: string;
  grandparentKey: string;
  parentKey: string;
  grandparentTitle: string;
  parentTitle: string;
  summary: string;
  index: number;
  parentIndex: number;
  ratingCount: number;
  parentYear: number;
  thumb: string;
  parentThumb: string;
  grandparentThumb: string;
  duration: number;
  addedAt: number;
  updatedAt: number;
  Media: Array<any>;
  Image: Array<any>;
};
