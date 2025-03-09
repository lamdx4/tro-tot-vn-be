Project Structure

This project follows a well-structured folder hierarchy to maintain modularity, scalability, and ease of maintenance. Below is an overview of the folder structure and its purpose:

src
├── domains
│   └── entities
├── infras
│   ├── db
│   └── repositories
├── services
├── utils
│   ├── config
│   └── constants
└── web
    ├── controller
    ├── middlewares
    ├── routers
    └── validator

Folder Descriptions

domains

This directory contains the core business entities of the application. It represents the domain models that define the structure and behavior of data objects.

entities/ - Contains domain entities representing core business objects.

infras

Handles infrastructure-level concerns such as database connections and repositories.

db/ - Manages database configurations, migrations, and setup.

repositories/ - Implements data access logic, interacting with the database to perform CRUD operations.

services

Contains the business logic layer, which processes and orchestrates data between repositories and controllers.

utils

Houses utility functions, constants, and configurations that are used across the application.

config/ - Stores application configuration settings, such as environment variables and service configurations.

constants/ - Contains global constants used in the application.

web

Responsible for handling HTTP requests and responses.

controller/ - Defines route handlers that process client requests.

middlewares/ - Contains middleware functions for request processing (e.g., authentication, logging, error handling).

routers/ - Defines route mappings that connect endpoints to controllers.

validator/ - Handles request validation to ensure proper input data.

This structure ensures a clean separation of concerns and promotes maintainability and scalability. 🚀