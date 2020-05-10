const db = require("../models");
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = function(app) {
  app.get("/scrape/:search", function(req, res) {
    db.Article.remove({}).then(function(a){
      let query = req.params.search;
      // let page = req.params.page; 
      let stalls = []
      let count = 0;
      // "https://www.rage-sage.com/database/stalls/query/"+ query + "/page/" + page          /w page
      // First, we grab the body of the html with axios
      console.log("https://www.rage-sage.com/database/stalls/query/"+ query)
      axios.get("https://www.rage-sage.com/database/stalls/query/"+ query).then(function(response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        const $ = cheerio.load(response.data);
        // Now, we grab every h2 within an article tag, and do the following:
        // Lastest News
        let len = $(
          "#content > div.article_right > div > div > div.contentwrap > div > div > div.innerFormat > table > tbody > tr"
        ).length;

        if(len === 0){
          res.send("-1")
        }

        $(
          "#content > div.article_right > div > div > div.contentwrap > div > div > div.innerFormat > table > tbody > tr"
        ).each(function(i, element) {
          // Save an empty result object
          let result = {};
  
          //FINISH THIS WITH TARGETING.
          // Add the text and href of every link, and save them as properties of the result object
  
          result.title = $(this)
            .children("td")
            .children("a")
            .text()
          result.link = $(this)
            .children("td")
            .children("a")
            .attr('href')
          result.user = $(this)
          .children("td:nth-child(2)")
          .text()
          result.location = $(this)
            .children("td:nth-child(3)")
            .text()
        
          let items = []
          axios.get(result.link).then(function(response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            
            const $ = cheerio.load(response.data);
            
            // Now, we grab every h2 within an article tag, and do the following:
            // Lastest News
            $(
              "#content > div.article_right > div > div > div.contentwrap > div > div > div.innerFormat > div:nth-child(3) > table"
            ).each(function(i, element, arr) {
                 
              for(let i = 1; i < 13; i += 2){
  
                for(let h = 1; h < 4; h++){
                  item = {} 
                  item.title = $(this)
                    .children("thead:nth-child(" + i + ")")
                    .children("tr")
                    .children("th:nth-child(" + h + ")")
                    .text()
                  item.price = $(this)
                    .children("tbody:nth-child(" + (i+1) + ")")
                    .children("tr")
                    .children("td:nth-child(" + h + ")")
                    .text()
                  
                  let includ = query;
                  if(includ.toLowerCase().includes("-")){
                    includ = includ.split('-');
                    includ = includ.join(" ");
                  }
                  console.log("FIXED QUERRY:--_>" + includ)
                  
                  if(item.title != "" && item.title.toLowerCase().includes(includ)  || item.title != "" && (item.title === "+10% EXP Scroll" && includ === "10 exp scroll") || item.title != "" && (item.title === "+5% EXP Scroll" && includ === "5 exp scroll")){
                    let a = item.price
                    a = a.split("$")
                    a = a[1].split("(")
                    item.price = a[0].trim()
                    items.push(item)
                  }
                  
                }
              
            }
            })
            items.sort((a, b) => (parseInt(a.price) > parseInt(b.price)) ? 1 : -1)
          
            let stall = {}
            stall.link = result.link;
            stall.user = result.user;
            stall.location = result.location;
            stall.items = items
            stalls.push(stall);
            count++;
            if(count == len){
              for(let j = 0; j < stalls.length; j++){
              db.Article.create(stalls[j])
              .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
                
              })
              .catch(function(err) {
                // If an error occurred, log it
                console.log(err);
              })
            }
            res.send("DONE")
            }
          })
  
  
          // Create a new Article using the `result` object built from scraping
  
        })
        
      });
    });
    
    
  });

  app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

  app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { note: dbNote._id } },
          { new: true }
        );
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
};
