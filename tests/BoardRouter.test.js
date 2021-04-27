const Employee = require("../models/EmployeeModel");
const Token = require("../models/TokenModel");

const request = require("supertest")
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json())

const loginRouter = require("../routes/LoginRouter");
const BoardRouter = require('../routes/BoardRouter');


var c = new BoardRouter('/board',app)
var a = new loginRouter('/login', app)


describe('GET /board', function() {
    var auth = {};
    beforeAll(loginUser(auth));

    test('should respond with defined columns and tasks', async function(done) {

        const response = await request(app)
            .get('/board')
            .set('Authorization', 'bearer ' + auth.token)

        expect(response.body.columns).toBeDefined()
        console.log(response.body.columns)
        expect(response.body.tasks).toBeDefined()
        console.log(response.body.tasks)
        done()
    });

    test("valid move phase", async function(done) {

        const response = await request(app)
            .post('/board/edit/3/phase')
            .set('Authorization', 'bearer ' + auth.token)
            .send({phaseId: 7})

        expect(response.body.error).toBe(false)
        done()
    });

    test("move to other team's phase", async function(done) {

        const response = await request(app)
            .post('/board/edit/3/phase')
            .set('Authorization', 'bearer ' + auth.token)
            .send({phaseId: 2})

        expect(response.body.error).toBe(true)
        expect(response.body.message).toBeDefined()
        done()
    });

});

function loginUser(auth) {
    return function(done) {
        request(app)
            .post('/login')
            .send({
                username: 'voditelj23',
                password: 'voditelj23'
            })
            .expect(200)
            .end(onResponse);

        function onResponse(err, res) {
            auth.token = res.body.token;
            return done();
        }
    };
}

