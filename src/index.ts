import {
  AptosWalletErrorResult,
  NetworkName,
  PluginProvider,
} from "@aptos-labs/wallet-adapter-core";
import type {
  AccountInfo,
  AdapterPlugin,
  NetworkInfo,
  SignMessagePayload,
  SignMessageResponse,
  WalletName,
} from "@aptos-labs/wallet-adapter-core";
import { TxnBuilderTypes, Types } from "aptos";

interface OkxWindow extends Window {
  aptos?: PluginProvider;
}

declare const window: OkxWindow;

export const OkxWalletName = "OKX" as WalletName<"OKX">;

export class OkxWallet implements AdapterPlugin {
  readonly name = OkxWalletName;
  readonly url = "https://www.okx.com/web3";
  readonly icon =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAMAAADQmBKKAAAAVFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///+/v79AQECgoKCQkJAQEBAgICAwMDDf39/Pz8+Pj4/380QvAAAAEHRSTlMA3+9AIM+fcIAQf7+vUJCPrZ+0KwAAAdhJREFUeNrt3O1ugjAYhuG2fBQE5sunbDv/85wN0ZmMVtNFeNye+3+TKyAYTfuq1RKbZ9rI89JVbRP1YEluZJNM3tzXlAcjG6ZtisRx6UPoZmnZIZ34PEfZqfWLlGayW1m64tGyYzrF8jgRlueHKJPdy249BwHo+O1JBKLkCtr9A7SkS6Qb5ipQnrBLZrlEVmAqkD5BLuM8jQDlHrRcgMrPICNAGZiX4qUE6RlzWVULVLmqBKoM6S3k0kqwMmggeTHQaex8DVPswtMvQEPrb4xfGA/qWn9d9EKCCCKIIIIIIogggggiiCCCXhY0tv6G+IXxoGnofI2TzL2v8MJ4ULiP1tv7JLHFg/o20CzBtgf1Eowgggi6RhBBSwQRRNA1gghaIogggh5pRgMFf0rLvZ6ykaD3NXMjAf9BI4gggggiiCCCCCKIIIII+qcguI0Ep9B+gMiFn27hnzlGsUNY593O4R1WAji2fVuFdWZSpMY7Egh3aBLrMTOIB2+h7lmjsI4Ca+UqBCarXCXMJdKpwrpEhVoqQb7PNO6YDfUmABXIo1oARm2gjddBG0CkU/yRUXu+IN9eZezYuWJzkilKFSq18aR4Trhmu+F+jw8ctHWl5XkZneV2XfMFxCf3Ec1FG6QAAAAASUVORK5CYII=";

  // The wallet instance is injected in window.aptos
  readonly providerName = "aptos";

  deeplinkProvider(data: { url: string }): string {
    return `okx://wallet/dapp/details?dappUrl=${data.url}`;
  }

  // This is for mobile browser to open OKX wallet app
  // Detail about the deeplink of OKX wallet: https://www.okx.com/web3/build/docs/extension/create-deeplinks
  provider: PluginProvider | undefined =
    typeof window !== "undefined" ? window.aptos : undefined;

  async connect(): Promise<AccountInfo> {
    try {
      const accountInfo = await this.provider?.connect();
      if (!accountInfo) throw `${OkxWalletName} Address Info Error`;
      return accountInfo;
    } catch (error: any) {
      throw error;
    }
  }

  async account(): Promise<AccountInfo> {
    const response = await this.provider?.account();
    if (!response) throw `${OkxWalletName} Account Error`;
    return response;
  }

  async disconnect(): Promise<void> {
    try {
      await this.provider?.disconnect();
    } catch (error: any) {
      throw error;
    }
  }

  async signAndSubmitTransaction(
    transaction: Types.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const response = await this.provider?.signAndSubmitTransaction(
        transaction,
        options
      );
      if ((response as AptosWalletErrorResult).code) {
        throw new Error((response as AptosWalletErrorResult).message);
      }
      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async signAndSubmitBCSTransaction(
    transaction: TxnBuilderTypes.TransactionPayload,
    options?: any
  ): Promise<{ hash: Types.HexEncodedBytes }> {
    try {
      const response = await this.provider?.signAndSubmitTransaction(
        transaction,
        options
      );
      if ((response as AptosWalletErrorResult).code) {
        throw new Error((response as AptosWalletErrorResult).message);
      }
      return response as { hash: Types.HexEncodedBytes };
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async signMessage(message: SignMessagePayload): Promise<SignMessageResponse> {
    try {
      if (typeof message !== "object" || !message.nonce) {
        `${OkxWalletName} Invalid signMessage Payload`;
      }
      const response = await this.provider?.signMessage(message);
      if (response) {
        return response;
      } else {
        throw `${OkxWalletName} Sign Message failed`;
      }
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async network(): Promise<NetworkInfo> {
    try {
      const response = await this.provider?.network();
      if (!response) throw `${OkxWalletName} Network Error`;
      return {
        name: response as NetworkName,
      };
    } catch (error: any) {
      throw error;
    }
  }

  async onNetworkChange(callback: any): Promise<void> {
    try {
      const handleNetworkChange = async (newNetwork: {
        networkName: NetworkInfo;
      }): Promise<void> => {
        callback({
          name: newNetwork.networkName,
          chainId: undefined,
          api: undefined,
        });
      };
      await this.provider?.onNetworkChange(handleNetworkChange);
    } catch (error: any) {
      const errMsg = error.message;
      throw errMsg;
    }
  }

  async onAccountChange(callback: any): Promise<void> {
    try {
      const handleAccountChange = async (
        newAccount: AccountInfo
      ): Promise<void> => {
        if (newAccount?.publicKey) {
          callback({
            publicKey: newAccount.publicKey,
            address: newAccount.address,
          });
        } else {
          const response = await this.connect();
          callback({
            address: response?.address,
            publicKey: response?.publicKey,
          });
        }
      };
      await this.provider?.onAccountChange(handleAccountChange);
    } catch (error: any) {
      console.log(error);
      const errMsg = error.message;
      throw errMsg;
    }
  }
}
