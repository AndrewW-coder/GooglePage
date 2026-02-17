let db;
const videoCache = new Map();
const blobURLs = new Map();
const openReq = indexedDB.open("VideoDB", 2);


// monochrome SVG icons
const iconLibrary = {
    youtube: '<svg viewBox="0 0 24 24" fill="white"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    reddit: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>',
    gmail: '<svg viewBox="0 0 24 24" fill="white"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>',
    netflix: '<svg viewBox="0 0 24 24" fill="white"><path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
    twitch: '<svg viewBox="0 0 24 24" fill="white"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="white"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="white"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
    discord: '<svg viewBox="0 0 24 24" fill="white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>',
    amazon: '<svg viewBox="0 0 24 24" fill="white"><path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.608-4.516.608-2.822 0-5.514-.528-8.088-1.593-1.777-.71-3.333-1.62-4.672-2.706-.082-.066-.11-.148-.104-.234.013-.1.062-.15.15-.18zm23.71 1.146c-.228 0-.653.08-1.256.23-.51.125-.973.19-1.38.19-.646 0-1.136-.14-1.486-.436-.344-.29-.504-.66-.48-1.12.048-.884.686-1.44 1.92-1.667.12-.027.26-.053.42-.08.16-.027.33-.053.51-.08v-.865c0-.577-.08-.998-.24-1.24-.16-.243-.45-.364-.87-.364-.228 0-.45.05-.66.15-.21.1-.375.212-.51.347-.24.237-.42.433-.54.59-.13.158-.31.237-.54.237-.16 0-.29-.05-.39-.15-.1-.1-.15-.23-.15-.39 0-.32.16-.64.48-.96.48-.49 1.09-.87 1.83-1.14.73-.27 1.49-.41 2.28-.41 1.36 0 2.37.35 3.03 1.05.66.7.99 1.68.99 2.94v3.24c0 .37.06.65.18.84.12.19.33.29.63.29.12 0 .27-.03.45-.09.18-.06.33-.09.45-.09.24 0 .36.13.36.39 0 .24-.13.46-.39.66-.75.56-1.41.84-1.98.84z"/></svg>',
    google: '<svg viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>',
    stackoverflow: '<svg viewBox="0 0 24 24" fill="white"><path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154Z"/></svg>',
    medium: '<svg viewBox="0 0 24 24" fill="white"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="white"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/></svg>',
    email: '<svg viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    shopping: '<svg viewBox="0 0 24 24" fill="white"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>'
};

openReq.onupgradeneeded = e => {
    db = e.target.result;
    
    if (e.oldVersion < 1) {
        db.createObjectStore("videos", { keyPath: "name" });
    }
    
    if (e.oldVersion < 2) {
        const tx = e.target.transaction;
        const store = tx.objectStore("videos");
        const getAllReq = store.getAll();
        
        getAllReq.onsuccess = () => {
            getAllReq.result.forEach(item => {
                if (!item.type) {
                    item.type = item.file.type.startsWith('image/') ? 'image' : 'video';
                    store.put(item);
                }
            });
        };
    }
};

openReq.onsuccess = e => {
    db = e.target.result;
    loadSavedBackground();
    loadSavedVideos();
    preloadAllVideos();
};



// clock stuff
function updateTime() {
    const now = new Date();

    let hours = now.getHours();
    const isPM = hours >= 12;
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;

    
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    const clock = document.getElementById("clock");
    clock.innerHTML = "";

    const showSeconds = localStorage.getItem("showSeconds") !== "false";
    let timeStr = showSeconds 
        ? `${hours}:${minutes}:${seconds}`
        : `${hours}:${minutes}`;

    if(hours < 10) {
        clock.innerHTML += `<span class="digit"> </span>`;
    }

    const showColons = localStorage.getItem("showColons") !== "false";

    clock.innerHTML += timeStr.split('').map(char => {
        if (/\d/.test(char)) {
            return `<span class="digit">${char}</span>`;
        } else if (char === ':') {
            if(showColons) return `<span class="colon">:</span>`;
            else return `<span class="colon"> </span>`
        } else {
            return char;
        }
    }).join('');

    clock.innerHTML += `<span class="ampm">${isPM ? " PM" : " AM"}</span>`;

};

