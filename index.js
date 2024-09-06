const express = require('express');
const app = express();
const connection = require('./db');
const bcrypt = require('bcrypt');
const SHA256 = require("crypto-js/sha256");
const bodyParser = require('body-parser');

app.use(bodyParser.json());



app.post('/signin', async function (req, res) {

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  connection.query(`INSERT INTO users (pseudo, email, password) VALUES ('${req.body.pseudo}', '${req.body.email}', '${hashedPassword}')`, async (err, result) => {
    if (err) {
      if (err.code == "ER_DUP_ENTRY") {
        return res.send({ "statut": "409", "error": "ER_DUP_ENTRY", "email": req.body.email })
      }
    }
    const token = SHA256(result.insertId).toString() + SHA256(req.body.email).toString() + SHA256(hashedPassword).toString();
    return res.send({ "statut": "200", "token": token, "id": result.insertId })
  });
});



app.post('/login', async function (req, res) {
  connection.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, async (err, result) => {
    if (!result[0]) {
      return res.send({ "statut": "404" }
      )
    }

    if (err) { console.log(err) }
    const hashedPassword = result[0].password;

    const isMatch = await bcrypt.compare(req.body.password, hashedPassword);
    if (isMatch) {

      const token = SHA256(result[0].id).toString() + SHA256(req.body.email).toString() + SHA256(hashedPassword).toString();

      res.send({ "statut": "200", "token": token, "pseudo": result[0].pseudo, "id": result[0].id })
    } else {
      res.send({ "statut": "401" })
    }
  })
})

app.post('/tokenverif', async function (req, res) {
  connection.query(`SELECT * FROM users WHERE email = '${req.body.email}'`, async (err, result) => {
    if (result[0] == undefined) { return res.send({ "statut": "404" }) }

    const bddtoken = SHA256(result[0].id).toString() + SHA256(result[0].email).toString() + SHA256(result[0].password).toString();
    if (bddtoken == req.body.token) {
      res.send({ "statut": "200" })
    } else {
      res.send({ "statut": "401" })
    }
  })

})

app.get('/balance', async function (req, res) {
  connection.query(`SELECT balance FROM balance WHERE id = '${req.query.id}'`, (err, result) => {
    if (err) { 
      res.send({ statut: "500" })
      console.log(err)
    }
    
    res.send({ statut: "200", data: result[0] })
  })
})

app.get('/notif', async function (req, res) {
    connection.query(`SELECT * FROM notification WHERE user_id='${req.query.id}'`, (err, result) => {
      if(err) {
        res.send({ statut : "500"})
        console.log(err)
      }

      res.send({ statut: "200", data: result })
    })
})

app.get('/deletenotif', async function (req, res) {
  connection.query(`DELETE FROM notification WHERE user_id='${req.query.id}'`, (err, result) => {
    if(err) {
      res.send({ statut : "500"})
      console.log(err)
    }

    res.send({ statut: "200" })
  })
})

app.get('/', async function (req, res) {
  res.send("hello world")
})

app.listen(4000);
