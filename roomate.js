const axios = require("axios");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const nuevoRoommate = async () => {
  try {
    const { data } = await axios.get("https://randomuser.me/api/");
    const usuario = data.results[0];
    const user = {
      id: uuidv4().slice(30),
      nombre: `${usuario.name.first} ${usuario.name.last}`,
      debe: 0,
      recibe: 0,
      correo: usuario.email,
    };
    return user;
  } catch (e) {
    throw e;
  }
};
const guardarUsuario = (usuario) => {
  const roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
  roommatesJSON.roommates.push(usuario);
  fs.writeFileSync("roommates.json", JSON.stringify(roommatesJSON));
};
const reset = (usuario) => {
  const roommatesJSON = JSON.parse(fs.readFileSync("roommates.json", "utf8"));
  const gastosJSON = JSON.parse(fs.readFileSync("gastos.json", "utf8"));
  roommatesJSON.roommates.length = 0;
  gastosJSON.gastos.length = 0;
  fs.writeFileSync("roommates.json", JSON.stringify(roommatesJSON));
  fs.writeFileSync("gastos.json", JSON.stringify(gastosJSON));
};
module.exports = { nuevoRoommate, guardarUsuario, reset };
