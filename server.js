const fs = require('fs');
const express = require('express');
const next = require('next');

const http = require('http');
const https = require('https');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const http_port = process.env.PORT || 7001;

app.prepare().then(() => {
    const server = express();
    // const router = express.Router();

    // Redirects primary url to runs/all
    server.get('/', (req, res) => {
        res.redirect('/online/global');
    });
    server.get('/online', (req, res) => {
        res.redirect('/online/global');
    });
    server.get('/offline', (req, res) => {
        res.redirect('/offline/workspaces/global');
    });

    //online:
    server.get('/online/:workspace', (req, res) => {
        req.params.type = 'online';
        const params = { ...req.headers, ...req.params, filters: req.query };
        app.render(req, res, `/online`, params);
    });

    // offline:
    // section can be either datasets or cycles
    server.get('/offline/:section/:workspace', (req, res) => {
        req.params.type = 'offline';
        const params = { ...req.headers, ...req.params, filters: req.query };
        app.render(req, res, `/offline`, params);
    });

    server.get('*', (req, res) => {
        return handle(req, res);
    });

    server.listen(http_port, err => {
        if (err) throw err;
        console.log(`> HTTP listening in port ${http_port}`);
    });
});
