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

	describe('depositing Ether', () => {
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
}) //: Contract









