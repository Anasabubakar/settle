#!/usr/bin/env node
/**
 * A stand-in for the Freighter extension's key, for LOCAL TESTING ONLY.
 * Holds the throwaway testnet supporter key from .local-testnet/accounts.json and signs a transaction only when
 * it is a testnet transaction whose source is that supporter. Binds to 127.0.0.1. Never use it with a real key.
 */
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Keypair, Networks, TransactionBuilder } from '@stellar/stellar-sdk';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const accounts = JSON.parse(readFileSync(join(root, '.local-testnet/accounts.json'), 'utf8'));
if (accounts.network !== 'testnet') throw new Error('testnet accounts only');
const key = Keypair.fromSecret(accounts.supporter.secret);

createServer((req, res) => {
  const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'content-type': 'application/json' };
  if (req.method === 'OPTIONS') return res.writeHead(204, headers).end();
  if (req.method === 'GET' && req.url === '/address') return res.writeHead(200, headers).end(JSON.stringify({ address: key.publicKey() }));
  if (req.method === 'POST' && req.url === '/sign') {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      try {
        const { xdr } = JSON.parse(body);
        const tx = TransactionBuilder.fromXDR(xdr, Networks.TESTNET);
        if (tx.source !== key.publicKey()) throw new Error('not the supporter account');
        tx.sign(key);
        res.writeHead(200, headers).end(JSON.stringify({ signedXdr: tx.toXDR(), address: key.publicKey() }));
      } catch (error) {
        res.writeHead(400, headers).end(JSON.stringify({ error: String(error.message ?? error) }));
      }
    });
    return;
  }
  res.writeHead(404, headers).end('{}');
}).listen(8788, '127.0.0.1', () => console.log('test signer on http://127.0.0.1:8788'));
