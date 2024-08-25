/*
// ignore this entire file for now, unused but will re-look later
import axios, { AxiosRequestConfig } from "axios";
import { readFileSync } from "fs";

const owner = "tjtanjin";
const repo = "test-themes";
const baseBranch = "main";
const newBranch = "feature/add-styles";

const token = "your_personal_access_token";

const baseUrl = "https://api.github.com";
const headers = {
  Authorization: `token ${token}`,
  Accept: "application/vnd.github.v3+json",
};

async function createBranch() {
  const config: AxiosRequestConfig = {
    headers: headers,
  };

  try {
    // create a new branch
    const response = await axios.post(
      `${baseUrl}/repos/${owner}/${repo}/git/refs`,
      {
        ref: `refs/heads/${newBranch}`,
        sha: baseBranch,
      },
      config,
    );
    console.info("Branch created:", response.data);
    return true;
  } catch (error) {
    console.error("Error creating branch:", error);
    return false;
  }
}

async function addFile() {
  try {
    // read the content of styles.css
    const cssContent = readFileSync("path/to/styles.css", "utf-8");

    // add a new file
    const response = await axios.put(
      `${baseUrl}/repos/${owner}/${repo}/contents/styles/styles.css`,
      {
        message: "Add styles.css",
        content: Buffer.from(cssContent).toString("base64"),
        branch: newBranch,
      },
      { headers: headers },
    );
    console.info("File added:", response.data);
    return true;
  } catch (error) {
    console.error("Error adding file:", error);
    return false;
  }
}

async function createPullRequest() {
  try {
    // create a pull request
    const response = await axios.post(
      `${baseUrl}/repos/${owner}/${repo}/pulls`,
      {
        title: "Add styles.css",
        head: newBranch,
        base: baseBranch,
      },
      { headers: headers },
    );
    console.info("Pull request created:", response.data);
    return true;
  } catch (error) {
    console.error("Error creating pull request:", error);
    return false;
  }
}

const branchCreated = await createBranch();
if (branchCreated) {
  const fileAdded = await addFile();
  if (fileAdded) {
    await createPullRequest();
  }
}

*/