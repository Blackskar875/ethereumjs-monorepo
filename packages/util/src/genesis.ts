import { addHexPrefix, bigIntToHex } from './bytes.ts'
import { isHexString } from './internal.ts'

import type { PrefixedHexString } from './types.ts'

export type StoragePair = [key: PrefixedHexString, value: PrefixedHexString]

export type AccountState = [
  balance: PrefixedHexString,
  code: PrefixedHexString,
  storage: Array<StoragePair>,
  nonce: PrefixedHexString,
]

/**
 * If you are using a custom chain {@link Common}, pass the genesis state.
 *
 * Pattern 1 (with genesis state see {@link GenesisState} for format):
 *
 * ```javascript
 * {
 *   '0x0...01': '0x100', // For EoA
 * }
 * ```
 *
 * Pattern 2 (with complex genesis state, containing contract accounts and storage).
 * Note that in {@link AccountState} there are two
 * accepted types. This allows to easily insert accounts in the genesis state:
 *
 * A complex genesis state with Contract and EoA states would have the following format:
 *
 * ```javascript
 * {
 *   '0x0...01': '0x100', // For EoA
 *   '0x0...02': ['0x1', '0xRUNTIME_BYTECODE', [[storageKey1, storageValue1], [storageKey2, storageValue2]]] // For contracts
 * }
 * ```
 */
export interface GenesisState {
  [key: string]: PrefixedHexString | AccountState
}

/**
 * Parses the geth genesis state into Blockchain {@link GenesisState}
 * @param json representing the `alloc` key in a Geth genesis file
 */
export function parseGethGenesisState(json: any) {
  const state: GenesisState = {}
  for (const address of Object.keys(json.alloc)) {
    let { balance, code, storage, nonce } = json.alloc[address]
    // create a map with lowercase for easy lookups
    const prefixedAddress = addHexPrefix(address.toLowerCase())
    balance = isHexString(balance) ? balance : bigIntToHex(BigInt(balance))
    code = code !== undefined ? addHexPrefix(code) : undefined
    storage = storage !== undefined ? Object.entries(storage) : undefined
    nonce = nonce !== undefined ? addHexPrefix(nonce) : undefined
    state[prefixedAddress] = [balance, code, storage, nonce]
  }
  return state
}
