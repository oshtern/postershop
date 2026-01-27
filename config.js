const config = {
    email: process.env.USER_EMAIL || "testproject@tutamail.com",
    password: process.env.USER_PASSWORD || "TestP20dec#",
    url: "http://localhost:5173/login",

    staticData: {
        taskDescription: "This is a new task",
        taskPriority: "high",
        clientName: "Verla Leffler",
        assigneeName: "Sofia Basic",
    }
};

module.exports = config