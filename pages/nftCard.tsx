import { Nft } from "alchemy-sdk";
import { useState } from "react";

export const NFTCard = ({ nft }: { nft: Nft }) => {
    const [isCopied, setCopied] = useState(false);

    const copyAddressToClipBoard = (address: string) => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 3000)
    }
    
    return (
        <div className="w-1/4 flex flex-col ">
        <div className="rounded-md">
            <img className="object-cover h-128 w-full rounded-t-md" src={nft.media[0]?.gateway} ></img> 
            {
                /* nft.metadata.image is also the way, but maybe the external_url prop in metadata can be a problem, or something else... anyway, the "media" word is more general, to start with
                todo: investigate this */
            }
        </div>
        <div className="flex flex-col y-gap-2 px-2 py-3 bg-slate-100 rounded-b-md h-110 ">
            <div className="">
                <h2 className="text-xl text-gray-800 overflow-hidden text-ellipsis">{nft.title}</h2>
                <p className="text-gray-600 overflow-hidden text-ellipsis">Id: {nft.tokenId}</p>
                <div className="flex flex-row">
                    <p className="text-gray-600 overflow-hidden text-ellipsis" >{`${nft.contract.address.substr(0, 4)}...${nft.contract.address.substr(nft.contract.address.length - 4)}`}</p>
                    <button className="ml-2 mr-2" onClick={() => copyAddressToClipBoard(nft.contract.address)}>
                        <img src="https://cdn-icons-png.flaticon.com/512/1621/1621635.png" width={16} height={16}></img>
                    </button>
                    { isCopied && <span className="text-green-600">Copied!</span>}
                </div>
            </div>

            <div className="flex-grow mt-2">
                <p className="text-gray-600 overflow-hidden text-ellipsis h-20 overflow-y-auto">{nft.description}</p>
            </div>
            <div className="flex justify-center mb-1">
                <a target={"_blank"} href={`https://etherscan.io/token/${nft.contract.address}`} className="mt-3 py-2 px-4 bg-blue-500 w-5/6 text-center rounded text-white cursor-pointer">View on Etherscan</a>
            </div>
        </div>

    </div>
    )
}