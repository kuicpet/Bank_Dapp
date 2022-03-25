import { useEffect, useState } from 'react'
import { ethers, utils } from 'ethers'
import abi from './contracts/Bank.json'

const App = () => {
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [isBankOwner, setIsBankOwner] = useState(false)
  const [bankOwnerAddress, setBankOwnerAddress] = useState(null)
  const [inputValue, setInputValue] = useState({
    withdraw: '',
    deposit: '',
    bankName: '',
  })
  const [customerTotalBal, setCustomerTotalBal] = useState(null)
  const [currentBankName, setCurrentBankName] = useState(null)
  const [customerAddress, setCustomerAddress] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const contractAddress = '0xd47aFa75b77f0E3cF792E676f295194FbAb74853'
  const contractABI = abi.abi

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        const account = accounts[0]
        setIsWalletConnected(true)
        setCustomerAddress(account)
        console.log('Account Connected: ', account)
      } else {
        setError('Please install a MetaMask wallet to use our bank')
        console.log('No MetaMask detected')
      }
    } catch (error) {
      console.log(error)
    }
  }
  const getBankName = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        let bankName = await bankContract.bankName()
        bankName = utils.parseBytes32String(bankName)
        setCurrentBankName(bankName.toString())
      } else {
        console.log('Ethereum object not found,Please install MetaMask!')
        setError('Please install a MetaMask wallet to use our bank')
      }
    } catch (error) {
      console.log(error)
    }
  }
  const setBankNameHandler = async (e) => {
    e.preventDefault()
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        const txn = await bankContract.setBankName(
          utils.formatBytes32String(inputValue.bankName)
        )
        setLoading(true)
        console.log('Setting bank Name...')
        await txn.wait()
        console.log('Bank Name Changed')
        setLoading(false)
        await getBankName()
      } else {
        console.log('Ethereum object not found,Please install MetaMask!')
        setError('Please install a MetaMask wallet to use our bank')
      }
    } catch (error) {
      console.log(error)
    }
  }
  const getBankOwnerHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )
        let owner = await bankContract.bankOwner()
        setBankOwnerAddress(owner)

        const [account] = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        if (owner.toLowerCase() === account.toLowerCase()) {
          setIsBankOwner(true)
        }
      } else {
        console.log('Ethereum object not found,Please install MetaMask!')
        setError('Please install a MetaMask wallet to use our bank')
      }
    } catch (error) {
      console.log(error)
    }
  }
  const customerBalanceHandler = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let balance = await bankContract.getCustomerBalance()
        setCustomerTotalBal(utils.formatEther(balance))
        console.log('Retrieved balance...', balance)
      } else {
        console.log('Ethereum object not found,Please install MetaMask!')
        setError('Please install a MetaMask wallet to use our bank')
      }
    } catch (error) {
      console.log(error)
    }
  }
  const depositMoneyHandler = async (e) => {
    try {
      e.preventDefault()
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        const txn = await bankContract.depositMoney({
          value: ethers.utils.parseEther(inputValue.deposit),
        })
        console.log('depositing money...')
        await txn.wait()
        console.log('Deposited money...', txn.hash)
        customerBalanceHandler()
      } else {
        console.log('Ethereum object not found,Please install MetaMask!')
        setError('Please install a MetaMask wallet to use our bank')
      }
    } catch (error) {
      console.log(error)
    }
  }
  const withDrawMoneyHandler = async (e) => {
    try {
      e.preventDefault()
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const bankContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        )

        let myAddress = await signer.getAddress()
        console.log('provider signer...', myAddress)

        const txn = await bankContract.withDrawMoney(
          myAddress,
          ethers.utils.parseEther(inputValue.withdraw)
        )
        console.log('Withdrawing money...')
        await txn.wait()
        console.log('Money with drawn...', txn.hash)
        customerBalanceHandler()
      } else {
        console.log('Ethereum object not found,Please install MetaMask!')
        setError('Please install a MetaMask wallet to use our bank')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleInputChange = (e) => {
    setInputValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  useEffect(() => {
    checkIfWalletIsConnected()
    getBankName()
    getBankOwnerHandler()
    customerBalanceHandler()
  })

  return (
    <div className='min-h-screen gradient-bg-welcome container text-center'>
      <h2 className='text-3xl sm:text-5xl text-white text-gradient py-1'>
        Bank Contract Project
      </h2>
      <section className='flex flex-col w-full justify-center items-center'>
        {error && <p className='text-white font-light text-base'>{error}</p>}
        <div className='flex flex-col justify-center'>
          {currentBankName === '' && isBankOwner ? (
            <p className='text-white font-light text-base'>
              Setup the name of your Bank
            </p>
          ) : (
            <p className='text-white font-light mt-4 text-2xl mb-2'>
              {currentBankName}
            </p>
          )}
        </div>
        <div className='flex flex-col flex-1 mt-5 mb-0'>
          <form>
            <input
              type='text'
              onChange={handleInputChange}
              name='deposit'
              placeholder='0.0000 ETH'
              value={inputValue.deposit}
              className='my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism'
            />
            <button className='text-white mt-2 bg-[#2952e3] px-4 py-1 justify-center items-center' onClick={depositMoneyHandler}>
              Deposit Money in ETH
            </button>
          </form>
        </div>
        <div className='flex flex-col flex-1 mt-7 mb-9'>
          <form>
            <input
              type='text'
              onChange={handleInputChange}
              name='withdraw'
              placeholder='0.0000 ETH'
              value={inputValue.withdraw}
              className='my-2 w-full rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism'
            />
            <button className='text-white mt-2 bg-[#2952e3] px-4 py-1 justify-center items-center' onClick={withDrawMoneyHandler}>
              Withdraw Money in ETH
            </button>
          </form>
        </div>
        <div className='flex flex-col'>
          <p className='text-white font-light text-base'>
            Customer Balance: {customerTotalBal} ETH
          </p>
        </div>
        <div>
          <p className='text-white font-light text-base m-2'>
            Bank Owner Address :
            {bankOwnerAddress &&
              `${bankOwnerAddress.slice(0, 5)}...${bankOwnerAddress.slice(
                bankOwnerAddress.length - 4
              )}`}
          </p>
        </div>
        <div className='flex flex-col flex-1 mt-7 mb-9'>
          {isWalletConnected && (
            <p className='text-white font-light text-base'>
              Your Wallet Address :{' '}
              {customerAddress &&
                `${customerAddress.slice(0, 5)}...${customerAddress.slice(
                  customerAddress.length - 4
                )}`}
            </p>
          )}
          <button className='flex flex-row justify-center items-center my-5 bg-[#2952e3] p-3 cursor-pointer hover:bg-[#2546bd] text-white font-semibold text-base'>
            {isWalletConnected ? 'Wallet Connected 🔒' : 'Connect Wallet 🔑'}
          </button>
        </div>
      </section>
      {isBankOwner && (
        <section className='flex flex-col w-full justify-center items-center'>
          <h2 className='text-2xl sm:text-5xl text-white text-gradient py-1'>
            Bank Admin Panel
          </h2>
          <div className='flex flex-col flex-1 mt-7 mb-9'>
            <form>
              <input
                type='text'
                onChange={handleInputChange}
                name='bankName'
                placeholder='Enter a Name for Your Bank'
                value={inputValue.bankName}
                className='w-full my-2 rounded-sm p-2 outline-none bg-transparent text-white text-sm white-glassmorphism'
              />
              <button className='text-white mt-2 bg-[#2952e3] px-4 py-1 justify-center items-center' onClick={setBankNameHandler}>
              {loading ? 'Setting Bank Name ...': 'Set Bank Name'}
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  )
}

export default App
