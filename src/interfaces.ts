export interface Member {
    from: string
    to: string
    memo: string
}

export interface Transaction {
  chain_id: string;
  expiration: string;
  ref_block_num: number;
  ref_block_prefix: number;
  max_net_usage_words: number;
  max_cpu_usage_ms: number;
  delay_sec: number;
  context_free_actions: any[];
  actions: Action[];
  transaction_extensions: any[];
  signatures: any[];
  context_free_data: any[];
}

export interface Action {
  account: string;
  name: string;
  authorization: Authorization[];
  data: string;
}

export interface Authorization {
  actor: string;
  permission: string;
}