# EOSN Torch 🔥

This library creates a multi-account MSIG transaction which pre-approves the TORCH token transfer.

## Configure

**eosn-torch.config.json**

```json
{
    "contract": "passthetorch",
    "quantity": "1 TORCH",
    "proposer": "eosnationftw",
    "proposalName": "torch",
    "executor": "eosnationftw",
    "delaySec": 180,
    "expiration": 604800
}
```

**eosn-torch.members.json**

```json
[
    {"account": "eosnationftw", "memo": "EOSN 🔥 Building Our Future One Torch at a Time"}
    ...
]
```

## Quickstart

```bash
$ npm start
```