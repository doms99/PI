const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')

const loginRouter = require('./routes/LoginRouter');
const BoardRouter = require('./routes/BoardRouter');
const LeaderRouter = require('./routes/LeaderRouter');
const ManagementRouter = require('./routes/ManagementRouter');
const CoordinatorRouter = require('./routes/CoordinatorRouter');
const CalendarRouter = require('./routes/CalendarRouter');

app.use(cors())
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json())

var a = new loginRouter('/login', app)
var c = new BoardRouter('/board',app)
var d = new LeaderRouter('/leader',app)
var e = new ManagementRouter('/management', app)
var f = new CoordinatorRouter('/coordinator', app)
var g = new CalendarRouter('/calendar',app)


const port = process.env.PORT || 3005

app.listen(port, () => console.log("SERVER STARTED ON PORT ", port));