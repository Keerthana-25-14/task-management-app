// =====================================================
// TASKFLOW - FRONTEND APPLICATION
// =====================================================

const API_URL = "http://localhost:5000/api";

// =====================================================
// GLOBAL DATA
// =====================================================

let allTasks = [];


// =====================================================
// DOM READY
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    setupNavigation();
    setupKeyboardShortcuts();
    loadTheme();

    const token = localStorage.getItem("token");

    if (token) {

        showApplication();
        setupUser();
        showView("overview");
        loadTasks();

    } else {

        showAuth();
        showRegister();

    }

});


// =====================================================
// AUTH SCREEN
// =====================================================

function showAuth() {

    const authScreen =
        document.getElementById("authScreen");

    const appScreen =
        document.getElementById("appScreen");

    if (authScreen) {
        authScreen.classList.remove("hidden");
    }

    if (appScreen) {
        appScreen.classList.add("hidden");
    }
}


function showApplication() {

    const authScreen =
        document.getElementById("authScreen");

    const appScreen =
        document.getElementById("appScreen");

    if (authScreen) {
        authScreen.classList.add("hidden");
    }

    if (appScreen) {
        appScreen.classList.remove("hidden");
    }
}


// =====================================================
// REGISTER / LOGIN SCREEN SWITCHING
// =====================================================

function showLogin() {

    const registerSection =
        document.getElementById("registerSection");

    const loginSection =
        document.getElementById("loginSection");

    if (registerSection) {
        registerSection.classList.add("hidden");
    }

    if (loginSection) {
        loginSection.classList.remove("hidden");
    }
}


function showRegister() {

    const registerSection =
        document.getElementById("registerSection");

    const loginSection =
        document.getElementById("loginSection");

    if (loginSection) {
        loginSection.classList.add("hidden");
    }

    if (registerSection) {
        registerSection.classList.remove("hidden");
    }
}


// =====================================================
// REGISTER
// =====================================================

async function register() {

    const name =
        document.getElementById("registerName")?.value.trim();

    const email =
        document.getElementById("registerEmail")?.value.trim();

    const password =
        document.getElementById("registerPassword")?.value;

    if (!name || !email || !password) {

        showToast(
            "Registration failed",
            "Please fill in all fields."
        );

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            showToast(
                "Registration failed",
                data.message || "Unable to register."
            );

            return;
        }

        showToast(
            "Account created",
            "Your workspace is ready. Please sign in."
        );

        document.getElementById("registerName").value = "";
        document.getElementById("registerEmail").value = "";
        document.getElementById("registerPassword").value = "";

        showLogin();

    } catch (error) {

        console.error("Registration error:", error);

        showToast(
            "Connection error",
            "Unable to connect to the server."
        );
    }
}


// =====================================================
// LOGIN
// =====================================================

async function login() {

    const email =
        document.getElementById("loginEmail")?.value.trim();

    const password =
        document.getElementById("loginPassword")?.value;

    if (!email || !password) {

        showToast(
            "Login failed",
            "Please enter your email and password."
        );

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/auth/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            showToast(
                "Login failed",
                data.message || "Invalid credentials."
            );

            return;
        }

        // Save JWT
        localStorage.setItem("token", data.token);

        // Save user information if available
        if (data.user) {
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        }

        // Show application
        showApplication();

        // Setup user information
        setupUser();

        // Open overview
        showView("overview");

        // Load user's tasks
        await loadTasks();

        showToast(
            "Welcome back",
            "Your TaskFlow workspace is ready."
        );

    } catch (error) {

        console.error("Login error:", error);

        showToast(
            "Connection error",
            "Unable to connect to the server."
        );
    }
}


// =====================================================
// USER INFORMATION
// =====================================================

function setupUser() {

    let user = null;

    const storedUser =
        localStorage.getItem("user");

    if (storedUser) {

        try {
            user = JSON.parse(storedUser);
        } catch (error) {
            console.error("Invalid user data.");
        }
    }

    const name =
        user?.name || "Keerthana";

    const firstLetter =
        name.charAt(0).toUpperCase();

    const nameElements = [
        "welcomeName",
        "sidebarUserName",
        "topUserName"
    ];

    nameElements.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = name;
        }
    });

    const avatarElements = [
        "userAvatar",
        "topAvatar"
    ];

    avatarElements.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = firstLetter;
        }
    });
}


