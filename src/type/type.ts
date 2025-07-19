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

export type UserProfile = {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  referral_code: string
  pendingWithdrawal: number
  activeDeposit: number
  withdrawalTotal: number
  earnedTotal: number
  balance: number
  usdtTrc20Address: string
  btcAddress: string
  usdtErc20Address: string
  ethAddress: string
  bnbAddress: string
  createdAt?: string
}

export type EditableProfileFields = {
  firstName?: string
  lastName?: string
  username?: string
  email?: string
  pendingWithdrawal?: number
  activeDeposit?: number
  withdrawalTotal?: number
  earnedTotal?: number
  balance?: number
  usdtTrc20Address?: string
  btcAddress?: string
  usdtErc20Address?: string
  ethAddress?: string
  bnbAddress?: string
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  count?: number
}
