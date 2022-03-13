import Image from 'next/image'
import React from 'react'
import { USD_COURSE_PRICE, useEthPrice } from "@components/hooks/useEthPrice";
import { Loader } from '@components/ui/common';

function EthRates() {

    const { eth } = useEthPrice();

    return (
        <div className="grid grid-cols-4 mb-5">
            <div className="flex flex-1 items-stretch text-center">
                <div className="p-10 border drop-shadow rounded-md">
                    <div className='flex align-center'>
                        {!eth.data ?
                            <div className='w-full flex justify-center'>
                                <Loader />
                            </div>
                            :
                            <>
                                <Image
                                    layout='fixed'
                                    height='35'
                                    width='35'
                                    src='/small-eth.webp'
                                    alt=''
                                />
                                <span className="text-2xl font-bold">= {eth.data}$</span>
                            </>}
                    </div>
                    <p className="text-xl text-gray-500">Current eth Price</p>
                </div>
            </div>
            <div className="flex flex-1 items-stretch text-center">
                <div className="p-10 border drop-shadow rounded-md">
                    {
                        !eth.ethPerItem ?
                            <div className='w-full flex justify-center'>
                                <Loader />
                            </div>
                            :
                            <>
                                <div>
                                    <span className="text-2xl font-bold">{eth.ethPerItem}ETH = {USD_COURSE_PRICE}$</span>
                                </div>
                                <p className="text-xl text-gray-500">Price per course</p>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default EthRates