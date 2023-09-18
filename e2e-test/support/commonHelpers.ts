import * as elmList from './elementList';
import * as mobElmList from './mobElementList';
import * as waitFor from './waitHelpers';
import { expect } from 'chai';
import { promisedExpect } from './chai';
import { credentials, specialCreds, chainCreds } from './data/credentials';
// const support = require('protractor-firefox-support');

/**
 * Retrieve current page URL.
 * @param lowerCase To get URl in lowercase. Default: false
 * @returns 
 */
export const getPageUrl = async (lowerCase: boolean = false): Promise<string> => {
    let currentUrl = await browser.getUrl();
    return lowerCase ? currentUrl.toLowerCase() : currentUrl;
}

/**
 * Deletes browser cookies, session storage and local storage.
 */
export const deleteAllBrowserData = async (): Promise<any> => {
    // Promise take a max 1.5s to resolve
    return new Promise(async (resolve, reject) => {
        const timeout = setTimeout(() => {
            resolve(1);
        }, 1500);
        try {
            await browser.execute(`
            try {
                var cookies = document.cookie.split("; ");
                for (var c = 0; c < cookies.length; c++) {
                    var d = window.location.hostname.split(".");
                    while (d.length > 0) {
                        var cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + d.join('.') + ' ;path=';
                        var p = location.pathname.split('/');
                        document.cookie = cookieBase + '/';
                        while (p.length > 0) {
                            document.cookie = cookieBase + p.join('/');
                            p.pop();
                        };
                        d.shift();
                    }
                }
            } catch(e){}
            `);
            await browser.deleteCookies();
            await browser.execute('try{window.sessionStorage.clear();} catch(e){}');
            await browser.execute('try{window.localStorage.clear();} catch(e){}');
            await browser.execute('try{document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/"); });} catch(e){}');
        } catch (error) { }

        clearTimeout(timeout);
        resolve(1);
    });
}


/**
 * Function to logout from partstown site.
 */
export const jsLogout = async (): Promise<void> => {
    const isLogoutPresent: boolean = await (await $(elmList.SIGN_OUT)).isExisting();
    if (isLogoutPresent) {
        await jsClickElm(elmList.SIGN_OUT);
        await browser.pause(2000);
    }
}

/**
 * Scroll to the element using tag name.
 */
export const selectDropdownbyNum = async (optionNum: number): Promise<void> => {
    if (optionNum) {
        const options = await $$('<option />')
        await clickElm(options[optionNum]);
    }
};


/**
 * Scroll to the element using protractor tag name.
 * @param elm  Element/Tag name. Example : 'input[class="wishlists__input"]'.
 * @param elmNumber Element number. Default value is 0.
 */
export const scrollToView = async (elm: string, elmNumber: number = 0): Promise<void> => {
    try {
        if (__vars[browser.sessionId + ".browserName"] === 'ie') {
            await browser.execute(`try { document.getElementsByTagName('${elm}')[${elmNumber}].scrollIntoView(false)} catch(e){}`);
        }
        else {
            await browser.execute(`try { document.getElementsByTagName('${elm}')[${elmNumber}].scrollIntoView({ behavior: '${__vars[browser.sessionId + ".browserName"] === 'chrome' ? 'smooth' : 'auto'}', block: 'nearest', inline: 'start' })} catch(e){}`);
        }
        await browser.pause(1000);
    } catch (error) { }
};


/**
 * Scroll to the element using element's class attribute.
 * @param elm lass name. Example : "wishlists__input".
 * @param elmNumber Element number. Default value is 0.
 */
export const scrollToViewClass = async (elm: string, elmNumber: number = 0): Promise<void> => {
    try {
        if (__vars[browser.sessionId + ".browserName"] === 'ie') {
            await browser.execute(`try { document.getElementsByClassName('${elm}')[${elmNumber}].scrollIntoView(false)} catch(e){}`);
        }
        else {
            await browser.execute(`try { document.getElementsByClassName('${elm}')[${elmNumber}].scrollIntoView({ behavior: '${__vars[browser.sessionId + ".browserName"] === 'chrome' ? 'smooth' : 'auto'}', block: 'nearest', inline: 'start' })} catch(e){}`);
        }
        await browser.pause(1000);
    } catch (error) { }
};

/**
 * Scroll the element to center
 * @param elm :Element 
 */
export const scrollElmTocenter = async (elm: WebdriverIO.Element): Promise<void> => {
    await elm.scrollIntoView({ block: 'center', inline: 'center' });
}

