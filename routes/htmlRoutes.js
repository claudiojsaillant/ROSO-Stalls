const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
  app.get("/", function(req, res) {
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        // for(let i = 0; i < dbArticle.length; i++){
        //   if(dbArticle[i].items[0]){
        //     dbArticle[i].cheapest = dbArticle[i].items[0].price;
        //   } 
        // }
        for(let i = 0; i < dbArticle.length; i++){
          if(dbArticle[i].items[0]){
            dbArticle[i].cheapest = dbArticle[i].items[0].price;
            dbArticle[i].name = dbArticle[i].items[0].title;
          } 
        }
        dbArticle.sort((a, b) => (parseInt(a.cheapest) > parseInt(b.cheapest)) ? 1 : -1)
    
        res.render("index", {
          article: dbArticle
        });
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};