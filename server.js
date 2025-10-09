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
const dbFile = "my-projec-db.db";
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

app.use((req, res) => {
  res.status(404).render("404.handlebars");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});

// adding new event
app.get("/events/new", (req, res) => {
  if (req.session.isAdmin) {
    res.render("form-events");
  } else {
    model = {
      error: "You must be logged in as admin to create a new project.",
    };
    res.render("events", model);
  }
});
app.post("/events/new", (req, res) => {
  console.log("Body:", req.body);
  console.log("Session:", req.session);

  if (!req.session.isAdmin) {
    return res.render("loggedin", {
      error: "You must be logged in as admin to create a new event.",
    });
  }
  const { title, desc, location, date } = req.body;
  if (!title || !desc || !location || !date) {
    return res.render("form-events", { error: "Please fill in all fields." });
  }

  const sql = `
    INSERT INTO events (title, description, location, date)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [title, desc, location, date], function (err) {
    if (err) {
      console.error("Database error:", err.message);
      return res.render("form-events", { error: "Error saving event." });
    }

    console.log(`New event created with ID ${this.lastID}`);
    res.redirect("/events");
  });
});

//one event showing
app.get("/events/:eventsid", (req, res) => {
  const myid = req.params.eventsid;

  db.get("SELECT * FROM events WHERE id=?", [myid], (err, theEvent) => {
    if (err) {
      console.error(err.message);
      return res.render("one-event", { error: "Error retrieving event." });
    }
    console.log(` - -> Retrieved ${theEvent ? 1 : 0} event from the database.`);
    console.log(` - -> Event: ${JSON.stringify(theEvent, null, 2)}`);

    if (!theEvent) {
      return res.render("one-event", { error: "Event not found." });
    }
    res.render("one-event", { e: theEvent });
  });
});

// edit events
app.get("/events/modify/:eventsid", (req, res) => {
  let myid = req.params.eventsid;
  if (req.session.isAdmin) {
    db.get("SELECT * FROM events WHERE id=?", [myid], (err, theEvent) => {
      if (err) {
        console.error(err.message);
        const model = {
          error: "Error retrieving the project the event from the database.",
        };
        res.render("home", model);
      } else {
        const model = { e: theEvent };
        res.render("modify-event", model);
      }
    });
  } else {
    model = { error: "You must be logged in as admin to modify a event." };
    res.render("loggedin", model);
  }
});

app.post("/events/modify/:eventsid", (req, res) => {
  const myid = req.params.eventsid;
  const { title, desc, location, date } = req.body;

  if (!req.session.isAdmin) {
    return res.render("loggedin", {
      error: "You must be logged in as admin to modify an event.",
    });
  }

  if (!title || !desc || !location || !date) {
    return res.render("modify-event", {
      e: { id: myid, title, description: desc, location, date },
      error: "Please fill in all fields.",
    });
  }

  const sql = `
    UPDATE events
    SET title = ?, description = ?, location = ?, date = ?
    WHERE id = ?
  `;

  db.run(sql, [title, desc, location, date, myid], function (err) {
    if (err) {
      console.error("Database error:", err.message);
      return res.render("modify-event", {
        e: { id: myid, title, description: desc, location, date },
        error: "Error updating event.",
      });
    }

    console.log(`Event ${myid} updated successfully.`);
    res.redirect("/events");
  });
});

// delete events
app.post("/events/delete/:eventsid", (req, res) => {
  const myid = req.params.eventsid;
  if (req.session.isAdmin) {
    db.run("DELETE FROM events WHERE id=?", [myid], (err) => {
      if (err) {
        console.error(err.message);
        console.log("Error deleting the project from the database.");
        res.redirect("/");
      } else {
        console.log("The project was deleted");
        res.redirect("/events");
      }
    });
  } else {
    model = { error: "You must be loged in as admin to delete a project" };
    res.redirect("/loggedin", model);
  }
});

//login
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

app.engine(
  "handlebars",
  engine({
    helpers: {
      eq(a, b) {
        return a == b;
      },
    },
  })
);
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

app.get("/home", (req, res) => {
  res.render("home", { error: null });
});

app.get("/events", (req, res) => {
  db.all("SELECT * FROM events", (err, events) => {
    if (err) {
      console.error(err.message);
      res.render("events", { error: "Error retrieving events." });
    } else {
      res.render("events", { events });
    }
  });
});

app.get("/about", (req, res) => {
  res.render("about", { error: null });
});

app.get("/images", (req, res) => {
  res.render("images", { error: null });
});

app.get("/contact", (req, res) => {
  res.render("contact", { error: null });
});
