require('chai')
	.use(require('chai-as-promised'))
	.should()

const Token = artifacts.require('./Token')
const name = 'SweenDoge'
const symbol = 'SWE'
const decimals = '18'
const totalSupply = '10000000000000000000000000'

contract('Token', (accounts) => {
	let token

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
			result.toString().should.equal(totalSupply)
		})

	})
})