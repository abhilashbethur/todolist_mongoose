//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash")

const app = express();
mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true})
app.set('view engine', 'ejs');

const itemsSchema = {
  name:String
}

const Item = mongoose.model("Item",itemsSchema)

const buy = new Item ({
  name: "buy at low"
})

const sell = new Item ({
  name: "sell at high"
})

const hold = new Item ({
  name: "just hold bitch"
})

const defaultitems = [buy,sell,hold]

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema)

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {

Item.find({},function(err, foundItems){
if(foundItems.length === 0){
Item.insertMany(defaultitems,function(err){
  if(err) console.log(err);
  else console.log("done");
})
res.redirect("/")
}
else 
  res.render("list", {listTitle: "Today", newListItems:foundItems });
})
});

app.post("/delete",function(req,res){
  if (req.body.listName==="Today"){
      Item.deleteOne({_id:req.body.checkbox},function(err){
        if(err) console.log(err);
        else {
          res.redirect("/")
        } 
      })
  }
  else {
    List.findOneAndUpdate(
      {name:req.body.listName},
      {$pull:{items:{_id:req.body.checkbox}}},
      function(err,result){
        if(!err){
          res.redirect("/"+req.body.listName)
        }
      }
    )
  }


})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item ({
    name:itemName,
  })

  if(listName === "Today"){
    item.save()
    res.redirect("/")
  }
  else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(item);
      foundList.save()
      res.redirect("/"+listName)
    })
  } 
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName) ;

  List.findOne({name:customListName},function(err, result){
    if(!err){
      if(!result) {
        const list = new List({
          name:customListName,
          items:defaultitems
        })
        list.save()
        res.redirect("/"+customListName)
        
      }
      else {
        
        res.render("list",{listTitle: result.name, newListItems: result.items})
        
      }
    }
    
  })

})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
