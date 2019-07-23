# web-projects

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 4.2.2.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) - a container for following needs 
    - [Node.js](https://nodejs.org) 
    - [Gulp](http://gulpjs.com/) 
    - [MongoDB](https://www.mongodb.org/)

## Build & Development

1. __Build__ the starter project's Docker containers and __start__ Docker Compose via the command line.
    ```
    cd scripts 
    ./start-container.sh
    ```
    on Windows machines, run __start-container.bat__ instead
    
    1. You should see output showing that MongoDB has started. 
    You will need to use a dedicated terminal to keep __mongoDB Daemon__ running here
    2. __NOTE__: The __start-container__ script will continue to run until you press CTRL+C. 
    When you press CTRL+C on Windows you will be asked a question "Terminate batch job (Y/N)?". Answer __NO (N/n)__ to the question.
    
          
2. __Attach__ to the runtime not-yet Docker container
    ```
    <From inside scripts folder>
    ./attach-container.sh
    ```
    on Windows machines, run __attach-container.bat__ instead
    
    1. The attach-container script will run a __bash__ shell inside the not-yet Docker container. You should see a prompt similar to this one:
        ```
        root@ee84a2c89d0d:/#
        ```
3. __Install__ server dependencies and __build__ the starter project inside the Docker container you attached
    ```
    cd /app/not-yet
    yarn install
    gulp
    ```
4. __Run__ the starter project inside the Docker container you attached
    ```
    cd /app/not-yet
    gulp serve
    ```
    1. __NOTE__: The gulp serve command will continue to run until you press CTRL+C twice. 
    2. You will need to use a dedicated terminal to run this command
    3. (optional) Run `SEED_DB=true gulp serve` to seed the database. 
5. Open a web browser and navigate to http://localhost:3000 
    1. The Not Yet landing page should be displayed
    2. __NOTE__: If you are running Docker Toolbox on Windows 10 Home you may need to navigate to http://192.168.99.100:3000/ instead

## Testing

Running `yarn test` will run the unit tests with karma.
