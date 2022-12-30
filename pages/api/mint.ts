import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import type { NextApiRequest, NextApiResponse } from 'next';
import ERC721NFT from "../../ERC721NFT.json";
import { supabase } from "./supabase";

// @ts-ignore
const client = ipfsHttpClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from('2Jc3Hc1v2vJtAVQSbdpUBJxyrWO:' + process.env.INFURA_IPFS_SECRET).toString('base64'), }
});

const INFURA_ID = "a71874bbcb6a450398f24a7bbd436eda";
const provider = new ethers.providers.InfuraProvider(process.env.NEXT_PUBLIC_NETWORK || "goerli", INFURA_ID)
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!, ERC721NFT.abi, signer);

export async function mint(id: string, recipientAddress: string) {
  const { data, error } = await supabase
    .from("cards")
    .select("*")
    .eq('id', id);

  if (error) {
    console.log("could not fetch card", error);
    return;
  }
  if (!data || data.length === 0) {
    console.log("could not fetch card");
    return;
  }

  const card = data[0];

  const metadata: Record<string, string> = {
    description: `${card.note}`,
    //image: TODO hardcode. is this the right syntax?
    image_url: `ipfs://QmYUS3a34ZoS1srBsXvLbp9VkAmhLF7paqhq7aALrWs1G5`,
  };
  const metadataResult = await client.add(JSON.stringify(metadata));
  const url = `ipfs://${metadataResult.path}`;
  console.log(`metadata url for card ${card.id}: ${url}`);

  if (card.minted_at || card.created_transaction) {
    // avoid double minting
    return card;
  }
  await supabase
    .from("cards")
    .update({
      created_transaction: true,
    })
    .eq('id', card.id);
  const transaction = await contract.mintToCaller(recipientAddress, url, { gasPrice: ethers.utils.parseUnits('50', 'gwei'), gasLimit: 500_000 });
  const tx = await transaction.wait();
  const event = tx.events[0];
  console.log("transaction event: ", event);
  const tokenId = event.args[2].toNumber();
  console.log("token id: ", tokenId);

  const { data: updateData, error: updateError } = await supabase
    .from("cards")
    .update({
      minted_at: new Date().toISOString(),
      minted_token_id: tokenId,
    })
    .eq('id', card.id);
  if (updateError || !updateData || updateData.length === 0) {
    console.log("failed to update mint status", error);
    return;
  }
  return updateData[0];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const card = await mint(req.body.id, req.body.recipientAddress);
  if (!card) {
    res.status(500).end();
    return;
  }
  res.status(200).json(card);
}
