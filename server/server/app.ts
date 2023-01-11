import http, { IncomingMessage, Server, ServerResponse } from "http";
import fs from "node:fs";
import url from "node:url";
/*
implement your server code here
*/

let file = fs.readFileSync(
  "/Users/Decadev/Desktop/Week-5/week-5-task-timiFoxtrot/server/server/database.json",
  "utf8"
);

let parsedFile = file ? JSON.parse(file) : [];

const server: Server = http.createServer(
  (req: IncomingMessage, res: ServerResponse) => {
    interface Object {
      organization: string;
      createdAt: string;
      updatedAt: string;
      products: [];
      marketValue: string;
      address: string;
      ceo: string;
      country: string;
      id: number;
      noOfEmployees: number;
      employees: [];
    }

    //Helper function to get ID
    function getID() {
      let id: number = 0;
      if (req.url) {
        const queryObj = url.parse(req.url, true).query;
        id = Number(queryObj.id);
      }
      return id;
    }

    //Helper function to write to file
    function writeFileData(file: []) {
      fs.writeFile(
        "/Users/Decadev/Desktop/Week-5/week-5-task-timiFoxtrot/server/server/database.json",
        JSON.stringify(file),
        (err) => {
          if (err) {
            const message = { message: "Could not process data!" };
            res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify(message, null, 2));
          }
        }
      );
    }

    //Read
    if (getID() && req.method === "GET") {
      if (getID()) {
        let fileToBeRead = parsedFile.find((org: Object) => org.id === getID());
        if (fileToBeRead) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(fileToBeRead));
          return;
        } else {
          const message = { message: "id not found" };
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify(message, null, 2));
          return;
        }
      } else {
        const message = { message: "no id provided!" };
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(message, null, 2));
      }
    }

    //Read All
    if (req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(
        JSON.stringify({
          result: parsedFile.length,
          data: parsedFile,
        })
      );
    }

    //Create
    if (req.method === "POST") {
      req.on("data", (data) => {
        const jsonData = JSON.parse(data);
        const organization = jsonData.organization;
        if (organization) {
          let maxId = 0;
          parsedFile.forEach((org: Object) => {
            if (org.id > maxId) maxId = org.id;
          });
          jsonData.id = maxId + 1;
          jsonData.createdAt = new Date();
          jsonData.updatedAt = new Date();
          parsedFile.push(jsonData);
          writeFileData(parsedFile);
          res.writeHead(201, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              result: parsedFile.length,
              data: parsedFile,
            })
          );
        } else {
          const message = { message: "Missing important field" };
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify(message, null, 2));
        }
      });
    }

    // Update
    if (req.method === "PUT") {
      req.on("data", (data) => {
        let parsedBodyUpdate = JSON.parse(data);
        parsedBodyUpdate.updatedAt = new Date();
        const id = parsedBodyUpdate.id;
        parsedFile.forEach((org: Object, index: number) => {
          if (org.id === id) {
            parsedFile[index] = parsedBodyUpdate;
          }
        });
        writeFileData(parsedFile);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            result: parsedFile.length,
            data: parsedFile,
          })
        );
      });
    }

    //Delete
    if (req.method === "DELETE") {
      if (getID()) {
        const organization = parsedFile.find((el: Object) => el.id === getID());
        if (organization) {
          parsedFile = parsedFile.filter((org: Object) => org.id !== getID());
          writeFileData(parsedFile);
          res.writeHead(204, { "Content-Type": "application/json" });
          return res.end(
            JSON.stringify({
              data: null,
              message: "File deleted successfully",
            })
          );
        } else {
          const message = { message: "File not found" };
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify(message, null, 2));
        }
      } else {
        const message = { message: "no id provided!" };
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify(message, null, 2));
      }
    }
  }
);
server.listen(3005);
