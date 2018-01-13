var ChainList = artifacts.require('./ChainList.sol')

contract('ChainList', (accounts) => {

  var ChainListInstance,
    seller = accounts[1],
    buyer = accounts[2],
    articleName = "article 1",
    articlePrice = 10,
    articleDescription = "this is an article description",
    buyerBalanceBeforeBuy,
    buyerBalanceAfterBuy,
    sellerBalanceBeforeBuy,
    sellerBalanceAfterBuy

  it('should be initialized with empty values', () => {
    return ChainList.deployed()
      .then((instance) => {
        return instance.getArticle.call()
      })
      .then((data) => {
        assert.equal(data[0], 0x0, 'seller must be empty')
        assert.equal(data[1], 0x0, 'buyer must be empty')
        assert.equal(data[2], '', 'article name must be empty')
        assert.equal(data[3], '', 'description must be empty')
        assert.equal(+ data[4], 0, 'article price must be zero')
      })
  })

  it('should sell an article', () => {
    return ChainList.deployed()
      .then((instance) => {
        ChainListInstance = instance;
        return ChainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller})
      })
      .then(() => {
        return ChainListInstance.getArticle.call()
      })
      .then((data) => {
        assert.equal(data[0], seller, "seller must be " + seller)
        assert.equal(data[1], 0x0, "buyer must be empty")
        assert.equal(data[2], articleName, "article name must be " + articleName)
        assert.equal(data[3], articleDescription, "article description must be " + articleDescription)
        assert.equal(+ data[4], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
  })

  it('should trigger an event when a new article is sold', () => {
    return ChainList.deployed()
      .then((instance) => {
        ChainListInstance = instance
        watcher = ChainListInstance.SellArticleEvent()
        return ChainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller})
      })
      .then((receipt) => {
        assert.equal(receipt.logs.length, 1, "event should be 1 long")
        assert.equal(receipt.logs[0].args._seller, seller, "should have a seller:" + seller)
        assert.equal(receipt.logs[0].args._name, articleName, "should have a name:" + articleName)
        assert.equal(+receipt.logs[0].args._price, web3.toWei(articlePrice, "ether"), "should have a price:" + web3.toWei(articlePrice, "ether"))
      })
  })

  it('should buy an article', () => {
    return ChainList.deployed()
      .then((instance) => {
        ChainListInstance = instance
        sellerBalanceBeforeBuy = web3.fromWei(+ web3.eth.getBalance(seller), "ether")
        buyerBalanceBeforeBuy = web3.fromWei(+ web3.eth.getBalance(buyer), "ether")
        return ChainListInstance.buyArticle({
          from: buyer,
          value: web3.toWei(articlePrice, "ether")
        })
      })
      .then((receipt) => {
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
      .then((data) => {
        assert.equal(data[0], seller, "seller must be " + seller)
        assert.equal(data[1], buyer, "buyer must be empty")
        assert.equal(data[2], articleName, "article name must be " + articleName)
        assert.equal(data[3], articleDescription, "article description must be " + articleDescription)
        assert.equal(+data[4], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
  })
})