type WXOptionCallback = (res: JSONType) => void;

interface JSONType {
  [key: string]: string | number | JSONType | string[] | number[] | JSONType[];
}

type Platform = "wecom" | "wechat";

type WXOption = { [P in JSONType]: JSONType[P] | WXOptionCallback };

interface SignatureData {
  corpId: string;
  agentId: string;
  signature: string;
  cropSignature: string;
  nonceStr: string;
  timestamp: string;
}
