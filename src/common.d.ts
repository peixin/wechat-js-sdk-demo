type WXOptionCallback = (res: JSONType) => void;

interface JSONType {
  [key: string]: string | number | JSONType | string[] | number[] | JSONType[];
}

type Platform = "wecom" | "wechat";
type PlatformAction = "getLocation" | "scanQRCode";

type WXOption = { [P in JSONType]: JSONType[P] | WXOptionCallback };

interface SignatureData {
  corpId: string;
  agentId: string;
  signature: string;
  configSignature: string;
  nonceStr: string;
  timestamp: string;
}
