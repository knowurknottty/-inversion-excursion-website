import { Keypair } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';

const MNEMONIC = 'know render cup shy mirror strong fit multiply step physical era fantasy';

// Derive Solana wallet from seed phrase
const seed = mnemonicToSeedSync(MNEMONIC);
const derived = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
const keypair = Keypair.fromSeed(derived.key);

console.log('Solana Wallet Derived:');
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Private Key (base64):', Buffer.from(keypair.secretKey).toString('base64'));
console.log('');
console.log('Ready for Jupiter trading');