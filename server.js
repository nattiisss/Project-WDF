const express = require("express");
const app = express();
const port = 5482;

const sqlite3 = require("sqlite3");
const dbFile = "my-project-db.sqlite3.db";
db = new sqlite3.Database(dbFile);
// creates table Person at startup
db.run(
  `CREATE TABLE Person (pid INTEGER PRIMARY KEY, fname TEXT NOT NULL, lname
TEXT NOT NULL, age INTEGER, email TEXT)`,
  function (error) {
    if (error) {
      // tests error: display error
      console.log("---> ERROR: ", error);
    } else {
      // tests error: no error, the table has been created
      console.log("---> Table created!");
      db.run(
        `INSERT INTO Person (fname, lname, age, email) VALUES ('John',
'Smith', 25, 'john.smith@example.com'), ('Jane', 'Doe', 30, 'jane.doe@mail.com'),
('Alex', 'Johnson', 40, 'alex.johnson@company.com'), ('Emily', 'Brown', 35,
'emily.brown@business.org'), ('Michael', 'Davis', 50, 'michael.davis@email.net'),
('Sarah', 'Miller', 28, 'sarah.miller@example.com'), ('David', 'Garcia', 45,
'david.garcia@mail.com'), ('Laura', 'Rodriguez', 32,
'laura.rodriguez@company.com'), ('Chris', 'Wilson', 27,
'chris.wilson@business.org'), ('Anna', 'Martinez', 22, 'anna.martinez@email.net'),
('James', 'Taylor', 53, 'james.taylor@example.com'), ('Patricia', 'Anderson', 44,
'patricia.anderson@mail.com'), ('Robert', 'Thomas', 38,
'robert.thomas@company.com'), ('Linda', 'Hernandez', 55,
'linda.hernandez@business.org'), ('William', 'Moore', 26,
'william.moore@email.net'), ('Barbara', 'Jackson', 37,
'barbara.jackson@example.com'), ('Richard', 'White', 49, 'richard.white@mail.com'),
('Susan', 'Lee', 24, 'susan.lee@company.com'), ('Joseph', 'Clark', 41,
'joseph.clark@business.org'), ('Jessica', 'Walker', 29,
'jessica.walker@email.net');`,
        function (err) {
          if (err) {
            console.log(err.message);
          } else {
            console.log("---> Rows inserted in the table Person.");
          }
        }
      );
    }
  }
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/index", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
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