updateTime();
setInterval(updateTime, 1000);

// todo stuff

const toDoInput = document.getElementById("toDoInput");
const addTaskBtn = document.getElementById("addTask");
const toDoList = document.getElementById("toDoList");

function loadToDos() {
    const saved = localStorage.getItem("toDoItems");
    if (saved) {
        const items = JSON.parse(saved);
        items.forEach(item => {
            createToDoElement(item.text, item.completed, false);
        });
    }
}

function saveToDos() {
    const items = [];
    document.querySelectorAll(".todo-item").forEach(item => {
        items.push({
            text: item.querySelector(".todo-text").textContent,
            completed: item.classList.contains("completed")
        });
    });
    localStorage.setItem("toDoItems", JSON.stringify(items));
}

function createToDoElement(text, completed = false, save = true) {
    const li = document.createElement("li");
    li.className = "todo-item" + (completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = completed;
    
    checkbox.addEventListener("change", () => {
        li.classList.toggle("completed");
        saveToDos();
    });

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "todo-delete";
    deleteBtn.innerHTML = "&times;";
    deleteBtn.addEventListener("click", () => {
        li.remove();
        saveToDos();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    toDoList.appendChild(li);

    if (save) saveToDos();
}

function addTask() {
    const text = toDoInput.value.trim();
    if (text) {
        createToDoElement(text);
        toDoInput.value = "";
    }
}

addTaskBtn.addEventListener("click", addTask);

toDoInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        addTask();
    }
});


loadToDos();
// making sure each widget has its own customizable things

let editMode = false;

document.getElementById("editToggle").onclick = () => { 
    editMode = !editMode;
    document.body.classList.toggle("edit-mode");
};

document.querySelectorAll(".widget").forEach(widget => { // accesses each widget
    const handle = widget.querySelector(".resize-handle");
    const wide = widget.querySelector(".wide-adjust");
    // dragging the widget
    let activeDrag = false;
    startX = 0;
    startY = 0;


    widget.addEventListener("pointerdown", e => {
        if (!editMode) return;
        if (e.target === handle || e.target === wide) return; // ignore if resizing
        if(resizing || wide_adj) return;

        activeDrag = true;
        const rect = widget.getBoundingClientRect();
        X = e.clientX - rect.left;
        Y = e.clientY - rect.top;

    });

    document.addEventListener("pointermove", e => {
        if (activeDrag) {
            widget.style.left = e.clientX - X + "px";
            widget.style.top = e.clientY - Y + "px";
        }
    });

    document.addEventListener("pointerup", () => {
        if (activeDrag) saveWidget(widget);
        activeDrag = false;
    });

    let resizing = false;
    let resizingStartData = {};

    handle.addEventListener("mousedown", e => {
        if (!editMode || wide_adj) return;
        resizing = true;
        const rect = widget.getBoundingClientRect();
        
        resizingStartData = {
            aspectRatio: rect.height / rect.width,
            fontRatios: []
        };
        
        widget.querySelectorAll("*").forEach(child => {
            if (child.classList.contains("resize-handle") || child.classList.contains("wide-adjust")) return;
            
            const currentFontSize = parseFloat(window.getComputedStyle(child).fontSize);
            if (currentFontSize > 0) {
                resizingStartData.fontRatios.push({
                    element: child,
                    ratio: currentFontSize / rect.height
                });
            }
        });
        
        e.preventDefault();
    });

    document.addEventListener("mousemove", e => {
        if (!resizing) return;

        const rect = widget.getBoundingClientRect();
        let newWidth = e.clientX - rect.left;
        let newHeight = newWidth * resizingStartData.aspectRatio;

        newWidth = Math.max(50 / resizingStartData.aspectRatio, Math.min(newWidth, 2000));
        newHeight = newWidth * resizingStartData.aspectRatio;

        widget.style.width = newWidth + "px";
        widget.style.height = newHeight + "px";
        
        resizingStartData.fontRatios.forEach(({ element, ratio }) => {
            element.style.fontSize = (newHeight * ratio) + "px";
        });
    });

    let wide_adj = false;

    wide.addEventListener("mousedown", e => {
        if (!editMode || resizing) return;
        wide_adj = true;    
        e.preventDefault();
    });

    document.addEventListener("mousemove", e => {
        if (!wide_adj) return;

        const rect = widget.getBoundingClientRect();
        let newWidth = e.clientX - rect.left;
        widget.style.width = newWidth + "px";
    });

    document.addEventListener("mouseup", () => {
        if (resizing || wide_adj) saveWidget(widget);
        resizing = false;
        wide_adj = false;
    });

});

