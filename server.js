const express = require("express");
const app = express();
const { engine } = require("express-handlebars");
const port = 5482;
const adminPassword =
  "$2b$12$iY4scRgm2wm9JhshVD5rO.jqC76Pgehb1Y39X3tjMDZJqyQ7rmBfW";

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const session = require("express-session");
const bcrypt = require("bcrypt");
const sqlite3 = require("sqlite3");
const connectSqlite3 = require("connect-sqlite3");
const dbFile = "my-projec-db.sqlite3";
const db = new sqlite3.Database(dbFile);
const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({ db: "session-db.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "secretsecretmakapakapiegonlambada12$!birb...",
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

/*app.get("/", (req, res) => {
  db.all("SELECT * FROM Events", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Database error");
      return;
    }
    res.render("home", { events: rows, title: "Events list" });
  });
});*/

app.get("/loggedin", (req, res) => {
  res.render("loggedin", { error: null });
});

app.post("/loggedin", (req, res) => {
  const { username, password } = req.body;
  console.log(`Here comes the data: ${username} - ${password}`);

  if (username === "admin") {
    bcrypt.compare(password, adminPassword, (err, result) => {
      if (err) {
        console.log("Error in password comparison");
        return res.render("loggedin", {
          error: "Error in password comparison.",
        });
      }

      if (result) {
        req.session.isLoggedIn = true;
        req.session.un = username;
        req.session.isAdmin = true;
        console.log(" >SESSION INFORMATION: ", JSON.stringify(req.session));
        return res.render("loggedin");
      } else {
        console.log("Wrong password");
        return res.render("loggedin", {
          error: "Wrong password! Please try again",
        });
      }
    });
  } else {
    console.log("Wrong username");
    return res.render("loggedin", {
      error: "Wrong username! Please try again",
    });
  }
});

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");

app.listen(port, () => {
  hashPassword("wdf#2025", 12);
  console.log(`Server up and running on ${port}...`);
});

function hashPassword(pw, saltRounds) {
  bcrypt.hash(pw, saltRounds, function (err, hash) {
    if (err) {
      console.log("---> Error hashing password:", err);
    } else {
      console.log(`--> Hashed password: ${hash}`);
    }
  });
}
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error while destroying the session: ", err);
      res.redirect("/loggedin");
    } else {
      console.log("logged out...");
      res.redirect("/loggedin");
    }
  });
});

app.get("/signin", (req, res) => {
  res.render("signin", { title: "Sign Up" });
});

app.post("/signin", (req, res) => {
  const { username, password } = req.body;
  res.redirect("/loggedin");
});

app.get("/events", (req, res) => {
  res.render("events", { error: null });
});
