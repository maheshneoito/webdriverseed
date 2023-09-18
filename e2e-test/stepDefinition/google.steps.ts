import { Given, When, Then } from '@cucumber/cucumber';
import * as commonHelpers from '../support/commonHelpers';
import { promisedExpect } from '../support/chai';


Given('User go to partstown home page using a browser', { timeout: 2 * 140000 }, async () => {
const baseUrl = browser.options.baseUrl!;
console.log(`\n===>  You are testing this web site:  ${baseUrl}`);
await browser.url(baseUrl);
await browser.sleep(5000);
})