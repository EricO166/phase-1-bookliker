//  CONFIG
const BASE_URL    = "http://localhost:3000";
const BOOKS_URL   = `http://localhost:3000/books`;
const CURRENT_USER = { id: 1, username: "pouros" };

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", fetchBooks);

//  DOM CACHES
const listUl   = document.querySelector("#list");
const showPanel = document.querySelector("#show-panel");

// FETCH & RENDER LIST
function fetchBooks() {
  fetch(BOOKS_URL)
    .then((res) => res.json())
    .then(renderBookList)
    .catch((err) => console.error("Failed to fetch books:", err));
}

function renderBookList(books) {
  listUl.innerHTML = "";           // clear any old <li>s
  books.forEach((book) => {
    const li = document.createElement("li");
    li.textContent = book.title;
    li.addEventListener("click", () => renderBookDetails(book));
    listUl.appendChild(li);
  });
}

// SHOW DETAILS
function renderBookDetails(book) {
  showPanel.innerHTML = "";  // remove previous book

  // Title, cover image, (optional) subtitle
  const title = document.createElement("h2");
  title.textContent = book.title;

  const img = document.createElement("img");
  img.src  = book.img_url;
  img.alt  = `${book.title} cover`;

  //const subtitle =
    book.subtitle && book.subtitle.trim() !== ""
      ? Object.assign(document.createElement("h4"), { textContent: book.subtitle })
      : null;

  // Author + description
  const author = document.createElement("h4");
  author.textContent = `Author: ${book.author}`;

  const description = document.createElement("p");
  description.textContent = book.description;

  // Users list
  const usersHeader = document.createElement("h4");
  usersHeader.textContent = "Liked by:";

  const usersUl = document.createElement("ul");
  populateUsersUl(usersUl, book.users);

  // Like / Unlike button
  const likeBtn = document.createElement("button");
  likeBtn.id = "like-btn";
  likeBtn.addEventListener("click", () => handleLikeToggle(book));
  likeBtn.textContent = userHasLiked(book) ? "UNLIKE" : "LIKE";

  // Append everything in order
  showPanel.append(title, img);
  //if (subtitle) showPanel.append(subtitle);
  showPanel.append(author, description, usersHeader, usersUl, likeBtn);
}

//  HELPERS
function populateUsersUl(ul, usersArr) {
  ul.innerHTML = "";
  usersArr.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.username;
    ul.appendChild(li);
  });
}

function userHasLiked(book) {
  return book.users.some((u) => u.id === CURRENT_USER.id);
}

// LIKE / UNLIKE
function handleLikeToggle(book) {
  const hasLiked = userHasLiked(book);

  // Build new users array
  const updatedUsers = hasLiked
    ? book.users.filter((u) => u.id !== CURRENT_USER.id) // remove me
    : [...book.users, CURRENT_USER];                     // add me

  fetch(`http://localhost:3000/books/${book.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ users: updatedUsers }),
  })
    .then((res) => res.json())
    .then((updatedBook) => {
      Object.assign(book, updatedBook);    // keep local object fresh
      renderBookDetails(updatedBook);      // redraw panel
    })
    .catch((err) => console.error("PATCH /books/:id failed:", err));
}