// =====================================================
// NAVIGATION
// =====================================================

function setupNavigation() {

    document
        .querySelectorAll(".nav-item[data-view]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const view =
                    button.dataset.view;

                showView(view);

            });

        });
}


function showView(viewName) {

    const views =
        document.querySelectorAll(".view");

    views.forEach(view => {
        view.classList.remove("active-view");
    });

    const selectedView =
        document.getElementById(
            `${viewName}View`
        );

    if (selectedView) {
        selectedView.classList.add("active-view");
    }

    // Sidebar active state
    document
        .querySelectorAll(".nav-item[data-view]")
        .forEach(item => {

            item.classList.remove("active");

            if (item.dataset.view === viewName) {
                item.classList.add("active");
            }

        });

    // Breadcrumb
    const titles = {
        overview: "Overview",
        tasks: "My Tasks",
        calendar: "Calendar",
        analytics: "Analytics",
        activity: "Activity",
        settings: "Settings"
    };

    const title =
        document.getElementById("currentViewTitle");

    if (title) {
        title.textContent =
            titles[viewName] || "Overview";
    }

    // Refresh relevant sections
    if (viewName === "overview") {
        updateOverview();
    }

    if (viewName === "tasks") {
        filterTasks();
    }

    if (viewName === "analytics") {
        updateAnalytics();
    }

    if (viewName === "activity") {
    loadActivity();
}
}


// =====================================================
// CREATE TASK MODAL
// =====================================================

function openTaskModal() {

    const modal =
        document.getElementById("taskModal");

    if (!modal) return;

    modal.classList.remove("hidden");

    setTimeout(() => {

        document
            .getElementById("taskTitle")
            ?.focus();

    }, 100);
}


function closeTaskModal() {

    const modal =
        document.getElementById("taskModal");

    if (!modal) return;

    modal.classList.add("hidden");

    const title =
        document.getElementById("taskTitle");

    const description =
        document.getElementById("taskDescription");

    if (title) {
        title.value = "";
    }

    if (description) {
        description.value = "";
    }
}


// =====================================================
// CREATE TASK
// =====================================================

async function createTask() {

    const title =
        document.getElementById("taskTitle")
            ?.value.trim();

    const description =
        document.getElementById("taskDescription")
            ?.value.trim();

    const dueDate =
    document.getElementById("taskDueDate")
        ?.value;

    const token =
        localStorage.getItem("token");

    if (!token) {

        showToast(
            "Session expired",
            "Please log in again."
        );

        logout();

        return;
    }

    if (!title) {

        showToast(
            "Missing title",
            "Please enter a task title."
        );

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    title,
                    description,
                    due_date: dueDate
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            showToast(
                "Unable to create task",
                data.message || "Something went wrong."
            );

            return;
        }

        closeTaskModal();

addActivity(
    "Task created",
    `Task "${title}" was created.`,
    "fa-solid fa-plus"
);

showToast(
    "Task created",
    "Your new task has been added."
);

await loadTasks();

showView("tasks");

    } catch (error) {

        console.error("Create task error:", error);

        showToast(
            "Connection error",
            "Unable to connect to the server."
        );
    }
}


// =====================================================
// LOAD TASKS
// =====================================================

async function loadTasks() {

    const token =
        localStorage.getItem("token");

    if (!token) return;

    try {

        const response = await fetch(
            `${API_URL}/tasks`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            if (response.status === 401) {
                logout();
                return;
            }

            throw new Error(
                `Request failed: ${response.status}`
            );
        }

        const tasks =
            await response.json();

        allTasks =
            Array.isArray(tasks)
                ? tasks
                : [];

        renderTasks(allTasks);
        updateRecentTasks(allTasks);
        updateOverview();
        updateAnalytics();

    } catch (error) {

        console.error(
            "Load tasks error:",
            error
        );

        showToast(
            "Unable to load tasks",
            "Please check the server."
        );
    }
}


// =====================================================
// RENDER TASKS
// =====================================================

