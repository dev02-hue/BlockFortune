type CryptoType = 'BTC' | 'ETH' | 'USDT_TRC20' | 'TRX' | 'SOL'
type CryptoNetworks = Record<CryptoType, string>

type CryptoWallets = Record<CryptoType, string>

export const CRYPTO_WALLETS: CryptoWallets = {
    BTC: 'bc1qblockfortunewallet12345xyz',
    ETH: '0xBlockFortuneWalletAddressETH',
    USDT_TRC20: 'TBlockFortuneTRC20WalletAddress',
    TRX: 'TBlockFortuneTRXWalletAddress',
    SOL: 'BlockFortuneSOLWalletAddress123'
  }


// Supported cryptocurrencies with their wallet addresses


export const CRYPTO_NETWORKS: CryptoNetworks = {
  BTC: 'Bitcoin Network',
  ETH: 'Ethereum (ERC20)',
  USDT_TRC20: 'USDT (TRC20)',
  TRX: 'Tron (TRX)',
  SOL: 'Solana'
}