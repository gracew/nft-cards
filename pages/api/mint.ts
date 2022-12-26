import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import type { NextApiRequest, NextApiResponse } from 'next';
import ERC721NFT from "../../ERC721NFT.json";
import { supabase } from "./supabase";

// @ts-ignore
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");

const INFURA_ID = "a71874bbcb6a450398f24a7bbd436eda";
const provider = new ethers.providers.InfuraProvider(process.env.NEXT_PUBLIC_NETWORK || "goerli", INFURA_ID)
const mainnetProvider = new ethers.providers.InfuraProvider("homestead", INFURA_ID);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!, ERC721NFT.abi, signer);

async function resolveAddress(address: string) {
  const resolved = await mainnetProvider.lookupAddress(address);
  return resolved || address;
}

async function getRecipientWalletAddress(card: any) {
  if (card.recipient_wallet_address) {
    return card.recipient_wallet_address;
  }
  // join snaps.id on recipient_emails table on users table
  const { data, error } = await supabase
    .rpc('lookup_wallet_address_from_email', { snaps_id: card.id });
  if (error || !data || data.length === 0) {
    return undefined;
  }
  return data;
}

export async function mint(id: string) {
  const snapsRes = await supabase
    .rpc('get_snaps_with_sender', { snaps_id: id });

  if (snapsRes.error) {
    console.log("could not fetch snaps with sender", snapsRes.error);
    return;
  }
  if (!snapsRes.data || snapsRes.data.length === 0) {
    console.log("could not fetch snaps with sender");
    return;
  }

  const snaps = snapsRes.data[0];
  if (!snaps.note || !snaps.category) {
    console.log("incomplete snap");
    return;
  }

  const recipientAddress = await getRecipientWalletAddress(snaps);
  if (!recipientAddress) {
    console.log("missing recipient wallet address");
    return;
  }

  const sender = snaps.sender_wallet_address
    ? await resolveAddress(snaps.sender_wallet_address)
    : snaps.sender_fname;
  const metadata: Record<string, string> = {
    //name: TODO fill in
    description: `${snaps.note}

From: ${sender}`,
    //image: TODO hardcode. is this the right syntax?
    image_url: `https://ipfs.infura.io/ipfs/ID`,
  };
  const metadataResult = await client.add(JSON.stringify(metadata));
  const url = `https://ipfs.infura.io/ipfs/${metadataResult.path}`;
  console.log(`metadata url for snaps ${snaps.id}: ${url}`);

  if (snaps.minted_at || snaps.created_transaction) {
    // avoid double minting
    return snaps;
  }
  await supabase
    .from("snaps")
    .update({
      created_transaction: true,
    })
    .eq('id', snaps.id);
  const transaction = await contract.mintToCaller(recipientAddress, url, { gasPrice: ethers.utils.parseUnits('50', 'gwei'), gasLimit: 500_000 });
  const tx = await transaction.wait();
  const event = tx.events[0];
  console.log("transaction event: ", event);
  const tokenId = event.args[2].toNumber();
  console.log("token id: ", tokenId);

  const { data, error } = await supabase
    .from("snaps")
    .update({
      minted_at: new Date().toISOString(),
      minted_token_id: tokenId,
    })
    .eq('id', snaps.id);
  if (error || !data || data.length === 0) {
    console.log("failed to update mint status", error);
    return;
  }
  return data[0];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const snaps = await mint(req.body.id);
  if (!snaps) {
    res.status(500).end();
    return;
  }
  res.status(200).json(snaps);
}
