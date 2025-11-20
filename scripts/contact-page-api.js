/**
 * Fetches JSON data from Firebase for a given path.
 * @async
 * @param {string} path - Firebase collection/path (without .json).
 * @returns {Promise<any>} Parsed JSON response.
 */
async function getAllUsers(path) {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}

/**
 * Patches (partially updates) a Firebase node by path and id.
 * @async
 * @param {string} [path=""] - Firebase collection/path.
 * @param {string|number} [id=""] - Firebase node id/key.
 * @param {Object} [data={}] - Partial data to patch.
 * @returns {Promise<any>} Parsed JSON response.
 */
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

/**
 * Finds a user's Firebase ID by their username.
 * @async
 * @param {string} inputUsername - Username to search for.
 * @returns {Promise<string|null>} Firebase user id if found, otherwise null.
 */
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

/**
 * Updates a user's friends list in Firebase.
 * @async
 * @param {string|number} inputID - Firebase user id/key.
 * @param {any} inputObject - Friends list/object to store under `friends`.
 * @returns {Promise<void>}
 */
async function updateUserFriendslist(inputID, inputObject){
    const updatedData = { friends: inputObject}
    await patchDataWithID("users", inputID, updatedData);
}
