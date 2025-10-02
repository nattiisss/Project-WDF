const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const port = 5482;

app.use(express.static("public"));

const sqlite3 = require("sqlite3");
const dbFile = "my-project-db.sqlite3.db";
db = new sqlite3.Database(dbFile);
// creates table Person at startup

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
app.get("/", function (req, res) {
  res.render("home", { name: "World", title: "Home" });
});

app.listen(port, () => {
  console.log(`Server up and running on ${port}...`);
});
