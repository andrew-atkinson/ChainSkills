pragma solidity ^0.4.11;

contract ChainList {
    // State variables
    address seller;
    address buyer;
    string name;
    string description;
    uint256 price;

    // events
    event SellArticleEvent(address indexed _seller, string _name, uint256 _price);
    event BuyArticleEvent(address indexed _seller, address indexed _buyer, string _name, uint256 _price);

    // sell an article
    function sellArticle(string _name, string _description, uint256 _price) public {
        seller = msg.sender;
        name = _name;
        description = _description;
        price = _price;
        SellArticleEvent(seller, name, price);
    }

    // buy an article
    function buyArticle() public payable {
        require(seller != 0x0); //is there an article for sale?
        require(buyer == 0x0); //is the article not already sold?
        require(msg.sender != seller); //seller can't buy own article
        require(msg.value == price); //is msg.value the same as the listed price
        buyer = msg.sender; // assign the sender as the buyer
        seller.transfer(msg.value); // buyer buys article
        BuyArticleEvent(seller, buyer, name, price); //trigger notifications
    }

    // get the article
    function getArticle() public constant returns (
        address _seller,
        address _buyer,
        string _name,
        string _description,
        uint256 _price) {
        return(seller, buyer, name, description, price);
    }
}
