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
})