/**
 * Scroll to the element using element's ID attribute.
 * @param elm ID name. Example : "eq-equipmentName".
 * @param elmNumber Element number. Default value is 0.
 */
export const scrollToViewID = async (elm: string, elmNumber: number = 0): Promise<void> => {
    try {
        if (__vars[browser.sessionId + ".browserName"] === 'ie') {
            await browser.execute(`try { document.getElementById('${elm}').scrollIntoView(false)} catch(e){}`);
        }
        else {
            await browser.execute(`try { document.getElementById('${elm}').scrollIntoView({ behavior: '${__vars[browser.sessionId + ".browserName"] === 'chrome' ? 'smooth' : 'auto'}', block: 'nearest', inline: 'start' })} catch(e){}`);
        }
        await browser.pause(1000);
    } catch (error) { }
};





/**
 * Creates a custom ID using timestamp and random text.
 */
export const makeid = (): Promise<any> => {
    let result: string = '';
    result = Math.random().toString(36).substring(2, 9);
    result = new Date().getTime().toString() + result;
    return result as any;
}


/**
 * Removes keyboard focus from the current element.
 */
export const blurActiveElement = async (): Promise<void> => {
    await browser.execute('document.activeElement.blur()').catch((err: Error) => { });
    await browser.pause(500);
}




/**
 * Chai assertion to check if user is navigated to given link.
 * @param link URL or part of URL. Ex: "/my-account/address-book"
 */
export const checkRedirectionToLink = async (link: string) => {
    await waitFor.UrlContains(link);
    const url: string = await getPageUrl();
    await browser.pause(2000)
    expect(url.includes(link), `${link} does not exists in URL ${url}`).to.be.true;
}


/**
 * Get the first element visible in viewport/screen.
 * @param elmName Element Name. Value = 'input[class="wishlists__input"]'.
 * @param expectedElmNo The nth element of all visible elements, expected to get back. Default = 0.
 * @returns Element
 */
export const getVisibleElement = async (elmName: string, expectedElmNo: number = 0): Promise<WebdriverIO.Element> => {
    const elements = await $$(elmName);
    const retrievedElmNos: number[] = [];
    for (let i = 0; i < elements.length; ++i) {
        const elmVisible = await elements[i].isDisplayed();
        if (elmVisible) {
            retrievedElmNos.push(i);
        }
    }
    return expectedElmNo <= retrievedElmNos.length ? elements[retrievedElmNos[expectedElmNo]] : elements[0];
}


/**
 * Get the first element visible in viewport/screen.
 * @param elmName Element Name. Value = 'input[class="wishlists__input"]'.
 * @returns Element Number
 */
export const getVisibleElementNo = async (elmName: string): Promise<number> => {
    await waitFor.element(elmName);
    await promisedExpect((await $(elmName)).isExisting(), `Element [${elmName}] not present!`).to.eventually.be.true;
    const elmCount = (await $$(elmName)).length;
    let visibleElmNo: number = 0;
    for (let i: number = 0; i < elmCount; ++i) {
        const isElmDisplayed = await (await $$(elmName))[i].isDisplayed();
        if (isElmDisplayed) {
            visibleElmNo = i;
            break;
        }
    }
    await promisedExpect((await $$(elmName))[visibleElmNo].isDisplayed(), `Element [${elmName}] not visible!`).to.eventually.be.true;
    return visibleElmNo;
}

/**
 * Retrieve browser name.
 */
export const getBrowserName = async (): Promise<string> => {
    const caps = JSON.parse(JSON.stringify(browser.capabilities));
    return caps.browserName ? caps.browserName : "chrome";
}


/**
 * Function to wait, scroll to, assert and click the defined element.
 * @param elm Element identifier string. Example: 'button[type="submit"]'
 * @param elmNo Element number. Default: 0
 * @param assertType present | enabled | displayed. Default: enabled
 * @param elmClassName Element HTML class name. Default: ''
 * @param elmID Element HTML ID name. Default: ''
 * @param clickElement Should click the element. Default: true
 * @param assertElement Should do assertion. Default: true
 * @param elementName Name of element to be used during failed assertion. Default: "" 
 */
