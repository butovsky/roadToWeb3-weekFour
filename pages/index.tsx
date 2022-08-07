import type { NextPage } from 'next'
import { useState } from 'react'
import { NFTCard } from './nftCard';
import InfiniteScroll from 'react-infinite-scroller';
// using SDK instead of URLs for better type-checks and also for convenience (anyway SDK does construct URL all the same)
// great sdk btw
import alchemy from './init/alchemy';
import { Nft } from 'alchemy-sdk';

const Home: NextPage = () => {
  const [wallet, setWalletAddress] = useState('');
  const [collection, setCollectionAddress] = useState('');
  const [isFetchingWallet, setFetchingWallet] = useState(false);
  const [isFetchingCollections, setFetchingCollections] = useState(false); // optional for getNFTs
  const [NFTs, setNFTs] = useState<Nft[]>([]);
  const [nextPageKey, setNextPageKey] = useState('');
  const [fetchFunction, setFetchFunction] = useState<any>();

  const handleFetch = async () => {

    setNextPageKey('');
    setNFTs([]);
    setFetchFunction(null);
    
    let newFetchFunction: any;

    if (isFetchingWallet) {
      newFetchFunction = async (pageKey: string) => {
        const options: { pageKey?: string; contractAddresses?: string[] } = {};
        pageKey && (options.pageKey = pageKey);
        isFetchingCollections && (options.contractAddresses = [collection])
        return await alchemy.nft.getNftsForOwner(wallet, options)
      }
    } else if (isFetchingCollections) {
      newFetchFunction = async (pageKey: string) => {
        const options: { pageKey?: string } = {};
        pageKey && (options.pageKey = pageKey);

        return await alchemy.nft.getNftsForContract(collection, options)
      }
    } else {
      alert ('unknown problem')
      return
    }
    if (!!newFetchFunction) {
      setFetchFunction(() => newFetchFunction);
      await fetchNFTs({ fetchData: newFetchFunction, pageKey: '', isResettingNFTs: true });
    }
  }

  const fetchNFTs = async({
    fetchData=fetchFunction,
    pageKey=nextPageKey,
    isResettingNFTs=false
  }) => {
    if (!!fetchData) {
      try {
        const data = await fetchData(pageKey);
        if (data) {
          const { nfts, ownedNfts } = data;
          const fetchedNfts: Nft[] = nfts ? nfts : (ownedNfts ? ownedNfts : []);
          setNextPageKey(data.pageKey);
          setNFTs([...(isResettingNFTs ? [] : NFTs), ...fetchedNfts]);
        } else {
          console.log('no data from fetch')
        }
      } catch (e) {
        alert(e);
      }
    } else {
      console.log("could not initialize fetch function");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-y-3">
      <h1 className='font-sans text-2xl font-black'>Welcome to the NFT gallery!</h1>
      <div className="flex flex-col w-full justify-center items-center gap-y-2">
        <div className='flex-row space-x-4'>
        { isFetchingWallet && <input className="bg-slate-100 font-sans w-80 h-10 text-center rounded" type={"text"} value={wallet} onChange={(e) => setWalletAddress(e.target.value)}placeholder="Add your wallet address"></input> }
        { isFetchingCollections && <input className="bg-slate-100 font-sans w-80 h-10 text-center rounded" type={"text"} value={collection} onChange={(e) => setCollectionAddress(e.target.value)}placeholder="Add the collection address"></input> }
        </div>
        <div className='flex-row space-x-4'>
          <label className="text-gray-600 "><input type={"checkbox"} checked={isFetchingWallet} onChange={() => setFetchingWallet(!isFetchingWallet)} className="mr-2"></input>Fetch for wallet</label>
          <label className="text-gray-600 "><input type={"checkbox"} checked={isFetchingCollections} onChange={() => setFetchingCollections(!isFetchingCollections)} className="mr-2"></input>Fetch for collection</label>
        </div>
        <button onClick={handleFetch} className={"disabled:bg-slate-500 text-white bg-blue-400 px-4 py-2 mt-3 rounded-sm w-1/5"} disabled={!isFetchingWallet && !isFetchingCollections}>Let's go! </button>
      </div>
        <InfiniteScroll
          loadMore={() => fetchNFTs({})}
          hasMore={!!nextPageKey}
          className='flex flex-wrap gap-y-12 mt-4 w-5/6 gap-x-2 justify-center'
        >
          {
            NFTs?.length ? NFTs.map(nft => {
              return (
                <NFTCard nft={nft}></NFTCard>
              )
            }) : null
          }
        </InfiniteScroll>
    </div>
  )
}

export default Home
