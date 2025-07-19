type CryptoType = 'BTC' | 'ETH' | 'USDT_TRC20' | 'TRX' | 'SOL'
type CryptoNetworks = Record<CryptoType, string>

type CryptoWallets = Record<CryptoType, string>

export const CRYPTO_WALLETS: CryptoWallets = {
    BTC: 'bc1qj4mtv03yma5nc6f93ukxcp8wcgq6a30ehc0996',
    ETH: '0x4441c131480e0b57D125a6D20B68e6e559018Eb1',
    USDT_TRC20: 'TYnqsXXnZoAZ1hNfKA6m4McKrGhzT4WZFR',
    TRX: 'TUzEmBCw6zyYme44iVizwSoJg2vCMUnFh4',
    SOL: 'GBhsDrD73ZrfsgRokHxMndJmxcV5wFyp2iSL3cr4eyhz'
  }


 

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
