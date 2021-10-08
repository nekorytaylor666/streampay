const idl = {
  version: "0.0.0",
  name: "timelock",
  instructions: [
    {
      name: "create",
      accounts: [
        {
          name: "pda",
          isMut: true,
          isSigner: true,
        },
        {
          name: "pdaTokenAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "depositor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "depositorTokenAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "beneficiary",
          type: "publicKey",
        },
        {
          name: "depositedAmount",
          type: "u64",
        },
        {
          name: "start",
          type: "u64",
        },
        {
          name: "end",
          type: "u64",
        },
        {
          name: "period",
          type: "u64",
        },
        {
          name: "nonce",
          type: "u8",
        },
        {
          name: "cliff",
          type: {
            option: "u64",
          },
        },
        {
          name: "cliffAmount",
          type: {
            option: "u64",
          },
        },
      ],
    },
    {
      name: "withdraw",
      accounts: [
        {
          name: "pda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pdaTokenAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pdaSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "beneficiaryTokenAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "beneficiary",
          isMut: false,
          isSigner: true,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
    {
      name: "cancel",
      accounts: [
        {
          name: "pda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pdaTokenAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "pdaSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "depositor",
          isMut: false,
          isSigner: true,
        },
        {
          name: "depositorTokenAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "beneficiary",
          isMut: false,
          isSigner: false,
        },
        {
          name: "beneficiaryTokenAcc",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "transfer",
      accounts: [
        {
          name: "pda",
          isMut: true,
          isSigner: false,
        },
        {
          name: "beneficiary",
          isMut: false,
          isSigner: true,
        },
        {
          name: "newBeneficiary",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "VestingContract",
      type: {
        kind: "struct",
        fields: [
          {
            name: "depositor",
            type: "publicKey",
          },
          {
            name: "beneficiary",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "pdaTokenAcc",
            type: "publicKey",
          },
          {
            name: "start",
            type: "u64",
          },
          {
            name: "end",
            type: "u64",
          },
          {
            name: "period",
            type: "u64",
          },
          {
            name: "depositedAmount",
            type: "u64",
          },
          {
            name: "withdrawn",
            type: "u64",
          },
          {
            name: "nonce",
            type: "u8",
          },
          {
            name: "cliff",
            type: {
              option: "u64",
            },
          },
          {
            name: "cliffAmount",
            type: {
              option: "u64",
            },
          },
          {
            name: "fee",
            type: {
              option: {
                defined: "FeeTier",
              },
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "FeeTier",
      type: {
        kind: "enum",
        variants: [
          {
            name: "Free",
          },
          {
            name: "LowestFee",
          },
          {
            name: "LowFee",
          },
          {
            name: "NormalFee",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 300,
      name: "InvalidSchedule",
      msg: "Invalid schedule.",
    },
    {
      code: 301,
      name: "ZeroAmount",
      msg: "Amount must be greater than 0.",
    },
  ],
};

export default idl;
