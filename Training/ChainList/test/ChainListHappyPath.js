var ChainList = artifacts.require('./ChainList.sol')

contract('ChainList',accounts => {

  var ChainListInstance,
    seller = accounts[1],
    buyer = accounts[2],
    articleName1 = "article 1",
    articleDescription1 = "Description for article 1",
    articlePrice1 = 10,
    articleName2 = "article 2",
    articleDescription2 = "Description for article 2",
    articlePrice2 = 20,
    buyerBalanceBeforeBuy,
    buyerBalanceAfterBuy,
    sellerBalanceBeforeBuy,
    sellerBalanceAfterBuy

  it('should be initialized with empty values', () => {
    return ChainList.deployed()
      .then(instance => {
        return instance.getNumberOfArticles()
      })
      .then(data => {
        assert.equal(data, 0x0, 'number of articles must be zero')
      })
  })

  it('should sell an article', () => {
    return ChainList.deployed()
      .then(instance => {
        ChainListInstance = instance;
        return ChainListInstance.sellArticle(articleName1, articleDescription1, web3.toWei(articlePrice1, "ether"), {from: seller})
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, "should have received one event")
        assert.equal(receipt.logs[0].event, "SellArticleEvent", "Event name should be SellArticleEvent")
        assert.equal(receipt.logs[0].args._id.toNumber(), 1, "Event should have id of 1")
        assert.equal(receipt.logs[0].args._seller, seller, "Seller should be " + seller)
        assert.equal(receipt.logs[0].args._name, articleName1, "article name should be " + articleName1)
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice1, 'ether'), "article name should be " + web3.toWei(articlePrice1, 'ether'))
        return ChainListInstance.getNumberOfArticles();
      })
      .then(data=>{
        assert.equal(data, 1, "number of articles should equal one")
        return ChainListInstance.getArticlesForSale();
      })
      .then(data=>{
        assert.equal(data.length, 1, "there should be one article for sale")
        articleId = +data[0]
        assert.equal(articleId, 1, "articleId should be 1")
        return ChainListInstance.articles(articleId)
      })
      .then(data=>{
        assert.equal(data[0].toNumber(), 1, "articleId should be 1")
        assert.equal(data[1], seller, "should list seller as "+ seller)
        assert.equal(data[2], 0x0, "buyer should be empty")
        assert.equal(data[3], articleName1, "article name should be " + articleName1)
        assert.equal(data[4], articleDescription1, "article description should be " + articleDescription1)
        assert.equal(data[5], web3.toWei(articlePrice1, "ether"), "price should be " +web3.toWei(articlePrice1, "ether"))
      })
  })

  it('should sell a 2nd article', () => {
    return ChainList.deployed()
      .then(instance => {
        ChainListInstance = instance;
        return ChainListInstance.sellArticle(articleName2, articleDescription2, web3.toWei(articlePrice2, "ether"), {from: seller})
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, "should have received one event")
        assert.equal(receipt.logs[0].event, "SellArticleEvent", "Event name should be SellArticleEvent")
        assert.equal(receipt.logs[0].args._id.toNumber(), 2, "Event should have id of 2")
        assert.equal(receipt.logs[0].args._seller, seller, "Seller should be " + seller)
        assert.equal(receipt.logs[0].args._name, articleName2, "article name should be " + articleName2)
        assert.equal(receipt.logs[0].args._price.toNumber(), web3.toWei(articlePrice2, 'ether'), "article name should be " + web3.toWei(articlePrice2, 'ether'))
        return ChainListInstance.getNumberOfArticles();
      })
      .then(data=>{
        assert.equal(data, 2, "number of articles should equal two")
        return ChainListInstance.getArticlesForSale();
      })
      .then(data=>{
        assert.equal(data.length, 2, "there should be two articles for sale")
        articleId = +data[1]
        assert.equal(articleId, 2, "articleId should be 2")
        return ChainListInstance.articles(articleId)
      })
      .then(data=>{
        assert.equal(data[0].toNumber(), 2, "articleId should be 2")
        assert.equal(data[1], seller, "should list seller as "+ seller)
        assert.equal(data[2], 0x0, "buyer should be empty")
        assert.equal(data[3], articleName2, "article name should be " + articleName2)
        assert.equal(data[4], articleDescription2, "article description should be " + articleDescription2)
        assert.equal(data[5], web3.toWei(articlePrice2, "ether"), "price should be " +web3.toWei(articlePrice2, "ether"))
      })
  })


  it('should trigger an event when a new article is sold', () => {
    return ChainList.deployed()
      .then(instance => {
        ChainListInstance = instance
        watcher = ChainListInstance.SellArticleEvent()
        return ChainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller})
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, "event should be 1 long")
        assert.equal(receipt.logs[0].args._seller, seller, "should have a seller:" + seller)
        assert.equal(receipt.logs[0].args._name, articleName, "should have a name:" + articleName)
        assert.equal(+receipt.logs[0].args._price, web3.toWei(articlePrice, "ether"), "should have a price:" + web3.toWei(articlePrice, "ether"))
      })
  })

  it('should buy an article', () => {
    return ChainList.deployed()
      .then(instance => {
        ChainListInstance = instance
        sellerBalanceBeforeBuy = web3.fromWei(+ web3.eth.getBalance(seller), "ether")
        buyerBalanceBeforeBuy = web3.fromWei(+ web3.eth.getBalance(buyer), "ether")
        return ChainListInstance.buyArticle({
          from: buyer,
          value: web3.toWei(articlePrice, "ether")
        })
      })
      .then(receipt => {
        assert.equal(receipt.logs.length, 1, "one event should be triggered")
        assert.equal(receipt.logs[0].event, "BuyArticleEvent", "buy event should be triggered")
        assert.equal(receipt.logs[0].args._seller, seller, "seller should be " + seller)
        assert.equal(receipt.logs[0].args._buyer, buyer, "buyer should be " + buyer)
        assert.equal(receipt.logs[0].args._name, articleName, "Article name should be " + articleName)
        assert.equal(+receipt.logs[0].args._price, web3.toWei(articlePrice, "ether"), "event article should have a price:" + web3.toWei(articlePrice, "ether"))

        // post-transaction prices
        sellerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber() // have to convert to number after .fromWei or else test fail (can't use +web3.eth.getBalance(seller) to convert to number)
        buyerBalanceAfterBuy = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber()

        assert(sellerBalanceAfterBuy >= sellerBalanceBeforeBuy + articlePrice, "seller should have " + articlePrice + " ETH")
        assert(buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - articlePrice, "buyer should have " + articlePrice + " ETH") //n.b. <= rather than == because of the gas price.

        return ChainListInstance.getArticle.call()
      })
      .then(data => {
        assert.equal(data[0], seller, "seller must be " + seller)
        assert.equal(data[1], buyer, "buyer must be empty")
        assert.equal(data[2], articleName, "article name must be " + articleName)
        assert.equal(data[3], articleDescription, "article description must be " + articleDescription)
        assert.equal(+data[4], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
  })
})