const { cmd } = require('../command');
const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

cmd({
    pattern: "update",
    react: "♻️", // Reaction emoji when the command is triggered
    alias: ["upgrade", "refresh"],
    desc: "Check and apply updates for the bot",
    category: "system",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const githubToken = "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";
        const repoURL = "https://api.github.com/repos/SILENTLOVER40/SILENT-SOBX-MD/commits";

        // Fetch the latest commit from GitHub
        const latestCommitResponse = await axios.get(repoURL, {
            headers: {
                Authorization: `token ${githubToken}`
            }
        });
        const latestCommitSHA = latestCommitResponse.data[0]?.sha;

        if (!latestCommitSHA) {
            throw new Error("Unable to fetch the latest commit SHA.");
        }

        // Fetch files changed in the latest commit
        const commitDetailsURL = `https://api.github.com/repos/SILENTLOVER40/SILENT-SOBX-MD/commits/${latestCommitSHA}`;
        const commitDetailsResponse = await axios.get(commitDetailsURL, {
            headers: {
                Authorization: `token ${githubToken}`
            }
        });
        const changedFiles = commitDetailsResponse.data.files?.map(file => file.filename) || [];

        if (changedFiles.length === 0) {
            throw new Error("No changed files found in the latest commit.");
        }

        console.log("Changed files:", changedFiles);

        // Read the last applied commit
        let currentCommitSHA = '';
        try {
            currentCommitSHA = await fs.readFile("./current_commit.txt", "utf8");
        } catch {
            console.log("No current_commit.txt found, assuming first run.");
        }

        // Check if the bot is up-to-date
        if (latestCommitSHA !== currentCommitSHA) {
            await conn.sendMessage(from, { text: "♻️ Wait for update started......" }, { quoted: mek });

            // Update files in the `plugins` folder and other specific files
            for (const file of changedFiles) {
                const savePath = file.startsWith("plugins/")
                    ? path.join("./", file) // Path for plugins folder
                    : `./${file}`; // Path for main files like config.js, etc.
            
                const fileURL = `https://raw.githubusercontent.com/SILENTLOVER40/SILENT-SOBX-MD/${latestCommitSHA}/${file}`;
                console.log(`Downloading file: ${file} from ${fileURL}`);
            try { 
                const fileURL = `https://raw.githubusercontent.com/SILENTLOVER40/SILENT-SOBX-MD/${commitSHA}/${fileName}`;
        const response = await axios.get(fileURL);
        await fs.writeFile(savePath, response.data, "utf8");
                    console.log(`Updated or added: ${file}`);
                } catch (error) {
                    console.error(`Error updating ${file}:`, error.response?.data || error.message || error);
                }
            }

            // Save the latest commit SHA
            await fs.writeFile("./current_commit.txt", latestCommitSHA, "utf8");

            await conn.sendMessage(from, { text: "✅ Update Completed!" }, { quoted: mek });
        } else {
            await conn.sendMessage(from, { text: "✅ You are using the latest version of the bot." }, { quoted: mek });
        }
    } catch (error) {
        console.error("Error checking for updates:", error.response?.data || error.message || error);
        await conn.sendMessage(from, { text: `⚠️ Error: ${error.message}` }, { quoted: mek });
    }
});
