// Clock Stuff

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();

    document.getElementById("clock").textContent = timeString;
}

updateTime();
setInterval(updateTime, 1000);

// Widget Movement
