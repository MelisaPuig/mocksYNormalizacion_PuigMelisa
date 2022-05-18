const socket = io.connect();

const HANDLEBARS_PRODUCTS_URL = "/public/hbs/products.hbs";
const HANDLEBARS_CHATS_URL = "/public/hbs/chats.hbs";

const authorSchema = new normalizr.schema.Entity("autores", undefined, {
  idAttribute: "email",
});
const messageSchema = new normalizr.schema.Entity("mensajes", {
  author: authorSchema,
});
const chatSchema = new normalizr.schema.Entity("chat", {
  mensajes: [messageSchema],
});

function sendMessage(event, message) {
  socket.emit(event, message);
}

async function renderHandlebars(templateUrl, data) {
  const handlebarsTemplateFetch = await fetch(templateUrl);
  const handlebarsTemplate = await handlebarsTemplateFetch.text();
  const compiledTemplate = Handlebars.compile(handlebarsTemplate);
  return compiledTemplate(data);
}

async function getProductsHTML(productos) {
  const hayProductos = productos.length > 0;
  return renderHandlebars(HANDLEBARS_PRODUCTS_URL, { hayProductos, productos });
}

function formatDate(rawDate) {
  const addZero = (number) => (number < 10 ? `0${number}` : number);
  const date = new Date(rawDate);
  const day = date.getDay();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${addZero(day)}/${addZero(month)}/${year} ${addZero(hours)}:${addZero(
    minutes
  )}:${addZero(seconds)}`;
}

async function getChatsHTML(messages) {
  return renderHandlebars(HANDLEBARS_CHATS_URL, { messages });
}

function sendUserChatMessage() {
  const email = document.getElementById("chat_user_email").value;
  const nombre = document.getElementById("chat_user_nombre").value;
  const apellido = document.getElementById("chat_user_apellido").value;
  const edad = document.getElementById("chat_user_edad").value;
  const alias = document.getElementById("chat_user_alias").value;
  const avatar = document.getElementById("chat_user_avatar").value;
  const userMessageInput = document.getElementById("chat_user_message");
  const author = { email, nombre, apellido, edad, alias, avatar };
  const text = userMessageInput.value;
  sendMessage("chats", { author, text });
  userMessageInput.value = "";
}

socket.on("products", async (products) => {
  const productsHTML = await getProductsHTML(products);
  document.getElementById("websocket_products").innerHTML = productsHTML;
});

socket.on("chats", async (chatInfo) => {
  console.log(chatInfo);
  const { normalizedChats, normalizationCompression } = chatInfo;
  const chat = normalizr.denormalize(
    normalizedChats.result,
    chatSchema,
    normalizedChats.entities
  );
  const messages = chat.mensajes;
  const chatsHTML = await getChatsHTML(messages);
  const chatMessages = document.getElementById("chat_messages");
  chatMessages.innerHTML = chatsHTML;
  chatMessages.scrollTop = chatMessages.scrollHeight;
  const normalizationPercentage = document.getElementById(
    "normalizacion_porcentaje_compresion"
  );
  normalizationPercentage.innerHTML = normalizationCompression.toFixed(4) * 100;
});
