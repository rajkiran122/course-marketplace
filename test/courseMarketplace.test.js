const CourseMarketPlace = artifacts.require('CourseMarketplace');
const { catchRevert } = require('./utils/exceptions')

const toBN = val => web3.utils.toBN(val);

const getGas = async result => {
    const tx = await web3.eth.getTransaction(result.tx);
    const gasUsed = toBN(result.receipt.gasUsed);
    const gasPrice = toBN(tx.gasPrice);
    const gas = gasUsed.mul(gasPrice);
    return gas;
}

const getBalance = address => web3.eth.getBalance(address);


contract('CourseMarketplace', accounts => {
    const courseId = '0x00000000000000000000000000003130'
    const proof = '0x0000000000000000000000000000313000000000000000000000000000003130'
    const value = '900000000'

    const courseId2 = '0x00000000000000000000000000002130'
    const proof2 = '0x0000000000000000000000000000213000000000000000000000000000002130'

    let _contract = null
    let contractOwner = null
    let buyer = null
    let courseHash;

    before(async () => {
        _contract = await CourseMarketPlace.deployed()
        contractOwner = accounts[0]
        buyer = accounts[1]
    })

    // Puchasing the course
    describe('Purchase new course', () => {

        before(async () => {
            await _contract.purchaseCourse(courseId, proof, {
                from: buyer,
                value,
            })
        })

        it('should NOT allow to repurchase already owned course', async () => {
            await catchRevert(_contract.purchaseCourse(courseId, proof, {
                from: buyer,
                value,
            }))
        });


        it('can get the purchased course hash by index', async () => {
            const index = 0
            courseHash = await _contract.getCourseHashAtIndex(index)

            const expectedHash = web3.utils.soliditySha3(
                { type: 'bytes16', value: courseId },
                { type: 'address', value: buyer },
            )

            assert.equal(courseHash, expectedHash, 'Course hash is not matching!')
        });

        it('should match the purchased data of the course', async () => {
            const expectedIndex = 0
            const expectedState = 0
            const course = await _contract.getCourseByHash(courseHash)

            assert.equal(course.id, expectedIndex, 'Course index should be 0!')
            assert.equal(course.price, value, `Course price should be ${value}`)
            assert.equal(course.proof, proof, `Course proof should be ${proof}!`)
            assert.equal(course.owner, buyer, `Course owner should be ${buyer}!`)
            assert.equal(course.state, expectedState, `Course state should be ${expectedState}!`)
        });

    });


    // Activating the purchased course
    describe('Activate the purchased course', async () => {

        it('should NOT be able to activate course except contract owner', async () => {
            await catchRevert(_contract.activateCourse(courseHash, {
                from: buyer
            }));
        });

        before(async () => {
            await _contract.activateCourse(courseHash, {
                from: contractOwner,
            });
        });

        it('should have activated state', async () => {
            const course = await _contract.getCourseByHash(courseHash);
            const expectedState = 1;

            assert.equal(course.state, expectedState, "Course should have 'activated' state")
        });

    });


    // Testing transferOwnership 
    describe('Transfer the contract ownership', async () => {

        let currentOwner = null

        before(async () => {
            currentOwner = await _contract.getContractOwner()
        })

        it('getContractOwner should return deployer address', async () => {
            assert(contractOwner, currentOwner, 'Contract owner is not matching the current owner')
        });

        it('only contract owner can transfer ownership', async () => {
            await catchRevert(_contract.transferOwnership(accounts[3], { from: accounts[4] }));
        });

        it("should transfer ownership to 3rd address from 'accounts'", async () => {
            await _contract.transferOwnership(accounts[2], { from: currentOwner });
            const owner = await _contract.getContractOwner();
            assert(owner, accounts[2], 'Contract owner is not the third account')
        });

        it("should transfer ownership back to initial contract owner", async () => {
            await _contract.transferOwnership(contractOwner, { from: accounts[2] });
            const owner = await _contract.getContractOwner();
            assert(owner, contractOwner, 'Contract owner is not set!')
        });

    });


    // Testing deactivate course
    describe('Deactivate Course', async () => {
        let courseHash2 = null
        let currentOwner = null

        before(async () => {
            await _contract.purchaseCourse(courseId2, proof2, { from: buyer, value });
            courseHash2 = await _contract.getCourseHashAtIndex(1);
            currentOwner = await _contract.getContractOwner()
        })

        it('should NOT be able to deactivate course except contract owner', async () => {
            await catchRevert(_contract.deActivateCourse(courseHash2, { from: buyer, value }))
        });



        it('should have status of deactivated and price 0', async () => {

            const beforeTxBuyerBalance = await getBalance(buyer);
            const beforeTxContractBalance = await getBalance(_contract.address);
            const beforeTxOwnerBalance = await getBalance(currentOwner);

            const result = await _contract.deActivateCourse(courseHash2, { from: contractOwner });

            const afterTxBuyerBalance = await getBalance(buyer);
            const afterTxContractBalance = await getBalance(_contract.address);
            const afterTxOwnerBalance = await getBalance(currentOwner);

            const gas = await getGas(result);

            const course = await _contract.getCourseByHash(courseHash2);
            const expectedState = 2;
            const expectedPrice = 0;

            assert.equal(course.state, expectedState, 'Course is NOT deactivated!');
            assert.equal(course.price, expectedPrice, 'Course price is NOT 0!');

            assert.equal(
                toBN(beforeTxBuyerBalance).add(toBN(value)).toString(),
                afterTxBuyerBalance,
                'Buyer balance is not correct!'
            );

            assert.equal(
                toBN(beforeTxContractBalance).sub(toBN(value)).toString(),
                afterTxContractBalance,
                'Contract balance is not correct!'
            );

            assert.equal(
                toBN(beforeTxOwnerBalance).sub(toBN(gas)).toString(),
                afterTxOwnerBalance,
                'Contract balance is not correct!'
            );
        });

        it('should NOT be able to activate the deactivated course', async () => {
            await catchRevert(_contract.activateCourse(courseHash2, { from: contractOwner }));
        });

    });

    //Testing repurchase
    describe('Repurchase Course', async () => {
        let courseHash2 = null

        before(async () => {
            courseHash2 = await _contract.getCourseHashAtIndex(1);
        });

        it("should NOT repurchase when the course doesn't exist", async () => {
            const notExisitingCourse = '0x3c9ce618890d42fd62e683ef5c0628d6779a70ee135f4570eff3ddb1d500c353';
            await catchRevert(_contract.repurchaseCourse(notExisitingCourse, { from: buyer }))
        });

        it('should NOT repurchase except course owner', async () => {
            // accounts[1] is the buyer
            const notCourseOwner = accounts[2];
            await catchRevert(_contract.repurchaseCourse(courseHash2, { from: notCourseOwner }))
        });

        it('should be able to repurchase with the orginal owner', async () => {
            const beforeTxBuyerBalance = await getBalance(buyer);
            const beforeTxContractBalance = await getBalance(_contract.address);

            const result = await _contract.repurchaseCourse(courseHash2, { from: buyer, value });

            const afterTxBuyerBalance = await getBalance(buyer);
            const afterTxContractBalance = await getBalance(_contract.address);

            const course = await _contract.getCourseByHash(courseHash2);
            const expectedState = 0;
            const gas = await getGas(result);

            assert.equal(course.state, expectedState, 'The course is not in the purchased state');
            assert.equal(course.price, value, `The course price is not equal to ${value}`);

            assert.equal(
                toBN(beforeTxBuyerBalance).sub(toBN(value)).sub(gas).toString(),
                afterTxBuyerBalance,
                "Client balance is not correct!"
            );

            assert.equal(
                toBN(beforeTxContractBalance).add(toBN(value)).toString(),
                afterTxContractBalance,
                "Contract balance is not correct!"
            )
        });

        it('should NOT be able to repurchase purchased course', async () => {
            await catchRevert(_contract.repurchaseCourse(courseHash2, { from: buyer }))
        });

    });

    describe('Receive funds', () => {
        it('should have transacted funds', async () => {
            const contractBalanceBeforeTx = await getBalance(_contract.address);
            const value = "200000000000000000";

            await web3.eth.sendTransaction({
                from: buyer,
                to: _contract.address,
                value
            });

            const contractBalanceAfterTx = await getBalance(_contract.address);

            assert.equal(
                toBN(contractBalanceBeforeTx).add(toBN(value)).toString(),
                contractBalanceAfterTx,
                "Value after transaction is not matching!"
            );

        });

    });


    describe('Normal withdraw', () => {
        const fundsToDeposit = "200000000000000000";
        const overLimitFunds = "35530000000000000000";
        let currentOwner = null


        before(async () => {
            currentOwner = await _contract.getContractOwner();
            await web3.eth.sendTransaction({
                from: buyer,
                to: _contract.address,
                value: fundsToDeposit,
            });
        })

        it('should FAIL while withdrawing with not an owner address', async () => {
            const value = "100000000000000000";
            await catchRevert(_contract.withdraw(value, { from: buyer }))
        });

        it('should FAIL while withdrawing OVER limit balance', async () => {
            await catchRevert(_contract.withdraw(overLimitFunds, { from: currentOwner }));
        });

        it('should have +0.2ETH after withdraw', async () => {
            const ownerBalance = await getBalance(currentOwner);
            const result = await _contract.withdraw(fundsToDeposit, { from: currentOwner });
            const ownerNewBalance = await getBalance(currentOwner);
            const gas = await getGas(result);

            assert.equal(
                toBN(ownerBalance).add(toBN(fundsToDeposit)).sub(toBN(gas)).toString(),
                ownerNewBalance,
                "The new balance of owner is not correct!"
            );
        });

    });

    describe('Emergency withdraw', () => {
        let currentOwner = null

        before(async () => {
            currentOwner = await _contract.getContractOwner();
        })

        after(async () => {
            await _contract.resumeContract({ from: currentOwner })
        })

        it('should fail when contract is NOT stopped', async () => {
            await catchRevert(_contract.emergencyWithdraw({ from: currentOwner }));
        });

        it('should have +contract funds on contract owner', async () => {
            await _contract.stopContract({ from: currentOwner });

            const contractBalance = await getBalance(_contract.address);
            const ownerBalance = await getBalance(currentOwner);

            const result = await _contract.emergencyWithdraw({ from: currentOwner });
            const gas = await getGas(result);

            const newOwnerBalance = await getBalance(currentOwner);

            assert.equal(
                toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
                newOwnerBalance,
                "Owner hasn't received contract balance"
            )
        });

        it('should have contract balance of 0', async () => {
            const contractBalance = await getBalance(_contract.address);

            assert.equal(
                contractBalance,
                0,
                "Contract balance is not 0"
            )
        });

    });

    describe('Self Destruct', () => {

        let currentOwner = null

        before(async () => {
            currentOwner = await _contract.getContractOwner();
        })

        it('should fail when contract is NOT stopped', async () => {
            await catchRevert(_contract.selfDestruct({ from: currentOwner }));
        });

        it('should have +contract funds on contract owner', async () => {
            await _contract.stopContract({ from: currentOwner });

            const contractBalance = await getBalance(_contract.address);
            const ownerBalance = await getBalance(currentOwner);

            const result = await _contract.selfDestruct({ from: currentOwner });
            const gas = await getGas(result);

            const newOwnerBalance = await getBalance(currentOwner);

            assert.equal(
                toBN(ownerBalance).add(toBN(contractBalance)).sub(gas),
                newOwnerBalance,
                "Owner hasn't received contract balance"
            )
        });

        it('should have contract balance of 0', async () => {
            const contractBalance = await getBalance(_contract.address);

            assert.equal(
                contractBalance,
                0,
                "Contract balance is not 0"
            )
        });

        it('should have 0x bytecode', async () => {
            const code = await web3.eth.getCode(_contract.address);

            assert.equal(
                code,
                "0x",
                "Contract code is not destroyed!"
            )
        });

    });


})