import { tokens, EVM_REVERT } from './helpers'

require('chai')
	.use(require('chai-as-promised'))
	.should()

const Exchange = artifacts.require('./Exchange')

contract('Exchange', ([deployer, feeAccount]) => {
	let exchange
	const feePercent = 1

	beforeEach(async () => {
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
}) //: Contract