function saveWidget(widget) {
    const fontSizes = {};
    
    widget.querySelectorAll("*").forEach((child, index) => {
        if (child.classList.contains("resize-handle") || child.classList.contains("wide-adjust")) return;
        
        const fontSize = window.getComputedStyle(child).fontSize;
        if (fontSize && parseFloat(fontSize) > 0) {
            const elementId = child.id || Array.from(child.classList).join('-') || `elem-${index}`;
            fontSizes[elementId] = fontSize;
        }
    });

    localStorage.setItem(widget.id, JSON.stringify({
        left: widget.style.left,
        top: widget.style.top,
        width: widget.style.width,
        height: widget.style.height,
        fontSizes: fontSizes
    }));
}

function loadWidgets() {
    document.querySelectorAll(".widget").forEach(widget => {
        const saved = localStorage.getItem(widget.id);
        if (!saved) return;
        
        const data = JSON.parse(saved);
        widget.style.left = data.left;
        widget.style.top = data.top;
        widget.style.width = data.width;
        widget.style.height = data.height;

        if (data.fontSizes) {
            widget.querySelectorAll("*").forEach((child, index) => {
                if (child.classList.contains("resize-handle") || child.classList.contains("wide-adjust")) return;
                
                const elementId = child.id || Array.from(child.classList).join('-') || `elem-${index}`;
                if (data.fontSizes[elementId]) {
                    child.style.fontSize = data.fontSizes[elementId];
                }
            });
        }
    });
}

loadWidgets();

const settingsButton = document.getElementById("settings");
const modal = document.getElementById("settingsModal");
const closeButton = document.getElementById("closeSettings");
const bg = document.getElementById("bgVideo");

settingsButton.addEventListener("click", () => {
    modal.style.display = "block";
});

closeSettings.addEventListener("click", () => {
    modal.style.display = "none";
});


window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
});


// settings video listing
const videoList = document.getElementById("videoList");

function addUserVideo(file) {
    const tx = db.transaction("videos", "readwrite");
    const store = tx.objectStore("videos");

    store.put({
        name: file.name,
        file: file,
        type: file.type.startsWith('image/') ? 'image' : 'video' 
    });
    displayVideo(file, file.name);
}

function displayVideo(file, name) {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const img = document.createElement("img");
    img.classList.add("video-item");
    img.dataset.name = name;

    img.onclick = () => {
        setBackgroundVideo(name);
    };

    const del = document.createElement("div");
    del.classList.add("delete-video");
    del.textContent = '\u00D7';

    del.onclick = e => {
        e.stopPropagation(); 
        deleteVideo(name);
        wrapper.remove();
    };

    wrapper.appendChild(img);
    wrapper.appendChild(del);

    if (file.type.startsWith('image/')) {
        const blobURL = URL.createObjectURL(file);
        blobURLs.set(name, blobURL);
        img.src = blobURL;
    } else {
        const video = document.createElement("video");
        const blobURL = URL.createObjectURL(file);
        blobURLs.set(name, blobURL);
        video.src = blobURL;
        video.muted = true;
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            if (video.duration && isFinite(video.duration)) {
                video.currentTime = Math.min(0.5, video.duration / 2);
            }
        };

        video.onseeked = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                img.src = canvas.toDataURL("image/jpeg", 0.8);
            } catch (error) {
                console.error("Error creating thumbnail:", error);
            }
        };
    }
    
    videoList.appendChild(wrapper);
}