function renderTasks(tasks) {

    const taskList =
        document.getElementById("taskList");

    if (!taskList) return;

    taskList.innerHTML = "";

    if (!tasks || tasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-regular fa-clipboard"></i>
                </div>

                <h3>No tasks found.</h3>

                <p>
                    Create a task to get started.
                </p>

                <button onclick="openTaskModal()">
                    Create task
                </button>

            </div>
        `;

        return;
    }

    tasks.forEach(task => {

        const taskDiv =
            document.createElement("div");

        taskDiv.className = "task";

        taskDiv.dataset.status =
            task.status || "pending";

        taskDiv.dataset.id =
            task.id;

        const safeTitle =
            escapeHTML(task.title || "Untitled task");

        const safeDescription =
            escapeHTML(
                task.description || "No description"
            );

        const status =
            task.status || "pending";

        const isCompleted =
            status === "completed";

        taskDiv.innerHTML = `

            <div class="task-content">

                <h3>
                    ${safeTitle}
                </h3>

                <p>
                    ${safeDescription}
                </p>

                <span class="task-status ${status}">
                    ${formatStatus(status)}
                </span>

            </div>

            <div class="task-actions">

                <button
                    onclick="toggleTaskStatus(${task.id}, '${status}')"
                >
                    ${isCompleted
                        ? "Reopen"
                        : "Complete"}
                </button>

                <button
                    onclick="deleteTask(${task.id})"
                >
                    Delete
                </button>

            </div>
        `;

        taskList.appendChild(taskDiv);

    });
}


// =====================================================
// RECENT TASKS
// =====================================================

function updateRecentTasks(tasks) {

    const container =
        document.getElementById(
            "overviewTaskList"
        );

    if (!container) return;

    container.innerHTML = "";

    if (!tasks || tasks.length === 0) {

        container.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    <i class="fa-regular fa-clipboard"></i>
                </div>

                <h3>
                    Your workspace is clear.
                </h3>

                <p>
                    Create your first task and
                    start making progress.
                </p>

                <button onclick="openTaskModal()">
                    Create first task
                </button>

            </div>
        `;

        return;
    }

    tasks
        .slice(0, 5)
        .forEach(task => {

            const item =
                document.createElement("div");

            item.className = "task";

            item.dataset.status =
                task.status || "pending";

            item.innerHTML = `

                <div class="task-content">

                    <h3>
                        ${escapeHTML(
                            task.title || "Untitled task"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            task.description || ""
                        )}
                    </p>

                    <span class="task-status ${task.status}">
                        ${formatStatus(task.status)}
                    </span>

                </div>
            `;

            container.appendChild(item);

        });
}


// =====================================================
// SEARCH + FILTER
// =====================================================

function filterTasks() {

    const searchInput =
        document.getElementById("taskSearch");

    const filterInput =
        document.getElementById("taskFilter");

    const search =
        searchInput?.value
            .toLowerCase()
            .trim() || "";

    const filter =
        filterInput?.value || "all";

    const filtered =
        allTasks.filter(task => {

            const title =
                String(task.title || "")
                    .toLowerCase();

            const description =
                String(task.description || "")
                    .toLowerCase();

            const status =
                task.status || "pending";

            const matchesSearch =
                title.includes(search) ||
                description.includes(search);

            const matchesFilter =
                filter === "all" ||
                status === filter;

            return (
                matchesSearch &&
                matchesFilter
            );
        });

    renderTasks(filtered);
}


function globalSearchTasks() {

    const searchInput =
        document.getElementById(
            "globalSearch"
        );

    if (!searchInput) return;

    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    if (search) {

        showView("tasks");

        const taskSearch =
            document.getElementById(
                "taskSearch"
            );

        if (taskSearch) {
            taskSearch.value = search;
        }

        filterTasks();

    } else {

        const taskSearch =
            document.getElementById(
                "taskSearch"
            );

        if (taskSearch) {
            taskSearch.value = "";
        }

        filterTasks();
    }
}


// =====================================================
// UPDATE TASK STATUS
// =====================================================

