import axios, { AxiosInstance } from "axios";
import bs58 from "bs58";
import type { MessageSignerWalletAdapter } from "@solana/wallet-adapter-base";

import { ContractSettingsclusterUrls } from "../constants/api";

interface AuthData {
  walletAddress: string;
  signature: string;
  authMessage: string;
}

export interface ContractSettingsRequest {
  contractAddress: string;
  transaction: string;
  contractSettings: ContractSettings;
}

interface ContractSettings {
  notificationEmail: string;
}

export default class SettingsClient {
  private client: AxiosInstance;

  private signer: MessageSignerWalletAdapter | null;

  constructor(wallet: MessageSignerWalletAdapter | null, cluster: string) {
    this.client = axios.create({
      baseURL: ContractSettingsclusterUrls[cluster],
      headers: {
        "Content-type": "application/json",
      },
    });
    this.signer = wallet;
  }

  getWalletAddress(): string {
    return this.signer?.publicKey?.toBase58() ? this.signer.publicKey?.toBase58() : "";
  }

  private async getAuthData(): Promise<AuthData> {
    const signMessage = "Sign this message to approve notifying the recipient.";
    const signature = await this.signer?.signMessage(new TextEncoder().encode(signMessage));
    return {
      walletAddress: this.getWalletAddress(),
      signature: bs58.encode(signature ? signature : []),
      authMessage: signMessage,
    };
  }

  async createContractSettings(data: ContractSettingsRequest[]) {
    const authData = await this.getAuthData();
    const requestData = { ...authData, data: data };
    console.log(requestData);
    return this.client.post("/v1/api/contracts/settings/batch", requestData);
  }
}
