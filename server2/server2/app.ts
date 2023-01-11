import http, { IncomingMessage, Server, ServerResponse } from "http";
import * as cheerio from "cheerio";
const request = require("request");
/*
implement your server code here
*/

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === "/scrape" && req.method === "POST") {
      req.on("data", (data) => {
        const jsonData = JSON.parse(data);

        const url = jsonData.url;

        if (url) {
          request(url, (error: {}, response: {}, body: string) => {
            if (error) {
              res.end(
                JSON.stringify({ error: "There was an error of some kind" })
              );
              return;
            }

            interface Object {
              title?: string;
              description?: string;
              imageUrls?: object;
            }

            const reqObject: Object = {};
            let $ = cheerio.load(body);
            let title = $("head title").text();
            let description = $('meta[name="description"]').attr("content")
              ? $('meta[name="description"]').attr("content")
              : "Oops! This website does not have a description";
            let images = $("img");
            let imageUrls: Array<string> = [];
            images.each((index, el) => {
              const imageUrl: string = $(el).attr("src") as string;
              imageUrls.push(imageUrl);
            });
            reqObject.title = title;
            reqObject.description = description;
            reqObject.imageUrls = imageUrls;

            res.end(JSON.stringify(reqObject, null, 2));
          });
        } else {
          const message = { message: "Please provide a url" };
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify(message, null, 2));
        }
      });
    }
  }
);

server.listen(3001);
