/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/forecast_exchange.json`.
 */
export type ForecastExchange = {
  address: '7pieeTMBuiNzryBsLFiz2NJ75t3Ht3dxzJ25tSEuLUA1';
  metadata: {
    name: 'forecastExchange';
    version: '0.1.0';
    spec: '0.1.0';
    description: 'Created with Anchor';
  };
  instructions: [
    {
      name: 'addAdmin';
      discriminator: [177, 236, 33, 205, 124, 152, 55, 186];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'owner';
          signer: true;
          relations: ['tokenState'];
        },
      ];
      args: [
        {
          name: 'admin';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'allowTransfer';
      discriminator: [4, 44, 125, 192, 210, 123, 149, 54];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'transferPermission';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                ];
              },
              {
                kind: 'arg';
                path: 'from';
              },
              {
                kind: 'arg';
                path: 'to';
              },
            ];
          };
        },
        {
          name: 'owner';
          writable: true;
          signer: true;
          relations: ['tokenState'];
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'from';
          type: 'pubkey';
        },
        {
          name: 'to';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'burn';
      discriminator: [116, 110, 29, 56, 107, 219, 42, 93];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'authority';
          signer: true;
        },
        {
          name: 'user';
        },
        {
          name: 'mint';
          writable: true;
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'userState';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: 'account';
                path: 'user';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'buyUsdp';
      discriminator: [177, 33, 89, 83, 64, 35, 111, 96];
      accounts: [
        {
          name: 'buyer';
          writable: true;
          signer: true;
        },
        {
          name: 'owner';
        },
        {
          name: 'exchangeState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
        {
          name: 'usdtMint';
        },
        {
          name: 'usdpMint';
        },
        {
          name: 'buyerUsdtAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'buyer';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdtMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'buyerUsdpAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'buyer';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdpMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'ownerUsdtAccount';
          writable: true;
        },
        {
          name: 'ownerUsdpAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'disallowTransfer';
      discriminator: [29, 29, 251, 175, 100, 18, 154, 196];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'transferPermission';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                ];
              },
              {
                kind: 'arg';
                path: 'from';
              },
              {
                kind: 'arg';
                path: 'to';
              },
            ];
          };
        },
        {
          name: 'owner';
          signer: true;
          relations: ['tokenState'];
        },
      ];
      args: [
        {
          name: 'from';
          type: 'pubkey';
        },
        {
          name: 'to';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'freezeAccount';
      discriminator: [253, 75, 82, 133, 167, 238, 43, 130];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'authority';
          signer: true;
        },
        {
          name: 'user';
        },
        {
          name: 'userState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: 'account';
                path: 'user';
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: 'initializeExchange';
      discriminator: [224, 105, 116, 166, 228, 207, 96, 19];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'exchangeState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
        {
          name: 'usdtMint';
        },
        {
          name: 'usdpMint';
        },
        {
          name: 'ownerUsdtAccount';
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdtMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'ownerUsdpAccount';
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdpMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'exchangeFeeBps';
          type: 'u16';
        },
      ];
    },
    {
      name: 'initializeToken';
      discriminator: [38, 209, 150, 50, 190, 117, 16, 54];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'mint';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [109, 105, 110, 116];
              },
            ];
          };
        },
        {
          name: 'ownerTokenAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'owner';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'mint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'tokenState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
        {
          name: 'associatedTokenProgram';
          address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';
        },
        {
          name: 'systemProgram';
          address: '11111111111111111111111111111111';
        },
      ];
      args: [
        {
          name: 'totalSupply';
          type: 'u64';
        },
      ];
    },
    {
      name: 'pauseExchange';
      discriminator: [92, 51, 107, 8, 202, 117, 228, 187];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'exchangeState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: 'pauseToken';
      discriminator: [226, 150, 72, 211, 159, 51, 226, 39];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'owner';
          signer: true;
          relations: ['tokenState'];
        },
      ];
      args: [];
    },
    {
      name: 'removeAdmin';
      discriminator: [74, 202, 71, 106, 252, 31, 72, 183];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'owner';
          signer: true;
          relations: ['tokenState'];
        },
      ];
      args: [
        {
          name: 'admin';
          type: 'pubkey';
        },
      ];
    },
    {
      name: 'sellUsdp';
      discriminator: [125, 136, 144, 210, 236, 25, 167, 106];
      accounts: [
        {
          name: 'seller';
          writable: true;
          signer: true;
        },
        {
          name: 'owner';
        },
        {
          name: 'exchangeState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
        {
          name: 'usdtMint';
        },
        {
          name: 'usdpMint';
        },
        {
          name: 'sellerUsdtAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'seller';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdtMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'sellerUsdpAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'seller';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdpMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'ownerUsdtAccount';
          writable: true;
        },
        {
          name: 'ownerUsdpAccount';
          writable: true;
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'takePoint';
      discriminator: [113, 58, 5, 123, 226, 171, 123, 193];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'authority';
          signer: true;
        },
        {
          name: 'user';
        },
        {
          name: 'userTokenAccount';
          writable: true;
        },
        {
          name: 'destinationTokenAccount';
          writable: true;
        },
        {
          name: 'userState';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: 'account';
                path: 'user';
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'transferOwnership';
      discriminator: [65, 177, 215, 73, 53, 45, 99, 47];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'newOwner';
        },
        {
          name: 'exchangeState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
        {
          name: 'usdtMint';
        },
        {
          name: 'usdpMint';
        },
        {
          name: 'newOwnerUsdtAccount';
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'newOwner';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdtMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'newOwnerUsdpAccount';
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'newOwner';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdpMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
      ];
      args: [];
    },
    {
      name: 'transferRestricted';
      discriminator: [164, 181, 84, 158, 163, 182, 181, 41];
      accounts: [
        {
          name: 'from';
          writable: true;
          signer: true;
        },
        {
          name: 'to';
        },
        {
          name: 'fromTokenAccount';
          writable: true;
        },
        {
          name: 'toTokenAccount';
          writable: true;
        },
        {
          name: 'transferPermission';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114,
                  95,
                  112,
                  101,
                  114,
                  109,
                  105,
                  115,
                  115,
                  105,
                  111,
                  110,
                ];
              },
              {
                kind: 'account';
                path: 'from';
              },
              {
                kind: 'account';
                path: 'to';
              },
            ];
          };
        },
        {
          name: 'fromUserState';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: 'account';
                path: 'from';
              },
            ];
          };
        },
        {
          name: 'toUserState';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: 'account';
                path: 'to';
              },
            ];
          };
        },
        {
          name: 'tokenState';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [116, 111, 107, 101, 110, 95, 115, 116, 97, 116, 101];
              },
            ];
          };
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'amount';
          type: 'u64';
        },
      ];
    },
    {
      name: 'unfreezeAccount';
      discriminator: [28, 255, 156, 206, 139, 228, 5, 213];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'authority';
          signer: true;
        },
        {
          name: 'user';
        },
        {
          name: 'userState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [117, 115, 101, 114, 95, 115, 116, 97, 116, 101];
              },
              {
                kind: 'account';
                path: 'user';
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: 'unpauseExchange';
      discriminator: [64, 15, 66, 250, 37, 120, 189, 56];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'exchangeState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
      ];
      args: [];
    },
    {
      name: 'unpauseToken';
      discriminator: [108, 117, 62, 30, 200, 92, 255, 202];
      accounts: [
        {
          name: 'tokenState';
          writable: true;
        },
        {
          name: 'owner';
          signer: true;
          relations: ['tokenState'];
        },
      ];
      args: [];
    },
    {
      name: 'updateFee';
      discriminator: [232, 253, 195, 247, 148, 212, 73, 222];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'exchangeState';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
      ];
      args: [
        {
          name: 'newFeeBps';
          type: 'u16';
        },
      ];
    },
    {
      name: 'withdrawFees';
      discriminator: [198, 212, 171, 109, 144, 215, 174, 89];
      accounts: [
        {
          name: 'owner';
          writable: true;
          signer: true;
        },
        {
          name: 'exchangeState';
          pda: {
            seeds: [
              {
                kind: 'const';
                value: [101, 120, 99, 104, 97, 110, 103, 101];
              },
            ];
          };
        },
        {
          name: 'usdtMint';
        },
        {
          name: 'usdpMint';
        },
        {
          name: 'ownerUsdtAccount';
          writable: true;
        },
        {
          name: 'ownerUsdpAccount';
          writable: true;
        },
        {
          name: 'recipientUsdtAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'recipient';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdtMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'recipientUsdpAccount';
          writable: true;
          pda: {
            seeds: [
              {
                kind: 'account';
                path: 'recipient';
              },
              {
                kind: 'const';
                value: [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169,
                ];
              },
              {
                kind: 'account';
                path: 'usdpMint';
              },
            ];
            program: {
              kind: 'const';
              value: [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89,
              ];
            };
          };
        },
        {
          name: 'recipient';
        },
        {
          name: 'tokenProgram';
          address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
        },
      ];
      args: [
        {
          name: 'usdtAmount';
          type: 'u64';
        },
        {
          name: 'usdpAmount';
          type: 'u64';
        },
      ];
    },
  ];
  accounts: [
    {
      name: 'exchangeState';
      discriminator: [227, 194, 255, 253, 114, 95, 0, 25];
    },
    {
      name: 'tokenState';
      discriminator: [218, 112, 6, 149, 55, 186, 168, 163];
    },
    {
      name: 'transferPermission';
      discriminator: [35, 184, 168, 68, 12, 211, 213, 97];
    },
    {
      name: 'userState';
      discriminator: [72, 177, 85, 249, 76, 167, 186, 126];
    },
  ];
  events: [
    {
      name: 'exchangePaused';
      discriminator: [137, 117, 89, 221, 45, 6, 36, 234];
    },
    {
      name: 'exchangeUnpaused';
      discriminator: [47, 203, 144, 190, 138, 133, 198, 198];
    },
    {
      name: 'feeUpdated';
      discriminator: [228, 75, 43, 103, 9, 196, 182, 4];
    },
    {
      name: 'feesWithdrawn';
      discriminator: [234, 15, 0, 119, 148, 241, 40, 21];
    },
    {
      name: 'ownershipTransferred';
      discriminator: [172, 61, 205, 183, 250, 50, 38, 98];
    },
    {
      name: 'usdpBought';
      discriminator: [203, 83, 218, 0, 242, 36, 198, 13];
    },
    {
      name: 'usdpSold';
      discriminator: [206, 75, 44, 126, 21, 49, 253, 29];
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'programPaused';
      msg: 'Program is paused';
    },
    {
      code: 6001;
      name: 'transferNotAllowed';
      msg: 'Transfer not allowed';
    },
    {
      code: 6002;
      name: 'unauthorizedAccess';
      msg: 'Unauthorized access';
    },
    {
      code: 6003;
      name: 'accountFrozen';
      msg: 'Account is frozen';
    },
    {
      code: 6004;
      name: 'tooManyAdmins';
      msg: 'Too many admins';
    },
    {
      code: 6005;
      name: 'cannotRemoveOwner';
      msg: 'Cannot remove owner';
    },
    {
      code: 6006;
      name: 'exchangePaused';
      msg: 'Exchange is paused';
    },
    {
      code: 6007;
      name: 'invalidAmount';
      msg: 'Invalid amount';
    },
    {
      code: 6008;
      name: 'insufficientBalance';
      msg: 'Insufficient balance';
    },
    {
      code: 6009;
      name: 'insufficientReserve';
      msg: 'Insufficient reserve';
    },
    {
      code: 6010;
      name: 'feeToHigh';
      msg: 'Fee too high';
    },
    {
      code: 6011;
      name: 'overflow';
      msg: 'Overflow error';
    },
    {
      code: 6012;
      name: 'missingDelegateApproval';
      msg: 'Missing delegate approval - user must approve authority as delegate';
    },
    {
      code: 6013;
      name: 'insufficientDelegatedAmount';
      msg: 'Insufficient delegated amount - user must approve more tokens';
    },
  ];
  types: [
    {
      name: 'exchangePaused';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pausedBy';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'exchangeState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'usdtMint';
            type: 'pubkey';
          },
          {
            name: 'usdpMint';
            type: 'pubkey';
          },
          {
            name: 'ownerUsdtAccount';
            type: 'pubkey';
          },
          {
            name: 'ownerUsdpAccount';
            type: 'pubkey';
          },
          {
            name: 'exchangeFeeBps';
            type: 'u16';
          },
          {
            name: 'isPaused';
            type: 'bool';
          },
          {
            name: 'totalVolumeTraded';
            type: 'u64';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'exchangeUnpaused';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'unpausedBy';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'feeUpdated';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'oldFee';
            type: 'u16';
          },
          {
            name: 'newFee';
            type: 'u16';
          },
        ];
      };
    },
    {
      name: 'feesWithdrawn';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'usdtAmount';
            type: 'u64';
          },
          {
            name: 'usdpAmount';
            type: 'u64';
          },
          {
            name: 'recipient';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'ownershipTransferred';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'oldOwner';
            type: 'pubkey';
          },
          {
            name: 'newOwner';
            type: 'pubkey';
          },
        ];
      };
    },
    {
      name: 'tokenState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'owner';
            type: 'pubkey';
          },
          {
            name: 'mint';
            type: 'pubkey';
          },
          {
            name: 'isPaused';
            type: 'bool';
          },
          {
            name: 'admins';
            type: {
              vec: 'pubkey';
            };
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'transferPermission';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'from';
            type: 'pubkey';
          },
          {
            name: 'to';
            type: 'pubkey';
          },
          {
            name: 'isAllowed';
            type: 'bool';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
    {
      name: 'usdpBought';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'buyer';
            type: 'pubkey';
          },
          {
            name: 'usdtAmount';
            type: 'u64';
          },
          {
            name: 'usdpAmount';
            type: 'u64';
          },
          {
            name: 'feeAmount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'usdpSold';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'seller';
            type: 'pubkey';
          },
          {
            name: 'usdpAmount';
            type: 'u64';
          },
          {
            name: 'usdtAmount';
            type: 'u64';
          },
          {
            name: 'feeAmount';
            type: 'u64';
          },
        ];
      };
    },
    {
      name: 'userState';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'isFrozen';
            type: 'bool';
          },
          {
            name: 'bump';
            type: 'u8';
          },
        ];
      };
    },
  ];
};
