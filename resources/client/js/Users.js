"use strict";
function getUsersList() {
    debugger;
    console.log("Invoked getUsersList()");     //console.log your BFF for debugging client side - also use debugger statement
    const url = "/users/list/";    		// API method on web server will be in Users class, method list
    fetch(url, {
        method: "GET",				//Get method
    }).then(response => {
        return response.json();                 //return response as JSON
    }).then(response => {
        if (response.hasOwnProperty("Error")) { //checks if response from the web server has an "Error"
            alert(JSON.stringify(response));    // if it does, convert JSON object to string and alert (pop up window)
        } else {
            formatUsersList(response);          //this function will create an HTML table of the data (as per previous lesson)
        }
    });
}

function formatUsersList(myJSONArray){
    let dataHTML = "";
    for (let item of myJSONArray) {
        dataHTML += "<tr><td>" + item.UserID + "<td><td>" + item.UserName + "<tr><td>";
    }
    document.getElementById("UsersTable").innerHTML = dataHTML;
}


function UsersLogin() {
    debugger;
    console.log("Invoked UsersLogin() ");
    let url = "/users/login";
    let formData = new FormData(document.getElementById('LoginForm'));

    fetch(url, {
        method: "POST",
        body: formData,
    }).then(response => {
        return response.json();                 //now return that promise to JSON
    }).then(response => {
        if (response.hasOwnProperty("Error")) {
            alert(JSON.stringify(response));        // if it does, convert JSON object to string and alert
        } else {
            Cookies.set("Token", response.Token);
            Cookies.set("UserName", response.UserName);
            window.open("index.html", "_self");       //open index.html in same tab
        }
    });
}

function logout() {
    debugger;
    console.log("Invoked logout");
    let url = "/users/logout";
    fetch(url, {method: "POST"
    }).then(response => {
        return response.json();                 //now return that promise to JSON
    }).then(response => {
        if (response.hasOwnProperty("Error")) {
            alert(JSON.stringify(response));        // if it does, convert JSON object to string and alert
        } else {
            Cookies.remove("Token", response.Token);    //UserName and Token are removed
            Cookies.remove("UserName", response.UserName);
            window.open("index.html", "_self");       //open index.html in same tab
        }
    });
}

public static String generateHash(String text) {
    try {
        MessageDigest hasher = MessageDigest.getInstance("MD5");
        hasher.update(text.getBytes());
        return DatatypeConverter.printHexBinary(hasher.digest()).toUpperCase();
    } catch (NoSuchAlgorithmException nsae) {
        return nsae.getMessage();
    }
}

@POST
@Path("add")
public String UsersAdd(@FormDataParam("UserName") String UserName, @FormDataParam("PassWord") String PassWord, @FormDataParam("UserSkillLevel") Integer UserSkillLevel) {
    System.out.println("Invoked Users.UsersAdd()");
    try {
        String hashedPassword = generateHash(PassWord);  //added this line to hash the password that the user has signed up with.  This is then stored in the database - NOT the password.
        System.out.println("hashed password: "+ hashedPassword);
        PreparedStatement ps = Main.db.prepareStatement("INSERT INTO Users (UserName, PassWord, UserSkillLevel) VALUES (?, ?, ?)");
        ps.setString(1, UserName);
        ps.setString(2, hashedPassword);
        ps.setInt(3,UserSkillLevel);

        ps.execute();
        return "{\"OK\": \"Added user.\"}";
    } catch (Exception exception) {
        System.out.println("Database error: " + exception.getMessage());
        return "{\"Error\": \"Unable to create new item, please see server console for more info.\"}";
    }

}
@POST
@Path("login")
public String UsersLogin(@FormDataParam("UserName") String UserName, @FormDataParam("PassWord") String PassWord) {
    System.out.println("Invoked UserLogin() on path users/login");
    try {
        String hashedPassword = generateHash(PassWord);  //added this line hashed the password
        PreparedStatement ps1 = Main.db.prepareStatement("SELECT PassWord FROM Users WHERE UserName = ?");
        ps1.setString(1, UserName);
        ResultSet loginResults = ps1.executeQuery();
        if (loginResults.next() == true) {
            String correctPassword = loginResults.getString(1);
            if (PassWord.equals(correctPassword)) {
                String Token = UUID.randomUUID().toString();
                PreparedStatement ps2 = Main.db.prepareStatement("UPDATE Users SET Token = ? WHERE UserName = ?");
                ps2.setString(1, Token);
                ps2.setString(2, UserName);
                ps2.executeUpdate();
                JSONObject userDetails = new JSONObject();
                userDetails.put("UserName", UserName);
                userDetails.put("Token", Token);
                return userDetails.toString();
            } else {
                return "{\"Error\": \"Incorrect password!\"}";
            }
        } else {
            return "{\"Error\": \"Incorrect username.\"}";
        }
    } catch (Exception exception) {
        System.out.println("Database error during /users/login: " + exception.getMessage());
        return "{\"Error\": \"Server side error!\"}";
    }
}