function deleteVideo(name) {
    if (videoCache.has(name)) {
        URL.revokeObjectURL(videoCache.get(name));
        videoCache.delete(name);
    }
    
    const tx = db.transaction("videos", "readwrite");
    const store = tx.objectStore("videos");

    store.delete(name);
}

function loadSavedVideos() {
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const req = store.getAll();

    req.onsuccess = () => {
        req.result.forEach(v => {
            if (v.file) {
                displayVideo(v.file, v.name, true);
            } else {
                console.error("No file found for:", v.name);
            }
        });
    };
}

document.getElementById("videoUpload").addEventListener("change", e => {
    const file = e.target.files[0];
    if (file) addUserVideo(file);
});

function setBackgroundVideo(name) {
    localStorage.setItem("currentBackground", name);
    
    if (blobURLs.has(name)) {
        const tx = db.transaction("videos", "readonly");
        const store = tx.objectStore("videos");
        const req = store.get(name);

        req.onsuccess = () => {
            const bgVideo = document.getElementById("bgVideo");
            const bgImage = document.getElementById("bgImage");
            
            if (req.result.type === 'image') {
                bgVideo.style.display = "none";
                bgImage.style.display = "block";
                bgImage.src = blobURLs.get(name);
            } else {
                bgImage.style.display = "none";
                bgVideo.style.display = "block";
                bgVideo.src = blobURLs.get(name);
            }
        };
        return;
    }
    
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const req = store.get(name);

    req.onsuccess = () => {
        const blobURL = URL.createObjectURL(req.result.file);
        blobURLs.set(name, blobURL);
        
        const bgVideo = document.getElementById("bgVideo");
        const bgImage = document.getElementById("bgImage");
        
        if (req.result.type === 'image') {
            bgVideo.style.display = "none";
            bgImage.style.display = "block";
            bgImage.src = blobURL;
        } else {
            bgImage.style.display = "none";
            bgVideo.style.display = "block";
            bgVideo.src = blobURL;
        }
    };
}

function loadSavedBackground() {
    const saved = localStorage.getItem("currentBackground");
    if (saved) {
        setBackgroundVideo(saved); 
    }
}

function preloadAllVideos() {
    const tx = db.transaction("videos", "readonly");
    const req = tx.objectStore("videos").getAll();
    
    req.onsuccess = () => {
        req.result.forEach(v => {
            if (!blobURLs.has(v.name)) {
                blobURLs.set(v.name, URL.createObjectURL(v.file));
            }
        });
    };
}

// weather

async function getWeather(cityName) {
    try {
        if (!cityName) {
            document.getElementById("weatherLocation").textContent = "Set location";
            document.getElementById("weatherTemp").textContent = "--\u00B0F";
            document.getElementById("weatherDesc").textContent = "in settings";
            return;
        }

        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`
        );
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            document.getElementById("weatherTemp").textContent = "City not found";
            return;
        }

        const lat = geoData.results[0].latitude;
        const lon = geoData.results[0].longitude;
        const displayName = geoData.results[0].name;

        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`
        );
        const data = await response.json();

        const weatherDescriptions = {
            0: "Clear sky",
            1: "Mainly clear",
            2: "Partly cloudy",
            3: "Overcast",
            45: "Foggy",
            48: "Foggy",
            51: "Light drizzle",
            53: "Drizzle",
            55: "Heavy drizzle",
            61: "Light rain",
            63: "Rain",
            65: "Heavy rain",
            71: "Light snow",
            73: "Snow",
            75: "Heavy snow",
            77: "Snow grains",
            80: "Light showers",
            81: "Showers",
            82: "Heavy showers",
            85: "Light snow showers",
            86: "Snow showers",
            95: "Thunderstorm",
            96: "Thunderstorm with hail",
            99: "Thunderstorm with hail"
        };

        const weatherCode = data.current.weather_code;
        const description = weatherDescriptions[weatherCode] || "Unknown";

        document.getElementById("weatherLocation").textContent = displayName;
        document.getElementById("weatherTemp").textContent = Math.round(data.current.temperature_2m) + "\u00B0F";
        document.getElementById("weatherDesc").textContent = description;
    } catch (error) {
        // console.error("Weather fetch error:", error);
        document.getElementById("weatherTemp").textContent = "Error loading";
    }
}

