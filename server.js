// Database setup:
const sqlite = require('sqlite3').verbose();
let db = my_database('./phones.db');

var express = require("express");
var app = express();

// Parse JSON data in the body of HTTP requests:
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Response headers to avoid browser restrains from request.
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

// Routes/endpoints

//Get a list of entities
app.get("/list", async (req, res, next) => {
    try {
        var sql = "select * from phones"
        var params = []
        db.all(sql, params, (err, rows) => {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            return res.json(rows);
        })
    }
    catch (error) {
        next(error);
    }
});

//Get a single entity by id
app.get('/list/:id', function (req, res, next) {
    try {

        db.all(`SELECT * FROM phones WHERE id=?`, req.params.id, function (err, rows) {
            if (err) {
                res.status(400).json({ "error": err.message });
                return;
            }
            return res.json(rows)

        });
    }
    catch (error) {
        next(error);
    }
});

//Create new entity
app.post("/create", async (req, res, next) => {
    try {
        var data = {
            brand: req.body.brand,
            model: req.body.model,
            os: req.body.os,
            image: req.body.image,
            screensize: req.body.screensize
        }

        db.run(`INSERT INTO phones (brand, model, os, image, screensize)
                VALUES (?, ?, ?, ?, ?)`,
            [data.brand, data.model, data.os, data.image, data.screensize], function (err, result) {
                if (err) {
                    res.status(400).json({ "error": err.message })
                    return;
                }
                // return res.json(data);
                res.json({
                    message: "New data created",
                    data: data,
                    id: this.lastID
                })
            });
    }
    catch (error) {
        next(error);
    }
})

//Update entity by id
app.patch("/update/:id", async (req, res, next) => {
    try {
        var data = {
            brand: req.body.brand,
            model: req.body.model,
            os: req.body.os,
            image: req.body.image,
            screensize: req.body.screensize
        }
        db.run(
            `UPDATE phones set 
               brand= coalesce(?,brand), 
               model = coalesce(?,model), 
               os = coalesce(?,os),
               image = coalesce(?,image), 
               screensize = coalesce(?,screensize)
               WHERE id = ?`,
            [data.brand, data.model, data.os, data.image, data.screensize, req.params.id],
            (err, result) => {
                if (err) {
                    res.status(400).json({ "error": res.message })
                    return;
                }
                res.json({
                    message: "id: " + req.params.id + " updated",
                    data: data,

                })
            });
    }
    catch (error) {
        next(error);
    }
})

//Delete entity by id
app.delete("/delete/:id", (req, res, next) => {
    try {
        db.run(
            `DELETE FROM phones WHERE id = ?`,
            req.params.id,
            function (err, result) {
                if (err) {
                    res.status(400).json({ "error": res.message })
                    return;
                }
                res.json({ "message": "id: " + req.params.id + " deleted" })
            });
    }
    catch (error) {
        next(error);
    }

})

//Reset database
app.get("/reset", (req, res, next) => {
    try {
        db.run(
            `DELETE FROM phones`,
            function (err, result) {
                if (err) {
                    res.status(400).json({ "error": res.message })
                    return;
                }
                next();
            });
        db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
            ["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
        res.json({
            success: "reset database success"
        })
    }
    catch (error) {
        next(error);
    }

})

// Root path
* app.all("/", (req, res, next) => {
    res.json({ "message": "RESTful API server by Lab66" })
});



//Error handler
//Server error (500)
function error_handler(err, req, res, next) {
    if (err) {
        res.status(500)
            .json({
                message: `${message || 'server error'}`
            })
    }
    else {
    }
}
app.use(error_handler);

//API not exist (404)
function not_found_handler(req, res, next) {
    res.status(404);
    res.json({
        message: 'api not exist or wrong HTTP method'
    })
}
app.use(not_found_handler);

//Port
app.listen(3000);
console.log("Server started.");

// Some helper functions called above
function my_database(filename) {
    // Conncect to db by opening filename, create filename if it does not exist:
    var db = new sqlite.Database(filename, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the phones database.');
    });
    // Create our phones table if it does not exist already:
    db.serialize(() => {
        db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
        db.all(`select count(*) as count from phones`, function (err, result) {

            if (result[0].count == 0) {
                db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
                    ["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
            } else {
                console.log("Database already contains", result[0].count, " item(s) at startup.");
            }
        });
    });
    return db;
}