const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Assign a unique userId for session
let userId = localStorage.getItem("userId");
if (!userId) {
    userId = "user_" + Date.now();
    localStorage.setItem("userId", userId);
}

function appendMessage(text, sender = "bot") {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.innerHTML = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendChart(chartType, labels, values) {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 200;
    chatBox.appendChild(canvas);

    new Chart(canvas, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: "Spending",
                data: values,
                backgroundColor: "rgba(54, 162, 235, 0.5)"
            }]
        }
    });
}

sendBtn.addEventListener("click", async () => {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage(message, "user");
    userInput.value = "";

    try {
        const response = await fetch("https://YOUR_N8N_WEBHOOK_URL", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, message })
        });

        const data = await response.json();

        if (data.type === "text") {
            appendMessage(data.message, "bot");
        } else if (data.type === "chart") {
            appendChart(data.chartType, data.labels, data.values);
        } else if (data.type === "mixed") {
            appendMessage(data.message, "bot");
            appendChart(data.chartType, data.labels, data.values);
        } else {
            appendMessage("I couldn't understand that.", "bot");
        }
    } catch (error) {
        appendMessage("Error: Unable to connect to the server.", "bot");
    }
});
