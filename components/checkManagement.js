const db = require('../db');
const Token = require("../models/TokenModel");
const User = require("../models/UserModel");

function authentificator(roles) {
    return async function checkValid(req, res, next) {
        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];

        if (tokenValue == null) {
            //ako nije predan token
            res.status(401).send("Token not submitted");
            return;

        } else {

            try {
                let token = new Token(tokenValue);
                let tokenExists = await token.exists();
                if (!tokenExists) {
                    res.status(403).send("Token doesn't exist in the system");
                    return;
                }
                await token.populateFromDatabase();

                // if ((Date.now() / 1000) - (Date.parse(token.createdAt) / 1000) > 43200) {
                //     await token.delete();
                //     res.status(403).send("Token expired");
                //     return;
                // }
                let user = new User(token.username, null, null)
                await user.populateRoleFromDatabase();
                if (!roles.includes(user.usertype)) {
                    res.status(403).send("You don't have the permissions to access this");
                    return;
                }

                next();

            } catch (error) {
                console.log(error);
                res.status(400).send("Error in database");
                return;
            }
        }
    }
}

module.exports = authentificator;

