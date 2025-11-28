/**
 * Fetches all users from the database under the given path.
 * @param {string} path - The database path to retrieve.
 * @returns {Promise<Object>} The JSON response containing all users.
 */
async function getAllUsers(path) {
  let response = await fetch(BASE_URL + path + ".json");
  return (responseToJson = await response.json());
}


/**
 * Sends a PATCH request to update a specific database entry by ID.
 * @param {string} path - The parent path of the resource.
 * @param {string} id - The ID of the resource to update.
 * @param {Object} data - The partial data object to patch.
 * @returns {Promise<Object>} The updated JSON object from the server.
 */
async function patchDataWithID(path = "", id = "", data = {}) {
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
 * Retrieves the database ID of a user based on their username.
 * @param {string} inputUsername - The username whose ID should be located.
 * @returns {Promise<string|null>} The user ID, or null if not found.
 */
async function getUserID(inputUsername) {
  const responseAllUser = await getAllUsers("users");
  let userID = null;
  for (const userIDKey in responseAllUser) {
    const user = responseAllUser[userIDKey];
    if (!inputUsername) return null; {
      userID = userIDKey; 
      break;
    }
  }
  return userID;
}


/**
 * Updates a user's friends list by ID, storing the given object under "friends".
 * @param {string} inputID - The ID of the user to update.
 * @param {Array<Object>} inputObject - The updated friends list.
 * @returns {Promise<void>}
 */
async function updateUserFriendslist(inputID, inputObject) {
  const updatedData = { friends: inputObject };
  await patchDataWithID("users", inputID, updatedData);
}
