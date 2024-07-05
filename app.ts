import puppeteer, { Page } from "puppeteer";
import { userInfo } from "./config";
import fs from "node:fs/promises";

let successCount = 0;
let errorCount = 0;

async function readApi() {
  const apiFile = await fs.readFile("./api.txt");

  return apiFile.toString().split("\n");
}

function sleep(delay: number = 3000) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

async function sendPhoneNumber(page: Page, pagePath: string) {
  await page.goto(pagePath);

  try {
    await page
      .locator(".imlp-component-typebox-input")
      .fill(`${userInfo.phoneNUmber} ${userInfo.name}`);

    await page.locator(".imlp-component-typebox-send-btn").click();

    successCount++;
  } catch (error) {
    errorCount++;

    console.log("error count +1", errorCount);
  }

  await sleep(1000);

  const client = await page.createCDPSession();
  await client.send("Network.clearBrowserCookies");
}

async function init() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1080, height: 1024 });
  await page.setCacheEnabled(false);

  const apis = await readApi();

  for (const api of apis) {
    await sendPhoneNumber(page, api);
  }

  await page.close();

  await browser.close();

  console.log(
    `is done, success count: ${successCount}, error count: ${errorCount}`
  );
}

init();
