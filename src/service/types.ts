export interface ContractSettingsRequest {
  contract_address: string;
  tx: string;
  contract_settings: ContractSettings;
}

export interface ContractSettings {
  notification_email: any;
}

export interface AuthRequest {
  wallet_address: string;
  signature: string;
  auth_message: string;
}
