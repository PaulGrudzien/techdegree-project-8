const list = document.querySelector("tbody").children;
const divPagination = document.querySelector("div.pagination");
const booksPerPage = 20;
const numberOfPage = Math.ceil(list.length/booksPerPage);

function showPage(page) {
    const start = (page * booksPerPage) - booksPerPage;
    const end = page * booksPerPage;
    // Hide all elements except the needed ones
    for (let i = 0 ; i < list.length ; i += 1) {
        const row = list[i];
        if (i >= start && i < end) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        };
    };
    // Change class of navigation button
    const buttons = divPagination.children;
    Array.from(buttons).forEach(button => {
        if (button.textContent == page) {
            button.classList.add("current-page");
        }
        else {
            button.classList.remove("current-page");
        }
    })
};

if (numberOfPage >= 2) {
    for (let i = 1 ; i <= numberOfPage ; i += 1)  {
        const button = document.createElement("a");
        button.className = "button pagination";
        button.textContent = i;
        button.addEventListener("click", event => {showPage(i)});
        divPagination.appendChild(button);
    };
};

showPage(1);
