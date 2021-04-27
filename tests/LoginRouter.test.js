const request = require("supertest")
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json())

const loginRouter = require("../routes/LoginRouter");

let lr = new loginRouter("/login", app);

describe("Test the root path", () => {
    test("It should response the GET method", () => {
        return request(app)
            .post("/login")
            .send({username: "user", password: "pass"})
            .then(response => {
                expect(response.body.error).toBe(true)
                expect(response.body.message).toBe("Incorrect username or password");
            });
    });

    test("uprava key func", () => {
        return request(app)
            .post("/login")
            .send({username: "uprava", password: "uprava"})
            .then(response => {
                expect(response.body.name).toBe("uprava");
                expect(response.body.usertype).toBe("uprava");
            });
    });
});