async function toggleTaskStatus(id, currentStatus) {
    try {
        // Get the task from your existing allTasks array
        const task = allTasks.find(t => t.id == id);

        if (!task) {
            console.error("Task not found:", id);
            return;
        }

        // Get token
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No token found");
            logout();
            return;
        }

        // Change status
        const newStatus =
            currentStatus === "completed"
                ? "pending"
                : "completed";

        const response = await fetch(
            `${API_URL}/tasks/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    title: task.title,
                    description: task.description || "",
                    status: newStatus
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Update failed:", data);

            alert(
                data.message ||
                "Update failed"
            );

            return;
        }

        console.log(
            "Task updated successfully:",
            data
        );

        // Reload tasks after updating
        await loadTasks();

    } catch (error) {

        console.error(
            "Error updating task:",
            error
        );

        alert(
            "Failed to update task"
        );
    }
}

// =====================================================
// DELETE TASK
// =====================================================

async function deleteTask(id) {

    const token =
        localStorage.getItem("token");

    if (!token) {
        logout();
        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );

    if (!confirmed) return;

    try {

        const response = await fetch(
            `${API_URL}/tasks/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${token}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            showToast(
                "Delete failed",
                data.message || "Unable to delete task."
            );

            return;
        }

        showToast(
            "Task deleted",
            "The task has been removed."
        );

        await loadTasks();

    } catch (error) {

        console.error(
            "Delete task error:",
            error
        );

        showToast(
            "Connection error",
            "Unable to delete the task."
        );
    }
}


// =====================================================
// OVERVIEW STATISTICS
// =====================================================

function updateOverview() {

    const total =
        allTasks.length;

    const completed =
        allTasks.filter(
            task => task.status === "completed"
        ).length;

    const inProgress =
        allTasks.filter(
            task => task.status === "in-progress"
        ).length;

    const pending =
        allTasks.filter(
            task =>
                task.status === "pending" ||
                !task.status
        ).length;

    const completionRate =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );

    setText("totalTasks", total);
    setText("progressTasks", inProgress);
    setText("completedTasks", completed);
    setText(
        "completionRate",
        `${completionRate}%`
    );

    setText(
        "progressPercentage",
        `${completionRate}%`
    );

    updateProgressRing(
        completionRate
    );

    // Keep variables meaningful even if
    // the current design doesn't display pending.
    void pending;
}


// =====================================================
// PROGRESS RING
// =====================================================

function updateProgressRing(percent) {

    const ring =
        document.getElementById(
            "progressRing"
        );

    if (!ring) return;

    const radius = 48;

    const circumference =
        2 * Math.PI * radius;

    ring.style.strokeDasharray =
        circumference;

    const offset =
        circumference -
        (percent / 100) * circumference;

    ring.style.strokeDashoffset =
        offset;

    const miniBar =
        document.getElementById(
            "miniProgressBar"
        );

    if (miniBar) {
        miniBar.style.width =
            `${percent}%`;
    }
}


// =====================================================
// ANALYTICS
// =====================================================

function updateAnalytics() {

    const total =
        allTasks.length;

    const completed =
        allTasks.filter(
            task => task.status === "completed"
        ).length;

    const rate =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );

    setText(
        "analyticsRate",
        rate
    );
}


// =====================================================
// THEME
// =====================================================

function toggleTheme() {

    document.body.classList.toggle(
        "light-theme"
    );

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );

    localStorage.setItem(
        "theme",
        isLight ? "light" : "dark"
    );

    updateThemeIcon();
}


function loadTheme() {

    const theme =
        localStorage.getItem("theme");

    if (theme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );
    }

    updateThemeIcon();
}


function updateThemeIcon() {

    const icon =
        document.getElementById(
            "themeIcon"
        );

    if (!icon) return;

    const isLight =
        document.body.classList.contains(
            "light-theme"
        );

    icon.className =
        isLight
            ? "fa-solid fa-sun"
            : "fa-solid fa-moon";
}


// =====================================================
// LOGOUT
// =====================================================

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    allTasks = [];

    showAuth();
    showLogin();

    showToast(
        "Signed out",
        "You have been logged out of TaskFlow."
    );
}


// =====================================================
// PASSWORD VISIBILITY
// =====================================================

function togglePassword(
    inputId,
    button
) {

    const input =
        document.getElementById(inputId);

    if (!input || !button) return;

    if (input.type === "password") {

        input.type = "text";

        button.innerHTML =
            '<i class="fa-regular fa-eye-slash"></i>';

    } else {

        input.type = "password";

        button.innerHTML =
            '<i class="fa-regular fa-eye"></i>';
    }
}


// =====================================================
// TOAST
// =====================================================

