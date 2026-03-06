const { Keypair } = require('@solana/web3.js');
const { mnemonicToSeedSync } = require('bip39');
const { derivePath } = require('ed25519-hd-key');

const MNEMONIC = 'know render cup shy mirror strong fit multiply step physical era fantasy';

// Derive Solana wallet from seed phrase (BIP-44, path: m/44'/501'/0'/0')
const seed = mnemonicToSeedSync(MNEMONIC);
const derived = derivePath("m/44'/501'/0'/0'", seed.toString('hex'));
const keypair = Keypair.fromSeed(derived.key.slice(0, 32));

console.log('=== Solana Wallet Derived ===');
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Seed Phrase: [SECURED]');
console.log('');
console.log('Use this address to receive SOL and tokens');