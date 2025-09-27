import { getLinkZoneUrl, linkZoneApiUrl } from "../config";
import UssdCodes from "../mockup/USSDCodes";
export default class LinkZone {
  proxyURL;
  NETWORKS_TYPES = [
    "NO_SERVICE",
    "2G",
    "2G",
    "3G",
    "3G",
    "3G",
    "3G+",
    "3G+",
    "4G",
    "4G+",
  ];
  UssdCodes = UssdCodes;
  constructor(proxyURL = linkZoneApiUrl) {
    this.proxyURL = proxyURL;
  }

  setLinkZoneUrl(url) {
    this.proxyURL = getLinkZoneUrl(url);
  }

  getLinkZoneUrl() {
    return this.proxyURL;
  }

  sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  };

  async linkZoneRequest(payload) {
    // Use IPC to make requests through main process to avoid CORS
    if (typeof window !== "undefined" && window.require) {
      const { ipcRenderer } = window.require("electron");

      try {
        const result = await ipcRenderer.invoke("linkzone-request", payload);

        if (result.success) {
          return result.data;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error("LinkZone IPC Error:", error);
        return { error: error.message };
      }
    } else {
      // Fallback for non-Electron environments (should not happen in production)
      console.error("IPC not available - falling back to direct fetch");
      return fetch(this.proxyURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          return data;
        })
        .catch((err) => {
          console.error("LinkZone API Error:", err);
          return { error: err.message };
        });
    }
  }

  getSystemStatus() {
    const data = {
      jsonrpc: "2.0",
      method: "GetSystemStatus",
      id: "13.4",
    };

    return this.linkZoneRequest(data).then((res) => {
      const result = {
        Connected: res?.result?.ConnectionStatus == 2,
        NetworkName: res?.result?.NetworkName,
        NetworkType: this.NETWORKS_TYPES[res?.result?.NetworkType],
        SignalStrength: res?.result?.SignalStrength,
        TotalConnNum: res?.result?.TotalConnNum,
        BatCap: res?.result?.bat_cap,
        ChargeState: res?.result?.chg_state,
      };
      console.log("getSystemStatus", result);
      return result;
    });
  }

  getNetworkSettings() {
    const data = {
      jsonrpc: "2.0",
      method: "GetNetworkSettings",
      id: "4.6",
    };

    return this.linkZoneRequest(data).then((res) => {
      let hasNetwork = true;
      if (
        res?.result == null ||
        res?.code == "EHOSTUNREACH" ||
        res?.code == "EACCES"
      )
        hasNetwork = false;

      let result = {
        NetworkMode: res?.result?.NetworkMode,
        NetSelectionMode: res?.result?.NetselectionMode,
        NetworkStatus: hasNetwork,
      };

      if (result.NetworkMode != null)
        result.NetworkMode =
          result.NetworkMode == 255 ? 0 : res.result.NetworkMode;

      console.log("getNetworkSettings", result);
      return result;
    });
  }

  login(pass) {
    const data = {
      jsonrpc: "2.0",
      method: "Login",
      params: {
        UserName: "admin",
        Password: pass,
      },
      id: "1.1",
    };

    return this.linkZoneRequest(data).then((res) => {
      let result = {
        Token: null,
        Message: null,
      };
      if (res.error) result.Message = res.error.message;
      else result.Token = res.result.token;

      console.log("login", result);
      return result;
    });
  }

  setNetworkSettings(networkMode) {
    const data = {
      jsonrpc: "2.0",
      method: "SetNetworkSettings",
      params: {
        NetworkMode: +networkMode,
        NetselectionMode: 0,
      },
      id: "4.7",
    };

    return this.linkZoneRequest(data).then((res) => {
      console.log("setNetworkSettings", JSON.stringify(res));
    });
  }

  connect() {
    const data = {
      jsonrpc: "2.0",
      method: "Connect",
      id: "3.2",
    };

    return this.linkZoneRequest(data).then(
      (res) => {
        // if(res.error)
        //   return newError(res.error.message, "500")

        return this.sleep(5000).then((r) => {
          console.log("finish connect", res);
          return res;
        });
      },
      (err) => {
        console.log("error connect", err);
      }
    );
  }

  disconnect() {
    const data = {
      jsonrpc: "2.0",
      method: "DisConnect",
      id: "3.2",
    };

    return this.linkZoneRequest(data).then((res) => {
      return this.sleep(5000).then((r) => {
        console.log("finish disconnect", res);
        return res;
      });
    });
  }

  getConnectionState() {
    const data = {
      jsonrpc: "2.0",
      method: "GetConnectionState",
      id: "3.1",
    };
    return this.linkZoneRequest(data).then((res) => {
      const state = {
        ConnectionStatus: res?.result?.ConnectionStatus,
      };
      console.log("getConnectionState", state);
      return state;
    });
  }

  async setNetwork(networkMode) {
    return this.getConnectionState().then((res) => {
      if (res.ConnectionStatus == 2) {
        // si esta conectado
        return this.disconnect().then((res) => {
          this.setNetworkSettings(networkMode).then((res) => {
            this.connect().then((res) => {
              console.log("finish setNetwork");
            });
          });
        });
      }
      return this.setNetworkSettings(networkMode).then((res) => {
        console.log("finish setNetwork");
      });
    });
  }

  sendUSSD(code, ussdType) {
    const data = {
      jsonrpc: "2.0",
      method: "SendUSSD",
      params: {
        UssdContent: code,
        UssdType: +ussdType,
      },
      id: "8.1",
    };
    return this.linkZoneRequest(data).then((res) => {
      console.log("sendUSSD", res);
      return res;
    });
  }

  setUSSDEnd(code, ussdType) {
    const data = {
      jsonrpc: "2.0",
      method: "SetUSSDEnd",
      id: "8.3",
    };
    return this.linkZoneRequest(data).then((res) => {
      console.log("setUSSDEnd", res);
      return res;
    });
  }

  getUSSDSendResult() {
    const data = {
      jsonrpc: "2.0",
      method: "GetUSSDSendResult",
      id: "8.2",
    };

    return this.linkZoneRequest(data).then((res) => {
      const result = {
        UssdType: res?.result?.UssdType,
        SendState: res?.result?.SendState,
        UssdContent: res?.result?.UssdContent,
      };
      console.log("getUSSDSendResult", result);
      return result;
    });
  }

  sendUssdCode(code, ussdType) {
    return this.sendUSSD(code, ussdType).then((res) => {
      return this.sleep(5000).then((res) => {
        return this.getUSSDSendResult().then((res) => {
          console.log("sendUssdCode", res);
          return res;
        });
      });
    });
  }

  getSmsInbox() {
    const data = {
      jsonrpc: "2.0",
      method: "GetSMSContactList",
      params: { Page: 0 },
      id: "6.2",
    };

    return this.linkZoneRequest(data).then((res) => {
      console.log(res);
      const result = {
        Messages: res?.result?.SMSContactList || [],
        Count: res?.result?.SMSContactList?.length || 0,
      };
      console.log("getSmsInbox", result);
      return result;
    });
  }

  getSmsStorageState() {
    const data = {
      jsonrpc: "2.0",
      method: "GetSMSStorageState",
      params: null,
      id: "6.4",
    };
    return this.linkZoneRequest(data).then((res) => {
      // console.log(res.result);
      const result = {
        LeftCount: res?.result?.LeftCount,
        TotalSms: res?.result?.MaxCount,
        UnreadSMSCount: res?.result?.UnreadSMSCount,
      };
      console.log("getSmsStorageState", result);
      return result;
    });
  }

  getSmsContent(contactId, page = 0) {
    const data = {
      jsonrpc: "2.0",
      method: "GetSMSContentList",
      params: {
        ContactId: contactId,
        Page: page,
      },
      id: "6.3",
    };

    return this.linkZoneRequest(data).then((res) => {
      console.log("getSmsContent", res);
      const result = {
        Messages: res?.result?.SMSContentList || [],
        Count: res?.result?.SMSContentList?.length || 0,
      };
      console.log("getSmsContent result", result);
      return result;
    });
  }

  deleteSms(ContactId, SMSId) {
    const data = {
      jsonrpc: "2.0",
      method: "DeleteSMS",
      params: { DelFlag: 2, ContactId: ContactId, SMSId: SMSId },
      id: "6.5",
    };

    console.log({ data });

    return this.linkZoneRequest(data).then((res) => {
      console.log("deleteSms", res);
      return res;
    });
  }
}
