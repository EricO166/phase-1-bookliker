document.addEventListener("DOMContentLoaded", function () {
    fetchBooks();
});



// ----- DOM CACHES --------------------------------------------------------
const listUl = document.querySelector("#list");
const showPanel = document.querySelector("#show-panel");

// -------------------------------------------------------------------------


// -------------------------------------------------------------------------
// FETCH & RENDER LIST -----------------------------------------------------
function fetchBooks() {
  fetch("http://localhost:3000/books")
    .then((res) => res.json())
    .then(renderBookList)
    .catch((err) => console.error("Failed to fetch books:", err));
}

function renderBookList(books) {
  // Clear any existing <li> elements (helps with hot reloads/tests)
  listUl.innerHTML = "";
  books.forEach((book) => {
    const li = document.createElement("li");
    li.textContent = book.title;
    li.addEventListener("click", () => renderBookDetails(book));
    listUl.appendChild(li);
  });


// -------------------------------------------------------------------------
// SHOW DETAILS ------------------------------------------------------------
//function renderBookDetails(book) {
  showPanel.innerHTML = ""; // wipe previous content

  const title = document.createElement("h2");
  title.textContent = book.title;

  const img = document.createElement("img");
  img.src = book.img_url;
  img.alt = `${book.title} cover`;

  const subtitle = book.subtitle ? document.createElement("h4") : null;
  if (subtitle) subtitle.textContent = book.subtitle;

  const author = document.createElement("h4");
  author.textContent = `Author: ${book.author}`;

  const description = document.createElement("p");
  description.textContent = book.description;

  // Users list
  const usersHeader = document.createElement("h4");
  usersHeader.textContent = "Liked by:";

  const usersUl = document.createElement("ul");
  usersUl.id = "users-ul";
  populateUsersUl(usersUl, book.users);

  // Like/unlike button
  const likeBtn = document.createElement("button");
  likeBtn.id = "like-btn";
  likeBtn.textContent = userHasLiked(book) ? "UNLIKE" : "LIKE";
  likeBtn.addEventListener("click", () => handleLikeToggle(book));

  // Append all nodes to show panel
  showPanel.append(title, img);
  if (subtitle) showPanel.append(subtitle);
  showPanel.append(author, description, usersHeader, usersUl, likeBtn);
}

//function populateUsersUl(ul, usersArr) {
  ul.innerHTML = ""; // clear existing
  usersArr.forEach((user) => {
    const li = document.createElement("li");
    li.textContent = user.username;
    ul.appendChild(li);
  });
}

// -------------------------------------------------------------------------
// LIKE / UNLIKE -----------------------------------------------------------
function userHasLiked(book) {
  return book.users.some((u) => u.id === CURRENT_USER.id);
}

function handleLikeToggle(book) {
  const hasLiked = userHasLiked(book);
  // Compute new users array
  const updatedUsers = hasLiked
    ? book.users.filter((u) => u.id !== CURRENT_USER.id)
    : [...book.users, CURRENT_USER];

  // Send PATCH to backend
  fetch(`${BOOKS_URL}/${book.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ users: updatedUsers }),
  })
    .then((res) => res.json())
    .then((updatedBook) => {
      // Update local book reference (helps when clicking again)
      Object.assign(book, updatedBook);
      // Re‑render details to reflect new like state
      renderBookDetails(updatedBook);
    })
    .catch((err) => console.error("PATCH /books/:id failed:", err));
}

// -------------------------------------------------------------------------
// EXPORTS (helps the Jest/CodeGrade test runner import functions if needed)
if (typeof module !== "undefined") {
  module.exports = {
    fetchBooks,
    renderBookList,
    renderBookDetails,
    userHasLiked,
    handleLikeToggle,
  };
}