document.getElementById("saveCity").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value.trim();
    if (city) {
        localStorage.setItem("weatherCity", city);
        getWeather(city);
    }
});

function loadWeatherCity() {
    const savedCity = localStorage.getItem("weatherCity");
    if (savedCity) {
        document.getElementById("cityInput").value = savedCity;
        getWeather(savedCity);
    } else {
        getWeather(null); 
    }
}

loadWeatherCity();

setInterval(() => {
    const city = localStorage.getItem("weatherCity");
    if (city) getWeather(city);
}, 600000);



// shortcuts
let shortcuts = [];

function loadShortcuts() {
    const saved = localStorage.getItem("shortcuts");
    if (saved) {
        shortcuts = JSON.parse(saved);
        displayShortcuts();
        displayShortcutsList();
    }
}

function saveShortcuts() {
    localStorage.setItem("shortcuts", JSON.stringify(shortcuts));
}

function displayShortcuts() {
    const grid = document.getElementById("shortcutsGrid");
    grid.innerHTML = "";

    const savedColor = localStorage.getItem("fontColor");
    
    shortcuts.forEach((shortcut, index) => {
        const item = document.createElement("a");
        item.className = "shortcut-item";
        item.href = shortcut.url;
        item.target = "_blank";
        if (savedColor) item.style.color = savedColor;
        
        const icon = document.createElement("div");
        icon.className = "shortcut-icon";
        
        if (iconLibrary[shortcut.icon]) {
            icon.innerHTML = iconLibrary[shortcut.icon];
        } else if (shortcut.icon.startsWith("http")) {
            const img = document.createElement("img");
            img.src = shortcut.icon;
            img.onerror = () => { icon.textContent = "🔗"; };
            icon.appendChild(img);
        } else {
            icon.textContent = shortcut.icon;
        }
        
        const name = document.createElement("div");
        name.className = "shortcut-name";
        name.textContent = shortcut.name;
        
        item.appendChild(icon);
        item.appendChild(name);
        grid.appendChild(item);
    });
}

function displayShortcutsList() {
    const list = document.getElementById("shortcutsList");
    list.innerHTML = "";
    
    shortcuts.forEach((shortcut, index) => {
        const item = document.createElement("div");
        item.className = "shortcut-list-item";
        
        const info = document.createElement("span");
        info.textContent = `${shortcut.icon} ${shortcut.name} - ${shortcut.url}`;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "shortcut-list-delete";
        deleteBtn.innerHTML = "&times;";
        deleteBtn.onclick = () => {
            shortcuts.splice(index, 1);
            saveShortcuts();
            displayShortcuts();
            displayShortcutsList();
        };
        
        item.appendChild(info);
        item.appendChild(deleteBtn);
        list.appendChild(item);
    });
}

document.getElementById("shortcutIconSelect").addEventListener("change", (e) => {
    const customInput = document.getElementById("shortcutIcon");
    if (e.target.value === "custom") {
        customInput.style.display = "block";
    } else {
        customInput.style.display = "none";
    }
});

document.getElementById("addShortcut").addEventListener("click", () => {
    const name = document.getElementById("shortcutName").value.trim();
    const url = document.getElementById("shortcutURL").value.trim();
    const iconSelect = document.getElementById("shortcutIconSelect").value;
    const customIcon = document.getElementById("shortcutIcon").value.trim();
    
    if (name && url) {
        const fullURL = url.startsWith("http") ? url : `https://${url}`;
        
        let icon;
        if (iconSelect === "custom") {
            icon = customIcon || "🔗";
        } else if (iconSelect && iconLibrary[iconSelect]) {
            icon = iconSelect; 
        } else {
            icon = "🔗";
        }
        
        shortcuts.push({
            name: name,
            url: fullURL,
            icon: icon
        });
        
        saveShortcuts();
        displayShortcuts();
        displayShortcutsList();
        
        document.getElementById("shortcutName").value = "";
        document.getElementById("shortcutURL").value = "";
        document.getElementById("shortcutIconSelect").value = "";
        document.getElementById("shortcutIcon").value = "";
        document.getElementById("shortcutIcon").style.display = "none";
    }
});

