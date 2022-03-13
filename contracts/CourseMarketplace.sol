// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract CourseMarketplace {
    enum State {
        Purchased,
        Activated,
        Deactivated
    }

    struct Course {
        uint256 id;
        uint256 price;
        bytes32 proof;
        address owner;
        State state;
    }

    // Mappings
    mapping(bytes32 => Course) private ownedCourses;
    mapping(uint256 => bytes32) private ownedCourseHashes;

    //Stop contract
    bool public isStopped = false;

    // Total bought courses by students
    uint256 private totalOwnedCourses;

    // Owner of this contract
    address payable private owner;

    /// You are already a owner of this course!
    error CourseHasOwner();

    /// Sender is not a course owner!
    error SenderIsNotCourseOwner();

    /// Only owner can perform this action!
    error OnlyOwnerError();

    /// Course is not created!
    error CourseIsNotCreated();

    /// Course has invalid state!
    error InvalidState();

    constructor() {
        setContractOwner(msg.sender);
    }

    modifier onlyOwner() {
        if (msg.sender != getContractOwner()) {
            revert OnlyOwnerError();
        }
        _;
    }

    modifier onlyWhenNotStopped() {
        require(!isStopped);
        _;
    }

    modifier onlyWhenStopped() {
        require(isStopped);
        _;
    }

    //Callback or receive to receive ethers without function name call
    receive() external payable {}

    function withdraw(uint256 amount) external onlyOwner {
        require(amount < address(this).balance, "Insufficient funds!");
        (bool success, ) = owner.call{value: amount}("");
        require(success, "Transfer failed!");
    }

    function emergencyWithdraw() external onlyWhenStopped onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Transfer failed!");
    }

    function selfDestruct() external onlyWhenStopped onlyOwner {
        //this selfdestruct function will destruct this contract and send all the balances to the owner
        selfdestruct(owner);
    }

    function stopContract() external onlyOwner {
        isStopped = true;
    }

    function resumeContract() external onlyOwner {
        isStopped = false;
    }

    function purchaseCourse(bytes16 courseId, bytes32 proof)
        external
        payable
        onlyWhenNotStopped
    {
        bytes32 courseHash = keccak256(abi.encodePacked(courseId, msg.sender));

        if (hasCourseOwnership(courseHash)) {
            revert CourseHasOwner();
        }

        uint256 id = totalOwnedCourses++;
        ownedCourseHashes[id] = courseHash;

        ownedCourses[courseHash] = Course({
            id: id,
            price: msg.value,
            proof: proof,
            owner: msg.sender,
            state: State.Purchased
        });
    }

    function transferOwnership(address newOwner) external onlyOwner {
        setContractOwner(newOwner);
    }

    function getCourseCount()
        external
        view
        onlyWhenNotStopped
        returns (uint256)
    {
        return totalOwnedCourses;
    }

    function getCourseHashAtIndex(uint256 _index)
        external
        view
        returns (bytes32)
    {
        require(_index < totalOwnedCourses, "Index Out of Bound");
        return ownedCourseHashes[_index];
    }

    function getCourseByHash(bytes32 _courseHash)
        external
        view
        returns (Course memory)
    {
        return ownedCourses[_courseHash];
    }

    function repurchaseCourse(bytes32 _courseHash)
        external
        payable
        onlyWhenNotStopped
    {
        if (!isCourseCreated(_courseHash)) {
            revert CourseIsNotCreated();
        }

        if (!hasCourseOwnership(_courseHash)) {
            revert SenderIsNotCourseOwner();
        }

        Course storage course = ownedCourses[_courseHash];

        if (course.state != State.Deactivated) {
            revert InvalidState();
        }

        course.state = State.Purchased;
        course.price = msg.value;
    }

    function activateCourse(bytes32 _courseHash)
        external
        onlyWhenNotStopped
        onlyOwner
    {
        if (!isCourseCreated(_courseHash)) {
            revert CourseIsNotCreated();
        }

        Course storage course = ownedCourses[_courseHash];

        if (course.state != State.Purchased) {
            revert InvalidState();
        }

        course.state = State.Activated;
    }

    function deActivateCourse(bytes32 _courseHash)
        external
        onlyWhenNotStopped
        onlyOwner
    {
        if (!isCourseCreated(_courseHash)) {
            revert CourseIsNotCreated();
        }

        Course storage course = ownedCourses[_courseHash];

        if (course.state != State.Purchased) {
            revert InvalidState();
        }

        (bool success, ) = course.owner.call{value: course.price}("");
        require(success, "Transfer failed!");

        course.state = State.Deactivated;
        course.price = 0;
    }

    function getContractOwner() public view returns (address) {
        return owner;
    }

    function hasCourseOwnership(bytes32 _courseHash)
        private
        view
        returns (bool)
    {
        return ownedCourses[_courseHash].owner == msg.sender;
    }

    function isCourseCreated(bytes32 _courseHash) private view returns (bool) {
        return
            ownedCourses[_courseHash].owner !=
            0x0000000000000000000000000000000000000000;
    }

    function setContractOwner(address newOwner) private {
        owner = payable(newOwner);
    }
}
