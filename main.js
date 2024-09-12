document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function addBook() {
  const getBookTitle = document.querySelector(
    '[data-testid="bookFormTitleInput"]'
  ).value;
  const getBookAuthor = document.querySelector(
    '[data-testid="bookFormAuthorInput"]'
  ).value;
  const getBookYear = parseInt(
    document.querySelector('[data-testid="bookFormYearInput"]').value
  );
  const isCompleteCheck = document.querySelector(
    '[data-testid="bookFormIsCompleteCheckbox"]'
  ).checked;
  const generateID = generateId();
  const bookObject = generateToObject(
    generateID,
    getBookTitle,
    getBookAuthor,
    getBookYear,
    isCompleteCheck
  );
  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateToObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function makeListBook(bookObject) {
  const container = document.createElement("div");
  container.classList.add("book-item");
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");

  const bookTitle = document.createElement("h3");
  bookTitle.innerText = bookObject.title;
  bookTitle.setAttribute("data-testid", "bookItemTitle");

  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = `Penulis : ${bookObject.author}`;
  bookAuthor.setAttribute("data-testid", "bookItemAuthor");

  const bookYear = document.createElement("p");
  bookYear.innerText = `Tahun : ${bookObject.year}`;
  bookYear.setAttribute("data-testid", "bookItemYear");

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("btn-container");

  const btnChangeStatus = document.createElement("button");
  btnChangeStatus.classList.add("btn-change-status");
  btnChangeStatus.innerText = bookObject.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  btnChangeStatus.setAttribute("data-testid", "bookItemIsCompleteButton");
  btnChangeStatus.addEventListener("click", function () {
    if (bookObject.isComplete == false) {
      addBookToFinishRead(bookObject.id);
    } else {
      addBookToUnfinishRead(bookObject.id);
    }
  });

  const logoEdit = document.createElement("i");
  logoEdit.classList.add("fa-regular", "fa-pen-to-square");
  const btnEdit = document.createElement("button");
  btnEdit.classList.add("btn-edit");
  btnEdit.setAttribute("data-testid", "bookItemDeleteButton");
  btnEdit.appendChild(logoEdit);
  btnEdit.addEventListener("click", function () {
    editBook(bookObject.id);
  });

  const logoHapus = document.createElement("i");
  logoHapus.classList.add("fa-solid", "fa-trash");
  const btnDelete = document.createElement("button");
  btnDelete.classList.add("btn-delete");
  btnDelete.setAttribute("data-testid", "bookItemEditButton");
  btnDelete.appendChild(logoHapus);
  btnDelete.addEventListener("click", function () {
    deleteBook(bookObject.id);
  });

  buttonContainer.append(btnChangeStatus, btnEdit, btnDelete);
  container.append(bookTitle, bookAuthor, bookYear, buttonContainer);
  return container;
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (const bookListItem of books) {
    const bookElement = makeListBook(bookListItem);
    if (!bookListItem.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
});

const checkbox = document.getElementById("bookFormIsComplete");
const buttonText = document.querySelector(".add-book-btn span");
checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    buttonText.textContent = "Telah selesai dibaca";
  } else {
    buttonText.textContent = "Belum selesai dibaca";
  }
});

function addBookToFinishRead(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addBookToUnfinishRead(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget == -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  document.getElementById("bookFormTitle").value = bookTarget.title;
  document.getElementById("bookFormAuthor").value = bookTarget.author;
  document.getElementById("bookFormYear").value = bookTarget.year;
  document.getElementById("bookFormIsComplete").checked = bookTarget.isComplete;
  deleteBook(bookId);
}

const searchBook = document.getElementById("searchBook");
searchBook.addEventListener("submit", function (event) {
  event.preventDefault();
  const searchBookTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchBookTitle)
  );
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";
  for (const bookListItem of filteredBooks) {
    const bookElement = makeListBook(bookListItem);
    if (!bookListItem.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
});
