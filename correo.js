const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "correopruebas765@gmail.com",
    pass: "nodemailer",
  },
});
const send = async (nombre, descripcion, monto) => {
  let mailOptions = {
    from: "correopruebas765@gmail.com",
    to: ["correopruebas765@gmail.com"],
    subject: `Nuevo gasto agregado`,
    html: `<h3>Se ha registrado un nuevo gasto de ${nombre}. La descripción es: ${descripcion}, por un monto de $.${monto}</h3>`,
  };
  try {
    const result = await transporter.sendMail(mailOptions);
  } catch (e) {
    throw e;
  }
};
module.exports = { send };