loadShortcuts();

function performSearch() {
    const query = document.getElementById("searchInput").value.trim();
    
    if (query) {
        const searchURL = "https://www.google.com/search?q=" + encodeURIComponent(query);
        window.open(searchURL, '_blank');
        document.getElementById("searchInput").value = "";
    }
}


document.getElementById("searchButton").addEventListener("click", performSearch);

document.getElementById("searchInput").addEventListener("keypress", e => {
    if (e.key === "Enter") {
        performSearch();
    }
});

document.addEventListener("keydown", e => {
    if (e.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        e.preventDefault();
        document.getElementById("searchInput").focus();
    }
    
    if (e.key === "Escape" && document.activeElement === document.getElementById("searchInput")) {
        document.getElementById("searchInput").blur();
    }
});

function applyFontColor(color) {
    document.querySelectorAll(".widget").forEach(widget => {
        widget.style.setProperty('color', color, 'important');
    });
    
    
    document.getElementById("editToggle").style.color = color;
    document.getElementById("settings").style.color = color;


    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    document.querySelectorAll('.input-wrapper').forEach(wrapper => {
        wrapper.style.borderBottomColor = `rgba(${r}, ${g}, ${b}, 0.2)`;
    });
    document.documentElement.style.setProperty('--input-underline-color', color);
    
    // filling svg icons
    document.querySelectorAll('.shortcut-icon svg').forEach(svg => {
        svg.style.fill = color;
        svg.querySelectorAll('path').forEach(path => {
            path.style.fill = color;
        });
    });
}

function loadFontColor() {
    const savedColor = localStorage.getItem("fontColor");
    if (savedColor) {
        document.getElementById("fontColorPicker").value = savedColor;
        applyFontColor(savedColor);
    }
}

document.getElementById("fontColorPicker").addEventListener("input", (e) => {
    const color = e.target.value;
    localStorage.setItem("fontColor", color);
    applyFontColor(color);
});


loadFontColor();

// calendar widget
let calendarEvents = {};
let calCurrentDate = new Date();
let calSelectedDate = null;

function loadCalendarEvents() {
    const saved = localStorage.getItem("calendarEvents");
    if (saved) calendarEvents = JSON.parse(saved);
}

function saveCalendarEvents() {
    localStorage.setItem("calendarEvents", JSON.stringify(calendarEvents));
}

function renderCalendar() {
    const year = calCurrentDate.getFullYear();
    const month = calCurrentDate.getMonth();

    document.getElementById("calMonthYear").textContent = 
        calCurrentDate.toLocaleString("default", { month: "long", year: "numeric" });

    const grid = document.getElementById("calendarGrid");
    grid.querySelectorAll(".cal-day").forEach(d => d.remove());

    const today = new Date();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "cal-day empty";
        grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "cal-day";
        cell.textContent = day;

        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
            cell.classList.add("today");
        }

        if (calendarEvents[dateKey] && calendarEvents[dateKey].length > 0) {
            cell.classList.add("has-events");
        }

        cell.addEventListener("click", () => openEventModal(dateKey, day, month, year));
        grid.appendChild(cell);
    }
}

function openEventModal(dateKey, day, month, year) {
    calSelectedDate = dateKey;

    const months = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];
    document.getElementById("calEventDate").textContent = `${months[month]} ${day}, ${year}`;
    
    renderEventList();
    document.getElementById("calEventModal").classList.add("open");
    document.getElementById("calEventInput").focus();
}

