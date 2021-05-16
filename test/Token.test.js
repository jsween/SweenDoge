import { tokens, EVM_REVERT } from './helpers'

require('chai')
	.use(require('chai-as-promised'))
	.should()


const Token = artifacts.require('./Token')

contract('Token', ([deployer, sender, receiver, exchange]) => {
	let token
	const name = 'SweenDoge'
	const symbol = 'SWE'
	const decimals = '18'
	const totalSupply = tokens(1000000).toString()

	beforeEach(async () => {
		// 1. Fetch token from blockhain
		token = await Token.new()
	})

	describe('deployment', () => {

		it('tracks the name', async () => {
			// Read token name here...
			const result = await token.name()
			result.should.equal(name)
		})

		it('tracks the symbol', async() => {
			const result = await token.symbol()
			result.should.equal(symbol)
		})

		it('tracks the decimals', async() => {
			const result = await token.decimals()
			result.toString().should.equal(decimals)
		})

		it('tracks the total supply ', async() => {
			const result = await token.totalSupply()
			result.toString().should.equal(totalSupply.toString())
		})

		it('assigns the total supply to the deployer ', async() => {
			const result = await token.balanceOf(deployer)
			result.toString().should.equal(totalSupply.toString())
		})
	})//: Deployment

	describe('sending tokens', () => {
		let amount 
		let result

		describe('success', async () => {
			beforeEach(async () => {
				amount = tokens(100)
				result = await token.transfer(receiver, amount, { from: deployer })
			})

			it('transfers token balances', async () => {
				let balanceOf

				// After transfer
				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())

				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})

			it('emits a Transfer event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Transfer')
				const event = log.args
				event.from.toString().should.equal(deployer, 'from is correct')
				event.to.should.equal(receiver, 'to is correct')
				event.value.toString().should.equal(amount.toString(), 'value is correct')
			})
		})

		describe('failure', async () => {

			it('rejects insufficient balances', async () => {
				let invalidAmount

				invalidAmount = tokens(100000000) // 100 million > total supply
				await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT)

				invalidAmount = tokens(10) // recipient has no tokens
				await token.transfer(receiver, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects invalid recipients', async () => {
				await token.transfer(0x0, amount, {from: deployer}).should.be.rejected
			})
		})
	})//: Sending Tokens

	describe('approving tokens', () => {
		let result
		let amount 

		beforeEach(async () => {
			amount = tokens(100)
			result = await token.approve(exchange, amount, {from: deployer}) 
		})

		describe('success', async () => {
			it('allocates an allowance for delegated token spending on exchange', async() => {
				const allowance = await token.allowance(deployer, exchange)
				allowance.toString().should.equal(amount.toString())
			})

			it('emits an Approval event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Approval')
				const event = log.args
				event.owner.toString().should.equal(deployer, 'owner is correct')
				event.spender.should.equal(exchange, 'spender is correct')
				event.value.toString().should.equal(amount.toString(), 'value is correct')
			})
		})

		describe('failure', async () => {
			it('rejects invalid spenders', async() => {
				await token.approve(0x0, amount, {from: deployer}).should.be.rejected	
			})
		})
	})//: Approving Tokens

	describe('delegated token transfers', () => {
		let amount 
		let result

		beforeEach(async () => {
			amount = tokens(100)
			await token.approve(exchange, amount, {from: deployer})
		})

		describe('success', async () => {
			beforeEach(async () => {
				result = await token.transferFrom(deployer, receiver, amount, { from: exchange })
			})

			it('transfers token balances', async () => {
				let balanceOf

				// After transfer
				balanceOf = await token.balanceOf(deployer)
				balanceOf.toString().should.equal(tokens(999900).toString())

				balanceOf = await token.balanceOf(receiver)
				balanceOf.toString().should.equal(tokens(100).toString())
			})

			it('resets the allowance', async () => {
				const allowance = await token.allowance(deployer, exchange)
				allowance.toString().should.equal('0')
			})

			it('emits a Transfer event', async () => {
				const log = result.logs[0]
				log.event.should.eq('Transfer')
				const event = log.args
				event.from.toString().should.equal(deployer, 'from is correct')
				event.to.should.equal(receiver, 'to is correct')
				event.value.toString().should.equal(amount.toString(), 'value is correct')
			})
		})

		describe('failure', async () => {
			it('rejects insufficient balances', async () => {
				// Attempt to transfer too many tokens
				const invalidAmount = tokens(1000000000) // 1 trillion > total supply
				await token.transferFrom(deployer, receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT)
			})

			it('rejects invalid recipients', async () => {
				await token.transferFrom(deployer, 0x0, amount, {from: exchange}).should.be.rejected
			})
		})//: failure 
	})//: Transfer From
}) //: Contract









