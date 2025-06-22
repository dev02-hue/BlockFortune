type CryptoType = 'BTC' | 'ETH' | 'USDT_TRC20' | 'TRX' | 'SOL'

type CryptoWallets = Record<CryptoType, string>

export const CRYPTO_WALLETS: CryptoWallets = {
    BTC: 'bc1qblockfortunewallet12345xyz',
    ETH: '0xBlockFortuneWalletAddressETH',
    USDT_TRC20: 'TBlockFortuneTRC20WalletAddress',
    TRX: 'TBlockFortuneTRXWalletAddress',
    SOL: 'BlockFortuneSOLWalletAddress123'
  }