function renderEventList() {
    const list = document.getElementById("calEventList");
    list.innerHTML = "";

    const events = calendarEvents[calSelectedDate] || [];

    if (events.length === 0) {
        list.innerHTML = `<div style="opacity: 0.5; font-size: 13px;">No events</div>`;
        return;
    }

    events.forEach((event, index) => {
        const item = document.createElement("div");
        item.className = "cal-event-item";

        const text = document.createElement("span");
        text.textContent = event;

        const del = document.createElement("button");
        del.className = "cal-event-delete";
        del.innerHTML = "&times;";
        del.onclick = () => {
            calendarEvents[calSelectedDate].splice(index, 1);
            if (calendarEvents[calSelectedDate].length === 0) {
                delete calendarEvents[calSelectedDate];
            }
            saveCalendarEvents();
            renderEventList();
            renderCalendar();
        };

        item.appendChild(text);
        item.appendChild(del);
        list.appendChild(item);
    });
}

function addCalendarEvent() {
    const input = document.getElementById("calEventInput");
    const text = input.value.trim();
    if (!text) return;

    if (!calendarEvents[calSelectedDate]) calendarEvents[calSelectedDate] = [];
    calendarEvents[calSelectedDate].push(text);
    
    saveCalendarEvents();
    renderEventList();
    renderCalendar();
    input.value = "";
}

document.getElementById("calPrev").addEventListener("click", (e) => {
    e.stopPropagation();
    calCurrentDate.setMonth(calCurrentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById("calNext").addEventListener("click", (e) => {
    e.stopPropagation();
    calCurrentDate.setMonth(calCurrentDate.getMonth() + 1);
    renderCalendar();
});

document.getElementById("calEventAdd").addEventListener("click", addCalendarEvent);

document.getElementById("calEventInput").addEventListener("keypress", e => {
    if (e.key === "Enter") addCalendarEvent();
});

document.getElementById("calEventClose").addEventListener("click", () => {
    document.getElementById("calEventModal").classList.remove("open");
});

document.getElementById("calEventModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("calEventModal")) {
        document.getElementById("calEventModal").classList.remove("open");
    }
});

loadCalendarEvents();
renderCalendar();


function updateProgress() {
    const now = new Date();


    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);
    const yearPct = ((now - startOfYear) / (endOfYear - startOfYear) * 100).toFixed(1);


    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const monthPct = ((now - startOfMonth) / (endOfMonth - startOfMonth) * 100).toFixed(1);


    const dayOfWeek = (now.getDay() + 6) % 7; 
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    const weekPct = ((now - startOfWeek) / (endOfWeek - startOfWeek) * 100).toFixed(1);

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(24, 0, 0, 0);
    const dayPct = ((now - startOfDay) / (endOfDay - startOfDay) * 100).toFixed(1);


    const bars = {
        Year: yearPct,
        Month: monthPct,
        Week: weekPct,
        Day: dayPct
    };

    Object.entries(bars).forEach(([name, pct]) => {
        document.getElementById(`progress${name}`).style.width = pct + "%";
        document.getElementById(`progress${name}Pct`).textContent = pct + "%";
    });
}

updateProgress();
setInterval(updateProgress, 1000);

