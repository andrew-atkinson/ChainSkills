var ChainList = artifacts.require('./ChainList.sol')

contract('ChainList', function (accounts) {

  var ChainListInstance,
    seller = accounts[1],
    articleName = "article 1",
    articlePrice = 10,
    articleDescription = "this is an article description"

  it('should be initialized with empty values', function () {
    return ChainList
      .deployed()
      .then(function (instance) {
        return instance
          .getArticle
          .call()
      })
      .then(function (data) {
        assert.equal(data[0], 0x0, 'seller must be empty')
        assert.equal(data[1], '', 'article name must be empty')
        assert.equal(data[2], '', 'description must be empty')
        assert.equal(+ data[3], 0, 'article price must be zero')
      })
  })

  it('should sell an article', function () {
    return ChainList
      .deployed()
      .then(function (instance) {
        ChainListInstance = instance;
        return ChainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller})
      })
      .then(function () {
        return ChainListInstance
          .getArticle
          .call()
      })
      .then(function (data) {
        assert.equal(data[0], seller, "seller must be " + seller);
        assert.equal(data[1], articleName, "article name must be " + articleName);
        assert.equal(data[2], articleDescription, "article description must be " + articleDescription);
        assert.equal(+ data[3], web3.toWei(articlePrice, "ether"), "Price must be " + web3.toWei(articlePrice, "ether"))
      })
  })

  it('should trigger an event when a new article is sold', function () {
    return ChainList
      .deployed()
      .then(function (instance) {
        ChainListInstance = instance
        watcher = ChainListInstance.SellArticleEvent()
        return ChainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller})
      })
      .then(function () {
        return watcher.get()
      })
      .then(function (events) {
        assert.equal(events.length, 1, "event should be 1 long")
        assert.equal(events[0].args._seller, seller, "should have a seller:" + seller)
        assert.equal(events[0].args._name, articleName, "should have a name:" + articleName)
        assert.equal(+events[0].args._price, web3.toWei(articlePrice, "ether"), "should have a price:" + web3.toWei(articlePrice, "ether"))
      })
  })
})