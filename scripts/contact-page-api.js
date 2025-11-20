async function getAllUsers(path) {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}


async function patchDataWithID(path = "", id = "", data = {}){
const response = await fetch(`${BASE_URL}${path}/${id}.json`, {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    });
    return await response.json();
}


async function getUserID(inputUsername) {
    const responseAllUser = await getAllUsers("users");
    let userID = null;

    for (const userIDKey in responseAllUser) {
        const user = responseAllUser[userIDKey];
        if (user.name   === inputUsername) {
            userID = userIDKey; // Verwende den Schlüssel als ID
            break;
        }
    }

    return userID;
}


async function updateUserFriendslist(inputID, inputObject){
    const updatedData = { friends: inputObject}
    await patchDataWithID("users", inputID, updatedData);
}

