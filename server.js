/* 
CONTACT INFO: 
Dominika Chorzewska: chdo24sb@student.ju.se 
Natalia Bukowska: buna24rr@student.ju.se 
GRADE: We are aiming for grade 5! 

Admin login: admin
Admin password: "wdf#2025" ---> "$2b$12$iY4scRgm2wm9JhshVD5rO.jqC76Pgehb1Y39X3tjMDZJqyQ7rmBfW"

IMAGES: all images were taken from the web (not made by us) : unsplash, pexels and creative commons on google!
Some code in this project were made with help of ChatGPT 
 */

const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "public/img/" });
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
const dbFile = "my-projec-db copy1.db";
const db = new sqlite3.Database(dbFile);
const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({ db: "my-projec-db copy1.db" }),
    saveUninitialized: false,
    resave: false,
    secret: "secretsecretmakapakapiegonlambada12$!birb...",
  })
);
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function requireLogin(req, res, next) {
  next();
}

//events
app.get("/events", (req, res) => {
  const numberOfElementsPerPage = 5; // how many events per page
  const currentPage = parseInt(req.query.page) || 1;
  const offset = (currentPage - 1) * numberOfElementsPerPage;

  const countSql = `SELECT COUNT(*) as totalEvents FROM "Events"`;
  const eventsSql = `
    SELECT "Events".id AS id,
           "Events".title,
           "Events".description,
           "Events".date,
           "Events".location,
           "Events".images,
           "Event Categories".name AS category_name
           
    FROM "Events"
    INNER JOIN eventshavecategories
      ON "Events".id = eventshavecategories.event_id
    INNER JOIN "Event Categories"
      ON eventshavecategories.category_id = "Event Categories".id
    LIMIT ? OFFSET ?
  `;
  const categoriesSql = `SELECT * FROM "Event Categories"`;

  db.get(countSql, (err, countRow) => {
    if (err) {
      console.error(err.message);
      return res.render("events", { error: "Database error" });
    }

    const totalEvents = countRow.totalEvents;
    const totalPages = Math.ceil(totalEvents / numberOfElementsPerPage);

    db.all(eventsSql, [numberOfElementsPerPage, offset], (err2, events) => {
      if (err2) {
        console.error(err2.message);
        return res.render("events", { error: "Error retrieving events." });
      }

      db.all(categoriesSql, (err3, categories) => {
        if (err3) {
          console.error(err3.message);
          return res.render("events", {
            error: "Error retrieving categories.",
          });
        }

        const pages = Array.from(
          { length: totalPages },
          (_, i) => i + 1
        ); /* this part chat gpt helped with  */

        res.render("events", {
          events,
          categories,
          activeCategoryIsAll: true,
          pageClass: "events",
          currentPage,
          totalPages,
          hasPrevPage: currentPage > 1,
          hasNextPage: currentPage < totalPages,
          prevPage: currentPage - 1,
          nextPage: currentPage + 1,
          pages,
          session: req.session,
        });
      });
    });
  });
});

