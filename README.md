# Web Game Prototype of Cards Against Humanity

This project is a **personal prototype** of the original game [Cards Against Humanity](https://www.cardsagainsthumanity.com/). All intellectual property rights, including design, branding, and game name, belong to them. You can view the original [terms of use](https://www.cardsagainsthumanity.com/terms-of-use) and the license [CC BY-NC-SA](https://creativecommons.org/licenses/by-nc-sa/4.0/)

This project was developed to learn about WebSockets, web components, REST APIs, and authentication using JSON Web Tokens. If you want the text of game cards, you can get the texts contained in the SQL archive `cartas_contra_humanidad`, specifically in the tables `cartas_blancas` for white cards and `cartas_negras` for black cards, under the same license as this project/repository. This also applies to the UI design and code.

## Features

- **User Account System:** Users can register, log in, and manage their accounts.
- **Real-Time Gameplay:** The game is played in real-time using a REST API and WebSockets, ensuring a smooth and uninterrupted gaming experience.
- **Custom Game Interface:** Two distinct interfaces for the zar and regular players, tailored to their specific roles in the game.
- **Game Creation and Lobby:** Users can create new games and join existing lobbies, facilitating the organization and start of games.
- **Points System:** Implementation of a points system that tracks player scores and determines the winner of the game.

## Technologies Used

- React
- Node.js
- Socket.io
- Express
- JSON Web Token [JWT]
- Tailwind CSS
- MySQL

## Screenshots

**Home page**
![index](https://github.com/user-attachments/assets/8976a802-a9c9-4b34-8c38-c5766a826871)

**Login**
![login](https://github.com/user-attachments/assets/1f03ccee-51a2-4eef-8863-afdaf750dadd)

**Register**
![register](https://github.com/user-attachments/assets/d3151c6d-0860-494b-87e1-fb9cace12747)

**Change room information according to players within them**

Room with owner inside
![lobby](https://github.com/user-attachments/assets/725eab34-9c06-4813-a7fc-5b5ce16054e8)

Room whit other player inside
![lobby 1](https://github.com/user-attachments/assets/b25fe73e-564e-4f81-9cdf-192f4dd45706)

Room full
![lobby 2](https://github.com/user-attachments/assets/60e621fc-b882-432f-8ad2-b056d8d49981)

**Join to a room**
![join](https://github.com/user-attachments/assets/d42b83aa-fbd6-4916-9756-8dd599c64b63)

**Rooms views**

Player view
![lobby party](https://github.com/user-attachments/assets/e96c5e23-b674-4393-a113-0e919d94e6f4)

Owner view
![owner lobby](https://github.com/user-attachments/assets/5e80d6fd-2bfb-403a-8049-8dc689ca11a4)

**Games views**

Player gameboard
![player view](https://github.com/user-attachments/assets/b3bacce5-56cd-4414-9915-e2cbdefe4e57)

Zar gameboard
![zar view](https://github.com/user-attachments/assets/7a8f7ca3-7077-4eda-aab1-fc959a2aa588)

**Round finished**
![Points and phrase](https://github.com/user-attachments/assets/6328346d-7473-49cf-a2a4-39d9e0e08e24)

**Account information**
![account](https://github.com/user-attachments/assets/04d13e8b-0af8-41ba-8a30-76f1527ef57c)

## Installation

1.  Clone the repository:
    `git clone https://github.com/JoseDHernandez/CHH`
2.  Import `cartas_contra_humanidad.sql` to you SQL database.
3.  Modify the variables in `config.js` in the server folder or client folder. [`client/scr/api/config.js`]

    **Server configuration**
    In `config.js` file:

        PORT          Port on which the server listens

        secret        Secret key for encrypting JSON Web Tokens (JWT)

        urlClient      URL of the client, used for CORS permissions

        DB_HOST        Database host

        DB_USER        Database username

        DB_PASSWORD    Password to access the database

        DB_NAME        Database name

        DB_PORT        Port of the database

    In `index.js` file:

    Cors for socket.io:

    ```javascript
    const io = new SocketServer(server, {
      cors: {
        origin: urlClient,
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });
    ```

    Cors for Express:

    ```javascript
    app.use(
      cors({
        origin: urlClient,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      })
    );
    ```

    Morgan format:

    ```javascript
    app.use(morgan("dev"));
    ```

    **Client configuration**
    In `config.js` file, content in the path `client/scr/api`

    `URL` is the variable of url the server API, is similar to server (`index.js`) console information:

    ```javascript
    console.log("Server running: " + DB_HOST + ":" + PORT);
    ```

4.  You can use the demo accounts:

    _Username:_ UserTest

    - Email: test@gmail.com
    - Password: 12345678

    ***

    _Username:_ Test

    - Email: test@test.com
    - Password: 12345678

    ***

    _Username:_ Username

    - Email: test@hotmail.com
    - Password: 12345678

5.  For the profile photo use a url of imgur o other picture link, you edit this in account settings (client IU) or the database: table `user` and column `Photo`.
6.  Not forget execute the command `npm run dev` or `npm run build` in the paths of client folder and server folder for use this project in a developer or build mode.

## API Routes

### Cards Routes

- **Black Cards**

  - `GET /cardsBlack` - Get all black cards.
  - `POST /cardsBlack` - Create a new black card (requires token and admin role).
  - `PUT /cardsBlack/:id` - Update a black card (requires token and moderator role).
  - `GET /cardsBlack/:id` - Get a specific black card by ID.
  - `DELETE /cardsBlack/:id` - Delete a black card (requires token).

- **White Cards**
  - `GET /cardsWhite` - Get all white cards.
  - `POST /cardsWhite` - Create a new white card (requires token and admin role).
  - `PUT /cardsWhite/:id` - Update a white card (requires token and admin role).
  - `GET /cardsWhite/:id` - Get a specific white card by ID.
  - `DELETE /cardsWhite/:id` - Delete a white card (requires token and admin role).

### Game Routes

---

**Tokens**

Account token (is a header):

- [:token] `Token` is a token by JWT with user information.

Sockets and the parameters :token and :code

- [:code] `codeParty` is de code of a game room.
- [:tokenParty] `tokenParty` is the token of information of game room

  _NOTE_: view the code in `sockets.js` in server folder (`server/routes`) for view uses and the local items stored in the local storage of client ( client user context [path ``client/src/context/User.context.jsx``]) and`.jsx` files for the behavior of the calls sockets, such us:

  - `sockets.js` in the path `server/routes`
  - `Partida.jsx` and `Salas.jsx` in the path `client/src/pages`
  - `Game.jsx`, `Zar.jsx`, `Player.jsx` and `chat.jsx` in the path `client/src/components`

---

- **Lobby and Party Management**

  - `GET /Game` - Verify token.
  - `GET /lobby/:code` - Join a party (requires token).
  - `GET /party/:code` - Enter party lobby (requires token).
  - `POST /party` - Verify party password (requires token).
  - `PUT /party` - Update party details (requires token).

- **Game Management**
  - `POST /game` - Start the game (requires token).
  - `GET /game` - Get the number of cards (requires token).
  - `GET /cards/:token` - Get player’s deck (requires token).
  - `GET /cardsOther/:token` - Get new reserve cards (requires token).
  - `POST /cards` - Save player’s deck (requires token).
  - `GET /cartas/:token` - Get selected cards by players (requires token).
  - `PUT /game` - Update points and round (requires token).
  - `GET /points/:token` - Get points (requires token).
  - `PUT /cards` - Save selected cards on the server (requires token).
  - `DELETE /party` - Delete a party (requires token).

### Authentication Routes

- `POST /signup` - Sign up a new user.
- `POST /signin` - Sign in an existing user.
- `GET /info` - Get general information.

### User Routes

_Note:_ `:id` is the ID of an account from database.

- `GET /user/:id` - Get user achievements (requires token).
- `PUT /user` - Update user information (requires token).

## Author

<p>
The view original game <a href="https://www.cardsagainsthumanity.com/">Cards Against Humanity</a>
</p>
<p>
This project is developed by José Hernández.  <a href="https://github.com/JoseDHernandez" target="blank"><img align="center"
         src="https://img.shields.io/badge/github-181717.svg?style=for-the-badge&logo=github&logoColor=white"
         alt="GitHub" height="30"/></a>
</p>

## License

<p xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/"><a property="dct:title" rel="cc:attributionURL" href="https://github.com/JoseDHernandez/CCH">CHH</a> by <a rel="cc:attributionURL dct:creator" property="cc:attributionName" href="https://github.com/JoseDHernandez">José David Hernández Hortúa</a> is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">CC BY-NC-SA 4.0<img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt=""><img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" alt=""></a></p>
