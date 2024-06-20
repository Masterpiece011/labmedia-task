"use strict"

const API_URL = 'https://5ebbb8e5f2cfeb001697d05c.mockapi.io/users'
const MAX_RETRIES = 3; 
const RETRY_DELAY = 1000; 

let currentUsersData = []
let filteredUsersData = []

let dateAscendingOrder = false
let ratingAscendingOrder = false

let currentPage = 1;
const usersPerPage = 5

const tableOfUsers = document.querySelector('.main__table table tbody')
let usersRows = document.querySelectorAll('user-row');
const paginationContainer = document.getElementById('pagination')
const overlayEl = document.querySelector('.main__overlay')
const modalEl = document.querySelector('.main__modal')
const dateSortBtn = document.getElementById('dateSort');
const ratingSortBtn = document.getElementById('ratingSort');
const clearSearchBtn = document.getElementById('clearBtn');
const searchInput = document.getElementById('searchInput')
const deleteUserBtn = document.getElementById('deleteBtn')
const closeModalBtn = document.getElementById('closeModal')
const queryMessage = document.querySelector('.query-message')
const queryMessageText = document.querySelector('.query-message p')
console.log(queryMessage);

const fetchUsers = async (retries = MAX_RETRIES) => {
    try {
        let response = await fetch(API_URL).then(res => res.json())
        currentUsersData = response
    } catch (error) {
        console.log(error);
        console.log(`Fetch attempt failed. Retries left: ${retries - 1}`);
        if (retries > 1) {
            setTimeout(() => fetchUsers(retries - 1), RETRY_DELAY);
        } else {
            console.log("Error fetching user data. No retries left.");
            alert("Error fetching user data. Please try again later.");
        }
    }
    renderUsers(currentUsersData)
    renderPagination(currentUsersData)
}

function renderUsers(users) {

    tableOfUsers.innerHTML = ''
    const startIndex = (currentPage - 1) * usersPerPage
    const endIndex = startIndex + usersPerPage

    const currentUsers = users.slice(startIndex, endIndex)

    currentUsers.forEach(user => {
        let date = new Date(user.registration_date)
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()

        day = day < 10 ? '0' + day : day;
        month = month < 10 ? '0' + month : month;   

        let formattedDate = `${day}.${month}.${year}`

        let userDataContainer = document.createElement('tr')
        userDataContainer.classList.add('user-row')
        userDataContainer.dataset.id = `${user.id}`
        userDataContainer.innerHTML = `
        <td class="main__table-username">${user.username}</td>
        <td>${user.email}</td>
        <td>${formattedDate}</td>
        <td>${user.rating}</td>
        <td>
            <button class='delete-btn' id='delBtn' data-id='${user.id}'>
                <img src="./img/cancel.svg" alt="delete-icon">
            </button>
        </td>
        `

        tableOfUsers.appendChild(userDataContainer)
    });

    const deleteUserButtons = document.querySelectorAll('.delete-btn')

    deleteUserButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            deleteUserBtn.dataset.id = btn.dataset.id
            openModal()
        })
    })
}

function renderPagination(usersCount) {

    paginationContainer.innerHTML = ''
    let totalPages = Math.ceil(usersCount.length / 5)

    for (let page = 0; page < totalPages; page++) {
        let paginationEl = document.createElement('button')
        paginationEl.classList.add('main__pagintaion-item')
        paginationEl.innerHTML = `${page + 1}`
        paginationEl.dataset.page = page + 1

        paginationContainer.appendChild(paginationEl)
    }

    const allPagesButtons = document.querySelectorAll('.main__pagintaion-item')
    allPagesButtons.forEach(pageEl => {
        if (pageEl.dataset.page == currentPage) {
            pageEl.classList.add('active')
        } else {
            pageEl.classList.remove('active')
        }
        pageEl.addEventListener('click', () => {
            currentPage = parseInt(pageEl.dataset.page)
            renderUsers(usersCount)
            renderPagination(usersCount)
        })
    })
}

