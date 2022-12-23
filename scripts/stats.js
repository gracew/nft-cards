const fetch = require('node-fetch');
const { ethers } = require("ethers");
const fs = require('fs');

const INFURA_ID = "a71874bbcb6a450398f24a7bbd436eda";
const MAINNET_PROVIDER = new ethers.providers.InfuraProvider("homestead", INFURA_ID);
const POLYGON_PROVIDER = new ethers.providers.InfuraProvider("matic", INFURA_ID);

async function snapsIsFirstNft(address) {
    const polygonNfts = await fetch(
        `https://deep-index.moralis.io/api/v2/${address}/nft?chain=matic&format=decimal`,
        {
            headers: {
                "X-API-Key": process.env.MORALIS_KEY,
            },
        }
    ).then((res) => res.json());
    let earliestPolygonNft;
    polygonNfts.result.forEach((nft) => {
        if (earliestPolygonNft === undefined || earliestPolygonNft.block_number > nft.block_number) {
            earliestPolygonNft = nft;
        }
    })
    const polygonBlockDetails = await POLYGON_PROVIDER.getBlock(Number(earliestPolygonNft.block_number));

    if (earliestPolygonNft.token_address.toLowerCase() !== "0x967442D189Be3d4Dc6457115C1CA67F7d76D3330".toLowerCase()) {
        return false;
    }

    const ethNfts = await fetch(
        `https://deep-index.moralis.io/api/v2/${address}/nft?chain=eth&format=decimal`,
        {
            headers: {
                "X-API-Key": process.env.MORALIS_KEY,
            },
        }
    ).then((res) => res.json());
    if (ethNfts.total === 0) {
        return true;
    }

    let earliestNft;
    ethNfts.result.forEach((nft) => {
        if (earliestNft === undefined || earliestNft.block_number > nft.block_number) {
            earliestNft = nft;
        }
    })
    const blockDetails = await MAINNET_PROVIDER.getBlock(Number(earliestNft.block_number));
    if (blockDetails.timestamp > polygonBlockDetails.timestamp) {
        // we already know the contract address for the first polygon NFT is the snaps one
        return true;
    }
    return false;
}

async function readFile() {
    const allFileContents = fs.readFileSync('./scripts/addresses.txt', 'utf-8');
    let count = 0;
    const lines = allFileContents.split(/\r?\n/);
    for (var address of lines) {
        const res = await snapsIsFirstNft(address);
        if (res) {
            count++;
        }
    }
    console.log(count);
}

readFile();