//categories menubar
app.get("/events/category/:id", (req, res) => {
  const categoryId = req.params.id;

  const sql = `
    SELECT Events.id AS id,
           Events.title,
           Events.description,
           Events.date,
           Events.location,
           Events.images,
           "Event Categories".name AS category_name
           
    FROM Events
    INNER JOIN eventshavecategories
    ON Events.id = eventshavecategories.event_id
    INNER JOIN "Event Categories"
    ON eventshavecategories.category_id = "Event Categories".id
    WHERE "Event Categories".id = ?
  `;

  db.all(sql, [categoryId], (err, events) => {
    if (err) return res.render("events", { error: "Error retrieving events." });

    db.all(`SELECT * FROM "Event Categories"`, (err2, categories) => {
      if (err2)
        return res.render("events", { error: "Error retrieving categories." });

      res.render("events", { events, categories, activeCategory: categoryId });
    });
  });
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
    INSERT INTO events (title, description, location, date, images)
    VALUES (?, ?, ?, ?, ?)
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

  db.get("SELECT * FROM events WHERE id = ?", [myid], (err, theEvent) => {
    if (err) {
      console.error(err.message);
      return res.render("one-event", { error: "Error retrieving event." });
    }

    if (!theEvent) {
      return res.render("one-event", { error: "Event not found." });
    }
    const commentsSql = ` 
      SELECT Comments.id, Comments.content, Comments.created_at, Users.username
      FROM Comments
      INNER JOIN Users ON Comments.user_id = Users.id
      WHERE Comments.event_id = ?
    `; /* this part chat gpt helped with  */

    db.all(commentsSql, [myid], (err2, comments) => {
      if (err2) {
        console.error(err2.message);
        return res.render("one-event", {
          e: theEvent,
          error: "Error retrieving comments.",
        });
      }

      res.render("one-event", { e: theEvent, comments });
    });
  });
});

app.post("/events/:eventsid/comments", (req, res) => {
  const eventId = req.params.eventsid;
  const userId = req.session.userId;
  const content = req.body.content;

  if (!req.session.isLoggedIn) {
    return res.render("loggedin", {
      error: "You must be logged in to comment.",
    });
  }

  if (!content || content.trim() === "") {
    /* this part chat gpt helped with  */
    return res.redirect(`/events/${eventId}`);
  }

  const sql = `
    INSERT INTO Comments (event_id, user_id, content, created_at)
    VALUES (?, ?, ?, datetime('now')) 
  `; /* this part chat gpt helped with  */

  db.run(sql, [eventId, userId, content], (err) => {
    if (err) {
      console.error("Error inserting comment:", err.message);
      return res.render("one-event", {
        e: { id: eventId },
        error: "Error saving your comment.",
      });
    }
    res.redirect(`/events/${eventId}`);
  });
});

