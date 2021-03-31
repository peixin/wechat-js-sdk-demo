export declare global {
  interface Window {
    wx: { [key: string]: (option: WXOption) => void };
    scanIt: (platform: Platform) => void;
  }
}