function deleteUser(id) {

    for (let i = 0; i < currentUsersData.length; i++) {
        if (currentUsersData[i].id === id) {
            currentUsersData.splice(i, 1)
        }
    }

    if (searchInput.value !== '') {
        filteredUsersData = searchUsers(searchInput.value)
        currentPage = 1
        isUsersNotFound()
        renderUsers(filteredUsersData)
        renderPagination(filteredUsersData)
    } else {
        renderUsers(currentUsersData)
        renderPagination(currentUsersData)
    }
    closeModal()
}

function openModal() {
    overlayEl.classList.add('active')
    modalEl.classList.add('active')
}

function closeModal() {
    overlayEl.classList.remove('active')
    modalEl.classList.remove('active')
    deleteUserBtn.dataset.id = ''
}

function searchUsers(query) {
    query = query.toLowerCase()
    const filteredUsers = []

    for (let i = 0; i < currentUsersData.length; i++) {
        let userUsername = currentUsersData[i].username.toLowerCase()
        let userEmail = currentUsersData[i].email.toLowerCase()
        if (userUsername.includes(query) || userEmail.includes(query)) {
            filteredUsers.push(currentUsersData[i])
        }
    }
    return filteredUsers
}

function sortUsersByDate() {
    let sortedUsersData = []
    if (filteredUsersData.length !== 0) {
        sortedUsersData = filteredUsersData.slice()
    } else {
        sortedUsersData = currentUsersData.slice()
    }

    if (dateAscendingOrder) {
        sortedUsersData.sort((a, b) => new Date(a.registration_date) - new Date(b.registration_date))
    } else {
        sortedUsersData.sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
    }
    dateAscendingOrder = !dateAscendingOrder

    renderUsers(sortedUsersData)
    renderPagination(sortedUsersData)
}

function sortUsersByRating() {
    let sortedUsersData = []
    if (filteredUsersData.length !== 0) {
        sortedUsersData = filteredUsersData.slice()
    } else {
        sortedUsersData = currentUsersData.slice()
    }

    if (ratingAscendingOrder) {
        sortedUsersData.sort((a, b) => a.rating - b.rating);
    } else {
        sortedUsersData.sort((a, b) => b.rating - a.rating);
    }
    ratingAscendingOrder = !ratingAscendingOrder
    renderUsers(sortedUsersData)
    renderPagination(sortedUsersData)
}

function isUsersNotFound() {
    if (filteredUsersData.length == 0 && searchInput.value !== '') {
        queryMessage.classList.add('active')
        queryMessageText.textContent = `По запросу ${searchInput.value} пользователей не найдено`
    } else {
        queryMessage.classList.remove('active')
    }
}

searchInput.addEventListener('input', () => {
    let query = searchInput.value

    if (query !== '') {
        clearSearchBtn.classList.add('active')
    } else {
        clearSearchBtn.classList.remove('active')
    }

    filteredUsersData = searchUsers(query)
    isUsersNotFound()
    
    currentPage = 1

    renderUsers(filteredUsersData)
    renderPagination(filteredUsersData)
})

clearSearchBtn.addEventListener('click', () => {

    searchInput.value = ''
    filteredUsersData = []
    clearSearchBtn.classList.remove('active')

    isUsersNotFound()
    renderUsers(currentUsersData)
    renderPagination(currentUsersData)
})

dateSortBtn.addEventListener('click', () => {
    clearSearchBtn.classList.add('active')
    sortUsersByDate()
})

ratingSortBtn.addEventListener('click', () => {
    clearSearchBtn.classList.add('active')
    sortUsersByRating()
})

deleteUserBtn.addEventListener('click', () => {
    deleteUser(deleteUserBtn.dataset.id)
})

closeModalBtn.addEventListener('click', () => {
    closeModal()
}) 



fetchUsers()


