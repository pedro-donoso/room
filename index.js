const http = require("http");
// 1. Ocupar el módulo File System para la manipulación de archivos alojados en el
// servidor (3 Puntos)
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const url = require("url");
const { nuevoRoommate, guardarUsuario, reset } = require("./roomate.js");
const { send } = require("./correo");
const { agregaGasto, modificaGasto, actualizarGastoRommie } = require("./calculos");

http
  .createServer((req, res) => {
    if (req.url == "/" && req.method == "GET") {
      res.setHeader("content-type", "text/html");
      res.end(fs.readFileSync("index.html", "utf8"));
    }

    if (req.url.startsWith("/roommate") && req.method == "POST") {
      nuevoRoommate()
        .then(async (usuario) => {
          guardarUsuario(usuario);
          res.end(JSON.stringify(usuario, null, 1));
        })
        .catch((e) => {
          res.statusCode = 500;
          res.end();
          console.log("Error en el registro de un usuario random", e);
        });
    }

    if (req.url.startsWith("/deleteUser") && req.method == "DELETE") {
      nuevoRoommate()
        .then(async (usuario) => {
          reset(usuario);
          res.end(JSON.stringify(usuario, null, 1));
        })
        .catch((e) => {
          res.statusCode = 500;
          res.end();
          console.log("Error borrando usuario", e);
        });
    }
    // e. GET /roommates: Devuelve todos los roommates almacenados en el servidor
    // (roommates.json)

    if (req.url.startsWith("/roommates") && req.method == "GET") {
      res.setHeader("content-type", "application/json");
      res.end(fs.readFileSync("roommates.json", "utf8"));
    }

    // Array que contiene todos los datos desde el archivo
    let gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
    let gastos = gastosJSON.gastos;

    // a. GET /gastos: Devuelve todos los gastos almacenados en el archivo gastos.json.

    if (req.url.startsWith("/gastos") && req.method == "GET") {
      res.end(JSON.stringify(gastosJSON, null, 1));
    }

    // b. POST /gasto: Recibe el payload con los datos del gasto y los almacena en un archivo JSON (gastos.json).

    if (req.url.startsWith("/gasto") && req.method == "POST") {
      let body;

      req.on("data", (payload) => {
        body = JSON.parse(payload);
      });

      req.on("end", () => {
        gasto = {
          id: uuidv4().slice(30),
          roommate: body.roommate,
          descripcion: body.descripcion,
          monto: body.monto,
        };
        gastos.push(gasto);

        agregaGasto(body);

        // 6. Enviar un correo electrónico a todos los roommates cuando se registre un nuevo
        // gasto. Se recomienda agregar a la lista de correos su correo personal para verificar
        // esta funcionalidad. (Opcional)

        let verRm = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
        let datosRm = verRm.roommates;
        let nombre = gastos.map((e) => e.roommate);
        let descripcion = gastos.map((e) => e.descripcion);
        let monto = gastos.map((e) => e.monto);
        let correos = datosRm.map((e) => e.correo);

        send(nombre, descripcion, monto, correos)
          .then(() => {
            res.end();
          })
          .catch((e) => {
            res.statusCode = 500;
            res.end();
            console.log("Error en el envío de correo", e);
          });

        fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 1));
        res.end();
      });
    }

    // c. PUT /gasto: Recibe el payload de la consulta y modifica los datos
    // almacenados en el servidor (gastos.json).

    if (req.url.startsWith("/gasto") && req.method == "PUT") {
      let body;

      // Traer el id a través de query strings
      const { id } = url.parse(req.url, true).query;

      req.on("data", (payload) => {
        body = JSON.parse(payload);
        body.id = id;
      });

      req.on("end", () => {
        modificaGasto(body);

        gastosJSON.gastos = gastos.map((g) => {
          if (g.id == body.id) {
            return body;
          }
          return g;
        });
        fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 1));
        res.end();
      });
    }
    //     d. DELETE /gasto: Recibe el id del gasto usando las Query Strings y la elimine
    //      del historial de gastos (gastos.json).

    if (req.url.startsWith("/gasto") && req.method == "DELETE") {
      const { id } = url.parse(req.url, true).query;
      gastosJSON.gastos = gastos.filter((g) => g.id !== id);
      fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON, null, 1));
      res.end();
    }
  })
  .listen(3000, console.log("Servidor ON"));
