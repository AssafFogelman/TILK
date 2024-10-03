let url = "https://tilk-api.onrender.com/api/v1/users/1234567890";

someData_1 = { word: "hello" };
someData_2 = { word: "how" };
someData_3 = { word: "are" };
someData_4 = { word: "you" };
someData_5 = { word: "doing", otherData: "hello" };
someData_6 = { word: "today", otherData: "how" };

let newUpdate = {};
let newestData = {};

newUpdate = { ...someData_1 };
newestData = { ...newestData, [url]: { ...newestData[url], ...newUpdate } };
console.log(newestData);

newUpdate = { ...someData_2 };
newestData = { ...newestData, [url]: { ...newestData[url], ...newUpdate } };
console.log(newestData);

newUpdate = { ...someData_3 };
newestData = { ...newestData, [url]: { ...newestData[url], ...newUpdate } };
console.log(newestData);

newUpdate = { ...someData_4 };
newestData = { ...newestData, [url]: { ...newestData[url], ...newUpdate } };
console.log(newestData);

newUpdate = { ...someData_5 };
newestData = { ...newestData, [url]: { ...newestData[url], ...newUpdate } };
console.log(newestData);

newUpdate = { ...someData_6 };
newestData = { ...newestData, [url]: { ...newestData[url], ...newUpdate } };
console.log(newestData);
