(function () {
  const JS_API_LIST = ["scanQRCode"];
  const SIGNATURE_HOST = "https://example.com";
  const WECOM_FLAG = "wxwork";

  const utils = {
    isWecom: () => window.navigator.userAgent.search(WECOM_FLAG) !== -1,

    getSignature: async (url: string, location: string) => {
      console.log("location", location);
      try {
        url = url + "?url=" + encodeURIComponent(location.split("#")[0]);
        const response = await fetch(url);
        const text = await response.text();
        return JSON.parse(text) as SignatureData;
      } catch {
        return {} as SignatureData;
      }
    },

    wxScanQRCode: () => {
      console.log("wx.scanQRCode");
      window.wx.scanQRCode({
        desc: "scanQRCode desc",
        needResult: 0,
        scanType: ["qrCode", "barCode"],
        success: function (res: JSONType) {
          console.log("scan result", res);
        },
        error: function (res: JSONType) {
          console.error("scan error", res);
        },
        fail: function (res: JSONType) {
          console.error("scan fail", res);
        },
      });
    },

    getConfigOption: (appId: string, timestamp: string, nonceStr: string, signature: string) => {
      return {
        beta: true,
        debug: false,
        appId,
        timestamp,
        nonceStr,
        signature,
        jsApiList: JS_API_LIST,
      };
    },

    getAgentConfigOption: (
      corpId: string,
      agentId: string,
      timestamp: string,
      nonceStr: string,
      signature: string,
      success: WXOptionCallback,
      fail: WXOptionCallback,
    ) => {
      return {
        corpid: corpId,
        agentid: agentId,
        timestamp,
        nonceStr,
        signature,
        jsApiList: JS_API_LIST,
        success,
        error: fail,
        fail,
      };
    },
  };

  const runWecomScan = async () => {
    const signatureUrl = `${SIGNATURE_HOST}/wecom/signature`;

    const { signature, cropSignature, nonceStr, timestamp, agentId, corpId } = await utils.getSignature(
      signatureUrl,
      location.href,
    );

    if (!signature) {
      console.error("get signature fail");
      return false;
    }

    console.log("wecom config start");

    const configOption = utils.getConfigOption(corpId, timestamp, nonceStr, cropSignature);

    const agentConfigOption = utils.getAgentConfigOption(
      corpId,
      agentId,
      timestamp,
      nonceStr,
      signature,
      (res: JSONType) => {
        console.log("agentConfig success", res);
        utils.wxScanQRCode();
      },
      (res: JSONType) => {
        console.error("agentConfig error", res);
      },
    );

    console.log("config", configOption);
    window.wx.config(configOption);

    window.wx.ready(() => {
      console.log("wecom ready");

      if (utils.isWecom()) {
        window.wx.agentConfig(agentConfigOption);
      } else {
        utils.wxScanQRCode();
      }
    });

    window.wx.error((res: JSONType) => {
      console.error("wecom config error", res);
    });
  };

  const runWechatScan = async () => {
    const signatureUrl = `${SIGNATURE_HOST}/wechat/signature`;

    const { signature, nonceStr, timestamp, corpId } = await utils.getSignature(signatureUrl, location.href);

    if (!signature) {
      console.error("get signature fail");
      return false;
    }

    console.log("wechat config start");

    const configOption = utils.getConfigOption(corpId, timestamp, nonceStr, signature);

    console.log("config", configOption);
    window.wx.config(configOption);

    window.wx.ready(() => {
      console.log("wechat config ready");
      utils.wxScanQRCode();
    });

    window.wx.error((res: JSONType) => {
      console.error("wechat config error", res);
    });
  };

  window.scanIt = (platform: Platform) => {
    console.log("scan it", platform);
    if (platform === "wechat") {
      runWechatScan();
    } else {
      runWecomScan();
    }
  };
})();
