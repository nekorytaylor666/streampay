import http from "./http-common";
import { ContractSettingsRequest } from "./types";


class NotificationService {
  action: any;

  constructor(action: any) {
    this.action = action;
  }

  async createNotification(data: ContractSettingsRequest) {
    let signed = await this.sign();
    console.log(signed);
    return http.post<any>("/contracts/settings", data);
  }

  private async sign() {
    let message = "Sign this message for authenticating with your wallet. Nonce: test";
    return await this.action(new TextEncoder().encode(message));
  }
}
export default NotificationService;
