"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const cheerio = __importStar(require("cheerio"));
const request = require("request");
/*
implement your server code here
*/
const server = http_1.default.createServer((req, res) => {
    if (req.url === "/scrape" && req.method === "POST") {
        req.on("data", (data) => {
            const jsonData = JSON.parse(data);
            const url = jsonData.url;
            if (url) {
                request(url, (error, response, body) => {
                    if (error) {
                        res.end(JSON.stringify({ error: "There was an error of some kind" }));
                        return;
                    }
                    const reqObject = {};
                    let $ = cheerio.load(body);
                    let title = $("head title").text();
                    let description = $('meta[name="description"]').attr("content")
                        ? $('meta[name="description"]').attr("content")
                        : "Oops! This website does not have a description";
                    let images = $("img");
                    let imageUrls = [];
                    images.each((index, el) => {
                        const imageUrl = $(el).attr("src");
                        imageUrls.push(imageUrl);
                    });
                    reqObject.title = title;
                    reqObject.description = description;
                    reqObject.imageUrls = imageUrls;
                    res.end(JSON.stringify(reqObject, null, 2));
                });
            }
            else {
                const message = { message: "Please provide a url" };
                res.writeHead(400, { "Content-Type": "application/json" });
                res.end(JSON.stringify(message, null, 2));
            }
        });
    }
});
server.listen(3001);
