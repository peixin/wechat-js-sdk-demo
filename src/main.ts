(function () {
  const JS_API_LIST = ["chooseImage", "scanQRCode"];
  const SIGNATURE_HOST = "https://example.com";
  const WECOM_FLAG = "wxwork";
  const resultDom = document.getElementById("result") as HTMLElement;

  const utils = {
    isWecom: () => window.navigator.userAgent.search(WECOM_FLAG) !== -1,

    getSignature: async (url: string, location: string) => {
      console.log("location", location);
      try {
        url = url + "?url=" + encodeURIComponent(location.split("#")[0]);
        const response = await fetch(url);
        const text = await response.text();
        const data = JSON.parse(text) as SignatureData;
        console.log("SignatureData:", data);
        return data;
      } catch {
        return {} as SignatureData;
      }
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

    showResult: (result: string, res: JSONType) => {
      resultDom.innerText = result + "\n" + JSON.stringify(res);
    },

    wxAPICommonOptions: (apiName: string, option: JSONType) => {
      return Object.assign(option, {
        success: function (res: JSONType) {
          console.log(`${apiName} result:`, res);
          utils.showResult(`${apiName} result:`, res);
        },
        error: function (res: JSONType) {
          console.error(`${apiName} error:`, res);
          utils.showResult(`${apiName} error:`, res);
        },
        fail: function (res: JSONType) {
          console.error(`${apiName} fail:`, res);
          utils.showResult(`${apiName} error:`, res);
        },
      });
    },
  };

  const WxAPI = {
    scanQRCode: () => {
      console.log("wx.scanQRCode");
      window.wx.scanQRCode(
        utils.wxAPICommonOptions("scanQRCode", {
          desc: "scanQRCode desc",
          needResult: 1,
          scanType: ["qrCode", "barCode"],
        }),
      );
    },

    getLocation: () => {
      window.wx.getLocation(
        utils.wxAPICommonOptions("getLocation", {
          type: "wgs84",
        }),
      );
    },
  };

  const runWecomAction = async (action: PlatformAction) => {
    const signatureUrl = `${SIGNATURE_HOST}/wecom/signature`;

    const { signature, configSignature, nonceStr, timestamp, agentId, corpId } = await utils.getSignature(
      signatureUrl,
      location.href,
    );

    if (!signature) {
      console.error("get signature fail");
      return false;
    }

    console.log("wecom config start");

    const configOption = utils.getConfigOption(corpId, timestamp, nonceStr, configSignature);

    const agentConfigOption = utils.getAgentConfigOption(
      corpId,
      agentId,
      timestamp,
      nonceStr,
      signature,
      (res: JSONType) => {
        console.log("agentConfig success", res);
        WxAPI[action]();
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
        WxAPI[action]();
      }
    });

    window.wx.error((res: JSONType) => {
      console.error("wecom config error", res);
    });
  };

  const runWechatAction = async (action: PlatformAction) => {
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
      WxAPI[action]();
    });

    window.wx.error((res: JSONType) => {
      console.error("wechat config error", res);
    });
  };

  window.doAction = (platform: Platform, action: PlatformAction) => {
    console.log("click button", platform);
    if (platform === "wechat") {
      runWechatAction(action);
    } else {
      runWecomAction(action);
    }
  };
})();
