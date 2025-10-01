const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const port = 5482;

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

app.get("/main.css", (req, res) => {
  res.sendFile(__dirname + "/public/css/main.css");
});

app.use(express.static("public"));

app.get("/rawpersons", (req, res) => {
  db.all("SELECT * FROM Person", (err, rawPersons) => {
    if (err) {
      console.log("Error: " + err);
    } else {
      console.log("Data found, sending back to the client...");
      res.send(rawPersons);
    }
  });
});

app.get("/listpersons", (req, res) => {
  db.all("SELECT * FROM Person", (err, rawPersons) => {
    if (err) {
      console.log("Error: " + err);
    } else {
      listPersonsHTML = "jerome<ul>";
      rawPersons.forEach((onePerson) => {
        listPersonsHTML += "<li>";
        listPersonsHTML += `${onePerson.fname},`;
        listPersonsHTML += `${onePerson.lname},`;
        listPersonsHTML += `${onePerson.age},`;
        listPersonsHTML += `${onePerson.email},`;
        listPersonsHTML += "</li>";
      });
      listPersonsHTML += "</ul>";
      res.send(listPersonsHTML);
    }
  });
});

app.listen(port, () => {
  console.log(`Server up and running on ${port}...`);
});
