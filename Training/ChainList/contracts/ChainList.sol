pragma solidity ^0.4.11;


contract ChainList {
    // Custom Types
    struct Article {
        uint id;
        address seller;
        address buyer;
        string name;
        string description;
        uint256 price;
    }

    //state
    mapping (uint => Article) public articles;
    uint public articleCounter;

    // events
    event SellArticleEvent(
        uint indexed _id, 
        address indexed _seller, 
        string _name, 
        uint256 _price);

    event BuyArticleEvent(
        uint indexed _id,
        address indexed _seller,
        address indexed _buyer, 
        string _name, 
        uint256 _price);

    // sell an article
    function sellArticle(string _name, string _description, uint256 _price) public {
        articleCounter++;

        articles[articleCounter] = Article(
            articleCounter,
            msg.sender,
            0x0,
            _name,
            _description,
            _price
        );

        SellArticleEvent(articleCounter, msg.sender, _name, _price);
    }

    // buy an article
    function buyArticle(uint _id) public payable {
        require(articleCounter > 0);
        require(_id > 0 && _id <= articleCounter);
        // store the article
        Article storage article = articles[_id];

        require(article.buyer == 0x0); //is the article not already sold?
        require(article.seller != msg.sender); //seller can't buy own article
        require(article.price == msg.value); //is msg.value the same as the listed price
        article.buyer = msg.sender; // assign the sender as the buyer
        article.seller.transfer(msg.value); // buyer buys article
        BuyArticleEvent(_id, article.seller, article.buyer, article.name, article.price); //trigger notifications
    }

    // get # of articles
    function getNumberOfArticles() public constant returns (uint) {
        return articleCounter;
    }

    // returns article IDs for sale
    function getArticlesForSale() public constant returns (uint[]){
        require(articleCounter > 0);

        uint[] memory articleIds = new uint[](articleCounter);
        uint numberOfArticlesForSale = 0;

        for (uint i = 1; i <= articleCounter; i++) {
            if (articles[i].buyer == 0x0) {
                articleIds[numberOfArticlesForSale] = articles[i].id;
                numberOfArticlesForSale++;
            }
        }

        uint[] memory forSale = new uint[](numberOfArticlesForSale);
        for (uint j = 0; j < numberOfArticlesForSale; j++){
            forSale[j] = articleIds[j];
        }

        return (forSale);
    }

    
}