app.post("/events/:eventsid/comments/:commentid/delete", (req, res) => {
  const eventId = req.params.eventsid;
  const commentId = req.params.commentid;

  if (!req.session.isAdmin) {
    return res
      .status(403)
      .send("Forbidden"); /* this part chat gpt helped with  */
  }

  const sql = `DELETE FROM Comments WHERE id = ?`;

  db.run(sql, [commentId], (err) => {
    if (err) {
      console.error("Error deleting comment:", err.message);
      return res.render("one-event", {
        e: { id: eventId },
        error: "Error deleting comment.",
      });
    }

    res.redirect(`/events/${eventId}`);
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
      e: { id: myid, title, description: desc, location, date, images },
      error: "Please fill in all fields.",
    });
  }

  const sql = `
    UPDATE events
    SET title = ?, description = ?, location = ?, date = ? images = ?
    WHERE id = ?
  `;

  db.run(sql, [title, desc, location, date, images, myid], function (err) {
    if (err) {
      console.error("Database error:", err.message);
      return res.render("modify-event", {
        e: { id: myid, title, description: desc, location, date, images },
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

  db.get(
    "SELECT * FROM Users WHERE username = ?",
    [username],
    (error, user) => {
      if (error) {
        console.log(error);
        return res.render("loggedin", { error: "Database error." });
      }

      if (!user) {
        console.log("User not found");
        return res.render("loggedin", { error: "User not found." });
      }

      bcrypt.compare(password, user.password, (error, result) => {
        if (error) {
          console.log(error);
          return res.render("loggedin", { error: "Error checking password." });
        }

        if (!result) {
          console.log("Wrong Password");
          return res.render("loggedin", { error: "Wrong password." });
        }

        req.session.isLoggedIn = true;
        req.session.un = username;
        req.session.userId = user.id;
        req.session.isAdmin = user.role == "admin";

        console.log(" >SESSION INFORMATION: ", JSON.stringify(req.session));
        res.redirect("/home");
      });
    }
  );
});

app.engine(
  "handlebars",
  engine({
    helpers: {
      eq(a, b) {
        return a == b;
      },
      ifEquals(a, b, options) {
        /* this part chat gpt helped with 409-427  */
        return a == b ? options.fn(this) : options.inverse(this);
      },
      formatMonth: function (date) {
        const d = new Date(date);
        return d.toLocaleString("en-US", { month: "short" }).toUpperCase();
      },
      formatDay: function (date) {
        return new Date(date).getDate();
      },
      formatYear: function (date) {
        return new Date(date).getFullYear();
      },
      formatTime: function (date) {
        return new Date(date).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      },
    },
  })
);

app.set("view engine", "handlebars");
app.set("views", "./views");

app.listen(port, () => {
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

app.get("/admin/users", (req, res) => {
  if (!req.session.isAdmin) {
    return res.render("loggedin", {
      error: "You must be logged in as admin to see users.",
    });
  }

  const sql = `SELECT id, username, email, role FROM Users`;

  db.all(sql, (err, users) => {
    if (err) {
      console.error(err.message);
      return res.render("home", { error: "Error loading users." });
    }

    res.render("admin-users", { users });
  });
});

app.post("/admin/users/delete/:id", (req, res) => {
  if (!req.session.isAdmin) {
    return res.render("loggedin", {
      error: "Admins only.",
    });
  }

  const userId = req.params.id;

  db.run("DELETE FROM Users WHERE id = ?", [userId], (err) => {
    if (err) {
      console.error("Error deleting user:", err.message);
      return res.render("admin-users", { error: "Error deleting user." });
    }

    console.log(`User ${id} deleted successfully.`);
    res.redirect("/admin/users");
  });
});

app.get("/signin", (req, res) => {
  res.render("signin", { title: "Sign Up" });
});

app.post("/signin", (req, res) => {
  const { email, username, password, confirmPassword } = req.body;

  if (!email || !username || !password || !confirmPassword) {
    return res.render("signin", { error: "All fields are required." });
  }

  if (password !== confirmPassword) {
    return res.render("signin", { error: "Passwords do not match." });
  }

  // Hash password
  bcrypt.hash(password, 12, (err, hashedPassword) => {
    if (err) {
      console.log(err);
      return res.render("signin", { error: "Error while hashing password." });
    }

    // Insert into database
    const sql = `INSERT INTO Users (username, email, password, role)
                 VALUES (?, ?, ?, ?)`;

    db.run(sql, [username, email, hashedPassword, "user"], function (err2) {
      if (err2) {
        console.log(err2);
        return res.render("signin", {
          error: "Username or email already exists.",
        });
      }
      req.session.isLoggedIn = true;
      req.session.un = username;
      req.session.isAdmin = false;
      res.redirect("/home");
    });
  });
});

app.get("/home", (req, res) => {
  const eventsSql = `
    SELECT id, title, description, date, images
    FROM Events
    ORDER BY date ASC
    LIMIT 6
  `;

  const categoriesSql = `
    SELECT id, name
    FROM "Event Categories"
    LIMIT 3
  `;

  db.all(eventsSql, (err, events) => {
    if (err) return res.render("home", { error: "Error loading events." });

    db.all(categoriesSql, (err2, categories) => {
      if (err2)
        return res.render("home", { error: "Error loading categories." });

      res.render("home", {
        pageClass: "home",
        events,
        categories,
        session: req.session,
      });
    });
  });
});

app.get("/about", (req, res) => {
  res.render("about", { pageClass: "about" });
});

app.get("/images", requireLogin, (req, res) => {
  /* this part chat gpt helped with  */
  const sql = `
    SELECT Images.id, Images.filename, Images.description, Users.username, Images.created_at
    FROM Images
    INNER JOIN Users ON Images.user_id = Users.id`;

  db.all(sql, (err, rows) => {
    if (err)
      return res.render("images", {
        error: "Error loading images.",
        session: req.session,
      });
    res.render("images", {
      pics: rows,
      session: req.session,
      pageClass: "images",
    });
  });
});

app.get("/images/new", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render("images", {
      error: "You must be logged in to upload images.",
    });
  }
  res.render("create-post");
});

app.post("/images/new", upload.single("image"), (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render("images", { error: "You must be logged in." });
  }

  if (!req.file) {
    return res.render("form-images", {
      error: "Please select an image to upload.",
    });
  }

  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.render("form-images", {
      error: "Only JPG and PNG files are allowed.",
    });
  }

  const filename = req.file.filename;
  const description = req.body.description;
  const userId = req.session.userId;

  const sql = `INSERT INTO Images (filename, description, user_id, created_at)
               VALUES (?, ?, ?, datetime('now'))`; /* this part chat gpt helped with  */

  db.run(sql, [filename, description, userId], (err) => {
    if (err) {
      console.log(err);
      return res.render("form-images", { error: "Error uploading image." });
    }
    res.redirect("/images");
  });
});

app.post("/images/delete/:id", (req, res) => {
  if (!req.session.isAdmin) {
    return res.render("images", { error: "Admins only." });
  }

  const id = req.params.id;
  db.run("DELETE FROM Images WHERE id = ?", [id], (err) => {
    if (err) console.log(err);
    res.redirect("/images");
  });
});

app.get("/images/modify/:id", (req, res) => {
  const id = req.params.id;

  if (!req.session.isAdmin) {
    return res.render("loggedin", {
      error: "You must be logged in as admin to modify an image.",
    });
  }

  db.get("SELECT * FROM Images WHERE id = ?", [id], (err, img) => {
    if (err) {
      console.error(err.message);
      return res.render("images", { error: "Error retrieving image." });
    }

    if (!img) {
      return res.render("images", { error: "Image not found." });
    }

    res.render("modify-image", { img });
  });
});

app.post("/images/modify/:imageid", upload.single("image"), (req, res) => {
  const imageid = req.params.imageid;
  const { filename, description } = req.body;
  const newFilename = req.file
    ? req.file.filename
    : filename; /* this part chat gpt helped with  */

  if (!req.session.isAdmin) {
    return res.render("loggedin", {
      error: "You must be logged in as admin to modify an image.",
    });
  }

  if (!description || description.trim() === "") {
    return res.render("modify-image", {
      img: { id: imageid, filename: newFilename, description },
      error: "Please fill in all fields.",
    });
  }

  const sql = `
    UPDATE Images
    SET filename = ?, description = ?
    WHERE id = ?
  `;

  db.run(sql, [newFilename, description, imageid], function (err) {
    if (err) {
      console.error("Database error:", err.message);
      return res.render("modify-image", {
        img: { id: imageid, filename: newFilename, description },
        error: "Error updating image.",
      });
    }

    console.log(`Image ${imageid} updated successfully.`);
    res.redirect("/images");
  });
});

app.get("/contact", (req, res) => {
  res.render("contact", { pageClass: "contact" });
});
// Delete own account
app.post("/account/delete", (req, res) => {
  if (!req.session.isLoggedIn) {
    return res.render("loggedin", {
      error: "You must be logged in to delete your account.",
    });
  }

  const userId = req.session.userId;

  // Delete the user from the database
  db.run("DELETE FROM Users WHERE id = ?", [userId], function (err) {
    if (err) {
      console.error("Error deleting account:", err.message);
      return res.render("loggedin", { error: "Error deleting your account." });
    }

    // Destroy session after deletion
    req.session.destroy((err) => {
      /* this part chat gpt helped with  */
      if (err) {
        console.error("Error destroying session:", err);
        return res.render("loggedin", {
          error: "Account deleted but session could not be destroyed.",
        });
      }
      res.redirect("/signin");
    });
  });
});

//errors
app.use((req, res) => {
  res.status(404).render("404.handlebars");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("500");
});
