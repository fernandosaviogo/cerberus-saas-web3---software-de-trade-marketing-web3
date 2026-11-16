import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseEther } from "viem";

import { network } from "hardhat";

const { viem, networkHelpers } = await network.create();

describe("CerberusPay tests", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await viem.getWalletClients();

    const cerberusCoin = await viem.deployContract("CerberusCoin");
    const cerberusPay = await viem.deployContract("CerberusPay");

    await cerberusPay.write.setAcceptedToken([cerberusCoin.address]);

    await cerberusCoin.write.mint([
      otherAccount.account.address,
      parseEther("1"),
    ]);

    return { owner, otherAccount, cerberusPay, cerberusCoin };
  }

  it("deploys test", async function () {
    const { cerberusPay } = await networkHelpers.loadFixture(deployFixture);

    assert.ok(cerberusPay.address);
  });

  it("Should allow another payment after 30 days", async function () {
    const { otherAccount, cerberusPay, cerberusCoin } =
      await networkHelpers.loadFixture(deployFixture);

    await cerberusCoin.write.approve(
      [cerberusPay.address, parseEther("0.01")],
      { account: otherAccount.account },
    );

    await viem.assertions.emit(
      cerberusPay.write.pay([otherAccount.account.address]),
      cerberusPay,
      "Paid",
    );
  });

  it("Should NOT do first payment", async function () {
    const { otherAccount, cerberusPay, cerberusCoin } =
      await networkHelpers.loadFixture(deployFixture);

    await viem.assertions.revertWith(
      cerberusPay.write.pay([otherAccount.account.address]),
      "Insufficient balance or allowance for payment",
    );
  });

  it("Should do first payment", async function () {
    const { otherAccount, cerberusPay, cerberusCoin } =
      await networkHelpers.loadFixture(deployFixture);

    await cerberusCoin.write.approve(
      [cerberusPay.address, parseEther("0.01")],
      { account: otherAccount.account },
    );

    await cerberusPay.write.pay([otherAccount.account.address]);

    await networkHelpers.time.increase(31 * 24 * 60 * 60);

    await viem.assertions.emit(
      cerberusPay.write.pay([otherAccount.account.address]),
      cerberusPay,
      "Paid",
    );
  });

  it("Should NOT do first payment", async function () {
    const { otherAccount, cerberusPay, cerberusCoin } =
      await networkHelpers.loadFixture(deployFixture);

    await cerberusCoin.write.approve(
      [cerberusPay.address, parseEther("0.01")],
      { account: otherAccount.account },
    );

    await cerberusPay.write.pay([otherAccount.account.address]);
    
    await networkHelpers.time.increase(31 * 24 * 60 * 60);

    await cerberusCoin.write.approve(
      [cerberusPay.address, parseEther("0.00001")],
      { account: otherAccount.account }
    );

    await viem.assertions.revertWith(
      cerberusPay.write.pay([otherAccount.account.address]),
      "Insufficient balance or allowance for payment",
    );
  });

  it("Should do second payment after failure", async function () {
    const { otherAccount, cerberusPay, cerberusCoin } =
      await networkHelpers.loadFixture(deployFixture);

    await cerberusCoin.write.approve(
      [cerberusPay.address, parseEther("0.01")],
      { account: otherAccount.account },
    );

    await cerberusPay.write.pay([otherAccount.account.address]);
    
    await networkHelpers.time.increase(31 * 24 * 60 * 60);

    await cerberusCoin.write.approve(
      [cerberusPay.address, parseEther("0.00001")],
      { account: otherAccount.account }
    );

    await viem.assertions.revertWith(
      cerberusPay.write.pay([otherAccount.account.address]),
      "Insufficient balance or allowance for payment",
    );

    await cerberusCoin.write.approve(
      [cerberusPay.address, parseEther("1")],
      { account: otherAccount.account }
    );

    await viem.assertions.emit(
      cerberusPay.write.pay([otherAccount.account.address]),
      cerberusPay,
      "Paid",
    );
  });

  it("Should withdraw", async function () {
    const { owner, otherAccount, cerberusPay, cerberusCoin } =
      await networkHelpers.loadFixture(deployFixture);

    const value = await cerberusPay.read.mounthyAmount();

    await cerberusCoin.write.approve(
      [cerberusPay.address, value],
      { account: otherAccount.account },
    );

    await cerberusPay.write.pay([otherAccount.account.address]);

    assert.equal(
      await cerberusCoin.read.balanceOf([cerberusPay.address]),
      value,
    );

    await cerberusPay.write.withdraw([value]);

    assert.equal(await cerberusCoin.read.balanceOf([cerberusPay.address]), 0n);
    assert.equal(
      await cerberusCoin.read.balanceOf([owner.account.address]),
      parseEther("1000") + value,
    );
  });
});
