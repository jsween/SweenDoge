import { ether, tokens, EVM_REVERT, ETHER_ADDRESS } from './helpers'

require('chai')
	.use(require('chai-as-promised'))
	.should()

const Token = artifacts.require('./Token')
const Exchange = artifacts.require('./Exchange')

contract('Exchange', ([deployer, feeAccount, user1]) => {
	let token
	let exchange
	const feePercent = 1

	beforeEach(async () => {
		// Deploy tokens
		token = await Token.new()
		// Xfer to user 1
		token.transfer(user1, tokens(100), {from: deployer})
		// 
		exchange = await Exchange.new(feeAccount, feePercent)
	})

	describe('deployment', () => {
		it('tracks the fee account', async () => {
			const result = await exchange.feeAccount()
			result.should.equal(feeAccount)
		})

		it('tracks the fee percent', async () => {
			const result = await exchange.feePercent()
			result.toString().should.equal(feePercent.toString())
		})
	})//: Deployment

	describe('fallback', () => {
		it('reverts when Ether is sent', async () => {
			await exchange.sendTransaction({value: 1, from: user1}).should.be.rejectedWith(EVM_REVERT)
		})
	})//: Fallback

	describe('depositing Ether', async () => {
		let result
		let amount

		beforeEach(async () => {
			amount = ether(1)
				result = await exchange.depositEther({ from: user1, value: amount})
			})

		it('tracks the Ether deposit', async () => {
			const balance = await exchange.tokens(ETHER_ADDRESS, user1)
			balance.toString().should.equal(amount.toString())
		})

		it('emits a Deposit event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Deposit')
				const event = log.args
				event.token.toString().should.equal(ETHER_ADDRESS, 'ether address is correct')
				event.user.should.equal(user1, 'user address is correct')
				event.amount.toString().should.equal(amount.toString(), 'amount is correct')
				event.balance.toString().should.equal(amount.toString(), 'balance is correct')
			})
	})//: Depositing Ether

  describe('withdrawing Ether', () => {
   let result
   let amount

   beforeEach(async () => {
     // Deposit Ether first
     amount = ether(1)
     await exchange.depositEther({ from: user1, value: amount })
   })

   describe('success', () => {
     beforeEach(async () => {
       // Withdraw Ether
       result = await exchange.withdrawEther(amount, { from: user1 })
     })

     it('withdraws Ether funds', async () => {
       const balance = await exchange.tokens(ETHER_ADDRESS, user1)
       balance.toString().should.equal('0')
     })

     it('emits a Withdraw event', () => {
       const log = result.logs[0]
       log.event.should.eq('Withdraw')
       const event = log.args
       event.token.should.equal(ETHER_ADDRESS)
       event.user.should.equal(user1)
       event.amount.toString().should.equal(amount.toString())
       event.balance.toString().should.equal('0')
     })
   })

   describe('failure', () => {
     it('rejects withdraws for insufficient balances', async () => {
       await exchange.withdrawEther(ether(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
     })
   })
  })//: Withdrawing Ether

	describe('depositing tokens', () => {
		let result
		let amount

		describe('success', async () => {
			beforeEach(async () => {
				amount = tokens(10)
				await token.approve(exchange.address, amount, {from: user1})
				result = await exchange.depositToken(token.address, amount, {from:user1})
			})
			it('tracks the token deposit', async() => {
				// check exchange token balance
				let balance = await token.balanceOf(exchange.address)
				balance.toString().should.equal(amount.toString())
				balance = await exchange.tokens(token.address, user1)
				balance.toString().should.equal(balance.toString())
			})

			it('emits a Deposit event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Deposit')
				const event = log.args
				event.token.toString().should.equal(token.address, 'token address is correct')
				event.user.should.equal(user1, 'user address is correct')
				event.amount.toString().should.equal(tokens(10).toString(), 'amount is correct')
				event.balance.toString().should.equal(tokens(10).toString(), 'balance is correct')
			})
		})

		describe('failure', async () => {
			it('rejects Ether deposits', async () => {
				await	exchange.depositToken(ETHER_ADDRESS, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT)
			})

			it('fails when no tokens are approved', async () => {
				// Don't approve any tokens before depositing
				await exchange.depositToken(token.address, amount, {from: user1}).should.be.rejectedWith(EVM_REVERT)
			})
		})
	})//: Depositing Tokens

	describe('withdrawing tokens', () => {
   let result
   let amount

   describe('success', async () => {
	   beforeEach(async () => {
	     // Deposit tokens first
	     amount = tokens(10)
	     await token.approve(exchange.address, amount, {from: user1})
	     await exchange.depositToken(token.address, amount, {from: user1})
	     // Withdraw tokens
	     result = await exchange.withdrawToken(token.address, amount, {from: user1})
	   })

     it('withdraws token funds', async () => {
       const balance = await exchange.tokens(token.address, user1)
       balance.toString().should.equal('0')
     })

     it('emits a Withdraw event', () => {
       const log = result.logs[0]
       log.event.should.eq('Withdraw')
       const event = log.args
       event.token.should.equal(token.address)
       event.user.should.equal(user1)
       event.amount.toString().should.equal(amount.toString())
       event.balance.toString().should.equal('0')
     })
   })

   describe('failure', () => {
   	it('rejects ETHER withdraws', async () => {
       await exchange.withdrawToken(ETHER_ADDRESS, tokens(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
     })

     it('rejects withdraws for insufficient balances', async () => {
       await exchange.withdrawToken(token.address, tokens(100), { from: user1 }).should.be.rejectedWith(EVM_REVERT)
     })
   })
  })//: Withdrawing tokens

  describe('checking balances', () => {
  	let amount = ether(1)
   	beforeEach(async () => {
    	await exchange.depositEther({ from: user1, value: amount })
   	})

   	it('returns user balance', async () => {
     	const result = await exchange.balanceOf(ETHER_ADDRESS, user1)
     	result.toString().should.equal(amount.toString())
   	})
  })//: Checking Balances
}) //: Contract