function showToast(
    title,
    message
) {

    const toast =
        document.getElementById("toast");

    if (!toast) return;

    const toastTitle =
        document.getElementById(
            "toastTitle"
        );

    const toastMessage =
        document.getElementById(
            "toastMessage"
        );

    if (toastTitle) {
        toastTitle.textContent = title;
    }

    if (toastMessage) {
        toastMessage.textContent = message;
    }

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);
}


// =====================================================
// KEYBOARD SHORTCUTS
// =====================================================

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            // Ctrl + K
            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "k"
            ) {

                event.preventDefault();

                document
                    .querySelector(
                        ".top-search input"
                    )
                    ?.focus();
            }

            // Escape closes modal
            if (event.key === "Escape") {
                closeTaskModal();
            }

        }
    );
}


// =====================================================
// HELPERS
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function formatStatus(status) {

    if (!status) {
        return "Pending";
    }

    return status
        .replace("-", " ")
        .replace(
            /\b\w/g,
            letter => letter.toUpperCase()
        );
}


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        String(value);

    return div.innerHTML;
}

/* =========================================
   CALENDAR
========================================= */

let calendarDate = new Date();
let selectedCalendarDate = null;


function renderCalendar() {

    const calendarDays =
        document.getElementById("calendarDays");

    const calendarMonth =
        document.getElementById("calendarMonth");

    if (!calendarDays || !calendarMonth) {
        return;
    }

    calendarDays.innerHTML = "";

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const monthName =
        calendarDate.toLocaleString("default", {
            month: "long"
        });

    calendarMonth.textContent =
        `${monthName} ${year}`;

    const firstDay =
        new Date(year, month, 1).getDay();

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    // Empty boxes before first day
    for (let i = 0; i < firstDay; i++) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty";

        calendarDays.appendChild(emptyDay);
    }


    // Create calendar days
    for (let day = 1; day <= daysInMonth; day++) {

        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        const dateNumber =
            document.createElement("div");

        dateNumber.className =
            "calendar-date-number";

        dateNumber.textContent =
            day;

        dayElement.appendChild(dateNumber);


        // =========================================
        // CHECK TASK DUE DATE
        // =========================================

        const calendarDateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


       const tasksForDate =
    Array.isArray(allTasks)
        ? allTasks.filter(task => {

            if (!task.due_date) {
                return false;
            }

            const taskDate =
                String(task.due_date)
                    .substring(0, 10);

            return taskDate === calendarDateString;
        })
        : [];


if (tasksForDate.length > 0) {

    const taskCount =
        document.createElement("span");

    taskCount.className =
        "calendar-task-count";

    taskCount.textContent =
        `${tasksForDate.length} ${
            tasksForDate.length === 1
                ? "task"
                : "tasks"
        }`;

    dayElement.appendChild(taskCount);
}


        // Show task indicator
      // Show task indicator
if (tasksForDate.length > 0) {

    const taskDot =
        document.createElement("span");

    taskDot.className =
        "calendar-task-dot";

    taskDot.title =
        "Task due on this date";

    dayElement.appendChild(taskDot);
}


        // =========================================
        // TODAY
        // =========================================

        const today = new Date();

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {

            dayElement.classList.add("today");
        }


        // =========================================
        // CLICK DATE
        // =========================================

        dayElement.addEventListener(
            "click",
            function () {

                document
                    .querySelectorAll(".calendar-day.selected")
                    .forEach(element => {
                        element.classList.remove("selected");
                    });


                dayElement.classList.add("selected");


                selectedCalendarDate =
                    new Date(year, month, day);


                showCalendarTasks(
                    selectedCalendarDate
                );

            }
        );


        calendarDays.appendChild(dayElement);
    }
}

