const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const port = 5482;

app.use(express.static("public"));

const sqlite3 = require("sqlite3");
const dbFile = "my-projec-db.sqlite3";
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("Could not open database:", err.message);
  } else {
    console.log("Connected to database:", dbFile);
  }
});

app.get("/", (req, res) => {
  db.all("SELECT * FROM Events", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Database error");
      return;
    }
    res.render("home", { events: rows, title: "Events list" });
  });
});

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.listen(port, () => {
  console.log(`Server up and running on ${port}...`);
});