export const elementAssertClick = async (elm: string, elmNo: number = 0, assertType: string = 'enabled', elmClassName: string = '', elmID: string = '', clickElement: boolean = true, assertElement: boolean = true, elementName: string = ''): Promise<void> => {
    await waitFor.element(elm, elmNo);
    elementName = elementName === "" ? `Element [${elm}]` : elementName;
    // Scroll to element
    if (elmClassName !== '') {
        await scrollToViewClass(elmClassName, elmNo);
    }
    else if (elmID !== '') {
        await scrollToViewID(elmID, elmNo);
    }
    else {
        await scrollToView(elm, elmNo);
    }
    await waitFor.loaderDisappear();

    // Assertion. No assertion if assertType value is set to ''(empty)
    if (assertType === 'enabled') {
        await waitFor.elementEnabled(elm, elmNo);
        if (assertElement) {
            await promisedExpect((await $$(elm))[elmNo].isExisting(), `${elementName} not present!`).to.eventually.equal(true);
            await promisedExpect((await $$(elm))[elmNo].isEnabled(), `${elementName} not enabled!`).to.eventually.equal(true);
        }
    }
    else if (assertType === 'displayed') {
        await waitFor.elementVisible(elm, elmNo);
        if (assertElement) {
            await promisedExpect((await $$(elm))[elmNo].isExisting(), `${elementName} not present!`).to.eventually.equal(true);
            await promisedExpect((await $$(elm))[elmNo].isDisplayed(), `${elementName} not visible!`).to.eventually.equal(true);
        }
    }
    else if (assertType === 'present') {
        await promisedExpect((await $$(elm))[elmNo].isExisting(), `${elementName} not present!`).to.eventually.equal(true);
    }

    //Click element if condition true
    if (clickElement) {
        try {
            if (__vars[browser.sessionId + ".browserName"] === 'safari') {
                await jsClickElm(elm, elmNo);
            }
            else {
                await clickElm((await $$(elm))[elmNo]);
            }
        } catch (error) { console.log(`Unable to click: ${elm}\n`); }
    }
}

/**
 * Function to click element.
 * 
 * For macOS/OS X, vanilla javascript functionality will be used to click.
 * 
 * @param elm Element. Ex. $$('#btn").first()
 */
export const clickElm = async (elm: WebdriverIO.Element): Promise<void> => {
    if (__vars[browser.sessionId + ".browserName"] === 'safari') {
        await browser.execute('arguments[0].click()', elm).catch((err: Error) => { throw new Error("Unable to click!"); });
    }
    else {
        await elm.click();
    }
}


/**
 * Plain JavaScript function to click on an element.
 * @param selector Selector value as string. Ex: div[class="name"]
 * @param elmNo Default 0.
 */
export const jsClickElm = async (selector: string, elmNo: number = 0): Promise<void> => {
    await browser.execute(`document.querySelectorAll('${selector}')[${elmNo}].click()`).catch((err: Error) => { throw new Error(`Unable to click: [${selector}]`); });
}


/**
 * Plain JavaScript function to focus on an element.
 * @param selector Selector value as string. Ex: div[class="name"]
 * @param elmNo Default 0.
 */
export const jsFocusElm = async (selector: string, elmNo: number = 0): Promise<void> => {
    await browser.execute(`document.querySelectorAll('${selector}')[${elmNo}].focus()`).catch((err: Error) => { throw new Error(`Cannot focus on element: [${selector}]`); });;
}

/**
 * Get an array of user credentials based on current domain.
 * Default domain is "com"
 */
export const getCredentials = (): any => {
    if (__vars[browser.sessionId + ".domainName"]) {
        if (credentials[__vars[browser.sessionId + ".domainName"]]) {
            return credentials[__vars[browser.sessionId + ".domainName"]];
        }
    }
    return credentials.com;
}

/**
 * Function to disintegrate a string and then push it into an input field.
 * @param elm Web Element
 * @param customText Text to enter into the input box
 */
export const crumbledInput = async (elm: WebdriverIO.Element, customText: string): Promise<void> => {
    const arr = Array.from(customText);
    for (let i = 0; i < arr.length; i++) {
        await elm.addValue(arr[i]);
        await browser.pause(50);
    }
    await browser.pause(2500);
}


/**
 * Function to execute mouse actions on an element.
 * @param elm Element
 * @param actionType up, down, move. Default: move
 * @param shouldClick true or false. Default: false
 * @param removeAllFocus Remove focus from all the elements? Default: true
 */
export const mouseAction = async (elm: WebdriverIO.Element, actionType: string = "move", shouldClick: boolean = false, removeAllFocus: boolean = true): Promise<void> => {
    if (removeAllFocus) {
        await blurActiveElement();
    }
    const isElmPresent: boolean = await elm.isExisting();
    if (!isElmPresent) {
        return;
    }
    // let location: any;
    // if (__vars[browser.sessionId + ".browserName"] === 'firefox') {
    //     location = await elm.getLocation();
    // }
    switch (actionType) {
        case "down":
            try { await elm.buttonDown(); } catch (err) { }
            break;

        case "up":
            try { await elm.buttonUp(); } catch (err) { }
            break;

        default:
            try { await elm.moveTo(); } catch (err) { }
    }

    if (shouldClick) {
        await clickElm(elm);
    }
}