/* =========================================
   SHOW TASKS FOR SELECTED DATE
========================================= */
function showCalendarTasks(date) {

    const details =
        document.getElementById("calendarTaskDetails");

    if (!details) return;


    // Create date string using LOCAL date
    // This avoids timezone problems with toISOString()
    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1).padStart(2, "0");

    const day =
        String(date.getDate()).padStart(2, "0");

    const formattedDate =
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;


    // Display date
    const displayDate =
        date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });


    // Find tasks for selected date
    const matchingTasks =
        allTasks.filter(task => {

            if (!task.due_date) {
                return false;
            }

            return task.due_date
                .toString()
                .split("T")[0] === formattedDate;
        });


    // No tasks
    if (matchingTasks.length === 0) {

        details.innerHTML = `
            <div class="calendar-empty">

                <h3>
                    ${displayDate}
                </h3>

                <p>
                    No tasks scheduled for this date.
                </p>

            </div>
        `;

        return;
    }


    // Tasks found
    details.innerHTML = `

        <div class="calendar-details-header">

            <div>

                <span class="panel-kicker">
                    SCHEDULE
                </span>

                <h3>
                    ${displayDate}
                </h3>

            </div>

            <span class="calendar-task-count">
                ${matchingTasks.length}
                ${matchingTasks.length === 1
                    ? "task"
                    : "tasks"}
            </span>

        </div>


        <div class="calendar-task-list">

            ${matchingTasks.map(task => {

                const status =
                    task.status || "pending";

                const isCompleted =
                    status === "completed";


                return `

                    <div
                        class="calendar-task-item ${status}"
                    >

                        <div
                            class="calendar-task-status ${status}"
                        >
                            ${isCompleted
                                ? "✓"
                                : "•"}
                        </div>


                        <div class="calendar-task-content">

                            <strong>
                                ${escapeHTML(
                                    task.title ||
                                    "Untitled task"
                                )}
                            </strong>


                            <span class="calendar-task-description">
                                ${escapeHTML(
                                    task.description ||
                                    "No description"
                                )}
                            </span>


                            <div class="calendar-task-meta">

                                <span class="task-status ${status}">
                                    ${formatStatus(status)}
                                </span>

                                <span>
                                    Due:
                                    ${displayDate}
                                </span>

                            </div>

                        </div>

                    </div>

                `;

            }).join("")}

        </div>
    `;
}
/* =========================================
   PREVIOUS MONTH
========================================= */

const prevMonthBtn =
    document.getElementById(
        "prevMonthBtn"
    );


if (prevMonthBtn) {

    prevMonthBtn.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            renderCalendar();

        }
    );
}


/* =========================================
   NEXT MONTH
========================================= */

const nextMonthBtn =
    document.getElementById(
        "nextMonthBtn"
    );


if (nextMonthBtn) {

    nextMonthBtn.addEventListener(
        "click",
        function () {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            renderCalendar();

        }
    );
}


/* =========================================
   TODAY
========================================= */

const todayBtn =
    document.getElementById(
        "todayBtn"
    );


if (todayBtn) {

    todayBtn.addEventListener(
        "click",
        function () {

            calendarDate =
                new Date();

            selectedCalendarDate =
                null;

            renderCalendar();


            const details =
                document.getElementById(
                    "calendarTaskDetails"
                );


            if (details) {

                details.innerHTML = `

                    <h3>
                        Select a date
                    </h3>

                    <p>
                        Your tasks for the selected date
                        will appear here.
                    </p>

                `;
            }

        }
    );
}


/* =========================================
   INITIALIZE CALENDAR
========================================= */

renderCalendar();

function loadActivity() {

    const activityList =
        document.getElementById("activityList");

    if (!activityList) {
        return;
    }

    const activities =
        JSON.parse(
            localStorage.getItem("taskflowActivity")
        ) || [];


    if (activities.length === 0) {

        activityList.innerHTML = `
            <div class="activity-empty">

                <div class="activity-icon">
                    <i class="fa-regular fa-clock"></i>
                </div>

                <h3>
                    No activity yet
                </h3>

                <p>
                    Your recent workspace activity will appear here.
                </p>

            </div>
        `;

        return;
    }


    activityList.innerHTML =
        activities.map(activity => {

            return `
                <div class="activity-item">

                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>

                    <div>

                        <strong>
                            ${escapeHTML(activity.title)}
                        </strong>

                        <span>
                            ${escapeHTML(activity.description)}
                        </span>

                    </div>

                    <time>
                        ${activity.time}
                    </time>

                </div>
            `;

        }).join("");
}

function addActivity(title, description, icon = "fa-solid fa-circle-check") {

    const activities =
        JSON.parse(
            localStorage.getItem("taskflowActivity")
        ) || [];


    activities.unshift({

        title: title,

        description: description,

        icon: icon,

        time: new Date().toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "numeric",
            minute: "2-digit"
        })

    });


    // Keep only latest 20 activities
    const recentActivities =
        activities.slice(0, 20);


    localStorage.setItem(
        "taskflowActivity",
        JSON.stringify(recentActivities)
    );


    loadActivity();
}