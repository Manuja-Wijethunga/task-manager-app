# TaskFlow — Frontend Application

A clean, modern task manager UI built with HTML, CSS, and vanilla JavaScript.

---

## 📁 Project Structure

```
task-manager/
├── index.html     ← Main UI (Auth + Dashboard screens)
├── style.css      ← All styling
├── app.js         ← API calls + application logic
└── README.md      ← This file
```

---

## ⚠️ Important Note on Backend Files

The PHP backend files were **mislabeled** (filename does not match functionality). The correct mapping is:

| Filename       | Actual Function        | Endpoint Used In      |
|----------------|------------------------|-----------------------|
| `register.php` | Register new user      | POST /register.php    |
| `login.php`    | User login → token     | POST /login.php       |
| `logout.php`   | Logout / clear token   | POST /logout.php      |
| `get_task.php` | DB connection file     | (included by others)  |
| `auth.php`     | Add task               | POST /auth.php        |
| `db.php`       | Auth middleware        | (included by others)  |

---

## 🚀 Setup & Running

### 1. Backend — Set Up PHP + MySQL

**Requirements:** PHP 7.4+, MySQL, Apache or Nginx (XAMPP / WAMP / MAMP work fine)

#### a) Start your local server
- **XAMPP**: Open XAMPP Control Panel → Start Apache + MySQL
- **MAMP**: Start MAMP → Servers start automatically

#### b) Create the Database

Open phpMyAdmin (`http://localhost/phpmyadmin`) and run:

```sql
CREATE DATABASE task_app;
USE task_app;

CREATE TABLE users (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  token    VARCHAR(100) DEFAULT NULL
);

CREATE TABLE tasks (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  task    TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### c) Place PHP files in server root

Copy all `.php` files into your server's web root:
- **XAMPP**: `C:/xampp/htdocs/task-app/`
- **MAMP**: `/Applications/MAMP/htdocs/task-app/`
- **Linux**: `/var/www/html/task-app/`

Also add `register.php` with the user registration code. Since it was missing from the original files, create it:

```php
<?php
include "db.php";

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

$check = mysqli_query($conn, "SELECT id FROM users WHERE username='$username'");
if (mysqli_num_rows($check) > 0) {
    echo json_encode(["status" => "error", "message" => "Username already taken"]);
    exit;
}

mysqli_query($conn, "INSERT INTO users (username, password) VALUES ('$username', '$password')");
echo json_encode(["status" => "success"]);
?>
```

#### d) Enable CORS (for local development)

Add this to the top of `db.php`, `auth.php`, and each endpoint file:

```php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
```

---

### 2. Frontend — Configure & Open

#### a) Set the API base URL

Open `app.js` and update line 8:

```js
const BASE_URL = 'http://localhost/task-app';
```

Change `task-app` to match the folder name you used in your server root.

#### b) Open the app

Simply open `index.html` in your browser, OR place the frontend files in the same folder as the PHP files and visit:

```
http://localhost/task-app/index.html
```

---

### 3. Git Repository Setup

#### a) Create a repository on GitHub/GitLab/Bitbucket

1. Go to github.com → New Repository
2. Name it `task-manager-app`
3. Set visibility (Public or Private)
4. **Don't** initialize with README (you already have one)

#### b) Push your code

Open a terminal in your project folder and run:

```bash
git init
git add .
git commit -m "Initial commit: Task Manager frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/task-manager-app.git
git push -u origin main
```

---

### 4. Create the Notepad Submission File

Create a file called `group-members.txt` with:

```
Repository Link: https://github.com/YOUR_USERNAME/task-manager-app

Group Members:
1. [Index Number] — [Full Name]
2. [Index Number] — [Full Name]
3. [Index Number] — [Full Name]
(add all members)
```

---

## 🔌 API Reference

All requests go to `http://localhost/task-app/`

| Operation   | Method | Endpoint       | Body / Headers                              | Response                        |
|-------------|--------|----------------|---------------------------------------------|---------------------------------|
| Register    | POST   | register.php   | `{ username, password }`                    | `{ status: "success" }`         |
| Login       | POST   | login.php      | `{ username, password }`                    | `{ status: "success", token }`  |
| Logout      | POST   | logout.php     | Header: `Authorization: <token>`            | `{ status: "success" }`         |
| Get Tasks   | GET    | get_task.php   | Header: `Authorization: <token>`            | `[ { id, user_id, task }, … ]`  |
| Add Task    | POST   | auth.php       | Header: `Authorization: <token>` + `{ task }` | `{ status: "task added" }`    |

---

## ✨ Features

- **Register** — Create a new account
- **Login** — Authenticate and receive a session token (stored in localStorage)
- **Logout** — Invalidates token on server and clears local storage
- **View Tasks** — Loads all tasks belonging to the logged-in user
- **Add Task** — Submit a new task via modal dialog
- **Mark Complete** — Toggle task completion state (local UI)
- **Session Persistence** — Token saved in localStorage; stays logged in on refresh

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| CORS error in browser console | Add CORS headers to each PHP file (see step 1d) |
| "Cannot connect to server" | Check BASE_URL in app.js and that Apache/MySQL are running |
| Tasks not loading | Verify token is being sent in Authorization header |
| Registration fails | Check that register.php exists and database tables are created |
| Blank page | Open browser DevTools (F12) → Console for errors |
