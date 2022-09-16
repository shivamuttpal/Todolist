const express = require('express')
const bodyParser= require('body-parser');
const mongoose = require("mongoose");
// const { Schema } = mongoose;
 
const app= express();

// let workItems =[];

app.set('view engine','ejs');
app.use(express.static('public'));

mongoose.connect("mongodb+srv://shivam:shivam29@cluster0.tzxjqhj.mongodb.net/todolistDB" , {useNewUrlParser:true});

// schema
const itemsSchema = {
    name: String
};
//mongoose model
const Item = mongoose.model("Item",itemsSchema);

//mongoose Document1
const item1 = new Item({
    name:"Welcome to your todolist!"
});
//mongoose Document2
const item2 = new Item({
    name:"hit enter to add new item"
});
//mongoose Document3
const item3 = new Item({
    name:"Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name:String,
    items:[itemsSchema]
}

const List = mongoose.model("List",listSchema);

app.use(bodyParser.urlencoded({ extended: true }))

app.get('/',function(req,res){
    
    Item.find({},function(err,foundItems){
        
        if(foundItems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Successfully saved default items to DB.")
                }
            });
            res.redirect("/");
        }else{
            res.render("list",{
                ListTitle:"today",
                newlistItems:foundItems
            })
        }
    })
    
})



app.post("/delete",function(req,res){
    const id = req.body.delete;

    const listName = req.body.listName;

    if(listName === "today"){
        Item.findByIdAndRemove(id,function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Items deleted successfully")
            }
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:id}}},function(err,foundList){
            if(!err){
                res.redirect("/" + listName);
            }
        });
    }
    
});

app.get("/:customListName",function(req,res){
    const customListName = req.params.customListName;

    List.findOne({name: customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });
            
                list.save();
                
                res.redirect("/"+ customListName);

            }else{
                res.render("list",{
                    ListTitle:foundList.name,
                    newlistItems:foundList.items
                })
            }
        }
    });
});



app.post('/',function(req,res){
    
    var itemName = req.body.text1;
    var listName = req.body.list;

    const item = new Item({
        name:itemName
    })

    if(listName === "today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName}, function(err,foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }

});




app.get("/work",function(req,res){
    res.render("list",{
        ListTitle:"Work List",
        newlistItems:workItems
    });
})



app.listen(3000,function(){
    console.log('server is listening on port 3000 ');
})         