/**
 * Function to get element based on the text provided.
 * @param elmVal Element identifier string.
 * @param matchText String to match with getText of expected element.
 * @param elmNo Expected element number from matched elements
 * @param includesText true | false. Default: false
 * @param visibility true | false. Default: true
 * @returns element
 */
export const getElementByText = async (elmVal: string, matchText: string, elmNo: number = 0, includesText: boolean = false, visibility: boolean = true): Promise<any> => {
    matchText = matchText.trim().toLowerCase();
    const elements = await $$(elmVal);
    const retrievedElmNos: number[] = [];
    for (let i = 0; i < elements.length; ++i) {
        const elm = elements[i];
        const name: string = (await elm.getText()).trim().toLowerCase();
        const isNameMatched = includesText ? name.includes(matchText) : name === matchText;
        if (visibility) {
            const elmDisplayed = await elm.isDisplayed();
            if (elmDisplayed && isNameMatched) {
                retrievedElmNos.push(i);
            }
        }
        else {
            if (isNameMatched) {
                retrievedElmNos.push(i);
            }
        }
    }
    return elmNo < retrievedElmNos.length ? elements[retrievedElmNos[0]] : elements[0];
}


/**
 * Get the exact element based on matching string and type
 * @param elm Element identifier string.
 * @param matchText String to match with getText of expected element.
 * @param matchType equals | includes | endsWith. Default: equals
 * @param assert true | false. Default: true
 * @returns WebdriverIO Element
 */
export const getMatchedElm = async (elm: string, matchText: string, matchType: string = 'equals', assert: boolean = true): Promise<WebdriverIO.Element> => {
    const elmArrayLength: number = (await $$(elm)).length
    matchText = matchText.toLowerCase();
    let elmNo: number = 0;
    for (let i: number = 0; i < elmArrayLength; ++i) {
        const value: string = (await (await $$(elm))[i].getText()).trim().toLowerCase();
        if (matchType === 'equals') {
            if (value === matchText) {
                elmNo = i;
                break;
            }
        }
        else if (matchType === 'includes') {
            if (value.includes(matchText)) {
                elmNo = i;
                break;
            }
        }
        else if (matchType === 'endsWith') {
            if (value.endsWith(matchText)) {
                elmNo = i;
                break;
            }
        }
        else {
            throw new Error("Unknown matchType parameter passed");
        }
    }

    if (assert) {
        const elmText: string = (await (await $$(elm))[elmNo].getText()).trim().toLowerCase();
        if (matchType === 'equals') {
            expect(elmText).to.equal(matchText);
        }
        else if (matchType === 'includes') {
            expect(elmText).to.include(matchText);
        }
        else if (matchType === 'endsWith') {
            expect(elmText.endsWith(matchText), `Text "${elmText}" do not ends with "${matchText}"`).to.be.true;
        }
    }
    return (await $$(elm))[elmNo];
}

/**
 * Function to get keys for different keyboard functions.
 * @param keyType "cut", "copy","paste"
 * @returns An object containing 2 keys for protractor
 */
export const getKeyboardKeys = async (keyType: string): Promise<any> => {
    interface Controls {
        key1: any
        key2: any
    }

    // const cntrlKey = await browser.keys('CONTROL');
    // const insKey = await browser.keys('INSERT');
    // const shftKey = await browser.keys('SHIFT');
    // const delKey = await browser.keys('DELETE');

    const controls: Controls = { key1: '', key2: '' }
    if (__vars[browser.sessionId + ".osx"]) {
        switch (keyType.toLowerCase()) {
            case "copy": controls.key1 = "Control", controls.key2 = "Insert";
                break;
            case "paste": controls.key1 = "Shift", controls.key2 = "Insert";
                break;
            case "cut": controls.key1 = "Shift", controls.key2 = "Delete";
                break;
        }
    }
    else {
        switch (keyType.toLowerCase()) {
            case "copy": controls.key1 = "Control", controls.key2 = 'c';
                break;
            case "paste": controls.key1 = "Control", controls.key2 = 'v';
                break;
            case "cut": controls.key1 = "Control", controls.key2 = 'x';
                break;
        }
    }
    return controls;
}