// toggling stuff
function loadToggles() {
    const clockToggle = localStorage.getItem("showClock") !== "false";
    const todoToggle = localStorage.getItem("showToDo") !== "false";
    const secondsToggle = localStorage.getItem("showSeconds") !== "false";
    const colonsToggle = localStorage.getItem("showColons") !== "false";
    const weatherToggle = localStorage.getItem("showWeather") !== "false";
    const shortcutsToggle = localStorage.getItem("showShortcuts") !== "false";
    const shortcutNamesToggle = localStorage.getItem("showShortcutNames") !== "false";
    const searchToggle = localStorage.getItem("showSearch") !== "false";
    const calendarToggle = localStorage.getItem("showCalendar") !== "false";
    const progressToggle = localStorage.getItem("showProgress") !== "false";
    const progressYearToggle = localStorage.getItem("showProgressYear") !== "false";
    const progressMonthToggle = localStorage.getItem("showProgressMonth") !== "false";
    const progressWeekToggle = localStorage.getItem("showProgressWeek") !== "false";
    const progressDayToggle = localStorage.getItem("showProgressDay") !== "false";

    document.getElementById("toggleClock").checked = clockToggle;
    document.getElementById("toggleToDo").checked = todoToggle;
    document.getElementById("toggleSeconds").checked = secondsToggle;
    document.getElementById("toggleColons").checked = colonsToggle;
    document.getElementById("toggleWeather").checked = weatherToggle;
    document.getElementById("toggleShortcuts").checked = shortcutsToggle;
    document.getElementById("toggleShortcutNames").checked = shortcutNamesToggle;
    document.getElementById("toggleSearch").checked = searchToggle;
    document.getElementById("toggleCalendar").checked = calendarToggle;
    document.getElementById("toggleProgress").checked = progressToggle;
    document.getElementById("toggleProgressYear").checked = progressYearToggle;
    document.getElementById("toggleProgressMonth").checked = progressMonthToggle;
    document.getElementById("toggleProgressWeek").checked = progressWeekToggle;
    document.getElementById("toggleProgressDay").checked = progressDayToggle;

    document.getElementById("clockWidget").style.display = clockToggle ? "block" : "none";
    document.getElementById("toDoListWidget").style.display = todoToggle ? "block" : "none";
    document.getElementById("weatherWidget").style.display = weatherToggle ? "block" : "none";
    document.getElementById("shortcutsWidget").style.display = shortcutsToggle ? "block" : "none";
    document.getElementById("searchWidget").style.display = searchToggle ? "block" : "none";
    document.getElementById("calendarWidget").style.display = calendarToggle ? "block" : "none";
    document.getElementById("progressWidget").style.display = progressToggle ? "block" : "none";
    document.getElementById("progressYearRow").style.display = progressYearToggle ? "flex" : "none";
    document.getElementById("progressMonthRow").style.display = progressMonthToggle ? "flex" : "none";
    document.getElementById("progressWeekRow").style.display = progressWeekToggle ? "flex" : "none";
    document.getElementById("progressDayRow").style.display = progressDayToggle ? "flex" : "none";

    if (!shortcutNamesToggle) {
    document.body.classList.add("hide-shortcut-names");
}

}

document.getElementById("toggleClock").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showClock", show);
    document.getElementById("clockWidget").style.display = show ? "block" : "none";
});

document.getElementById("toggleToDo").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showToDo", show);
    document.getElementById("toDoListWidget").style.display = show ? "block" : "none";
});

document.getElementById("toggleSeconds").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showSeconds", show);
    updateTime();
});

document.getElementById("toggleColons").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showColons", show);
    updateTime();
});

document.getElementById("toggleWeather").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showWeather", show);
    document.getElementById("weatherWidget").style.display = show ? "block" : "none";
});

document.getElementById("toggleShortcuts").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showShortcuts", show);
    document.getElementById("shortcutsWidget").style.display = show ? "block" : "none";
});

document.getElementById("toggleShortcutNames").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showShortcutNames", show);
    if (show) {
        document.body.classList.remove("hide-shortcut-names");
    } else {
        document.body.classList.add("hide-shortcut-names");
    }
});

document.getElementById("toggleSearch").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showSearch", show);
    document.getElementById("searchWidget").style.display = show ? "block" : "none";
});

loadToggles();

document.getElementById("toggleCalendar").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showCalendar", show);
    document.getElementById("calendarWidget").style.display = show ? "block" : "none";
});

document.getElementById("toggleProgress").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showProgress", show);
    document.getElementById("progressWidget").style.display = show ? "block" : "none";
});

document.getElementById("toggleProgressYear").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showProgressYear", show);
    document.getElementById("progressYearRow").style.display = show ? "flex" : "none";
});

document.getElementById("toggleProgressMonth").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showProgressMonth", show);
    document.getElementById("progressMonthRow").style.display = show ? "flex" : "none";
});

document.getElementById("toggleProgressWeek").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showProgressWeek", show);
    document.getElementById("progressWeekRow").style.display = show ? "flex" : "none";
});

document.getElementById("toggleProgressDay").addEventListener("change", e => {
    const show = e.target.checked;
    localStorage.setItem("showProgressDay", show);
    document.getElementById("progressDayRow").style.display = show ? "flex" : "none";
});