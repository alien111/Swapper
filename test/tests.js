const { expect } = require("chai");

describe("Swapper", function () {

	let signers, swapper, AToken, BToken, CToken, ATokenAddress, BTokenAddress, CTokenAddress, SwapperCF, TokenCF, swapperAddress;

	it("Should deploy AToken, BToken, CToken and Swapper", async function () {

		signers = await ethers.getSigners();

		SwapperCF = await ethers.getContractFactory("Swapper");
		TokenCF = await ethers.getContractFactory("Token");

		AToken = await TokenCF.deploy("STA", "SwapperTokenA", signers[0].address);
		ATokenAddress = AToken.address;

		BToken = await TokenCF.deploy("STB", "SwapperTokenB", signers[0].address);
		BTokenAddress = BToken.address;

		swapper = await SwapperCF.deploy();
		swapperAddress = swapper.address;

		CToken = new ethers.Contract(await swapper.CToken(), TokenCF.interface, signers[0]);
		CTokenAddress = CToken.address;

		expect(ethers.utils.isAddress(swapperAddress)).to.be.true;
		expect(ethers.utils.isAddress(ATokenAddress)).to.be.true;
		expect(ethers.utils.isAddress(BTokenAddress)).to.be.true;
		expect(ethers.utils.isAddress(CTokenAddress)).to.be.true;

	});

	it("Should swap 100 tokens A for C", async function () {

		expect((await AToken.allowance(signers[0].address, swapperAddress)).toString()).to.equal('0');
		const ans = await AToken.approve(swapperAddress, '100000000000000000000');
		await ans.wait();
		expect((await AToken.allowance(signers[0].address, swapperAddress)).toString()).to.equal('100000000000000000000');

		expect((await AToken.balanceOf(signers[0].address)).toString()).to.equal('1000000000000000000000');
		expect((await CToken.balanceOf(signers[0].address)).toString()).to.equal('0');

		const ans1 = await swapper.swap(ATokenAddress, '100000000000000000000');
		await ans1.wait();

		expect((await AToken.balanceOf(signers[0].address)).toString()).to.equal('900000000000000000000');
		expect((await CToken.balanceOf(signers[0].address)).toString()).to.equal('100000000000000000000');

		expect((await AToken.balanceOf(swapperAddress)).toString()).to.equal('100000000000000000000');
		expect((await CToken.balanceOf(swapperAddress)).toString()).to.equal('900000000000000000000');

	});

	it("Should also swap 100 tokens B for C", async function () {

		expect((await BToken.allowance(signers[0].address, swapperAddress)).toString()).to.equal('0');
		const ans = await BToken.approve(swapperAddress, '100000000000000000000');
		await ans.wait();
		expect((await BToken.allowance(signers[0].address, swapperAddress)).toString()).to.equal('100000000000000000000');

		expect((await BToken.balanceOf(signers[0].address)).toString()).to.equal('1000000000000000000000');
		expect((await CToken.balanceOf(signers[0].address)).toString()).to.equal('100000000000000000000');

		const ans1 = await swapper.swap(BTokenAddress, '100000000000000000000');
		await ans1.wait();

		expect((await BToken.balanceOf(signers[0].address)).toString()).to.equal('900000000000000000000');
		expect((await CToken.balanceOf(signers[0].address)).toString()).to.equal('200000000000000000000');

		expect((await BToken.balanceOf(swapperAddress)).toString()).to.equal('100000000000000000000');
		expect((await CToken.balanceOf(swapperAddress)).toString()).to.equal('800000000000000000000');

	});

	it("Should change the exchange rate of C/A and C/B", async function() {

		expect((await swapper.getCTokenPrice()).toString()).to.equal('1');

		const ans = await swapper.setCTokenPrice(2);
		await ans.wait();

		expect((await swapper.getCTokenPrice()).toString()).to.equal('2');

	});

	it("Should unswap 50 tokens C for 100 B", async function() {

		expect((await CToken.allowance(signers[0].address, swapperAddress)).toString()).to.equal('0');
		const ans = await CToken.approve(swapperAddress, '50000000000000000000');
		await ans.wait();
		expect((await CToken.allowance(signers[0].address, swapperAddress)).toString()).to.equal('50000000000000000000');

		expect((await BToken.balanceOf(signers[0].address)).toString()).to.equal('900000000000000000000');
		expect((await CToken.balanceOf(signers[0].address)).toString()).to.equal('200000000000000000000');

		const ans1 = await swapper.unswap(BTokenAddress, '50000000000000000000');
		await ans1.wait();

		expect((await BToken.balanceOf(signers[0].address)).toString()).to.equal('1000000000000000000000');
		expect((await CToken.balanceOf(signers[0].address)).toString()).to.equal('150000000000000000000');

		expect((await BToken.balanceOf(swapperAddress)).toString()).to.equal('0');
		expect((await CToken.balanceOf(swapperAddress)).toString()).to.equal('850000000000000000000');

	});

});



