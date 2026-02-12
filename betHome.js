let db;
const videoCache = new Map();
const blobURLs = new Map();
const openReq = indexedDB.open("VideoDB", 1);

openReq.onupgradeneeded = e => {
    db = e.target.result;
    db.createObjectStore("videos", { keyPath: "name" });
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

    // resizing each widget
    let resizing = false;
    let resizingStartRatio = 0;
    handle.addEventListener("mousedown", e => {
        if (!editMode || wide_adj) return;
        resizing = true;
        const rect = widget.getBoundingClientRect();
        resizingStartRatio = rect.height/rect.width;
        e.preventDefault();
    });

    document.addEventListener("mousemove", e => {
        if (!resizing) return;

        const rect = widget.getBoundingClientRect();
        let newWidth = e.clientX - rect.left;
        let newHeight = newWidth * resizingStartRatio;

        newWidth = Math.max(50 / resizingStartRatio, Math.min(newWidth, 2000));
        newHeight = newWidth * resizingStartRatio;

        widget.style.width = newWidth + "px";
        widget.style.height = newHeight + "px";
        
        let fontSize = 30;
        if(widget.id == "clockWidget") fontSize = newHeight / 1.25;

        widget.querySelectorAll("div").forEach(child => {
            if (!child.classList.contains("resize-handle") && !child.classList.contains("wide-adjust")) {
                child.style.fontSize = fontSize + "px";
            }
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
        // ratio = rect.height/rect.width;
        let newWidth = e.clientX - rect.left;
        // newWidth = Math.max(50 / ratio, Math.min(newWidth, 2000)); 
        widget.style.width = newWidth + "px";
    });

    document.addEventListener("mouseup", () => {
        if (resizing || wide_adj) saveWidget(widget);
        resizing = false;
        wide_adj = false;
    });

});

// saving and loading widgets

function saveWidget(widget) {
    const id = widget.id;
    let fontSize = "40px"; // default
    
    if (widget.id === "clockWidget") {
        const digit = widget.querySelector(".digit");
        if (digit) {
            fontSize = window.getComputedStyle(digit).fontSize;
        }
    } else {
        const contentDiv = widget.querySelector("div:not(.resize-handle):not(.wide-adjust)");
        if (contentDiv) {
            fontSize = window.getComputedStyle(contentDiv).fontSize;
        }
    }

    // console.log(fontSize);

    localStorage.setItem(id, JSON.stringify({
        left: widget.style.left,
        top: widget.style.top,
        width: widget.style.width,
        height: widget.style.height,
        fontSize: fontSize
    }));
}

function loadWidgets() {
  document.querySelectorAll(".widget").forEach(widget => {
    const saved = localStorage.getItem(widget.id);
    
    if (!saved) return;
    const data = JSON.parse(saved);

    // console.log(widget.id);
    // console.log(data.fontSize);


    widget.style.left = data.left;
    widget.style.top = data.top;
    widget.style.width = data.width;
    widget.style.height = data.height;


    widget.querySelectorAll("div").forEach(child => {
      if (!child.classList.contains("resize-handle") && !child.classList.contains("wide-adjust")) {
        child.style.fontSize = data.fontSize;
      }
    });
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
    // if (e.target === bg) {
    //     editMode = false;
    //     document.body.classList.toggle("edit-mode");
    // }
});


// settings video listing
const videoList = document.getElementById("videoList");

function addUserVideo(file) { // adding the video to the db
    const tx = db.transaction("videos", "readwrite");
    const store = tx.objectStore("videos");

    store.put({
        name: file.name,
        file: file
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
        document.getElementById("bgVideo").src = blobURLs.get(name);
        return;
    }
    
    const tx = db.transaction("videos", "readonly");
    const store = tx.objectStore("videos");
    const req = store.get(name);

    req.onsuccess = () => {
        const blobURL = URL.createObjectURL(req.result.file);
        blobURLs.set(name, blobURL);
        document.getElementById("bgVideo").src = blobURL;
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
            document.getElementById("weatherTemp").textContent = "--°F";
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

        // Fetch weather data
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
        console.error("Weather fetch error:", error);
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

// toggling stuff
function loadToggles() {
    const clockToggle = localStorage.getItem("showClock") !== "false";
    const todoToggle = localStorage.getItem("showToDo") !== "false";
    const secondsToggle = localStorage.getItem("showSeconds") !== "false";
    const colonsToggle = localStorage.getItem("showColons") !== "false";
    const weatherToggle = localStorage.getItem("showWeather") !== "false";

    document.getElementById("toggleClock").checked = clockToggle;
    document.getElementById("toggleToDo").checked = todoToggle;
    document.getElementById("toggleSeconds").checked = secondsToggle;
    document.getElementById("toggleColons").checked = colonsToggle;
    document.getElementById("toggleWeather").checked = weatherToggle;

    document.getElementById("clockWidget").style.display = clockToggle ? "block" : "none";
    document.getElementById("toDoListWidget").style.display = todoToggle ? "block" : "none";
    document.getElementById("weatherWidget").style.display = weatherToggle ? "block" : "none";


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

loadToggles();

