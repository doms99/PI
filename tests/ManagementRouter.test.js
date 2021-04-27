const request = require("supertest")
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json())

const loginRouter = require("../routes/LoginRouter");
const managemetRouter = require('../routes/ManagementRouter');


var a = new loginRouter('/login', app)
var c = new managemetRouter('/management',app)


describe('management tests', function() {
    var auth = {};
    beforeAll(loginUser(auth));

    test('should respond with array - promoGET', async function(done) {
        const response = await request(app)
            .get('/management/promo')
            .set('Authorization', 'bearer ' + auth.token)

        expect(response.body.users).toBeDefined()
        console.log(response.body.users)
        expect(response.body.error).toBeUndefined()
        console.log(response.body.error)
        done()
    });

    test('should respond with no error - promoPOST', async function(done){
        const response = await request(app)
            .post('/management/promo')
            .set('Authorization', 'bearer ' + auth.token)
            .send({
                username: 'voditelj5'
            })

        expect(response.body.error).toBe(false)
        console.log(response.body.error)
        expect(response.body.message).toBeDefined()
        console.log(response.body.message)
        done()
    });

    test('should respond with error - promoPOST', async function(done){
        const response = await request(app)
            .post('/management/promo')
            .set('Authorization', 'bearer ' + auth.token)
            .send({
                username: 'uprava'
            })

        expect(response.body.error).toBe(true)
        console.log(response.body.error)
        expect(response.body.message).toBeDefined()
        console.log(response.body.message)
        done()
    });



});

function loginUser(auth) {
    return function(done) {
        request(app)
            .post('/login')
            .send({
                username: 'uprava',
                password: 'uprava'
            })
            .expect(200)
            .end(onResponse);

        function onResponse(err, res) {
            auth.token = res.body.token;
            return done();
        }
    };
}

