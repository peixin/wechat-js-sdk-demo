export declare global {
  interface Window {
    wx: { [key: string]: (option: WXOption) => void };
    doAction: (platform: Platform, action: PlatformAction) => void;
  }
}
