"use client";

// Runs only in the browser. Sets a global flag and marks a DOM element so
// Playwright tests can verify client-script execution.
(window as unknown as { __atollicScriptRan: boolean }).__atollicScriptRan = true;

const target = document.getElementById("script-target");
if (target) {
	target.textContent = "Script ran!";
	target.setAttribute("data-ran", "true");
}
