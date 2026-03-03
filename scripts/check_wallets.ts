import { Keypair, Connection, clusterApiUrl } from '@solana/web3.js';
import { mnemonicToSeedSync } from 'bip39';
import { derivePath } from 'ed25519-hd-key';

// My wallet (with funds)
const MY_MNEMONIC = 'blast minimum card embrace fire swear because pretty orange essay abandon always';
const MY_SEED = mnemonicToSeedSync(MY_MNEMONIC);
const MY_DERIVED = derivePath("m/44'/501'/0'/0'", MY_SEED.toString('hex'));
const MY_KEYPAIR = Keypair.fromSeed(MY_DERIVED.key.slice(0, 32));

console.log('My Wallet (with funds):');
console.log('Address:', MY_KEYPAIR.publicKey.toBase58());

// User's wallet (from Trust Wallet seed)
const USER_MNEMONIC = 'know render cup shy mirror strong fit multiply step physical era fantasy';
const USER_SEED = mnemonicToSeedSync(USER_MNEMONIC);
const USER_DERIVED = derivePath("m/44'/501'/0'/0'", USER_SEED.toString('hex'));
const USER_KEYPAIR = Keypair.fromSeed(USER_DERIVED.key.slice(0, 32));

console.log('\nUser Wallet (Trust Wallet):');
console.log('Address:', USER_KEYPAIR.publicKey.toBase58());

// Check balance
const connection = new Connection(clusterApiUrl('mainnet-beta'));
const balance = await connection.getBalance(MY_KEYPAIR.publicKey);
console.log('\nMy Balance:', balance / 1e9, 'SOL');