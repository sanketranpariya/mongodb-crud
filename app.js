const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/user");

// express app
const app = express();

// connect to mongodb & listen for requests
const dbURI = "mongodb://0.0.0.0:27017/";

async function connectToDatabase() {
  try {
    await mongoose.connect(dbURI);
    console.log("Database connected");
    // After database is connected, listen to port 8080
    app.listen(8080, () => {
      console.log("server is running on port 8080");
    });
  } catch (err) {
    console.log(err); // Else errors will be shown
  }
}

connectToDatabase();

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public")); //this will helps to use style.css file
app.use(express.urlencoded({ extended: true })); //this will helps to get submitted data of form in req.body obj

// home routes
app.get("/", (req, res) => {
  res.redirect("/users"); //this will redirect page to /users
});

// users i.e index route
app.get("/users", async (req, res) => {
  console.log("req made on " + req.url);
  try {
    const result = await User.find().sort({ createdAt: -1 }); // It will find all data and show it in descending order
    res.render("index", { users: result, title: "Home" }); // It will then render the index page along with users
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred"); // Optionally, you can send an error response to the client
  }
});

// about route
app.get("/about", (req, res) => {
  console.log("req made on " + req.url);
  res.render("about", { title: "About" });
});

// route for user create
app.get("/user/create", (req, res) => {
  console.log("GET req made on " + req.url);
  res.render("adduser", { title: "Add-User" });
});

// route for users/withvar
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await User.findById(id);
    res.render("details", {
      user: result,
      action: "edit",
      title: "User Details",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred"); // Optionally, you can send an error response to the client
  }
});

// route for edit/name/action variable that will display current value to input field
app.get("/edit/:name/:action", async (req, res) => {
  const name = req.params.name;
  console.log("req made on " + req.url);
  try {
    const result = await User.findOne({ name: name });
    res.render("edit", { user: result, title: "Edit-User" });
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred"); // Optionally, you can send an error response to the client
  }
});

// submitting data routes
app.post("/user/create", async (req, res) => {
  console.log("POST req made on " + req.url);
  console.log("Form submitted to server");

  try {
    const user = new User(req.body); //passing object of form data directly to collection
    await user.save(); //then saving this to database
    res.redirect("/users"); //if success, redirect to home page
  } catch (err) {
    console.log(err); //if data not saved, error showed
    res.status(500).send("An error occurred");
  }
});

// route for updating users data
app.post("/edit/:id", async (req, res) => {
  console.log("POST req made on " + req.url);
  try {
    await User.updateOne({ _id: req.params.id }, req.body); //updating the user whose id is get from url
    res.redirect("/users"); //if success, redirect to home page
    console.log("User's profile updated");
  } catch (err) {
    console.log(err); //if data not saved, error showed
    res.status(500).send("An error occurred");
  }
});

// routes for deleting users by getting user's name from url then finding that user and deleting
app.post("/users/:name/delete", async (req, res) => {
  // Updated to have a unique URL path for deletion
  const name = req.params.name;
  console.log(name);
  try {
    await User.deleteOne({ name: name });
    res.redirect("/users");
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});

// 404 errors route
// This will auto run in case no routes match
// Note: must put this route at last in the route list
app.use((req, res) => {
  console.log("req made on " + req.url);
  res.render("404", { title: "NotFound" });
});
