import { toast } from 'react-toastify';


export const withToast = async (promiseToResolve) => {
    toast.promise(
        promiseToResolve,
        {
            pending: {
                render() {
                    return <div className='p-6 py-2 text-sm'>
                        Your transaction is being processed !
                    </div>
                },
            },
            success: {
                render({ data }) {
                    return (
                        <div>
                            <p className='font-bold'>Tx: {data.transactionHash.slice(0, 20)}...</p>
                            <p className='text-sm'>Has been successfully processed!</p>
                            <a href={`https://ropsten.etherscan.io/tx/${data.transactionHash}`}
                                rel='noreferrer'
                                target='_blank'
                            >
                                <i className='text-indigo-600 text-sm'>See Tx Details</i>
                            </a>
                        </div>
                    )
                },
                // other options
                icon: "✅",
            },
            error: {
                render({ data }) {
                    // When the promise reject, data will contains the error
                    return <div className='text-sm'>{data.message ?? 'Transaction has failed!'}</div>
                }
            }
        }, {
        position: toast.POSITION.BOTTOM_LEFT,
    }
    )

}