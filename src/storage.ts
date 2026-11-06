export type VideoSeekRule = {
    urlPattern: string;
    videoSelector: string;
};

export type IStorage = {
    githubUsername: string;
    gDoubleTime: number;
    vimKeysBlacklistCSV: string;
    scrollSmooth: boolean;
    newTabBackgroundColor: string;
    redditThumbnailSizeIncrement: number;
    currentRedditThumbnailSize: number;
    awsProfileNamesCSV: string;
    videoSeekRules: VideoSeekRule[];
    submitSelector: string;
};

const defaultStorage: IStorage = {
    githubUsername: import.meta.env.VITE_GITHUB_USERNAME || '',
    gDoubleTime: 350,
    submitSelector: 'button[data-testid="fastDownloadBtn"]',
    vimKeysBlacklistCSV: 'google.com, gmail.com',
    scrollSmooth: true,
    newTabBackgroundColor: '#202124', // $kh-black value
    redditThumbnailSizeIncrement: 5,
    currentRedditThumbnailSize: 100,
    awsProfileNamesCSV: 'sema4ai-backend-dev, sema4ai-backend-prod',
    videoSeekRules: [{
        urlPattern: 's.cc',
        videoSelector: '[data-testid="video-player"] video',
    }],
};

export async function resetStorage() {
    await storage.set({ ...defaultStorage });
}

export const storage = {
    get: (): Promise<IStorage> =>
        chrome.storage.sync.get(defaultStorage) as Promise<IStorage>,
    set: (value: IStorage): Promise<void> => chrome.storage.sync.set(value),
};
