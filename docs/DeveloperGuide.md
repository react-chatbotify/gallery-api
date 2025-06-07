<p align="center">
  <img width="200px" src="https://raw.githubusercontent.com/tjtanjin/react-chatbotify/main/assets/logo.png" />
  <h1 align="center">React ChatBotify Gallery API</h1>
</p>

## Table of Contents

* [Introduction](#introduction)
* [Navigating this Developer Guide](#navigating-this-developer-guide)
* [Setup](#setup)
* [Design](#design)
* [Implementation](#implementation)
* [Project Management](#project-management)
* [Code Documentation](#code-documentation)
* [Testing](#testing)
* [Final Notes](#final-notes)

<div  style="page-break-after: always;"></div>

## Introduction

Welcome to the Developer Guide for the React Chatbotify Gallery API project. Before diving into this guide, ensure you have gone through the project [*README*](https://github.com/your-repo/react-chatbotify-gallery-website/blob/main/README.md) for an overview. This guide assumes you have a **basic understanding** of the following tools & technologies (or are **at least able to read up and learn about them**):
- [**NodeJS**](https://nodejs.org/en)
- [**ExpressJS**](https://expressjs.com/)
- [**TypeScript**](https://www.typescriptlang.org/)
- [**Docker**](https://www.docker.com/)
- [**MySQL**](https://www.mysql.com/)
- [**Redis**](https://redis.io/)
- [**Minio**](https://min.io/)
- [**Nginx**](https://nginx.org/en/)
- [**OAuth 2.0**](https://oauth.net/2/)
- [**Cookies**](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

In addition, you should also have a brief familiarity with [**React ChatBotify**](https://react-chatbotify.com), which is the core library that this project complements.

## Navigating this Developer Guide

To facilitate your reading, take note of the following syntaxes used throughout this guide:

| Syntax       | Description                                                                                   |
|--------------|-----------------------------------------------------------------------------------------------|
| `Code`       | Denotes functions, components, or code-related references (e.g., `App`, `useEffect`)          |
| *Italics*    | Refers to folder or file names (e.g., *App.js*, *components*)                                 |
| **Bold**     | Highlights important keywords or concepts                                                     |

<div  style="page-break-after: always;"></div>

## Setup

Setting up the project is relatively simple with [**Docker**](https://www.docker.com/). While it is technically feasible to setup the services of the project individually, it requires significantly more time and effort so you're **strongly discouraged** from doing so. The rest of this guide will assume that you have docker installed and have basic familiarity with [**Docker Compose**](https://docs.docker.com/compose/).

To setup the project locally, follow the steps below:
1) Fork the [project repository](https://github.com/tjtanjin/react-chatbotify-gallery-api).
2) Clone the **forked project** into your desired directory with:
    ```
    git clone {the-forked-project}.git
    ```
3) Next, `cd` into the project and run the following command:
    ```
    npm run dev
    ```
4) The API server will be available on **http://localhost:3100**, and you may quickly verify that it is running by visiting the endpoint for fetching themes: http://localhost:3100/api/v1/themes?pageSize=30&pageNum=1

**Note:** For internal developers, you will be provided with a *.env* file which contains the variables for for the local development environment. Notably, you'll be able to interact with the **GitHub Application** meant for local development (playground). The local development environment is also setup to only **strictly** accept requests from a frontend served at **localhost:3000**. Thus, if you're keen to setup the frontend project, bear in mind to check the port number before calling the backend. For public contributors, you will have to populate the values in *.env.template* from scratch. If you require assistance with that however, feel free to **reach out**!

## Design

### Overview

At the root of the project, there are three key directories to be aware of: *config*, *docker*, and *src*. Other files and folders follow typical conventions for such projects and will not be covered in this guide.

The *config* directory, as the name implies, contains configuration files. Within this directory, there are three subfolders: *env*, *redis* and *nginx*. The *env* and *redis* subfolder holds environment-specific variables, while the *nginx* subfolder contains a shared NGINX configuration file.

The *docker* directory includes all files related to Docker. Specifically, it contains Dockerfiles for the api and jobs services, along with Docker Compose files that orchestrate the entire setup. These files are also environment-specific.

Lastly, the *src* directory contains all of the application code. It is divided into two subdirectories: *api* and *jobs*, corresponding to the two custom services in the project (as indicated by the separate Dockerfiles). The internal structure of *api* and *jobs* is straightforward and follows common patterns. It is assumed that developers have the necessary expertise to navigate and understand the project structure independently. Therefore, we will focus on discussing the project architecture.

### Architecture

The backend project consists of multiple microservices. When you run `npm run dev`, it triggers Docker Compose, which sets up the following networks and services:

![image](https://github.com/user-attachments/assets/635029be-768b-40b3-88ff-0ebe15c577f4)

We will briefly describe each of these services below.

#### Nginx

The NGINX service acts as the entry point for our backend services. Configurations for NGINX can be found in the *config/nginx* folder. NGINX functions as a load balancer, distributing incoming requests between two API instances (referred to as **api1** and **api2**). If one API instance fails to respond, NGINX will reroute the request to the other instance.

#### API

The API service handles user requests and interacts with other services to perform operations such as fetching and storing data in the database. The majority of the core logic resides within this service, and two instances are run in parallel, managed by NGINX in a round-robin manner.

#### Redis

The Redis service is responsible for caching user sessions, user data, and encrypted access tokens. Configuration files for Redis can be found in the *config/redis* folder. There are two Redis instances in the project:
- **redis-session:** Caches user sessions and is persistent, meaning data is retained across restarts.
- **redis-ephemeral:** Caches user data and encrypted access tokens. Data is not retained across restarts, which is acceptable since the refresh token can be used to regenerate this information.

#### MySQL

The MySQL service functions as the primary database, storing essential user and theme-related data. The following tables are present:
- Users
- UserRefreshTokens
- Themes
- ThemeVersions
- ThemeJobQueues
- FavoriteThemes
- LinkedAuthProviders

The schema for these tables is located in *src/api/databases/sql/models*. Detailed explanations of these tables will be provided later in the guide as they pertain to specific implementations.

#### Minio

The MinIO service serves as a temporary storage bucket for theme-related files. Files are uploaded by the API service and subsequently retrieved by background jobs for processing.

#### Jobs

There are currently two background jobs:
- **Sync Themes From GitHub:** Runs every 24 hours to ensure the themes data in MySQL is synchronized with the data on GitHub.
- **Process Queued Themes:** Runs every 15 minutes to handle the processing of themes queued for creation or deletion.

Detailed information on these jobs will be provided in the implementation section.

## Implementation

On top of serving as the backend for the Gallery website, the Gallery API also plays an important role in sustaining the themes feature that came in v2 of React ChatBotify. As such, there're a significant number of implementation details to be noted. This section will be updated from time to time with important details. Below, we look at several key implementations for this project.

### Nginx Proxies

If you've read the **Design** section above, you will be aware that there is an nginx service that proxies requests to 2 API instances. The configurations for nginx are provided below:
```
events {}

http {
	# service_name:port (must match what is specified in docker compose file)
	upstream api_servers {
		server api1:3200;
		server api2:3201;
	}

	server {
		# port for nginx to listen on in the network
		listen 3100;

		location / {
			proxy_pass http://api_servers;
			proxy_next_upstream error timeout http_500 http_502 http_503 http_504;
			proxy_set_header Host $host;
			proxy_set_header X-Real-IP $remote_addr;
			proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
			
			# forward the protocol forwarded by the host nginx
			# note that the gallery platform sits behind 2 proxies
      proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;
		}
	}
}
```
Notice that if an API instance returns 500 error codes, nginx will attempt to make a request to the other API instance instead. This is so if an instance unexpectedly crashes, the other instance can continue to serve requests normally as remedy work is done on the other instance.

Apart from that, there's another important configuration: `proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;`. This was previously misconfigured as `proxy_set_header X-Forwarded-Proto $scheme;` and took over a day to debug. The reason why `$scheme` **will not work** is because there is actually another nginx server on the host machine as well. The host nginx actually does a proxy pass to the docker nginx with **http** and thus, if you use `$scheme`, it will be **http** instead.

What are the implications of `$scheme` being **http**? Users will not be able to login correctly as the `Set-Cookie` header will not be sent in the response (application treats the request as being insecure). The rest of the configurations are pretty standard, and you can read up on them in your spare time. There should not be a need to modify the nginx configuration found so this is mostly just good-to-know.

### Cookie Authentication

Authentication in this application is done via cookies. When users first log in (via OAuth providers such as GitHub), the application will create entries within the `Users`, `UserRefreshTokens` and `LinkedAuthProviders` table. Collectively, these store information about the user, the refresh token to extend the login session and also which provider the user has logged in with before. UUID and emails are used to uniquely identify a user.

Every 3 months, a session expires and users will be required to login again. Users may login with any of the providers, and providers with the same email will be tied to the same user (email is used to associate a single user with multiple providers).

### OAuth Providers

The application **does not store username or passwords**. Instead, it relies fully on third-party OAuth providers for authenticating users. This allows us to avoid the hassle of having to deal with storage of user passwords, and we can solely focus on delivering the core features of the application.

To flexibly support multiple providers, a set of common fields are defined within *src/api/interfaces/UserProviderData*. Each provider also implements the following set of functions which can be found in their respective files:
- getUserData,
- getUserTokensWithCode,
- getUserTokensWithRefresh

Thus, to add additional providers, it is as simple as creating a new file and implementing these functions before introducing them into *src/api/services/authentication*.

### Routes & Endpoints

There are currently 3 routes in the API service (auth, theme and user). As you can probably tell from the naming, the auth route deals with authentication, the theme routes handle theme related operations while the user routes deal with user information.

Routes are all defined within the `routes` folder and contain little to no logic. The handling of core logic for each route is found within the `controllers` folder. The file names within `routes` and `controllers` are **identical**, so it is easy to associate the routes with their controllers.

### Redis Cache

The redis cache is an extremely important part of the application for performance reasons and ensuring user sessions are properly maintained. There are 2 redis instances. The **redis-session** instance stores only user session data and persist across restarts, while the **redis-ephemeral** instance stores user data and access tokens temporarily.

The reason why **redis-session** is persistent is so that even after restarts, users do not have to re-login. On the otherhand, information such as user data and access tokens can be easily repopulated again using refresh tokens which are permanently stored for 6 months within the MySQL database.

Note that the **redis-session** is configured with a `ttl` of 3 months, which corresponds to the `maxAge` of 3 months set for session cookies.

### Jobs (Syncing of Themes Data)

Although there are themes data stored in MySQL, we adhere to the principles of [**GitOps**](https://about.gitlab.com/topics/gitops/) for our theming solution. Thus, the theme data on GitHub serves as the source of truth. While it is unlikely for there to be de-sync between the GitHub state and our database, it is still **possible**.

Imagine a scenario where a developer opens a pull request to the themes repository instead of directly submitting themes via the gallery. Although submission via the gallery is encouraged, a pull request is still valid. With the sync job in-place, we can comfortably accept the pull request and trust that the sync job will properly populate the database with the information of the new theme within the next 24 hours.

Hence, apart from serving as a safeguard against de-syncs, this job is also vital for ensuring that developers can still have the choice of opening a pull request to add themes directly to the themes repository.

### Jobs (Processing of Themes)

The job for processing of themes is necessary as theme creations/deletions are done in batches every 15 minutes. The reason why this is not done instantly is because this involves uploading/removing of files from the themes repository on GitHub. Imagine if this was done in real-time and 10 users added themes all at once. What's going to happen is that there'll be 10 pull requests created and merged all at once on GitHub - not great. Instead, we'll consolidate all changes in intervals of 15 minutes and then make a single pull request before merging changes into the themes repository.

The entire process of creating pull requests and merging them is automated via a GitHub application. Note that as of writing this guide, **the implementation for this job is still incomplete**. However, the above description is what the job aims to achieve.

### Healthchecks

Healthchecks is currently unimplemented but is an important component for providing alerts if systems go down. Periodically, the API services should send a request to indicate their liveness. We can use [**healthchecks.io**](https://healthchecks.io) for that. This should be relatively simple to implement.

## Project Management

### GitHub Projects & Issues

The progress of the project is tracked using [**GitHub Projects**](https://github.com/users/tjtanjin/projects/7) and [**issues**](https://github.com/tjtanjin/react-chatbotify-gallery-api/issues). Internally, the project team focuses largely on issues prefixed with **[Task]**, which are essential for the continued progress of the project.

If you are looking to contribute, you are strongly encouraged to take up **good-first-issues** if it is your first time working on the project. If you're not part of the project team but feel confident in taking up issues prefixed with [Task], still feel free to comment and indicate your interest.

### Forking Workflow
This project adopts the [**Forking Workflow**](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow). In short, here are the steps required:
1) Fork the repository
2) Clone the forked repository to your local device
3) Make your code changes
4) Push to your forked remote repository
5) Open a pull request from your forked repository to the upstream repository (i.e. the main repository)

In addition, developers should fill up the pull requests template diligently. This ensures that changes are well-documented and reviewed before merging.

### Commit Messages
This project adopts [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/), with a minor difference that **the first word after the commit type is always capitalised**. For example, notice how "A" in "Add" is capitalised in this commit message: `feat: Add initial theme builder layout`.

## Code Documentation

Adhering to code documentation best practices is crucial for maintainability. Each file should start with a brief description of its purpose. Functions and components should include comments where necessary, especially for complex logic. A typical comment structure is as follows:

```javascript
/**
 * Retrieves access and refresh token with current refresh token.
 *
 * @param refreshToken: current refresh token
 *
 * @returns token response object if successful, null otherwise
 */
const getUserTokensWithRefresh = async (refreshToken: string) => {
  // Implementation...
}
```
The above shows an example code comment for a function that fetches new user tokens with the refresh token.

Finally, any leftover tasks or areas in the code to be revisited should be flagged with a comment like the one below:

```
// todo: tj to optimize the calculation code here
```

That way, we can identify what are the tasks to finish up here and optionally, state who will be responsible for it.

## Testing

To be updated

## Final Notes

The designs in this project are not perfect. We encourage experienced developers to help seek out areas for **improvements** in the application! We value your input and welcome contributions to enhance the application. Happy coding!
